System.register([], function (_export, _context) {
    "use strict";

    return {
        setters: [],
        execute: function () {
            define(['exports', './format', './tag_parser', './stack', './nodes', './parser', './helper'], function (exports, _format3, _tag_parser, _stack, _nodes, _parser, _helper) {
                'use strict';

                exports.__esModule = true;
                exports.TagDefinition = exports.BBCodeTagFormatter = exports.MarkupTagFormatter = exports.TagFormatter = exports.ApprovedAttrDefinition = exports.NumberAttrDefinition = exports.UrlAttrDefinition = exports.ColorAttrDefinition = exports.AttributeDefinition = exports.BBCodeAttrFormatter = exports.AttributeFormatter = exports.BaseFormatter = exports.AttrPair = undefined;

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

                var AttrPair = exports.AttrPair = function AttrPair(name, value) {
                    _classCallCheck(this, AttrPair);

                    this.name = name;
                    this.value = value;
                };

                var BaseFormatter = exports.BaseFormatter = function () {
                    function BaseFormatter(format_type, props) {
                        _classCallCheck(this, BaseFormatter);

                        Object.assign(this, props);
                        this.format_type = format_type;
                    }

                    BaseFormatter.prototype.format = function format() {
                        return null;
                    };

                    return BaseFormatter;
                }();

                var AttributeFormatter = exports.AttributeFormatter = function (_BaseFormatter) {
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
                }(BaseFormatter);

                var BBCodeAttrFormatter = exports.BBCodeAttrFormatter = function (_AttributeFormatter) {
                    _inherits(BBCodeAttrFormatter, _AttributeFormatter);

                    function BBCodeAttrFormatter(name) {
                        _classCallCheck(this, BBCodeAttrFormatter);

                        return _possibleConstructorReturn(this, _AttributeFormatter.call(this, name, _format3.bbcode_format));
                    }

                    return BBCodeAttrFormatter;
                }(AttributeFormatter);

                var AttributeDefinition = function () {
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
                            if (!(0, _helper.is_array)(formats)) {
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
                            if (!(ret instanceof _nodes.Node)) {
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
                }();

                exports.AttributeDefinition = AttributeDefinition;
                AttributeDefinition.require_value_default = true;

                var ColorAttrDefinition = exports.ColorAttrDefinition = function (_AttributeDefinition) {
                    _inherits(ColorAttrDefinition, _AttributeDefinition);

                    function ColorAttrDefinition(name, formats, props) {
                        _classCallCheck(this, ColorAttrDefinition);

                        return _possibleConstructorReturn(this, _AttributeDefinition.call(this, name, formats, props));
                    }

                    ColorAttrDefinition.prototype.valid_char = function valid_char(chr, start) {
                        return start && chr === '#' || _tag_parser.TagParser.valid_value_char(chr);
                    };

                    return ColorAttrDefinition;
                }(AttributeDefinition);

                var UrlAttrDefinition = exports.UrlAttrDefinition = function (_AttributeDefinition2) {
                    _inherits(UrlAttrDefinition, _AttributeDefinition2);

                    function UrlAttrDefinition(name, formats, props) {
                        _classCallCheck(this, UrlAttrDefinition);

                        return _possibleConstructorReturn(this, _AttributeDefinition2.call(this, name, formats, props));
                    }

                    UrlAttrDefinition.prototype.valid_char = function valid_char(ch, start) {
                        return _tag_parser.TagParser.valid_value_char(ch) || UrlAttrDefinition.valid.includes(ch);
                    };

                    return UrlAttrDefinition;
                }(AttributeDefinition);

                UrlAttrDefinition.valid = './:%_-&*$?';

                var NumberAttrDefinition = exports.NumberAttrDefinition = function (_AttributeDefinition3) {
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
                }(AttributeDefinition);

                var ApprovedAttrDefinition = exports.ApprovedAttrDefinition = function (_AttributeDefinition4) {
                    _inherits(ApprovedAttrDefinition, _AttributeDefinition4);

                    function ApprovedAttrDefinition(name, valid_values, formats, props) {
                        _classCallCheck(this, ApprovedAttrDefinition);

                        var _this6 = _possibleConstructorReturn(this, _AttributeDefinition4.call(this, name, formats, props));

                        _this6.valid_values = (0, _helper.ensure_array)(valid_values);return _this6;
                    }

                    ApprovedAttrDefinition.prototype.validate = function validate(value) {
                        if (this.valid_values.includes(value)) {
                            return value;
                        }

                        return this.valid_values[this.default_index || 0];
                    };

                    return ApprovedAttrDefinition;
                }(AttributeDefinition);

                var TagFormatter = exports.TagFormatter = function (_BaseFormatter2) {
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
                }(BaseFormatter);

                var MarkupTagFormatter = exports.MarkupTagFormatter = function (_TagFormatter) {
                    _inherits(MarkupTagFormatter, _TagFormatter);

                    function MarkupTagFormatter(tag_name, format_type, attributes, props) {
                        _classCallCheck(this, MarkupTagFormatter);

                        var _this8 = _possibleConstructorReturn(this, _TagFormatter.call(this, tag_name, format_type, props));

                        _this8.attributes = (0, _helper.ensure_array)(attributes);
                        return _this8;
                    }

                    MarkupTagFormatter.prototype.format_attribute = function format_attribute(attribute, map, children) {
                        var a_v = void 0;
                        if (attribute instanceof _tag_parser.TagAttribute) {
                            a_v = (0, _helper.ensure_array)(attribute.format(this.format_type.name));
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

                            if (attr instanceof _nodes.Node || typeof attr === 'string') {
                                    children.push(attr);
                                } else if (attr instanceof _tag_parser.TagAttribute) {
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

                        var attr_stack = new _stack.stack();

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
                }(TagFormatter);

                var BBCodeTagFormatter = exports.BBCodeTagFormatter = function (_MarkupTagFormatter) {
                    _inherits(BBCodeTagFormatter, _MarkupTagFormatter);

                    function BBCodeTagFormatter(tag_name, props) {
                        _classCallCheck(this, BBCodeTagFormatter);

                        return _possibleConstructorReturn(this, _MarkupTagFormatter.call(this, tag_name, _format3.bbcode_format, props));
                    }

                    BBCodeTagFormatter.prototype.format = function format(def, children, attributes) {
                        return this.format_markup(def, children, attributes, attributes.has(this.name) ? '' : this.name);
                    };

                    return BBCodeTagFormatter;
                }(MarkupTagFormatter);

                var TagDefinition = function () {
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

                        if ((0, _helper.is_array)(children)) {
                            this.children = new Set(children);
                        } else if (children instanceof Set) {
                            this.children = children;
                        }

                        this.attributes = new Map();
                        if ((0, _helper.is_array)(attributes)) {
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
                            this.terminate = new Set((0, _helper.ensure_array)(props.terminate));
                        }
                        if (props.type_child) {
                            this.type_child = new Set((0, _helper.ensure_array)(props.type_child));
                        }
                        if (props.parents) {
                            this.parents = new Set((0, _helper.ensure_array)(props.parents));
                        }

                        this.formats = new Map();
                        this.add_format(new BBCodeTagFormatter(name));
                        if (formats) {
                            if (!(0, _helper.is_array)(formats)) {
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

                        if (node instanceof _nodes.TextNode && node.length <= 0) {
                            return false;
                        }

                        if (node instanceof _tag_parser.TagNode) {
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
                }();

                exports.TagDefinition = TagDefinition;
                ;
            });
        }
    };
});