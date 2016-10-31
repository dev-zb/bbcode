import test from 'ava';
import {string_iter, substring, substring_quoted, scan_to, scan_while} from '../src/string-iter';

test( 'stop at string end', t => {
    let itr = new string_iter('abcd');

    let i = 1;
    while( !itr.next().done && i < 10 ) ++i;

    t.is( itr.index, i );
    t.true( itr.end() );
});

test( 'handle unicode characters', t => {
    let str = ['a','⛄','b','\u{2620}'];
    let itr = new string_iter( str.join( '' ) );

    let i = 0;
    while( !itr.end() )
    {
        t.is( itr.index, i );
        t.is( itr.value, str[i] );
        itr.next();
        ++i;
    }
});

test( 'helper:substring', t => {
    let it1 = new string_iter( 'abcdef', 1 );
    let it2 = it1.clone();
    it2.index = 4;

    let str = substring( it1, it2 );
    
    t.is( str, 'bcd' );
});

test( 'helper:substring_quoted', t => {
    let itr = new string_iter( '"foo"' );

    let str = substring_quoted( itr );

    t.is( str, 'foo' );
});

test( 'helper:scan_to', t => {
    let itr = new string_iter( 'abc=def' );

    let tests = [
        '=',
        ['='],
        v => v == '='
    ];

    tests.forEach( _t => {
        itr.index = 0;
        scan_to( itr, _t );
        t.is( itr.value, '=' );
    });
});

test( 'helper:scan_while', t => {
    let itr = new string_iter( '....bc' );

    let tests = [
        '.',
        ['.'],
        v => v == '.'
    ];

    tests.forEach( _t => {
        itr.index = 0;
        scan_while( itr, _t );
        t.is( itr.value, 'b' );
    });
});