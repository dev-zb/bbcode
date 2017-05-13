import {test} from 'ava';
import {StyleFrmtr,
        StyleNumFrmtr,
        AttrTagFrmtr,
        ClassFrmtr,
        CToATagFrmtr,
        AttrJoinTagFrmtr,
        ContentWrapTagFrmtr} from '../src/bb-html';
import {TagDefinition, AttributeDefinition} from '../src/markup-def';
import {AttributeFormatter, TagFormatter} from '../src/markup-formatter';
import {html_format} from '../src/html';
import {TagNode, TagAttribute} from '../src/markup-node';
import {TextNode} from '../src/nodes';

test( 'StyleFmtr', t => {
    let f = new StyleFrmtr( 'foo' );

    t.is( f.format( 'bar', '"' ).toString(), 'style="foo: bar;"' );
} );

test( 'StyleNumFrmtr', t => {
    let f = new StyleNumFrmtr( 'foo', 'px' );

    t.is( f.format( 10, '"' ).toString(), 'style="foo: 10px;"' );
} );

test( 'AttrTagFrmtr', t => {
    let f = new AttrTagFrmtr( new TagDefinition( new TagFormatter( 'foo', html_format ), null, null ) );

    let r = f.format( 'bar' );

    t.true( r instanceof TagNode );

    t.is( r.format( 'html' ), '<foo>bar</foo>' );
} );

test( 'ClassFrmtr', t => {
    let f = new ClassFrmtr( 'constant' );

    t.true( f.constant_values instanceof Array );
    t.is( f.constant_values.length, 1 );

    t.is( f.format( 'string', '"' ).toString(), 'class="constant string"' );
} );

test( 'CToATagFrmtr', t => {
    let req = new AttributeDefinition( new AttributeFormatter( 'req', html_format ) );

    let f = new CToATagFrmtr( 'foo', req, 'alt' );

    let txt = new TextNode( 'text' );
    let attrs = new Map();

    t.is( f.format( attrs, [txt] ), '<foo req="text">text</foo>' );

    attrs.set( 'req', new TagAttribute( 'req value', req ) );
    t.is( f.format( attrs, [txt] ), '<foo alt="text" req="req value">text</foo>' );
} );

test( 'AttrJoinTagFrmtr', t => {
    let f = new AttrJoinTagFrmtr( 'foo', 'bar' );

    let r = f.format( new Map( [['bar', new TagAttribute( '-baz', new AttributeDefinition( new AttributeFormatter( 'bar', html_format ) ) )]] ), [] );

    t.is( r, '<foo-baz></foo-baz>' );
} );

test( 'ContentWrapTagFrmtr', t => {
    let shell = new TagDefinition( new TagFormatter( 'foo', html_format ) );
    let wrap = new TagDefinition( new TagFormatter( 'bar', html_format ) );

    let f = new ContentWrapTagFrmtr( shell, wrap );

    let r = f.format( new Map(), [] );

    t.is( r, '<foo><bar></bar></foo>' );
} );