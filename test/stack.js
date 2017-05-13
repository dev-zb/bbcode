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

test( 'iteration', t => {
    let _s = new stack( 1, 2, 3, 4 );

    t.is( _s.size, 4 );

    let i = 5;
    for( let n of _s )
    {
        t.is( n, --i );
    }
} );

test( 'add multiple & clear', t => {
    let _s = new stack();

    t.is( _s.size, 0 );

    _s.push_many( [1, 2, 3, 4] );
    t.is( _s.size, 4 );
    t.is( _s.back(), 4 );
    t.is( _s.front(), 1 );

    _s.clear();
    t.is( _s.size, 0 );
});

test( 'merge stacks', t => {
   let _s1 = new stack( 1, 2, 3 );
   let _s2 = new stack( 4, 5, 6 );  // stack top is 6

   _s1.push_many( _s2 );

   t.is( _s1.size, 6 );
   t.is( _s1.front(), 1 );
   t.is( _s1.back(), 4 );   // stack reversed when merged, top is 4
});

test( 'push Map', t => {
    let _s1 = new stack();
    let m = new Map([['a',0],['b',1]]);

    _s1.push_many( m );
    t.is( _s1.pop(), 1 );
    t.is( _s1.pop(), 0 );
} );

test( 'push Generator', t => {
    let _s1 = new stack();

    function *g()
    {
        yield 1;
        yield 2;
    }

    _s1.push_many( g );
    t.is( _s1.size, 2 );
    t.is( _s1.pop(), 2 );
    t.is( _s1.pop(), 1 );
} );

test( 'pop_each', t => {
    let s = new stack( 1, 2 );

    let i = 0;
    s.pop_each( v => {
        if ( v & 1 ) { s.push( v + 1 ); }   // pop_each works while adding items
        ++i;
    } );

    t.is( s.size, 0 );
    t.is( i, 3 );
} );

test( 'any_of', t => {
    let s = new stack( 2, 4, 7, 8 );
    t.is( s.any_of( v => v & 1 ), true );
} );

test( 'all_of', t => {
    let s = new stack( 0x2, 0x4, 0x8, 0x10 );
    let p2 = v => !((v - 1) & v);
    t.is( s.all_of( p2 ), true );
} );
