import {Format} from './format';
import {AttributeFormatter, MarkupTagFormatter} from './def'

/**
 * BBCode Format
 */
export let bbcode_format = new Format( 'bbcode', { brackets: ['[', ']'], self_attribute: true } );


/**
 * Basic Attribute Formatter
 */
export class BBCodeAttrFormatter extends AttributeFormatter
{
    constructor( name )
    {
        super( name, bbcode_format );
    }
}

/**
 * Basic Tag Formatter
 */
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