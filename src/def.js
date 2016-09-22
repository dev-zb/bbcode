import {html_format,bbcode_format} from './format';
import {TagParser, TagNode, TagAttribute} from './tag-parser';
import {stack} from './stack';
import {Node,TextNode} from './nodes';
import {is_array, ensure_array} from './helper';

export class AttrPair
{
    constructor( name, value )
    {
        this.name = name;
        this.value = value;
    }
}

export class BaseFormatter
{
    constructor( format_type, props )
    {
        Object.assign( this, props );
        this.format_type = format_type;
    }

    format() { return null; }
}

/**
 * Attribute Formatter
 */
export class AttributeFormatter extends BaseFormatter
{   
    constructor( name, format_type, props = {} )
    {
        super( format_type, props );
        this.name = name;
    }

    format( value )
    {
        return new AttrPair(this.name, this.sanitize(value));
    }

    sanitize( value )
    {
        return AttributeFormatter.escape( value );
    }

    static escape( value )
    {
        if ( typeof value === 'string' ) { return JSON.stringify( value ).slice(1,-1); }
        return value;
    }
}

export class BBCodeAttrFormatter extends AttributeFormatter
{
    constructor( name )
    {
        super( name, bbcode_format );
    }
}

/**
 * ATTRIBUTE DEFINITIONS
 */

export class AttributeDefinition
{
    static require_value_default = true;

    name;

    required = false;   // lets parser know that this attribute is required. the parser will attempt to create it when missing.

    require_value = AttributeDefinition.require_value_default;  // lets the parser know a value is required to be a valid attribute
    default_value = null;                                       // default value to set if required_value and value is null/undefined

    constructor( name, formats = null, props = {} )
    {
        Object.assign( this, props );

        this.name = name;

        this.formats = new Map();
        this.add_format(new BBCodeAttrFormatter(name));
        if ( formats )
        {
            if ( !is_array( formats ) )
            { 
                this.add_format( formats ); 
            }
            else
            {
                for( let f of formats )
                {
                    this.add_format( f );
                }
            }
        }
    }

    // checks if a value is set when required.
    valid_value( v )
    {
        return !this.require_value || (this.require_value && (v !== null && v !== undefined));
    }    

    // used when a tag-attribute value is set. 
    validate( value ) { return !this.valid_value(value) ? this.default_value : value; }

    add_format( fmt )
    {
        if ( fmt instanceof AttributeFormatter )
        {
            this.formats.set( fmt.format_type.name, fmt );   
        }
    }

    format( format, value, attr )
    {
        if ( this.formats.has( format ) )
        {
            let ret = this.formats.get( format ).format( value, attr );
            if ( !(ret instanceof Node) )
            {
                if ( !this.valid_value(ret.value) ) 
                {
                    if ( this.default_value ) { ret.value = this.default_value; }
                    else { return null; }
                }
            }

            return ret; 
        }

        return null;
    }
}

export class ColorAttrDefinition extends AttributeDefinition
{
    constructor( name, formats, props )
    {
        super( name, formats, props );
    }

    valid_char( chr, start )
    {
        return (( start && chr === '#' ) || TagParser.valid_value_char( chr ));
    }
}

export class UrlAttrDefinition extends AttributeDefinition
{
    static valid = './:%_-&*$?';
    constructor( name, formats, props )
    {
        super( name, formats, props );
    }

    valid_char( ch, start )
    {
        return TagParser.valid_value_char(ch) || UrlAttrDefinition.valid.includes(ch);
    }
}

export class NumberAttrDefinition extends AttributeDefinition
{
    constructor( name, min, max, formats, props )
    {
        super( name, formats, props );
        this.min = min;
        this.max = max;
    }

    valid_char( c )
    {
        return ( c >= '0' && c <= '9' );
    }

    validate( value )
    {
        let v = +super.validate( value );
        if ( (!!v && v !== 0) && (v >= this.min && v <= this.max) ) { return v; }
        
        return this.min; 
    }
}

    // attribute with a list of pre-approved values.
