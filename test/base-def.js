import {test} from 'ava';
import {BaseDefinition} from '../src/node-def';
import {BaseFormatter} from '../src/formatter';
import {FormatProperties} from '../src/format';

test( 'single formatter', t => {
    let f = new BaseFormatter( 'a', new FormatProperties('foo') )
    let def = new BaseDefinition( f );

     t.is( def.formatters.size, 1 );

     t.true( def.origin instanceof BaseFormatter );
     t.is( def.origin, f );
} );

test( 'multiple formatters', t => {
    let fa = new BaseFormatter( 'a', new FormatProperties( 'foo' ) );
    let fb = new BaseFormatter( 'b', new FormatProperties( 'bar' ));

    let def = new BaseDefinition( [fa, fb] );

     t.is( def.formatters.size, 2 );
     t.is( def.origin, fa );
     t.is( def.formatters.get( 'foo' ), fa );
     t.is( def.formatters.get( 'bar' ), fb );

} );

test( 'other properties', t => {
    let f = new BaseFormatter( 'a', new FormatProperties('foo') )
    let def = new BaseDefinition( f, { test: true } );

    t.true( def.test );
} );