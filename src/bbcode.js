import {MarkupFormatProperties} from './format';
import {AttributeFormatter, MarkupTagFormatter} from './def'

/**
 * BBCode Format
 */
export let bbcode_format = new MarkupFormatProperties( 'bbcode', { brackets: ['[', ']'], self_attribute: true } );


/**
 * Basic Attribute Formatter
 */
export class BBCodeAttrFormatter extends AttributeFormatter
{
    constructor( identifier )
    {
        super( identifier, bbcode_format );
    }
}

/**
 * Basic Tag Formatter
 */
export class BBCodeTagFormatter extends MarkupTagFormatter
{
    constructor( tag_identifier, props )
    {
        super( tag_identifier, bbcode_format, props );
    }
    
    format( def, children, attributes )
    {
        return this.format_markup( def, children, attributes, attributes.has( this.identifier ) ? '' : this.identifier );
    }
}