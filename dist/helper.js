'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.is_array = is_array;
exports.ensure_array = ensure_array;
exports.valid_identifier = valid_identifier;
function is_array(v) {
    return v instanceof Array;
}
function ensure_array(v) {
    return is_array(v) ? v : [v];
}

function valid_identifier(c) {
    var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    return c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z' || c >= '0' && c <= '9' || !start && c === '-';
}