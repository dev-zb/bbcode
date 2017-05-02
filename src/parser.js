import {is_func, ensure_array, valid_identifier} from './helper';
import {stack} from './stack';
import {string_iter} from './string-iter';
import {substring, scan_while, scan_to} from './string-util';
import {TextNode, ContainerNode, Node} from './nodes';
import {ParseError, NodeParseError, NullError} from './error';

export class itr_ex extends string_iter
{
    _state = {};
    _last_break = null;

    constructor( str, state = { line: 0, column: 0 }, index = 0 )
    {
        super( str, index );

        // copy constructor
        if ( str instanceof itr_ex )
        {
            Object.assign(this._state, str._state);
        }
        else if ( state ) // new constructor
        {
            this._state = state;
        }
    }

    get line() { return this._state.line; }
    set line( v ) { this._state.line = v; }

    get column() { return this._state.column; }
    set column( v ) { this._state.column = v; }

    _update_loc()
    {
        ++this._state._column;
        if ( this.value === '\n' )
        {
            this._last_break = new string_iter( this );
            ++this._state.line;
            this._state.column = 0;
        }
    }

    next()
    {
        super.next();
        this._update_loc();
    }

    clone()
    {
        return new itr_ex( this );
    }

    get last_break() { return this._last_break; }
}




/**
 * ==================== 
 *      Parser
 * ==================== 
 */
export class Parser
{
    static default_config = {
        //types: new Map(),   // parsable types
        parsers: [],    // sub-parsers
        whitespace: [ 
            '\u0009', '\u000A', '\u000B', '\u000C', '\u000D', '\u0020', '\u0085', '\u00A0',
            '\u1680', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006',
            '\u2007', '\u2008', '\u2009', '\u200A', '\u2028', '\u2029', '\u202F', '\u205F',
            '\u3000' ]

    };

    config = {};

    node_stack = new stack();   // 
    pending_text = null;        // store any parsed text here while parsing a node. some nodes might need access to this text.

    _position = {
        line: 0,
        column: 0
    };
    errors = [];

    constructor( parsers, config = {} )
    {
        Object.assign( this.config, Parser.default_config, config );

        this.config.parsers = ensure_array( parsers );
    }

    /**
     * Parse string
     * @param txt string to parse
     * @return root node of a parsed tree.
     */
    parse( txt )
    {
        if ( !txt ) { return new ContainerNode(); }

        this.errors = [];
        this._position = {
            line: 0,
            column: 0
        };

        let itr = new itr_ex( txt, this._position );

        let root_node = new ContainerNode();

        this.node_stack.clear();
        this.node_stack.push( root_node );

        let text_itr = itr.clone();

        let node = null;
        
        while ( !itr.end() )
        {
                // save possible text range
            this.pending_text = new TextNode( text_itr, itr );
                // parse node will modify the given iterator
            if ( (node = this.sub_parse( itr )) ) // parse the node ( [tag] or anything, not the contents )
            {
                let top = this.node_stack.back();
                top.add_child( this.pending_text );

                let mod = false;
                if ( this.is_void(node) || !node.terminating )
                {
                    mod = this.add_node( node );
                }
                else if ( node.terminating )   // a closing node
                {
                    mod = this.terminate_node( node );
                }

                if ( !mod && !this.node_stack.back().discard_invalid )
                {
                    // stack was not modified and no children were added to top. remove last text node.
                    top.remove_child( this.pending_text );
                }
                else { text_itr = itr.clone(); }
            }
        }

        // add any unclaimed text
        if ( itr.distance( text_itr ) > 0 )// text_itr.diff(itr) )
        {
            this.node_stack.back().add_child( new TextNode( text_itr, itr ) );
        }

        // 
        this.node_stack.clear();
        return root_node;
    }

    _add_error( err )
    {
        if ( err instanceof NullError ) return null;

        if ( !(err instanceof ParseError) )
        {
            err = new ParseError( err.toString(), this._position.line, this._position.line );
        }
        this.errors.push( err );
        return err;
    }

    _error_n( msg, node )
    {
        return this._add_error( new NodeParseError( msg, node ) );
    }

    _error( msg, line, column )
    {
        return this._add_error( new ParseError( line || 0, column || 0, msg ) );
    }


