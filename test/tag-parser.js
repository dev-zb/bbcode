import test from 'ava';
import {itr_ex, Parser} from '../src/parser';
import {TagDefinition, AttributeDefinition} from '../src/def';
import {TagNode, TagParser} from '../src/tag-parser';
import {NodeParseError} from '../src/error';
import {bbcode_format} from '../src/bbcode';

test( 'parses valid tag', async t => {
    try
    {
        let def = new TagDefinition( 'a', null, [] ); 
        let parser = new TagParser( [ def ], bbcode_format );
        let itr = new itr_ex( '[a]' );
        let result = await parser.parse( itr, new Parser() );
        t.true( result instanceof TagNode );
        t.is( result.def, def );
    }
    catch ( e )
    {
        t.fail( e.toString() );
    }
} );

test( 'fail when tag is malformed', async t => {
    try
    {
        let parser = new TagParser( [ new TagDefinition( 'a', null, [] ) ], bbcode_format );
        await parser.parse( new itr_ex( '[a' ), new Parser() );
        t.fail();
    }
    catch( e )
    {
        t.true( e instanceof NodeParseError );
    }
} );

test( 'fail when tag is undefined', async t => {
    try
    {
        let parser = new TagParser( [], bbcode_format );
        await parser.parse( new itr_ex( '[a]' ), new Parser() );
        t.fail();
    }
    catch( e )
    {
        t.true( e instanceof NodeParseError );
    }
} );

test( 'parse all tags', async t => {
    let parser = new TagParser( [], bbcode_format, { parse_any: true } );
    let tag = await parser.parse( new itr_ex( '[a b=c]' ), new Parser() );

    t.true( tag instanceof TagNode );
    t.is( tag.def.identifier, 'a' );
} );

test( 'parses attributes', async t => {
    let parser = new TagParser( [ new TagDefinition( 'a', null, [new AttributeDefinition( 'b' )] ) ], bbcode_format );

    ['[a b="c"]','[a b=c]'].forEach( async str => {

        let tag = await parser.parse( new itr_ex( str ), new Parser() );

        t.true( tag instanceof TagNode );
        t.true( tag.attributes.size > 0 );
        t.true( tag.attributes.has( 'b' ) );
        t.is( tag.attributes.get( 'b' ).value, 'c' );
    } );
} );

test( 'ignore illegal attributes', async t => {
    try
    {
        let parser = new TagParser( [ new TagDefinition( 'a', null, [] ) ], bbcode_format );
        let tag = await parser.parse( new itr_ex( '[a b=c]' ), new Parser() );

        t.true( tag instanceof TagNode );
        t.is( tag.attributes.size, 0 );
        t.true( !tag.attributes.has( 'b' ) );
    }
    catch( e )
    {
        t.fail( e.toString() );
    }
} );

test( 'fail on illegal attribute', async t => {
    try
    {
        let parser = new TagParser( [ new TagDefinition( 'a', null, [] ) ], bbcode_format, { fail: { illegal_attribute: true } } );
        let tag = await parser.parse( new itr_ex( '[a b=c]' ), new Parser() );

        t.fail( 'Should fail when containing an illegal (undefined) attribute' );
    }
    catch( e )
    {
        t.true( e instanceof NodeParseError );
    }
} );

test( 'fail on missing required attribute', async t => {
    try
    {
        let parser = new TagParser( [ new TagDefinition( 'a', null, [new AttributeDefinition( 'b', null, { required: true } )] ) ], bbcode_format );
        let tag = await parser.parse( new itr_ex( '[a]' ), new Parser() );

        t.fail( 'Should fail when missing a required attribute' );
    }
    catch( e )
    {
        t.true( e instanceof NodeParseError );
    }
} );

test( 'fail when attribute missing required value', async t => {
    let parser = new TagParser( [ new TagDefinition( 'a', null, [new AttributeDefinition( 'b', null, { require_value: true } )] ) ], bbcode_format );

    try
    {
        let tag = await parser.parse( new itr_ex( '[a b]' ), new Parser() );
        t.fail( 'Attribute is void' );
    }
    catch( e )
    {
        t.true( e instanceof NodeParseError );
    }

    try
    {
        let tag = await parser.parse( new itr_ex( '[a b=]' ), new Parser() );
        t.fail( 'No value after =' );
    }
    catch( e )
    {
        t.true( e instanceof NodeParseError );
    }
} );