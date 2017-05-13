import {Validator} from './validator';

export function is_array( v ) { return v instanceof Array; }
export function is_map( v ) { return v instanceof Map; }
export function is_set( v ) { return v instanceof Set; }
export function is_string( v ) { return v instanceof String || typeof v === 'string'; }
export function is_func( v ) { return typeof v === 'function'; }

/*
    Wraps input in array if it isn't an array
*/
export function ensure_array( v ) { return is_array(v) ? v : [v]; }

/**
 * Get a function that will test if a given value exists
 * @param {*} collection 
 * @param {*} default_value default return value
 */
export function get_has( collection, default_value = true )
{
    if ( is_string( collection ) )
    {
        collection = new Set(collection.split(''));
        return (v) => collection.has( v );
    }
    else if ( is_map( collection ) || is_set( collection ) )
    {
        return (v) => collection.has( v );
    }
    else if ( is_array( collection ) )
    {
        return (v) => collection.includes( v );
    }
    else if ( is_func( collection ) )
    {
        return (v) => collection( v );
    }
    else if ( collection instanceof Validator )
    {
        let f = (v) => { let r = collection.char( v, true ); f = (v) => collection.char( v ); return r; };
        return (v) => f( v );
    }
    else if ( collection && typeof collection === 'object' )
    {
        return (v) => collection.hasOwnProperty( v );
    }

    return (v) => default_value;
}

export function get_iterable( v )
{
    if ( is_map( v ) ) { return v.values(); }
    else if ( is_array( v ) || is_set( v ) || is_string( v ) ) { return v; }
    else
    {
        let names = v.getOwnPropertyNames();
        return {
            [Symbol.iterator]: () => { 
                return { done: !!names.length, value: v[names.pop()] };
            }
        };
    }
}

export class pair
{
    constructor( first, second )
    {
        this.first = first;
        this.second = second;
    }
}