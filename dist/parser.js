'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Parser = exports.itr_ex = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _helper = require('./helper');

var _stack = require('./stack');

var _stringIter = require('./string-iter');

var _nodes = require('./nodes');

var _error2 = require('./error');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var itr_ex = exports.itr_ex = function (_string_iter) {
    _inherits(itr_ex, _string_iter);

    function itr_ex(str) {
        var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        _classCallCheck(this, itr_ex);

        var _this = _possibleConstructorReturn(this, (itr_ex.__proto__ || Object.getPrototypeOf(itr_ex)).call(this, str, index));

        _this._state = str instanceof itr_ex ? str._state : state || { __line: 0, __column: 0 };
        return _this;
    }

    _createClass(itr_ex, [{
        key: '_update_loc',
        value: function _update_loc() {
            ++this._state.__column;
            if (this.value === '\n') {
                ++this._state.__line;
                this._state.__column = 0;
            }
        }
    }, {
        key: 'next',
        value: function next() {
            _get(itr_ex.prototype.__proto__ || Object.getPrototypeOf(itr_ex.prototype), 'next', this).call(this);
            this._update_loc();
        }
    }, {
        key: 'clone',
        value: function clone() {
            return new itr_ex(this);
        }
    }, {
        key: 'line',
        get: function get() {
            return this._state.__line;
        },
        set: function set(v) {
            this._state.__line = v;
        }
    }, {
        key: 'column',
        get: function get() {
            return this._state.__column;
        },
        set: function set(v) {
            this._state.__column = v;
        }
    }]);

    return itr_ex;
}(_stringIter.string_iter);

/**
 * ==================== 
 *      Parser
 * ==================== 
 */


