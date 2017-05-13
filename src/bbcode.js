import {MarkupFormatProperties} from './format';
import {AttributeFormatter, TagFormatter} from './markup-formatter';
import {TagDefinition} from './markup-def';
import {ensure_array} from './util';

/**
 * BBCode Format
 */
export let bbcode_format = new MarkupFormatProperties( 'bbcode', { brackets: ['[', ']'], self_attribute: true } );


/**
 * Basic Attribute Formatter
 */
export class BBAttrFrmtr extends AttributeFormatter
{
    constructor( identifier )
    {
        super( identifier, bbcode_format );
    }
}

/**
 * Basic Tag Formatter
 */
export class BBTagFrmtr extends TagFormatter
{
    constructor( tag_identifier, props )
    {
        super( tag_identifier, bbcode_format, props );
    }
}


/**
 * Helper class for creating tag defs with a default BBCode formatter
 */
export class BBTagDef extends TagDefinition
{
    constructor( identifier, formatters, children, attributes, props )
    {
        super( [new BBTagFrmtr( identifier )].concat( formatters ? ensure_array( formatters ) : [] ), children, attributes, props );
    }
}