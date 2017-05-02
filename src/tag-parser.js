import {NodeParseError, NullError} from './error';
import {ContainerNode} from './nodes';
import {substring, substring_quoted} from './string-util';
import {ensure_array, valid_identifier} from './helper';
import {TagDefinition} from './def';


/**
 * Attribute
 */
export class TagAttribute
{
    _value = '';
    parent = null;
    def = null;

    quote = ''; // if the value was in quotes it will be saved here.

    constructor( value, def, parent )
    {
        this.def = def;
        this.parent = parent;
        this.value = value;
    }

    static escape_value( value )
    {
        return JSON.stringify( value ).slice(1, -1);
    }

    is_valid()
    {
        return this.def && this.def.valid_value(this.value);
    }

    get identifier() { return this.def.identifier; }

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
        super( { def } );

        if ( !def ) { throw new Error('TagNode requires a TagDefinition'); }

        this.terminating = closing;    // main parser expects a 'terminating' value
    }

    add_child( node )
    {
        let allowed = this.def.valid_child( node );

        if ( allowed === true  )
        {
            node.parent = this;
            this.children.push( node );
        }

        return allowed;
    }

    add_attribute( attr )
    {
        if ( attr && this.def.valid_attribute( attr ) )
        {
            this.attributes.set( attr.identifier, attr );
            return true;
        }
        return false;
    }

    get identifier()
    {
        return this.def.identifier;
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

    /*compare( to )
    {
        return this.def.identifier === to.def.identifier || this.def.closing_identifier === to.def.identifier;
    }*/

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
                return this.def.terminate.has( node.identifier );
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

export class TagParser
{
    static quotes = ['\'', '"']; // allowed attribute value quotes

    _format = null;
    _default_formatters = {};

    _tag_defs = new Map();        // tag definitions
    _valid_chars = new Set();     // valid tag identifier characters. compiled from the given tag defs.

    fail = {
        illegal_attribute: false
    };

    /**
     * @param tags tag definitions
     * @param delims parse delimiters
     * @param config extra properties.
     */
    constructor( tags, format, config = {} )
    {
        //super( format ? format.l_bracket : TagParser.default_format.l_bracket );
        this._format = format;
        this._default_formatters = {
            tag: config.tag_formatter,
            attribute: config.attrib_formatter,
        };

        this.create_tag = config.tag || TagParser._default_create_tag;
        this.create_attribute = config.attribute || TagParser._default_create_attribute;
        this.create_def = config.def || TagParser._default_create_def;
        this.parse_any = !!config.parse_any; 
        
        Object.assign( this.fail, config.fail || {} );

        //this._format = format || TagParser.default_format;

        if ( tags instanceof Map )
        {
            this._tag_defs = tags;
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
        for( let [n, t] of this._tag_defs )
        {
            t.add_formatter( this._default_formatters.tag, false );
            for( let c of n )
            {
                if ( !valid_identifier(c) )
                {
                    this._valid_chars.add(c);
                }
            }
        }
    }

    static _default_create_def( identifier )
    {
        return new TagDefinition( identifier );
    }

    static _default_create_tag( def, closing, line, column )
    {
        let t = new TagNode( def, closing );
        t._line = line;
        t._column = column;
        return t;
    }

    static _default_create_attribute( value, def, parent, line, column )
    {
        let a = new TagAttribute( value, def, parent );
        a._line = line;
        a._column = column;
        return a;
    }

    static valid_value_char( c )
    {
        return valid_identifier( c, true );
    }

    add_tag( def )
    {
        this._tag_defs.set( def.identifier, def );
    }

    remove_tag( identifier )
    {
        let def = this._tag_defs.get(identifier);
        this._tag_defs.delete(identifier);
        return def;
    }

    _attrib_value_parse( itr, attrib, parser )
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

    _attribute_parse( itr, tag, parser )
    {
        let identifier = parser.identifier_parse(itr);
        if ( !identifier ) throw new NodeParseError( `Invalid attribute identifier (${identifier}) in tag`, tag );

        let adef = tag.def.get_attribute(identifier); // adef may be undefined/null; continue parsing to skip value.
        let attrib = this.create_attribute( null, adef, tag, itr.line, itr.column );

        parser.skip_whitespace( itr );
        if ( itr.value !== this._format.eq )
        {
            if ( !adef )
            {
                if ( this.fail.illegal_attribute ) throw new NodeParseError( `Attribute "${identifier}" is not allowed in tag`, tag );
                return null;
            }
            if ( !attrib.is_valid() ) throw new NodeParseError( `Attribute missing required value`, attrib );
        }
        else
        {
            itr.next(); // skip =
            attrib.value = this._attrib_value_parse( itr, attrib, parser );

            if ( !adef )
            {
                if ( this.fail.illegal_attribute ) throw new NodeParseError( `Attribute "${identifier}" is not allowed in tag`, tag );
                return null;
            }
            if ( !attrib.is_valid() ) throw new NodeParseError( `Attribute missing required value`, attrib );
        }

        return attrib;
    }

    parse_identifier( itr, parser )
    {
        let it = itr.clone();
        while ( !itr.end() && (valid_identifier( itr.value ) || this._valid_chars.has( itr.value )) )
        {
            itr.next();
        }

        return substring( it, itr ).toLowerCase();
    }

    _get_def( identifier, itr, parser )
    {
        if ( !identifier ) throw new NullError();

        let def = this._tag_defs.get( identifier );
        if ( !def )
        {
            if ( this.parse_any )
            {
                if ( parser.is_whitespace(itr.value) || itr.value == this._format.r_bracket || (this.self_attribute && itr.value === '=') )
                {
                    return this.create_def( identifier );
                }
            }

            throw new NodeParseError( `Invalid tag identifier`, identifier, itr.line, itr.column );
        }

        return def;
    }

    _parse_attributes( tag, itr, parser )
    {
            // parse attributes
        while ( !itr.end() )
        {
            parser.skip_whitespace( itr );

            if ( itr.value === this._format.r_bracket )
            {
                break;
            }

            tag.add_attribute( this._attribute_parse( itr, tag, parser ) );
        }

        // check for missing required attributes.
        if( tag.def.attributes )
        {
            for( let [identifier, a] of tag.def.attributes )
            {
                if ( a.required && !tag.attributes.has(identifier) )
                {
                    let ta = new TagAttribute( null, a, tag);

                    // required attribute could not be met.
                    if ( !ta.is_valid() ) throw new NodeParseError( `Missing required attribute (${identifier}) or value`, tag );

                    tag.add_attribute( ta );
                }
            }
        }
    }

    can_parse( itr )
    {
        return itr.value === this._format.l_bracket;
    }
 
    /*
        @param itr string iterator
        @param parser host (main) parser
    */
    parse( itr, parser )
    {
        itr.next(); // skip l-bracket

        let closing = (itr.value === this._format.term);
        if ( closing )
        {
            itr.next();
        }

        let it = itr.clone(); // might need to set back
        let identifier = this.parse_identifier( itr, parser );
        let def = this._get_def( identifier, itr, parser );
        let tag = this.create_tag( def, closing, itr.line, itr.column );

        if ( !closing )
        {
            // allow tags to be their own attribute
            if ( itr.value === this._format.eq && this._format.self_attribute )
            {
                itr.set( it ); // set back to parse tagidentifier as attribute
            }
            this._parse_attributes( tag, itr, parser );
        }

        parser.skip_whitespace( itr );
        if ( itr.value !== this._format.r_bracket )
        {
            throw new NodeParseError( `Malformed Closing Tag: missing ${this._format.r_bracket}`, tag );
        }

        itr.next(); // skip ]
        return tag;
    }
}