import {Node} from './nodes';
import {substring_identifier} from './string-util';
import {ident_validator} from './validator';

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
    _validator = ident_validator;

    can_parse( itr ) { return itr.value === '@'; }

    parse( itr, parser )
    {
        itr.next(); // skip '@'

        let target = substring_identifier( itr, this._validator );
        if ( !target || !target.length ) return null;

        return new PingNode( target );
    }
}