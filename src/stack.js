/**
 * ==================== 
 *       Stack
 * ==================== 
 */
export class stack
{
    values = [];
    constructor( init ) { this.push(init); }

    push( v )
    {
        if ( !v ) { return; }

        if ( v.forEach )
        {
             v.forEach( p => {
                if ( p )
                    this.values.push( p );
            });
        }
        else
        {
            this.values.push( v );
        }
    }

    push_move( v )
    {
        this.push( v );
        v.clear();
    }

    pop()
    {
        return this.values.pop();
    }

    peek( index )
    {
        return this.values[index];
    }

    forEach( cb )
    {
        for( let i = 0, e = this.length; i < e; ++i ) { cb( this.values[i], i, this ); }
    }

    *[Symbol.iterator]()
    {
        for( let i = 0, e = this.length; i < e; ++i ) { yield this.values[i]; }
    }

    back()
    {
        if ( this.length )
        {
            return this.values[this.length - 1];
        }
        return null;
    }
    
    front()
    {
        if ( this.length )
        {
            return this.values[0];
        }
        return null;
    }
    
    size()
    {
        return this.length;
    }

    get length()
    {
        return this.values.length;
    }

    clear()
    {
        this.values = [];
    }

    array()
    {
        return this.values;
    }

    find( val, compare )
    {
        let v;
        for( let i = this.length - 1; i >= 0; --i )
        {
            v = this.values[i];
            if ( compare( val, v ) ) { return v; }
        }
        return null;
    }
}
