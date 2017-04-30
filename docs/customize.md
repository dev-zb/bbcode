# Customization
## Tags
Use the [`TagDefinition`](../src/def.js) class to define the properties of a tag type. The parser uses this to determine how to process a tag, its attributes, and any children; it's also used during formatting.
```js
import {TagDefinition} from 'bbcode/def';

let tag = new TagDefinition( 'b' );
```
By default all tags are allowed as children, all attributes are valid, and it may only be formatted to BBCode.

### Specifying Children
The second parameter takes an array of valid child tags. An empty array means no child tags are allowed (parsed) and `null` allows all (default).
```js
new TagDefinition( 'b', []);    // none: [b][i]...[/i][/b] => format: [b]...[/b]
new TagDefinition( 'b', ['i']); // allow i:  [b][i][/i][/b] => format: [b][i][/i][/b]
```

### Attributes
The third paremeter defines valid attributes as an array of `AttributeDefinitions`. `AttributeDefinitions` by default only format back to their origin format.
```js
import {AttributeDefinition} from 'bbcode/def';

let attribute = new AttributeDefinition( 'url' ); // an attribute named 'url'

let tag = new TagDefinition( 'url', null, [attribute] );
```
In BBCode (formatting and parsing) any tag with an attribute with the same name can _self-attribute_: `[url url=""][/url]` or `[url=""][/url]`

### Formatting
`TagDefinition` and `AttributeDefinition` both take _formatters_ that handle the processing of the tag when changing from one format to another (bbcode<->html).

The basic html formatters (`HtmlTagFormatter` & `HtmlAttrFormatter`) take a `name` to use when converting to html.
```js
import {HtmlTagFormatter, HtmlAttrFormatter} from 'bbcode/html';
// ... other imports

let attribute = new AttributeDefinition( 'url', new HtmlAttrFormatter('href') );    // change `url` (attribute) to `href` when formatting to HTML
let tag = new TagDefinition( 'url', null, attribute, new HtmlTagFormatter('a') );   // change `[url]` to `<a>`
```

## Creating the main parser

```js
import {Parser} from 'bbcode/parser';
import {TagParser} from 'bbcode/tag-parser';

// defined tag above
let parser = new Parser(new TagParser(tag));    
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

    parse( iter, parser )
    {
    }
}
```

These methods are passed a [string_iter](../src/string_iter.js) as the first argument. `string_iter` is a simple iterator class that contains and steps over the source string.
```js
import {string_iter} from 'string_iter';

let i = new string_iter( 'aビシd' );
i.value; // 'a'
i.next();
i.next()
i.value; // シ

i.done; // will be true of at the end of the source string
```
The main parser will call the `can_parse` method for each character and will call `parse` with the same iterator if `true` is returned.

If the parser finds that it isn't parsing a valid node it should return a `null` or throw a [`ParserError`](../src/error.js) with a reason.

### Example: Emoji parser
An emoji is defined as some non-whitespace text between colons (`:`).

```js
/* emoji-parser.js */
import {substring_quoted} from 'string-iter';

export class EmojiParser
{
    can_parse( iter )
    {
        return (iter.value === ':'); // quick initial test; this will be called often so best to keep it short and quick!
    }

    parse( iter, parser )
    {
        // attempt to scan to another `:`
        let name = substring_quoted( itr, parser.whitespace );

        if ( !name ) { return null; } // no valid name.

        // imagine EmojiNode is some class that when asked to format html returns an img tag or the original :emoji: text for bbcode
        return new EmojiNode( name );
    }
}
```

Here a `null` is returned when the parse fails. This means the failure will be ignored by the parent parser and any parsing done will be ignored. In more complex parsers it may be desirable to report an error when a node parse fails. In such cases `throw` a [`NodeParseError`](../src/error.js) and it will be stored in a error list.

### Using Custom Parsers
```js
import {EmojiParser} from 'emoji-parser';
import {bbcode_parser} from 'config-bb';

let parser = new Parser([bbcode_parser, new EmojiParser()]);
```

Note that sub-parsers will be attempted in order.


### Using
Read the [using](using.md) guide on using your new config/parser setup.


#### Html Formatters
[*html.js*](../src/html.js)
* `UrlAttrFormatter` - Provides a basic sanitizer when converted to html.
* `StyleAttrFormatter` - Maps the attribute to a CSS property.
  * `ColorStyleAttrFormatter` - Like the style formatter used when mapped to a color property. Like the URL formatter the color will be put through a sanitizer for `names`, `#xxx`, `#xxxxxx` and `rgb(#,#,#)` style colors.
  * `NumberStyleAttrFormatter` - Formatter for styles that require numbers and units like `font-size`.

