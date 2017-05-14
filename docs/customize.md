# Customization

## Tags
The [`TagDefinition`](../src/def.js) class defines the properties of a tag type. The parser uses this to determine how to process a tag.

`BBTagDef` extends `TagDefinition` to make simple BBCode tags easier to define.
```js
import {BBTagDef} from 'bbcode/bbcode';

let tag1 = new BBTagDef( 'b' );  // [b][/b]
```
Or without the convenience class `BBTagDef`.
```js
import {BBTagFrmtr} from 'bbcode/bbcode';
import {TagDefinition} from 'bbcode/markup-def';

let tag = new TagDefinition( new BBTagFrmtr( 'b' ) ); // [b][/b]
```

### Children
The children parameter should be an array of tag identifiers. An empty array means no child tags are allowed (parsed) and `null` allows all (default).
```js
new BBTagDef( 'b', [] );    // none: [b][i]...[/i][/b] => format: [b]...[/b]
new BBTagDef( 'b', ['i'] ); // allow i:  [b][i][/i][/b] => format: [b][i][/i][/b]
```

### Attributes
The attributes parameter should be an array of definitions (`AttributeDefinition`). The default is all allowed (`null`) like children.
```js
import {AttributeDefinition} from 'bbcode/markup-def';
import {BBAttrFrmtr, BBTagDef} from 'bbcode/bbcode';

let attribute = new AttributeDefinition( new BBAttrFrmtr( 'url' ) ); // an attribute named 'url'

let tag = new BBTagDef( 'url', null, [attribute] );
```
In BBCode (formatting and parsing) any tag with an attribute with the same name can _self-attribute_: `[url url=""][/url]` or `[url=""][/url]`


### Formatters
Formatters transform the parsed result to a target format. The `BBTagDef` above automatically creates a simple BBCode formatter. 
```js
import {HtmlTagFrmtr} from 'bbcode/html';
import {BBTagFrmtr} from 'bbcode/bbcode';
import {TagDefinition} from 'bbcode/markup-def';

let tag = new TagDefinition( [new BBTagFrmtr( 'url' ), new HtmlTagFormatter( 'a' )] ); // change `[url]` to `<a>`
```

There are a number of existing formatters for transforming bbcode to html in [bb-html](../src/bb-html.js).

#### Attribute Formatters
* `StyleFrmtr` is used when a bbcode attribute maps to a CSS style value. The identifier (first parameter) is the CSS property.
```js
// color="red" -> style="background-color: red;"
new AttributeDefinition( [new BBAttrFrmtr( 'color' ), new StyleFrmtr( 'background-color' )] );
```
* `StyleNumFrmtr` is a specialized version of `StyleFrmtr` but to use with styles that are numbers with units. 
```js
// indent="#" -> style="text-indent: #px;"
new AttributeDefinition( [new BBAttrFrmtr( 'indent' ), new StyleNumFrmtr( 'text-indent', 'px' )] );
```
* `AttrTagFrmtr` creates a temporary tag from the attribute value to be added as the top child to the parent tag. Pass it a `TagDefinition` and the attribute value will be inserted into this temporary tag.
* `ClassFrmtr` takes the attribute value and adds it to the html `class` attribute.

#### Tag Formatters
* `CToATagFrmtr` checks for a required attribute and tries to fill it in with any text content when missing. This makes tags like `[url]link[/url]` and `[url=link]text[/url]` possible.
* `AttrJoinTagFrmtr` joins the given attribute value with the tag name to create a new tag in its place. This is used by the header tag: `[header=3]` maps to `<h3>`


#### Formatter Properties
Constant attributes that will be applied during the transform.
```js
import {CssClass, CssProp} from 'bbcode/bb-html';
import {HtmlTagFrmtr} from 'bbcode/html';
import {BBTagFrmtr} from 'bbcode/bbcode';

// <tag-id class="classes here"></tag-id>
new HtmlTagFrmtr( 'tag-id', { attributes: new CssClass( 'classes', 'here' ) } ); 

// <tag-id style="text-transform: capitalize;" class="some-class"></tag-id>
new HtmlTagFrmtr( 'tag-id', { attributes: [new CssProp( 'text-transform' ), new CssClass( 'some-class' ) } );

// [tag-id attr="value"]
new BBTagFrmtr( 'tag-id', { attributes: { identifier: 'attr', value: 'value' } } );
```
Styles and classes may be set directly like the last example sets `attr` to `value`; `CssProp` and `CssClass` help prevent overwriting existing values.

**Void tags** are tags that have no children and no closing tag (like `<img>`). Set the `is_void` property to true and the tag will be rendered as such.
```js
// [not-void][/not-void] -> <void>
new TagDefinition( [new BBTagFrmtr( 'not-void' ), new HtmlTagFrmtr( 'void', { is_void: true } )] );
```
If the tag was originally not void (like the bbcode tag above) it may contain children. By default those children will be formatted and appear as siblings. To prevent this set `void_children` to `false`.

## Validators

