'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TagDefinition = exports.BBCodeTagFormatter = exports.MarkupTagFormatter = exports.TagFormatter = exports.ApprovedAttrDefinition = exports.NumberAttrDefinition = exports.UrlAttrDefinition = exports.ColorAttrDefinition = exports.AttributeDefinition = exports.BBCodeAttrFormatter = exports.AttributeFormatter = exports.BaseFormatter = exports.AttrPair = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _format3 = require('./format');

var _tagParser = require('./tag-parser');

var _stack = require('./stack');

var _nodes = require('./nodes');

var _helper = require('./helper');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

    _createClass(BaseFormatter, [{
        key: 'format',
        value: function format() {
            return null;
        }
    }]);

    return BaseFormatter;
}();

/**
 * Attribute Formatter
 */


var AttributeFormatter = exports.AttributeFormatter = function (_BaseFormatter) {
    _inherits(AttributeFormatter, _BaseFormatter);

    function AttributeFormatter(name, format_type) {
        var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _classCallCheck(this, AttributeFormatter);

        var _this = _possibleConstructorReturn(this, (AttributeFormatter.__proto__ || Object.getPrototypeOf(AttributeFormatter)).call(this, format_type, props));

        _this.name = name;
        return _this;
    }

    _createClass(AttributeFormatter, [{
        key: 'format',
        value: function format(value) {
            return new AttrPair(this.name, this.sanitize(value));
        }
    }, {
        key: 'sanitize',
        value: function sanitize(value) {
            return AttributeFormatter.escape(value);
        }
    }], [{
        key: 'escape',
        value: function escape(value) {
            if (typeof value === 'string') {
                return JSON.stringify(value).slice(1, -1);
            }
            return value;
        }
    }]);

    return AttributeFormatter;
}(BaseFormatter);

var BBCodeAttrFormatter = exports.BBCodeAttrFormatter = function (_AttributeFormatter) {
    _inherits(BBCodeAttrFormatter, _AttributeFormatter);

    function BBCodeAttrFormatter(name) {
        _classCallCheck(this, BBCodeAttrFormatter);

        return _possibleConstructorReturn(this, (BBCodeAttrFormatter.__proto__ || Object.getPrototypeOf(BBCodeAttrFormatter)).call(this, name, _format3.bbcode_format));
    }

    return BBCodeAttrFormatter;
}(AttributeFormatter);

/**
 * ATTRIBUTE DEFINITIONS
 */

