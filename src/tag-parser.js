import {ParseError} from './parser';
import {VoidNode, NodeParser, ContainerNode, TextNode} from './nodes';
import {substring, substring_quoted} from './string-iter';
import {ensure_array, valid_identifier} from './helper';
import {TagDefinition} from './def';
import {bbcode_format} from './format';

/**
 * Attribute
 */
export class TagAttribute
{
    _value;
    parent;
    def;

    quote = ''; // if the value was in quotes it will be saved here.

    constructor( value, def, parent )
    {
        this.def = def;
        this.parent = parent;
        this.value = value;
    }

    static escape_value( value )
    {
        return JSON.stringify(value).slice(1,-1);
    }

    is_valid()
    {
        return !this.def || this.def.valid_value(this.value);
    }

    get name() { return this.def.name; }

    format( format )
    {
       return this.def.format( format, this.value, this );
    }

    get value()
    {
        return this._value;
    }

    set value( v = null )
    {
        this._value = this.def && this.def.validate ? this.def.validate(v) : v;
    }
}

/**
 * Tag
 */
export class TagNode extends ContainerNode
{
    attributes = new Map();

    constructor( def, closing = false )
    {
        super();

        if ( !def ) { throw new Error('TagNode requires a TagDefinition'); }

        this.def = def;
        this.terminating = closing;    // main parser expects a 'terminating' value
    }

    add_child( node )
    {
        let allowed = this.def.valid_child( node );

        if ( allowed === true  )
        {
            this.children.push(node);
        }

        return allowed;
    }

    add_attribute( attr )
    {
        if ( this.def.valid_attribute( attr ) )
        {
            this.attributes.set( attr.name, attr );
            return true;
        }
        return false;
    }

    get name()
    {
        return this.def.name;
    }

    get is_void ()
    {
        return !!this.def.is_void;
    }

    get overflow()
    {
        return !!this.def.overflow;
    }

    get discard_invalid()
    {
        return !!this.def.discard_invalid;
    }

    compare( to )
    {
        return this.def.name === to.def.name || this.def.closing_name === to.def.name;
    }

    clone( deep = false )
    {
        let cln = new TagNode(this.def, this.terminating);
        cln.attributes = new Map(this.attributes);
        
        if ( deep )
        {
            cln.children = this._clone_children( deep );
        }

        return cln;
    }

    format( format )
    {
        return this.def.format( format, this.children, this.attributes, this );
    }

    terminate( node )
    {
        if ( this.def.terminate  )
        {
            if ( node instanceof TagNode )
            {
                return this.def.terminate.has( node.name );
            }
            else
            if ( typeof node === 'string' )
            {
                return this.def.terminate.has( node );
            }
        }

        return false;
    }
}

export class TagParser extends NodeParser
{
    static default_format = bbcode_format;

    static quotes = ['\'', '"']; // allowed attribute value quotes

    tag_defs = new Map();        // tag definitions
    valid_chars = new Set();     // valid tag name characters. compiled from the given tag defs.

    /**
     * @param tags tag definitions
     * @param delims parse delimiters
     * @param config extra properties.
     */
    constructor( tags, format, config = {} )
    {
        super( format ? format.l_bracket : TagParser.default_format.l_bracket );

        this.create_tag = config.tag || TagParser._default_create_tag;
        this.create_attribute = config.attribute || TagParser._default_create_attribute;
        this.create_def = config.def || TagParser._default_create_def;
        this.parse_any = !!config.parse_any; 

        this.format = format || TagParser.default_format;

        if ( tags instanceof Map )
        {
            this.tag_defs = tags;
        }
        else if ( tags )
        {
            tags = ensure_array(tags);
            for( let t of tags )
            {
                this.add_tag( t );
            }
        }
        else
        {
            this.parse_any = true;  // if an undefined tag is encountered a generic definition will be created and it will be parsed.
        }

        // compile valid identifier character set (used during parse)
        for( let [n,t] of this.tag_defs )
        {
            for( let c of n )
            {
                if ( !valid_identifier(c) )
                {
                    this.valid_chars.add(c);
                }
            }
        }
    }

    static _default_create_def( name )
    {
        return new TagDefinition( name );
    }

    static _default_create_tag( def, closing, line, column )
    {
        let t = new TagNode( def, closing );
        t.__line = line;
        t.__column = column;
        return t;
    }