[Validators](../src/validator.js) are used during parse to validate identifiers and values. The `char` method is called for each character individually and if the parse action is successful the `string` method is used to do a complete validation of the value.
* `Validator` is the basic validator and always succeeds.
* `Invalidator` is the opposite of `Validator`
* `FallbackValidator` takes a primary and secondary validator. If the primary fails it attemps the secondary.
* `CompositeValidator` contains any number of validators and all must validate successfully or validation fails.
* `RegexValidator` takes and uses a regex in `string`. `char` always passes.
* `IdentifierValidator` allows numbers (0-9) letters (a-z, A-Z) and hyphen (-).
* `ColorValidator` validates colors: `#000`, `#000000`, `rgb( 255, 255, 255 )`, `rgba( 255, 255, 255, 1.0 )`, and names
* `CSSValidator` attempts to validate CSS style strings.
* `NumberValidator` checks that a value is a number and that it falls in the desired range.
* `ListValidator` only allows a given list of items and the characters in those items.
* `IdentifierListValidator` is a `FallbackValidator`. First it checks a list of known identifiers and then falls back to an `IdentifierValidator`.

`char` returns a boolean value.
`string` should return a validated string.

### Using with attributes
```js
let attr = new AttributeDefinition( new BBAttrFrmtr( 'attr' ), { validator: new  ListValidator( ['foo','bar'] ) } );
```
When the parser sees this attribute on a tag it will check the value against the list `['foo','bar']`.

### Example
```js
import {TagDefinition, AttributeDefinition} from 'bbcode/markup-def';
import {TagFormatter, AttributeFormatter} from 'bbcode/markup-formatter';
import {StyleNumFrmtr} from 'bbcode/bb-html';
import {bbcode_format} from 'bbcode/bbcode';
import {html_format} from 'bbcode/html';
import {NumberValidator} from 'bbcode/validator';

let size_attr = new AttributeDefinition( 
        [new AttributeFormatter( 'size', bbcode_format ), new StyleNumFrmtr( 'font-size', 'pt' )]
        { 
            required: true, // attribute is required
            default_value: 10,  // default value when required and missing. if this is not specified the tag will be considered malformed and parsing it will fail
            validator: new NumberValidator( 10, 24, true ) // only integers [10,24]. the last param (true) means integers only
        }
    );

let simple_tag = new TagDefinition(
        [new TagFormatter( 'font', bbcode_format ), new TagFormatter( 'span', html_format )],
        null,   // allow all. 
        [
            size_attr
        ]          // no attributes
    );

// [font size="12"]...[/font] --> <span style="font-size: 12pt;">...</span>

```

## Creating the main parser

```js
import {Parser} from 'bbcode/parser';
import {MarkupParser} from 'bbcode/tag-parser';

// defined tag above
let parser = new Parser( new MarkupParser( tag ) );    
```

The main `Parser` handles sub parsers and manages the node tree.

## Custom Parsing

The main parser can take any number of sub-parsers and they will be attempted in order while parsing the source string. 

The only requirement of a custom parser is that two methods are defined: `can_parse` and `parse`.
```js
class CustomParser
{
    can_parse( iter )
    {
        // return true || false
    }

    parse( iter )
    {
        // return node or null
    }
}
```

These methods are passed a [string_iter](../src/string-iter.js) as the first argument. `string_iter` is a simple iterator class that contains and steps over the source string.
```js
import {string_iter} from 'bbcode/string-iter';

let i = new string_iter( 'aビシd' );
i.value; // 'a'
i.next();
i.next()
i.value; // シ

i.done; // will be true of at the end of the source string
```
The main parser will call `can_parse` and then `parse` if `true` is returned.

If the parser finds that it isn't parsing a valid node it should return a `null` or throw a [`ParserError`](../src/error.js) with a reason.

### Example: Emoji parser
```js
/* emoji-parser.js */
import {substring_quoted} from 'bbcode/string-util';
import {whitespace_validator} from 'bbcode/validator';

export class EmojiParser
{
    can_parse( iter )
    {
        return (iter.value === ':'); // quick initial test; this will be called often so best to keep it short and quick!
    }

    parse( iter )
    {
        // read between `:` or fail on whitespace
        let name = substring_quoted( itr, whitespace_validator );

        if ( !name ) { return null; } // no valid name.

        // Emoji is some class that when asked to format html returns an img tag or the original :emoji: text for bbcode
        return new Emoji( name );
    }
}
```

Here a `null` is returned when the parse fails. This means the failure will be ignored by the parent parser and any parsing done will be ignored. In more complex parsers it may be desirable to report an error when a node parse fails. In such cases `throw` a [`NodeParseError`](../src/error.js) and it will be stored in an error list.

### Using Custom Parsers
```js
import {EmojiParser} from 'emoji-parser';
import {bbcode_parser, Parser} from 'bbcode/config-bb';

let parser = new Parser( [bbcode_parser, new EmojiParser()] );
```

Sub-parsers will be attempted in the order given.


### Using
Read the [using](using.md) guide on using your new config/parser setup.


