'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TagParser = exports.TagNode = exports.TagAttribute = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _error = require('./error');

var _nodes = require('./nodes');

var _stringIter = require('./string-iter');

var _helper = require('./helper');

var _def = require('./def');

var _format3 = require('./format');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Attribute
 */
var TagAttribute = function () {
    // if the value was in quotes it will be saved here.

    function TagAttribute(value, def, parent) {
        _classCallCheck(this, TagAttribute);

        this.quote = '';

        this.def = def;
        this.parent = parent;
        this.value = value;
    }

    _createClass(TagAttribute, [{
        key: 'is_valid',
        value: function is_valid() {
            return this.def && this.def.valid_value(this.value);
        }
    }, {
        key: 'format',
        value: function format(_format) {
            return this.def.format(_format, this.value, this);
        }
    }, {
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
            var v = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            this._value = this.def && this.def.validate ? this.def.validate(v) : v;
        }
    }], [{
        key: 'escape_value',
        value: function escape_value(value) {
            return JSON.stringify(value).slice(1, -1);
        }
    }]);

    return TagAttribute;
}();

/**
 * Tag
 */


exports.TagAttribute = TagAttribute;

var TagNode = function (_ContainerNode) {
    _inherits(TagNode, _ContainerNode);

    function TagNode(def) {
        var closing = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        _classCallCheck(this, TagNode);

        var _this = _possibleConstructorReturn(this, (TagNode.__proto__ || Object.getPrototypeOf(TagNode)).call(this));

        _this.attributes = new Map();


        if (!def) {
            throw new Error('TagNode requires a TagDefinition');
        }

        _this.def = def;
        _this.terminating = closing; // main parser expects a 'terminating' value
        return _this;
    }

    _createClass(TagNode, [{
        key: 'add_child',
        value: function add_child(node) {
            var allowed = this.def.valid_child(node);

            if (allowed === true) {
                node.parent = this;
                this.children.push(node);
            }

            return allowed;
        }
    }, {
        key: 'add_attribute',
        value: function add_attribute(attr) {
            if (attr && this.def.valid_attribute(attr)) {
                this.attributes.set(attr.name, attr);
                return true;
            }
            return false;
        }
    }, {
        key: 'compare',
        value: function compare(to) {
            return this.def.name === to.def.name || this.def.closing_name === to.def.name;
        }
    }, {
        key: 'clone',
        value: function clone() {
            var deep = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            var cln = new TagNode(this.def, this.terminating);
            cln.attributes = new Map(this.attributes);

            if (deep) {
                cln.children = this._clone_children(deep);
            }

            return cln;
        }
    }, {
        key: 'format',
        value: function format(_format2) {
            return this.def.format(_format2, this.children, this.attributes, this);
        }
    }, {
        key: 'terminate',
        value: function terminate(node) {
            if (this.def.terminate) {
                if (node instanceof TagNode) {
                    return this.def.terminate.has(node.name);
                } else if (typeof node === 'string') {
                    return this.def.terminate.has(node);
                }
            }

            return false;
        }
    }, {
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

    /**
     * @param tags tag definitions
     * @param delims parse delimiters
     * @param config extra properties.
     */
    // tag definitions
    function TagParser(tags, format) {
        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _classCallCheck(this, TagParser);

        var _this2 = _possibleConstructorReturn(this, (TagParser.__proto__ || Object.getPrototypeOf(TagParser)).call(this, format ? format.l_bracket : TagParser.default_format.l_bracket));

        _this2.tag_defs = new Map();
        _this2.valid_chars = new Set();
        _this2.fail = {
            illegal_attribute: false
        };


        _this2.create_tag = config.tag || TagParser._default_create_tag;
        _this2.create_attribute = config.attribute || TagParser._default_create_attribute;
        _this2.create_def = config.def || TagParser._default_create_def;
        _this2.parse_any = !!config.parse_any;

        Object.assign(_this2.fail, config.fail || {});

        _this2.format = format || TagParser.default_format;

        if (tags instanceof Map) {
            _this2.tag_defs = tags;
        } else if (tags) {
            tags = (0, _helper.ensure_array)(tags);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = tags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var t = _step.value;

                    _this2.add_tag(t);
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
        } else {
            _this2.parse_any = true; // if an undefined tag is encountered a generic definition will be created and it will be parsed.
        }

        // compile valid identifier character set (used during parse)
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = _this2.tag_defs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var _step2$value = _slicedToArray(_step2.value, 2),
                    n = _step2$value[0],
                    _t = _step2$value[1];

                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = n[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var c = _step3.value;

                        if (!(0, _helper.valid_identifier)(c)) {
                            _this2.valid_chars.add(c);
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

        return _this2;
    } // valid tag name characters. compiled from the given tag defs.

    // allowed attribute value quotes

    _createClass(TagParser, [{
        key: 'add_tag',
        value: function add_tag(def) {
            this.tag_defs.set(def.name, def);
        }
    }, {
        key: 'remove_tag',
        value: function remove_tag(name) {
            var def = this.tag_defs.get(name);
            this.tag_defs.delete(name);
            return def;
        }
    }, {
        key: '_attrib_value_parse',
        value: function _attrib_value_parse(itr, attrib, parser) {
            if (TagParser.quotes.includes(itr.value)) {
                attrib.quote = itr.value;
                return (0, _stringIter.substring_quoted)(itr);
            } else {
                var v = TagParser.valid_value_char;
                if (attrib.def && attrib.def.valid_char) {
                    v = attrib.def.valid_char;
                }
                return parser.identifier_parse(itr, v);
            }
        }
    }, {
        key: '_attribute_parse',
        value: function _attribute_parse(itr, tag, parser) {
            var name = parser.identifier_parse(itr);
            if (!name) throw new _error.NodeParseError('Invalid attribute name (' + name + ') in tag', tag);

            var adef = tag.def.get_attribute(name); // adef may be undefined/null; continue parsing to skip value.
            var attrib = this.create_attribute(null, adef, tag, itr.line, itr.column);

            parser.skip_whitespace(itr);
            if (itr.value !== this.format.eq) {
                if (!adef) {
                    if (this.fail.illegal_attribute) throw new _error.NodeParseError('Attribute "' + name + '" is not allowed in tag', tag);
                    return null;
                }
                if (!attrib.is_valid()) throw new _error.NodeParseError('Attribute missing required value', attrib);
            } else {
                itr.next(); // skip =
                attrib.value = this._attrib_value_parse(itr, attrib, parser);

                if (!adef) {
                    if (this.fail.illegal_attribute) throw new _error.NodeParseError('Attribute "' + name + '" is not allowed in tag', tag);
                    return null;
                }
                if (!attrib.is_valid()) throw new _error.NodeParseError('Attribute missing required value', attrib);
            }

            return attrib;
        }
    }, {
        key: 'parse_name',
        value: function parse_name(itr, parser) {
            var it = itr.clone();
            while (!itr.end() && ((0, _helper.valid_identifier)(itr.value) || this.valid_chars.has(itr.value))) {
                itr.next();
            }

            return (0, _stringIter.substring)(it, itr).toLowerCase();
        }
    }, {
        key: '_get_def',
        value: function _get_def(name, itr, parser) {
            if (!name) throw new _error.NullError();

            var def = this.tag_defs.get(name);
            if (!def) {
                if (this.parse_any) {
                    if (parser.is_whitespace(itr.value) || itr.value == this.format.r_bracket || this.self_attribute && itr.value === '=') {
                        return this.create_def(name);
                    }
                }

                throw new _error.NodeParseError('Invalid tag name', name, itr.line, itr.column);
            }

            return def;
        }
    }, {
        key: '_parse_attributes',
        value: function _parse_attributes(tag, itr, parser) {
            // parse attributes
            while (!itr.end()) {
                parser.skip_whitespace(itr);

                if (itr.value === this.format.r_bracket) {
                    break;
                }

                tag.add_attribute(this._attribute_parse(itr, tag, parser));
            }

            // check for missing required attributes.
            if (tag.def.attributes) {
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = tag.def.attributes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var _step4$value = _slicedToArray(_step4.value, 2),
                            name = _step4$value[0],
                            a = _step4$value[1];

                        if (a.required && !tag.attributes.has(name)) {
                            var ta = new TagAttribute(null, a, tag);

                            // required attribute could not be met.
                            if (!ta.is_valid()) throw new _error.NodeParseError('Missing required attribute (' + name + ') or value', tag);

                            tag.add_attribute(ta);
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
            }
        }
    }, {
        key: 'parse',
        value: function parse(itr, parser) {
            if (itr.value !== this.format.l_bracket) return null;

            itr.next();

            var closing = false;
            if (closing = itr.value === this.format.term) {
                itr.next();
            }

            var it = itr.clone(); // might need to set back
            var name = this.parse_name(itr, parser);
            var def = this._get_def(name, itr, parser);
            var tag = this.create_tag(def, closing, itr.line, itr.column);

            if (!closing) {
                // allow tags to be their own attribute
                if (itr.value === this.format.eq && this.format.self_attribute) {
                    itr.set(it); // set back to parse tagname as attribute
                }
                this._parse_attributes(tag, itr, parser);
            }

            parser.skip_whitespace(itr);
            if (itr.value !== this.format.r_bracket) {
                throw new _error.NodeParseError('Malformed Closing Tag: missing ' + this.format.r_bracket, tag);
            }

            itr.next(); // skip ]
            return tag;
        }
    }], [{
        key: '_default_create_def',
        value: function _default_create_def(name) {
            return new _def.TagDefinition(name);
        }
    }, {
        key: '_default_create_tag',
        value: function _default_create_tag(def, closing, line, column) {
            var t = new TagNode(def, closing);
            t.__line = line;
            t.__column = column;
            return t;
        }
    }, {
        key: '_default_create_attribute',
        value: function _default_create_attribute(value, def, parent, line, column) {
            var a = new TagAttribute(value, def, parent);
            a.__line = line;
            a.__column = column;
            return a;
        }
    }, {
        key: 'valid_value_char',
        value: function valid_value_char(c) {
            return (0, _helper.valid_identifier)(c, true);
        }
    }]);

    return TagParser;
}(_nodes.NodeParser);

TagParser.default_format = _format3.bbcode_format;
TagParser.quotes = ['\'', '"'];