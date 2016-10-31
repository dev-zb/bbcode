'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HtmlTagDef = exports.ContentWrapTagFormatter = exports.AttrJoinTagFormatter = exports.HeaderTagFormatter = exports.HtmlCTATagFormatter = exports.HtmlTagFormatter = exports.ClassAttrFormatter = exports.AttrTagFormatter = exports.NumberStyleAttrFormatter = exports.ColorStyleAttrFormatter = exports.StyleAttrFormatter = exports.UrlAttrFormatter = exports.HtmlAttrFormatter = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodes = require('./nodes');

var _tagParser = require('./tag-parser');

var _format = require('./format');

var _def = require('./def');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * ==================== 
 * Attribute Fromatters
 * ==================== 
 */

/**
 * Basic attribute formatter
 */
var HtmlAttrFormatter = exports.HtmlAttrFormatter = function (_AttributeFormatter) {
    _inherits(HtmlAttrFormatter, _AttributeFormatter);

    /**
     * @param name tag name when converted to html
     * @param props optional object with extra properties.
     */
    function HtmlAttrFormatter(name, props) {
        _classCallCheck(this, HtmlAttrFormatter);

        return _possibleConstructorReturn(this, (HtmlAttrFormatter.__proto__ || Object.getPrototypeOf(HtmlAttrFormatter)).call(this, name, _format.html_format, props));
    }

    return HtmlAttrFormatter;
}(_def.AttributeFormatter);

/**
 * Url Attribute Formatter
 */