var Parser = exports.Parser = function () {
    function Parser(types) {
        var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Parser);

        this.config = {};
        this.node_stack = new _stack.stack();
        this.__line = 0;
        this.__column = 0;
        this.errors = [];

        Object.assign(this.config, Parser.default_config, config);

        this.config.types = new Map();
        if (types) {
            types = (0, _helper.ensure_array)(types);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = types[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var t = _step.value;

                    this.add_type(t);
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
        }
    }

    /**
     * Add a parsable type
     * @param delim single character that tells the parser call the type parser
     * @param type_parser class with a parse method: parse( iterator, main_parser ) 
     */


    // error reporting


    _createClass(Parser, [{
        key: 'add_type',
        value: function add_type(type_parser) {
            this.config.types.set(type_parser.start_delim, type_parser);
        }

        /**
         * Parse string
         * @param txt string to parse
         * @return root node of a parsed tree.
         */

    }, {
        key: 'parse',
        value: function parse(txt) {
            if (!txt) {
                return new _nodes.RootNode();
            }

            var itr = new itr_ex(txt, this);

            var root_node = new _nodes.RootNode();

            this.node_stack.clear();
            this.node_stack.push(root_node);

            this.errors = [];
            this.__line = 0;
            this.__column = 0;

            var text_itr = itr.clone();

            var node = null;
            var text = null;
            while (!itr.end()) {
                // find the next node
                try {
                    this.scan_node(itr);

                    // save possible text range
                    text = new _nodes.TextNode(text_itr, itr);

                    // parse node will modify the given iterator
                    if (node = this.parse_node(itr)) // parse the node ( [tag] or anything, not the contents )
                        {
                            var top = this.node_stack.back();
                            top.add_child(text);

                            var mod = false;
                            if (this.is_void(node) || !node.terminating) {
                                mod = this.add_node(node);
                            } else if (node.terminating) // a closing node
                                {
                                    mod = this.terminate_node(node);
                                }

                            if (!mod && !this.node_stack.back().discard_invalid) {
                                // stack was not modified and no children were added to top. remove last text node.
                                top.remove_child(text);
                            } else {
                                text_itr = itr.clone();
                            }
                        }
                } catch (error) {
                    this._add_error(error);
                }
            }

            // add any unclaimed text
            if (text_itr.diff(itr)) {
                this.node_stack.back().add_child(new _nodes.TextNode(text_itr, itr));
            }

            // 
            this.node_stack.clear();

            return root_node;
        }
    }, {
        key: '_add_error',
        value: function _add_error(err) {
            if (err instanceof _error2.NullError) return null;

            if (!(err instanceof _error2.ParseError)) {
                err = new _error2.ParseError(err.toString(), this.__line, this.__column);
            }
            this.errors.push(err);
            return err;
        }
    }, {
        key: '_error_n',
        value: function _error_n(msg, node) {
            return this._add_error(new _error2.NodeParseError(msg, node));
        }
    }, {
        key: '_error',
        value: function _error(msg, line, column) {
            return this._add_error(new _error2.ParseError(line || 0, column || 0, msg));
        }

        /**
         * attempt to add node to the top node & stack.
         */

    }, {
        key: 'add_node',
        value: function add_node(node) {
            var change = false; // change to node_stack or top node child list?

            // attempt to add child to current top node. ._.
            var result = this.node_stack.back().add_child(node);
            if (result === true) {
                if (!this.is_void(node)) {
                    this.node_stack.push(node); // new top
                }
                change = true;
            } else if (result === node) {
                // add_child returns the given node when it terminates the parent.
                change = this.terminate_node(this.node_stack.back(), node);
            } else {
                // invalid child & not a terminating node.
                //      see if there is a node we can terminate.
                var find = this.node_stack.find(node, this._find_terminate);

                // terminable node found.
                if (find) {
                    change = this.terminate_node(find, node);
                } else if (this.node_stack.back().discard_invalid) {
                    this._error_n('Invalid child node', node);
                }
            }

            return change;
        }
    }, {
        key: '_find_terminate',
        value: function _find_terminate(n, t) {
            return t.terminate(n);
        }

        /**
         * terminate a node
         * @param node node to terminate
         * @param inject [optional] node to inject right after node termination.
         */

    }, {
        key: 'terminate_node',
        value: function terminate_node(node, inject) {
            // find opening node in stack
            var tmp_stack = new _stack.stack();
            var found = null;

            var top = this.node_stack.back();

            // look for [node] in the node_stack. store popped nodes in another stack.
            while (!found) {
                if (this.node_stack.back() instanceof _nodes.RootNode) break; // root is never removed.

                var t = this.node_stack.pop();
                if (this.compare(t, node)) {
                    found = t;
                } else {
                    tmp_stack.push(t);
                }
            }

            if (found) {
                // target node now off the node_stack and complete.

                if (inject) {
                    this.add_node(inject); // right after closing of [node].
                }

                // handle other removed nodes
                while (tmp_stack.size) {
                    var n = tmp_stack.pop();

                    // overflow nodes continue in the new top (if possible).
                    if (n.overflow) {
                        this._error_n('Misnested node', n);
                        if (n.clone) {
                            n = n.clone();
                            if (this.node_stack.back().add_child(n) === true) // add as child to the current stack top
                                {
                                    this.node_stack.push(n); // make new stack top (parent)
                                }
                        }
                    } else {
                        this._error_n('Node terminated by parent', n);
                    }
                }
            } else // unmatched terminating node 
                {
                    this.node_stack.push_col(tmp_stack); // return stack to normal
                    this._error_n('Unmatched terminating node', node);
                }

            return !!found;
        }

        /**
         * Walk forward until a node type character is found
         */

    }, {
        key: 'scan_node',
        value: function scan_node(itr) {
            (0, _stringIter.scan_to)(itr, this.config.types);
        }

        /**
         * Call a node parser (if available)
         */

    }, {
        key: 'parse_node',
        value: function parse_node(itr) {
            // type determines how the rest is parsed.
            var type = this.config.types.get(itr.value);

            // parse method is required.
            if (!type || !('parse' in type)) {
                return null;
            }

            return type.parse(itr, this);
        }

        /**
         * Check if a parsed node is a void node. (self-completing node)
         */

    }, {
        key: 'is_void',
        value: function is_void(node) {
            return node instanceof _nodes.VoidNode || node.is_void;
        }

        /**
         * Compares two nodes.
         */

    }, {
        key: 'compare',
        value: function compare(n1, n2) {
            return typeof n1.compare === 'function' ? n1.compare(n2) : n1 === n2;
        }
    }, {
        key: 'is_whitespace',
        value: function is_whitespace(c) {
            return this.config.whitespace.includes(c);
        }

        /**
         * Step iterator until a non-whitespace character is found
         */

    }, {
        key: 'skip_whitespace',
        value: function skip_whitespace(itr) {
            (0, _stringIter.scan_while)(itr, this.config.whitespace);
        }

        /**
         * Scan until whitespace
         */

    }, {
        key: 'to_whitespace',
        value: function to_whitespace(itr) {
            (0, _stringIter.scan_to)(itr, this.config.whitespace);
        }
    }, {
        key: 'identifier_parse',
        value: function identifier_parse(itr, validate) {
            if (!validate) {
                validate = _helper.valid_identifier;
            }

            if (!validate(itr.value, true)) {
                return '';
            }

            var it = itr.clone();
            itr.next();
            (0, _stringIter.scan_while)(itr, validate);

            return (0, _stringIter.substring)(it, itr).toLowerCase();
        }
    }]);

    return Parser;
}();

Parser.default_config = {
    types: new Map(), // parsable types
    whitespace: ['\t', '\n', '\x0B', '\f', '\r', ' ', '\x85', '\xA0', '\u1680', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200A', '\u2028', '\u2029', '\u202F', '\u205F', '\u3000']

};