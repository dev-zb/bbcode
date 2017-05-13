import {test} from 'ava';
import {bbcode_parser, Parser} from '../src/config-bb';

let parser = new Parser([bbcode_parser]);

test( 'b', t => {
    let s = '[b]foo[/b]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<b>foo</b>' );
} );

test( 'i', t => {
    let s = '[i]foo[/i]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<i>foo</i>' );
} );

test( 'u', t => {
    let s = '[u]foo[/u]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<u>foo</u>' );
} );

test( 's', t => {
    let s = '[s]foo[/s]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<s>foo</s>' );
} );

test( 'sup', t => {
    let s = '[sup]foo[/sup]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<sup>foo</sup>' );
} );

test( 'sub', t => {
    let s = '[sub]foo[/sub]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<sub>foo</sub>' );
} );

test( 'center', t => {
    let s = '[center]foo[/center]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<div class="center">foo</div>' );
} );

test( 'align', t => {
    let alignments = 'left,center,right,justify'.split( ',' );

    for( let align of alignments )
    {
        let s = `[align=${align}]foo[/align]`;
        let p = parser.parse( s );

        t.is( p.format( 'bbcode' ), s );
        t.is( p.format( 'html' ), `<div style="text-align: ${align};">foo</div>` );
    }
} );

test( 'li', t => {
    let s = '[li]foo[/li]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<li>foo</li>' );

    let s2 = '[li]foo[li]bar';
    p = parser.parse( s2 );

    t.is( p.format( 'bbcode' ), '[li]foo[/li][li]bar[/li]' );
    t.is( p.format( 'html' ), '<li>foo</li><li>bar</li>' );
} );

test( '*', t => {
    let s = '[*]foo[*]bar';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), '[*]foo[*]bar' );
    t.is( p.format( 'html' ), '<li>foo</li><li>bar</li>' );
} );

test( 'list', t => {
    let s = '[list]bar[*]foo[/list]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<ul>bar<li>foo</li></ul>' );
} );

test( 'ul', t => {
    let s = '[ul]bar[*]foo[/ul]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<ul>bar<li>foo</li></ul>' );
} );

test( 'ol', t => {
    let s = '[ol]bar[*]foo[/ol]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<ol>bar<li>foo</li></ol>' );
} );

test( 'size', t => {
    let s = '[size=10]foo[/size]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<span style="font-size: 10px;">foo</span>' );
} );

test( 'color', t => {
    let colors = ['#A0b', '#A0bc1D', 'rgb( 255, 255, 255 )', 'rgba( 100, 100, 100, 0.5 )'];

    for( let color of colors )
    {
        let s = `[color=${color}]foo[/color]`;
        let p = parser.parse( s );

        t.is( p.format( 'bbcode' ), s );
        t.is( p.format( 'html' ), `<span style="color: ${color};">foo</span>` );
    }
} );

test( 'style', t => {
    let s = '[style color="#A0bc1D" size="15"]foo[/style]';
    let p = parser.parse( s );

    let bb = p.format( 'bbcode' );
    t.true( bb === s || bb === '[style size="15" color="#A0bc1D"]foo[/style]' );

    let h = p.format( 'html' );
    t.true( h === '<span style="color: #A0bc1D; font-size: 15px;">foo</span>' || h === '<span style="font-size: 15px; color: #A0bc1D;">foo</span>' );
} );

test( 'noparse', t => {
    let s = '[noparse][b]foo[/b][/noparse]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '&#91;b&#93;foo&#91;&#47;b&#93;' );
} );

test( 'table', t => { 
    let s = '[table][/table]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<table></table>' );
} );

test( 'thead', t => { 
    let s = '[table][thead][/thead][/table]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<table><thead></thead></table>' );
} );

test( 'tbody', t => { 
    let s = '[table][tbody][/tbody][/table]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<table><tbody></tbody></table>' );
} );

test( 'tfoot', t => { 
    let s = '[table][tfoot][/tfoot][/table]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<table><tfoot></tfoot></table>' );
} );

test( 'tr', t => { 
    let s = '[table][tr][/tr][/table]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<table><tr></tr></table>' );
} );

test( 'th', t => { 
    let s = '[table][tr][th]foo[/th][/tr][/table]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<table><tr><th>foo</th></tr></table>' );
} );

test( 'td', t => { 
    let s = '[table][tr][td]foo[/td][/tr][/table]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<table><tr><td>foo</td></tr></table>' );
} );

test( 'table - full', t => {
    let s = '[table][thead][tr][th]foo[tbody][tr][td]bar[tr][td]baz[tfoot][tr][td]qux[/table]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), '[table][thead][tr][th]foo[/th][/tr][/thead][tbody][tr][td]bar[/td][/tr][tr][td]baz[/td][/tr][/tbody][tfoot][tr][td]qux[/td][/tr][/tfoot][/table]' )
    t.is( p.format( 'html' ), '<table><thead><tr><th>foo</th></tr></thead><tbody><tr><td>bar</td></tr><tr><td>baz</td></tr></tbody><tfoot><tr><td>qux</td></tr></tfoot></table>' )
} );
test( 'hr', t => {
    let s = '[hr]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<hr>' );
} );

test( 'url', t => {
    let u = 
        [
            ['[url]http://foo.bar[/url]', '<a href="http://foo.bar">http&#58;&#47;&#47;foo&#46;bar</a>'],
            ['[url="http://foo.bar"]foo[/url]', '<a href="http://foo.bar">foo</a>']
        ];

    for( let s of u )
    {
        let p = parser.parse( s[0] );

        t.is( p.format( 'bbcode' ), s[0] );
        t.is( p.format( 'html' ), s[1] );
    }
} );

test( 'img', t => {
    let u = 
        [
            ['[img]image.png[/img]', '<img src="image.png">'],
            ['[img="image.png"]foo[/img]', '<img title="foo" src="image.png">']
        ];

    for( let s of u )
    {
        let p = parser.parse( s[0] );
        t.is( p.format( 'bbcode' ), s[0] );
        t.is( p.format( 'html' ), s[1] );
    }
} );

test( 'code', t => {
    let c = 
        [
            ['[code][b]foo[/code]', '<code><div class="header">code</div>&#91;b&#93;foo</code>' ],
            ['[code=cpp]int x{ 0 };[/code]', '<code><div class="header">cpp</div>int x&#123; 0 &#125;&#59;</code>']
        ];
    
    for( let s of c )
    {
        let p = parser.parse( s[0] );

        t.is( p.format( 'bbcode' ), s[0] );
        t.is( p.format( 'html' ), s[1] );
    }
} );

test( 'quote', t => {
    let q = 
        [
            ['[quote]foo[/quote]', '<blockquote><div class="header">quote</div>foo</blockquote>'],
            ['[quote=bar]foo[/quote]', '<blockquote><div class="header">bar</div>foo</blockquote>']
        ];

    for( let s of q )
    {
        let p = parser.parse( s[0] );

        t.is( p.format( 'bbcode' ), s[0] );
        t.is( p.format( 'html' ), s[1] );
    }
} );

test( 'spoiler', t => {
    let s = '[spoiler]foo[/spoiler]';
    let p = parser.parse( s );

    t.is( p.format( 'bbcode' ), s );
    t.is( p.format( 'html' ), '<span class="spoiler">foo</span>' );
} );

test( 'header', t => {
    
    for( let i = 1; i <= 6; ++i )
    {
        let s = `[header=${i}]foo[/header]`;
        let p = parser.parse( s );

        t.is( p.format( 'bbcode' ), s );
        t.is( p.format( 'html' ), `<h${i}>foo</h${i}>` );
    }
} );