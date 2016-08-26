import {TextNode} from './nodes';

function no_san(v) { return v; }
export class Format
{
    constructor( name, quote, lbracket, rbracket, eq, self_attribute, sanitize )
    {
        this.name = name;
        this.quote = quote;
        this.l_bracket = lbracket;
        this.r_bracket = rbracket;
        this.eq = eq;
        this.term = '/';
        this.self_attribute = self_attribute;

        TextNode.add_sanitizer( name, sanitize || no_san );
    }

    sanitize( text )
    {
        TextNode.sanitize( this.name, text );
    }
}
export let bbcode_format = new Format( 'bbcode', null, '[', ']', '=', true );
export let html_format = new Format( 'html', '"', '<', '>', '=', false, function( text )
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
} );
