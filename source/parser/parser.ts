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
  ZoticaBuilder
} from "./builder";


export class ZoticaParser extends ZenmlParser {

  public builder!: ZoticaBuilder;

  public constructor(implementation: DOMImplementation, options?: ZenmlParserOptions) {
    super(implementation, options);
    this.builder = new ZoticaBuilder(this.document);
  }

  private createMathElement(tagName: string, attributes: ZenmlAttributes, childrenArgs: ChildrenArgs): Nodes {
    throw "not yet implemented";
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
        let {symbol, types} = ZOTICA_DATA.getOperatorSymbol("pr")!;
        nodes.push(this.builder.buildSubsuper(options, (baseSelf, subSelf, superSelf) => {
          superSelf.appendChild(this.builder.buildOperator(symbol, types, options));
        }));
      } else if (!char.match(/\s/u)) {
        let replacedChar = ZOTICA_DATA.getReplacement(char) ?? char;
        let {symbol, types} = ZOTICA_DATA.getOperatorSymbolByChar(replacedChar) ?? {symbol: char, types: ["bin"]};
        nodes.push(this.builder.buildOperator(symbol, types, options));
      }
    }
    return nodes;
  }

  private createMathEscape(char: string): string {
    throw "not yet implemented";
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
    if (ZOTICA_DATA.isLeafTagName(tagName)) {
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