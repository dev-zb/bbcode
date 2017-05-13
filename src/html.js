import {MarkupFormatProperties} from './format';
import {AttributeFormatter, TagFormatter} from './markup-formatter';

/**
 * HTML Format
 */
export let html_format = new MarkupFormatProperties( 'html', { quote: '"', 
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
 * Html attribute formatter base
 */
export class HtmlAttrFrmtr extends AttributeFormatter
{
    constructor( identifier, props )
    {
        super( identifier, html_format, props );
    }
}

 
export class HtmlTagFrmtr extends TagFormatter
{
    constructor( identifier, props )
    {
        super( identifier, html_format, props );
    }
}
