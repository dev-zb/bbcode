import {string_iter, substring} from './string-iter';

/**
 * ==================== 
 *       Nodes
 * ==================== 
 */
export class Node
{
    __line = 0;     // error reporting.
    __column = 0;

    format( format ) { return ''; }
    get discard_invalid() { return false; }  // discard invalid nodes [true] or write them to the top level node as text
}

    // a node without children.
export class VoidNode extends Node {}

    // plain text
export class TextNode extends VoidNode
{
    static format_sanitizers = new Map();
    static add_sanitizer( name, san )
    {
        TextNode.format_sanitizers.set( name, san );
    }

    static sanitize( name, text )
    {
        if ( TextNode.format_sanitizers.has( name ) )
        {
            return TextNode.format_sanitizers.get( name )( text );
        }
        return text;
    }

    value = '';
    constructor( start, end )
    {
        super();
        if ( typeof start === 'string' ) { this.value = start; }
        else if ( start instanceof string_iter )
        {
            this.value = substring( start, end ) || '';
        }
    }

    get length()
    {
        return this.value.length;
    }

    format( fmt )
    {
        return TextNode.sanitize( fmt, this.value );
    }
}

    // a node with children
export class ContainerNode extends Node
{
    children = [];

    add_child( c )
    {
        if ( c instanceof TextNode && c.length <= 0 ) return false;

        this.children.push( c );
        return true;
    }

    remove_child( ch )
    {
        let i = this.children.indexOf( ch );
        this.children.splice( i, 1 );
    }

    clear_children() { this.children = []; }

    clone( deep = false )
    { 
        let n = new ContainerNode();
        if ( deep )
        {
            n.children = this._clone_children( deep );
        }

        return n;
    }

    _clone_children( deep )
    {
        let chld = [];
        for( let c of this.children )
        {
            chld.push( c.clone( deep ) );
        }

        return chld;
    }

    terminate() { return false; }

    format( format )
    {
        return this.children.map( c => { 
            if ( c.format )
                return c.format( format );
            return '';
        }).join( '' );
    }
}

    // root of parsed result
export class RootNode extends ContainerNode {}

export class NodeParser
{
    start_delim;
    constructor( delim )
    {
        this.start_delim = delim;
    }

    parse( str )
    {
        return null;
    }
}


