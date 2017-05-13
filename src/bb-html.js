import {BaseFormatter} from './formatter';
import {AttributeFormatter, CompositeAttributeFormatter, AdditiveAttributeFormatter, TagFormatter, CompositeValue, AdditiveValue} from './markup-formatter';
import {html_format} from './html';
import {TextNode} from './nodes';
import {TagNode, TagAttribute} from './markup-node';
import {is_array, is_string, ensure_array} from './util';
import {AttributeDefinition, TagDefinition} from './markup-def';

/**
 * -----------------------------------------
 *  Types used with BBCode-to-HTML configs
 * ----------------------------------------
 */
//

/**
 * For css property values
 */
export class CssProp extends CompositeValue
{
    constructor( prop, value )
    {
        super( 'style', html_format.eq, html_format.quote, [prop, value] );
    }
}

/**
 * For css class values
 */
export class CssClass extends AdditiveValue
{
    constructor( ...classes )
    {
        super( 'class', html_format.eq, ' ', html_format.quote, ...classes );
    }
}

/* =====================================
 *  Attribute Formatters
 ======================================== */
//

/**
 * Attribute formatter for bbcode attributes that map to HTML style properties
 */
export class StyleFrmtr extends CompositeAttributeFormatter
{
    constructor( style_property, props = {} )
    {
        super( 'style', style_property, html_format, props );
    }
}


/**
 * Attribute formatter for bbcode attributes that map to HTML style properties with number values
 */
export class StyleNumFrmtr extends StyleFrmtr
{
    constructor( property, units = '', props = {} )
    {
        super( property, props );

        this.units = units;
    }

    _format_value( value )
    {
        return value + this.units;
    }
}

/**
 * Attribute formatter that creates a simple TagNode using the given definition and inserts
 *      the attribute value as a text child
 */
export class AttrTagFrmtr extends AttributeFormatter
{
    constructor( tag_def, props = {} )
    {
        super( null, html_format, props );

        this.tag_def = tag_def;
    }

    format( value )
    {
        let tag = new TagNode( this.tag_def );
        tag.add_text_child( new TextNode( value ) );

        return tag;
    }
}

/**
 * Attribute formatter for bbcode attributes that map to a CSS class
 */
export class ClassFrmtr extends AdditiveAttributeFormatter
{
    constructor( classes, props = {} )
    {
        super( 'class', html_format, classes, props );
    }
}

/* =====================================
 *  Tag Formatters
 ======================================= */

/**
 *  Fill a missing required attribute with the child contents (if available) 
 *      ex: [url]value[/url] => <a href="value">value</a>
 */
export class CToATagFrmtr extends TagFormatter
{
    /**
     * @param {*} identifier tag identifier
     * @param {*} required target attribute to fill with the tags content
     * @param {*} alt alternative attribute to create and fill if the required attribute was provided
     * @param {*} props 
     */
    constructor( identifier, required, alt, props )
    {
        super( identifier, html_format, props );

        if ( !required )
        {
            throw new Error( 'CToA' );
        }

        this._req_def = this._mk_def( required );
        this._alt_def = this._mk_def( alt );
    }

    _mk_def( v )
    {
        if ( is_string( v ) )
        { 
            return new AttributeDefinition( new AttributeFormatter( v, this.format_props ) );
        }
        else if ( v instanceof AttributeDefinition )
        {
            return v;
        }
        else if ( this.alt instanceof AttributeFormatter )
        {
            return new AttributeDefinition( v );
        }

        return null;
    }

    _frmt( def, attributes, children )
    {
        if ( def && children && children.length === 1 && children[0] instanceof TextNode )
        {
            let _attr = new Map( attributes ); // don't modify parsed attribute collection

            let tag_attr = new TagAttribute( children[0].value, def );
            if ( tag_attr.is_valid() )
            {
                _attr.set( def.identifier, tag_attr );
                return super.format( _attr, children );
            }
        }

        return super.format_children( children );
    }

    format( attributes, children )
    {
        if ( attributes && attributes.has( this._req_def.identifier ) )
        {
            if ( !this._alt_def )
            {
                return super.format( attributes, children );
            }

            return this._frmt( this._alt_def, attributes, children );
        }

        return this._frmt( this._req_def, attributes, children );
    }
}

/**
 * joins an attribute value with the identifier to create a tag.
 */
export class AttrJoinTagFrmtr extends TagFormatter
{
    constructor( identifier, attr_identifier, props = { format_value: false } )
    {
        super( identifier, html_format, props );
        this.attr_identifier = attr_identifier;
    }

    format( attributes, children )
    {
        let _attrs = new Map( attributes );
        let val = this.default_value;
        let attr = _attrs.get( this.attr_identifier ); 
        _attrs.delete( this.attr_identifier );

        if ( !attr )
        {
            if ( val === undefined ) { return ''; }
        }
        else
        {
            val = this.format_value ? attr.format( this.format_props.name ) : attr.value;

            if ( !val )
            {
                if ( this.default_value === undefined ) { return ''; }

                val = this.default_value;
            }
        }
        
        let id = this.identifier;
        this.identifier = this.identifier + val;
        let result = super.format_markup( _attrs, children );
        this.identifier = id;

        return result;
    }
}

/**
 *  wraps content in a given tagdef
 */ 
export class ContentWrapTagFrmtr extends BaseFormatter
{
    constructor( shell, wrap )
    {
        super( null, html_format );
        if ( !(shell instanceof TagDefinition) || !(wrap instanceof TagDefinition) )
        {
            throw new Error('Shell & Wrap require a TagDefinition type');
        }

        this.shell = shell;
        this.wrap = wrap;
    }

    format( attributes, children )
    {
        /*
            given a tag

                <shell attributes>
                    <wrap>content</wrap>
                </shell>
        */

        let tag = new TagNode( this.shell );
        let wrap_tag = new TagNode( this.wrap );

        tag.attributes = attributes;
        tag.children = [wrap_tag];

        wrap_tag.children = children;

        return tag.format( this.format_props.name );
    }
}

