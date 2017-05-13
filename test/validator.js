import {test} from 'ava';
import {Validator,
        RegexValidator,
        IdentifierValidator,
        URLValidator,
        ColorValidator,
        CSSValidator,
        NumberValidator,
        ListValidator,
        IdentifierListValidator} from '../src/validator';

test( 'base', t => {
    let v = new Validator();

    t.true( v.char() );
    t.is( v.string(''), '' );
} );

test( 'regex', t => {
    let v = new RegexValidator(/^[abc]{3}$/);

    t.is( v.string( 'abc', 'xyz' ), 'abc' );
    t.is( v.string( 'adc', 'xyz' ), 'xyz' );
} );

test( 'identifier', t => {
    let v = new IdentifierValidator();
    let i = 'abc3-xyz';

    for( let c of i )
    {
        t.true( v.char( c ) );
    }

    t.is( v.string( i ), i );
} );

test( 'url', t => {
    let v = new URLValidator();
    let url = 'http://www.github.com/z-brooks/bbcode';

    t.is( v.string( url ), url );
    t.is( v.string( 'javascript:x()' ), null );
} );

test( 'color', t => {
    let v = new ColorValidator();

    let colors = [ '#af09d5', '#f9c', 'blue', 'rgb( 255, 0, 0 )', 'rgba( 0, 127, 0, 0.5 )' ];

    for( let c of colors )
    {
        t.is( v.string( c ), c );
    }
} );

test( 'css', t => {
    let v = new CSSValidator();

    let css = 'width: 10px; background-color: rgb( 255,100, 50 );';
    t.is( v.string( css ), css );
} );

test( 'number', t => {
    let v = new NumberValidator( -10, 10 );

    let numbers = ['-10', '1.1', 10 ];

    for( let n of numbers )
        t.is( v.string( n ), +n );

    t.is( v.string( '12', 5 ), 5 );
} );

test( 'list', t => {
    let v = new ListValidator( ['abc','xyz'], true );

    t.true( v.allowed );
    t.true( v.char( 'x' ) );
    t.false( v.char( 'q' ) );
    t.is( v.string( 'abc' ), 'abc' );

    v.allowed = false;
    t.false( v.char( 'x' ) );
    t.true( v.char( 'q') );
    t.is( v.string( 'abc', null ), null );
} );

test( 'known-identifier', t => {
    let v = new IdentifierListValidator( ['abc', 'xyz'] );

    t.true( v.char( 'q' ) );
    t.false( v.char( '#' ) );

    t.is( v.string( 'abc', null ), 'abc' );
    t.is( v.string( 'qrs', null ), 'qrs' );

    t.is( v.string( '%^&', null ), null );
} );