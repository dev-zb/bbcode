import {VoidNode} from './nodes';


export class PingNode extends VoidNode
{
    static formats = new Map();

    static add_format( fmt )
    {
        PingNode.formats.set( fmt.name, fmt );
    }

    name;
    constructor( name )
    {
        super(); 
        this.name = name; 
    }

    format( format )
    {
        if ( PingNode.formats.has(format) )
        {
            return PingNode.formats.get(format).format( this.name );
        }

        return `@${this.name}`;
    }
}


export class PingParser
{
    constructor()
    {
    }

    can_parse( itr ) { return itr.value === '@'; }

    parse( itr, parser )
    {
        itr.next(); // skip '@'

        let name = parser.identifier_parse( itr );
        if ( !name || !name.length ) return null;

        return new PingNode( name );
    }
}