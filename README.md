<div align="center">
<h1>Zotica</h1>
</div>

![](https://img.shields.io/github/package-json/v/Ziphil/ZenmlZotica)
![](https://img.shields.io/github/commit-activity/y/Ziphil/ZenmlZotica?label=commits)


## Overview
Zotica is a markup language that can describe mathematical expressions in a ZenML-like syntax.
By passing mathematical markups through a processor, they are converted into HTML elements, which can be rendered in a web page by applying special CSS and JavaScript.
It aims to provide the same quality of mathematical expressions as TeX, and to prevent the output HTML from becoming obfuscated.

There are already several engines for displaying mathematical expressions in the browser, such as [MathJax](https://www.mathjax.org/) and [KaTeX](https://katex.org/).
The main differences from these engines are the following three points:

- The font is inherited from the outer text (except for symbols) and thus mathematical expressions are not unnecessarily conspicuous from the main text
- The structure of the output HTML is relatively simple
- The spacing between elements can be customized easily by simply overriding CSS

This packages provide a Zotica processor and some relevant extra utilities.

This is a part of the [ZenML](https://github.com/Ziphil/Zenml) infrastructure.

## Installation
Install via [npm](https://www.npmjs.com/package/@zenml/zotica).
```
npm i @zenml/zotica
```

## Implementaion notes (for my future self)
`builder.ts` と `data.ts` の型定義部分に `| string` が書かれている箇所がいくつかありますが、これは厳密な型チェックの実装を後回しにしてとりあえずコンパイルが通るようにするための暫定的な記述です。
将来的には、厳密な型チェックを実装するなり、設計を見直すなりして、`| string` は削除すべきです。