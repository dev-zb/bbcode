import {Node} from './nodes';
import {BaseDefinition, NodeDefinition} from './node-def';
import {is_string, get_iterable, ensure_array} from './util';
import {Validator, IdentifierListValidator, IdentifierValidator} from './validator';
import {AttributeFormatter} from './markup-formatter';

/**
 * ATTRIBUTE DEFINITIONS
 */
export class AttributeDefinition extends BaseDefinition
{
    static require_value_default = true;

    static defaults = 
        {
            required: false,   // lets parser know that this attribute is required. the parser will attempt to create it when missing.
            require_value: AttributeDefinition.require_value_default,  // value is required
            default_value: null,                                       // default value when validation fails
        };

    constructor( formatters, props = {} )
    {
        super( formatters, AttributeDefinition.defaults, { format_fail_value: null }, props );
    }

    get identifier()
    {
        return this.origin.identifier;
    }

    is_value_valid( value )
    {
        return !this.require_value || (value !== null && this.validator.string( value, this.default_value ) !== null);
    }

    validate_value( value )//, format )
    {
        return this.validator.string( value, this.default_value );
    }
}

export class TagDefinition extends NodeDefinition
{
    attributes = null;
    add_missing = true; // add missing attributes during format. false: empty string

    _allow_all_children = true;
    _allow_all_attributes = true;   // all attributes will be parsed.

    /**
     * constructor
     * @param {*} formatters array of formatters
     * @param {*} children identifiers for allowed/valid child tags; null to allow all
     * @param {*} attributes array of attributes; null to allow all
     * @param {*} props extra properties
     */
    constructor( formatters, children = null, attributes = null, props = {} )
    {
        super( formatters, Object.assign( { children, validator: new IdentifierListValidator() }, props ) );

        this.attributes = new Map();
        if ( attributes )
        {
            this._allow_all_attributes = false;

            for( let attribute_def of get_iterable( attributes ) )
            {
                this.add_attribute( attribute_def );
            }
        }

        if ( props.parents ) { this.parents = new Set( ensure_array( props.parents ) ); }
        if ( props.create_attrib ) { this.create_attrib = props.create_attrib; }
    }

    /**
     * Add Attribute to valid list
     * @param {*} def AttributeDefinition
     * @param {*} replace true to overwrite any attribute with the same identifier
     */
    add_attribute( def, replace = false )
    {
        if ( replace || !this.attributes.has( def.identifier ) )
        {
            this.attributes.set( def.identifier, def );
            this.validator.add_identifier( def.identifier );
        }
    }

    /**
     * Determine if attribute is valid
     * @param {*} attr identifier or definition
     * @return true if valid attribute
     */
    valid_attribute( attr )
    {
        if ( this._allow_all_attributes ) { return true; }

        let identifier = '';
        if ( is_string( attr ) ) { identifier = attr; }
        else if ( attr instanceof AttributeDefinition || attr.identifier ) { identifier = attr.identifier; }
        else if ( attr.def ) { identifier = attr.def.identifier; }

        return this.attributes.has( identifier );
    }

    /**
     * Get attribute definition. Create definition if allow all is enabled.
     * @param {*} identifier name/identifier of attribute
     */
    get_attribute( identifier )
    {
            // null/undefined attributes means all are allowed.
        if ( this._allow_all_attributes && !this.attributes.has( identifier ) )
        {
                // create definitions as needed.
            let def = this._create_attribute( identifier );
            this.add_attribute( def );
            return def;
        }

        return this.attributes.get( identifier );
    }

    _create_attribute( identifier )
    {
        let fmtrs = [];
        for( let [n, f] of this.formatters )
        {
            fmtrs.push( new AttributeFormatter( identifier, f.format_props ) );
        }

        return new AttributeDefinition( fmtrs );
    }
}
