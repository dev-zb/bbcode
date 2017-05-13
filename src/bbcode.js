import {MarkupFormatProperties} from './format';
import {AttributeFormatter, TagFormatter} from './markup-formatter'

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
export class BBCodeTagFormatter extends TagFormatter
{
    constructor( tag_identifier, props )
    {
        super( tag_identifier, bbcode_format, props );
    }
}