import {Node} from './nodes';


export class PingNode extends Node
{
    static formatters = new Map();

    static add_formatter( fmtr )
    {
        PingNode.formatters.set( fmtr.name, fmtr );
    }

    target;
    constructor( target )
    {
        super(); 
        this.target = target; 
    }

    format( format )
    {
        if ( PingNode.formats.has(format) )
        {
            return PingNode.formats.get(format).format( this.target );
        }

        return `@${this.target}`;
    }
}

export class PingParser
{
    can_parse( itr ) { return itr.value === '@'; }

    parse( itr, parser )
    {
        itr.next(); // skip '@'

        let target = parser.identifier_parse( itr );
        if ( !target || !target.length ) return null;

        return new PingNode( target );
    }
}