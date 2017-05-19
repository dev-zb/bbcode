import {is_func, ensure_array} from './util';
import {stack} from './stack';
import {string_iter} from './string-iter';
import {substring, scan_while, scan_to} from './string-util';
import {TextNode, ContainerNode, Node, TerminateNode, ValidResult} from './nodes';
import {ParseError, NodeParseError, NullError} from './error';

/**
 * string iterator with line/column tracking
 */
export class itr_ex extends string_iter
{
    _state = {};
    _last_break = null;     // last line break

    constructor( str, state = { line: 0, column: 0 }, index = 0 )
    {
        super( str, index );

        // copy constructor
        if ( str instanceof itr_ex )
        {
            Object.assign( this._state, str._state || {} );
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
        ++this._state.column;
        if ( this.value === '\n' )
        {
            this._last_break = new string_iter( this );
            ++this._state.line;
            this._state.column = 0;
        }
    }

    next()
    {
        let r = super.next();
        this._update_loc();
        return r;
    }

    set( itr )
    {
        super.set( itr );
        Object.assign( this._state, itr._state || {} );
    }

    clone()
    {
        return new itr_ex( this );
    }

    get last_break() { return this._last_break; }
}

/**
 * Main Parser
 */
export class Parser
{
    // parse state
    node_stack = null;
    _position = {
        line: 0,
        column: 0
    };
    errors = [];

    iterators = {
        forward: null,
        last_node: null,    // span since last node (used for tracking text nodes)
    };

    constructor( parsers )
    {
        this.sub_parsers = ensure_array( parsers );
    }

    /**
     * Parse string into node tree
     * @param {*} txt string to parse
     */
    parse( txt )
    {
        if ( !txt ) { return new ContainerNode(); }

        this.errors = [];
        this._position = {
            line: 0,
            column: 0
        };

        this.iterators.forward = new itr_ex( txt, this._position );
        this.iterators.last_node = this.iterators.forward.clone();

        let root_node = new ContainerNode();
        this.node_stack = new stack();
        this.node_stack.push( root_node );

        while ( !this.iterators.forward.done )
        {
            this.add_text();
            this.process_node( this.sub_parse( this.iterators.forward ) );
        }

        // add any unclaimed text
        this.add_text();

        // 
        this.node_stack.clear();
        return root_node;
    }

    _add_error( err )
    {
        if ( err instanceof NullError ) return null;
        if ( !(err instanceof ParseError) ) { throw err; }  // only capture parse errors

        this.errors.push( err );
        return err;
    }

    _error_n( msg, node )
    {
        return this._add_error( new NodeParseError( msg, node ) );
    }

    _error( msg, line, column )
    {
        return this._add_error( new ParseError( line || this._position.line, column || this._position.column, msg ) );
    }

    /**
     * zero the distance between the iterators (move last_node to forward)
     */
    collapse_iterators()
    {
        this.iterators.last_node.set( this.iterators.forward );
    }

    /**
     * add TextNode to another node
     * @param {*} parent target
     */
    add_text( parent = this.node_stack.back() )
    {
        if ( this.iterators.forward.distance( this.iterators.last_node ) )
        {
            parent.add_text_child(
                new TextNode(
                    this.iterators.last_node,
                    this.iterators.forward
                )
            );
            this.collapse_iterators();
        }
    }

    process_node( node )
    {
        if ( !node ) { return; }

        let top = this.node_stack.back();
        
        let updated = this.is_terminating( node ) ? this.terminate_node( node ) : this.add_node( node );

        if ( updated || top.def.discard_invalid )
        {
            // parse failed or node was discarded
            this.collapse_iterators();
        }
    }

    /**
     * attempt to add node to the top node & stack.
     */
    add_node( node )
    {
        let current_top = this.node_stack.back();
        let updated = false;

            // attempt to add child to current top node. ._.
        let result = current_top.add_child( node );
        if ( result === ValidResult.valid )
        {
            if ( !this.is_void( node ) )
            {
                this.node_stack.push( node ); // new top
            }
            updated = true;
        }
        else if ( result === ValidResult.terminate )
        {
            // the given node terminates the parent.
            current_top.open_end = true;
            updated = this.terminate_node( current_top, node );
        }
        else
        {
            // invalid child & not a terminating node.
            //      see if there is a node we can terminate.
            let find = this.node_stack.find( node, this._find_terminate );

                // term node found.
            if ( find )
            {
                updated = this.terminate_node( find, node );
            }
            else
            if ( current_top.def.discard_invalid )
            {
                this._error_n( 'Invalid child node', node );
            }
        }

        return updated;
    }
    _find_terminate( n, t ) { return t.terminate( n ); }  // use to find node to terminate

    /**
     * Search for and terminate a node
     * @param {*} node 
     * @param {*} inject node to inject before restoring the stack (when terminate successful)
     */
    terminate_node( node, inject )
    {
        let tmp_stack = new stack();
        let found = null;

        let top = this.node_stack.back();

        while ( !found && this.node_stack.size > 1 )
        {
            let t = this.node_stack.pop();
            if ( this.compare( node, t ) ) // compare id, def, value
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
            for ( let n of tmp_stack )
            {
                if ( n.def.overflow ) // child node remains after parent is terminated
                {
                    this._error_n( 'Misnested node', n );
                    if ( n.clone )
                    {
                        n = n.clone();
                        this.add_node( n );
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
        for( let parser of this.sub_parsers )
        {
            itr.set( itr_clone ); // reset
            try
            {
                if ( parser.can_parse( itr ) )
                {
                    let node = parser.parse( itr, this );
                    if ( node )
                    {
                        return node;
                    }
                }
            }
            catch( e )
            {
                this._add_error( e );
                if ( e.consume ) break;     // "consume": prevent any other parsers from attempting the same span
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
        return node.def.is_void || !(node instanceof ContainerNode);
    }

    is_terminating( node )
    {
        return node.terminating || node instanceof TerminateNode;
    }

    /**
     * Compares two nodes.
     */
    compare( n1, n2 )
    {
        if ( is_func( n1.compare ) ) { return n1.compare( n2 ); }
        if ( is_func( n2.compare ) ) { return n2.compare( n1 ); }

        return n1 === n2;
    }
}

