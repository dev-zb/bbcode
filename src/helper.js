export function is_array( v ) { return v instanceof Array; }
export function ensure_array( v ) { return is_array(v) ? v : [v]; }
export function is_itr( v ) { return !!v[Symbol.iterator]; }