import {get_has} from './util';
import {string_iter} from './string-iter';
import {Validator, ListValidator} from './validator';

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

/**
    Scan a quoted chunk of text. Quotes will be whatever the initial character is when called.
    @param {*} itr string iterator
    @param {*} invalid any characters that cause failure
*/
export function substring_quoted( itr, invalid = null )
{
    let quote = itr.value;
    let is_invalid = get_has( invalid, false );

    itr.next();
    let it = itr.clone();

    let esc = false;
    while ( !itr.end() )
    {
        if ( itr.value === '\\' ) { esc = !esc; }
        else if ( itr.value === quote && !esc ) { break; }
        else if ( is_invalid( itr.value ) ) { return ''; }
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

/**
 * Iterate while get-value( test ) === cmp
 * @param {*} it iterator
 * @param {*} test collection
 * @param {*} cmp comparison value
 */
function _scan( it, test, cmp )
{
    let _t = get_has( test );
    while( !it.done && (_t( it.value ) === cmp) )
    {
        it.next();
    }
}

/**
    Advance iterator until some character is found
*/
export function scan_to( it, pred )
{
    _scan( it, pred, false );
}

/**
    Advance iterator while some character is unseen
*/
export function scan_while( it, pred )
{
    _scan( it, pred, true );
}

/**
 * iterate using `scan` and `find`. return substring of span. 
 * @param {*} it iterator
 * @param {*} scan function
 * @param {*} find comparison value / collection
 */
export function substring_scan( it, scan, find )
{
    let i = it.clone();
    scan( it, find );

    return substring( i, it );
}

/**
 * Iterate until `find` is met and return substring of span
 * @param {*} it iterator
 * @param {*} find comparison value/collection
 */
export function substring_scan_to( it, find )
{
    return substring_scan( it, scan_to, find );
}

/**
 * Iterate while `find` is met and return substring of span
 * @param {*} it iterator
 * @param {*} find comparison value/collection
 */
export function substring_scan_while( it, find )
{
    return substring_scan( it, scan_while, find );
}

/**
 * Get a string of `count` characters
 * @param {*} itr 
 * @param {*} count number of characters to read
 */
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

/**
 * Scan a string using a validator. return substring of span
 * @param {*} itr 
 * @param {*} validator Validator type
 */
export function substring_validator( itr, validator = new Validator() )
{
    let it = itr.clone();
    scan_while( itr, validator );
    
    return substring( it, itr );
}

export function substring_identifier( itr, validator = new IdentfierValidator() )
{
    return substring_validator( itr, validator ).toLowerCase();
}



export let whitespace_validator = new ListValidator( [ 
            '\u0009', '\u000A', '\u000B', '\u000C', '\u000D', '\u0020', '\u0085', '\u00A0',
            '\u1680', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006',
            '\u2007', '\u2008', '\u2009', '\u200A', '\u2028', '\u2029', '\u202F', '\u205F',
            '\u3000' ] );

export function skip_whitespace( itr )
{
    scan_while( itr, whitespace_validator );
}

export function find_whitespace( itr )
{
    scan_to( itr, whitespace_validator );
}