import {TextNode} from './nodes';

function no_san(v) { return v; }
export class Format
{
    static default_props = {
        quote: null,            // no default quote
        brackets: ['', ''],      //
        eq: '=',
        term: '/',
        self_attribute: false
    };

    constructor( name = '', props = {} )
    {
        this.name = name;
        Object.assign( this, Format.default_props, props );

        TextNode.add_sanitizer( this.name, props.text_sanitize || no_san );
    }

    get l_bracket() { return this.brackets[0]; }
    get r_bracket() { return this.brackets[1]; }

    sanitize( text )
    {
        TextNode.sanitize( this.name, text );
    }
}

