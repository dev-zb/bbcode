import {is_map, is_array, is_set, is_string, is_func } from './helper';

/*
    string wrap
*/
class _str
{
    value = '';
    constructor( value )
    {
        this.value = value;
    }

    get length() { return this.value.length; }

    codePointAt( i ) { return this.value.codePointAt( i ); }
}

/*
    Iterates a string while accounting for unicode characters.
*/
export class string_iter
{
    _str = null;
    _index = 0;
    _value = null;

    constructor( str, index = 0 )
    {
        if ( str instanceof string_iter ) // copy ctor
        {
            this._str = str._str;
            this._index = str._index;
        }
        else // ctor
        {
            this._str = new _str( str );
            this._index = index;
        }

        this._clamp();
    }

    _ci()
    {
        return !this.end() ? String.fromCodePoint( this._str.codePointAt( this._index ) ) : '';
    }

    _clamp()
    {
        if ( this._index > this._str.length ) { this._index = this._str.length; }
        else if ( this._index < 0 ) { this._index = -1; }

        this._value = this._ci();
    }

    end()
    {
        return (this._index <= -1 || this._index >= this._str.length);
    }
    get done() { return this.end(); }

    next()
    {
        ++this._index;
        this._clamp();

        return { done: this.done, value: this.value };
    }

    set( /*string_iter*/ itr )
    {
        this.index = itr.index;
        this.value = itr.value;
    }

    toString() { return this._value; }

    get str()
    {
        return this._str.value;
    }

    get index()
    {
        return this._index;
    }

    /**
     * Does not check if `i` is the first byte of a character.
     */
    set index( i )
    {
        this._index = i;
        this._clamp();
    }

    get value()
    {
        return this._value;
    }

    set value( v )
    {
        if ( !this.end() )
        {
            this._value = v;
            this._str.value = this._str.value.substring( 0, this._index ) + v + this._str.value.substring( this._index + this._ci().length );
        }
    }

    get code_point()
    {
        return this._value.codePointAt( 0 );
    }

    clone()
    {
        return new string_iter( this );
    }

    distance( itr )
    {
        return this.index - itr.index;
    }

    [Symbol.iterator]() { return this; }
}


/*
    Substring using iterators. Expects the iterators refer to the same string.
 */
export function substring( /*string_iter*/ start, /*string_iter*/ end )
{
    if ( !start || !end ) { return ''; }
    if ( start.index < end.index )
        return start.str.substring( start.index, end.index );
    
    return '';
}

/*
    Scan a quoted chunk of text. Quotes will be whatever the initial character is when called.
    @param itr string iterator
    @param invalid an array of any characters that are invalid (not allowed in the quoted area)
*/
export function substring_quoted( itr, invalid = null )
{
    let quote = itr.value;
    if ( invalid !== null && !(invalid instanceof Array) ) invalid = [invalid];

    itr.next();
    let it = itr.clone();

    let esc = false;
    while ( !itr.end() )
    {
        if ( itr.value === '\\' ) { esc = !esc; }
        else if ( itr.value === quote && !esc ) { break; }
        else if ( invalid && invalid.includes( itr.value ) ) { return ''; }
        itr.next();
    }

    let sub = substring( it, itr );
    itr.next();
    return sub;
}

/*
    Goto the end of a string
*/
export function scan_to_end( it )
{
    while ( !it.end() ) { it.next(); }
}

function _pick_check( v )
{
    if ( is_string( v ) )
    {
        return (it) => it.value === v;
    }
    else if ( is_map( v ) || is_set( v ) )
    {
        return (it) => v.has( it.value );
    }
    else if ( is_array( v ) )
    {
        return (it) => v.includes( it.value );
    }
    else if ( is_func( v ) )
    {
        return (it) => v( it.value );
    }
    else if ( typeof v === 'object' )
    {
        return (it) => v.hasOwnProperty( it.value );
    }

    return (it) => true;
}

function _scan( it, test, cmp )
{
    let _t = _pick_check( test );
    while( !it.end() && (_t( it ) === cmp) ) { it.next(); }
}

/*
    Advance iterator until some character is found
*/
export function scan_to( it, find )
{
    _scan( it, find, false );
}

/*
    Advance iterator while some character is unseen
*/
export function scan_while( it, skip )
{
    _scan( it, skip, true );
}

/*
    
*/
export function substring_scan( it, scan, find )
{
    let i = it.clone();
    scan( it, find );

    return substring( i, it );
}

export function substring_scan_to( it, find )
{
    return substring_scan( it, scan_to, find );
}

export function substring_scan_while( it, find )
{
    return substring_scan( it, scan_while, find );
}


export function str_read( itr, count )
{
    count = Math.trunc( count );

    let s = '';
    if ( count > 0 )
    {
        while( !itr.done() && count-- )
        {
            s += itr.value;
        }
    }
    return s;
}