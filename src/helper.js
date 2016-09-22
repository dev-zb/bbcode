export function is_array( v ) { return v instanceof Array; }
export function ensure_array( v ) { return is_array(v) ? v : [v]; }

export function valid_identifier( c, start = false )
{
    return (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || (!start && c === '-');
}