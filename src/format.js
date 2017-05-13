import {TextNode} from './nodes';

function no_san(v) { return v; }
export class FormatProperties
{
    name;

    constructor( name, props = {} )
    {
        this.name = name;
        Object.assign( this, props );
        TextNode.add_sanitizer( this.name, props.text_sanitize || no_san );
    }

    sanitize( text )
    {
        TextNode.sanitize( this.name, text );
    }
}

export class MarkupFormatProperties extends FormatProperties
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
        super( name, Object.assign({}, MarkupFormatProperties.default_props, props ) );
    }

    get l_bracket() { return this.brackets[0]; }
    get r_bracket() { return this.brackets[1]; }
}

