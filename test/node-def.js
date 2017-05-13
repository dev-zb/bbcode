import {test} from 'ava';
import {NodeDefinition} from '../src/node-def';
import {BaseFormatter} from '../src/formatter';
import {FormatProperties} from '../src/format';

let fmtr = new BaseFormatter( 'a', new FormatProperties( 'foo' ) );

test( 'set properties', t => {
    let def = new NodeDefinition( fmtr, { overflow: false, blah: 'blah' } );

    t.false( def.overflow );
} );

test( 'add children', t => {
    let def = new NodeDefinition( fmtr, { children: ['a','b'] } );

    t.not( def.children, null );
    t.is( def.children.size, 2 );

    t.true( def.children.has( 'a' ) );
    t.true( def.children.has( 'b' ) );
} );

test( 'add parents', t => {
    let def = new NodeDefinition( fmtr, { parents: ['a','b'] } );

    t.not( def.parents, null );
    t.is( def.parents.size, 2 );

    t.true( def.parents.has( 'a' ) );
    t.true( def.parents.has( 'b' ) );
} );

test( 'add terminators', t => {
    let def = new NodeDefinition( fmtr, { terminator: ['a','b'] } );

    t.not( def.terminator, null );
    t.is( def.terminator.size, 2 );

    t.true( def.terminator.has( 'a' ) );
    t.true( def.terminator.has( 'b' ) );
} );

test( 'valid_parent', t => {
    {
        let def = new NodeDefinition( fmtr, { parents: ['a','b'] } );

        t.true( def.parents_allowed );
        t.true( def.valid_parent( 'a' ) );
        t.false( def.valid_parent( 'c' ) );
    }
    {
        let def = new NodeDefinition( fmtr, { parents: ['a','b'], parents_allowed: false } );

        t.false( def.parents_allowed );
        t.false( def.valid_parent( 'a' ) );
        t.true( def.valid_parent( 'c' ) );
    }
} );
/**/