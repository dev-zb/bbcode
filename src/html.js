import {TextNode} from './nodes';
import {TagNode, TagAttribute} from './tag-parser';
import {Format} from './format';
import {AttributeFormatter, MarkupTagFormatter, AttributeDefinition, TagDefinition, BaseFormatter} from './def';

/**
 * HTML Format
 */
export let html_format = new Format( 'html', { quote: '"', 
                                    brackets: ['<', '>'], 
                                    text_sanitize: function( text )
                                    {
                                        let str = '';
                                        for( let c of text )
                                        {
                                            let cp = c.codePointAt( 0 );
                                            if ( (cp <= 32 && cp >= 9) || (cp >= 48 && cp <= 57) || (cp >= 65 && cp <= 90) || (cp >= 97 && cp <= 122) )
                                            {
                                                str += c;
                                            }
                                            else
                                            {
                                                str += `&#${cp};`;
                                            }
                                        }
                                        return str;
                                    } } );

/**
 * ==================== 
 * Attribute Fromatters
 * ==================== 
 */

/**
 * Basic attribute formatter
 */
export class HtmlAttrFormatter extends AttributeFormatter
{
    /**
     * @param identifier tag identifier when converted to html
     * @param props optional object with extra properties.
     */
    constructor( identifier, props )
    {
        super( identifier, html_format, props );
    }
}


/**
 * Url Attribute Formatter
 */
export class UrlAttrFormatter extends HtmlAttrFormatter
{
    // default url sanitize regex
    regex = /^((?:ht|f)tp(?:s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?)$/;

    constructor( identifier, props )
    {
        super( identifier, props );
    }

    /**
     * Sanitize url
     * @param value the parsed url (typically [url=VALUE])
     */
    sanitize( value )
    {
        let result;
        if ( (result = this.regex.exec(value)) )
        {
            return result[1]; 
        }
        return null;
    }
}


/**
 * An attribute that maps to a css style (color, font-size, etc)
 */
export class StyleAttrFormatter extends HtmlAttrFormatter
{
    /**
     * @param style_identifier identifier of the css property
     */
    constructor( style_identifier, props )
    {
        super( 'style', props );
        this.style_identifier = style_identifier;
    }

    /**
     * @return string style_identifier: value;
     */
    format( value )
    {
        let v = super.format( value );
        v.value = `${this.style_identifier}: ${v.value};`;
        return v;
    }
}


/**
 * CSS color property attribute
 */
export class ColorStyleAttrFormatter extends StyleAttrFormatter
{
    static regex = [
        /(#(?:[0-9a-fA-F]{3}){1,2})/,                                                // hex color
        /(rgba\((?:\s*(?:[1]?[0-9]{1,2}|2(?:[0-5]{1,2}|[0-4][0-9]))\s*,){3}\s*(?:1|0?\.[0-9]+\s*){1}\)){1}/, // 255,255,255,1.0 color            
        /(rgb\((?:\s*(?:[1]?[0-9]{1,2}|2(?:[0-5]{1,2}|[0-4][0-9]))\s*,?){3}\)){1}/, // 255,255,255 color
        /((?:[0-9a-fA-F]{3}){1,2})/
    ];
    static names = ['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'grey', 'green', 'greenyellow', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'];

    regex = ColorStyleAttrFormatter.regex;  // default. pass alternate in props
    names = ColorStyleAttrFormatter.names;
    constructor( name, props )
    {
        super( name, props );
    }

    sanitize( color )   
    {
        if ( this.names.includes( color.toLowerCase() ) )
        {
            return color;
        }
        else
        {
            let result;
            for( let rx of this.regex )
            {
                if ( (result = rx.exec( color )) )
                {
                    return result[1];
                }
            }
        }

        return 'inherit';
    }
}

/**
 * Attribute that maps to a css number property (font-size,...)
 */
export class NumberStyleAttrFormatter extends StyleAttrFormatter
{
    units;
    min;
    max;

    constructor( style_name, units, min, max, props )
    {
        super( style_name, props );
        this.units = units;
        this.min = min;
        this.max = max;
    }

    sanitize( value )
    {
        let num = +value || this.min;
        return Math.min(Math.max(this.min, num), this.max) + this.units;
    }
}

/**
 *  Attribute that formats to a child tag
 */
export class AttrTagFormatter extends HtmlAttrFormatter
{
    constructor( tag_def, props )
    {
        super('', props);

        this.tag_def = tag_def;
    }

    format( value )
    {
        let tag = new TagNode( this.tag_def );
        tag.add_child( new TextNode( value ) );

        return tag;
    }
}

/**
 * Attribute value maps to class=""
 */
export class ClassAttrFormatter extends HtmlAttrFormatter
{
    /**
     * set 'props.use_value' to use the set value with the given class string.
     */
    constructor( class_string, props )
    {
        super( 'class', props );
        this.classes = class_string;
    }

