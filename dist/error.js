'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.NullError = exports.NodeParseError = exports.ParseError = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodes = require('./nodes');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 
 */
var ParseError = exports.ParseError = function () {
    function ParseError(error, line, column) {
        _classCallCheck(this, ParseError);

        this.line = line || 0;
        this.column = column || 0;
        this.error = error || '';
    }

    _createClass(ParseError, [{
        key: 'toString',
        value: function toString() {
            return '[' + this.line + ':' + this.column + '] ' + this.error;
        }
    }]);

    return ParseError;
}();

var NodeParseError = exports.NodeParseError = function (_ParseError) {
    _inherits(NodeParseError, _ParseError);

    function NodeParseError(error, node, line, column) {
        _classCallCheck(this, NodeParseError);

        var _this = _possibleConstructorReturn(this, (NodeParseError.__proto__ || Object.getPrototypeOf(NodeParseError)).call(this, error, (typeof line === 'number' ? line : node.__line) || 0, (typeof column === 'number' ? column : node.__column) || 0));

        _this.node = node instanceof _nodes.Node ? node : { name: node || '' };
        return _this;
    }

    _createClass(NodeParseError, [{
        key: 'toString',
        value: function toString() {
            return _get(NodeParseError.prototype.__proto__ || Object.getPrototypeOf(NodeParseError.prototype), 'toString', this).call(this) + (' (' + this.node.name + ')');
        }
    }]);

    return NodeParseError;
}(ParseError);

var NullError = exports.NullError = function NullError() {
    _classCallCheck(this, NullError);
}; // error to be ignored.