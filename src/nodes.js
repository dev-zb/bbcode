import {string_iter} from './string-iter';
import {substring, scan_to_end} from './string-util';
import {is_func, is_string} from './util';

/**
 * ==================== 
 *       Nodes
 * ==================== 
 */
export class Node
{
    _line = 0;     // error reporting.
    _column = 0;

    _origin_format = null;

    def = null;
    _sub_type;      // used for cloning: set to the derived type.

    constructor( def, props = {}, derived = Node )
    {
        this._sub_type = derived;
        if ( def instanceof Node )
        {
            Object.assign( this, def );
        }
        else 
        {
            this.def = def || {};
            this._origin_format = props.format;
            Object.assign( this, props );
        }
    }

    format( format )
    {
        return this.def ? this.def.format( format, this ) : '';
    }

    get discard_invalid() { return false; }  // discard invalid nodes [true] or write them to the top level node as text

    _def_compare( def )
    {
        return this.def === def ||
                (is_func( this.def.compare ) && this.def.compare( def )) ||
                (is_func( def.compare ) && def.compare( this.def ));
    }

    compare( to )
    {
        return (this.def && to.def) && this._def_compare( to.def );
    }

    clone()
    {
        return new (this._sub_type)( this );
    }
}

/**
 * 
 */
export class TextNode
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

    /**
     * [start, end)
     * @param {*} start text range start iterator (included)
     * @param {*} end text range end iterator (not included)
     */
    constructor( start, end )
    {
        if ( is_string( start ) )
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
        else if ( start instanceof TextNode )   // copy constructor
        {
            this._start = start._start.clone();
            this._end = start._end.clone();
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

    join( text )
    {
        if ( text.length && this._end.distance( text._start ) <= 0 )
        {
            this._end.set( text._end );
        }
    }

    clone()
    {
        return new TextNode( this );
    }
}

class TerminateResult {}
class SameTypeResult {}

export let ValidResult = Object.freeze( {
    invalid: false,
    valid: true,
    terminate: TerminateResult,
    same: SameTypeResult
} );

/**
 * Node with children
 */
export class ContainerNode extends Node
{
    children = [];
    text_formatter = null;      // how this container node handles text children

    constructor( def, props, derived = ContainerNode )
    {
        super( def, props, derived );

        if( def instanceof ContainerNode )
        {
            this.def = def.def;
            this.text_formatter = def.text_formatter;
        }
    }

    _is_child_allowed( c )
    {
        if ( this.def && is_func( this.def.valid_child ) )
        {
            return this.def.valid_child( c );
        }

        return ValidResult.valid;
    }

    _add_child_check( c )
    {
        let check = this._is_child_allowed( c );
        if ( check === ValidResult.valid )
        {
            c.parent = this;
            this.children.push( c );
        }

        return check;
    }

    add_text_child( txt )
    {
        if ( txt.length <= 0 ) { return false; }

        let last = this.last_child();
        if( last instanceof TextNode )
        {
            last.join( txt );
            return ValidResult.valid;
        }

        return this._add_child_check( txt );
    }

    add_child( c )
    {
        if ( c instanceof TextNode )
        {
            return this.add_text_child( c );
        }

        return this._add_child_check( c );
    }

    remove_child( ch )
    {
        let i = this.children.indexOf( ch );

        i >= 0 && this.children.splice( i, 1 );
    }

    clear_children() { this.children = []; }

    last_child()
    {
        return this.children[this.children.length - 1];
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

    clone( deep = false )
    { 
        let n = super.clone();
        if ( deep )
        {
            n.children = this._clone_children( deep );
        }
        return n;
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

/**
 * Terminates a node on the stack
 */
export class TerminateNode extends Node
{
    constructor( def )
    {
        super( def, {}, TerminateNode );
    }

    get terminating() { return true; }

    compare( n )
    {
        return !this.def || !n.def || this._def_compare( n.def );
    }
}

