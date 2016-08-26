/**
 * ==================== 
 *      Iterator
 * ==================== 
 */
export class iter
{
    index = 0;
    val;

    constructor( v, i )
    {
        this.val = v;
        this.index = +i || 0;
    }

    _constrain()
    {
        if ( this.index >= this.val.length ) { this.index = this.val.length; }
        else if ( this.index < 0 ) { this.index = -1; }

        return this.index;
    }

    next()
    {
        ++this.index;
        this._constrain();

        return { done: this.eof(), value: this.value };
    }

    prev()
    {
        --this.index;
        this._constrain();
        return this;
    }

    add( amt )
    {
        this.index += amt;
        this._constrain();

        return this;
    }

    offset_value( off )
    {
        return this.val[this.index + off];
    }

    set( itr )
    {
        this.index = itr.index;
        this._constrain();
    }

    eof()
    {
        return this.index === this.val.length || this.index < 0;
    }

    diff( it )
    {
        if ( it.val !== this.val ) return 0;
        if ( it.index <= this.index ) return 0;

        return it.index - this.index;
    }

    get value() { return this.val[this.index]; }

    set value( v ) { this.val[this.index] = v; }
    
    clone()
    {
        return new iter( this.val, this.index );
    }
}
