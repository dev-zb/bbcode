import {NodeParser} from './nodes';


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


export class PingParser extends NodeParser
{
    constructor()
    {
        super('@');
    }

    parse( itr, parser )
    {
        if ( itr.value !== '@' ) return null;
        itr.next();

        let name = parser.identifier_parse( itr );
        if ( !name || !name.length ) return null;

        return new PingNode( name );
    }
}