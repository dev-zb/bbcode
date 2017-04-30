import {string_iter, substring, scan_to_end} from './string-iter';
import {is_func} from './helper';

/**
 * ==================== 
 *       Nodes
 * ==================== 
 */
export class Node
{
    _line = 0;     // error reporting.
    _column = 0;

    _origin_format = 'bbcode';

    def = null;

    constructor( props = { format: 'bbcode' } ) //def, format = 'bbcode' )
    {
        this._origin_format = props.format;
        this.def = props.def;
    }

    //format( format ) { return ''; }
    format( format ) { return this.def ? this.def.format( format, this ) : ''; }
    get discard_invalid() { return false; }  // discard invalid nodes [true] or write them to the top level node as text

    compare( to )
    {
        return (this.def && to.def) && 
                (
                    this.def === to.def ||
                    (is_func(this.def.compare) && this.def.compare(to.def)) ||
                    (is_func(to.def.compare) && to.def.compare(this.def))
                );
    }
}

    // a node without children.
export class VoidNode extends Node
{
}

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

    _start = null;
    _end = null;

    constructor( start, end )
    {
        super();
        if ( typeof start === 'string' )
        {
            this._start = new string_iter( start );
            this._end = this._start.clone();
            scan_to_end( this._end );
        }
        else if ( start instanceof string_iter )
        {
            this._start = start.clone();
            this._end = end.clone() || this._start.clone();
        }
    }

    get value()
    {
        return substring( this._start, this._end );
    }

    get length()
    {
        return this._end.distance( this._start );
    }

    format( fmt )
    {
        return TextNode.sanitize( fmt || this._origin_format, this.value );
    }
}

    // a node with children
export class ContainerNode extends Node
{
    children = [];
    constructor( props )
    {
        super( props );
    }

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
        format = format || this._origin_format;
        return this.children.map( c => 
        { 
            if ( c.format )
            {
                return c.format( format );
            }
            return '';
        }).join( '' );
    }
}

    // root of parsed result
export class RootNode extends ContainerNode {}

/**
 * Tells main parser to terminate the current / last node.
 */
export class TerminateNode extends Node
{
    terminating = true;
    compare() { return true; }
}