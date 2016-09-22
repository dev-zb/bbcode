import {ensure_array, valid_identifier} from './helper';
import {stack} from './stack' 
import {string_iter, substring, scan_while, scan_to} from './string-iter';
import {RootNode,TextNode,VoidNode} from './nodes';

/**
 * 
 */
export class ParseError
{
    constructor( line, column, error )
    {
        this.line = line;
        this.column = column;
        this.error = error;
    }

    toString()
    {
        return `[${this.line}:${this.column}] ${this.error}`;
    }
}

/**
 * ==================== 
 *      Parser
 * ==================== 
 */
export class Parser
{
    static default_config = {
        types: new Map(),   // parsable types
        whitespace: [ '\u0009', '\u000A', '\u000B', '\u000C', '\u000D', '\u0020', '\u0085', '\u00A0',
                      '\u1680', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006',
                      '\u2007', '\u2008', '\u2009', '\u200A', '\u2028', '\u2029', '\u202F', '\u205F',
                      '\u3000' ]

    };

    config = {};

    node_stack = new stack();

    // error reporting
    __line = 0;
    __column = 0;
    errors = [];

    constructor( types, config = {} )
    {
        Object.assign( this.config, Parser.default_config, config );

        this.config.types = new Map();
        if ( types )
        {
            types = ensure_array( types );
            for( let t of types )
            {
                this.add_type( t );
            }
        }
    }

    /**
     * Add a parsable type
     * @param delim single character that tells the parser call the type parser
     * @param type_parser class with a parse method: parse( iterator, main_parser ) 
     */
    add_type( type_parser )
    {
        this.config.types.set( type_parser.start_delim, type_parser );
    }

    /**
     * Parse string
     * @param txt string to parse
     * @return root node of a parsed tree.
     */
    parse( txt )
    {
        if ( !txt ) { return new RootNode(); }

        let itr = new string_iter( txt );

        // 'hijack' next() to track line & column
        let itr_next = itr.next;
        itr.next = () => { itr_next.call( itr ); this._update_line(itr); };

        let root_node = new RootNode();

        this.node_stack.clear();
        this.node_stack.push( root_node );

        this.errors = [];
        this.__line = 0;
        this.__column = 0;

        let text_itr = itr.clone();

        while ( !itr.end() )
        {
                // find the next node
            this.scan_node( itr );

                // save possible text range
            let text = new TextNode( text_itr, itr );

                // parse node will modify the given iterator
            let node = this.parse_node( itr ); // parse the node ( [tag] or anything, not the contents )

            if ( node )
            {
                let top = this.node_stack.back();
                top.add_child( text );

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
                    top.remove_child(text);
                }
                else { text_itr = itr.clone(); }
            }
        }

        // add any unclaimed text
        if ( text_itr.diff(itr) )
        {
            this.node_stack.back().add_child( new TextNode( text_itr, itr ) );
        }

        // 
        this.node_stack.clear();

        return root_node;
    }

    _update_line( itr )
    {
        ++this.__column;
        if ( itr.value === '\n' )
        {
            ++this.__line;
            this.__column = 0;
        }
    }

    _error_n( msg, node )
    {
        return this._error( msg, node.__line, node.__column, node.name );
    }
    _error( msg, line, column, name )
    {
        let er = new ParseError( line || 0, column || 0, `${msg} (${name})` );
        this.errors.push( er );
        return er;
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
        let tmp_stack = new stack();
        let found = null;

        let top = this.node_stack.back();

        // look for [node] in the node_stack. store popped nodes in another stack.
        while ( !found )
        {
            if ( this.node_stack.back() instanceof RootNode ) break; // root is never removed.

            let t = this.node_stack.pop();
            if ( this.compare( t, node ) ) 
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
            while ( tmp_stack.size() )
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
            this.node_stack.push_col( tmp_stack );   // return stack to normal
            this._error_n( 'Unmatched terminating node', node );
        }

        return !!found;
    }

    /**
     * Walk forward until a node type character is found
     */
    scan_node( itr )
    {
        scan_to( itr, this.config.types ); 
    }

    /**
     * Call a node parser (if available)
     */
    parse_node( itr )
    {
            // type determines how the rest is parsed.
        let type = this.config.types.get( itr.value );

            // parse method is required.
        if ( !type || !('parse' in type) ) { return null; }

        return  type.parse( itr, this );
    }

    /**
     * Check if a parsed node is a void node. (self-completing node)
     */
    is_void( node )
    {
        return node instanceof VoidNode || node.is_void;
    }

    /**
     * Compares two nodes.
     */
    compare( n1, n2 )
    {
        return typeof n1.compare === 'function' ? n1.compare(n2) : n1 === n2;
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

