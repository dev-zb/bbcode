export function is_array( v ) { return v instanceof Array; }
export function is_map( v ) { return v instanceof Map; }
export function is_set( v ) { return v instanceof Set; }
export function is_string( v ) { return v instanceof String || typeof v === 'string'; }
export function is_func( v ) { return typeof v === 'function'; }

/*
    Wraps input in array if it isn't an array
*/
export function ensure_array( v ) { return is_array(v) ? v : [v]; }

/*
    Checks if an identifier is valid (only checks ascii range)
*/
export function valid_identifier( c, start = false )
{
    return c && (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || (!start && c === '-');
}

/*
    Returns a function that will use the proper 'find' on a collection: has( some_var )( some_val );
    @param col collection variable (array, map, set, string, object)
*/
export function has( col )
{
    if ( is_array( col ) ) { return (v) => col.includes( v ); }
    if ( is_map( col ) || is_set( col ) ) { return (v) => col.has( v ); }
    if ( is_string( col ) ) { return (v) => col.search( v ) !== -1; }

    return (v) => col.hasOwnProperty( v );
}