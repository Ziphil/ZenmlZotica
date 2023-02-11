<div align="center">
<h1>Zotica</h1>
</div>

![](https://img.shields.io/github/package-json/v/Ziphil/ZenmlZotica)
![](https://img.shields.io/github/commit-activity/y/Ziphil/ZenmlZotica?label=commits)


## Overview
Zotica (named after the Greek word “ζωτικά”) is a markup language that can describe mathematical expressions in a [ZenML](https://github.com/Ziphil/Zenml)-like syntax.
By passing mathematical markups through a processor, they are converted into HTML elements, which can be rendered on a web page using special CSS and JavaScript.
It aims to provide the same quality of mathematical expressions as TeX, and to prevent the output HTML from becoming obfuscated.

There are already several engines for displaying mathematical expressions in the browser, such as [MathJax](https://www.mathjax.org/) and [KaTeX](https://katex.org/).
The main differences to these engines are the following three points:

- The font is inherited from the outer text (except for symbols) so that mathematical expressions are not unnecessarily conspicuous from the main text
- The structure of the output HTML is relatively simple
- The spacing between elements can be easily adjuste dby simply overriding CSS

If you are interested in how mathematical expressions are rendered, see the [rendering test page](https://ziphil.github.io/ZenmlZoticaDemo/).

This package provides a Zotica processor and a plugin for a ZenML parser that allows you to embed Zotica expressions in your ZenML documents.

This is a part of the [ZenML](https://github.com/Ziphil/Zenml) infrastructure.

## Installation
Install via [npm](https://www.npmjs.com/package/@zenml/zotica).
```
npm i @zenml/zotica
```

## About the math font
The math font used in Zotica is a modified version of [STIX Two Math](https://www.stixfonts.org/) (version 2.00 b137) for use in HTML.
It is available [here](source/client/font/font.otf) and you are free to use it under the [SIL Open Font License](http://scripts.sil.org/OFL).
You can also obtain the same font by making the following modifications to the original font:

First, in order to give special codepoints to the additionally registered glyphs (`.notdef`–`zeroinferior.per`), copy these glyphs to U+F0000–U+F04DB.
The codepoints mentioned below will be those after the copy.

As some of the large operators are displayed slightly higher without modification, move the glyphs at U+F0187–U+F018A and U+F0214–U+F021D downward by 540.

In order to display the radical symbols correctly without CSS adjustment, it is necessary to change the position of the glyphs for radical symbols.
Move the glyphs at U+F011D, U+F011E, U+F011F downward by 667, 1183, 1704 respectively.

To save the repositioned accent symbols to different codepoints, first copy the glyphs U+0300–U+036F and U+20D0–U+20FF to U+F0500–U+F056F and U+F0570–U+F059F respectively.
Then for each glyph copied, set the X coordinate of the left edge of the glyph to 0, and set the character width to match the glyph width.
For example, move the whole glyph at U+F0500 to the right by 338 and set the character width to 162.

## Implementation notes (for my future self)
`builder.ts` と `data.ts` の型定義部分に `| string` が書かれている箇所がいくつかありますが、これは厳密な型チェックの実装を後回しにしてとりあえずコンパイルが通るようにするための暫定的な記述です。
将来的には、厳密な型チェックを実装するなり、設計を見直すなりして、`| string` は削除すべきです。