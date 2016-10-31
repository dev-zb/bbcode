import test from 'ava';
import {stack} from '../src/stack';

test( 'remove/add single items', t => {
    let _s = new stack();
    let _v = 'one';

    t.is( _s.size, 0 );

    _s.push( _v );
    t.is( _s.back(), _v );
    t.is( _s.size, 1 );

    let _p = _s.pop();
    t.is( _p, _v );
    t.is( _s.size, 0 );
});

test( 'add multiple & clear', t => {
    let _s = new stack();

    t.is( _s.size, 0 );

    _s.push( 1, 2, 3, 4 );
    t.is( _s.size, 4 );
    t.is( _s.back(), 4 );
    t.is( _s.front(), 1 );

    _s.clear();
    t.is( _s.size, 0 );
});

test( 'merge collections', t => {
   let _s1 = new stack();
   let _s2 = new stack();

   _s1.push( 1,2,3 );
   _s2.push( 4,5,6 );

   _s1.push_col( _s2 );

   t.is( _s1.size, 6 );
   t.is( _s1.front(), 1 );
   t.is( _s1.back(), 6 ); 
});

