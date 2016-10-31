'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.substring = substring;
exports.substring_quoted = substring_quoted;
exports.scan_to = scan_to;
exports.scan_while = scan_while;
exports.substring_scan = substring_scan;
exports.substring_scan_to = substring_scan_to;
exports.substring_scan_while = substring_scan_while;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var string_iter = exports.string_iter = function () {
    function string_iter(str) {
        var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        _classCallCheck(this, string_iter);

        this._str = '';
        this._index = 0;
        this._value = null;

        if (str instanceof string_iter) {
            this._str = str._str;
            this._index = str._index;
        } else {
            this._str = str;
            this._index = index;
        }

        this._clamp();
    }

    _createClass(string_iter, [{
        key: '_ci',
        value: function _ci() {
            return !this.end() ? String.fromCodePoint(this._str.codePointAt(this._index)) : '';
        }
    }, {
        key: '_clamp',
        value: function _clamp() {
            if (this._index > this._str.length) {
                this._index = this._str.length;
            } else if (this._index < 0) {
                this._index = -1;
            }

            this._value = this._ci();
        }
    }, {
        key: 'end',
        value: function end() {
            return this._index <= -1 || this._index >= this._str.length;
        }
    }, {
        key: 'next',
        value: function next() {
            ++this._index;
            this._clamp();

            return { done: this.end(), value: this.value };
        }
    }, {
        key: 'set',
        value: function set( /*string_iter*/itr) {
            this.index = itr.index;
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this._value;
        }
    }, {
        key: 'clone',
        value: function clone() {
            return new string_iter(this);
        }
    }, {
        key: 'diff',
        value: function diff(it) {
            return it.index - this.index;
        }
    }, {
        key: 'str',
        get: function get() {
            return this._str;
        }
    }, {
        key: 'index',
        get: function get() {
            return this._index;
        },
        set: function set(i) {
            this._index = i;
            this._clamp();
        }
    }, {
        key: 'value',
        get: function get() {
            return this._value;
        },
        set: function set(v) {
            // only changes local string
            if (!this.end()) {
                this._value = v;
                this._str = this._str.substring(0, this._index) + v + this._str.substring(this._index + this._ci().length);
            }
        }
    }, {
        key: 'code_point',
        get: function get() {
            return this._value.codePointAt(0);
        }
    }, {
        key: 'done',
        get: function get() {
            return this.end();
        }
    }]);

    return string_iter;
}();

/**
 * 
 */


function substring( /*string_iter*/start, /*string_iter*/end) {
    if (!start || !end) {
        return '';
    }
    if (start.index < end.index) return start.str.substring(start.index, end.index);

    return '';
}

function substring_quoted(itr) {
    var quote = itr.value;

    itr.next();
    var it = itr.clone();

    var esc = false;
    while (!itr.end()) {
        if (itr.value === '\\') {
            esc = !esc;
        } else if (itr.value === quote && !esc) {
            break;
        }
        itr.next();
    }

    var sub = substring(it, itr);
    itr.next();
    return sub;
}

function scan_to(it, find) {
    if (typeof find === 'string') {
        while (!it.end() && it.value !== find) {
            it.next();
        }
    } else if (find instanceof Map || find instanceof Set) {
        while (!it.end() && !find.has(it.value)) {
            it.next();
        }
    } else if (find instanceof Array) {
        while (!it.end() && !find.includes(it.value)) {
            it.next();
        }
    } else if (typeof find === 'function') {
        while (!it.end() && !find(it.value)) {
            it.next();
        }
    } else if ((typeof find === 'undefined' ? 'undefined' : _typeof(find)) === 'object') {
        while (!it.end() && !find.hasOwnProperty(it.value)) {
            it.next();
        }
    }
}

function scan_while(it, skip) {
    if (typeof skip === 'string') {
        while (!it.end() && it.value === skip) {
            it.next();
        }
    } else if (skip instanceof Map || skip instanceof Set) {
        while (!it.end() && skip.has(it.value)) {
            it.next();
        }
    } else if (skip instanceof Array) {
        while (!it.end() && skip.includes(it.value)) {
            it.next();
        }
    } else if (typeof skip === 'function') {
        while (!it.end() && skip(it.value)) {
            it.next();
        }
    } else if ((typeof skip === 'undefined' ? 'undefined' : _typeof(skip)) === 'object') {
        while (!it.end() && skip.hasOwnProperty(it.value)) {
            it.next();
        }
    }
}

function substring_scan(it, scan, find) {
    var i = it.clone();
    scan(it, find);

    return substring(i, it);
}

function substring_scan_to(it, find) {
    return substring_scan(it, scan_to, find);
}

function substring_scan_while(it, find) {
    return substring_scan(it, scan_while, find);
}