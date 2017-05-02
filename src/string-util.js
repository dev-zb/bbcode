import {is_map, is_array, is_set, is_string, is_func } from './helper';
import {string_iter} from './string-iter.js';

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