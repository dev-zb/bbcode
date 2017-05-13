import {test} from 'ava';
import {TagDefinition, AttributeDefinition} from '../src/markup-def';
import {BaseFormatter} from '../src/formatter';
import {FormatProperties} from '../src/format';

let frmt = new FormatProperties( 'test' );

test( 'adding children', t => {
    let def = new TagDefinition( new BaseFormatter( 'a', frmt ), ['c','d'] );

    t.is( def.children.size, 2 );
} );

test( 'adding attributes', t => {
    let attr = new AttributeDefinition( new BaseFormatter( 'x', frmt ) );
    let def = new TagDefinition( new BaseFormatter( 'a', frmt ), null, [attr] );

    t.is( def.attributes.size, 1 );
    t.is( def.attributes.get( 'x' ), attr );
} );

test( 'create attributes', t => {
    let def = new TagDefinition( new BaseFormatter( 'a', frmt ) );

    t.true( def._allow_all_attributes );
    t.is( def.formatters.size, 1 );

    let attr = def.get_attribute( 'foo' );

    t.true( attr instanceof AttributeDefinition );
    t.is( def.attributes.size, 1 );
    t.is( def.attributes.get( 'foo' ), attr );
} );