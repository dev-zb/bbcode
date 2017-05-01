import {TextNode} from './nodes';

function no_san(v) { return v; }
export class FormatProperties
{
    identifier;

    constructor( identifier, props = {} )
    {
        this.identifier = identifier;
        Object.assign( this, props );
        TextNode.add_sanitizer( this.identifier, props.text_sanitize || no_san );
    }

    sanitize( text )
    {
        TextNode.sanitize( this.identifier, text );
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

    constructor( identifier = '', props = {} )
    {
        super( identifier, Object.assign({}, MarkupFormatProperties.default_props, props ) );
    }

    get l_bracket() { return this.brackets[0]; }
    get r_bracket() { return this.brackets[1]; }
}

