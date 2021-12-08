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
} from "parsimmon";
import {
  ZOTICA_DATA
} from "source/data/data";


export class ZoticaParser extends ZenmlParser {

  public constructor(implementation: DOMImplementation, options?: ZenmlParserOptions) {
    super(implementation, options);
  }

  private createMathElement(tagName: string, attributes: ZenmlAttributes, childrenArgs: ChildrenArgs): Nodes {
    throw "not yet implemented";
  }

  private createMathText(content: string): Nodes {
    throw "not yet implemented";
  }

  private createMathEscape(char: string): string {
    throw "not yet implemented";
  }

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