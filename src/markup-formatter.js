import {Node} from './nodes';
import {stack} from './stack';
import {TagAttribute} from './markup-node';
import {is_string, ensure_array, is_array} from './util';
import {NodeFormatter, BaseFormatter} from './formatter';

export class AttrValue
{
    toString() { return ''; }
}

export class CompositeValue extends AttrValue
{
    constructor( attribute_id, id_sep, quote, ...values )
    {
        super();
        this.identifier = attribute_id;
        this.quote = quote;
        this.sep = id_sep;

        this.values = new Map( values );
    }

    add( id, value )
    {
        if ( id instanceof CompositeValue )
        {
            for( let [k, v] of id.values )
            {
                this.values.set( k, v );
            }
        }
        else
        {
            // value should be the finalized value (combined id & value)
            this.values.set( id, value );
        }
    }

    toString()
    {
        let values = Array.from( this.values.values() ).join( '' ).trim();

        return this.identifier + this.sep + this.quote + values + this.quote;
    }
}

/**
 * Attribute Formatter
 */
export class AttributeFormatter extends BaseFormatter
{   
    constructor( identifier, format_props, ...props )
    {
        super( identifier, format_props, ...props );
    }

    // pick proper quote character
    _get_quote( q = '' )
    {
        return this.format_props.quote === null ? q : this.format_props.quote;
    }

    // wrap value in quotes
    _quote( value, q = '' )
    {
        let quote = this._get_quote( q );
        return quote + AttributeFormatter.escape( value ) + quote;
    }

    format( value, quote = '' )
    {
        return this.identifier + this.format_props.eq + this._quote( value, quote );
    }

    static escape( value )
    {
        if ( is_string( value ) ) { return JSON.stringify( value ).slice(1, -1); }
        return value;
    }
}

/**
 * Convert from many attributes to one attribute with sub attributes
 */
export class CompositeAttributeFormatter extends AttributeFormatter
{
    static defaults = 
        {
            eq: ': ',           // separator for sub attribute ids and values
            separator: '; '     // separators for sub attributes
        };

    /**
     * @param {*} attr_identifier identifier of the attribute
     * @param {*} identifier sub identifier
     * @param {*} format_props 
     * @param {*} props 
     */
    constructor( attr_identifier, identifier, format_props, ...props )
    {
        super( attr_identifier, format_props, CompositeAttributeFormatter.defaults, ...props );

        this.sub_identifier = identifier;
    }

    _format_value( value )
    {
        return value;
    }

    /**
     * @param {*} value 
     * @param {*} quote 
     */
    format( value, quote = '' )
    {
        let result = this.sub_identifier + this.eq + this._format_value( value ) + this.separator;

        return new CompositeValue( this.identifier, this.format_props.eq, this._get_quote( quote ), [this.sub_identifier, result] );
    }
}

/**
 * Value used with AdditiveFormatter - Joins all values with a separator
 */
export class AdditiveValue extends AttrValue
{
    constructor( identifier, eq, separator, quote, ...values )
    {
        super();
        this.identifier = identifier;
        this.separator = separator;
        this.eq = eq;
        this.quote = quote;

        this.values = [];
        this.add( ...values );
    }

    add( ...values )
    {
        for( let v of values )
        {
            if ( v )
            {
                if ( v instanceof AdditiveValue )
                {
                    this.values = this.values.concat( v.values );
                }
                else if ( is_array( v ) )
                {
                    this.add( ...v );
                }
                else
                {
                    this.values.push( v );
                }
            }
        }
    }

    toString()
    {
        return this.identifier + this.eq + this.quote + this.values.join( this.separator ) + this.quote;
    }
}

/**
 * Many-to-one where the many values are joined for the final attribute value
 */
export class AdditiveAttributeFormatter extends AttributeFormatter
{
    /**
     * @param {*} identifier target attribute identifier
     * @param {*} format_props 
     * @param {*} values constant values
     * @param {*} props 
     */
    constructor( identifier, format_props, values, ...props )
    {
        super( identifier, format_props, { spacer: ' ' }, ...props );

        this.constant_values = values ? ensure_array( values ) : [];
    }

    format( value, quote )
    {
        return new AdditiveValue( this.identifier, this.format_props.eq, this.spacer, this._get_quote( quote ), ...this.constant_values, value  );
    }
}


