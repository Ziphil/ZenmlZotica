//

import {
  DOMImplementation,
  XMLSerializer
} from "@xmldom/xmldom";
import {
  SimpleZenmlPlugin,
  ZenmlParser
} from "@zenml/zenml";
import fs from "fs/promises";
import {
  ZoticaResourceUtils,
  ZoticaZenmlPlugin
} from "../dist/index";


async function generate(): Promise<void> {
  await fs.mkdir("./out", {recursive: true});
  await Promise.all([generateHtml(), copyCustomStyle(), generateZoticaStyle(), generateZoticaScript(), copyZoticaFont()]);
}

async function generateHtml(): Promise<void> {
  const implementation = new DOMImplementation();
  const serializer = new XMLSerializer();
  const parser = new ZenmlParser(implementation);
  parser.registerPlugin("raw", new SimpleZenmlPlugin((builder, tagName, marks, attributes, childrenArgs) => {
    const nodes = childrenArgs[0] ?? [];
    return nodes;
  }));
  parser.registerPlugin("m", new ZoticaZenmlPlugin((builder, tagName, marks, attributes, childrenArgs) => {
    const element = builder.createElement("li");
    element.setAttribute("class", "math");
    for (const child of childrenArgs[0]) {
      element.appendChild(child);
    }
    return [element];
  }));
  const input = await fs.readFile("./test/file/sample.zml", {encoding: "utf-8"});
  let output = serializer.serializeToString(parser.tryParse(input));
  output = output.replace(/<([\w\-]+)([^<>]*?)\/>/g, (match, tagName, innerString) => `<${tagName}${innerString}></${tagName}>`);
  await fs.writeFile("./out/index.html", output, {encoding: "utf-8"});
}

async function copyCustomStyle(): Promise<void> {
  await fs.copyFile("./test/file/sample.css", "./out/style.css");
}

async function generateZoticaStyle(): Promise<void> {
  const styleString = ZoticaResourceUtils.getStyleString("./math.otf");
  await fs.writeFile("./out/math.css", styleString, {encoding: "utf-8"});
}

async function generateZoticaScript(): Promise<void> {
  const scriptString = ZoticaResourceUtils.getScriptString();
  await fs.writeFile("./out/math.js", scriptString, {encoding: "utf-8"});
}

async function copyZoticaFont(): Promise<void> {
  await fs.copyFile("./source/client/font/font.otf", "./out/math.otf");
}

generate();