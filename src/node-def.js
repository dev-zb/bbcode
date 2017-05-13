import {BaseFormatter} from './formatter';
import {is_string, ensure_array} from './util';
import {IdentifierListValidator} from './validator';
import {TextNode, Node, ContainerNode, ValidResult} from './nodes';
import {Validator} from './validator';

export class BaseDefinition
{
    formatters = null;          // 
    origin = null;              // origin formatter

    format_fail_value = '';     // default value return when formatting fails

    validator = new Validator();

    /**
     * @param {*} formatters single formatter or array of formatters. first formatter is considered the origin (type when parsed)
     * @param {*} props 
     */
    constructor( formatters, ...props )
    {
        Object.assign( this, ...props );

        let fs = formatters ? ensure_array( formatters ) : null;

        if ( !fs || !fs.length || !fs[0] )
        {
            throw new Error( 'BaseDefinition - formatter required' );
        }

        this.formatters = new Map();
        this.origin = fs[0];
        for( let f of fs )
        {
            this.add_formatter( f );
        }
    }

    /**
     * Add a 'Formatter' that will transform the node into some text output
     * @param {BaseFormatter} fmt formatter
     * @param {*} replace replace if another formatter of the same type exists
     */
    add_formatter( fmtr, replace = false )
    {
        if ( replace || !this.formatters.has( fmtr.format_props.name ) )
        {
            this.formatters.set( fmtr.format_props.name, fmtr );
        }
    }

    /**
     * Override this
     * @param {*} formatter 
     */
    _format( formatter, ...parms )
    {
        return formatter.format( ...parms );
    }

    /**
     * Transform params to target format
     * @param {*} format name of the target format
     * @param {*} parms 
     */
    format( format, ...parms )
    {
        let fmtr = this.formatters.get( format );
        if ( fmtr )
        {
            return this._format( fmtr, ...parms );
        }

        return this.format_fail_value;
    }
}

/**
 * Basic Node Definition
 */
export class NodeDefinition extends BaseDefinition
{
    static defaults = 
        {
            overflow: true,            // node will start again after parent terminates
            discard_invalid: false,    // discard text when parsing fails

            parents: null,             // limit parents by identifier
            parents_allowed: true,     // true: whitelist mode

            children: null,            // limit children by identifier
            type_child: [TextNode],    // limit children by type

            terminator: new Set(),     // identifiers that will cause termination*/
        };

    constructor( formatters, props = {} )
    {
        super( formatters, NodeDefinition.defaults, props );

        if ( props && !(props instanceof NodeDefinition) )
        {
            if ( props.children )
            {
                this.children = new Set( props.children );
            }

            if ( props.parents )
            {
                this.parents = new Set( props.parents );
            }

            if ( props.terminator )
            {
                this.terminator = new Set( props.terminator );
            }

            // Set node_type for use during parse (parser can ask def to generate a node of the proper type)
            if ( !this.node_type )
            {
                this.node_type = this.is_void ? Node : ContainerNode;
            }

            if ( props.is_void !== undefined )
            {
                // make formatters void type
                for( let [, f] of this.formatters )
                {
                    f.is_void = !!props.is_void;
                }
            }
        }
    }

    get identifier()
    {
        return this.origin.identifier;
    }

    get is_void()
    {
        return this.origin.is_void;
    }
    set is_void( v ) {}

    create_node( ...props )
    {
        return new (this.node_type)( this, ...props );
    }

    valid_parent( p )
    {
        if ( !this.parents ) { return this.parents_allowed; }

        let identifier;
        if ( is_string( p ) ) { identifier = p; }
        else if ( p instanceof NodeDefinition ) { identifier = p.identifier; }
        else if ( p.def ) { identifier = p.def.identifier; }

        return this.parents.has( identifier ) === this.parents_allowed;
    }

    valid_child( node )
    {
        if ( this.is_void ) { return ValidResult.invalid; }

        if ( this.terminator && this.terminator.has( node.identifier ) ) { return ValidResult.terminate; }

        if ( node.def === this ) { return ValidResult.same; }

        let def = node.def || node;
        if ( def instanceof NodeDefinition )
        {
            return (!this.children || this.children.has( def.identifier )) && def.valid_parent( this ) ? ValidResult.valid : ValidResult.invalid;
        }

        for( let t of this.type_child )
        {
            if ( node.constructor === t || node instanceof t ) { return ValidResult.valid; }
        }
        
        return ValidResult.invalid;
    }
}