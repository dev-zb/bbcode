import {iter} from './iter';

/**
 * ==================== 
 *       String
 * ==================== 
 */
export class string
{
    constructor( str )
    {
        this.str = str;
        this.arr = this._split();
    }

    _split()
    {
        let res = [];
        for( let c of this.str )
        {
            res.push( c );
        }
        return res;
    }

    begin() { return new iter( this.arr, 0 ); }
    end() { return new iter( this.arr, this.arr.length - 1 ); }

    *[Symbol.iterator]()
    {
        for( let i = 0, e = this.length; i < e; ++i ) { yield this.arr[i]; }
    }

    get length()
    {
        return this.arr.length;
    }

    slice( begin, end )
    {
        return this.arr.slice( begin.index, end.index ).join( '' );
    }

    static make_string( begin, end )
    {
        return begin.val.slice( begin.index, end.index ).join( '' );
    }
}
