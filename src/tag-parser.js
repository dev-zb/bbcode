import {get_iterable} from './util';
import {TagNode, TagAttribute} from './markup-node';
import {IdentifierListValidator, ListValidator, CompositeValidator, ident_validator} from './validator';
import {NodeParseError, NullError} from './error';
import {substring, substring_quoted, substring_identifier, substring_validator, whitespace_validator, skip_whitespace} from './string-util';
import {TagDefinition, AttributeDefinition} from './markup-def';
import {TagFormatter} from './markup-formatter';
import {TerminateNode} from './nodes';

export class MarkupParser
{
    format_props = null;

    _tag_defs = new Map();        // tag definitions

    fail = {    // on fail [true] parsing of the tag will be stopped
        illegal_attribute: false,   // fail when illegal attribute is met.   (false: attribute will not be added)
        bad_attribute: false,       // fail when attribute is missing value  (false: attribute will not be added)
        bad_required: true,         // fail when a required attribute is bad
    };

    _validator = new IdentifierListValidator();   // for validating tag identifiers
    _parse_any = true;              // if an undefined tag is encountered a basic definition will be created and it will be parsed.

    _reserved_validator = null;     // validator for reserved characters

    _attrib_def_stub = { default_value: null, validator: ident_validator };

    /**
     * @param tags tag definitions
     * @param delims parse delimiters
     * @param config extra properties.
     */
    constructor( tags, format_props, config = {} )
    {
        Object.assign( this.fail, config.fail || {} );

        this.format_props = format_props;

        this.create_tag = config.tag || MarkupParser._default_create_tag;
        this.create_attribute = config.attribute || MarkupParser._default_create_attribute;
        this.create_def = config.def || MarkupParser._default_create_def;
        this.create_formatter = config.formatter || MarkupParser._default_create_formatter;
        

        if ( tags )
        {
            for( let t of get_iterable( tags ) )
            {
                this.add_tag( t );
            }
        }

        this.parse_any = !!config.parse_any;

        this._reserved_validator = new ListValidator( [
            this.format_props.l_bracket,
            this.format_props.r_bracket,
            this.format_props.term
        ], false );
    }

    static _default_create_def( identifier )
    {
        let def = new TagDefinition( this.create_formatter( identifier ) );
        return def;
    }

    static _default_create_tag( def, closing, line, column )
    {
        if ( closing )
        {
            return new TerminateNode( def );
        }

        let t = new TagNode( def );
        t._line = line;
        t._column = column;
        return t;
    }

    static _default_create_attribute( value, def, parent, line, column )
    {
        let a = new TagAttribute( value || def.default_value, def, parent );
        a._line = line;
        a._column = column;
        return a;
    }

    static _default_create_formatter( identifier )
    {
        return new TagFormatter( identifier, this.format_props );
    }

    add_tag( def, replace = false )
    {
        if ( replace || !this._tag_defs.has( def.identifier ) )
        {
            if ( def.origin.format_props !== this.format_props )
            {
                throw new Error( `MarkupParser::add_tag - mismatched primary format properties (${def.origin.format_props.name} !== ${this.format_props.name})` );
            }

            this._tag_defs.set( def.identifier, def );
            this._validator.add_identifier( def.identifier );
        }
    }

    remove_tag( identifier )
    {
        let def = this._tag_defs.get( identifier );
        this._tag_defs.delete( identifier );
        return def;
    }

    _attribute_parse( itr, tag )
    {
        let identifier = substring_identifier( itr, this._validator );  // read attribute identifier
        if ( !identifier )
        {
             throw new NodeParseError( `Invalid attribute identifier (${identifier}) in tag`, tag );
        }

        let def   = tag.def.get_attribute( identifier ) || this._attrib_def_stub; // [_attrib_def_stub] - when the attribute is not defined so any following value is parsed
        let value = def.default_value;
        let quote = '';

        // parse value
        if ( itr.value === this.format_props.eq )
        {
            itr.next();
            skip_whitespace( itr );

            if ( this.format_props.quotes.includes( itr.value ) ) // when wrapped in quotes. full validation happens later
            {
                quote = itr.value;
                value = substring_quoted( itr );
            }
            else // quick validate each character
            {
                let v = new CompositeValidator( this._reserved_validator, def.validator );
                value = substring_validator( itr, v );
            }
        }

        // attribute wasn't legal
        if ( def === this._attrib_def_stub )
        {
                // entire tag fails?
            if ( this.fail.illegal_attribute ) { throw new NodeParseError( `Attribute "${identifier}" is not allowed in tag`, tag ); }

            return null; // continue with the tag
        }

        let attrib = this.create_attribute( def.validate_value( value ), def, tag, itr.line, itr.column );
        attrib.quote = quote;

        if ( !attrib.is_valid() ) // attribute value didn't pass validation
        {
            if ( this.fail.bad_attribute ) { throw new NodeParseError( `Attribute missing required value`, attrib ); }
            return null;
        }

        return attrib;
    }

    _get_def( identifier, itr )
    {
        if ( !identifier ) { throw new NullError(); }

        let def = this._tag_defs.get( identifier );
        if ( !def )
        {
            if ( this.parse_any )
            {
                if ( whitespace_validator.char( itr.value ) || itr.value == this.format_props.r_bracket || (this.self_attribute && itr.value === '=') )
                {
                    return this.create_def( identifier );
                }
            }

            throw new NodeParseError( `Invalid tag identifier`, identifier, itr.line, itr.column );
        }

        return def;
    }

    _parse_attributes( tag, itr )
    {
        while ( !itr.end() )
        {
            skip_whitespace( itr );

            if ( itr.value === this.format_props.r_bracket )
            {
                break;
            }

            tag.add_attribute( this._attribute_parse( itr, tag ) );
        }

        let fail = tag.require_attributes();    // look for missing attributes
        if ( fail && this.fail.bad_required )
        {
            throw new NodeParseError( `Missing required attribute (${fail}) or value`, tag );
        }
    }

    can_parse( itr )
    {
        return itr.value === this.format_props.l_bracket;
    }
 
    parse( itr )
    {
        itr.next(); // skip l-bracket

        let closing = (itr.value === this.format_props.term);   // closing tag
        if ( closing )
        {
            itr.next();
        }

        let it = itr.clone();
        let identifier = substring_identifier( itr, this._validator );
        let def = this._get_def( identifier, itr );
        let tag = this.create_tag( def, closing, itr.line, itr.column );

        if ( !closing )
        {
            // allow tags to be their own attribute
            if ( itr.value === this.format_props.eq && this.format_props.self_attribute )
            {
                itr.set( it ); // set back to parse tag identifier as attribute
            }
            this._parse_attributes( tag, itr );
        }

        skip_whitespace( itr );
        if ( itr.value !== this.format_props.r_bracket )
        {
            throw new NodeParseError( `Malformed Closing Tag: missing ${this.format_props.r_bracket}`, tag );
        }

        itr.next(); // skip r_bracket
        return tag;
    }
}