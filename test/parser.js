import test from 'ava';
import {TagDefinition,AttributeDefinition} from '../src/def';
import {HtmlTagFormatter} from '../src/html';
import {TagParser, TagNode} from '../src/tag-parser';
import {Parser} from '../src/parser';
import {Node,TextNode} from '../src/nodes';

function parser( format )
{
    let tags = 'ab'.split('').map( n => new TagDefinition( n ) ); 

    tags.push( new TagDefinition( 'nov', null, null, null, { overflow: false } ) );
    tags.push( new TagDefinition( 'void',  [], [], null, { is_void: true } ) );

    tags.push( new TagDefinition( 'trm', null, null, null, { terminate: ['trm'] } ),)

    return new Parser( new TagParser( tags, format ) );
}

async function parse( t )
{
    let p = parser();
    return await p.parse( t );
}

test( 'empty or invalid strings', async t => {
    let r = await parse( null );
    t.true( r instanceof Node );
    t.is( r.children.length, 0 );
} );

test( 'valid bbcode', async t => {
    let r = await parse( '[a]x[b]y[/b]z[/a]' );

    t.true( r instanceof Node );
    t.is( r.children.length, 1 );

    let c = r.children[0];
    t.is( c.name, 'a' );
    t.is( c.children.length, 3 );

    t.true( c.children[0] instanceof TextNode && c.children[2] instanceof TextNode );

    c = c.children[1];
    t.is( c.name, 'b' );
    t.is( c.children.length, 1 );
} );

test( 'misnesting with overflow', async t => {
    let r = await parse( '[a]x[b]y[/a]z' );

    t.true( r instanceof Node );
    t.is( r.children.length, 2 ); // [a]...[/a][b]z[/b]
    t.true( r.children[0] instanceof TagNode && r.children[1] instanceof TagNode );

    let c = r.children[0];
    t.is( c.name, 'a' );
    t.is( c.children.length, 2 );

    c = r.children[1];
    t.is( c.name, 'b' );
    t.is( c.children.length, 1 );
} );

test( 'misnesting without overflow', async t => {
    let r = await parse( '[a]x[nov]y[/a]z' );

    t.is( r.children.length, 2 );
    t.true( r.children[0] instanceof TagNode );
    t.false( r.children[1] instanceof TagNode );

    let n = r.children[0];
    t.is( n.children.length, 2 );
    t.true( n.children[1] instanceof TagNode );

    t.is( n.children[1].name, 'nov' );
})

test( 'void tags', async t => {
    let r = await parse( '[void]test' );

    t.is( r.children.length, 2 );
    t.true( r.children[0] instanceof TagNode );
    t.true( r.children[1] instanceof TextNode );
} );

test( 'terminating nodes', async t => {
    let r = await parse( '[trm]a[trm]b' );

    t.is( r.children.length, 2 );
    t.true( r.children[0] instanceof TagNode && r.children[1] instanceof TagNode );

    t.is( r.children[0].children.length, 1 );
    t.is( r.children[1].children.length, 1 );
} );