export class ApprovedAttrDefinition extends AttributeDefinition
{
    constructor( name, valid_values, formats, props )
    {
        super(name, formats, props );

        this.valid_values = ensure_array(valid_values); // list of valid values.   
    }

    validate( value )
    {
        if ( this.valid_values.includes(value) ) { return value; }

        return this.valid_values[this.default_index || 0];
    }
}

/**
 * TAG FORMATTING
 */

export class TagFormatter extends BaseFormatter
{
    constructor( tag_name, format_type, props )
    {
        super( format_type, props );
        this.name = tag_name;
    }

    format_children( children )
    {
        if ( !children || !children.length ) { return ''; }

        let str = [];
        for( let child of children )
        {
            if ( child.format )
            {
                str.push( child.format(this.format_type.name) );
            }
            else if ( typeof child === 'string' )
            {
                str.push( this.format_type.sanitize(child) );
            }
        }
        return str.join( '' );
    }

    format( def, children, attributes )
    {
        return this.format_children( children );
    }
}

export class MarkupTagFormatter extends TagFormatter
{
    constructor( tag_name, format_type, attributes, props )
    {
        super( tag_name, format_type, props );
        this.attributes = ensure_array( attributes );
    }

    format_attribute( attribute, map, children )
    {
        // expect attribute === AttrPair / TagAttribute
        let a_v;
        if ( attribute instanceof TagAttribute ) { a_v = ensure_array(attribute.format( this.format_type.name )); }
        else { a_v = [attribute]; } // assume object {name/value} or AttrPair

        let attribs = [];
        for( let attr of a_v )
        {
            if ( attr instanceof Node || typeof attr === 'string' )    // attribute became a child.
            {
                children.push( attr );
            }
            else if ( attr instanceof TagAttribute )    // allow 1 attribute to become many (one-to-many)
            {
                attribs.push( attr );
            }
            else if ( attr && attr.name )
            {
                if ( map.has( attr.name ) ) // some parsed attributes might map to the same converted attribute (style,class...). (many-to-one)
                {
                    let v = map.get( attr.name );
                    v.value.push( attr.value );
                }
                else 
                {
                    map.set( attr.name, { 
                                    quote: this.format_type.quote === null ? attribute.quote || '' : this.format_type.quote, //!!quote ? quote : attr.quote, 
                                    value: [attr.value]
                                });
                }
            }
        }

        return attribs;
    }

    format_attributes( attributes )
    {
        if ( !attributes ) { return ['',null]; }

        let attr_map = new Map();
        let children = [];

        let attr_stack = new stack();

        attr_stack.push_col(attributes);
        attr_stack.push_col(this.attributes);

        while( attr_stack.size )
        {
            attr_stack.push_col( this.format_attribute( attr_stack.pop(), attr_map, children ) );
        }

        // combine attribute names & values
        let attribs = [];
        for( let [k,a] of attr_map )
        {
            let a_str = a.value.join( ' ' ).trim();
            if ( !a_str )
            {
                attribs.push( k );
            }
            else
            {
                attribs.push( `${k}${this.format_type.eq}${a.quote}${a_str}${a.quote}` );
            }
        }

        return [attribs.join( ' ' ),children];
    }

    format_tag( attributes, name, close = '' )
    {
        if ( name === null ) { return ['',]; }

        let attribs = '';
        let temp_children = [];
        if ( attributes )
        {
            [attribs,temp_children] = this.format_attributes( attributes );
        }

        let mid = `${name} ${attribs}`.trim();

        return [`${this.format_type.l_bracket}${close}${mid}${this.format_type.r_bracket}`, temp_children];        
    }

    format_markup( def, children, attributes, open_name, close_name )
    {
        let open_tag = '';
        let close_tag = '';
        let temp_children = [];

        if ( open_name === undefined ) { open_name = this.name; }

        [open_tag,temp_children] = this.format_tag( attributes, open_name );

        let _void = this.is_void !== undefined ? this.is_void : def.is_void;
        if ( _void )
        {
            return open_tag;
        }

        let c_str = this.format_children( temp_children );
        c_str += this.format_children( children );

        if ( typeof def.content_parser === 'function' )
        {
            c_str = def.content_parser( this.format_type, c_str );
        }

        [close_tag,temp_children] = this.format_tag( null, (close_name === undefined ? this.name : close_name), '/' );

        return `${open_tag}${c_str}${close_tag}`;
    }