var UrlAttrFormatter = exports.UrlAttrFormatter = function (_HtmlAttrFormatter) {
    _inherits(UrlAttrFormatter, _HtmlAttrFormatter);

    function UrlAttrFormatter(name, props) {
        _classCallCheck(this, UrlAttrFormatter);

        var _this2 = _possibleConstructorReturn(this, (UrlAttrFormatter.__proto__ || Object.getPrototypeOf(UrlAttrFormatter)).call(this, name, props));

        _this2.regex = /^((?:ht|f)tp(?:s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?)$/;
        return _this2;
    }

    /**
     * Sanitize url
     * @param value the parsed url (typically [url=VALUE])
     */

    // default url sanitize regex


    _createClass(UrlAttrFormatter, [{
        key: 'sanitize',
        value: function sanitize(value) {
            var result = void 0;
            if (result = this.regex.exec(value)) {
                return result[1];
            }
            return null;
        }
    }]);

    return UrlAttrFormatter;
}(HtmlAttrFormatter);

/**
 * An attribute that maps to a css style (color, font-size, etc)
 */


var StyleAttrFormatter = exports.StyleAttrFormatter = function (_HtmlAttrFormatter2) {
    _inherits(StyleAttrFormatter, _HtmlAttrFormatter2);

    /**
     * @param style_name name of the css property
     */
    function StyleAttrFormatter(style_name, props) {
        _classCallCheck(this, StyleAttrFormatter);

        var _this3 = _possibleConstructorReturn(this, (StyleAttrFormatter.__proto__ || Object.getPrototypeOf(StyleAttrFormatter)).call(this, 'style', props));

        _this3.style_name = style_name;
        return _this3;
    }

    /**
     * @return string style_name: value;
     */


    _createClass(StyleAttrFormatter, [{
        key: 'format',
        value: function format(value) {
            var v = _get(StyleAttrFormatter.prototype.__proto__ || Object.getPrototypeOf(StyleAttrFormatter.prototype), 'format', this).call(this, value);
            v.value = this.style_name + ': ' + v.value + ';';
            return v;
        }
    }]);

    return StyleAttrFormatter;
}(HtmlAttrFormatter);

/**
 * CSS color property attribute
 */


var ColorStyleAttrFormatter = exports.ColorStyleAttrFormatter = function (_StyleAttrFormatter) {
    _inherits(ColorStyleAttrFormatter, _StyleAttrFormatter);

    function ColorStyleAttrFormatter(name, props) {
        _classCallCheck(this, ColorStyleAttrFormatter);

        var _this4 = _possibleConstructorReturn(this, (ColorStyleAttrFormatter.__proto__ || Object.getPrototypeOf(ColorStyleAttrFormatter)).call(this, name, props));

        _this4.regex = ColorStyleAttrFormatter.regex;
        _this4.names = ColorStyleAttrFormatter.names;
        return _this4;
    } // default. pass alternate in props


    _createClass(ColorStyleAttrFormatter, [{
        key: 'sanitize',
        value: function sanitize(color) {
            if (this.names.includes(color.toLowerCase())) {
                return color;
            } else {
                var result = void 0;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.regex[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var rx = _step.value;

                        if (result = rx.exec(color)) {
                            return result[1];
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
            }

            return 'inherit';
        }
    }]);

    return ColorStyleAttrFormatter;
}(StyleAttrFormatter);

/**
 * Attribute that maps to a css number property (font-size,...)
 */


ColorStyleAttrFormatter.regex = [/(#(?:[0-9a-fA-F]{3}){1,2})/, // hex color
/(rgba\((?:\s*(?:[1]?[0-9]{1,2}|2(?:[0-5]{1,2}|[0-4][0-9]))\s*,){3}\s*(?:1|0?\.[0-9]+\s*){1}\)){1}/, // 255,255,255,1.0 color            
/(rgb\((?:\s*(?:[1]?[0-9]{1,2}|2(?:[0-5]{1,2}|[0-4][0-9]))\s*,?){3}\)){1}/, // 255,255,255 color
/((?:[0-9a-fA-F]{3}){1,2})/];
ColorStyleAttrFormatter.names = ['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'grey', 'green', 'greenyellow', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'];

var NumberStyleAttrFormatter = exports.NumberStyleAttrFormatter = function (_StyleAttrFormatter2) {
    _inherits(NumberStyleAttrFormatter, _StyleAttrFormatter2);

    function NumberStyleAttrFormatter(style_name, units, min, max, props) {
        _classCallCheck(this, NumberStyleAttrFormatter);

        var _this5 = _possibleConstructorReturn(this, (NumberStyleAttrFormatter.__proto__ || Object.getPrototypeOf(NumberStyleAttrFormatter)).call(this, style_name, props));

        _this5.units = units;
        _this5.min = min;
        _this5.max = max;
        return _this5;
    }

    _createClass(NumberStyleAttrFormatter, [{
        key: 'sanitize',
        value: function sanitize(value) {
            var num = +value || this.min;
            return Math.min(Math.max(this.min, num), this.max) + this.units;
        }
    }]);

    return NumberStyleAttrFormatter;
}(StyleAttrFormatter);

/**
 *  Attribute that formats to a child tag
 */


var AttrTagFormatter = exports.AttrTagFormatter = function (_HtmlAttrFormatter3) {
    _inherits(AttrTagFormatter, _HtmlAttrFormatter3);

    function AttrTagFormatter(tag_def, props) {
        _classCallCheck(this, AttrTagFormatter);

        var _this6 = _possibleConstructorReturn(this, (AttrTagFormatter.__proto__ || Object.getPrototypeOf(AttrTagFormatter)).call(this, '', props));

        _this6.tag_def = tag_def;
        return _this6;
    }

    _createClass(AttrTagFormatter, [{
        key: 'format',
        value: function format(value) {
            var tag = new _tagParser.TagNode(this.tag_def);
            tag.add_child(new _nodes.TextNode(value));

            return tag;
        }
    }]);

    return AttrTagFormatter;
}(HtmlAttrFormatter);

/**
 * Attribute value maps to class=""
 */


var ClassAttrFormatter = exports.ClassAttrFormatter = function (_HtmlAttrFormatter4) {
    _inherits(ClassAttrFormatter, _HtmlAttrFormatter4);

    /**
     * set 'props.use_value' to use the set value with the given class string.
     */
    function ClassAttrFormatter(class_string, props) {
        _classCallCheck(this, ClassAttrFormatter);

        var _this7 = _possibleConstructorReturn(this, (ClassAttrFormatter.__proto__ || Object.getPrototypeOf(ClassAttrFormatter)).call(this, 'class', props));

        _this7.classes = class_string;
        return _this7;
    }

    _createClass(ClassAttrFormatter, [{
        key: 'format',
        value: function format(value) {
            return _get(ClassAttrFormatter.prototype.__proto__ || Object.getPrototypeOf(ClassAttrFormatter.prototype), 'format', this).call(this, this.classes + (this.use_value ? value : ''));
        }
    }]);

    return ClassAttrFormatter;
}(HtmlAttrFormatter);

/**
 * ========================
 *      Tag Formatters
 * ========================
 */

/**
 * Base Html Tag Formatter
 */


var HtmlTagFormatter = exports.HtmlTagFormatter = function (_MarkupTagFormatter) {
    _inherits(HtmlTagFormatter, _MarkupTagFormatter);

    /**
     * @param tag_name name of the tag when converted to html
     */
    function HtmlTagFormatter(tag_name, attributes, props) {
        _classCallCheck(this, HtmlTagFormatter);

        return _possibleConstructorReturn(this, (HtmlTagFormatter.__proto__ || Object.getPrototypeOf(HtmlTagFormatter)).call(this, tag_name, _format.html_format, attributes, props));
    }

    return HtmlTagFormatter;
}(_def.MarkupTagFormatter);

/**
 *  Fill a missing required attribute with the child contents (if possible) 
 */


var HtmlCTATagFormatter = exports.HtmlCTATagFormatter = function (_HtmlTagFormatter) {
    _inherits(HtmlCTATagFormatter, _HtmlTagFormatter);

    function HtmlCTATagFormatter(tag_name, required, alt, attributes, props) {
        _classCallCheck(this, HtmlCTATagFormatter);

        var _this9 = _possibleConstructorReturn(this, (HtmlCTATagFormatter.__proto__ || Object.getPrototypeOf(HtmlCTATagFormatter)).call(this, tag_name, attributes, props));

        _this9.required = required; // of required attribute that will steal the content (if possible)
        _this9.alt = alt; // use content as an alternate attribute is required exists [null/undefined = leave content as content]
        return _this9;
    }

    _createClass(HtmlCTATagFormatter, [{
        key: 'format',
        value: function format(def, children, attributes) {
            if (attributes && attributes.has(this.required)) {
                if (!this.alt) {
                    return _get(HtmlCTATagFormatter.prototype.__proto__ || Object.getPrototypeOf(HtmlCTATagFormatter.prototype), 'format', this).call(this, def, children, attributes);
                } else if (children.length === 1 && children[0] instanceof _nodes.TextNode) {
                    var _attr = new Map(attributes); // don't modify parsed attributes

                    var value = children[0].value;
                    if (typeof this.alt === 'string') {
                        _attr.set(this.alt, new TagAttribute(value, new _def.AttributeDefinition(this.alt, new _def.AttributeFormatter(this.alt, this.format_type))));
                    } else if (this.alt instanceof _def.AttributeDefinition) {
                        _attr.set(this.alt.name, new TagAttribute(value, this.alt));
                    } else if (this.alt instanceof _def.AttributeFormatter) {
                        var f = new _def.AttributeDefinition(this.alt.name, true, this.alt);
                        _attr.set(this.alt.name, new TagAttribute(value, f));
                    }

                    return _get(HtmlCTATagFormatter.prototype.__proto__ || Object.getPrototypeOf(HtmlCTATagFormatter.prototype), 'format', this).call(this, def, children, _attr);
                }
            } else if (children && children.length === 1 && children[0] instanceof _nodes.TextNode) {
                var _attr2 = new Map(attributes);
                _attr2.set(this.required, new TagAttribute(children[0].value, def.get_attribute(this.required)));

                return _get(HtmlCTATagFormatter.prototype.__proto__ || Object.getPrototypeOf(HtmlCTATagFormatter.prototype), 'format', this).call(this, def, children, _attr2);
            }

            return '';
        }
    }]);

    return HtmlCTATagFormatter;
}(HtmlTagFormatter);

/**
 * Use an attribute (value) to create a child tag
 */


var HeaderTagFormatter = exports.HeaderTagFormatter = function (_HtmlTagFormatter2) {
    _inherits(HeaderTagFormatter, _HtmlTagFormatter2);

    function HeaderTagFormatter(name, def, attributes, props) {
        _classCallCheck(this, HeaderTagFormatter);

        var _this10 = _possibleConstructorReturn(this, (HeaderTagFormatter.__proto__ || Object.getPrototypeOf(HeaderTagFormatter)).call(this, name, attributes, props));

        _this10.def = def; // attribute definition
        return _this10;
    }

    _createClass(HeaderTagFormatter, [{
        key: 'format',
        value: function format(def, children, attributes) {
            var _children = [];

            var tag = new _tagParser.TagNode(this.def);

            tag.add_child(new _nodes.TextNode(attributes.has(def.name) ? attributes.get(def.name).value : def.name));

            _children.push(tag);

            return _get(HeaderTagFormatter.prototype.__proto__ || Object.getPrototypeOf(HeaderTagFormatter.prototype), 'format', this).call(this, def, _children.concat(children), attributes);
        }
    }]);

    return HeaderTagFormatter;
}(HtmlTagFormatter);

/**
 * joins an attribute value with the name to create a tag.
 */


var AttrJoinTagFormatter = exports.AttrJoinTagFormatter = function (_HtmlTagFormatter3) {
    _inherits(AttrJoinTagFormatter, _HtmlTagFormatter3);

    function AttrJoinTagFormatter(name, attr_name, attributes) {
        var props = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { format_value: true };

        _classCallCheck(this, AttrJoinTagFormatter);

        var _this11 = _possibleConstructorReturn(this, (AttrJoinTagFormatter.__proto__ || Object.getPrototypeOf(AttrJoinTagFormatter)).call(this, name, attributes, props));

        _this11.attr_name = attr_name;
        return _this11;
    }

    _createClass(AttrJoinTagFormatter, [{
        key: 'format',
        value: function format(def, children, attributes) {

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
            return _get(AttrJoinTagFormatter.prototype.__proto__ || Object.getPrototypeOf(AttrJoinTagFormatter.prototype), 'format_markup', this).call(this, def, children, attributes, name, name);
        }
    }]);

    return AttrJoinTagFormatter;
}(HtmlTagFormatter);

/**
 *  wraps content in a given tagdef
 */


var ContentWrapTagFormatter = exports.ContentWrapTagFormatter = function (_BaseFormatter) {
    _inherits(ContentWrapTagFormatter, _BaseFormatter);

    function ContentWrapTagFormatter(shell, wrap) {
        _classCallCheck(this, ContentWrapTagFormatter);

        var _this12 = _possibleConstructorReturn(this, (ContentWrapTagFormatter.__proto__ || Object.getPrototypeOf(ContentWrapTagFormatter)).call(this, _format.html_format));

        if (!(shell instanceof _def.TagDefinition) || !(wrap instanceof _def.TagDefinition)) {
            throw new Error('Shell & Wrap require a TagDefinition type');
        }
        _this12.shell = shell;
        _this12.wrap = wrap;
        return _this12;
    }

    _createClass(ContentWrapTagFormatter, [{
        key: 'format',
        value: function format(def, children, attributes) {
            /*
                given a tag
                      <shell attributes>
                        <wrap>content</wrap>
                    </shell>
            */

            var tag = new _tagParser.TagNode(this.shell);
            var wrap_tag = new _tagParser.TagNode(this.wrap);

            tag.attributes = attributes;
            tag.children = [wrap_tag];

            wrap_tag.children = children;

            return tag.format(this.format_type.name);
        }
    }]);

    return ContentWrapTagFormatter;
}(_def.BaseFormatter);

/**
 * util class to simplify creating tag-defs used by the formatters.
 */


var HtmlTagDef = exports.HtmlTagDef = function (_TagDefinition) {
    _inherits(HtmlTagDef, _TagDefinition);

    // a_or_f : attributes or a formatter.
    function HtmlTagDef(name, a_or_f, props) {
        _classCallCheck(this, HtmlTagDef);

        return _possibleConstructorReturn(this, (HtmlTagDef.__proto__ || Object.getPrototypeOf(HtmlTagDef)).call(this, name, null, null, a_or_f instanceof _def.BaseFormatter ? a_or_f : new HtmlTagFormatter(name, a_or_f), props));
    }

    return HtmlTagDef;
}(_def.TagDefinition);