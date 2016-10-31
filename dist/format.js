'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.html_format = exports.bbcode_format = exports.Format = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodes = require('./nodes');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function no_san(v) {
    return v;
}

var Format = exports.Format = function () {
    function Format(name, quote, lbracket, rbracket, eq, self_attribute, sanitize) {
        _classCallCheck(this, Format);

        this.name = name;
        this.quote = quote;
        this.l_bracket = lbracket;
        this.r_bracket = rbracket;
        this.eq = eq;
        this.term = '/';
        this.self_attribute = self_attribute;

        _nodes.TextNode.add_sanitizer(name, sanitize || no_san);
    }

    _createClass(Format, [{
        key: 'sanitize',
        value: function sanitize(text) {
            _nodes.TextNode.sanitize(this.name, text);
        }
    }]);

    return Format;
}();

var bbcode_format = exports.bbcode_format = new Format('bbcode', null, '[', ']', '=', true);
var html_format = exports.html_format = new Format('html', '"', '<', '>', '=', false, function (text) {
    var str = '';
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = text[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var c = _step.value;

            var cp = c.codePointAt(0);
            if (cp <= 32 && cp >= 9 || cp >= 48 && cp <= 57 || cp >= 65 && cp <= 90 || cp >= 97 && cp <= 122) {
                str += c;
            } else {
                str += '&#' + cp + ';';
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return str;
});