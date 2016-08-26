System.register([], function (_export, _context) {
    "use strict";

    return {
        setters: [],
        execute: function () {
            define([], function () {
                define(['exports', './parser', './tag_parser', './format', './def', './html'], function (exports, _parser, _tag_parser, _format, _def, _html) {
                    'use strict';

                    Object.defineProperty(exports, "__esModule", {
                        value: true
                    });
                    exports.parser = undefined;

                    var common_allowed = ['b', 'i', 's', 'u', 'sup', 'sub', 'color', 'size', 'align', 'center', 'url', 'hr', 'list', 'ul', 'ol', 'table'];
                    var list_allowed = ['li', '*'];
                    var special = ['quote', 'code'];
                    var common_plus = common_allowed.concat(special);

                    var header_tag = new _html.HtmlTagDef('header');

                    var tag_defs = [new _def.TagDefinition('b', common_allowed, [], new _html.HtmlTagFormatter('b')), new _def.TagDefinition('i', common_allowed, [], new _html.HtmlTagFormatter('i')), new _def.TagDefinition('u', common_allowed, [], new _html.HtmlTagFormatter('u')), new _def.TagDefinition('s', common_allowed, [], new _html.HtmlTagFormatter('s')), new _def.TagDefinition('sup', common_allowed, [], new _html.HtmlTagFormatter('sup')), new _def.TagDefinition('sub', common_allowed, [], new _html.HtmlTagFormatter('sub')), new _def.TagDefinition('center', common_allowed, [], new _html.HtmlTagFormatter('div', new AttribPair('class', 'center'))), new _def.TagDefinition('align', common_allowed, [new _def.ApprovedAttrDefinition('align', ['left', 'center', 'right', 'justify'], new _html.StyleAttrFormatter('text-align'))], new _html.HtmlTagFormatter('div')), new _def.TagDefinition('list', list_allowed, [], new _html.HtmlTagFormatter('ul')), new _def.TagDefinition('ul', list_allowed, [], new _html.HtmlTagFormatter('ul')), new _def.TagDefinition('ol', list_allowed, [], new _html.HtmlTagFormatter('ol')), new _def.TagDefinition('li', common_allowed, [], new _html.HtmlTagFormatter('li'), { overflow: false, terminate: ['li', '*'] }), new _def.TagDefinition('*', common_allowed, [], new _html.HtmlTagFormatter('li'), { overflow: false, terminate: ['li', '*'] }), new _def.TagDefinition('size', common_allowed, [new _def.AttributeDefinition('size', new _html.NumberStyleAttrFormatter('font-size', 'px', 5, 30))], new _html.HtmlTagFormatter('span')), new _def.TagDefinition('color', common_allowed, [new _def.ColorAttrDefinition('color', new _html.ColorStyleAttrFormatter('color'))], new _html.HtmlTagFormatter('span')), new _def.TagDefinition('style', common_allowed, [new _def.AttributeDefinition('size', new _html.NumberStyleAttrFormatter('font-size', 'px', 5, 30)), new _def.ColorAttrDefinition('color', new _html.ColorStyleAttrFormatter('color'))], new _html.HtmlTagFormatter('span')), new _def.TagDefinition('noparse', [], [], new _html.HtmlTagFormatter(null), { overflow: false }), new _def.TagDefinition('table', ['thead', 'tbody', 'tfoot', 'tr'], [], new _html.HtmlTagFormatter('table')), new _def.TagDefinition('thead', ['tr'], [], new _html.HtmlTagFormatter('thead'), { overflow: false, terminate: ['tbody', 'tfoot'] }), new _def.TagDefinition('tbody', ['tr'], [], new _html.HtmlTagFormatter('tbody'), { overflow: false, terminate: ['tbody', 'tfoot'] }), new _def.TagDefinition('tfoot', ['tr'], [], new _html.HtmlTagFormatter('tfoot'), { overflow: false, terminate: ['tbody'] }), new _def.TagDefinition('tr', ['td', 'th'], [], new _html.HtmlTagFormatter('tr'), { overflow: false, terminate: ['tr'] }), new _def.TagDefinition('th', common_plus, [], new _html.HtmlTagFormatter('th'), { overflow: false, terminate: ['th', 'td'] }), new _def.TagDefinition('td', common_plus, [], new _html.HtmlTagFormatter('td'), { overflow: false, terminate: ['td', 'th'] }), new _def.TagDefinition('hr', [], [], new _html.HtmlTagFormatter('hr'), { is_void: true }), new _def.TagDefinition('url', [], [new _def.UrlAttrDefinition('url', new _html.UrlAttrFormatter('href'))], new _html.HtmlCTATagFormatter('a', 'url'), { terminate: ['url'] }), new _def.TagDefinition('img', [], [new _def.UrlAttrDefinition('img', new _html.UrlAttrFormatter('src'))], new _html.HtmlCTATagFormatter('img', 'img', 'title', null, { is_void: true })), new _def.TagDefinition('code', [], [new _def.AttributeDefinition('code', new _html.AttrTagFormatter(header_tag), { required: true, default_value: 'code' })], new _html.HtmlTagFormatter('code')), new _def.TagDefinition('quote', common_plus, [new _def.AttributeDefinition('quote', new _html.AttrTagFormatter(header_tag), { required: true, default_value: 'quote' })], new _html.HtmlTagFormatter('blockquote')), new _def.TagDefinition('spoiler', common_allowed, [], new _html.HtmlTagFormatter('span', new AttribPair('class', 'spoiler'))), new _def.TagDefinition('header', common_allowed, [new _def.NumberAttrDefinition('header', 1, 6, null, { required: true, default_value: 6 })], new _html.AttrJoinTagFormatter('h', 'header', null, { format_value: false }))];

                    var parser = exports.parser = new _parser.Parser(new _tag_parser.TagParser(tag_defs, _format.bbcode_format));
                });
            });
        }
    };
});