    static _default_create_attribute( value, def, parent, line, column )
    {
        let a = new TagAttribute( value, def, parent );
        a.__line = line;
        a.__column = column;
        return a;
    }

    static valid_value_char( c )
    {
        return valid_identifier( c, true ); //(c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9');
    }

    add_tag( def )
    {
        this.tag_defs.set( def.name, def );
    }

    remove_tag( name )
    {
        let def = this.tag_defs.get(name);
        this.tag_defs.delete(name);
        return def;
    }

    value_parse( itr, attrib, parser )
    {
        if ( TagParser.quotes.includes(itr.value) )
        {
            attrib.quote = itr.value;
            return substring_quoted( itr );
        }
        else
        {
            let v = TagParser.valid_value_char;
            if ( attrib.def && attrib.def.valid_char ) { v = attrib.def.valid_char; }
            return parser.identifier_parse(itr, v );
        }
    }

    attribute_parse( itr, tag, parser )
    {
        let line = parser.__line;
        let column = parser.__column;

        let name = parser.identifier_parse(itr);
        if ( !name )
        {
            return parser._error( `Invalid attribute name (${name}) in tag`, line, column, tag.name );
        }

        let adef = tag.def.get_attribute(name); // adef may be undefined/null; continue parsing to skip value.
        if ( !adef )
        {
            parser._error( `Attribute "${name}" is not allowed in tag`, line, column, tag.name );
        }

        let attrib = this.create_attribute( null, adef, tag, line, column );

        parser.skip_whitespace( itr );
        if ( itr.value !== this.format.eq )
        {
            if ( !adef ) return null;

            if ( adef.require_value )
            {
                return parser._error_n( 'Attribute missing required value', attrib );
            }

            return attrib;
        }

        itr.next(); // skip =
        attrib.value = this.value_parse( itr, attrib, parser );
        if ( adef && !attrib.is_valid() )
        {
            return parser._error_n( 'Attribute missing required value', attrib );
        }

        if ( !adef ) return null;
        return attrib;
    }

    parse_name( itr, parser )
    {
        let it = itr.clone();
        while ( !itr.end() && (valid_identifier( itr.value ) || this.valid_chars.has( itr.value )) )
        {
            itr.next();
        }

        return substring( it, itr ).toLowerCase();
    }

    _get_def( name )
    {
        let def = this.tag_defs.get( name );
        if ( !def )
        {
            if ( this.parse_any )
            {
                if ( parser.is_whitespace(itr.value) || (this.self_attribute && itr.value === '=') )
                {
                    return this.create_def( name );
                }
            }
            return null;
        }

        return def;
    }

    parse( itr, parser )
    {
        if ( itr.value !== this.format.l_bracket ) return null;

        let line = parser.__line;
        let column = parser.__column;
        itr.next();

        let closing = false;
        if ( closing = (itr.value === this.format.term) )
        {
            itr.next();
        }

        let it = itr.clone(); // might need to set back
        let name = this.parse_name( itr, parser );

        let def = this._get_def( name );
        let tag = this.create_tag( def, closing, line, column );

        if ( closing )
        {
            parser.skip_whitespace( itr );
            if ( itr.value !== this.format.r_bracket )
            {
                parser._error_n( `Malformed Closing Tag: missing ${this.format.r_bracket}`, tag );
                return null;
            } 
            itr.next();
            return tag; 
        }

            // allow tags to be their own attribute
        if ( itr.value === this.format.eq && this.format.self_attribute )
        {
            itr.set( it ); // set back to parse tagname as attribute
        }

            // parse attributes
        while ( !itr.end() )
        {
            parser.skip_whitespace( itr );

            if ( itr.value === this.format.r_bracket )
            {
                break;
            }

            let attrib = this.attribute_parse( itr, tag, parser );
            if ( attrib instanceof TagAttribute )
            {
                tag.add_attribute( attrib );
            }
            else if ( attrib instanceof ParseError )
            {
                return null;
            }
        }

        // check for missing required attributes.
        if( def.attributes )
        {
            for( let [name,a] of def.attributes )
            {
                if ( a.required && !tag.attributes.has(name) )
                {
                    let ta = new TagAttribute( null, a, tag);

                    if ( !ta.is_valid() ) { return null; }       // required attribute could not be met.

                    tag.add_attribute( ta );
                }
            }
        }

        itr.next(); // skip ]
        return tag;
    }
}