import {test} from 'ava';
import {AdditiveAttributeFormatter, 
        AdditiveValue,
        AttributeFormatter,
        CompositeAttributeFormatter,
        CompositeValue} from '../src/markup-formatter';

let props = {
    eq: '=',
    quote: null
};

test( 'attribute - format', t => {
    let f = new AttributeFormatter( 'foo', props );

    let r = f.format( 'bar', '"' );

    t.is( r, 'foo="bar"' );
} );


test( 'composite - value', t => {
    let v = new CompositeValue( 'foo', '~', '`', ['a','a: b,'], ['x','x: y,'] );

    t.is( v.toString(), 'foo~`a: b,x: y,`' );
} );


test( 'composite - format', t => {
    let f = new CompositeAttributeFormatter( 'foo', 'a', props );

    let r = f.format( 'x', '"' );

    t.true( r instanceof CompositeValue );

    t.is( r.toString(), 'foo="a: x;"')
} );

test( 'additive - value', t => {
    let v = new AdditiveValue( 'foo', '=', '-', '"', 'a', 'b' );
    t.is( v.toString(), 'foo="a-b"' );

    v.add( 'c' );
    t.is( v.toString(), 'foo="a-b-c"' );

    v.add( new AdditiveValue( 'foo', '=', '-', '"', 'd', 'e' ) );
    t.is( v.toString(), 'foo="a-b-c-d-e"' );
} );

test( 'additive - format', t => {
    let f = new AdditiveAttributeFormatter( 'foo', props );

    let r = f.format( 'bar', '"' );

    t.true( r instanceof AdditiveValue );
    r.add( 'baz' );

    t.is( r.toString(), 'foo="bar baz"' );
} );