import test from 'ava';
import {string_iter} from '../src/string-iter';


test( 'stop at string end', t => {
    let itr = new string_iter('abcd');

    let i = 1;
    while( !itr.next().done && i < 10 ) ++i;

    t.is( itr.index, i );
    t.true( itr.end() );
} );

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
} );