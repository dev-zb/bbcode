# Customize
*Start by defining some tags and attributes.*

## Tags
The `TagDefinition` class is used to provide a tag's name, children, and attributes to the tag parser. It also holds the formatters for the tag. 

*Creating a simple tag*

```js
import {TagDefinition} from 'bbcode/def';

let tag = new TagDefinition( 'b' );
```
This defines a `b` tag (`[b]` in bbcode). 
The rest of the parameters are left to the defaults so all tags are allowed as children and all attributes are valid. Additionally this tag can only be formatted back to bbcode. 

The next two parameters define the valid children and attributes. An empty array (`[]`) means no children or attributes are valid and `null` (default) means all are valid.
The children are listed by name only while the for attributes a list of attribute definitions (`AttributeDefinition`) is required.

*Limiting the allowed child tags*

```js
let tag = new TagDefinition( 'b', ['i']); // only [i] is "allowed" (parsed) when inside [b]
```
The result is that any tag other than `[i]` will not be parsed when inside `[b]`.

## Attributes
An instance of the `AttributeDefinition` class defines an attributes. The first parameter sets the name of the attribute when parsed.

```js
import {AttributeDefinition} from 'bbcode/def';

let attribute = new AttributeDefinition( 'url' ); // an attribute named 'url'
```
Like the `TagDefinition` this defines an attribute named `url` that can only be formatted back to `bbcode`. This attribute can be used when defining any tag though it currently has no real meaning.

```js
let attribute = new AttributeDefinition( 'url' );
let tag = new TagDefinition( 'url', null, attribute );
```
Notice this defines a tag with an attribute of the same name. This allows the tag to be its *own* attribute during parsing.

*Use:* `[url url=""][/url]` or `[url=""][/url]`


## Formatting
`TagDefinition` and `AttributeDefinition` automatically add bbcode formatters when constructed but for this to be of any real use we need to get `html` out. The next parameter in these classes takes a formatter (or array of formatters) to do this.

The basic html formatters (`HtmlTagFormatter` & `HtmlAttrFormatter`) take just a `name` to use when converting to html.

```js
import {HtmlTagFormatter, HtmlAttrFormatter} from 'bbcode/html';
// ... other imports

let attribute = new AttributeDefinition( 'url', new HtmlAttrFormatter('href') );
let tag = new TagDefinition( 'url', null, attribute, new HtmlTagFormatter('a') );
```

The `url` attribute will be changed to `href` in html and the `url` tag will become `a`.


## Create a parser

```js
import {Parser} from 'bbcode/parser';
import {TagParser} from 'bbcode/tag-parser';

// defined tag above

let parser = new Parser(new TagParser(tag));    
```

The main `Parser` does the parsing until it finds a tag and then hands the parsing off to the `TagParser`.

### Using
Read the [using](using.md) guide on using your new config/parser setup.


### Advanced
There are other formatters and definitions available to allow somewhat more advanced tags and formatting.

#### Html Formatters
[*html.js*](../src/html.js)
* `UrlAttrFormatter` - Provides a basic sanitizer when converted to html.
* `StyleAttrFormatter` - Maps the attribute to a CSS property.
  * `ColorStyleAttrFormatter` - Like the style formatter used when mapped to a color property. Like the URL formatter the color will be put through a sanitizer for `names`, `#xxx`, `#xxxxxx` and `rgb(#,#,#)` style colors.
  * `NumberStyleAttrFormatter` - Formatter for styles that require numbers and units like `font-size`.

*(wip) check the source for more ideas.*  