    /**
     * attempt to add node to the top node & stack.
     */
    add_node( node )
    {
        let change = false; // change to node_stack or top node child list?

            // attempt to add child to current top node. ._.
        let result = this.node_stack.back().add_child( node );
        if ( result === true )
        {
            if ( !this.is_void(node) )
            {
                this.node_stack.push( node ); // new top
            }
            change = true;
        }
        else if ( result === node )
        {
            // add_child returns the given node when it terminates the parent.
            change = this.terminate_node( this.node_stack.back(), node );
        }
        else
        {
            // invalid child & not a terminating node.
            //      see if there is a node we can terminate.
            let find = this.node_stack.find( node, this._find_terminate );

                // terminable node found.
            if ( find )
            {
                change = this.terminate_node( find, node );
            }
            else
            if ( this.node_stack.back().discard_invalid )
            {
                this._error_n( 'Invalid child node', node );
            }
        }

        return change;
    }
    _find_terminate( n, t ) { return t.terminate(n); }

    /**
     * terminate a node
     * @param node node to terminate
     * @param inject [optional] node to inject right after node termination.
     */
    terminate_node( node, inject )
    {
        // find opening node in stack
        let tmp_stack = [];
        let found = null;

        let top = this.node_stack.back();

        // look for [node] in the node_stack. store popped nodes in another stack.
        while ( !found )
        {
            if ( this.node_stack.size <= 1 ) break; // root is never removed.

            let t = this.node_stack.pop();
            if ( this.compare( node, t ) ) 
            {
                found = t;
            }
            else
            {
                tmp_stack.push( t );
            }
        }

        if ( found )
        {
            // target node now off the node_stack and complete.

            if ( inject )
            {
                this.add_node( inject ); // right after closing of [node].
            }

            // handle other removed nodes
            while ( tmp_stack.length )
            {
                let n = tmp_stack.pop();

                // overflow nodes continue in the new top (if possible).
                if ( n.overflow )
                {
                    this._error_n( 'Misnested node', n );
                    if ( n.clone )
                    {
                        n = n.clone();
                        if ( this.node_stack.back().add_child(n) === true ) // add as child to the current stack top
                        {
                            this.node_stack.push( n );             // make new stack top (parent)
                        }
                    }
                }
                else
                {
                    this._error_n( 'Node terminated by parent', n );
                }
            }
        }
        else // unmatched terminating node 
        {
            this.node_stack.push_many( tmp_stack );   // return stack to normal
            this._error_n( 'Unmatched terminating node', node );
        }

        return !!found;
    }

    /**
     * Call a sub parser
     */
    sub_parse( itr )
    {
        let itr_clone = itr.clone();
        for( let parser of this.config.parsers )
        {
            try
            {
                if ( parser.can_parse( itr ) )
                {
                    let node = parser.parse( itr, this );       // attempt parse
                    if ( node !== null ) return node;
                    itr.set( itr_clone );
                }
            }
            catch( e )
            {
                this._add_error( e );
                if ( e.consume ) break; // "consume": sub-parser wants whatever text it scanned to be considered "processed" and remain as plain text.
                itr.set( itr_clone );      // otherwise the iterator is reset and another parser is attempted.
            }
        }

        if ( !itr.distance( itr_clone ) ) { itr.next(); } // no parsers recognize this character; skip.

        return null;
    }

    /**
     * Check if a parsed node is a void node. (self-completing node)
     */
    is_void( node )
    {
        return node.is_void || !(node instanceof ContainerNode);
    }

    /**
     * Compares two nodes.
     */
    compare( n1, n2 )
    {
        return is_func( n1.compare ) ? n1.compare(n2) : n1 === n2;
    }

    is_whitespace( c )
    {
        return this.config.whitespace.includes(c);
    }

    /**
     * Step iterator until a non-whitespace character is found
     */
    skip_whitespace( itr )
    {
        scan_while( itr, this.config.whitespace );
    }

    /**
     * Scan until whitespace
     */
    to_whitespace( itr )
    {
        scan_to( itr, this.config.whitespace );
    }

    identifier_parse( itr, validate )
    {
        if ( !validate ) { validate = valid_identifier; }

        if ( !validate( itr.value, true ) ) { return ''; }

        let it = itr.clone();
        itr.next();
        scan_while( itr, validate );

        return substring( it, itr ).toLowerCase();
    }
}