    format( def, children, attributes )
    {
        return this.format_markup( def, children, attributes, this.name );
    }
}


export class BBCodeTagFormatter extends MarkupTagFormatter
{
    constructor( tag_name, props )
    {
        super( tag_name, bbcode_format, props );
    }
    
    format( def, children, attributes )
    {
        return this.format_markup( def, children, attributes, attributes.has( this.name ) ? '' : this.name );
    }
}


export class TagDefinition
{
    name;       // tag name
    is_void = false;    // tag is self-closing
    overflow = true;   // if parent terminates before this tag: true start again in next parent; false terminate with current parent.
    terminate;  // other tags that cause this one to terminate/close.

    type_child = null;

    children   = null;
    attributes = null;

    parents = null;       // valid parent tags.
    parents_allow = true; // true: whitelist mode

    add_missing = true; // add missing attributes during format. false: empty string

    formats; // formatters.

    constructor( name, children = null, attributes = null, formats = null, props = {} )
    {
        if ( !name ) 
        {
            throw new Error('TagDefinition requires a name.');
        }

        Object.assign( this, props );

        this.name = name;

        if ( is_array(children) ) { this.children = new Set( children ); }
        else if ( children instanceof Set ) { this.children = children; }

        this.attributes = new Map();
        if ( is_array( attributes ) )
        {
            for( let a of attributes )
            {
                this.attributes.set( a.name, a );
            }
        }
        else if ( !attributes )
        {
            this.__allow_all_attributes = true;
        }

        if ( props.terminate  ) { this.terminate  = new Set( ensure_array( props.terminate ) );  }
        if ( props.type_child ) { this.type_child = new Set( ensure_array( props.type_child ) ); }
        if ( props.parents    ) { this.parents    = new Set( ensure_array( props.parents ) );    }

        this.formats = new Map();
        this.add_format( new BBCodeTagFormatter( name ) );
        if ( formats )
        {
            if ( !is_array( formats ) )
            { 
                this.add_format( formats ); 
            }
            else
            {
                for( let f of formats )
                {
                    this.add_format( f );
                }
            }
        }
    }

    add_format( fmt )
    {
        if ( fmt instanceof BaseFormatter )
        {
            this.formats.set( fmt.format_type.name, fmt );
        }
    }

    format( format, children, attributes, tag )
    {
        if ( this.formats.has( format ) )
        {
            let fmtr = this.formats.get( format );
            return fmtr.format( this, children, attributes, tag );
        }

        return '';
    }

    valid_child( node )
    {
        if ( this.is_void ) { return false; }
        if ( this.terminate && this.terminate.has( node.name ) ) { return node; }

        if ( node instanceof TextNode && node.length <= 0 ) { return false; }   // no empty text. 

        if ( node instanceof TagNode )
        {
            return (!this.children || this.children.has( node.name )) && node.def.valid_parent( this );
        }
        
        if ( !this.type_child ) { return true; }

        for( let t of this.type_child )
        {
            if ( node instanceof t ) { return true; }
        }

        return false;
    }

    valid_parent( tag )
    {
        if ( !this.parents ) { return this.parents_allow; }

        return this.parents.has( tag.name ) ? this.parents_allow : !this.parents_allow;
    }

    valid_attribute( attr )
    {
        return !this.attributes || this.attributes.has( attr.def.name );
    }

    // get attribute def
    get_attribute( name )
    {
            // null/undefined attributes means all are allowed.
        if ( this.__allow_all_attributes && !this.attributes.has( name ) )
        {
                // create definitions as needed.
            let def = new AttributeDefinition( name );
            for( let [,f] of this.formats )
            {
                def.add_format( new AttributeFormatter( name, f.format_type ) );
            }
            this.attributes.set( name, def );
            return def;   
        }

        return this.attributes.get( name );
    }
};