/**
 * 
 */
export class TagFormatter extends NodeFormatter
{
    format_defaults = true; // format attributes with default values

    /*
        props: 
            attributes - any extra default attribute values to add during format
            format_defaults - format attributes that were default created (missing during parse)
    */
    constructor( identifier, format_props, props = {} )
    {
        super( identifier, format_props, props );

        // extra/default attributes        
        this.attributes = props.attributes ? ensure_array( props.attributes ) : [];

        if ( props.format_defaults !== undefined ) { this.format_defaults = !!props.format_defaults; }
    }

    /**
     * Format an attribute
     * @param {*} attribute expects TagAttribute, AttribPair, AttrValue, or an object with { identifier, value } properties
     * @param {*} map Map of formatted attributes to which the result will be added
     * @param {*} temp_children Attributes may generate child nodes for the parent tag
     * @return An array of new attributes generated by this attribute
     */
    format_attribute( attribute, map, temp_children )
    {
        let result;
        if ( attribute instanceof TagAttribute )
        {
            if ( this.format_defaults || (attribute.def.default_value !== attribute.value) )
            {
                result = attribute.format( this.format_props.name );
            }
        }
        else if ( attribute instanceof AttrValue )
        {
            result = attribute;
        }
        else // anything with identifier and value properties
        {
            let fmtr = new AttributeFormatter( attribute.identifier, this.format_props );
            result = fmtr.format( attribute.value );
        }

        let temp_attributes = [];
        if ( result instanceof CompositeValue ) // keyed layered values
        {
            let current = map.get( result.identifier );

            if ( current instanceof CompositeValue )
            {
                current.add( result );
            }
            else
            {
                map.set( result.identifier, result );
            }
        }
        else if ( result instanceof AdditiveValue ) // values that join: class="a b c"
        {
            let current = map.get( result.identifier );

            if ( current instanceof AdditiveValue )
            {
                current.add( result );
            }
            else
            {
                map.set( result.identifier, result );
            }
        }
        else if ( is_string( result ) )    // finalized attribute value pair
        {
            let current = map.get( attribute.identifier );

            if ( !current || is_string( current ) ) // cannot replace more specific attributes (like composites)
            {
                map.set( attribute.identifier, result );
            }
        }
        else if ( result )
        {
            result = ensure_array( result );

            for( let attrib of result )
            {
                if ( attrib instanceof Node )   // attribute generated more child nodes
                {
                    temp_children.push( attrib );
                }
                else if ( attrib instanceof TagAttribute )  // attribute generated more attributes
                {
                    temp_attributes.push( attrib );
                }
            }
        }

        return temp_attributes;
    }

    format_attributes( attributes, temp_children )
    {
        if ( !attributes ) { return ''; }

        let attr_map = new Map();
        let attr_stack = new stack();

        attr_stack.push_many(attributes);
        attr_stack.push_many(this.attributes);

        attr_stack.pop_each( attrib => attr_stack.push_many( this.format_attribute( attrib, attr_map, temp_children) ) );

        return attr_map;
    }

    _open_tag( attributes, temp_children )
    {
        if ( !this.identifier ) { return ''; }

        let attr_map = this.format_attributes( attributes, temp_children );

        let ident = this.identifier;

        // for: [tag=value]
        if ( this.format_props.self_attribute && attr_map.has( this.identifier ) )
        {
            ident = attr_map.get( this.identifier );
            attr_map.delete( this.identifier );
        }

        let attr_str = Array.from( attr_map.values() ).join( ' ' ).trim();

        return this.format_props.l_bracket + ident + (attr_str?' ':'') + attr_str + this.format_props.r_bracket;
    }

    _close_tag( )
    {
        if ( this.is_void || !this.identifier ) { return ''; }

        return this.format_props.l_bracket + this.format_props.term + this.identifier + this.format_props.r_bracket;
    }

    format_markup( attributes, children )
    {
        let temp_children = [];
        return this._open_tag( attributes, temp_children )
               + this.format_children( temp_children )
               + this.format_children( children )
               + this._close_tag();
    }

    format( attributes, children )
    {
        return this.format_markup( attributes, children );
    }
}
