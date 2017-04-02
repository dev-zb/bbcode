class _str
{
    _value = '';
    constructor( value )
    {
        _value = value;
    }

    set str( val ) { _value = val; }
    get str() { return _value; }

    get length() { return _value.length; }
}

export class string_iter
{
    _str = null;
    _index = 0;
    _value = null;

    constructor( str, index = 0 )
    {
        if ( str instanceof string_iter )
        {
            this._str = str._str;
            this._index = str._index;
        }
        else
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

    next()
    {
        ++this._index;
        this._clamp();

        return { done: this.end(), value: this.value };
    }

    set( /*string_iter*/ itr )
    {
        this.index = itr.index;
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

    get done() 
    {
        return this.end();
    }

    clone()
    {
        return new string_iter( this );
    }

    diff( it )
    {
        return it.index - this.index;
    }
}


/**
 * 
 */
export function substring( /*string_iter*/ start, /*string_iter*/ end )
{
    if ( !start || !end ) { return ''; }
    if ( start.index < end.index )
        return start.str.substring( start.index, end.index );
    
    return '';
}

export function substring_quoted( itr )
{
    let quote = itr.value;

    itr.next();
    let it = itr.clone();

    let esc = false;
    while ( !itr.end() )
    {
        if ( itr.value === '\\' ) { esc = !esc; }
        else if ( itr.value === quote && !esc ) { break; }
        itr.next();
    }

    let sub = substring( it, itr );
    itr.next();
    return sub;
}

export function scan_to( it, find )
{
    if ( typeof find === 'string' )
    {
        while( !it.end() && it.value !== find ) { it.next(); }
    }
    else if ( find instanceof Map || find instanceof Set )
    {
        while( !it.end() && !find.has( it.value ) ) { it.next(); }
    }
    else if ( find instanceof Array )
    {
        while( !it.end() && !find.includes( it.value ) ) { it.next(); }
    }
    else if ( typeof find === 'function' )
    {
        while( !it.end() && !find( it.value ) ) { it.next(); }
    }
    else if ( typeof find === 'object' )
    {
        while( !it.end() && !find.hasOwnProperty( it.value ) ) { it.next(); }
    }
}

export function scan_while( it, skip )
{
    if ( typeof skip === 'string' )
    {
        while( !it.end() && it.value === skip ) { it.next(); }
    }
    else if ( skip instanceof Map || skip instanceof Set )
    {
        while( !it.end() && skip.has( it.value ) ) { it.next(); }
    }
    else if ( skip instanceof Array )
    {
        while( !it.end() && skip.includes( it.value ) ) { it.next(); }
    }
    else if ( typeof skip === 'function' )
    {
        while( !it.end() && skip( it.value ) ) { it.next(); }
    }
    else if ( typeof skip === 'object' )
    {
        while( !it.end() && skip.hasOwnProperty( it.value ) ) { it.next(); }
    }
}

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