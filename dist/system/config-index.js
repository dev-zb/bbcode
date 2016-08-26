System.register([], function (_export2, _context2) {
  "use strict";

  return {
    setters: [],
    execute: function () {
      define([], function () {
        "use strict";

        System.register([], function (_export, _context) {
          "use strict";

          function is_array(v) {
            return v instanceof Array;
          }

          _export("is_array", is_array);

          function ensure_array(v) {
            return is_array(v) ? v : [v];
          }

          _export("ensure_array", ensure_array);

          function is_itr(v) {
            return !!v[Symbol.iterator];
          }

          _export("is_itr", is_itr);

          return {
            setters: [],
            execute: function () {}
          };
        });
      });
    }
  };
});
System.register([], function (_export2, _context2) {
    "use strict";

    return {
        setters: [],
        execute: function () {
            define([], function () {
                'use strict';

                System.register(['./helper', './stack', './iter', './string', './nodes'], function (_export, _context) {
                    "use strict";

                    var ensure_array, stack, iter, string, RootNode, TextNode, VoidNode, ParseError, Parser;

                    function _classCallCheck(instance, Constructor) {
                        if (!(instance instanceof Constructor)) {
                            throw new TypeError("Cannot call a class as a function");
                        }
                    }

                    return {
                        setters: [function (_helper) {
                            ensure_array = _helper.ensure_array;
                        }, function (_stack) {
                            stack = _stack.stack;
                        }, function (_iter) {
                            iter = _iter.iter;
                        }, function (_string) {
                            string = _string.string;
                        }, function (_nodes) {
                            RootNode = _nodes.RootNode;
                            TextNode = _nodes.TextNode;
                            VoidNode = _nodes.VoidNode;
                        }],
                        execute: function () {
                            _export('stack', stack);

                            _export('iter', iter);

                            _export('string', string);

                            _export('RootNode', RootNode);

                            _export('TextNode', TextNode);

                            _export('VoidNode', VoidNode);

                            _export('ParseError', ParseError = function () {
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
                            }());

                            _export('ParseError', ParseError);

                            _export('Parser', Parser = function () {
                                function Parser(types) {
                                    var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                                    _classCallCheck(this, Parser);

                                    this.config = {};
                                    this.node_stack = new stack();
                                    this.__line = 0;
                                    this.__column = 0;
                                    this.errors = [];

                                    Object.assign(this.config, Parser.default_config, config);

                                    this.config.types = new Map();
                                    if (types) {
                                        types = ensure_array(types);
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
                                        return new RootNode();
                                    }

                                    var str = new string(txt);
                                    var itr = str.begin();

                                    var itr_next = itr.next;
                                    itr.next = function () {
                                        itr_next.call(itr);_this._update_line(itr);
                                    };

                                    var root_node = new RootNode();

                                    this.node_stack.clear();
                                    this.node_stack.push(root_node);

                                    this.errors = [];
                                    this.__line = 0;
                                    this.__column = 0;

                                    var text_itr = itr.clone();

                                    while (!itr.eof()) {
                                        this.scan_node(itr);

                                        var text = new TextNode(text_itr, itr);

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
                                        this.node_stack.back().add_child(new TextNode(text_itr, itr));
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
                                    var tmp_stack = new stack();
                                    var found = null;

                                    var top = this.node_stack.back();

                                    while (!found) {
                                        if (this.node_stack.back() instanceof RootNode) break;

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
                                    return node instanceof VoidNode || node.is_void;
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

                                    return string.make_string(it, itr).toLowerCase();
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
                            }());

                            _export('Parser', Parser);

                            Parser.default_config = {
                                types: new Map(),
                                whitespace: ['\t', '\n', '\u000b', '\f', '\r', ' ', '', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '\u2028', '\u2029', ' ', ' ', '　']

                            };
                        }
                    };
                });
            });
        }
    };
});
System.register([], function (_export2, _context2) {
    "use strict";

    return {
        setters: [],
        execute: function () {
            define([], function () {
                'use strict';

                System.register(['./parser', './nodes', './string', './helper', './def', './format'], function (_export, _context) {
                    "use strict";

                    var Parser, ParseError, VoidNode, NodeParser, ContainerNode, TextNode, string, ensure_array, is_itr, TagDefinition, bbcode_format, _createClass, TagAttribute, TagNode, TagParser;

                    function _possibleConstructorReturn(self, call) {
                        if (!self) {
                            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                        }

                        return call && (typeof call === "object" || typeof call === "function") ? call : self;
                    }

                    function _inherits(subClass, superClass) {
                        if (typeof superClass !== "function" && superClass !== null) {
                            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
                        }

                        subClass.prototype = Object.create(superClass && superClass.prototype, {
                            constructor: {
                                value: subClass,
                                enumerable: false,
                                writable: true,
                                configurable: true
                            }
                        });
                        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
                    }

                    function _classCallCheck(instance, Constructor) {
                        if (!(instance instanceof Constructor)) {
                            throw new TypeError("Cannot call a class as a function");
                        }
                    }

                    return {
                        setters: [function (_parser) {
                            Parser = _parser.Parser;
                            ParseError = _parser.ParseError;
                        }, function (_nodes) {
                            VoidNode = _nodes.VoidNode;
                            NodeParser = _nodes.NodeParser;
                            ContainerNode = _nodes.ContainerNode;
                            TextNode = _nodes.TextNode;
                        }, function (_string) {
                            string = _string.string;
                        }, function (_helper) {
                            ensure_array = _helper.ensure_array;
                            is_itr = _helper.is_itr;
                        }, function (_def) {
                            TagDefinition = _def.TagDefinition;
                        }, function (_format3) {
                            bbcode_format = _format3.bbcode_format;
                        }],
                        execute: function () {
                            _createClass = function () {
                                function defineProperties(target, props) {
                                    for (var i = 0; i < props.length; i++) {
                                        var descriptor = props[i];
                                        descriptor.enumerable = descriptor.enumerable || false;
                                        descriptor.configurable = true;
                                        if ("value" in descriptor) descriptor.writable = true;
                                        Object.defineProperty(target, descriptor.key, descriptor);
                                    }
                                }

                                return function (Constructor, protoProps, staticProps) {
                                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                                    if (staticProps) defineProperties(Constructor, staticProps);
                                    return Constructor;
                                };
                            }();

                            _export('TagAttribute', TagAttribute = function () {
                                function TagAttribute(value, def, parent) {
                                    _classCallCheck(this, TagAttribute);

                                    this.quote = '';

                                    this.def = def;
                                    this.parent = parent;
                                    this.value = value;
                                }

                                TagAttribute.escape_value = function escape_value(value) {
                                    return JSON.stringify(value).slice(1, -1);
                                };

                                TagAttribute.prototype.is_valid = function is_valid() {
                                    return !this.def || this.def.valid_value(this.value);
                                };

                                TagAttribute.prototype.format = function format(_format) {
                                    return this.def.format(_format, this.value, this);
                                };

                                _createClass(TagAttribute, [{
                                    key: 'name',
                                    get: function get() {
                                        return this.def.name;
                                    }
                                }, {
                                    key: 'value',
                                    get: function get() {
                                        return this._value;
                                    },
                                    set: function set() {
                                        var v = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

                                        this._value = this.def && this.def.validate ? this.def.validate(v) : v;
                                    }
                                }]);

                                return TagAttribute;
                            }());

                            _export('TagAttribute', TagAttribute);

                            _export('TagNode', TagNode = function (_ContainerNode) {
                                _inherits(TagNode, _ContainerNode);

                                function TagNode(def) {
                                    var closing = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

                                    _classCallCheck(this, TagNode);

                                    var _this = _possibleConstructorReturn(this, _ContainerNode.call(this));

                                    _this.attributes = new Map();


                                    if (!def) {
                                        throw new Error('TagNode requires a TagDefinition');
                                    }

                                    _this.def = def;
                                    _this.terminating = closing;return _this;
                                }

                                TagNode.prototype.add_child = function add_child(node) {
                                    var allowed = this.def.valid_child(node);

                                    if (allowed === true) {
                                        this.children.push(node);
                                    }

                                    return allowed;
                                };

                                TagNode.prototype.add_attribute = function add_attribute(attr) {
                                    if (this.def.valid_attribute(attr)) {
                                        this.attributes.set(attr.name, attr);
                                        return true;
                                    }
                                    return false;
                                };

                                TagNode.prototype.compare = function compare(to) {
                                    return this.def.name === to.def.name || this.def.closing_name === to.def.name;
                                };

                                TagNode.prototype.clone = function clone() {
                                    var deep = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

                                    var cln = new TagNode(this.def, this.terminating);
                                    cln.attributes = new Map(this.attributes);

                                    if (deep) {
                                        cln.children = this._clone_children(deep);
                                    }

                                    return cln;
                                };

                                TagNode.prototype.format = function format(_format2) {
                                    return this.def.format(_format2, this.children, this.attributes, this);
                                };

                                TagNode.prototype.terminate = function terminate(node) {
                                    if (this.def.terminate) {
                                        if (node instanceof TagNode) {
                                            return this.def.terminate.has(node.name);
                                        } else if (typeof node === 'string') {
                                            return this.def.terminate.has(node);
                                        }
                                    }

                                    return false;
                                };

                                _createClass(TagNode, [{
                                    key: 'name',
                                    get: function get() {
                                        return this.def.name;
                                    }
                                }, {
                                    key: 'is_void',
                                    get: function get() {
                                        return !!this.def.is_void;
                                    }
                                }, {
                                    key: 'overflow',
                                    get: function get() {
                                        return !!this.def.overflow;
                                    }
                                }, {
                                    key: 'discard_invalid',
                                    get: function get() {
                                        return !!this.def.discard_invalid;
                                    }
                                }]);

                                return TagNode;
                            }(ContainerNode));

                            _export('TagNode', TagNode);

                            _export('TagParser', TagParser = function (_NodeParser) {
                                _inherits(TagParser, _NodeParser);

                                function TagParser(tags, format) {
                                    var config = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

                                    _classCallCheck(this, TagParser);

                                    var _this2 = _possibleConstructorReturn(this, _NodeParser.call(this, format ? format.l_bracket : TagParser.default_format.l_bracket));

                                    _this2.tag_defs = new Map();
                                    _this2.valid_chars = new Set();


                                    _this2.create_tag = config.tag || TagParser._default_create_tag;
                                    _this2.create_attribute = config.attribute || TagParser._default_create_attribute;
                                    _this2.create_def = config.def || TagParser._default_create_def;
                                    _this2.parse_any = !!config.parse_any;

                                    _this2.format = format || TagParser.default_format;

                                    if (tags instanceof Map) {
                                        _this2.tag_defs = tags;
                                    } else if (tags) {
                                        tags = ensure_array(tags);
                                        for (var _iterator = tags, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
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

                                            _this2.add_tag(t);
                                        }
                                    } else {
                                        _this2.parse_any = true;
                                    }

                                    for (var _iterator2 = _this2.tag_defs, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
                                        var _ref2;

                                        if (_isArray2) {
                                            if (_i2 >= _iterator2.length) break;
                                            _ref2 = _iterator2[_i2++];
                                        } else {
                                            _i2 = _iterator2.next();
                                            if (_i2.done) break;
                                            _ref2 = _i2.value;
                                        }

                                        var _ref3 = _ref2;
                                        var n = _ref3[0];
                                        var _t = _ref3[1];

                                        for (var _iterator3 = n, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
                                            var _ref4;

                                            if (_isArray3) {
                                                if (_i3 >= _iterator3.length) break;
                                                _ref4 = _iterator3[_i3++];
                                            } else {
                                                _i3 = _iterator3.next();
                                                if (_i3.done) break;
                                                _ref4 = _i3.value;
                                            }

                                            var c = _ref4;

                                            if (!Parser.valid_identifier(c)) {
                                                _this2.valid_chars.add(c);
                                            }
                                        }
                                    }
                                    return _this2;
                                }

                                TagParser._default_create_def = function _default_create_def(name) {
                                    return new TagDefinition(name);
                                };

                                TagParser._default_create_tag = function _default_create_tag(def, closing, line, column) {
                                    var t = new TagNode(def, closing);
                                    t.__line = line;
                                    t.__column = column;
                                    return t;
                                };

                                TagParser._default_create_attribute = function _default_create_attribute(value, def, parent, line, column) {
                                    var a = new TagAttribute(value, def, parent);
                                    a.__line = line;
                                    a.__column = column;
                                    return a;
                                };

                                TagParser.valid_value_char = function valid_value_char(c) {
                                    return Parser.valid_identifier(c, true);
                                };

                                TagParser.prototype.add_tag = function add_tag(def) {
                                    this.tag_defs.set(def.name, def);
                                };

                                TagParser.prototype.remove_tag = function remove_tag(name) {
                                    var def = this.tag_defs.get(name);
                                    this.tag_defs.delete(name);
                                    return def;
                                };

                                TagParser.prototype.value_parse = function value_parse(itr, attrib, parser) {
                                    if (TagParser.quotes.includes(itr.value)) {
                                        var quote = itr.value;
                                        attrib.quote = quote;

                                        var it = itr.clone();
                                        it.next();

                                        var sc = 0;
                                        while (!itr.eof()) {
                                            itr.next();
                                            if (itr.value === '\\') {
                                                ++sc;
                                            } else {
                                                if (itr.value === quote && !(sc % 2)) break;
                                                sc = 0;
                                            }
                                        }

                                        var ret = string.make_string(it, itr);
                                        itr.next();
                                        return ret;
                                    } else {
                                        var v = TagParser.valid_value_char;
                                        if (attrib.def && attrib.def.valid_char) {
                                            v = attrib.def.valid_char;
                                        }
                                        return parser.identifier_parse(itr, v);
                                    }
                                };

                                TagParser.prototype.attribute_parse = function attribute_parse(itr, tag, parser) {
                                    var line = parser.__line;
                                    var column = parser.__column;

                                    var name = parser.identifier_parse(itr);
                                    if (!name) {
                                        return parser._error('Invalid attribute name (' + name + ') in tag', line, column, tag.name);
                                    }

                                    var adef = tag.def.get_attribute(name);
                                    if (!adef) {
                                        parser._error('Attribute "' + name + '" is not allowed in tag', line, column, tag.name);
                                    }

                                    var attrib = this.create_attribute(null, adef, tag, line, column);

                                    parser.skip_whitespace(itr);
                                    if (itr.value !== this.format.eq) {
                                        if (!adef) return null;

                                        if (adef.require_value) {
                                            return parser._error_n('Attribute missing required value', attrib);
                                        }

                                        return attrib;
                                    }

                                    itr.next();
                                    attrib.value = this.value_parse(itr, attrib, parser);
                                    if (adef && !attrib.is_valid()) {
                                        return parser._error_n('Attribute missing required value', attrib);
                                    }

                                    if (!adef) return null;
                                    return attrib;
                                };

                                TagParser.prototype.parse_name = function parse_name(itr, parser) {
                                    var it = itr.clone();
                                    while (!itr.eof() && (Parser.valid_identifier(itr.value) || this.valid_chars.has(itr.value))) {
                                        itr.next();
                                    }

                                    return string.make_string(it, itr).toLowerCase();
                                };

                                TagParser.prototype._get_def = function _get_def(name) {
                                    var def = this.tag_defs.get(name);
                                    if (!def) {
                                        if (this.parse_any) {
                                            if (parser.is_whitespace(itr.value) || this.self_attribute && itr.value === '=') {
                                                return this.create_def(name);
                                            }
                                        }
                                        return null;
                                    }

                                    return def;
                                };

                                TagParser.prototype.parse = function parse(itr, parser) {
                                    if (itr.value !== this.format.l_bracket) return null;

                                    var line = parser.__line;
                                    var column = parser.__column;
                                    itr.next();

                                    var closing = false;
                                    if (closing = itr.value === this.format.term) {
                                        itr.next();
                                    }

                                    var it = itr.clone();
                                    var name = this.parse_name(itr, parser);

                                    var def = this._get_def(name);
                                    var tag = this.create_tag(def, closing, line, column);

                                    if (closing) {
                                        parser.skip_whitespace(itr);
                                        if (itr.value !== this.format.r_bracket) {
                                            parser._error_n('Malformed Closing Tag: missing ' + this.format.r_bracket, tag);
                                            return null;
                                        }
                                        itr.next();
                                        return tag;
                                    }

                                    if (itr.value === this.format.eq && this.format.self_attribute) {
                                        itr.set(it);
                                    }

                                    while (!itr.eof()) {
                                        parser.skip_whitespace(itr);

                                        if (itr.value === this.format.r_bracket) {
                                            break;
                                        }

                                        var attrib = this.attribute_parse(itr, tag, parser);
                                        if (attrib instanceof TagAttribute) {
                                            tag.add_attribute(attrib);
                                        } else if (attrib instanceof ParseError) {
                                            return null;
                                        }
                                    }

                                    if (def.attributes) {
                                        for (var _iterator4 = def.attributes, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
                                            var _ref5;

                                            if (_isArray4) {
                                                if (_i4 >= _iterator4.length) break;
                                                _ref5 = _iterator4[_i4++];
                                            } else {
                                                _i4 = _iterator4.next();
                                                if (_i4.done) break;
                                                _ref5 = _i4.value;
                                            }

                                            var _ref6 = _ref5;
                                            var _name = _ref6[0];
                                            var a = _ref6[1];

                                            if (a.required && !tag.attributes.has(_name)) {
                                                var ta = new TagAttribute(null, a, tag);

                                                if (!ta.is_valid()) {
                                                    return null;
                                                }

                                                tag.add_attribute(ta);
                                            }
                                        }
                                    }

                                    itr.next();
                                    return tag;
                                };

                                return TagParser;
                            }(NodeParser));

                            _export('TagParser', TagParser);

                            TagParser.default_format = bbcode_format;
                            TagParser.quotes = ['\'', '"'];
                        }
                    };
                });
            });
        }
    };
});
System.register([], function (_export2, _context2) {
    "use strict";

    return {
        setters: [],
        execute: function () {
            define([], function () {
                'use strict';

                System.register(['./nodes'], function (_export, _context) {
                    "use strict";

                    var NodeParser, PingNode, PingParser;

                    function _classCallCheck(instance, Constructor) {
                        if (!(instance instanceof Constructor)) {
                            throw new TypeError("Cannot call a class as a function");
                        }
                    }

                    function _possibleConstructorReturn(self, call) {
                        if (!self) {
                            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                        }

                        return call && (typeof call === "object" || typeof call === "function") ? call : self;
                    }

                    function _inherits(subClass, superClass) {
                        if (typeof superClass !== "function" && superClass !== null) {
                            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
                        }

                        subClass.prototype = Object.create(superClass && superClass.prototype, {
                            constructor: {
                                value: subClass,
                                enumerable: false,
                                writable: true,
                                configurable: true
                            }
                        });
                        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
                    }

                    return {
                        setters: [function (_nodes) {
                            NodeParser = _nodes.NodeParser;
                        }],
                        execute: function () {
                            _export('PingNode', PingNode = function (_VoidNode) {
                                _inherits(PingNode, _VoidNode);

                                PingNode.add_format = function add_format(fmt) {
                                    PingNode.formats.set(fmt.name, fmt);
                                };

                                function PingNode(name) {
                                    _classCallCheck(this, PingNode);

                                    var _this = _possibleConstructorReturn(this, _VoidNode.call(this));

                                    _this.name = name;
                                    return _this;
                                }

                                PingNode.prototype.format = function format(_format) {
                                    if (PingNode.formats.has(_format)) {
                                        return PingNode.formats.get(_format).format(this.name);
                                    }

                                    return '@' + this.name;
                                };

                                return PingNode;
                            }(VoidNode));

                            _export('PingNode', PingNode);

                            PingNode.formats = new Map();

                            _export('PingParser', PingParser = function (_NodeParser) {
                                _inherits(PingParser, _NodeParser);

                                function PingParser() {
                                    _classCallCheck(this, PingParser);

                                    return _possibleConstructorReturn(this, _NodeParser.call(this, '@'));
                                }

                                PingParser.prototype.parse = function parse(itr, parser) {
                                    if (itr.value !== '@') return null;
                                    itr.next();

                                    var name = parser.identifier_parse(itr);
                                    if (!name || !name.length) return null;

                                    return new PingNode(name);
                                };

                                return PingParser;
                            }(NodeParser));

                            _export('PingParser', PingParser);
                        }
                    };
                });
            });
        }
    };
});
System.register([], function (_export2, _context2) {
    "use strict";

    return {
        setters: [],
        execute: function () {
            define([], function () {
                'use strict';

                System.register(['./format', './tag_parser', './stack', './nodes', './parser', './helper'], function (_export, _context) {
                    "use strict";

                    var html_format, bbcode_format, TagParser, TagNode, TagAttribute, stack, Node, TextNode, Parser, is_array, ensure_array, AttrPair, BaseFormatter, AttributeFormatter, BBCodeAttrFormatter, AttributeDefinition, ColorAttrDefinition, UrlAttrDefinition, NumberAttrDefinition, ApprovedAttrDefinition, TagFormatter, MarkupTagFormatter, BBCodeTagFormatter, TagDefinition;

                    function _possibleConstructorReturn(self, call) {
                        if (!self) {
                            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                        }

                        return call && (typeof call === "object" || typeof call === "function") ? call : self;
                    }

                    function _inherits(subClass, superClass) {
                        if (typeof superClass !== "function" && superClass !== null) {
                            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
                        }

                        subClass.prototype = Object.create(superClass && superClass.prototype, {
                            constructor: {
                                value: subClass,
                                enumerable: false,
                                writable: true,
                                configurable: true
                            }
                        });
                        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
                    }

                    function _classCallCheck(instance, Constructor) {
                        if (!(instance instanceof Constructor)) {
                            throw new TypeError("Cannot call a class as a function");
                        }
                    }

                    return {
                        setters: [function (_format3) {
                            html_format = _format3.html_format;
                            bbcode_format = _format3.bbcode_format;
                        }, function (_tag_parser) {
                            TagParser = _tag_parser.TagParser;
                            TagNode = _tag_parser.TagNode;
                            TagAttribute = _tag_parser.TagAttribute;
                        }, function (_stack) {
                            stack = _stack.stack;
                        }, function (_nodes) {
                            Node = _nodes.Node;
                            TextNode = _nodes.TextNode;
                        }, function (_parser) {
                            Parser = _parser.Parser;
                        }, function (_helper) {
                            is_array = _helper.is_array;
                            ensure_array = _helper.ensure_array;
                        }],
                        execute: function () {
                            _export('AttrPair', AttrPair = function AttrPair(name, value) {
                                _classCallCheck(this, AttrPair);

                                this.name = name;
                                this.value = value;
                            });

                            _export('AttrPair', AttrPair);

                            _export('BaseFormatter', BaseFormatter = function () {
                                function BaseFormatter(format_type, props) {
                                    _classCallCheck(this, BaseFormatter);

                                    Object.assign(this, props);
                                    this.format_type = format_type;
                                }

                                BaseFormatter.prototype.format = function format() {
                                    return null;
                                };

                                return BaseFormatter;
                            }());

                            _export('BaseFormatter', BaseFormatter);

                            _export('AttributeFormatter', AttributeFormatter = function (_BaseFormatter) {
                                _inherits(AttributeFormatter, _BaseFormatter);

                                function AttributeFormatter(name, format_type) {
                                    var props = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

                                    _classCallCheck(this, AttributeFormatter);

                                    var _this = _possibleConstructorReturn(this, _BaseFormatter.call(this, format_type, props));

                                    _this.name = name;
                                    return _this;
                                }

                                AttributeFormatter.prototype.format = function format(value) {
                                    return new AttrPair(this.name, this.sanitize(value));
                                };

                                AttributeFormatter.prototype.sanitize = function sanitize(value) {
                                    return AttributeFormatter.escape(value);
                                };

                                AttributeFormatter.escape = function escape(value) {
                                    if (typeof value === 'string') {
                                        return JSON.stringify(value).slice(1, -1);
                                    }
                                    return value;
                                };

                                return AttributeFormatter;
                            }(BaseFormatter));

                            _export('AttributeFormatter', AttributeFormatter);

                            _export('BBCodeAttrFormatter', BBCodeAttrFormatter = function (_AttributeFormatter) {
                                _inherits(BBCodeAttrFormatter, _AttributeFormatter);

                                function BBCodeAttrFormatter(name) {
                                    _classCallCheck(this, BBCodeAttrFormatter);

                                    return _possibleConstructorReturn(this, _AttributeFormatter.call(this, name, bbcode_format));
                                }

                                return BBCodeAttrFormatter;
                            }(AttributeFormatter));

                            _export('BBCodeAttrFormatter', BBCodeAttrFormatter);

                            _export('AttributeDefinition', AttributeDefinition = function () {
                                function AttributeDefinition(name) {
                                    var formats = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
                                    var props = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

                                    _classCallCheck(this, AttributeDefinition);

                                    this.required = false;
                                    this.require_value = AttributeDefinition.require_value_default;
                                    this.default_value = null;

                                    Object.assign(this, props);

                                    this.name = name;

                                    this.formats = new Map();
                                    this.add_format(new BBCodeAttrFormatter(name));
                                    if (formats) {
                                        if (!is_array(formats)) {
                                            this.add_format(formats);
                                        } else {
                                            for (var _iterator = formats, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                                                var _ref;

                                                if (_isArray) {
                                                    if (_i >= _iterator.length) break;
                                                    _ref = _iterator[_i++];
                                                } else {
                                                    _i = _iterator.next();
                                                    if (_i.done) break;
                                                    _ref = _i.value;
                                                }

                                                var f = _ref;

                                                this.add_format(f);
                                            }
                                        }
                                    }
                                }

                                AttributeDefinition.prototype.valid_value = function valid_value(v) {
                                    return !this.require_value || this.require_value && v !== null && v !== undefined;
                                };

                                AttributeDefinition.prototype.validate = function validate(value) {
                                    return !this.valid_value(value) ? this.default_value : value;
                                };

                                AttributeDefinition.prototype.add_format = function add_format(fmt) {
                                    if (fmt instanceof AttributeFormatter) {
                                        this.formats.set(fmt.format_type.name, fmt);
                                    }
                                };

                                AttributeDefinition.prototype.format = function format(_format, value, attr) {
                                    if (this.formats.has(_format)) {
                                        var ret = this.formats.get(_format).format(value, attr);
                                        if (!(ret instanceof Node)) {
                                            if (!this.valid_value(ret.value)) {
                                                if (this.default_value) {
                                                    ret.value = this.default_value;
                                                } else {
                                                    return null;
                                                }
                                            }
                                        }

                                        return ret;
                                    }

                                    return null;
                                };

                                return AttributeDefinition;
                            }());

                            _export('AttributeDefinition', AttributeDefinition);

                            AttributeDefinition.require_value_default = true;

                            _export('ColorAttrDefinition', ColorAttrDefinition = function (_AttributeDefinition) {
                                _inherits(ColorAttrDefinition, _AttributeDefinition);

                                function ColorAttrDefinition(name, formats, props) {
                                    _classCallCheck(this, ColorAttrDefinition);

                                    return _possibleConstructorReturn(this, _AttributeDefinition.call(this, name, formats, props));
                                }

                                ColorAttrDefinition.prototype.valid_char = function valid_char(chr, start) {
                                    return start && chr === '#' || TagParser.valid_value_char(chr);
                                };

                                return ColorAttrDefinition;
                            }(AttributeDefinition));

                            _export('ColorAttrDefinition', ColorAttrDefinition);

                            _export('UrlAttrDefinition', UrlAttrDefinition = function (_AttributeDefinition2) {
                                _inherits(UrlAttrDefinition, _AttributeDefinition2);

                                function UrlAttrDefinition(name, formats, props) {
                                    _classCallCheck(this, UrlAttrDefinition);

                                    return _possibleConstructorReturn(this, _AttributeDefinition2.call(this, name, formats, props));
                                }

                                UrlAttrDefinition.prototype.valid_char = function valid_char(ch, start) {
                                    return TagParser.valid_value_char(ch) || UrlAttrDefinition.valid.includes(ch);
                                };

                                return UrlAttrDefinition;
                            }(AttributeDefinition));

                            _export('UrlAttrDefinition', UrlAttrDefinition);

                            UrlAttrDefinition.valid = './:%_-&*$?';

                            _export('NumberAttrDefinition', NumberAttrDefinition = function (_AttributeDefinition3) {
                                _inherits(NumberAttrDefinition, _AttributeDefinition3);

                                function NumberAttrDefinition(name, min, max, formats, props) {
                                    _classCallCheck(this, NumberAttrDefinition);

                                    var _this5 = _possibleConstructorReturn(this, _AttributeDefinition3.call(this, name, formats, props));

                                    _this5.min = min;
                                    _this5.max = max;
                                    return _this5;
                                }

                                NumberAttrDefinition.prototype.valid_char = function valid_char(c) {
                                    return c >= '0' && c <= '9';
                                };

                                NumberAttrDefinition.prototype.validate = function validate(value) {
                                    var v = +_AttributeDefinition3.prototype.validate.call(this, value);
                                    if (!!v && v !== 0 && v >= this.min && v <= this.max) {
                                        return v;
                                    }

                                    return this.min;
                                };

                                return NumberAttrDefinition;
                            }(AttributeDefinition));

                            _export('NumberAttrDefinition', NumberAttrDefinition);

                            _export('ApprovedAttrDefinition', ApprovedAttrDefinition = function (_AttributeDefinition4) {
                                _inherits(ApprovedAttrDefinition, _AttributeDefinition4);

                                function ApprovedAttrDefinition(name, valid_values, formats, props) {
                                    _classCallCheck(this, ApprovedAttrDefinition);

                                    var _this6 = _possibleConstructorReturn(this, _AttributeDefinition4.call(this, name, formats, props));

                                    _this6.valid_values = ensure_array(valid_values);return _this6;
                                }

                                ApprovedAttrDefinition.prototype.validate = function validate(value) {
                                    if (this.valid_values.includes(value)) {
                                        return value;
                                    }

                                    return this.valid_values[this.default_index || 0];
                                };

                                return ApprovedAttrDefinition;
                            }(AttributeDefinition));

                            _export('ApprovedAttrDefinition', ApprovedAttrDefinition);

                            _export('TagFormatter', TagFormatter = function (_BaseFormatter2) {
                                _inherits(TagFormatter, _BaseFormatter2);

                                function TagFormatter(tag_name, format_type, props) {
                                    _classCallCheck(this, TagFormatter);

                                    var _this7 = _possibleConstructorReturn(this, _BaseFormatter2.call(this, format_type, props));

                                    _this7.name = tag_name;
                                    return _this7;
                                }

                                TagFormatter.prototype.format_children = function format_children(children) {
                                    if (!children || !children.length) {
                                        return '';
                                    }

                                    var str = [];
                                    for (var _iterator2 = children, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
                                        var _ref2;

                                        if (_isArray2) {
                                            if (_i2 >= _iterator2.length) break;
                                            _ref2 = _iterator2[_i2++];
                                        } else {
                                            _i2 = _iterator2.next();
                                            if (_i2.done) break;
                                            _ref2 = _i2.value;
                                        }

                                        var child = _ref2;

                                        if (child.format) {
                                            str.push(child.format(this.format_type.name));
                                        } else if (typeof child === 'string') {
                                            str.push(this.format_type.sanitize(child));
                                        }
                                    }
                                    return str.join('');
                                };

                                TagFormatter.prototype.format = function format(def, children, attributes) {
                                    return this.format_children(children);
                                };

                                return TagFormatter;
                            }(BaseFormatter));

                            _export('TagFormatter', TagFormatter);

                            _export('MarkupTagFormatter', MarkupTagFormatter = function (_TagFormatter) {
                                _inherits(MarkupTagFormatter, _TagFormatter);

                                function MarkupTagFormatter(tag_name, format_type, attributes, props) {
                                    _classCallCheck(this, MarkupTagFormatter);

                                    var _this8 = _possibleConstructorReturn(this, _TagFormatter.call(this, tag_name, format_type, props));

                                    _this8.attributes = ensure_array(attributes);
                                    return _this8;
                                }

                                MarkupTagFormatter.prototype.format_attribute = function format_attribute(attribute, map, children) {
                                    var a_v = void 0;
                                    if (attribute instanceof TagAttribute) {
                                        a_v = ensure_array(attribute.format(this.format_type.name));
                                    } else {
                                        a_v = [attribute];
                                    }

                                    var attribs = [];
                                    for (var _iterator3 = a_v, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
                                        var _ref3;

                                        if (_isArray3) {
                                            if (_i3 >= _iterator3.length) break;
                                            _ref3 = _iterator3[_i3++];
                                        } else {
                                            _i3 = _iterator3.next();
                                            if (_i3.done) break;
                                            _ref3 = _i3.value;
                                        }

                                        var attr = _ref3;

                                        if (attr instanceof Node || typeof attr === 'string') {
                                                children.push(attr);
                                            } else if (attr instanceof TagAttribute) {
                                                attribs.push(attr);
                                            } else if (attr && attr.name) {
                                            if (map.has(attr.name)) {
                                                    var v = map.get(attr.name);
                                                    v.value.push(attr.value);
                                                } else {
                                                map.set(attr.name, {
                                                    quote: this.format_type.quote === null ? attribute.quote || '' : this.format_type.quote,
                                                    value: [attr.value]
                                                });
                                            }
                                        }
                                    }

                                    return attribs;
                                };

                                MarkupTagFormatter.prototype.format_attributes = function format_attributes(attributes) {
                                    if (!attributes) {
                                        return ['', null];
                                    }

                                    var attr_map = new Map();
                                    var children = [];

                                    var attr_stack = new stack();

                                    attr_stack.push(attributes);
                                    attr_stack.push(this.attributes);

                                    while (attr_stack.size()) {
                                        attr_stack.push(this.format_attribute(attr_stack.pop(), attr_map, children));
                                    }

                                    var attribs = [];
                                    for (var _iterator4 = attr_map, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
                                        var _ref4;

                                        if (_isArray4) {
                                            if (_i4 >= _iterator4.length) break;
                                            _ref4 = _iterator4[_i4++];
                                        } else {
                                            _i4 = _iterator4.next();
                                            if (_i4.done) break;
                                            _ref4 = _i4.value;
                                        }

                                        var _ref5 = _ref4;
                                        var k = _ref5[0];
                                        var a = _ref5[1];

                                        var a_str = a.value.join(' ').trim();
                                        if (!a_str) {
                                            attribs.push(k);
                                        } else {
                                            attribs.push('' + k + this.format_type.eq + a.quote + a_str + a.quote);
                                        }
                                    }

                                    return [attribs.join(' '), children];
                                };

                                MarkupTagFormatter.prototype.format_tag = function format_tag(attributes, name) {
                                    var close = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

                                    if (name === null) {
                                        return [''];
                                    }

                                    var attribs = '';
                                    var temp_children = [];
                                    if (attributes) {
                                        var _format_attributes = this.format_attributes(attributes);

                                        attribs = _format_attributes[0];
                                        temp_children = _format_attributes[1];
                                    }

                                    var mid = (name + ' ' + attribs).trim();

                                    return ['' + this.format_type.l_bracket + close + mid + this.format_type.r_bracket, temp_children];
                                };

                                MarkupTagFormatter.prototype.format_markup = function format_markup(def, children, attributes, open_name, close_name) {
                                    var open_tag = '';
                                    var close_tag = '';
                                    var temp_children = [];

                                    if (open_name === undefined) {
                                        open_name = this.name;
                                    }

                                    var _format_tag = this.format_tag(attributes, open_name);

                                    open_tag = _format_tag[0];
                                    temp_children = _format_tag[1];


                                    var _void = this.is_void !== undefined ? this.is_void : def.is_void;
                                    if (_void) {
                                        return open_tag;
                                    }

                                    var c_str = this.format_children(temp_children);
                                    c_str += this.format_children(children);

                                    if (typeof def.content_parser === 'function') {
                                        c_str = def.content_parser(this.format_type, c_str);
                                    }

                                    var _format_tag2 = this.format_tag(null, close_name === undefined ? this.name : close_name, '/');

                                    close_tag = _format_tag2[0];
                                    temp_children = _format_tag2[1];


                                    return '' + open_tag + c_str + close_tag;
                                };

                                MarkupTagFormatter.prototype.format = function format(def, children, attributes) {
                                    return this.format_markup(def, children, attributes, this.name);
                                };

                                return MarkupTagFormatter;
                            }(TagFormatter));

                            _export('MarkupTagFormatter', MarkupTagFormatter);

                            _export('BBCodeTagFormatter', BBCodeTagFormatter = function (_MarkupTagFormatter) {
                                _inherits(BBCodeTagFormatter, _MarkupTagFormatter);

                                function BBCodeTagFormatter(tag_name, props) {
                                    _classCallCheck(this, BBCodeTagFormatter);

                                    return _possibleConstructorReturn(this, _MarkupTagFormatter.call(this, tag_name, bbcode_format, props));
                                }

                                BBCodeTagFormatter.prototype.format = function format(def, children, attributes) {
                                    return this.format_markup(def, children, attributes, attributes.has(this.name) ? '' : this.name);
                                };

                                return BBCodeTagFormatter;
                            }(MarkupTagFormatter));

                            _export('BBCodeTagFormatter', BBCodeTagFormatter);

                            _export('TagDefinition', TagDefinition = function () {
                                function TagDefinition(name) {
                                    var children = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
                                    var attributes = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
                                    var formats = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
                                    var props = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

                                    _classCallCheck(this, TagDefinition);

                                    this.is_void = false;
                                    this.overflow = true;
                                    this.type_child = null;
                                    this.children = null;
                                    this.attributes = null;
                                    this.parents = null;
                                    this.parents_allow = true;
                                    this.add_missing = true;

                                    if (!name) {
                                        throw new Error('TagDefinition requires a name.');
                                    }

                                    Object.assign(this, props);

                                    this.name = name;

                                    if (is_array(children)) {
                                        this.children = new Set(children);
                                    } else if (children instanceof Set) {
                                        this.children = children;
                                    }

                                    this.attributes = new Map();
                                    if (is_array(attributes)) {
                                        for (var _iterator5 = attributes, _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator]();;) {
                                            var _ref6;

                                            if (_isArray5) {
                                                if (_i5 >= _iterator5.length) break;
                                                _ref6 = _iterator5[_i5++];
                                            } else {
                                                _i5 = _iterator5.next();
                                                if (_i5.done) break;
                                                _ref6 = _i5.value;
                                            }

                                            var a = _ref6;

                                            this.attributes.set(a.name, a);
                                        }
                                    } else if (!attributes) {
                                        this.__allow_all_attributes = true;
                                    }

                                    if (props.terminate) {
                                        this.terminate = new Set(ensure_array(props.terminate));
                                    }
                                    if (props.type_child) {
                                        this.type_child = new Set(ensure_array(props.type_child));
                                    }
                                    if (props.parents) {
                                        this.parents = new Set(ensure_array(props.parents));
                                    }

                                    this.formats = new Map();
                                    this.add_format(new BBCodeTagFormatter(name));
                                    if (formats) {
                                        if (!is_array(formats)) {
                                            this.add_format(formats);
                                        } else {
                                            for (var _iterator6 = formats, _isArray6 = Array.isArray(_iterator6), _i6 = 0, _iterator6 = _isArray6 ? _iterator6 : _iterator6[Symbol.iterator]();;) {
                                                var _ref7;

                                                if (_isArray6) {
                                                    if (_i6 >= _iterator6.length) break;
                                                    _ref7 = _iterator6[_i6++];
                                                } else {
                                                    _i6 = _iterator6.next();
                                                    if (_i6.done) break;
                                                    _ref7 = _i6.value;
                                                }

                                                var f = _ref7;

                                                this.add_format(f);
                                            }
                                        }
                                    }
                                }

                                TagDefinition.prototype.add_format = function add_format(fmt) {
                                    if (fmt instanceof BaseFormatter) {
                                        this.formats.set(fmt.format_type.name, fmt);
                                    }
                                };

                                TagDefinition.prototype.format = function format(_format2, children, attributes, tag) {
                                    if (this.formats.has(_format2)) {
                                        var fmtr = this.formats.get(_format2);
                                        return fmtr.format(this, children, attributes, tag);
                                    }

                                    return '';
                                };

                                TagDefinition.prototype.valid_child = function valid_child(node) {
                                    if (this.is_void) {
                                        return false;
                                    }
                                    if (this.terminate && this.terminate.has(node.name)) {
                                        return node;
                                    }

                                    if (node instanceof TextNode && node.length <= 0) {
                                        return false;
                                    }

                                    if (node instanceof TagNode) {
                                        return (!this.children || this.children.has(node.name)) && node.def.valid_parent(this);
                                    }

                                    if (!this.type_child) {
                                        return true;
                                    }

                                    for (var _iterator7 = this.type_child, _isArray7 = Array.isArray(_iterator7), _i7 = 0, _iterator7 = _isArray7 ? _iterator7 : _iterator7[Symbol.iterator]();;) {
                                        var _ref8;

                                        if (_isArray7) {
                                            if (_i7 >= _iterator7.length) break;
                                            _ref8 = _iterator7[_i7++];
                                        } else {
                                            _i7 = _iterator7.next();
                                            if (_i7.done) break;
                                            _ref8 = _i7.value;
                                        }

                                        var t = _ref8;

                                        if (node instanceof t) {
                                            return true;
                                        }
                                    }

                                    return false;
                                };

                                TagDefinition.prototype.valid_parent = function valid_parent(tag) {
                                    if (!this.parents) {
                                        return this.parents_allow;
                                    }

                                    return this.parents.has(tag.name) ? this.parents_allow : !this.parents_allow;
                                };

                                TagDefinition.prototype.valid_attribute = function valid_attribute(attr) {
                                    return !this.attributes || this.attributes.has(attr.def.name);
                                };

                                TagDefinition.prototype.get_attribute = function get_attribute(name) {
                                    if (this.__allow_all_attributes && !this.attributes.has(name)) {
                                        var def = new AttributeDefinition(name);
                                        for (var _iterator8 = this.formats, _isArray8 = Array.isArray(_iterator8), _i8 = 0, _iterator8 = _isArray8 ? _iterator8 : _iterator8[Symbol.iterator]();;) {
                                            var _ref9;

                                            if (_isArray8) {
                                                if (_i8 >= _iterator8.length) break;
                                                _ref9 = _iterator8[_i8++];
                                            } else {
                                                _i8 = _iterator8.next();
                                                if (_i8.done) break;
                                                _ref9 = _i8.value;
                                            }

                                            var _ref10 = _ref9;
                                            var f = _ref10[1];

                                            def.add_format(new AttributeFormatter(name, f.format_type));
                                        }
                                        this.attributes.set(name, def);
                                        return def;
                                    }

                                    return this.attributes.get(name);
                                };

                                return TagDefinition;
                            }());

                            _export('TagDefinition', TagDefinition);

                            ;
                        }
                    };
                });
            });
        }
    };
});
System.register([], function (_export2, _context2) {
    "use strict";

    return {
        setters: [],
        execute: function () {
            define([], function () {
                'use strict';

                System.register(['./nodes', './tag_parser', './format', './def'], function (_export, _context) {
                    "use strict";

                    var TextNode, TagNode, html_format, AttributeFormatter, MarkupTagFormatter, AttributeDefinition, TagDefinition, BaseFormatter, HtmlAttrFormatter, UrlAttrFormatter, StyleAttrFormatter, ColorStyleAttrFormatter, NumberStyleAttrFormatter, AttrTagFormatter, ClassAttrFormatter, HtmlTagFormatter, HtmlCTATagFormatter, HeaderTagFormatter, AttrJoinTagFormatter, ContentWrapTagFormatter, HtmlTagDef;

                    function _classCallCheck(instance, Constructor) {
                        if (!(instance instanceof Constructor)) {
                            throw new TypeError("Cannot call a class as a function");
                        }
                    }

                    function _possibleConstructorReturn(self, call) {
                        if (!self) {
                            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                        }

                        return call && (typeof call === "object" || typeof call === "function") ? call : self;
                    }

                    function _inherits(subClass, superClass) {
                        if (typeof superClass !== "function" && superClass !== null) {
                            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
                        }

                        subClass.prototype = Object.create(superClass && superClass.prototype, {
                            constructor: {
                                value: subClass,
                                enumerable: false,
                                writable: true,
                                configurable: true
                            }
                        });
                        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
                    }

                    return {
                        setters: [function (_nodes) {
                            TextNode = _nodes.TextNode;
                        }, function (_tag_parser) {
                            TagNode = _tag_parser.TagNode;
                        }, function (_format) {
                            html_format = _format.html_format;
                        }, function (_def) {
                            AttributeFormatter = _def.AttributeFormatter;
                            MarkupTagFormatter = _def.MarkupTagFormatter;
                            AttributeDefinition = _def.AttributeDefinition;
                            TagDefinition = _def.TagDefinition;
                            BaseFormatter = _def.BaseFormatter;
                        }],
                        execute: function () {
                            _export('HtmlAttrFormatter', HtmlAttrFormatter = function (_AttributeFormatter) {
                                _inherits(HtmlAttrFormatter, _AttributeFormatter);

                                function HtmlAttrFormatter(name, props) {
                                    _classCallCheck(this, HtmlAttrFormatter);

                                    return _possibleConstructorReturn(this, _AttributeFormatter.call(this, name, html_format, props));
                                }

                                return HtmlAttrFormatter;
                            }(AttributeFormatter));

                            _export('HtmlAttrFormatter', HtmlAttrFormatter);

                            _export('UrlAttrFormatter', UrlAttrFormatter = function (_HtmlAttrFormatter) {
                                _inherits(UrlAttrFormatter, _HtmlAttrFormatter);

                                function UrlAttrFormatter(name, props) {
                                    _classCallCheck(this, UrlAttrFormatter);

                                    var _this2 = _possibleConstructorReturn(this, _HtmlAttrFormatter.call(this, name, props));

                                    _this2.regex = /^((?:ht|f)tp(?:s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?)$/;
                                    return _this2;
                                }

                                UrlAttrFormatter.prototype.sanitize = function sanitize(value) {
                                    var result = void 0;
                                    if (result = this.regex.exec(value)) {
                                        return result[1];
                                    }
                                    return null;
                                };

                                return UrlAttrFormatter;
                            }(HtmlAttrFormatter));

                            _export('UrlAttrFormatter', UrlAttrFormatter);

                            _export('StyleAttrFormatter', StyleAttrFormatter = function (_HtmlAttrFormatter2) {
                                _inherits(StyleAttrFormatter, _HtmlAttrFormatter2);

                                function StyleAttrFormatter(style_name, props) {
                                    _classCallCheck(this, StyleAttrFormatter);

                                    var _this3 = _possibleConstructorReturn(this, _HtmlAttrFormatter2.call(this, 'style', props));

                                    _this3.style_name = style_name;
                                    return _this3;
                                }

                                StyleAttrFormatter.prototype.format = function format(value) {
                                    var v = _HtmlAttrFormatter2.prototype.format.call(this, value);
                                    v.value = this.style_name + ': ' + v.value + ';';
                                    return v;
                                };

                                return StyleAttrFormatter;
                            }(HtmlAttrFormatter));

                            _export('StyleAttrFormatter', StyleAttrFormatter);

                            _export('ColorStyleAttrFormatter', ColorStyleAttrFormatter = function (_StyleAttrFormatter) {
                                _inherits(ColorStyleAttrFormatter, _StyleAttrFormatter);

                                function ColorStyleAttrFormatter(name, props) {
                                    _classCallCheck(this, ColorStyleAttrFormatter);

                                    var _this4 = _possibleConstructorReturn(this, _StyleAttrFormatter.call(this, name, props));

                                    _this4.regex = ColorStyleAttrFormatter.regex;
                                    _this4.names = ColorStyleAttrFormatter.names;
                                    return _this4;
                                }

                                ColorStyleAttrFormatter.prototype.sanitize = function sanitize(color) {
                                    if (this.names.includes(color.toLowerCase())) {
                                        return color;
                                    } else {
                                        var result = void 0;
                                        for (var _iterator = this.regex, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                                            var _ref;

                                            if (_isArray) {
                                                if (_i >= _iterator.length) break;
                                                _ref = _iterator[_i++];
                                            } else {
                                                _i = _iterator.next();
                                                if (_i.done) break;
                                                _ref = _i.value;
                                            }

                                            var rx = _ref;

                                            if (result = rx.exec(color)) {
                                                return result[1];
                                            }
                                        }
                                    }

                                    return 'inherit';
                                };

                                return ColorStyleAttrFormatter;
                            }(StyleAttrFormatter));

                            _export('ColorStyleAttrFormatter', ColorStyleAttrFormatter);

                            ColorStyleAttrFormatter.regex = [/(#(?:[0-9a-fA-F]{3}){1,2})/, /(rgba\((?:\s*(?:[1]?[0-9]{1,2}|2(?:[0-5]{1,2}|[0-4][0-9]))\s*,){3}\s*(?:1|0?\.[0-9]+\s*){1}\)){1}/, /(rgb\((?:\s*(?:[1]?[0-9]{1,2}|2(?:[0-5]{1,2}|[0-4][0-9]))\s*,?){3}\)){1}/, /((?:[0-9a-fA-F]{3}){1,2})/];
                            ColorStyleAttrFormatter.names = ['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'grey', 'green', 'greenyellow', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'];

                            _export('NumberStyleAttrFormatter', NumberStyleAttrFormatter = function (_StyleAttrFormatter2) {
                                _inherits(NumberStyleAttrFormatter, _StyleAttrFormatter2);

                                function NumberStyleAttrFormatter(style_name, units, min, max, props) {
                                    _classCallCheck(this, NumberStyleAttrFormatter);

                                    var _this5 = _possibleConstructorReturn(this, _StyleAttrFormatter2.call(this, style_name, props));

                                    _this5.units = units;
                                    _this5.min = min;
                                    _this5.max = max;
                                    return _this5;
                                }

                                NumberStyleAttrFormatter.prototype.sanitize = function sanitize(value) {
                                    var num = +value || this.min;
                                    return Math.min(Math.max(this.min, num), this.max) + this.units;
                                };

                                return NumberStyleAttrFormatter;
                            }(StyleAttrFormatter));

                            _export('NumberStyleAttrFormatter', NumberStyleAttrFormatter);

                            _export('AttrTagFormatter', AttrTagFormatter = function (_HtmlAttrFormatter3) {
                                _inherits(AttrTagFormatter, _HtmlAttrFormatter3);

                                function AttrTagFormatter(tag_def, props) {
                                    _classCallCheck(this, AttrTagFormatter);

                                    var _this6 = _possibleConstructorReturn(this, _HtmlAttrFormatter3.call(this, '', props));

                                    _this6.tag_def = tag_def;
                                    return _this6;
                                }

                                AttrTagFormatter.prototype.format = function format(value) {
                                    var tag = new TagNode(this.tag_def);
                                    tag.add_child(new TextNode(value));

                                    return tag;
                                };

                                return AttrTagFormatter;
                            }(HtmlAttrFormatter));

                            _export('AttrTagFormatter', AttrTagFormatter);

                            _export('ClassAttrFormatter', ClassAttrFormatter = function (_HtmlAttrFormatter4) {
                                _inherits(ClassAttrFormatter, _HtmlAttrFormatter4);

                                function ClassAttrFormatter(class_string, props) {
                                    _classCallCheck(this, ClassAttrFormatter);

                                    var _this7 = _possibleConstructorReturn(this, _HtmlAttrFormatter4.call(this, 'class', props));

                                    _this7.classes = class_string;
                                    return _this7;
                                }

                                ClassAttrFormatter.prototype.format = function format(value) {
                                    return _HtmlAttrFormatter4.prototype.format.call(this, this.classes + (this.use_value ? value : ''));
                                };

                                return ClassAttrFormatter;
                            }(HtmlAttrFormatter));

                            _export('ClassAttrFormatter', ClassAttrFormatter);

                            _export('HtmlTagFormatter', HtmlTagFormatter = function (_MarkupTagFormatter) {
                                _inherits(HtmlTagFormatter, _MarkupTagFormatter);

                                function HtmlTagFormatter(tag_name, attributes, props) {
                                    _classCallCheck(this, HtmlTagFormatter);

                                    return _possibleConstructorReturn(this, _MarkupTagFormatter.call(this, tag_name, html_format, attributes, props));
                                }

                                return HtmlTagFormatter;
                            }(MarkupTagFormatter));

                            _export('HtmlTagFormatter', HtmlTagFormatter);

                            _export('HtmlCTATagFormatter', HtmlCTATagFormatter = function (_HtmlTagFormatter) {
                                _inherits(HtmlCTATagFormatter, _HtmlTagFormatter);

                                function HtmlCTATagFormatter(tag_name, required, alt, attributes, props) {
                                    _classCallCheck(this, HtmlCTATagFormatter);

                                    var _this9 = _possibleConstructorReturn(this, _HtmlTagFormatter.call(this, tag_name, attributes, props));

                                    _this9.required = required;
                                    _this9.alt = alt;return _this9;
                                }

                                HtmlCTATagFormatter.prototype.format = function format(def, children, attributes) {
                                    if (attributes && attributes.has(this.required)) {
                                        if (!this.alt) {
                                            return _HtmlTagFormatter.prototype.format.call(this, def, children, attributes);
                                        } else if (children.length === 1 && children[0] instanceof TextNode) {
                                            var _attr = new Map(attributes);

                                            var value = children[0].value;
                                            if (typeof this.alt === 'string') {
                                                _attr.set(this.alt, new TagAttribute(value, new AttributeDefinition(this.alt, new AttributeFormatter(this.alt, this.format_type))));
                                            } else if (this.alt instanceof AttributeDefinition) {
                                                _attr.set(this.alt.name, new TagAttribute(value, this.alt));
                                            } else if (this.alt instanceof AttributeFormatter) {
                                                var f = new AttributeDefinition(this.alt.name, true, this.alt);
                                                _attr.set(this.alt.name, new TagAttribute(value, f));
                                            }

                                            return _HtmlTagFormatter.prototype.format.call(this, def, children, _attr);
                                        }
                                    } else if (children && children.length === 1 && children[0] instanceof TextNode) {
                                        var _attr2 = new Map(attributes);
                                        _attr2.set(this.required, new TagAttribute(children[0].value, def.get_attribute(this.required)));

                                        return _HtmlTagFormatter.prototype.format.call(this, def, children, _attr2);
                                    }

                                    return '';
                                };

                                return HtmlCTATagFormatter;
                            }(HtmlTagFormatter));

                            _export('HtmlCTATagFormatter', HtmlCTATagFormatter);

                            _export('HeaderTagFormatter', HeaderTagFormatter = function (_HtmlTagFormatter2) {
                                _inherits(HeaderTagFormatter, _HtmlTagFormatter2);

                                function HeaderTagFormatter(name, def, attributes, props) {
                                    _classCallCheck(this, HeaderTagFormatter);

                                    var _this10 = _possibleConstructorReturn(this, _HtmlTagFormatter2.call(this, name, attributes, props));

                                    _this10.def = def;return _this10;
                                }

                                HeaderTagFormatter.prototype.format = function format(def, children, attributes) {
                                    var _children = [];

                                    var tag = new TagNode(this.def);

                                    tag.add_child(new TextNode(attributes.has(def.name) ? attributes.get(def.name).value : def.name));

                                    _children.push(tag);

                                    return _HtmlTagFormatter2.prototype.format.call(this, def, _children.concat(children), attributes);
                                };

                                return HeaderTagFormatter;
                            }(HtmlTagFormatter));

                            _export('HeaderTagFormatter', HeaderTagFormatter);

                            _export('AttrJoinTagFormatter', AttrJoinTagFormatter = function (_HtmlTagFormatter3) {
                                _inherits(AttrJoinTagFormatter, _HtmlTagFormatter3);

                                function AttrJoinTagFormatter(name, attr_name, attributes) {
                                    var props = arguments.length <= 3 || arguments[3] === undefined ? { format_value: true } : arguments[3];

                                    _classCallCheck(this, AttrJoinTagFormatter);

                                    var _this11 = _possibleConstructorReturn(this, _HtmlTagFormatter3.call(this, name, attributes, props));

                                    _this11.attr_name = attr_name;
                                    return _this11;
                                }

                                AttrJoinTagFormatter.prototype.format = function format(def, children, attributes) {

                                    var val = this.default_value;
                                    if (!attributes.has(this.attr_name)) {
                                        if (this.default_value === undefined || this.default_value === null) {
                                            return '';
                                        }
                                    } else {
                                        var attr = attributes.get(this.attr_name);
                                        if (this.format_value) {
                                            var result = attr.format(this.format_type.name);
                                            if (result) {
                                                val = result.value;
                                            }
                                        } else {
                                            val = attr.value;
                                        }

                                        if (!val && this.default_value !== undefined) {
                                            val = this.default_value;
                                        } else if (!val && this.default_value === undefined) {
                                            return '';
                                        }
                                    }

                                    var name = '' + this.name + val;
                                    return _HtmlTagFormatter3.prototype.format_markup.call(this, def, children, attributes, name, name);
                                };

                                return AttrJoinTagFormatter;
                            }(HtmlTagFormatter));

                            _export('AttrJoinTagFormatter', AttrJoinTagFormatter);

                            _export('ContentWrapTagFormatter', ContentWrapTagFormatter = function (_BaseFormatter) {
                                _inherits(ContentWrapTagFormatter, _BaseFormatter);

                                function ContentWrapTagFormatter(shell, wrap) {
                                    _classCallCheck(this, ContentWrapTagFormatter);

                                    var _this12 = _possibleConstructorReturn(this, _BaseFormatter.call(this, html_format));

                                    if (!(shell instanceof TagDefinition) || !(wrap instanceof TagDefinition)) {
                                        throw new Error('Shell & Wrap require a TagDefinition type');
                                    }
                                    _this12.shell = shell;
                                    _this12.wrap = wrap;
                                    return _this12;
                                }

                                ContentWrapTagFormatter.prototype.format = function format(def, children, attributes) {

                                    var tag = new TagNode(this.shell);
                                    var wrap_tag = new TagNode(this.wrap);

                                    tag.attributes = attributes;
                                    tag.children = [wrap_tag];

                                    wrap_tag.children = children;

                                    return tag.format(this.format_type.name);
                                };

                                return ContentWrapTagFormatter;
                            }(BaseFormatter));

                            _export('ContentWrapTagFormatter', ContentWrapTagFormatter);

                            _export('HtmlTagDef', HtmlTagDef = function (_TagDefinition) {
                                _inherits(HtmlTagDef, _TagDefinition);

                                function HtmlTagDef(name, a_or_f, props) {
                                    _classCallCheck(this, HtmlTagDef);

                                    return _possibleConstructorReturn(this, _TagDefinition.call(this, name, null, null, a_or_f instanceof BaseFormatter ? a_or_f : new HtmlTagFormatter(name, a_or_f), props));
                                }

                                return HtmlTagDef;
                            }(TagDefinition));

                            _export('HtmlTagDef', HtmlTagDef);
                        }
                    };
                });
            });
        }
    };
});
System.register([], function (_export2, _context2) {
    "use strict";

    return {
        setters: [],
        execute: function () {
            define([], function () {
                'use strict';

                System.register(['./parser', './tag_parser', './format', './def', './html'], function (_export, _context) {
                    "use strict";

                    var Parser, TagParser, bbcode_format, TagDefinition, AttributeDefinition, ColorAttrDefinition, UrlAttrDefinition, NumberAttrDefinition, AttrPair, ApprovedAttrDefinition, HtmlTagFormatter, HtmlCTATagFormatter, UrlAttrFormatter, AttrJoinTagFormatter, AttrTagFormatter, StyleAttrFormatter, ColorStyleAttrFormatter, NumberStyleAttrFormatter, HtmlTagDef, common_allowed, list_allowed, special, common_plus, header_tag, tag_defs, parser;
                    return {
                        setters: [function (_parser) {
                            Parser = _parser.Parser;
                        }, function (_tag_parser) {
                            TagParser = _tag_parser.TagParser;
                        }, function (_format) {
                            bbcode_format = _format.bbcode_format;
                        }, function (_def) {
                            TagDefinition = _def.TagDefinition;
                            AttributeDefinition = _def.AttributeDefinition;
                            ColorAttrDefinition = _def.ColorAttrDefinition;
                            UrlAttrDefinition = _def.UrlAttrDefinition;
                            NumberAttrDefinition = _def.NumberAttrDefinition;
                            AttrPair = _def.AttrPair;
                            ApprovedAttrDefinition = _def.ApprovedAttrDefinition;
                        }, function (_html) {
                            HtmlTagFormatter = _html.HtmlTagFormatter;
                            HtmlCTATagFormatter = _html.HtmlCTATagFormatter;
                            UrlAttrFormatter = _html.UrlAttrFormatter;
                            AttrJoinTagFormatter = _html.AttrJoinTagFormatter;
                            AttrTagFormatter = _html.AttrTagFormatter;
                            StyleAttrFormatter = _html.StyleAttrFormatter;
                            ColorStyleAttrFormatter = _html.ColorStyleAttrFormatter;
                            NumberStyleAttrFormatter = _html.NumberStyleAttrFormatter;
                            HtmlTagDef = _html.HtmlTagDef;
                        }],
                        execute: function () {
                            common_allowed = ['b', 'i', 's', 'u', 'sup', 'sub', 'color', 'size', 'align', 'center', 'url', 'hr', 'list', 'ul', 'ol', 'table'];
                            list_allowed = ['li', '*'];
                            special = ['quote', 'code'];
                            common_plus = common_allowed.concat(special);
                            header_tag = new HtmlTagDef('header');
                            tag_defs = [new TagDefinition('b', common_allowed, [], new HtmlTagFormatter('b')), new TagDefinition('i', common_allowed, [], new HtmlTagFormatter('i')), new TagDefinition('u', common_allowed, [], new HtmlTagFormatter('u')), new TagDefinition('s', common_allowed, [], new HtmlTagFormatter('s')), new TagDefinition('sup', common_allowed, [], new HtmlTagFormatter('sup')), new TagDefinition('sub', common_allowed, [], new HtmlTagFormatter('sub')), new TagDefinition('center', common_allowed, [], new HtmlTagFormatter('div', new AttribPair('class', 'center'))), new TagDefinition('align', common_allowed, [new ApprovedAttrDefinition('align', ['left', 'center', 'right', 'justify'], new StyleAttrFormatter('text-align'))], new HtmlTagFormatter('div')), new TagDefinition('list', list_allowed, [], new HtmlTagFormatter('ul')), new TagDefinition('ul', list_allowed, [], new HtmlTagFormatter('ul')), new TagDefinition('ol', list_allowed, [], new HtmlTagFormatter('ol')), new TagDefinition('li', common_allowed, [], new HtmlTagFormatter('li'), { overflow: false, terminate: ['li', '*'] }), new TagDefinition('*', common_allowed, [], new HtmlTagFormatter('li'), { overflow: false, terminate: ['li', '*'] }), new TagDefinition('size', common_allowed, [new AttributeDefinition('size', new NumberStyleAttrFormatter('font-size', 'px', 5, 30))], new HtmlTagFormatter('span')), new TagDefinition('color', common_allowed, [new ColorAttrDefinition('color', new ColorStyleAttrFormatter('color'))], new HtmlTagFormatter('span')), new TagDefinition('style', common_allowed, [new AttributeDefinition('size', new NumberStyleAttrFormatter('font-size', 'px', 5, 30)), new ColorAttrDefinition('color', new ColorStyleAttrFormatter('color'))], new HtmlTagFormatter('span')), new TagDefinition('noparse', [], [], new HtmlTagFormatter(null), { overflow: false }), new TagDefinition('table', ['thead', 'tbody', 'tfoot', 'tr'], [], new HtmlTagFormatter('table')), new TagDefinition('thead', ['tr'], [], new HtmlTagFormatter('thead'), { overflow: false, terminate: ['tbody', 'tfoot'] }), new TagDefinition('tbody', ['tr'], [], new HtmlTagFormatter('tbody'), { overflow: false, terminate: ['tbody', 'tfoot'] }), new TagDefinition('tfoot', ['tr'], [], new HtmlTagFormatter('tfoot'), { overflow: false, terminate: ['tbody'] }), new TagDefinition('tr', ['td', 'th'], [], new HtmlTagFormatter('tr'), { overflow: false, terminate: ['tr'] }), new TagDefinition('th', common_plus, [], new HtmlTagFormatter('th'), { overflow: false, terminate: ['th', 'td'] }), new TagDefinition('td', common_plus, [], new HtmlTagFormatter('td'), { overflow: false, terminate: ['td', 'th'] }), new TagDefinition('hr', [], [], new HtmlTagFormatter('hr'), { is_void: true }), new TagDefinition('url', [], [new UrlAttrDefinition('url', new UrlAttrFormatter('href'))], new HtmlCTATagFormatter('a', 'url'), { terminate: ['url'] }), new TagDefinition('img', [], [new UrlAttrDefinition('img', new UrlAttrFormatter('src'))], new HtmlCTATagFormatter('img', 'img', 'title', null, { is_void: true })), new TagDefinition('code', [], [new AttributeDefinition('code', new AttrTagFormatter(header_tag), { required: true, default_value: 'code' })], new HtmlTagFormatter('code')), new TagDefinition('quote', common_plus, [new AttributeDefinition('quote', new AttrTagFormatter(header_tag), { required: true, default_value: 'quote' })], new HtmlTagFormatter('blockquote')), new TagDefinition('spoiler', common_allowed, [], new HtmlTagFormatter('span', new AttribPair('class', 'spoiler'))), new TagDefinition('header', common_allowed, [new NumberAttrDefinition('header', 1, 6, null, { required: true, default_value: 6 })], new AttrJoinTagFormatter('h', 'header', null, { format_value: false }))];

                            _export('parser', parser = new Parser(new TagParser(tag_defs, bbcode_format)));

                            _export('parser', parser);
                        }
                    };
                });
            });
        }
    };
});