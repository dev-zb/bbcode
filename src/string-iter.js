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
