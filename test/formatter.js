import {test} from 'ava';
import {BaseFormatter,
        NodeFormatter} from '../src/formatter.js';

let format = {
    sanitize: t => t
};

test( 'base', async t => {
    let f = new BaseFormatter( 'foo', format, { test: true } );

    t.is( f.identifier, 'foo' );
    t.is( f.format_props, format );
    t.true( f.test );
} );

test( 'node', async t => {
    let f = new NodeFormatter( 'foo', format, { test: true } );

    t.is( f.identifier, 'foo' );
    t.is( f.format_props, format );
    t.true( f.test );

    let r = f.format( { children: [
        { format: () => 'b' },
        { format: () => 'a' },
        'r'
    ]} );

    t.is( r, 'foo bar' );
} );