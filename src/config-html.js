import {Parser} from './parser';
import {MarkupParser} from './tag-parser';
import {bbcode_format} from './bbcode';
import {html_format, HtmlTagFrmtr, HtmlAttrFrmtr} from './html';
import {TagDefinition, AttributeDefinition} from './markup-def';
import {TagFormatter, AttributeFormatter} from './markup-formatter';
import {ColorValidator, NumberValidator, CSSValidator, ListValidator, URLValidator} from './validator';

// html? [wip]
let p_el_a = 'a,em,strong,small,mark,abbr,dfn,i,b,s,u,code,var,samp,kbd,sup,sub,q,cite,span,bdo,bdi,br,wbr,ins,del,img,map,area,video,audio,input,textarea,select,button,label,output,datalist,keygen,progress,command,canvas,time,meter'.split(',');
let f_el_a = 'p,hr,pre,ul,ol,dl,div,h1,h2,h3,h4,h5,h6,hgroup,address,blockquote,ins,del,map,section,nav,article,aside,header,footer,figure,table,form,fieldset,menu,details,iframe,object,script,noscript,link,style,meta'.split(',').concat(p_el_a);

let p_el = new Set(p_el_a);
let f_el = new Set(f_el_a);

/**
 * ============
 *  ATTRIBUTES
 * ============
 */
let urlv = { validator: new URLValidator() };

function _af( f, ...p ) { return new AttributeDefinition( [f, new AttributeFormatter( f.identifier, bbcode_format )], Object.assign( {}, ...p ) ); }

function _a( identifier, p = {} ) { return _af( new HtmlAttrFrmtr( identifier ), p ); }
function _u( identifier, p = {} ) { return _af( new HtmlAttrFrmtr( identifier ),  p, urlv ); }
function _n( identifier, min = Number.MIN_VALUE, max = Number.MAX_VALUE, p = {} ) { return _af( new HtmlAttrFrmtr( identifier ), p, { validator: new NumberValidator( min, max ) } ); }
function _l( identifier, list, def = 0, r = true, p = {} ) { return _af( new HtmlAttrFrmtr( identifier ), p, { required: r, validator: new ListValidator( list, true ), default_value: def } ); }
function _b( identifier, r = false, p = {} ) { return _l( identifier, [identifier, ''], 0, r, Object.assign( p, { require_value: false } ) ); }

let style       = _a( 'style', { validator: new CSSValidator() } );// new AttributeDefinition(  'style', new StyleFormatter() );
let css         = _a( 'class' ); // new AttributeDefinition( 'class', new ClassFormatter() );
let id          = _a( 'id' );
let title       = _a( 'title' );
let src         = _u( 'src' );
let href        = _u( 'href' );
let icon        = _u( 'icon' );
let target      = _a( 'target' );
let tabindex    = _n( 'tabindex' );
let alt         = _a( 'alt', { require_value: true, required: true, default_value: '' } );
let shape       = _l( 'shape', ['rect', 'circle', 'poly', 'default'], 3 );
let coords      = _a( 'coords' );
let cite        = _u( 'cite' );
let button_type = _l( 'type', ['submit', 'reset', 'button'] );
let cmd_type    = _l( 'type', ['command', 'radio', 'checkbox'] );
let name        = _a( 'name' );
let value       = _a( 'value' );
let disabled    = _b( 'disabled' );
let width       = _n( 'width', 0 );
let height      = _n( 'height', 0 );
let span        = _n( 'span', 0 );
let size        = _n( 'size', 0 );
let label       = _a( 'label' );
let checked     = _b( 'checked' );
let radiogroup  = _a( 'radiogroup' );
let datetime    = _a( 'datetime' );
let open        = _a( 'open' );
let action      = _u( 'action' );
let method      = _l( 'method', ['get', 'post'] );
let enctype     = _l( 'enctype', ['application/x-www-form-urlencoded', 'mulitpart/form-data', 'text/plain'] );
let ismap       = _b( 'ismap' );
let usemap      = _a( 'usemap' );
let input_type  = _l( 'type', 'text,password,checkbox,radio,button,submit,reset,file,hidden,image,datetime,datetime-local,date,month,time,week,number,range,email,url,search,tel,color'.split(',') );
let list        = _a( 'list' );
let required    = _b( 'required' );
let readonly    = _b( 'readonly' );
let autofocus   = _b( 'autofocus' );
let pattern     = _a( 'pattern' );
let placeholder = _a( 'placeholder' );
let maxlength   = _n( 'maxlength', 0, Number.MAX_VALUE );
let min         = _n( 'min' );
let max         = _n( 'max' );
let step        = _n( 'step' );
let challenge   = _a( 'challenge' );
let keytype     = _a( 'keytype' );
let label_for   = _a( 'for' );
let high        = _n( 'high' );
let low         = _n( 'low' );
let optimum     = _n( 'optimum' );
let form        = _a( 'form' );
let multiple    = _b( 'multiple' );
let mimetype    = _a( 'type' );
let media       = _a( 'media' );
let dirname     = _a( 'dirname', { require_value: true } );
let rows        = _n( 'rows', 0 );
let cols        = _n( 'cols', 0 );
let wrap        = _l( 'wrap', ['hard', 'soft'], 0, false, { require_value: true } );
let colspan     = _n( 'colspan', 0 );
let rowspan     = _n( 'rowspan', 0 );
let th_scope    = _l( 'scope', ['row', 'col', 'rowgroup', 'colgroup'], 0, false );
let headers     = _a( 'headers' );
let reversed    = _b( 'reversed' );

