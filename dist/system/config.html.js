System.register([], function (_export2, _context2) {
    "use strict";

    return {
        setters: [],
        execute: function () {
            define([], function () {
                'use strict';

                System.register(['./parser', './tag_parser', './nodes', './format', './def', './html'], function (_export, _context) {
                    "use strict";

                    var Parser, TagParser, TextNode, html_format, bbcode_format, TagDefinition, AttributeDefinition, UrlAttrDefinition, NumberAttrDefinition, AttrPair, ApprovedAttrDefinition, HtmlTagFormatter, HtmlAttrFormatter, NumberAttrFormatter, UrlAttrFormatter, HtmlTagDef, p_el_a, f_el_a, p_el, f_el, StyleFormatter, ClassFormatter, style, css, id, title, src, href, icon, target, tabindex, alt, shape, coords, cite, button_type, cmd_type, name, value, disabled, width, height, span, size, label, checked, radiogroup, datetime, open, action, method, enctype, ismap, usemap, input_type, list, required, readonly, autofocus, pattern, placeholder, maxlength, min, max, step, challenge, keytype, label_for, high, low, optimum, form, multiple, mimetype, media, dirname, rows, cols, wrap, colspan, rowspan, th_scope, headers, reversed, autoplay, preload, controls, loop, poster, mediagroup, muted, global, elements, bbcode_parser, html_parser;

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

                    function _a(name, p) {
                        return new AttributeDefinition(name, new HtmlAttrFormatter(name), p);
                    }
                    function _u(name, p) {
                        return new UrlAttrDefinition(name, new UrlAttrFormatter(name), p);
                    }
                    function _n(name) {
                        var min = arguments.length <= 1 || arguments[1] === undefined ? Number.MIN_VALUE : arguments[1];
                        var max = arguments.length <= 2 || arguments[2] === undefined ? Number.MAX_VALUE : arguments[2];
                        var p = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
                        return new NumberAttrDefinition(name, min, max, new HtmlAttrFormatter(name), p);
                    }
                    function _l(name, list) {
                        var def = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
                        var r = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];
                        var p = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
                        return new ApprovedAttrDefinition(name, list, new HtmlAttrFormatter(name), Object.assign(p, { default_index: def, required: r }));
                    }
                    function _b(name) {
                        var r = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
                        var p = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
                        return _l(name, [name, ''], 0, r, Object.assign(p, { require_value: false }));
                    }

                    function t(name, el) {
                        var attr = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
                        var props = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

                        return new TagDefinition(name, el, global.concat(attr), new HtmlTagFormatter(name), props);
                    }

                    return {
                        setters: [function (_parser) {
                            Parser = _parser.Parser;
                        }, function (_tag_parser) {
                            TagParser = _tag_parser.TagParser;
                        }, function (_nodes) {
                            TextNode = _nodes.TextNode;
                        }, function (_format) {
                            html_format = _format.html_format;
                            bbcode_format = _format.bbcode_format;
                        }, function (_def) {
                            TagDefinition = _def.TagDefinition;
                            AttributeDefinition = _def.AttributeDefinition;
                            UrlAttrDefinition = _def.UrlAttrDefinition;
                            NumberAttrDefinition = _def.NumberAttrDefinition;
                            AttrPair = _def.AttrPair;
                            ApprovedAttrDefinition = _def.ApprovedAttrDefinition;
                        }, function (_html) {
                            HtmlTagFormatter = _html.HtmlTagFormatter;
                            HtmlAttrFormatter = _html.HtmlAttrFormatter;
                            NumberAttrFormatter = _html.NumberAttrFormatter;
                            UrlAttrFormatter = _html.UrlAttrFormatter;
                            HtmlTagDef = _html.HtmlTagDef;
                        }],
                        execute: function () {
                            p_el_a = 'a,em,strong,small,mark,abbr,dfn,i,b,s,u,code,var,samp,kbd,sup,sub,q,cite,span,bdo,bdi,br,wbr,ins,del,img,map,area,video,audio,input,textarea,select,button,label,output,datalist,keygen,progress,command,canvas,time,meter'.split(',');
                            f_el_a = 'p,hr,pre,ul,ol,dl,div,h1,h2,h3,h4,h5,h6,hgroup,address,blockquote,ins,del,map,section,nav,article,aside,header,footer,figure,table,form,fieldset,menu,details,iframe,object,script,noscript,link,style,meta'.split(',').concat(p_el_a);
                            p_el = new Set(p_el_a);
                            f_el = new Set(f_el_a);

                            StyleFormatter = function (_HtmlAttrFormatter) {
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
                            }(HtmlAttrFormatter);

                            StyleFormatter.regex = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:^"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;

                            ClassFormatter = function (_HtmlAttrFormatter2) {
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
                            }(HtmlAttrFormatter);

                            ClassFormatter.regex = /^([\w\-]*)$/;
                            style = new AttributeDefinition('style', new StyleFormatter());
                            css = new AttributeDefinition('class', new ClassFormatter());
                            id = _a('id');
                            title = _a('title');
                            src = _u('src');
                            href = _u('href');
                            icon = _u('icon');
                            target = _a('target');
                            tabindex = _n('tabindex');
                            alt = _a('alt', { require_value: true, required: true, default_value: '' });
                            shape = _l('shape', ['rect', 'circle', 'poly', 'default'], 3);
                            coords = _a('coords');
                            cite = _u('cite');
                            button_type = _l('type', ['submit', 'reset', 'button']);
                            cmd_type = _l('type', ['command', 'radio', 'checkbox']);
                            name = _a('name');
                            value = _a('value');
                            disabled = _b('disabled');
                            width = _n('width', 0);
                            height = _n('height', 0);
                            span = _n('span', 0);
                            size = _n('size', 0);
                            label = _a('label');
                            checked = _b('checked');
                            radiogroup = _a('radiogroup');
                            datetime = _a('datetime');
                            open = _a('open');
                            action = _u('action');
                            method = _l('method', ['get', 'post']);
                            enctype = _l('enctype', ['application/x-www-form-urlencoded', 'mulitpart/form-data', 'text/plain']);
                            ismap = _b('ismap');
                            usemap = _a('usemap');
                            input_type = _l('type', 'text,password,checkbox,radio,button,submit,reset,file,hidden,image,datetime,datetime-local,date,month,time,week,number,range,email,url,search,tel,color'.split(','));
                            list = _a('list');
                            required = _b('required');
                            readonly = _b('readonly');
                            autofocus = _b('autofocus');
                            pattern = _a('pattern');
                            placeholder = _a('placeholder');
                            maxlength = _n('maxlength', 0, Number.MAX_VALUE);
                            min = _n('min');
                            max = _n('max');
                            step = _n('step');
                            challenge = _a('challenge');
                            keytype = _a('keytype');
                            label_for = _a('for');
                            high = _n('high');
                            low = _n('low');
                            optimum = _n('optimum');
                            form = _a('form');
                            multiple = _b('multiple');
                            mimetype = _a('type');
                            media = _a('media');
                            dirname = _a('dirname', { require_value: true });
                            rows = _n('rows', 0);
                            cols = _n('cols', 0);
                            wrap = _l('wrap', ['hard', 'soft'], 0, false, { require_value: true });
                            colspan = _n('colspan', 0);
                            rowspan = _n('rowspan', 0);
                            th_scope = _l('scope', ['row', 'col', 'rowgroup', 'colgroup'], 0, false);
                            headers = _a('headers');
                            reversed = _b('reversed');
                            autoplay = _b('autoplay');
                            preload = _l('preload', ['none', 'metadata', 'auto', ''], 2, false, { require_value: false });
                            controls = _b('controls');
                            loop = _b('loop');
                            poster = _u('poster');
                            mediagroup = _a('mediagroup');
                            muted = _b('muted');
                            global = [style, css, title, tabindex, id];
                            elements = [t('a', f_el, [href, target], { terminate: 'a', parents: 'button', parents_allow: false }), t('abbr', p_el), t('address', f_el, [], { terminate: 'address' }), t('area', [], [href, target, alt, shape, coords], { is_void: true }), t('article', f_el, [], { parents: 'address', parents_allow: false }), t('aside', f_el, [], { parents: 'address', parents_allow: false }), t('b', p_el), t('bdi', p_el), t('bdo', p_el), t('blockquote', f_el, [cite]), t('br', [], [], { is_void: true }), t('button', p_el, [button_type, name, value, disabled]), t('canvas', f_el, [width, height]), t('caption', f_el, { parents: 'table' }), t('cite', p_el, []), t('code', p_el), t('col', [], [span], { is_void: true, parents: 'colgroup' }), t('colgroup', 'col', [span], { parents: 'table', terminate: 'colgroup' }), t('command', p_el, [cmd_type, label, disabled, icon, checked, radiogroup], { is_void: true }), t('datalist', p_el_a.concat(['option'])), t('dd', f_el, [], { overflow: false, terminate: 'dd', parents: 'dl' }), t('del', f_el, [cite, datetime]), t('details', f_el_a.concat(['summary']), [open], { parents: ['a', 'button'], parents_allow: false }), t('dfn', p_el, [], { parents: 'dfn', parents_allow: false }), t('div', f_el), t('dl', ['dt', 'dd']), t('dt', [], { terminate: ['dd', 'dt'], parents: 'dl' }), t('em', p_el), t('fieldset', f_el_a.concat(['legend']), [name, disabled, form]), t('figcaption', f_el, [], { parents: 'figure' }), t('figure', f_el_a.concat(['figcaption'])), t('footer', f_el, []), t('form', f_el, [action, method, enctype, name, target]), t('h1', p_el, [], { parents: 'address', parents_allow: false }), t('h2', p_el, [], { parents: 'address', parents_allow: false }), t('h3', p_el, [], { parents: 'address', parents_allow: false }), t('h4', p_el, [], { parents: 'address', parents_allow: false }), t('h5', p_el, [], { parents: 'address', parents_allow: false }), t('h6', p_el, [], { parents: 'address', parents_allow: false }), t('header', f_el, [], { parents: ['footer', 'header', 'address'], parents_allow: false }), t('hgroup', 'h1,h2,h3,h4,h5,h6'.split(',')), t('hr', [], [], { is_void: true }), t('i', p_el), t('img', [], [src, alt, height, width, ismap, usemap], { is_void: true }), t('input', [], [input_type, dirname, form, disabled, name, size, list, src, alt, height, width, required, value, checked, pattern, maxlength, required, readonly, placeholder, autofocus, min, max, step], { parents: ['a', 'button'], parents_allow: false, is_void: true }), t('ins', f_el, [cite, datetime]), t('kbd', p_el), t('keygen', [], [name, disabled, autofocus, keytype, challenge], { parents: ['a', 'button'], parents_allow: false, is_void: true }), t('label', p_el, [label_for], { terminate: label, parents: ['a', 'button'], parents_allow: false }), t('legend', p_el, [], { parents: 'fieldset' }), t('li', f_el, [value], { terminate: 'li', overflow: false, parents: ['ul', 'ol', 'menu'] }), t('map', f_el, [name]), t('mark', p_el), t('menu', f_el_a.concat(['li']), [_l('type', ['toolbar', 'context']), label], { parents: ['a', 'button'], parents_allow: false }), t('meter', p_el, [value, min, low, high, max, optimum], { parents: 'meter', parents_allow: false }), t('nav', f_el), t('ol', ['li'], [_n('start'), reversed, _l('type', ['1', 'a', 'A', 'i', 'I'], 0, false)]), t('optgroup', ['option'], [label, disabled], { overflow: false, terminate: 'optgroup', parents: 'select' }), t('option', [], [disabled, _b('selected'), label, value], { overflow: false, terminate: ['option', 'optgroup'], parents: ['optgroup', 'select', 'datalist'] }), t('output', p_el, [name, form, label_for]), t('p', p_el, [], { terminate: 'p,address,article,aside,blockquote,dir,div,dl,fieldset,footer,form,h1,h2,h3,h4,h5,h6,header,hr,menu,nav,ol,pre,section,table,ul'.split(','), overflow: false }), t('param', [], [name, value], { is_void: true, parents: 'object' }), t('pre', p_el), t('progress', p_el, [value, max], { parents: 'progress', parents_allow: false }), t('q', p_el, [cite]), t('rp', p_el, [], { terminate: ['rp', 'rt'], parents: 'ruby' }), t('rt', p_el, [], { terminate: ['rt', 'rp'], parents: 'ruby' }), t('ruby', p_el_a.concat(['rt', 'rp'])), t('s', p_el), t('samp', p_el), t('section', f_el), t('select', ['optgroup', 'option'], [name, disabled, form, size, multiple, autofocus, required], { parents: ['a', 'button'], parents_allow: false }), t('small', p_el), t('source', [], [src, mimetype, media], { is_void: true, parents: ['audio', 'video'] }), t('span', p_el), t('strong', p_el), t('sub', p_el), t('summary', p_el, [], { parents: 'details' }), t('sup', p_el), t('table', ['caption', 'colgroup', 'thead', 'tbody', 'tfoot', 'tr'], [_a('border')], { parents: 'caption', parents_allow: false }), t('tbody', ['tr'], [], { terminate: ['tbody', 'tfoot'], overflow: false }), t('tfoot', ['tr'], [], { terminate: ['tbody'], overflow: false }), t('thead', ['tr'], [], { terminate: ['tbody', 'tfoot'], overflow: false }), t('td', f_el, [colspan, rowspan, headers], { terminate: ['td', 'th'], overflow: false }), t('th', f_el, [th_scope, colspan, rowspan, headers], { terminate: ['td', 'th'], overflow: false }), t('tr', ['td', 'th'], [], { terminate: 'tr' }), t('textarea', [], [name, disabled, form, readonly, maxlength, autofocus, required, placeholder, dirname, rows, cols, wrap], { parents: ['a', 'button'], parents_allow: false }), t('time', p_el, [datetime]), t('u', p_el), t('ul', ['li']), t('var', p_el), t('track', [], [_l('kind', ['subtitles', 'captions', 'descriptions', 'chapters', 'metadata'], 1, false), _u('src', { required: true }), label, _b('default')], { is_void: true }), t('audio', f_el_a.concat(['source', 'track']), [autoplay, preload, controls, loop, mediagroup, muted, src], { parents: ['a', 'button'], parents_allow: false }), t('video', f_el_a.concat(['source', 'track']), [src, autoplay, preload, controls, loop, poster, height, width, mediagroup, muted], { parents: ['a', 'button'], parents_allow: false }), t('wbr', [], [], { is_void: true })];

                            _export('bbcode_parser', bbcode_parser = new Parser(new TagParser(elements, bbcode_format)));

                            _export('bbcode_parser', bbcode_parser);

                            _export('html_parser', html_parser = new Parser(new TagParser(elements, html_format)));

                            _export('html_parser', html_parser);
                        }
                    };
                });
            });
        }
    };
});