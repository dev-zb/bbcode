import {Node} from './nodes';

/**
 * 
 */
export class ParseError
{
    constructor( error, line, column )
    {
        this.line = line || 0;
        this.column = column || 0;
        this.error = error || '';
    }

    toString()
    {
        return `[${this.line}:${this.column}] ${this.error}`;
    }
}

export class NodeParseError extends ParseError
{
    constructor( error, node, line, column )
    {
        super( error, 
               (typeof line === 'number' ? line : node.__line) || 0, 
               (typeof column === 'number' ? column : node.__column) || 0 
             );
        
        this.node = node instanceof Node ? node : { name: node || '' };
    }

    toString()
    {
        return super.toString() + ` (${this.node.name})`;
    }
}

export class NullError {}   // error to be ignored.