import test from 'ava';
import {TagDefinition, AttributeDefinition} from '../src/markup-def';
import {TagNode, TagAttribute} from '../src/markup-node';
import {TagFormatter, AttributeFormatter} from '../src/markup-formatter';
import {ValidResult} from '../src/nodes';
import {bbcode_format} from '../src/bbcode';

function tag( n, c = [], a = null, f = {} )
{
    return new TagNode( new TagDefinition( new TagFormatter( n, bbcode_format ), c, a, f ) );
}

function attr( n, f )
{
    return new TagAttribute( null, new AttributeDefinition( new AttributeFormatter( n, bbcode_format ), f ) );
}

test( 'fails when given invalid definition', t => {
    try
    {
        new TagNode();
    }
    catch( e )
    {
        t.pass();
    }
} );

test( 'allow valid children', t => {
    let a = tag( 'a', ['b'] );
    let b = tag( 'b' );

    t.is( a.add_child( b ), ValidResult.valid );
} );

test( 'does not allow invalid children', t => {
    let a = tag( 'a' );
    let b = tag( 'b' );

    t.not( a.add_child( b ), ValidResult.valid );
} );

test( 'allow valid attributes', t => {
    let a = attr( 'a' );

    let b = tag( 'b', null, [a.def] );

    t.is( b.add_attribute( a ), ValidResult.valid );
} );

test( `don't allow invalid attributes`, t => {
    let a = attr( 'a' );
    let b = tag( 'b', null, [] );

    t.false( b.add_attribute( a ) );
} );
