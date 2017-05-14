## Basic Configs
* [BBCode](../src/config-bb.js) *[tags](basic_config.md)*
* [BBCode](../src/config-bb-semantic.js) styled with [Semantic-UI](https://github.com/Semantic-Org/Semantic-UI).
* [HTML](../src/config-html.js)

## Using
```js
import {Parser, bbcode_parser} from 'bbcode/config-bb';

let parser = new Parser( bbcode_parser );  // create main parser and give it a configured sub parser (bbcode)
let root = parser.parse( '[b]Test[/b]' );  // parse returns the root of the parsed text.

root.format( 'bbcode' );   // returns bbcode string: [b]Test[/b]
root.format( 'html' );     // returns html string:   <b>Test</b>
```
## Customize
[Customization guide](customize.md).

### Adding a tag to existing configs
```js
import {bbcode_parser} from 'bbcode/config-bb';
import {BBTagDef} from 'bbcode/bbcode';

bbcode_parser.add_tag( new BBTagDef( 'xyz' ) ); // [xyz][/xyz]
```

### Remove a tag
```js
import {bbcode_parser} from 'bbcode/config-bb';

bbcode_parser.remove_tag( 'b' );
```

The `bbcode_parser` will no longer recognize `[b]` as a valid tag after this operation.
