import {is_string} from './util';
import {Validator} from './validator';

export class BaseFormatter
{
    identifier = '';
    format_props = null;

    constructor( identifier, format_props, ...props )
    {
        Object.assign( this, ...props );

        this.identifier = identifier;
        this.format_props = format_props;
    }

    format() { return this.identifier; }
}

export class NullFormatter extends BaseFormatter
{
    constructor( format_props )
    {
        super( '', format_props );
    }
}

/**
 * 
 */
export class NodeFormatter extends BaseFormatter
{
    static defaults = 
        {
            is_void: false,        // 
            void_children: true   // format any children when void (will appear as siblings)
        };

    constructor( identifier, format_props, props )
    {
        super( identifier, format_props, NodeFormatter.defaults, props );

    }

    /**
     * @param {*} children an array of children to format
     */
    format_children( children )
    {
        if ( !children || !children.length || (this.is_void && !this.void_children) ) { return ''; }

        let str = [];
        for( let child of children )
        {
            if ( child.format )
            {
                str.push( child.format( this.format_props.name ) );
            }
            else if ( is_string( child ) )
            {
                str.push( this.format_props.sanitize( child ) );
            }
        }
        return str.join( '' );
    }

    format( node )
    {
        return `${this.identifier} ${this.format_children( node.children )}`;
    }
}