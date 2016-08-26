System.register([], function (_export, _context) {
    "use strict";

    return {
        setters: [],
        execute: function () {
            define(['exports', './helper', './stack', './iter', './string', './nodes'], function (exports, _helper, _stack, _iter, _string, _nodes) {
                'use strict';

                exports.__esModule = true;
                exports.Parser = exports.ParseError = exports.VoidNode = exports.TextNode = exports.RootNode = exports.string = exports.iter = exports.stack = undefined;

                function _classCallCheck(instance, Constructor) {
                    if (!(instance instanceof Constructor)) {
                        throw new TypeError("Cannot call a class as a function");
                    }
                }

                exports.stack = _stack.stack;
                exports.iter = _iter.iter;
                exports.string = _string.string;
                exports.RootNode = _nodes.RootNode;
                exports.TextNode = _nodes.TextNode;
                exports.VoidNode = _nodes.VoidNode;

                var ParseError = exports.ParseError = function () {
                    function ParseError(line, column, error) {
                        _classCallCheck(this, ParseError);

                        this.line = line;
                        this.column = column;
                        this.error = error;
                    }

                    ParseError.prototype.toString = function toString() {
                        return '[' + this.line + ':' + this.column + '] ' + this.error;
                    };

                    return ParseError;
                }();

                var Parser = exports.Parser = function () {
                    function Parser(types) {
                        var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

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
                            for (var _iterator = types, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                                var _ref;

                                if (_isArray) {
                                    if (_i >= _iterator.length) break;
                                    _ref = _iterator[_i++];
                                } else {
                                    _i = _iterator.next();
                                    if (_i.done) break;
                                    _ref = _i.value;
                                }

                                var t = _ref;

                                this.add_type(t);
                            }
                        }
                    }

                    Parser.prototype.add_type = function add_type(type_parser) {
                        this.config.types.set(type_parser.start_delim, type_parser);
                    };

                    Parser.prototype.parse = function parse(txt) {
                        var _this = this;

                        if (!txt) {
                            return new _nodes.RootNode();
                        }

                        var str = new _string.string(txt);
                        var itr = str.begin();

                        var itr_next = itr.next;
                        itr.next = function () {
                            itr_next.call(itr);_this._update_line(itr);
                        };

                        var root_node = new _nodes.RootNode();

                        this.node_stack.clear();
                        this.node_stack.push(root_node);

                        this.errors = [];
                        this.__line = 0;
                        this.__column = 0;

                        var text_itr = itr.clone();

                        while (!itr.eof()) {
                            this.scan_node(itr);

                            var text = new _nodes.TextNode(text_itr, itr);

                            var node = this.parse_node(itr);

                            if (node) {
                                var top = this.node_stack.back();
                                top.add_child(text);

                                var mod = false;
                                if (this.is_void(node) || !node.terminating) {
                                    mod = this.add_node(node);
                                } else if (node.terminating) {
                                        mod = this.terminate_node(node);
                                    }

                                if (!mod && !this.node_stack.back().discard_invalid) {
                                    top.remove_child(text);
                                } else {
                                    text_itr = itr.clone();
                                }
                            }
                        }

                        if (text_itr.diff(itr)) {
                            this.node_stack.back().add_child(new _nodes.TextNode(text_itr, itr));
                        }

                        this.node_stack.clear();

                        return root_node;
                    };

                    Parser.prototype._update_line = function _update_line(itr) {
                        ++this.__column;
                        if (itr.value === '\n') {
                            ++this.__line;
                            this.__column = 0;
                        }
                    };

                    Parser.prototype._error_n = function _error_n(msg, node) {
                        return this._error(msg, node.__line, node.__column, node.name);
                    };

                    Parser.prototype._error = function _error(msg, line, column, name) {
                        var er = new ParseError(line || 0, column || 0, msg + ' (' + name + ')');
                        this.errors.push(er);
                        return er;
                    };

                    Parser.prototype.add_node = function add_node(node) {
                        var change = false;
                        var result = this.node_stack.back().add_child(node);
                        if (result === true) {
                            if (!this.is_void(node)) {
                                this.node_stack.push(node);
                            }
                            change = true;
                        } else if (result === node) {
                            change = this.terminate_node(this.node_stack.back(), node);
                        } else {
                            var find = this.node_stack.find(node, this._find_terminate);

                            if (find) {
                                change = this.terminate_node(find, node);
                            } else if (this.node_stack.back().discard_invalid) {
                                this._error_n('Invalid child node', node);
                            }
                        }

                        return change;
                    };

                    Parser.prototype._find_terminate = function _find_terminate(n, t) {
                        return t.terminate(n);
                    };

                    Parser.prototype.terminate_node = function terminate_node(node, inject) {
                        var tmp_stack = new _stack.stack();
                        var found = null;

                        var top = this.node_stack.back();

                        while (!found) {
                            if (this.node_stack.back() instanceof _nodes.RootNode) break;

                            var t = this.node_stack.pop();
                            if (this.compare(t, node)) {
                                found = t;
                            } else {
                                tmp_stack.push(t);
                            }
                        }

                        if (found) {

                            if (inject) {
                                this.add_node(inject);
                            }

                            while (tmp_stack.size()) {
                                var n = tmp_stack.pop();

                                if (n.overflow) {
                                    this._error_n('Misnested node', n);
                                    if (n.clone) {
                                        n = n.clone();
                                        if (this.node_stack.back().add_child(n) === true) {
                                                this.node_stack.push(n);
                                            }
                                    }
                                } else {
                                    this._error_n('Node terminated by parent', n);
                                }
                            }
                        } else {
                                this.node_stack.push_move(tmp_stack);
                                this._error_n('Unmatched terminating node', node);
                            }

                        return !!found;
                    };

                    Parser.prototype.scan_node = function scan_node(itr) {
                        this.scan_to(itr, this.config.types);
                    };

                    Parser.prototype.parse_node = function parse_node(itr) {
                        var type = this.config.types.get(itr.value);

                        if (!type || !('parse' in type)) {
                            return null;
                        }

                        return type.parse(itr, this);
                    };

                    Parser.prototype.is_void = function is_void(node) {
                        return node instanceof _nodes.VoidNode || node.is_void;
                    };

                    Parser.prototype.compare = function compare(n1, n2) {
                        return typeof n1.compare === 'function' ? n1.compare(n2) : n1 === n2;
                    };

                    Parser.prototype.is_whitespace = function is_whitespace(c) {
                        return this.config.whitespace.includes(c);
                    };

                    Parser.prototype.skip_whitespace = function skip_whitespace(itr) {
                        this.scan_while(itr, this.config.whitespace);
                    };

                    Parser.prototype.to_whitespace = function to_whitespace(itr) {
                        this.scan_to(itr, this.config.whitespace);
                    };

                    Parser.valid_identifier = function valid_identifier(c) {
                        var start = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

                        return c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z' || c >= '0' && c <= '9' || !start && c === '-';
                    };

                    Parser.prototype.identifier_parse = function identifier_parse(itr, validate) {
                        if (!validate) {
                            validate = Parser.valid_identifier;
                        }

                        if (!validate(itr.value, true)) {
                            return '';
                        }

                        var it = itr.clone();
                        itr.next();
                        this.scan_while(itr, validate);

                        return _string.string.make_string(it, itr).toLowerCase();
                    };

                    Parser.prototype.scan_to = function scan_to(it, find) {
                        if (find instanceof Map || find instanceof Set) {
                            while (!it.eof() && !find.has(it.value)) {
                                it.next();
                            }
                        } else if (find instanceof Array) {
                            while (!it.eof() && !find.includes(it.value)) {
                                it.next();
                            }
                        } else if (typeof find === 'function') {
                            while (!it.eof() && !find(it.value)) {
                                it.next();
                            }
                        } else {
                                while (!it.eof() && it.value != find) {
                                    it.next();
                                }
                            }
                    };

                    Parser.prototype.scan_while = function scan_while(it, skip) {
                        if (skip instanceof Map || skip instanceof Set) {
                            while (!it.eof() && skip.has(it.value)) {
                                it.next();
                            }
                        } else if (skip instanceof Array) {
                            while (!it.eof() && skip.includes(it.value)) {
                                it.next();
                            }
                        } else if (typeof skip === 'function') {
                            while (!it.eof() && skip(it.value)) {
                                it.next();
                            }
                        } else {
                                while (!it.eof() && it.value === skip) {
                                    it.next();
                                }
                            }
                    };

                    return Parser;
                }();

                Parser.default_config = {
                    types: new Map(),
                    whitespace: ['\t', '\n', '\u000b', '\f', '\r', ' ', '', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '\u2028', '\u2029', ' ', ' ', '　']

                };
            });
        }
    };
});