var AttributeDefinition = function () {
    // default value to set if required_value and value is null/undefined

    // lets parser know that this attribute is required. the parser will attempt to create it when missing.

    function AttributeDefinition(name) {
        var formats = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

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
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = formats[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var f = _step.value;

                        this.add_format(f);
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
    }

    // checks if a value is set when required.
    // lets the parser know a value is required to be a valid attribute


    _createClass(AttributeDefinition, [{
        key: 'valid_value',
        value: function valid_value(v) {
            return !this.require_value || this.require_value && !!v;
        }

        // used when a tag-attribute value is set. 

    }, {
        key: 'validate',
        value: function validate(value) {
            return !this.valid_value(value) ? this.default_value : value;
        }
    }, {
        key: 'add_format',
        value: function add_format(fmt) {
            if (fmt instanceof AttributeFormatter) {
                this.formats.set(fmt.format_type.name, fmt);
            }
        }
    }, {
        key: 'format',
        value: function format(_format, value, attr) {
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
        }
    }]);

    return AttributeDefinition;
}();

exports.AttributeDefinition = AttributeDefinition;
AttributeDefinition.require_value_default = true;

var ColorAttrDefinition = exports.ColorAttrDefinition = function (_AttributeDefinition) {
    _inherits(ColorAttrDefinition, _AttributeDefinition);

    function ColorAttrDefinition(name, formats, props) {
        _classCallCheck(this, ColorAttrDefinition);

        return _possibleConstructorReturn(this, (ColorAttrDefinition.__proto__ || Object.getPrototypeOf(ColorAttrDefinition)).call(this, name, formats, props));
    }

    _createClass(ColorAttrDefinition, [{
        key: 'valid_char',
        value: function valid_char(chr, start) {
            return start && chr === '#' || _tagParser.TagParser.valid_value_char(chr);
        }
    }]);

    return ColorAttrDefinition;
}(AttributeDefinition);

var UrlAttrDefinition = exports.UrlAttrDefinition = function (_AttributeDefinition2) {
    _inherits(UrlAttrDefinition, _AttributeDefinition2);

    function UrlAttrDefinition(name, formats, props) {
        _classCallCheck(this, UrlAttrDefinition);

        return _possibleConstructorReturn(this, (UrlAttrDefinition.__proto__ || Object.getPrototypeOf(UrlAttrDefinition)).call(this, name, formats, props));
    }

    _createClass(UrlAttrDefinition, [{
        key: 'valid_char',
        value: function valid_char(ch, start) {
            return _tagParser.TagParser.valid_value_char(ch) || UrlAttrDefinition.valid.includes(ch);
        }
    }]);

    return UrlAttrDefinition;
}(AttributeDefinition);

UrlAttrDefinition.valid = './:%_-&*$?';

var NumberAttrDefinition = exports.NumberAttrDefinition = function (_AttributeDefinition3) {
    _inherits(NumberAttrDefinition, _AttributeDefinition3);

    function NumberAttrDefinition(name, min, max, formats, props) {
        _classCallCheck(this, NumberAttrDefinition);

        var _this5 = _possibleConstructorReturn(this, (NumberAttrDefinition.__proto__ || Object.getPrototypeOf(NumberAttrDefinition)).call(this, name, formats, props));

        _this5.min = min;
        _this5.max = max;
        return _this5;
    }

    _createClass(NumberAttrDefinition, [{
        key: 'valid_char',
        value: function valid_char(c) {
            return c >= '0' && c <= '9';
        }
    }, {
        key: 'validate',
        value: function validate(value) {
            var v = +_get(NumberAttrDefinition.prototype.__proto__ || Object.getPrototypeOf(NumberAttrDefinition.prototype), 'validate', this).call(this, value);
            if (!!v && v !== 0 && v >= this.min && v <= this.max) {
                return v;
            }

            return this.min;
        }
    }]);

    return NumberAttrDefinition;
}(AttributeDefinition);

// attribute with a list of pre-approved values.


var ApprovedAttrDefinition = exports.ApprovedAttrDefinition = function (_AttributeDefinition4) {
    _inherits(ApprovedAttrDefinition, _AttributeDefinition4);

    function ApprovedAttrDefinition(name, valid_values, formats, props) {
        _classCallCheck(this, ApprovedAttrDefinition);

        var _this6 = _possibleConstructorReturn(this, (ApprovedAttrDefinition.__proto__ || Object.getPrototypeOf(ApprovedAttrDefinition)).call(this, name, formats, props));

        _this6.valid_values = (0, _helper.ensure_array)(valid_values); // list of valid values.   
        return _this6;
    }

    _createClass(ApprovedAttrDefinition, [{
        key: 'validate',
        value: function validate(value) {
            if (this.valid_values.includes(value)) {
                return value;
            }

            return this.valid_values[this.default_index || 0];
        }
    }]);

    return ApprovedAttrDefinition;
}(AttributeDefinition);

/**
 * TAG FORMATTING
 */

var TagFormatter = exports.TagFormatter = function (_BaseFormatter2) {
    _inherits(TagFormatter, _BaseFormatter2);

    function TagFormatter(tag_name, format_type, props) {
        _classCallCheck(this, TagFormatter);

        var _this7 = _possibleConstructorReturn(this, (TagFormatter.__proto__ || Object.getPrototypeOf(TagFormatter)).call(this, format_type, props));

        _this7.name = tag_name;
        return _this7;
    }

    _createClass(TagFormatter, [{
        key: 'format_children',
        value: function format_children(children) {
            if (!children || !children.length) {
                return '';
            }

            var str = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var child = _step2.value;

                    if (child.format) {
                        str.push(child.format(this.format_type.name));
                    } else if (typeof child === 'string') {
                        str.push(this.format_type.sanitize(child));
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return str.join('');
        }
    }, {
        key: 'format',
        value: function format(def, children, attributes) {
            return this.format_children(children);
        }
    }]);

    return TagFormatter;
}(BaseFormatter);

var MarkupTagFormatter = exports.MarkupTagFormatter = function (_TagFormatter) {
    _inherits(MarkupTagFormatter, _TagFormatter);

    function MarkupTagFormatter(tag_name, format_type, attributes, props) {
        _classCallCheck(this, MarkupTagFormatter);

        var _this8 = _possibleConstructorReturn(this, (MarkupTagFormatter.__proto__ || Object.getPrototypeOf(MarkupTagFormatter)).call(this, tag_name, format_type, props));

        _this8.attributes = (0, _helper.ensure_array)(attributes);
        return _this8;
    }

    _createClass(MarkupTagFormatter, [{
        key: 'format_attribute',
        value: function format_attribute(attribute, map, children) {
            // expect attribute === AttrPair / TagAttribute
            var a_v = void 0;
            if (attribute instanceof _tagParser.TagAttribute) {
                a_v = (0, _helper.ensure_array)(attribute.format(this.format_type.name));
            } else {
                a_v = [attribute];
            } // assume object {name/value} or AttrPair

            var attribs = [];
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = a_v[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var attr = _step3.value;

                    if (attr instanceof _nodes.Node || typeof attr === 'string') // attribute became a child.
                        {
                            children.push(attr);
                        } else if (attr instanceof _tagParser.TagAttribute) // allow 1 attribute to become many (one-to-many)
                        {
                            attribs.push(attr);
                        } else if (attr && attr.name) {
                        if (map.has(attr.name)) // some parsed attributes might map to the same converted attribute (style,class...). (many-to-one)
                            {
                                var v = map.get(attr.name);
                                v.value.push(attr.value);
                            } else {
                            map.set(attr.name, {
                                quote: this.format_type.quote === null ? attribute.quote || '' : this.format_type.quote, //!!quote ? quote : attr.quote, 
                                value: [attr.value]
                            });
                        }
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            return attribs;
        }
    }, {
        key: 'format_attributes',
        value: function format_attributes(attributes) {
            if (!attributes) {
                return ['', null];
            }

            var attr_map = new Map();
            var children = [];

            var attr_stack = new _stack.stack();

            attr_stack.push_col(attributes);
            attr_stack.push_col(this.attributes);

            while (attr_stack.size) {
                attr_stack.push_col(this.format_attribute(attr_stack.pop(), attr_map, children));
            }

            // combine attribute names & values
            var attribs = [];
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = attr_map[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var _step4$value = _slicedToArray(_step4.value, 2),
                        k = _step4$value[0],
                        a = _step4$value[1];

                    var a_str = a.value.join(' ').trim();
                    if (!a_str) {
                        attribs.push(k);
                    } else {
                        attribs.push('' + k + this.format_type.eq + a.quote + a_str + a.quote);
                    }
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            return [attribs.join(' '), children];
        }
    }, {
        key: 'format_tag',
        value: function format_tag(attributes, name) {
            var close = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

            if (name === null) {
                return [''];
            }

            var attribs = '';
            var temp_children = [];
            if (attributes) {
                var _format_attributes = this.format_attributes(attributes);

                var _format_attributes2 = _slicedToArray(_format_attributes, 2);

                attribs = _format_attributes2[0];
                temp_children = _format_attributes2[1];
            }

            var mid = (name + ' ' + attribs).trim();

            return ['' + this.format_type.l_bracket + close + mid + this.format_type.r_bracket, temp_children];
        }
    }, {
        key: 'format_markup',
        value: function format_markup(def, children, attributes, open_name, close_name) {
            var open_tag = '';
            var close_tag = '';
            var temp_children = [];

            if (open_name === undefined) {
                open_name = this.name;
            }

            var _format_tag = this.format_tag(attributes, open_name);

            var _format_tag2 = _slicedToArray(_format_tag, 2);

            open_tag = _format_tag2[0];
            temp_children = _format_tag2[1];


            var _void = this.is_void !== undefined ? this.is_void : def.is_void;
            if (_void) {
                return open_tag;
            }

            var c_str = this.format_children(temp_children);
            c_str += this.format_children(children);

            if (typeof def.content_parser === 'function') {
                c_str = def.content_parser(this.format_type, c_str);
            }

            var _format_tag3 = this.format_tag(null, close_name === undefined ? this.name : close_name, '/');

            var _format_tag4 = _slicedToArray(_format_tag3, 2);

            close_tag = _format_tag4[0];
            temp_children = _format_tag4[1];


            return '' + open_tag + c_str + close_tag;
        }
    }, {
        key: 'format',
        value: function format(def, children, attributes) {
            return this.format_markup(def, children, attributes, this.name);
        }
    }]);

    return MarkupTagFormatter;
}(TagFormatter);

var BBCodeTagFormatter = exports.BBCodeTagFormatter = function (_MarkupTagFormatter) {
    _inherits(BBCodeTagFormatter, _MarkupTagFormatter);

    function BBCodeTagFormatter(tag_name, props) {
        _classCallCheck(this, BBCodeTagFormatter);

        return _possibleConstructorReturn(this, (BBCodeTagFormatter.__proto__ || Object.getPrototypeOf(BBCodeTagFormatter)).call(this, tag_name, _format3.bbcode_format, props));
    }

    _createClass(BBCodeTagFormatter, [{
        key: 'format',
        value: function format(def, children, attributes) {
            return this.format_markup(def, children, attributes, attributes.has(this.name) ? '' : this.name);
        }
    }]);

    return BBCodeTagFormatter;
}(MarkupTagFormatter);

var TagDefinition = function () {
    // formatters.

    // true: whitelist mode

    // if parent terminates before this tag: true start again in next parent; false terminate with current parent.
    // tag name
    function TagDefinition(name) {
        var children = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var formats = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
        var props = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

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
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = attributes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var a = _step5.value;

                    this.attributes.set(a.name, a);
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
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
                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = formats[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var f = _step6.value;

                        this.add_format(f);
                    }
                } catch (err) {
                    _didIteratorError6 = true;
                    _iteratorError6 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion6 && _iterator6.return) {
                            _iterator6.return();
                        }
                    } finally {
                        if (_didIteratorError6) {
                            throw _iteratorError6;
                        }
                    }
                }
            }
        }
    } // add missing attributes during format. false: empty string

    // valid parent tags.
    // other tags that cause this one to terminate/close.

    // tag is self-closing


    _createClass(TagDefinition, [{
        key: 'add_format',
        value: function add_format(fmt) {
            if (fmt instanceof BaseFormatter) {
                this.formats.set(fmt.format_type.name, fmt);
            }
        }
    }, {
        key: 'format',
        value: function format(_format2, children, attributes, tag) {
            if (this.formats.has(_format2)) {
                var fmtr = this.formats.get(_format2);
                return fmtr.format(this, children, attributes, tag);
            }

            return '';
        }
    }, {
        key: 'valid_child',
        value: function valid_child(node) {
            if (this.is_void) {
                return false;
            }
            if (this.terminate && this.terminate.has(node.name)) {
                return node;
            }

            if (node instanceof _nodes.TextNode && node.length <= 0) {
                return false;
            } // no empty text. 

            var def = node.def || node;
            if (def instanceof TagDefinition) {
                return (!this.children || this.children.has(def.name)) && def.valid_parent(this);
            }

            if (!this.type_child) {
                return true;
            }

            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = this.type_child[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var t = _step7.value;

                    if (node instanceof t) {
                        return true;
                    }
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                        _iterator7.return();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }

            return false;
        }
    }, {
        key: 'valid_parent',
        value: function valid_parent(tag) {
            if (!this.parents) {
                return this.parents_allow;
            }

            var name = void 0;
            if (typeof tag === 'string') {
                name = tag;
            } else if (tag instanceof TagDefinition || tag.name) {
                name = tag.name;
            } else if (tag.def) {
                name = tag.def.name;
            }

            return this.parents.has(name) ? this.parents_allow : !this.parents_allow;
        }
    }, {
        key: 'valid_attribute',
        value: function valid_attribute(attr) {
            if (this.__allow_all_attributes) {
                return true;
            }

            var name = '';
            if (typeof attr === 'string') {
                name = attr;
            } else if (attr instanceof AttributeDefinition || attr.name) {
                name = attr.name;
            } else if (attr.def) {
                name = attr.def.name;
            }

            return this.attributes.has(name);
        }

        // get attribute def

    }, {
        key: 'get_attribute',
        value: function get_attribute(name) {
            // null/undefined attributes means all are allowed.
            if (this.__allow_all_attributes && !this.attributes.has(name)) {
                // create definitions as needed.
                var def = new AttributeDefinition(name);
                var _iteratorNormalCompletion8 = true;
                var _didIteratorError8 = false;
                var _iteratorError8 = undefined;

                try {
                    for (var _iterator8 = this.formats[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                        var _step8$value = _slicedToArray(_step8.value, 2),
                            f = _step8$value[1];

                        def.add_format(new AttributeFormatter(name, f.format_type));
                    }
                } catch (err) {
                    _didIteratorError8 = true;
                    _iteratorError8 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                            _iterator8.return();
                        }
                    } finally {
                        if (_didIteratorError8) {
                            throw _iteratorError8;
                        }
                    }
                }

                this.attributes.set(name, def);
                return def;
            }

            return this.attributes.get(name);
        }
    }]);

    return TagDefinition;
}();

exports.TagDefinition = TagDefinition;
;