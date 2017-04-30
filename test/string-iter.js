import test from 'ava';
import {string_iter, substring, substring_quoted, scan_to, scan_while} from '../src/string-iter';

test( 'stop at string end', t => {
    let itr = new string_iter('abcd');

    let i = 1;
    while( !itr.next().done && i < 10 ) ++i;

    t.is( itr.index, i );
    t.true( itr.end() );
});

test( 'unicode characters', t => {
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

test( 'substring', t => {
    let it1 = new string_iter( 'abcdef', 1 );
    let it2 = it1.clone();
    it2.index = 4;

    let str = substring( it1, it2 );
    
    t.is( str, 'bcd' );
});

test( 'substring_quoted', t => {
    let itr = new string_iter( '"foo"' );
    let str = substring_quoted( itr );

    t.is( str, 'foo' );
});

test( 'substring_quoted with invalid', t => {
    let itr = new string_iter( ':foo bar:');
    let str = substring_quoted( itr, ' ' );

    t.is( str, '' );
});

test( 'scan_to', t => {

    [
        '=',
        ['='],
        v => v == '='
    ]
     .forEach( _t => {
        let itr = new string_iter( 'abc=def' );
        scan_to( itr, _t );
        t.is( itr.value, '=' );
    });
});

test( 'scan_while', t => {

    [
        '.',
        ['.'],
        v => v == '.'
    ]
     .forEach( _t => {
        let itr = new string_iter( '....bc' );
        scan_while( itr, _t );
        t.is( itr.value, 'b' );
    });
});