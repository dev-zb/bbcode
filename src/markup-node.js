import {ContainerNode} from './nodes';
import {TagDefinition, TagFormatter} from './markup-def';
import {IdentifierListValidator} from './validator';

/**
 * Attribute
 */
export class TagAttribute
{
    value = '';
    parent = null;
    def = null;

    quote = ''; // if the value was in quotes it will be saved here.

    constructor( value, def, parent, quote = '' )
    {
        if ( !def ) { throw new Error( "TagAttribute requires a definition" ); }

        this.def = def;
        this.parent = parent;
        this.value = value;
        this.quote = quote;
    }

    is_valid()
    {
        return this.def.is_value_valid( this.value );
    }

    get identifier() { return this.def.identifier; }

    format( format )
    {
        return this.def.format( format, this.value, this.quote, this.def.default_value, this );
    }

    clone()
    {
        return new TagAttribute( this.value, this.def, this.parent, this.quote );
    }
}

/**
 * Tag
 */
export class TagNode extends ContainerNode
{
    attributes = new Map();

    constructor( def, props )
    {
        super( def, props );

        if ( !def ) { throw new Error('TagNode requires a definition'); }
    }

    add_attribute( attr )
    {
        if ( attr && this.def.valid_attribute( attr ) )
        {
            this.attributes.set( attr.identifier, attr );
            return true;
        }
        return false;
    }

    get identifier()
    {
        return this.def.identifier;
    }

    _clone_attributes( target )
    {
        for( let [i, a] of this.attributes )
        {
            target.set( i, a.clone() );
        }
    }

    clone( deep = false )
    {
        let cln = new TagNode( this.def, this );
        
        if ( deep )
        {
            cln.attributes = new Map();
            this._clone_attributes( cln.attributes );
            cln.children = this._clone_children( deep );
        }

        return cln;
    }

    format( format )
    {
        return this.def.format( format, this.attributes, this.children, this );
    }

    /**
     * Determine if `node` causes this tag to terminate/close
     * @param {*} node 
     */
    terminate( node )
    {
        if ( this.def.terminator  )
        {
            if ( typeof node === 'string' )
            {
                return this.def.terminator.has( node );
            }
            else if ( node.identifier )
            {
                return this.def.terminator.has( node.identifier );
            }
        }

        return false;
    }

    /**
     * Determine if tag is valid (all required attributes are present)
     */
    is_valid()
    {
        let valid = true;
        if( this.def.attributes )
        {
            for( let [identifier, a] of this.def.attributes )
            {
                valid = valid && (a.required && !this.attributes.has( identifier ));
            }
        }

        return valid;
    }

    /**
     * Attempt to default create any missing required attributes
     */
    require_attributes()
    {
        if( this.def.attributes )
        {
            for( let [identifier, a] of this.def.attributes )
            {
                if ( a.required && !this.attributes.has( identifier ) )
                {
                    let ta = new TagAttribute( a.default_value, a, this );

                    if ( !ta.is_valid() )
                    {
                        // required attribute could not be met.
                        return identifier;  // calling function may need the id of the attribute
                    }

                    this.add_attribute( ta );
                }
            }
        }

        return null; // good good
    }
}
