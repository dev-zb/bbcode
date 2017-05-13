import test from 'ava';
import {itr_ex} from '../src/parser';
import {TagDefinition, AttributeDefinition} from '../src/markup-def';
import {AttributeFormatter} from '../src/markup-formatter';
import {MarkupParser} from '../src/tag-parser';
import {NodeParseError} from '../src/error';
import {bbcode_format} from '../src/bbcode';
import {NodeFormatter} from '../src/formatter';
import {TagNode} from '../src/markup-node';

function f( i ) { return new NodeFormatter( i, bbcode_format ); }
function g( i, ...parms ) { return new TagDefinition( f( i ), ...parms ); }
function a( i, ...parms ) { return new AttributeDefinition( new AttributeFormatter( i, bbcode_format ), ...parms  ); }

/*
*/
test( 'parses valid tag', async t => {
    try
    {
        let def = new TagDefinition( f('a'), null, [] ); 
        let parser = new MarkupParser( [ def ], bbcode_format );
        let itr = new itr_ex( '[a]' );
        let result = await parser.parse( itr );
        t.true( result instanceof TagNode );
        t.is( result.def, def );
    }
    catch ( e )
    {
        t.fail( e.toString() );
    }
} );

test( 'fail when tag is malformed', async t => {
    let def = new TagDefinition( f('a'), null, null ); 
    let parser = new MarkupParser( [ def ], bbcode_format );

    ['[a', '[a b=c', '[a b="c"'].forEach( async str => {
        try
        {
            await parser.parse( new itr_ex( str ) );
            t.fail( `Should fail when parsing a malformed tag - ${str}` );
        }
        catch( e )
        {
            t.true( e instanceof NodeParseError );
        }
    } );
} );

test( 'fail when tag is undefined', async t => {
    let parser = new MarkupParser( [], bbcode_format );

    ['[a]', '[a b=c]', '[a b="c"]'].forEach( async str => {
        try
        {
            await parser.parse( new itr_ex( str ) );
            t.fail( `${str} should fail to parse` );
        }
        catch( e )
        {
            t.true( e instanceof NodeParseError );
        }
    } );
} );

test( 'parse all tags', async t => {
    try
    {
        let parser = new MarkupParser( [], bbcode_format, { parse_any: true } );

        ['[a]','[a b=c]'].forEach( async str => {
            let tag = await parser.parse( new itr_ex( str ) );

            t.true( tag instanceof TagNode );
            t.is( tag.def.identifier, 'a' );
        } );
    }
    catch( e )
    {
        t.fail( e.toString() );
    }
} );

test( 'parses attributes', async t => {
    let parser = new MarkupParser( [ new TagDefinition( f('a'), null, [a( 'b' )] ) ], bbcode_format );

    ['[a b="c"]','[a b=c]'].forEach( async str => {
        let tag = await parser.parse( new itr_ex( str ) );

        t.true( tag instanceof TagNode );
        t.true( tag.attributes.size > 0 );
        t.true( tag.attributes.has( 'b' ) );
        t.is( tag.attributes.get( 'b' ).value, 'c' );
    } );
} );

test( 'ignore illegal attributes', async t => {
    try
    {
        let parser = new MarkupParser( [ new TagDefinition( f('a'), null, [] ) ], bbcode_format );
        let tag = await parser.parse( new itr_ex( '[a b=c]' ) );

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
        let parser = new MarkupParser( [ new TagDefinition( f('a'), null, [] ) ], bbcode_format, { fail: { illegal_attribute: true } } );
        let tag = await parser.parse( new itr_ex( '[a b=c]' ) );

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
        let parser = new MarkupParser( [ new TagDefinition( f('a'), null, [a( 'b', { required: true } )] ) ], bbcode_format );
        let tag = await parser.parse( new itr_ex( '[a]' ) );
        t.fail( 'Should fail when missing a required attribute' );
    }
    catch( e )
    {
        t.true( e instanceof NodeParseError );
    }
} );

test( 'fail when attribute missing required value', async t => {
    let parser = new MarkupParser( [ new TagDefinition( f('a'), null, [a( 'b', { require_value: true } )] ) ], bbcode_format, { fail: { bad_attribute: true } } );

    ['[a b]', '[a b=]', '[a b=""]'].forEach( async str => { 
        try 
        {
            let tag = await parser.parse( new itr_ex( str ) );
            t.fail( `Should fail to parse - ${str}` );
        }
        catch( e )
        {
            t.true( e instanceof NodeParseError );
        }
    } );
} );
/*
*/