## Tags in the *Basic Config*

|  BBCode  |  Html  | Notes |
|:---|:---|:---|
|`[b][/b]` |`<b></b>`||
|`[i][/i]` |`<i></i>`||
|`[u][/u]` |`<u></u>`||
|`[s][/s]` |`<s></s>`||
|`[sup][/sup]`|`<sup></sup>`||
|`[sub][/sub]`|`<sub></sub>`||
|`[center][/center]`|`<div class="center"></div>`||
|`[align="left|center|right|justify"][/align]`|`<div style="text-align left|center|right|justify;"></div>`||
|`[list][/list]`|`<ul></ul>`|*only `[li]` & `[*]` allowed as children*|
|`[ul][/ul]`|`<ul></ul>`|*only `[li]` & `[*]` allowed as children*|
|`[ol][/ol]`|`<ol></ol>`|*only `[li]` & `[*]` allowed as children*|
|`[li][/li]`|`<li></li>`|*only allowed in the above lists*|
|`[*]`|`<li></li>`|*end tag not needed, only allowed in the lists*|
|`[size="5-30"][/size]`|`<span style="font-size: 5-30px;"><span>`||
|`[color="#fff|#ffffff][/color]`|`<span style="color: #fff|#ffffff"></span>`||
|`[color="rgb(#,#,#)"][/color]`|`<span style="color: rgb(#,#,#);"></span>`||
|`[style size="5-30" color="#fff|#ffffff|rgb(#,#,#)"][/style]`|`<span style="font-size: #px; color: #fff|rgb(#,#,#);"></span>`||
|`[noparse][/noparse]`||*any bbcode inside will not be parsed*| 
|`[table][/table]`|`<table></table>`||
|`[thead][/thead]`|`<thead></thead>`|*requires table*|
|`[tbody][/tbody]`|`<tbody></tbody>`|*requires table*|
|`[tfoot][/tfoot]`|`<tfoot></tfoot>`|*requires table*|
|`[tr][/tr]`|`<tr></tr>`|*requires table,thead,tbody or tfoot*|
|`[td][/td]`|`<td></td>`|*requires tr*|
|`[th][/th]`|`<th></th>`|*requires tr*|
|`[hr]`|`<hr>`|
|`[url]http://[/url]`|`<a href="http://">http://</a>`|
|`[url=http://]link[/url]`|`<a href="http://">link</a>`|
|`[img]http://[/img]`|`<img src="http://">`|
|`[img=http://]title[/img]`|`<img src="http://" title="title">`|
|`[code=xyz][/code]`|`<code><div class="header">xyz</div></code>`|
|`[quote=who][/quote]`|`<blockquote><div class="header">who</div></blockquote>`|
|`[spoiler][/spoiler]`|`<span class="spoiler"></span>`|
|`[header=1-6][/header]`|`<h1></h1>-<h6></h6>`|