## Use
Import the desired config.

* [config.js](../src/config.js) *basic*
* [config.semantic.js](../src/config-semantic.js) *basic + [semantic-ui](https://github.com/Semantic-Org/Semantic-UI) styling*

[Read here](basic_config.md) or look at the source to see the tags provided by the *basic* config.

```js
import {parser} from 'bbcode/config'; // may be different

let bbcode = '[b]Test[/b]';

let root = parser.parse(bbcode);  // parse returns the root of the parsed text.

// get the bbcode
bbcode = root.format('bbcode'); // returns bbcode string

// get html
let html = root.format('html'); // returns html string
```


### Parse html and html-like bbcode
* [config.html.js](../src/config.html.js) *covers most html tags*

```js
import {html_parser, bbcode_parser} from 'bbcode/config-html';

let html = '<a href="https://github.com/">Github</a>';
let bbcode = '[a href="https://github.com/"]Github[/a]';

let html_root = html_parser.parse( html );
let bbcode_root = bbcode_parser.parse( bbcode );

// format + expected result

// [a href="https://github.com/"]Github[/a]
html_root.format('bbcode');

// <a href="https://github.com/">Github</a>
html_root.format('html');

// [a href="https://github.com/"]Github[/a]
bbcode_root.format('bbcode');

// <a href="https://github.com/">Github</a>
bbcode_root.format('html');
```

## Customize
If you feel the basic config doesn't provide all the tags you need, or too many, you may add and remove tags from any config with the `add_tag` and `remove_tag` methods.

The [customization](customize.md) guide explains how define tags and their attributes.

### Add a tag.
```js
import {tag_parser, parser, TagDefinition} from 'bbcode/config';

// define tag then:
//      (read the customization guide on defining tags)
let tagdef = new TagDefinition( ... );

tag_parser.add_tag( tagdef ); 
```

### Remove a tag
```js
import {tag_parser, parser} from 'bbcode/config';

tag_parser.remove_tag( 'b' );
```
The `TagParser` will no longer recognize `[b]` as a valid tag after this operation.

If you'd like a completely custom config read the [customization](customize.md) guide.
