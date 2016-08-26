System.register([], function (_export, _context) {
    "use strict";

    return {
        setters: [],
        execute: function () {
            define(['exports', './parser', './tag_parser', './nodes', './format', './def', './html'], function (exports, _parser, _tag_parser, _nodes, _format, _def, _html) {
                'use strict';

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.html_parser = exports.bbcode_parser = undefined;

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

                var p_el_a = 'a,em,strong,small,mark,abbr,dfn,i,b,s,u,code,var,samp,kbd,sup,sub,q,cite,span,bdo,bdi,br,wbr,ins,del,img,map,area,video,audio,input,textarea,select,button,label,output,datalist,keygen,progress,command,canvas,time,meter'.split(',');
                var f_el_a = 'p,hr,pre,ul,ol,dl,div,h1,h2,h3,h4,h5,h6,hgroup,address,blockquote,ins,del,map,section,nav,article,aside,header,footer,figure,table,form,fieldset,menu,details,iframe,object,script,noscript,link,style,meta'.split(',').concat(p_el_a);

                var p_el = new Set(p_el_a);
                var f_el = new Set(f_el_a);

                var StyleFormatter = function (_HtmlAttrFormatter) {
                    _inherits(StyleFormatter, _HtmlAttrFormatter);

                    function StyleFormatter() {
                        _classCallCheck(this, StyleFormatter);

                        return _possibleConstructorReturn(this, _HtmlAttrFormatter.call(this, 'style'));
                    }

                    StyleFormatter.prototype.sanitize = function sanitize(value) {
                        var p = void 0;
                        var _value = [];
                        while ((p = StyleFormatter.regex.exec(value)) !== null) {
                            _value.push(p[1] + ': ' + p[2]);
                        }

                        return _value.join('; ');
                    };

                    return StyleFormatter;
                }(_html.HtmlAttrFormatter);

                StyleFormatter.regex = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:^"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;

                var ClassFormatter = function (_HtmlAttrFormatter2) {
                    _inherits(ClassFormatter, _HtmlAttrFormatter2);

                    function ClassFormatter() {
                        _classCallCheck(this, ClassFormatter);

                        return _possibleConstructorReturn(this, _HtmlAttrFormatter2.call(this, 'class'));
                    }

                    ClassFormatter.prototype.sanitize = function sanitize(value) {
                        var classes = value.split(' ');
                        var v = null;
                        var r = [];
                        for (var _iterator = classes, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                            var _ref;

                            if (_isArray) {
                                if (_i >= _iterator.length) break;
                                _ref = _iterator[_i++];
                            } else {
                                _i = _iterator.next();
                                if (_i.done) break;
                                _ref = _i.value;
                            }

                            var c = _ref;

                            if ((v = ClassFormatter.regex.exec(c)) !== null) {
                                r.push(c);
                            }
                        }
                        return r.join(' ');
                    };

                    return ClassFormatter;
                }(_html.HtmlAttrFormatter);

                ClassFormatter.regex = /^([\w\-]*)$/;

                function _a(name, p) {
                    return new _def.AttributeDefinition(name, new _html.HtmlAttrFormatter(name), p);
                }
                function _u(name, p) {
                    return new _def.UrlAttrDefinition(name, new _html.UrlAttrFormatter(name), p);
                }
                function _n(name) {
                    var min = arguments.length <= 1 || arguments[1] === undefined ? Number.MIN_VALUE : arguments[1];
                    var max = arguments.length <= 2 || arguments[2] === undefined ? Number.MAX_VALUE : arguments[2];
                    var p = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
                    return new _def.NumberAttrDefinition(name, min, max, new _html.HtmlAttrFormatter(name), p);
                }
                function _l(name, list) {
                    var def = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
                    var r = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];
                    var p = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
                    return new _def.ApprovedAttrDefinition(name, list, new _html.HtmlAttrFormatter(name), Object.assign(p, { default_index: def, required: r }));
                }
                function _b(name) {
                    var r = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
                    var p = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
                    return _l(name, [name, ''], 0, r, Object.assign(p, { require_value: false }));
                }

                var style = new _def.AttributeDefinition('style', new StyleFormatter());
                var css = new _def.AttributeDefinition('class', new ClassFormatter());
                var id = _a('id');
                var title = _a('title');
                var src = _u('src');
                var href = _u('href');
                var icon = _u('icon');
                var target = _a('target');
                var tabindex = _n('tabindex');
                var alt = _a('alt', { require_value: true, required: true, default_value: '' });
                var shape = _l('shape', ['rect', 'circle', 'poly', 'default'], 3);
                var coords = _a('coords');
                var cite = _u('cite');
                var button_type = _l('type', ['submit', 'reset', 'button']);
                var cmd_type = _l('type', ['command', 'radio', 'checkbox']);
                var name = _a('name');
                var value = _a('value');
                var disabled = _b('disabled');
                var width = _n('width', 0);
                var height = _n('height', 0);
                var span = _n('span', 0);
                var size = _n('size', 0);
                var label = _a('label');
                var checked = _b('checked');
                var radiogroup = _a('radiogroup');
                var datetime = _a('datetime');
                var open = _a('open');
                var action = _u('action');
                var method = _l('method', ['get', 'post']);
                var enctype = _l('enctype', ['application/x-www-form-urlencoded', 'mulitpart/form-data', 'text/plain']);
                var ismap = _b('ismap');
                var usemap = _a('usemap');
                var input_type = _l('type', 'text,password,checkbox,radio,button,submit,reset,file,hidden,image,datetime,datetime-local,date,month,time,week,number,range,email,url,search,tel,color'.split(','));
                var list = _a('list');
                var required = _b('required');
                var readonly = _b('readonly');
                var autofocus = _b('autofocus');
                var pattern = _a('pattern');
                var placeholder = _a('placeholder');
                var maxlength = _n('maxlength', 0, Number.MAX_VALUE);
                var min = _n('min');
                var max = _n('max');
                var step = _n('step');
                var challenge = _a('challenge');
                var keytype = _a('keytype');
                var label_for = _a('for');
                var high = _n('high');
                var low = _n('low');
                var optimum = _n('optimum');
                var form = _a('form');
                var multiple = _b('multiple');
                var mimetype = _a('type');
                var media = _a('media');
                var dirname = _a('dirname', { require_value: true });
                var rows = _n('rows', 0);
                var cols = _n('cols', 0);
                var wrap = _l('wrap', ['hard', 'soft'], 0, false, { require_value: true });
                var colspan = _n('colspan', 0);
                var rowspan = _n('rowspan', 0);
                var th_scope = _l('scope', ['row', 'col', 'rowgroup', 'colgroup'], 0, false);
                var headers = _a('headers');
                var reversed = _b('reversed');

                var autoplay = _b('autoplay');
                var preload = _l('preload', ['none', 'metadata', 'auto', ''], 2, false, { require_value: false });
                var controls = _b('controls');
                var loop = _b('loop');
                var poster = _u('poster');
                var mediagroup = _a('mediagroup');
                var muted = _b('muted');

                var global = [style, css, title, tabindex, id];

                function t(name, el) {
                    var attr = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
                    var props = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

                    return new _def.TagDefinition(name, el, global.concat(attr), new _html.HtmlTagFormatter(name), props);
                }

                var elements = [t('a', f_el, [href, target], { terminate: 'a', parents: 'button', parents_allow: false }), t('abbr', p_el), t('address', f_el, [], { terminate: 'address' }), t('area', [], [href, target, alt, shape, coords], { is_void: true }), t('article', f_el, [], { parents: 'address', parents_allow: false }), t('aside', f_el, [], { parents: 'address', parents_allow: false }), t('b', p_el), t('bdi', p_el), t('bdo', p_el), t('blockquote', f_el, [cite]), t('br', [], [], { is_void: true }), t('button', p_el, [button_type, name, value, disabled]), t('canvas', f_el, [width, height]), t('caption', f_el, { parents: 'table' }), t('cite', p_el, []), t('code', p_el), t('col', [], [span], { is_void: true, parents: 'colgroup' }), t('colgroup', 'col', [span], { parents: 'table', terminate: 'colgroup' }), t('command', p_el, [cmd_type, label, disabled, icon, checked, radiogroup], { is_void: true }), t('datalist', p_el_a.concat(['option'])), t('dd', f_el, [], { overflow: false, terminate: 'dd', parents: 'dl' }), t('del', f_el, [cite, datetime]), t('details', f_el_a.concat(['summary']), [open], { parents: ['a', 'button'], parents_allow: false }), t('dfn', p_el, [], { parents: 'dfn', parents_allow: false }), t('div', f_el), t('dl', ['dt', 'dd']), t('dt', [], { terminate: ['dd', 'dt'], parents: 'dl' }), t('em', p_el), t('fieldset', f_el_a.concat(['legend']), [name, disabled, form]), t('figcaption', f_el, [], { parents: 'figure' }), t('figure', f_el_a.concat(['figcaption'])), t('footer', f_el, []), t('form', f_el, [action, method, enctype, name, target]), t('h1', p_el, [], { parents: 'address', parents_allow: false }), t('h2', p_el, [], { parents: 'address', parents_allow: false }), t('h3', p_el, [], { parents: 'address', parents_allow: false }), t('h4', p_el, [], { parents: 'address', parents_allow: false }), t('h5', p_el, [], { parents: 'address', parents_allow: false }), t('h6', p_el, [], { parents: 'address', parents_allow: false }), t('header', f_el, [], { parents: ['footer', 'header', 'address'], parents_allow: false }), t('hgroup', 'h1,h2,h3,h4,h5,h6'.split(',')), t('hr', [], [], { is_void: true }), t('i', p_el), t('img', [], [src, alt, height, width, ismap, usemap], { is_void: true }), t('input', [], [input_type, dirname, form, disabled, name, size, list, src, alt, height, width, required, value, checked, pattern, maxlength, required, readonly, placeholder, autofocus, min, max, step], { parents: ['a', 'button'], parents_allow: false, is_void: true }), t('ins', f_el, [cite, datetime]), t('kbd', p_el), t('keygen', [], [name, disabled, autofocus, keytype, challenge], { parents: ['a', 'button'], parents_allow: false, is_void: true }), t('label', p_el, [label_for], { terminate: label, parents: ['a', 'button'], parents_allow: false }), t('legend', p_el, [], { parents: 'fieldset' }), t('li', f_el, [value], { terminate: 'li', overflow: false, parents: ['ul', 'ol', 'menu'] }), t('map', f_el, [name]), t('mark', p_el), t('menu', f_el_a.concat(['li']), [_l('type', ['toolbar', 'context']), label], { parents: ['a', 'button'], parents_allow: false }), t('meter', p_el, [value, min, low, high, max, optimum], { parents: 'meter', parents_allow: false }), t('nav', f_el), t('ol', ['li'], [_n('start'), reversed, _l('type', ['1', 'a', 'A', 'i', 'I'], 0, false)]), t('optgroup', ['option'], [label, disabled], { overflow: false, terminate: 'optgroup', parents: 'select' }), t('option', [], [disabled, _b('selected'), label, value], { overflow: false, terminate: ['option', 'optgroup'], parents: ['optgroup', 'select', 'datalist'] }), t('output', p_el, [name, form, label_for]), t('p', p_el, [], { terminate: 'p,address,article,aside,blockquote,dir,div,dl,fieldset,footer,form,h1,h2,h3,h4,h5,h6,header,hr,menu,nav,ol,pre,section,table,ul'.split(','), overflow: false }), t('param', [], [name, value], { is_void: true, parents: 'object' }), t('pre', p_el), t('progress', p_el, [value, max], { parents: 'progress', parents_allow: false }), t('q', p_el, [cite]), t('rp', p_el, [], { terminate: ['rp', 'rt'], parents: 'ruby' }), t('rt', p_el, [], { terminate: ['rt', 'rp'], parents: 'ruby' }), t('ruby', p_el_a.concat(['rt', 'rp'])), t('s', p_el), t('samp', p_el), t('section', f_el), t('select', ['optgroup', 'option'], [name, disabled, form, size, multiple, autofocus, required], { parents: ['a', 'button'], parents_allow: false }), t('small', p_el), t('source', [], [src, mimetype, media], { is_void: true, parents: ['audio', 'video'] }), t('span', p_el), t('strong', p_el), t('sub', p_el), t('summary', p_el, [], { parents: 'details' }), t('sup', p_el), t('table', ['caption', 'colgroup', 'thead', 'tbody', 'tfoot', 'tr'], [_a('border')], { parents: 'caption', parents_allow: false }), t('tbody', ['tr'], [], { terminate: ['tbody', 'tfoot'], overflow: false }), t('tfoot', ['tr'], [], { terminate: ['tbody'], overflow: false }), t('thead', ['tr'], [], { terminate: ['tbody', 'tfoot'], overflow: false }), t('td', f_el, [colspan, rowspan, headers], { terminate: ['td', 'th'], overflow: false }), t('th', f_el, [th_scope, colspan, rowspan, headers], { terminate: ['td', 'th'], overflow: false }), t('tr', ['td', 'th'], [], { terminate: 'tr' }), t('textarea', [], [name, disabled, form, readonly, maxlength, autofocus, required, placeholder, dirname, rows, cols, wrap], { parents: ['a', 'button'], parents_allow: false }), t('time', p_el, [datetime]), t('u', p_el), t('ul', ['li']), t('var', p_el), t('track', [], [_l('kind', ['subtitles', 'captions', 'descriptions', 'chapters', 'metadata'], 1, false), _u('src', { required: true }), label, _b('default')], { is_void: true }), t('audio', f_el_a.concat(['source', 'track']), [autoplay, preload, controls, loop, mediagroup, muted, src], { parents: ['a', 'button'], parents_allow: false }), t('video', f_el_a.concat(['source', 'track']), [src, autoplay, preload, controls, loop, poster, height, width, mediagroup, muted], { parents: ['a', 'button'], parents_allow: false }), t('wbr', [], [], { is_void: true })];

                var bbcode_parser = exports.bbcode_parser = new _parser.Parser(new _tag_parser.TagParser(elements, _format.bbcode_format));
                var html_parser = exports.html_parser = new _parser.Parser(new _tag_parser.TagParser(elements, _format.html_format));
            });
        }
    };
});