let autoplay    = _b( 'autoplay' );
let preload     = _l( 'preload', ['none', 'metadata', 'auto', ''], 2, false, { require_value: false } );
let controls    = _b( 'controls' );
let loop        = _b( 'loop' );
let poster      = _u( 'poster' );
let mediagroup  = _a( 'mediagroup' );
let muted       = _b( 'muted' );

let global = [style, css, title, tabindex, id];


/**
 * ==========
 *  ELEMENTS
 * ==========
 */
function t( identifier, el, attr = [], props = {} )
{
    return new TagDefinition( [new HtmlTagFrmtr( identifier ), new TagFormatter( identifier, bbcode_format )], el, global.concat( attr ), props );
}

let elements = [
    t( 'a', f_el, [href, target], { terminate: 'a', parents: 'button', parents_allow: false } ),
    t( 'abbr', p_el ),
    t( 'address', f_el, [], { terminate: 'address' } ),
    t( 'area', [], [href, target, alt, shape, coords], { is_void: true } ),
    t( 'article', f_el, [], { parents: 'address', parents_allow: false } ),
    t( 'aside', f_el, [],  { parents: 'address', parents_allow: false } ),
    t( 'b', p_el ),
    t( 'bdi', p_el ),
    t( 'bdo', p_el ),
    t( 'blockquote', f_el, [cite] ),
    t( 'br', [], [], { is_void: true } ),
    t( 'button', p_el, [button_type, name, value, disabled] ),
    t( 'canvas', f_el, [width, height] ),
    t( 'caption', f_el, { parents: 'table' } ),
    t( 'cite', p_el, [] ),
    t( 'code', p_el ),
    t( 'col', [], [span], { is_void: true, parents: 'colgroup' } ),
    t( 'colgroup', 'col', [span], { parents: 'table', terminate: 'colgroup' } ),
    t( 'command', p_el, [cmd_type, label, disabled, icon, checked, radiogroup], { is_void: true } ),
    t( 'datalist', p_el_a.concat( ['option'] ) ),
    t( 'dd', f_el, [], { overflow: false, terminate: 'dd', parents: 'dl' } ),
    t( 'del', f_el, [cite, datetime] ),
    t( 'details', f_el_a.concat( ['summary'] ), [open], { parents: ['a', 'button'], parents_allow: false } ),
    t( 'dfn', p_el, [], { parents: 'dfn', parents_allow: false } ),
    t( 'div', f_el ),
    t( 'dl', ['dt', 'dd'] ),
    t( 'dt', [], { terminate: ['dd', 'dt'], parents: 'dl'} ),
    t( 'em', p_el ),
    t( 'fieldset', f_el_a.concat( ['legend'] ), [name, disabled, form] ),
    t( 'figcaption', f_el, [], { parents: 'figure' } ),
    t( 'figure', f_el_a.concat( ['figcaption'] ) ),
    t( 'footer', f_el, [] ),
    t( 'form', f_el, [action, method, enctype, name, target]),
    t( 'h1', p_el, [], { parents: 'address', parents_allow: false } ),
    t( 'h2', p_el, [], { parents: 'address', parents_allow: false } ),
    t( 'h3', p_el, [], { parents: 'address', parents_allow: false } ),
    t( 'h4', p_el, [], { parents: 'address', parents_allow: false } ),
    t( 'h5', p_el, [], { parents: 'address', parents_allow: false } ),
    t( 'h6', p_el, [], { parents: 'address', parents_allow: false } ),
    t( 'header', f_el, [], {parents: ['footer', 'header', 'address'], parents_allow: false } ),
    t( 'hgroup', 'h1,h2,h3,h4,h5,h6'.split(',') ),
    t( 'hr', [], [], { is_void: true } ),
    t( 'i', p_el ),
    t( 'img', [], [src, alt, height, width, ismap, usemap], { is_void: true } ),
    t( 'input', [], [input_type, dirname, form, disabled, name, size, list, src, alt, height, width, required, value, checked, pattern, maxlength, required, readonly, placeholder, autofocus, min, max, step], { parents: ['a', 'button'], parents_allow: false, is_void: true }),
    t( 'ins', f_el, [cite, datetime] ),
    t( 'kbd', p_el ),
    t( 'keygen', [], [name, disabled, autofocus, keytype, challenge], { parents: ['a', 'button'], parents_allow: false, is_void: true } ),
    t( 'label', p_el, [label_for], { terminate: label, parents: ['a', 'button'], parents_allow: false } ),
    t( 'legend', p_el, [], { parents: 'fieldset' } ),
    t( 'li', f_el, [value], { terminate: 'li', overflow: false, parents: ['ul', 'ol', 'menu'] } ),
    t( 'map', f_el, [name] ),
    t( 'mark', p_el ),
    t( 'menu', f_el_a.concat( ['li'] ), [_l( 'type', ['toolbar', 'context'] ), label], { parents: ['a', 'button'], parents_allow: false } ),
    t( 'meter', p_el, [value, min, low, high, max, optimum], { parents: 'meter', parents_allow: false } ),
    t( 'nav', f_el ),
    t( 'ol', ['li'], [_n( 'start' ), reversed, _l( 'type', ['1', 'a', 'A', 'i', 'I'], 0, false)] ),
    t( 'optgroup', ['option'], [label, disabled], { overflow: false, terminate: 'optgroup', parents: 'select' } ),
    t( 'option', [], [disabled, _b( 'selected' ), label, value], { overflow: false, terminate: ['option', 'optgroup'], parents: ['optgroup', 'select', 'datalist'] } ),
    t( 'output', p_el, [name, form, label_for] ),
    t( 'p', p_el, [], { terminate: 'p,address,article,aside,blockquote,dir,div,dl,fieldset,footer,form,h1,h2,h3,h4,h5,h6,header,hr,menu,nav,ol,pre,section,table,ul'.split(','), overflow: false } ),
    t( 'param', [], [name, value], { is_void: true, parents: 'object' } ),
    t( 'pre', p_el ),
    t( 'progress', p_el, [value, max], { parents: 'progress', parents_allow: false } ),
    t( 'q', p_el, [cite] ),
    t( 'rp', p_el, [], { terminate: ['rp', 'rt'], parents: 'ruby' } ),
    t( 'rt', p_el, [], { terminate: ['rt', 'rp'], parents: 'ruby' } ),
    t( 'ruby', p_el_a.concat( ['rt', 'rp'] ) ),
    t( 's', p_el ),
    t( 'samp', p_el ),
    t( 'section', f_el ),
    t( 'select', ['optgroup', 'option'], [name, disabled, form, size, multiple, autofocus, required], { parents: ['a', 'button'], parents_allow: false } ),
    t( 'small', p_el ),
    t( 'source', [], [src, mimetype, media], { is_void: true, parents: ['audio', 'video'] } ),
    t( 'span', p_el ),
    t( 'strong', p_el ),
    t( 'sub', p_el ),
    t( 'summary', p_el, [], { parents: 'details' } ),
    t( 'sup', p_el ),
    t( 'table', ['caption', 'colgroup', 'thead', 'tbody', 'tfoot', 'tr'], [_a( 'border' )], { parents: 'caption', parents_allow: false } ),
    t( 'tbody', ['tr'], [], { terminate: ['tbody', 'tfoot'], overflow: false } ),
    t( 'tfoot', ['tr'], [], { terminate: ['tbody'], overflow: false } ),
    t( 'thead', ['tr'], [], { terminate: ['tbody', 'tfoot'], overflow: false } ),
    t( 'td', f_el, [colspan, rowspan, headers], { terminate: ['td', 'th'], overflow: false } ),
    t( 'th', f_el, [th_scope, colspan, rowspan, headers], { terminate: ['td', 'th'], overflow: false } ),
    t( 'tr', ['td', 'th'], [], { terminate: 'tr' } ),
    t( 'textarea', [], [name, disabled, form, readonly, maxlength, autofocus, required, placeholder, dirname, rows, cols, wrap], { parents: ['a', 'button'], parents_allow: false } ),
    t( 'time', p_el, [datetime] ),
    t( 'u', p_el ),
    t( 'ul', ['li'] ),
    t( 'var', p_el ),
    t( 'track', [], [_l( 'kind', ['subtitles', 'captions', 'descriptions', 'chapters', 'metadata'], 1, false ), _u( 'src', { required: true } ), label, _b( 'default' )], { is_void: true } ),
    t( 'audio', f_el_a.concat( ['source', 'track'] ), [autoplay, preload, controls, loop, mediagroup, muted, src], { parents: ['a', 'button'], parents_allow: false } ),
    t( 'video', f_el_a.concat( ['source', 'track'] ), [src, autoplay, preload, controls, loop, poster, height, width, mediagroup, muted], { parents: ['a', 'button'], parents_allow: false } ),
    t( 'wbr', [], [], { is_void: true } ),


    //t( 'object', f_el_a.concat(['param']), [_u('data',{required:true,require_value:true}), mimetype,height,width,usemap,name,form], { parents: ['a','button'], parents_allow: false } ),
    //t( 'style', [], [mimetype,media,_b('scoped')] ),
    //t( 'embed', [], [src,height,width,mimetype], { is_void: true }),
];

export let html_parser = new MarkupParser(elements, html_format);