    format( value )
    {
        return super.format( this.classes + (this.use_value ? value : '') );
    }
}

/**
 * ========================
 *      Tag Formatters
 * ========================
 */

/**
 * Base Html Tag Formatter
 */
export class HtmlTagFormatter extends MarkupTagFormatter
{
    /**
     * @param tag_identifier identifier of the tag when converted to html
     */
    constructor( tag_identifier, attributes, props )
    {
        super( tag_identifier, html_format, attributes, props );
    }
}

/**
 *  Fill a missing required attribute with the child contents (if possible) 
 */
export class HtmlCTATagFormatter extends HtmlTagFormatter
{
    constructor( tag_identifier, required, alt, attributes, props )
    {
        super( tag_identifier, attributes, props );

        this.required = required;   // of required attribute that will steal the content (if possible)
        this.alt = alt;             // use content as an alternate attribute is required exists [null/undefined = leave content as content]
    }

    format( def, children, attributes )
    {
        if ( attributes && attributes.has(this.required) )
        {
            if ( !this.alt )
            {
                return super.format( def, children, attributes );
            }
            else if ( children.length === 1 && children[0] instanceof TextNode )
            {
                let _attr = new Map(attributes); // don't modify parsed attributes

                let value = children[0].value;
                if ( typeof this.alt === 'string' )
                { 
                    _attr.set( this.alt, new TagAttribute( value, new AttributeDefinition( this.alt, new AttributeFormatter( this.alt, this.format_type ))) );
                }
                else if ( this.alt instanceof AttributeDefinition )
                {
                    _attr.set( this.alt.identifier, new TagAttribute( value, this.alt ) );
                }
                else if ( this.alt instanceof AttributeFormatter )
                {
                    let f = new AttributeDefinition( this.alt.identifier, true, this.alt );
                    _attr.set( this.alt.identifier, new TagAttribute( value, f ) );
                }

                return super.format( def, children, _attr );
            }

        }
        else if ( children && children.length === 1 && children[0] instanceof TextNode )
        {
            let _attr = new Map(attributes);
            _attr.set( this.required, new TagAttribute( children[0].value, def.get_attribute(this.required) ) );

            return super.format( def, children, _attr );
        }

        return '';
    }
}

/**
 * Use an attribute (value) to create a child tag
 */
export class HeaderTagFormatter extends HtmlTagFormatter
{
    constructor( identifier, def, attributes, props )
    {
        super( identifier, attributes, props );

        this.def = def; // attribute definition
    }

    format( def, children, attributes )
    {
        let _children = [];

        let tag = new TagNode( this.def );

        tag.add_child( new TextNode( attributes.has(def.identifier) ? attributes.get(def.identifier).value : def.identifier ) );

        _children.push( tag );

        return super.format( def, _children.concat(children), attributes );
    }
}

/**
 * joins an attribute value with the identifier to create a tag.
 */
export class AttrJoinTagFormatter extends HtmlTagFormatter
{
    constructor( identifier, attr_identifier, attributes, props = { format_value: true } )
    {
        super( identifier, attributes, props );
        this.attr_identifier = attr_identifier;
    }

    format( def, children, attributes )
    {

        let val = this.default_value;
        if ( !attributes.has(this.attr_identifier) )
        {
            if ( this.default_value === undefined || this.default_value === null ) { return ''; }
        }
        else
        {
            let attr = attributes.get(this.attr_identifier); 
            if ( this.format_value )
            {
                let result = attr.format( this.format_type.name );
                if ( result )
                {
                    val = result.value;
                }
            }
            else
            {
                val = attr.value;
            }

            if ( !val && this.default_value !== undefined ) { val = this.default_value; }
            else if ( !val && this.default_value === undefined ) { return ''; }
        }

        let identifier = `${this.identifier}${val}`;
        return super.format_markup( def, children, attributes, identifier );
    }
}

/**
 *  wraps content in a given tagdef
 */ 
export class ContentWrapTagFormatter extends BaseFormatter
{
    constructor( shell, wrap )
    {
        super( html_format );
        if ( !(shell instanceof TagDefinition) || !(wrap instanceof TagDefinition) )
        {
            throw new Error('Shell & Wrap require a TagDefinition type');
        }
        this.shell = shell;
        this.wrap = wrap;
    }

    format( def, children, attributes )
    {
        /*
            given a tag

                <shell attributes>
                    <wrap>content</wrap>
                </shell>
        */

        let tag = new TagNode(this.shell);
        let wrap_tag = new TagNode(this.wrap);

        tag.attributes = attributes;
        tag.children = [wrap_tag];

        wrap_tag.children = children;

        return tag.format( this.format_type.name );
    }
}

/**
 * util class to simplify creating tag-defs used by the formatters.
 */
export class HtmlTagDef extends TagDefinition
{
    // a_or_f : attributes or a formatter.
    constructor( identifier, a_or_f, props )
    {
        super( identifier, null, null, a_or_f instanceof BaseFormatter ? a_or_f : new HtmlTagFormatter( identifier, a_or_f ), props ); 
    }
}
