import {Parser} from './parser';
import {MarkupParser} from './tag-parser';
import {TagDefinition, AttributeDefinition} from './markup-def';
import {TagFormatter} from './markup-formatter';
import {StyleFrmtr, StyleNumFrmtr, CToATagFrmtr, AttrTagFrmtr, AttrJoinTagFrmtr, CssClass, CssProp} from './bb-html';
import {ColorValidator, NumberValidator, CSSValidator, ListValidator, URLValidator} from './validator';
import {NullFormatter} from './formatter';
import {bbcode_format, BBTagFrmtr, BBTagDef, BBAttrFrmtr} from './bbcode';
import {html_format, HtmlTagFrmtr, HtmlAttrFrmtr} from './html';

/**
 * Basic Config
 */
let common_ch = ['b', 'i', 's', 'u', 'sup', 'sub', 'color', 'size', 'align', 'center', 'url', 'hr', 'list', 'ul', 'ol', 'table'];
let list_ch = ['li', '*'];
let special = ['quote', 'code'];
let common_plus = common_ch.concat( special );

let div_tag = new TagDefinition( new HtmlTagFrmtr( 'div', { attributes: new CssClass( 'header' ) } ) );

function tag( bbcode_ident, html_ident, ch = common_ch, props = {} )
{
    return new BBTagDef( bbcode_ident, [new HtmlTagFrmtr( html_ident || bbcode_ident )], ch || common_ch, [], props );
}

let font_size = new AttributeDefinition( [new BBAttrFrmtr( 'size' ), new StyleNumFrmtr( 'font-size', 'px' )], { validator: new NumberValidator( 5, 30, true ) } );
let font_color = new AttributeDefinition( [new BBAttrFrmtr( 'color' ), new StyleFrmtr( 'color' )], { validator: new ColorValidator() } );
let url = new AttributeDefinition( [new BBAttrFrmtr( 'url' ), new HtmlAttrFrmtr( 'href' )], { validator: new URLValidator() } );
let img = new AttributeDefinition( [new BBAttrFrmtr( 'img' ), new HtmlAttrFrmtr( 'src' )], { validator: new URLValidator() } );

let tag_defs = [
    tag( 'b' ),     // [b] -> <b>
    tag( 'i' ),     // [i] -> <i>
    tag( 'u' ),     // [u] -> <u>
    tag( 's' ),     // [s] -> <s>
    tag( 'sup' ),   // [sup] -> <sup>
    tag( 'sub' ),   // [sub] -> <sub>

    // [center] -> <div class="center">
    new BBTagDef( 'center', new HtmlTagFrmtr( 'div', { attributes: new CssClass( 'center' ) } ), common_ch, [] ),

    // [align=left|center|right|jusitified] -> <div style="text-align: ???">
    new BBTagDef( 'align',  new HtmlTagFrmtr( 'div' ), common_ch, [new AttributeDefinition( [new BBAttrFrmtr( 'align' ), new StyleFrmtr( 'text-align' )], { validator: new ListValidator( ['left', 'center', 'right', 'justify'], true ) } )] ),

    // [list] -> ul
    tag( 'list', 'ul', list_ch ),

    // [ul] -> <ul>
    tag( 'ul', 'ul', list_ch ),

    // [ol] -> <ol>
    tag( 'ol', 'ol', list_ch ),

    // [li] -> <li>
    tag( 'li', 'li', common_ch,  { overflow: false, terminator: ['li', '*'] } ),

    // [*] -> <li>
    new TagDefinition( [new BBTagFrmtr( '*', { _close_tag: () => '' } ), new HtmlTagFrmtr( 'li' )], common_ch, [], { overflow: false, terminator: ['li', '*'] } ),

    // [size=#] -> <span style="font-size: #px;">
    new BBTagDef( 'size', new HtmlTagFrmtr( 'span' ), common_ch, [font_size] ),
    
    // [color=???] -> <span style="color: ???;">
    new BBTagDef( 'color', new HtmlTagFrmtr( 'span' ), common_ch, [font_color] ),

    // [style size=# color=foo] -> <span style="font-size: #px; color: foo;">
    new BBTagDef( 'style', new HtmlTagFrmtr( 'span' ), common_ch, [font_size, font_color] ),

    // [noparse] -> ''
    new BBTagDef( 'noparse', new HtmlTagFrmtr( '' ), [], [], { overflow: false } ),

    // [table] -> <table>
    tag( 'table', 'table', ['thead', 'tbody', 'tfoot', 'tr'] ),
    
    // [thead] -> <thead>
    tag( 'thead', 'thead', ['tr'], { overflow: false, terminator: ['tbody', 'tfoot'] } ),
    tag( 'tbody', 'tbody', ['tr'], { overflow: false, terminator: ['tbody', 'tfoot'] } ),
    tag( 'tfoot', 'tfoot', ['tr'], { overflow: false, terminator: ['tbody'] } ),
    tag( 'tr', 'tr', ['td', 'th'], { overflow: false, terminator: ['tr'] } ),
    tag( 'th', 'th', common_plus, { overflow: false, terminator: ['th', 'td'] } ),
    tag( 'td', 'td', common_plus, { overflow: false, terminator: ['th', 'td'] } ),

    tag( 'hr', 'hr', null, { is_void: true } ),

    // [url]
    new BBTagDef( 'url', new CToATagFrmtr( 'a', url ), [], [url], { terminator: ['url'] } ),
    
    // [img]
    new BBTagDef( 'img', new CToATagFrmtr( 'img', img, new AttributeDefinition( new HtmlAttrFrmtr( 'title' ) ), { is_void: true, void_children: false } ), [], [img] ),
    
    // [code]
    new TagDefinition( [new BBTagFrmtr( 'code', { format_defaults: false } ), new HtmlTagFrmtr( 'code' )], [], [new AttributeDefinition( [new BBAttrFrmtr( 'code' ), new AttrTagFrmtr( div_tag )], { required: true, default_value: 'code' })] ),

    // [quote]
    new TagDefinition( [new BBTagFrmtr( 'quote', { format_defaults: false } ), new HtmlTagFrmtr( 'blockquote' )], common_plus, [new AttributeDefinition( [new BBAttrFrmtr( 'quote' ), new AttrTagFrmtr( div_tag )], { required: true, default_value: 'quote'} )] ),

    // [spoiler]
    new BBTagDef( 'spoiler', new HtmlTagFrmtr( 'span', { attributes: new CssClass( 'spoiler' ) } ), common_ch, [] ),
    
    // [header]
    new BBTagDef( 'header', new AttrJoinTagFrmtr( 'h', 'header', { format_value: false } ), common_ch, [new AttributeDefinition( [new BBAttrFrmtr( 'header' ), new NullFormatter( html_format )], { validator: new NumberValidator( 1, 6, true ), required: true, default_value: 6 })] )
];

export let bbcode_parser = new MarkupParser( tag_defs, bbcode_format );

export {Parser} from './parser';