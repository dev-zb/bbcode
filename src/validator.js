/**
 * Validator
 */
export class Validator
{
    // called as characters are read
    char( c, first = false ) { return true; }

    // called when value is known
    string( str, default_value ) { return str; }
}

export class Invalidator extends Validator
{
    char() { return false; }
    string( str, default_value ) { return default_value; }
}

/**
 * use secondary invalidator when first fails
 */
export class FallbackValidator extends Validator
{
    _fallback;
    _primary;
    constructor( primary = new Validator(), fallback = new Invalidator() )
    {
        super();
        this._fallback = fallback;
        this._primary = primary;
    }

    char( c, first = false )
    {
        return this._primary.char( c, first ) || this._fallback.char( c, first );
    }

    string( str, default_value = null )
    {
        let v = this._primary.string( str, default_value );
        if ( v === default_value ) { return this._fallback.string( str, default_value ); }

        return v;
    }
}

/**
 * all validators must pass
 */
export class CompositeValidator extends Validator
{
    _validators;
    constructor( ...validators )
    {
        super();
        this._validators = validators;
    }

    char( c, first = false )
    {
        let result = true;
        for( let v of this._validators ) { result = result && v.char( c, first ); }
        return result;
    }

    string( str, default_value = null )
    {
        let result = str;
        for( let v of this._validators )
        {
            result = v.string( result, default_value );
        }

        return result;
    }
}

export class RegexValidator extends Validator
{
    constructor( ...regex ) { super(); this.regex = regex; }
    string( str, default_value = null )
    {
        let result;
        for( let regex of this.regex )
        {
            if ( (result = regex.exec( str )) )
            {
                return result[0]; 
            }
        }
        return default_value;
    }
}

export class IdentifierValidator extends RegexValidator
{
    constructor() { super(/^(?:[A-Za-z0-9]+)(?:-?)(?:[A-Za-z0-9]+)$/); }
    char( c, first = false )
    {
        return c && (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || (!first && c === '-');
    }
}

export let ident_validator = new IdentifierValidator();

export class URLValidator extends RegexValidator
{
    constructor()
    {
        super( /^((?!javascript:)[^ '"]+)$/ );
    }
}

export class ColorValidator extends RegexValidator
{
    static regex = [
        /(#(?:[0-9a-fA-F]{3}){1,2})/,                                                // hex
        /(rgba\((?:\s*(?:[1]?[0-9]{1,2}|2(?:[0-5]{1,2}|[0-4][0-9]))\s*,){3}\s*(?:1|0?\.[0-9]+\s*){1}\)){1}/, // rgba(255,255,255,1.0)
        /(rgb\((?:\s*(?:[1]?[0-9]{1,2}|2(?:[0-5]{1,2}|[0-4][0-9]))\s*,?){3}\)){1}/, // rgb(255,255,255)
        /((?:[0-9a-fA-F]{3}){1,2})/
    ];
    static colors = new Set(['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'grey', 'green', 'greenyellow', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen']);

    colors;
    constructor( colors = ColorValidator.colors )
    {
        super(...ColorValidator.regex);
        this.colors = new Set(colors);
    }

    string( color, default_value = 'inherit' )
    {
        if ( this.colors.has( color.toLowerCase() ) ) { return color; }

        return super.string( color, default_value );
    }
}

export class CSSValidator extends RegexValidator
{
    constructor() { super(/(?:\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:^"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);)+/g); }
}

export class NumberValidator extends Validator
{
    min;
    max;
    int_only;   // limit to ints

    constructor( min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, int_only = false )
    {
        super();
        this.int_only = int_only;

        this.min = min;
        this.max = max;
    }

    char( c, first = false )
    {
        return (c >= '0' && c <= '9') || (!this.int_only && c === '.');
    }

    string( number, default_value = this.min )
    {
        let n = +number;

        if ( Number.isNaN( n ) || (this.int_only && (n !== Math.trunc( n ))) || (n < this.min) || (n > this.max) )
        {
            return default_value;
        }

        return n;
    }
}

export class ListValidator extends Validator
{
    options = [];
    _first = new Set();
    _chars = new Set();

    constructor( options = [], allowed = true )
    {
        super();
        for( let option of options ) { this.add_option( option ); }

        this.allowed = allowed;
    }

    add_option( option )
    {
        if ( !option) { return; }
        
        this.options.push( option );
        this._first.add( option[0] );
        for( let c of option ) { this._chars.add( c ); }
    }

    char( c, first = false )
    {
        return (first && this._first.has( c ) === this.allowed) || this._chars.has( c ) === this.allowed;
    }
    
    string( option, default_value = null )
    {
        if ( this.options.includes( option ) === this.allowed )
        {
            return option;
        }

        return default_value;
    }
}

export class IdentifierListValidator extends FallbackValidator
{
    constructor( ids = [] )
    {
        super( new ListValidator( ids, true ), ident_validator );
    }

    add_identifier( id )
    {
        this._primary.add_option( id );
    }
}