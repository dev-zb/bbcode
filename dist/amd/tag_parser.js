System.register([], function (_export, _context) {
    "use strict";

    return {
        setters: [],
        execute: function () {
            define([], function () {
                define(['exports', './parser', './nodes', './string', './helper', './def', './format'], function (exports, _parser, _nodes, _string, _helper, _def, _format3) {
                    'use strict';

                    Object.defineProperty(exports, "__esModule", {
                        value: true
                    });
                    exports.TagParser = exports.TagNode = exports.TagAttribute = undefined;

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

                    var _createClass = function () {
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

                    var TagAttribute = function () {
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
                    }();

                    exports.TagAttribute = TagAttribute;

                    var TagNode = function (_ContainerNode) {
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
                    }(_nodes.ContainerNode);

                    exports.TagNode = TagNode;

                    var TagParser = exports.TagParser = function (_NodeParser) {
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
                                tags = (0, _helper.ensure_array)(tags);
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

                                    if (!_parser.Parser.valid_identifier(c)) {
                                        _this2.valid_chars.add(c);
                                    }
                                }
                            }
                            return _this2;
                        }

                        TagParser._default_create_def = function _default_create_def(name) {
                            return new _def.TagDefinition(name);
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
                            return _parser.Parser.valid_identifier(c, true);
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

                                var ret = _string.string.make_string(it, itr);
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
                            while (!itr.eof() && (_parser.Parser.valid_identifier(itr.value) || this.valid_chars.has(itr.value))) {
                                itr.next();
                            }

                            return _string.string.make_string(it, itr).toLowerCase();
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
                                } else if (attrib instanceof _parser.ParseError) {
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
                    }(_nodes.NodeParser);

                    TagParser.default_format = _format3.bbcode_format;
                    TagParser.quotes = ['\'', '"'];
                });
            });
        }
    };
});