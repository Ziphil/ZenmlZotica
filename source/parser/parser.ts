//

import {
  ChildrenArgs,
  Nodes,
  ZenmlAttributes,
  ZenmlMarks,
  ZenmlParser,
  ZenmlParserOptions,
  ZenmlParserState,
  ZenmlSpecialElementKind
} from "@zenml/zenml";
import {
  StateParser,
  create,
  mapCatch
} from "@zenml/zenml/dist/parser/util";
import {
  Parser,
  alt,
  lazy
} from "@zenml/zenml/dist/parsimmon";
import {
  ZOTICA_DATA
} from "../data/data";
import {
  MATH_ZOTICA_FONT,
  TIMES_ZOTICA_FONT
} from "../font/font";
import {
  appendChildren
} from "../util/dom";
import {
  ZOTICA_ROLES,
  ZoticaBuilder,
  ZoticaRole
} from "./builder";


export class ZoticaParser extends ZenmlParser {

  public builder!: ZoticaBuilder;

  public constructor(implementation: DOMImplementation, options?: ZenmlParserOptions) {
    super(implementation, options);
    this.builder = new ZoticaBuilder(this.document);
  }

  private createMathElement(tagName: string, attributes: ZenmlAttributes, childrenArgs: ChildrenArgs): Nodes {
    let nodes = [];
    let options = {
      role: this.determineRole(attributes),
      className: attributes.get("class"),
      style: attributes.get("style"),
      fonts: {main: TIMES_ZOTICA_FONT, math: MATH_ZOTICA_FONT}
    };
    if (tagName === "n") {
      let content = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildNumber(content, options));
    } else if (tagName === "i") {
      let types = attributes.get("t")?.split(/\s*,\s*/) ?? [];
      let content = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildIdentifier(content, types, options));
    } else if (tagName === "o") {
      let types = attributes.get("t")?.split(/\s*,\s*/) ?? ["ord"];
      let symbol = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildOperator(symbol, types, options));
    } else if (tagName === "bf") {
      let content = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildIdentifier(content, ["bf"], options));
    } else if (tagName === "rm") {
      let content = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildIdentifier(content, ["rm"], options));
    } else if (tagName === "bfrm") {
      let content = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildIdentifier(content, ["bf", "rm"], options));
    } else if (tagName === "tt") {
      let content = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildIdentifier(content, ["tt"], options));
    } else if (["bb", "varbb", "cal", "scr", "frak", "varfrak"].includes(tagName)) {
      let content = childrenArgs[0]?.[0]?.textContent ?? "";
      let nextContent = ZOTICA_DATA.getAlternativeIdentifierContent(tagName, content);
      nodes.push(this.builder.buildIdentifier(nextContent, ["alt"], options));
    } else if (tagName === "op") {
      let content = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildIdentifier(content, ["fun", "rm"], options));
    } else if (ZOTICA_DATA.isIdentifierKind(tagName)) {
      let char = ZOTICA_DATA.getIdentifierChar(tagName)!;
      nodes.push(this.builder.buildIdentifier(char, [], options));
    } else if (ZOTICA_DATA.isFunctionKind(tagName)) {
      nodes.push(this.builder.buildIdentifier(tagName, ["fun", "rm"], options));
    } else if (ZOTICA_DATA.isOperatorKind(tagName)) {
      let {symbol, types} = ZOTICA_DATA.getOperatorSymbolSpec(tagName)!;
      nodes.push(this.builder.buildOperator(symbol, types, options));
    } else if (tagName === "text") {
      let content = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildText(content, options));
    } else if (tagName === "frac") {
      nodes.push(this.builder.buildFraction(options, (numeratorSelf, denominatorSelf) => {
        appendChildren(numeratorSelf, childrenArgs[0] ?? []);
        appendChildren(denominatorSelf, childrenArgs[1] ?? []);
      }));
    } else if (tagName === "sqrt") {
      let level = parseInt(attributes.get("s") ?? "0");
      let symbol = ZOTICA_DATA.getRadicalSymbol(level) ?? "";
      let modify = !attributes.has("s");
      nodes.push(this.builder.buildRadical(symbol, modify, options, (contentSelf, indexSelf) => {
        appendChildren(contentSelf, childrenArgs[0] ?? []);
        appendChildren(indexSelf, childrenArgs[1] ?? []);
      }));
    } else if (tagName === "fence") {
      let level = parseInt(attributes.get("s") ?? "0");
      let leftKind = attributes.get("l") ?? "paren";
      let rightKind = attributes.get("r") ?? "paren";
      let leftSymbol = ZOTICA_DATA.getLeftFenceSymbol(leftKind, level) ?? "";
      let rightSymbol = ZOTICA_DATA.getRightFenceSymbol(rightKind, level) ?? "";
      let modify = !attributes.has("s");
      nodes.push(this.builder.buildFence(leftKind, rightKind, leftSymbol, rightSymbol, modify, options, (contentSelf) => {
        appendChildren(contentSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "set") {
      let level = parseInt(attributes.get("s") ?? "0");
      let leftKind = attributes.get("l") ?? "brace";
      let rightKind = attributes.get("r") ?? "brace";
      let centerKind = attributes.get("c") ?? "vert";
      let leftSymbol = ZOTICA_DATA.getLeftFenceSymbol(leftKind, level) ?? "";
      let rightSymbol = ZOTICA_DATA.getRightFenceSymbol(rightKind, level) ?? "";
      let centerSymbol = ZOTICA_DATA.getLeftFenceSymbol(centerKind, level) ?? "";
      let modify = !attributes.has("s");
      nodes.push(this.builder.buildSet(leftKind, rightKind, centerKind, leftSymbol, rightSymbol, centerSymbol, modify, options, (leftSelf, rightSelf) => {
        appendChildren(leftSelf, childrenArgs[0] ?? []);
        appendChildren(rightSelf, childrenArgs[1] ?? []);
      }));
    } else if (ZOTICA_DATA.isFenceKind(tagName)) {
      let level = parseInt(attributes.get("s") ?? "0");
      let leftSymbol = ZOTICA_DATA.getLeftFenceSymbol(tagName, level)!;
      let rightSymbol = ZOTICA_DATA.getRightFenceSymbol(tagName, level)!;
      let modify = !attributes.has("s");
      nodes.push(this.builder.buildFence(tagName, tagName, leftSymbol, rightSymbol, modify, options, (contentSelf) => {
        appendChildren(contentSelf, childrenArgs[0] ?? []);
      }));
    }
    return nodes;
  }

  private createMathText(content: string): Nodes {
    let nodes = [];
    let options = {fonts: {main: TIMES_ZOTICA_FONT, math: MATH_ZOTICA_FONT}};
    for (let char of content) {
      if (char.match(/\p{Number}/u)) {
        nodes.push(this.builder.buildNumber(char, options));
      } else if (char.match(/\p{Letter}|\p{Mark}/u)) {
        nodes.push(this.builder.buildIdentifier(char, [], options));
      } else if (char === "'") {
        let {symbol, types} = ZOTICA_DATA.getOperatorSymbolSpec("pr")!;
        nodes.push(this.builder.buildSubsuper(options, (baseSelf, subSelf, superSelf) => {
          superSelf.appendChild(this.builder.buildOperator(symbol, types, options));
        }));
      } else if (!char.match(/\s/u)) {
        let replacedChar = ZOTICA_DATA.getReplacement(char) ?? char;
        let {symbol, types} = ZOTICA_DATA.getOperatorSymbolSpecByChar(replacedChar) ?? {symbol: char, types: ["bin"]};
        nodes.push(this.builder.buildOperator(symbol, types, options));
      }
    }
    return nodes;
  }

  private createMathEscape(char: string): string {
    let nextChar = ZOTICA_DATA.getGreekChar(char) ?? char;
    return nextChar;
  }

  private determineRole(attributes: ZenmlAttributes): ZoticaRole | undefined {
    for (let role of ZOTICA_ROLES) {
      if (attributes.has(role)) {
        return role as ZoticaRole;
      }
    }
    return undefined;
  }

  public readonly mathRoot: Parser<Nodes> = lazy(() => {
    let parser = this.nodes({}).map((nodes) => {
      let element = this.document.createElement("math-root");
      for (let node of nodes) {
        element.appendChild(node);
      }
      return [element];
    });
    return parser;
  });

  public readonly fullNodes: StateParser<Nodes, ZenmlParserState> = create((state) => {
    let anyState = state as any;
    if (anyState.leaf) {
      let parser = this.leafText;
      return parser;
    } else {
      let innerParsers = [];
      innerParsers.push(this.element(state), this.braceElement(state), this.bracketElement(state));
      if (!state.inSlash) {
        innerParsers.push(this.slashElement(state));
      }
      innerParsers.push(this.comment, this.text);
      let parser = alt(...innerParsers).many().map((nodesList) => nodesList.flat());
      return parser;
    }
  });

  public readonly leafText: Parser<Nodes> = lazy(() => {
    let parser = this.verbalTextContentFragment.atLeast(1).thru(mapCatch((contents) => {
      let content = contents.join("");
      return this.createLeafText(content);
    }));
    return parser;
  });

  protected updateDocument(): void {
    let document = this.implementation.createDocument(null, null, null);
    this.setDocument(document);
  }

  public setDocument(document: Document): void {
    this.document = document;
    this.pluginManager.updateDocument(this.document);
    this.builder = new ZoticaBuilder(document);
  }

  protected determineNextState(state: ZenmlParserState, tagName: string, marks: ZenmlMarks, attributes: ZenmlAttributes, macro: boolean): ZenmlParserState {
    let nextState = super.determineNextState(state, tagName, marks, attributes, macro) as any;
    if (ZOTICA_DATA.isLeafKind(tagName)) {
      nextState = {...nextState, leaf: true};
    }
    return nextState;
  }

  protected createNormalElement(tagName: string, marks: ZenmlMarks, attributes: ZenmlAttributes, childrenArgs: ChildrenArgs): Nodes {
    let nodes = this.createMathElement(tagName, attributes, childrenArgs);
    return nodes;
  }

  protected createSpecialElement(kind: ZenmlSpecialElementKind, children: Nodes): Nodes {
    let nodes = this.createMathElement("g", new Map(), [children]);
    return nodes;
  }

  protected createText(content: string): Nodes {
    let nodes = this.createMathText(content);
    return nodes;
  }

  protected createLeafText(content: string): Nodes {
    let text = this.document.createTextNode(content);
    return [text];
  }

  protected createTextEscape(char: string): string {
    let string = this.createMathEscape(char);
    return string;
  }

}