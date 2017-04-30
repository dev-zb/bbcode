import {Node} from './nodes';
/**
 * 
 */
export class ParseError
{
    line = 0;           // parse line [split on newline]
    column = 0;         // parse column
    error = '';         // error message
    consume = false;    // if the read text should be consumed or reset

    constructor( error, line, column, consume = false )
    {
        this.line = line || 0;
        this.column = column || 0;
        this.error = error || '';
        this.consume = !!consume;
    }

    toString()
    {
        return `[${this.line}:${this.column}] ${this.error}`;
    }
}

export class NodeParseError extends ParseError
{
    constructor( error, node, line, column, consume )
    {
        super( error, 
               (typeof line === 'number' ? line : node._line) || 0, 
               (typeof column === 'number' ? column : node._column) || 0,
               consume
             );
        
        this.node_name = node.name || '';
    }

    toString()
    {
        return super.toString() + ` (${this.node_name})`;
    }
}

export class NullError {}   // error to be ignored.