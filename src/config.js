import {Parser} from './parser';
import {TagParser} from './tag-parser';
import {bbcode_format} from './format';
import {TagDefinition, AttributeDefinition, ColorAttrDefinition, UrlAttrDefinition, NumberAttrDefinition, AttrPair, ApprovedAttrDefinition} from './def';
import {HtmlTagFormatter, HtmlCTATagFormatter, UrlAttrFormatter, AttrJoinTagFormatter, AttrTagFormatter, StyleAttrFormatter, ColorStyleAttrFormatter, NumberStyleAttrFormatter, HtmlTagDef} from './html';

/**
 * Basic Config
 */
let common_allowed = ['b', 'i', 's', 'u', 'sup', 'sub', 'color', 'size', 'align', 'center', 'url', 'hr', 'list', 'ul', 'ol', 'table'];
let list_allowed = ['li', '*'];
let special = ['quote', 'code'];
let common_plus = common_allowed.concat(special);

let header_tag = new HtmlTagDef( 'header' );

let tag_defs = [
    new TagDefinition( 'b',         common_allowed, [], new HtmlTagFormatter('b')   ),
    new TagDefinition( 'i',         common_allowed, [], new HtmlTagFormatter('i')   ),
    new TagDefinition( 'u',         common_allowed, [], new HtmlTagFormatter('u')   ),
    new TagDefinition( 's',         common_allowed, [], new HtmlTagFormatter('s')   ),

    new TagDefinition( 'sup',       common_allowed, [], new HtmlTagFormatter('sup') ),
    new TagDefinition( 'sub',       common_allowed, [], new HtmlTagFormatter('sub') ),

    new TagDefinition( 'center',    common_allowed, [], new HtmlTagFormatter('div', new AttrPair('class', 'center') ) ),
    new TagDefinition( 'align',     common_allowed, [new ApprovedAttrDefinition('align', ['left', 'center', 'right', 'justify'], new StyleAttrFormatter('text-align'))], new HtmlTagFormatter('div') ),

    new TagDefinition( 'list',      list_allowed,   [], new HtmlTagFormatter('ul') ),
    new TagDefinition( 'ul',        list_allowed,   [], new HtmlTagFormatter('ul') ),
    new TagDefinition( 'ol',        list_allowed,   [], new HtmlTagFormatter('ol') ),
    new TagDefinition( 'li',        common_allowed, [], new HtmlTagFormatter('li'), { overflow: false, terminate: ['li', '*'] } ),
    new TagDefinition( '*',         common_allowed, [], new HtmlTagFormatter('li'), { overflow: false, terminate: ['li', '*'] } ),

    new TagDefinition( 'size',      common_allowed, [new AttributeDefinition('size', new NumberStyleAttrFormatter('font-size', 'px', 5, 30))], new HtmlTagFormatter('span') ),
    new TagDefinition( 'color',     common_allowed, [new ColorAttrDefinition('color', new ColorStyleAttrFormatter('color'))], new HtmlTagFormatter('span') ),
    new TagDefinition( 'style',     common_allowed, [new AttributeDefinition('size', new NumberStyleAttrFormatter('font-size', 'px', 5, 30)), new ColorAttrDefinition('color', new ColorStyleAttrFormatter('color'))], new HtmlTagFormatter('span')),

    new TagDefinition( 'noparse',   [], [], new HtmlTagFormatter(null), { overflow: false } ),

    new TagDefinition( 'table',     ['thead', 'tbody', 'tfoot', 'tr'], [], new HtmlTagFormatter('table') ),
    new TagDefinition( 'thead',     ['tr'],                            [], new HtmlTagFormatter('thead'), { overflow: false, terminate: ['tbody', 'tfoot'] } ),
    new TagDefinition( 'tbody',     ['tr'],                            [], new HtmlTagFormatter('tbody'), { overflow: false, terminate: ['tbody', 'tfoot'] } ),
    new TagDefinition( 'tfoot',     ['tr'],                            [], new HtmlTagFormatter('tfoot'), { overflow: false, terminate: ['tbody'] } ),
    new TagDefinition( 'tr',        ['td', 'th'],                      [], new HtmlTagFormatter('tr'),    { overflow: false, terminate: ['tr'] } ),    
    new TagDefinition( 'th',        common_plus,                       [], new HtmlTagFormatter('th'),    { overflow: false, terminate: ['th', 'td'] } ),
    new TagDefinition( 'td',        common_plus,                       [], new HtmlTagFormatter('td'),    { overflow: false, terminate: ['td', 'th'] } ),

    new TagDefinition( 'hr',        [], [], new HtmlTagFormatter('hr'), { is_void: true } ),

    new TagDefinition( 'url',       [], [new UrlAttrDefinition('url', new UrlAttrFormatter('href'))], new HtmlCTATagFormatter('a', 'url'), { terminate: ['url'] }),
    new TagDefinition( 'img',       [], [new UrlAttrDefinition('img', new UrlAttrFormatter('src'))],  new HtmlCTATagFormatter('img', 'img', 'title', null, { is_void: true } )),

    new TagDefinition( 'code',      [],          [new AttributeDefinition('code', new AttrTagFormatter(header_tag), { required: true, default_value: 'code' })],  new HtmlTagFormatter('code') ),
    new TagDefinition( 'quote',     common_plus, [new AttributeDefinition('quote', new AttrTagFormatter(header_tag), { required: true, default_value: 'quote'})], new HtmlTagFormatter('blockquote') ),

    new TagDefinition( 'spoiler',   common_allowed, [], new HtmlTagFormatter( 'span', new AttrPair('class', 'spoiler') ) ),
    
    new TagDefinition( 'header',    common_allowed, [new NumberAttrDefinition( 'header', 1, 6, null, { required: true, default_value: 6 })], new AttrJoinTagFormatter( 'h', 'header', null, { format_value: false } ) )
];


export let parser = new Parser(new TagParser(tag_defs, bbcode_format));