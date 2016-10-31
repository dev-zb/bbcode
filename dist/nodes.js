'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.NodeParser = exports.RootNode = exports.ContainerNode = exports.TextNode = exports.VoidNode = exports.Node = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stringIter = require('./string-iter');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * ==================== 
 *       Nodes
 * ==================== 
 */
var Node = function () {
    function Node() {
        _classCallCheck(this, Node);

        this.__line = 0;
        this.__column = 0;
    } // error reporting.


    _createClass(Node, [{
        key: 'format',
        value: function format(_format) {
            return '';
        }
    }, {
        key: 'discard_invalid',
        get: function get() {
            return false;
        } // discard invalid nodes [true] or write them to the top level node as text

    }]);

    return Node;
}();

// a node without children.


exports.Node = Node;

var VoidNode = exports.VoidNode = function (_Node) {
    _inherits(VoidNode, _Node);

    function VoidNode() {
        _classCallCheck(this, VoidNode);

        return _possibleConstructorReturn(this, (VoidNode.__proto__ || Object.getPrototypeOf(VoidNode)).apply(this, arguments));
    }

    return VoidNode;
}(Node);

// plain text


var TextNode = exports.TextNode = function (_VoidNode) {
    _inherits(TextNode, _VoidNode);

    _createClass(TextNode, null, [{
        key: 'add_sanitizer',
        value: function add_sanitizer(name, san) {
            TextNode.format_sanitizers.set(name, san);
        }
    }, {
        key: 'sanitize',
        value: function sanitize(name, text) {
            if (TextNode.format_sanitizers.has(name)) {
                return TextNode.format_sanitizers.get(name)(text);
            }
            return text;
        }
    }]);

    function TextNode(start, end) {
        _classCallCheck(this, TextNode);

        var _this2 = _possibleConstructorReturn(this, (TextNode.__proto__ || Object.getPrototypeOf(TextNode)).call(this));

        _this2.value = '';

        if (typeof start === 'string') {
            _this2.value = start;
        } else if (start instanceof _stringIter.string_iter) {
            _this2.value = (0, _stringIter.substring)(start, end) || '';
        }
        return _this2;
    }

    _createClass(TextNode, [{
        key: 'format',
        value: function format(fmt) {
            return TextNode.sanitize(fmt, this.value);
        }
    }, {
        key: 'length',
        get: function get() {
            return this.value.length;
        }
    }]);

    return TextNode;
}(VoidNode);

// a node with children


TextNode.format_sanitizers = new Map();

var ContainerNode = function (_Node2) {
    _inherits(ContainerNode, _Node2);

    function ContainerNode() {
        var _ref;

        var _temp, _this3, _ret;

        _classCallCheck(this, ContainerNode);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this3 = _possibleConstructorReturn(this, (_ref = ContainerNode.__proto__ || Object.getPrototypeOf(ContainerNode)).call.apply(_ref, [this].concat(args))), _this3), _this3.children = [], _temp), _possibleConstructorReturn(_this3, _ret);
    }

    _createClass(ContainerNode, [{
        key: 'add_child',
        value: function add_child(c) {
            if (c instanceof TextNode && c.length <= 0) return false;

            this.children.push(c);
            return true;
        }
    }, {
        key: 'remove_child',
        value: function remove_child(ch) {
            var i = this.children.indexOf(ch);
            this.children.splice(i, 1);
        }
    }, {
        key: 'clear_children',
        value: function clear_children() {
            this.children = [];
        }
    }, {
        key: 'clone',
        value: function clone() {
            var deep = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            var n = new ContainerNode();
            if (deep) {
                n.children = this._clone_children(deep);
            }

            return n;
        }
    }, {
        key: '_clone_children',
        value: function _clone_children(deep) {
            var chld = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var c = _step.value;

                    chld.push(c.clone(deep));
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

            return chld;
        }
    }, {
        key: 'terminate',
        value: function terminate() {
            return false;
        }
    }, {
        key: 'format',
        value: function format(_format2) {
            return this.children.map(function (c) {
                if (c.format) return c.format(_format2);
                return '';
            }).join('');
        }
    }]);

    return ContainerNode;
}(Node);

// root of parsed result


exports.ContainerNode = ContainerNode;

var RootNode = exports.RootNode = function (_ContainerNode) {
    _inherits(RootNode, _ContainerNode);

    function RootNode() {
        _classCallCheck(this, RootNode);

        return _possibleConstructorReturn(this, (RootNode.__proto__ || Object.getPrototypeOf(RootNode)).apply(this, arguments));
    }

    return RootNode;
}(ContainerNode);

var NodeParser = exports.NodeParser = function () {
    function NodeParser(delim) {
        _classCallCheck(this, NodeParser);

        this.start_delim = delim;
    }

    _createClass(NodeParser, [{
        key: 'parse',
        value: function parse(str) {
            return null;
        }
    }]);

    return NodeParser;
}();