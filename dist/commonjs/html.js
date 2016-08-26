System.register([], function (_export, _context) {
    "use strict";

    return {
        setters: [],
        execute: function () {
            define(['exports', './nodes', './tag_parser', './format', './def'], function (exports, _nodes, _tag_parser, _format, _def) {
                'use strict';

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.HtmlTagDef = exports.ContentWrapTagFormatter = exports.AttrJoinTagFormatter = exports.HeaderTagFormatter = exports.HtmlCTATagFormatter = exports.HtmlTagFormatter = exports.ClassAttrFormatter = exports.AttrTagFormatter = exports.NumberStyleAttrFormatter = exports.ColorStyleAttrFormatter = exports.StyleAttrFormatter = exports.UrlAttrFormatter = exports.HtmlAttrFormatter = undefined;

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

                var HtmlAttrFormatter = exports.HtmlAttrFormatter = function (_AttributeFormatter) {
                    _inherits(HtmlAttrFormatter, _AttributeFormatter);

                    function HtmlAttrFormatter(name, props) {
                        _classCallCheck(this, HtmlAttrFormatter);

                        return _possibleConstructorReturn(this, _AttributeFormatter.call(this, name, _format.html_format, props));
                    }

                    return HtmlAttrFormatter;
                }(_def.AttributeFormatter);

                var UrlAttrFormatter = exports.UrlAttrFormatter = function (_HtmlAttrFormatter) {
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
                }(HtmlAttrFormatter);

                var StyleAttrFormatter = exports.StyleAttrFormatter = function (_HtmlAttrFormatter2) {
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
                }(HtmlAttrFormatter);

                var ColorStyleAttrFormatter = exports.ColorStyleAttrFormatter = function (_StyleAttrFormatter) {
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
                }(StyleAttrFormatter);

                ColorStyleAttrFormatter.regex = [/(#(?:[0-9a-fA-F]{3}){1,2})/, /(rgba\((?:\s*(?:[1]?[0-9]{1,2}|2(?:[0-5]{1,2}|[0-4][0-9]))\s*,){3}\s*(?:1|0?\.[0-9]+\s*){1}\)){1}/, /(rgb\((?:\s*(?:[1]?[0-9]{1,2}|2(?:[0-5]{1,2}|[0-4][0-9]))\s*,?){3}\)){1}/, /((?:[0-9a-fA-F]{3}){1,2})/];
                ColorStyleAttrFormatter.names = ['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'grey', 'green', 'greenyellow', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'];

                var NumberStyleAttrFormatter = exports.NumberStyleAttrFormatter = function (_StyleAttrFormatter2) {
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
                }(StyleAttrFormatter);

                var AttrTagFormatter = exports.AttrTagFormatter = function (_HtmlAttrFormatter3) {
                    _inherits(AttrTagFormatter, _HtmlAttrFormatter3);

                    function AttrTagFormatter(tag_def, props) {
                        _classCallCheck(this, AttrTagFormatter);

                        var _this6 = _possibleConstructorReturn(this, _HtmlAttrFormatter3.call(this, '', props));

                        _this6.tag_def = tag_def;
                        return _this6;
                    }

                    AttrTagFormatter.prototype.format = function format(value) {
                        var tag = new _tag_parser.TagNode(this.tag_def);
                        tag.add_child(new _nodes.TextNode(value));

                        return tag;
                    };

                    return AttrTagFormatter;
                }(HtmlAttrFormatter);

                var ClassAttrFormatter = exports.ClassAttrFormatter = function (_HtmlAttrFormatter4) {
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
                }(HtmlAttrFormatter);

                var HtmlTagFormatter = exports.HtmlTagFormatter = function (_MarkupTagFormatter) {
                    _inherits(HtmlTagFormatter, _MarkupTagFormatter);

                    function HtmlTagFormatter(tag_name, attributes, props) {
                        _classCallCheck(this, HtmlTagFormatter);

                        return _possibleConstructorReturn(this, _MarkupTagFormatter.call(this, tag_name, _format.html_format, attributes, props));
                    }

                    return HtmlTagFormatter;
                }(_def.MarkupTagFormatter);

                var HtmlCTATagFormatter = exports.HtmlCTATagFormatter = function (_HtmlTagFormatter) {
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
                            } else if (children.length === 1 && children[0] instanceof _nodes.TextNode) {
                                var _attr = new Map(attributes);

                                var value = children[0].value;
                                if (typeof this.alt === 'string') {
                                    _attr.set(this.alt, new TagAttribute(value, new _def.AttributeDefinition(this.alt, new _def.AttributeFormatter(this.alt, this.format_type))));
                                } else if (this.alt instanceof _def.AttributeDefinition) {
                                    _attr.set(this.alt.name, new TagAttribute(value, this.alt));
                                } else if (this.alt instanceof _def.AttributeFormatter) {
                                    var f = new _def.AttributeDefinition(this.alt.name, true, this.alt);
                                    _attr.set(this.alt.name, new TagAttribute(value, f));
                                }

                                return _HtmlTagFormatter.prototype.format.call(this, def, children, _attr);
                            }
                        } else if (children && children.length === 1 && children[0] instanceof _nodes.TextNode) {
                            var _attr2 = new Map(attributes);
                            _attr2.set(this.required, new TagAttribute(children[0].value, def.get_attribute(this.required)));

                            return _HtmlTagFormatter.prototype.format.call(this, def, children, _attr2);
                        }

                        return '';
                    };

                    return HtmlCTATagFormatter;
                }(HtmlTagFormatter);

                var HeaderTagFormatter = exports.HeaderTagFormatter = function (_HtmlTagFormatter2) {
                    _inherits(HeaderTagFormatter, _HtmlTagFormatter2);

                    function HeaderTagFormatter(name, def, attributes, props) {
                        _classCallCheck(this, HeaderTagFormatter);

                        var _this10 = _possibleConstructorReturn(this, _HtmlTagFormatter2.call(this, name, attributes, props));

                        _this10.def = def;return _this10;
                    }

                    HeaderTagFormatter.prototype.format = function format(def, children, attributes) {
                        var _children = [];

                        var tag = new _tag_parser.TagNode(this.def);

                        tag.add_child(new _nodes.TextNode(attributes.has(def.name) ? attributes.get(def.name).value : def.name));

                        _children.push(tag);

                        return _HtmlTagFormatter2.prototype.format.call(this, def, _children.concat(children), attributes);
                    };

                    return HeaderTagFormatter;
                }(HtmlTagFormatter);

                var AttrJoinTagFormatter = exports.AttrJoinTagFormatter = function (_HtmlTagFormatter3) {
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
                }(HtmlTagFormatter);

                var ContentWrapTagFormatter = exports.ContentWrapTagFormatter = function (_BaseFormatter) {
                    _inherits(ContentWrapTagFormatter, _BaseFormatter);

                    function ContentWrapTagFormatter(shell, wrap) {
                        _classCallCheck(this, ContentWrapTagFormatter);

                        var _this12 = _possibleConstructorReturn(this, _BaseFormatter.call(this, _format.html_format));

                        if (!(shell instanceof _def.TagDefinition) || !(wrap instanceof _def.TagDefinition)) {
                            throw new Error('Shell & Wrap require a TagDefinition type');
                        }
                        _this12.shell = shell;
                        _this12.wrap = wrap;
                        return _this12;
                    }

                    ContentWrapTagFormatter.prototype.format = function format(def, children, attributes) {

                        var tag = new _tag_parser.TagNode(this.shell);
                        var wrap_tag = new _tag_parser.TagNode(this.wrap);

                        tag.attributes = attributes;
                        tag.children = [wrap_tag];

                        wrap_tag.children = children;

                        return tag.format(this.format_type.name);
                    };

                    return ContentWrapTagFormatter;
                }(_def.BaseFormatter);

                var HtmlTagDef = exports.HtmlTagDef = function (_TagDefinition) {
                    _inherits(HtmlTagDef, _TagDefinition);

                    function HtmlTagDef(name, a_or_f, props) {
                        _classCallCheck(this, HtmlTagDef);

                        return _possibleConstructorReturn(this, _TagDefinition.call(this, name, null, null, a_or_f instanceof _def.BaseFormatter ? a_or_f : new HtmlTagFormatter(name, a_or_f), props));
                    }

                    return HtmlTagDef;
                }(_def.TagDefinition);
            });
        }
    };
});