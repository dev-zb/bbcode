import {test} from 'ava';
import {CompositeValue, TagFormatter, AttributeFormatter, CompositeAttributeFormatter} from '../src/markup-formatter';
import {bbcode_format} from '../src/bbcode';
import {AttributeDefinition, TagDefinition} from '../src/markup-def';
import {TagAttribute, TagNode} from '../src/markup-node';

test( 'construct', async t => {
    let f = new TagFormatter( 'a', bbcode_format, { attributes: { identifier: 'x', value: 'y' } } );

    t.is( f.identifier, 'a' );
    t.is( f.attributes.length, 1 );
} );

test( 'handle pair', async t => {
    let f = new TagFormatter( 'a', bbcode_format );

    let map = new Map();
    let ch = [];
    let result = f.format_attribute( { identifier: 'test', value: 'foo' }, map, ch );

    t.true( result instanceof Array );
    t.is( result.length, 0 );

    t.is( map.size, 1 );
    t.true( map.has( 'test' ) );
    t.is( map.get( 'test' ), 'test=foo' );

    t.is( ch.length, 0 );
} );

test( 'handle attribute', async t => {
    let f = new TagFormatter( 'a', bbcode_format );

    let def = new AttributeDefinition( new AttributeFormatter( 'bar', bbcode_format ) );
    let a = new TagAttribute( 'foo', def );

    let ch = [];
    let map = new Map();

    let result = f.format_attribute( a, map, ch );

    t.true( result instanceof Array );
    t.is( result.length, 0 );

    t.is( map.size, 1 );
    t.true( map.has( 'bar' ) );
    t.is( map.get( 'bar' ), 'bar=foo' );

    t.is( ch.length, 0 );
} );

test( 'handle composite attribute', async t => {
    let f = new TagFormatter( 'a', bbcode_format );

    let def = new AttributeDefinition( new CompositeAttributeFormatter( 'attr', 'sub', bbcode_format ) );
    let a = new TagAttribute( 'val', def );

    let ch = [];
    let map = new Map();

    let result = f.format_attribute( a, map, ch );

    t.true( result instanceof Array );
    t.is( result.length, 0 );

    t.is( map.size, 1 );
    t.true( map.has( 'attr' ) );
    t.is( map.get( 'attr' ).toString(), 'attr=sub: val;' );

    t.is( ch.length, 0 );
} );

test( 'multiple attributes', async t => {
    let f = new TagFormatter( 'a', bbcode_format );

    let cdef = new AttributeDefinition( new CompositeAttributeFormatter( 'attr', 'sub', bbcode_format ) );
    let ca = new TagAttribute( 'val', cdef, null, '"' );

    let cdef2 = new AttributeDefinition( new CompositeAttributeFormatter( 'attr', 'sub2', bbcode_format ) );
    let ca2 = new TagAttribute( 'val2', cdef2, null, '"' );

    let def = new AttributeDefinition( new AttributeFormatter( 'bar', bbcode_format ) );
    let a = new TagAttribute( 'foo', def );

    let r = f.format_attributes( [
        { identifier: 'a', value: 'x' },
        ca2,
        ca,
        a
    ], [] );

    t.is( r.size, 3 );
    t.is( r.get( 'bar' ), 'bar=foo' );
    t.is( r.get( 'attr' ).toString(), 'attr="sub: val; sub2: val2;"' );
    t.is( r.get( 'a' ), 'a=x' );
} );

test( 'tag - empty', async t => {
    let f = new TagFormatter( 'a', bbcode_format );

    t.is( f.format( [], [] ), '[a][/a]' );
} );

test( 'tag - void', async t => {
    let f = new TagFormatter( 'a', bbcode_format, { is_void: true } );

    t.is( f.format( [] ), '[a]' );
} );

test( 'tag - children', async t => {
    let f = new TagFormatter( 'a', bbcode_format );

    let def = new TagDefinition( new TagFormatter( 'b', bbcode_format ) );

    t.is( f.format( [], [new TagNode( def )] ), '[a][b][/b][/a]' );
} );