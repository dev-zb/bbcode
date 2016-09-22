export class stack
{
    _items = [];
    constructor( ...init )
    {
        this.push( ...init );
    }

    get size() { return this.length; }
    get length() { return this._items.length; }

    values() { return this._items; }
    entries() { return this._items; }

    clear()
    {
        this._items = [];
    }

    // push collection
    push_col( c, move = false )
    {
        if ( !c ) { return; }

        if ( typeof c.forEach === 'function' )
        {
            c.forEach( v => this._items.push( v ) );
        }
        else
        {
            try
            {
                for ( let v of c )
                {
                    this._items.push( v );
                }
            }
            catch( e ) { console.error('stack::push_col failed to push collection'); }
        }

        if ( move && typeof c.clear === 'function' )
        {
            c.clear();
        }
    }

    push( ...v )
    {
        this._items.push( ...(v.filter( v => (v !== undefined && v !== null) )) );
    }

    pop()
    {
        return this._items.pop();
    }

    forEach( cb )
    {
        for( let i = 0, e = this.length; i < e; ++i )
        {
            cb( this._items[i], i, this );
        }
    }

    pop_each( cb )
    {
        while( this.size )
        {
            cb( this.pop(), this );
        }
    }

    peek( index )
    {
        return this._items[index];
    }

    back()
    {
        if ( this.length )
        {
            return this._items[this.length - 1];
        }
        return null;
    }
    
    front()
    {
        if ( this.length )
        {
            return this._items[0];
        }
        return null;
    }
    
    find( val, compare )
    {
        let v;
        for( let i = this.length - 1; i >= 0; --i )
        {
            v = this._items[i];
            if ( compare( val, v ) ) { return v; }
        }
        return null;
    }
}
