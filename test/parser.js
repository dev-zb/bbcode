import test from 'ava';
import {Parser} from '../src/parser';
import {Node, TextNode, TerminateNode, ValidResult} from '../src/nodes';
import {substring_scan_to} from '../src/string-util';
import {ParseError} from '../src/error';
import {ContainerNode} from '../src/nodes';

class MockNode extends ContainerNode
{
    constructor( def, props )
    {
        super( def, props, MockNode );
    }
}

class MockDef
{
    constructor( ident, children, is_void, overflow )
    {
        this.is_void = is_void;
        this.children = children || null;
        this.identifier = ident;
        this.overflow = !!overflow;
    }

    valid_child( child )
    {
        if ( child.def === this ) { return ValidResult.terminate; }  // self-terminating

        return child instanceof TextNode || !this.children || this.children.includes( child.def.identifier );
    }
}

class MockSubParser
{
    constructor()
    {
        this.elements = new Map([
            ['a', new MockDef( 'a', ['b','c'], false, false ) ],
            ['b', new MockDef( 'b', null, true ) ],
            ['c', new MockDef( 'c', null, false, true) ]
        ]);
    }

    can_parse( itr )
    {
        return itr.value === '{';
    }

    parse( itr, parser )
    {
        itr.next();

        let terminate = itr.value === '/';
        terminate && itr.next();

        let identifier = substring_scan_to( itr, '}' );
        if ( !identifier ) { throw new ParseError( `Invalid identifier` ); }

        let def = this.elements.get( identifier );
        if ( !def ) { throw new ParseError( `No defined element "${identifier}"` ); }

        itr.next(); // skip }
        if ( terminate ) { return new TerminateNode( def ); }

        return new MockNode( def );
    }
}

async function parse( str )
{
    let p = new Parser( new MockSubParser() );
    return await p.parse( str );
}

/*
*/
test( 'empty or invalid strings', async t => {
    let r = await parse( null );
    t.true( r instanceof ContainerNode );
    t.is( r.children.length, 0 );
} );

test( 'text', async t => {
    let r = await parse( 'foo bar' );
    
    t.true( r instanceof ContainerNode );
    t.is( r.children.length, 1 );
    t.true( r.children[0] instanceof TextNode );
    t.is( r.children[0].value, 'foo bar' );
} );

test( 'only node', async t => {
    let r = await parse( '{a}' );

    t.is( r.children.length, 1 );

    let a = r.children[0];
    t.true( a instanceof MockNode );
    t.is( a.def.identifier, 'a' );
    t.is( a.children.length, 0 );
} );

test( 'node with text', async t => {
    let r = await parse( '{a}foo{/a}' );

    let a = r.children[0];
    t.is( a.children.length, 1 );
    t.true( a.children[0] instanceof TextNode );
    t.is( a.children[0].value, 'foo' );
} );

test( 'trailing text', async t => {
    let r = await parse( '{a}foo{/a} bar' );

    t.is( r.children.length, 2 );
    t.true( r.children[0] instanceof MockNode );
    t.true( r.children[1] instanceof TextNode );
} );

test( 'unterminated node', async t => {
    let r = await parse( 'foo {a}bar' );

    t.is( r.children.length, 2 );
    t.true( r.children[0] instanceof TextNode );
    t.true( r.children[1] instanceof MockNode );
} );

test( 'void nodes', async t => {
    let r = await parse( 'foo {b} bar' );

    t.is( r.children.length, 3 );
    t.true( r.children[0] instanceof TextNode );
    t.true( r.children[1] instanceof MockNode );
    t.true( r.children[2] instanceof TextNode );
} );

test( 'terminating nodes', async t => {
    let r = await parse( '{a}foo{a}bar{/a}' );

    t.is( r.children.length, 2 );
    t.true( r.children[0] instanceof MockNode );
    t.true( r.children[1] instanceof MockNode );

    t.is( r.children[0].def.identifier, 'a' );
    t.is( r.children[1].def.identifier, 'a' );
} );

test( 'misnesting with overflow', async t => {
    let r = await parse( '{a}foo {c}bar {/a}baz {/c}' );

    t.is( r.children.length, 2 );
    t.true( r.children[0] instanceof MockNode );    // '{a}...{/a}'
    t.true( r.children[1] instanceof MockNode );    // '{c}baz {/c}'

    t.is( r.children[0].def.identifier, 'a' );
    t.is( r.children[1].def.identifier, 'c' );

    let a = r.children[0];
    t.is( a.children.length, 2 );
    t.true( a.children[0] instanceof TextNode );    // 'foo '
    t.true( a.children[1] instanceof MockNode );    // '{c}bar {/c}'
} );

test( 'misnesting without overflow', async t => {
    let r = await parse( '{c}foo {a}bar {/c} baz' );

    t.is( r.children.length, 2 );
    t.true( r.children[0] instanceof MockNode );    // '{c}...{/c}'
    t.true( r.children[1] instanceof TextNode );    // ' baz'

    t.is( r.children[0].def.identifier, 'c' );

    let c = r.children[0];
    t.is( c.children.length, 2 );
    t.true( c.children[0] instanceof TextNode );    // 'foo '
    t.true( c.children[1] instanceof MockNode );    // '{a}bar {/a}'
} );

test( 'logs invalid element', async t => {
    let p = new Parser( new MockSubParser() );
    let r = await p.parse( '{d}' );

    t.is( p.errors.length, 1 );
} );

test( 'layered termination', async t => {
    // elements that terminated grandparents:
    let r = await parse( '{a}1{c}2{a}3{c}4{/a}5' );

    /*
        {a}1
            {c}2
                {a}3
                    {c}4
                {/a}
            5
        ------------------
        {a}1
           {c}2
              {a}3
                 {c}4{/c}
              {/a}
           {/c}
           {c}5{/c}
        {/a}
    */

    let p = (n,d) => {
        let i = n.def ? n.def.identifier : '???';
        if ( n.children )
            for( let c of n.children )
                p( c, d + '-' );
    };
    p( r, '' );

    t.is( r.children.length, 1 );

    let a = r.children[0];
    t.true( a instanceof MockNode );
    t.is( a.children.length, 3 );

    let c = a.children[1];
    t.true( c instanceof MockNode );
    t.is( c.children.length, 2 );

    a = c.children[1];
    t.true( a instanceof MockNode );
    t.is( a.children.length, 2 );

    c = a.children[1];
    t.true( c instanceof MockNode );
    t.is( c.children.length, 1 );
} );