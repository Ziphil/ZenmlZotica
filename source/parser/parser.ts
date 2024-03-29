//

import {
  ChildrenArgs,
  Nodes,
  ZenmlAttributes,
  ZenmlMarks,
  ZenmlParser,
  ZenmlParserOptions,
  ZenmlParserState,
  ZenmlPlugin,
  ZenmlPluginManager,
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
  ZoticaRole,
  ZoticaSymbolSize
} from "./builder";


export type ZoticaParserOptions = ZenmlParserOptions & {
  parentPluginManager?: ZenmlPluginManager
};


export class ZoticaParser extends ZenmlParser {

  private parentPluginManager?: ZenmlPluginManager;
  public builder!: ZoticaBuilder;

  public constructor(implementation: DOMImplementation, options?: ZoticaParserOptions) {
    super(implementation, options);
    this.parentPluginManager = options?.parentPluginManager;
    this.builder = new ZoticaBuilder(this.document);
  }

  private createMathElement(tagName: string, attributes: ZenmlAttributes, childrenArgs: ChildrenArgs): Nodes {
    const nodes = [];
    const options = {
      role: this.determineRole(attributes),
      className: attributes.get("class"),
      style: attributes.get("style"),
      fonts: {main: TIMES_ZOTICA_FONT, math: MATH_ZOTICA_FONT}
    };
    if (tagName === "n") {
      const content = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildNumber(content, options));
    } else if (tagName === "i") {
      const types = attributes.get("t")?.split(/\s*,\s*/) ?? [];
      const content = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildIdentifier(content, types, options));
    } else if (tagName === "o") {
      const types = attributes.get("t")?.split(/\s*,\s*/) ?? ["ord"];
      const symbol = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildOperator(symbol, types, options));
    } else if (tagName === "bf") {
      const content = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildIdentifier(content, ["bf"], options));
    } else if (tagName === "rm") {
      const content = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildIdentifier(content, ["rm"], options));
    } else if (tagName === "bfrm") {
      const content = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildIdentifier(content, ["bf", "rm"], options));
    } else if (tagName === "tt") {
      const content = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildIdentifier(content, ["tt"], options));
    } else if (ZOTICA_DATA.isAlternativeKind(tagName)) {
      const content = childrenArgs[0]?.[0]?.textContent ?? "";
      const nextContent = ZOTICA_DATA.getAlternativeContent(tagName, content);
      nodes.push(this.builder.buildIdentifier(nextContent, ["alt"], options));
    } else if (tagName === "op") {
      const content = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildIdentifier(content, ["fun", "rm"], options));
    } else if (ZOTICA_DATA.isIdentifierKind(tagName)) {
      const char = ZOTICA_DATA.getIdentifierChar(tagName)!;
      nodes.push(this.builder.buildIdentifier(char, [], options));
    } else if (ZOTICA_DATA.isFunctionKind(tagName)) {
      nodes.push(this.builder.buildIdentifier(tagName, ["fun", "rm"], options));
    } else if (ZOTICA_DATA.isOperatorKind(tagName)) {
      const {symbol, types} = ZOTICA_DATA.getOperatorSymbolSpec(tagName)!;
      nodes.push(this.builder.buildOperator(symbol, types, options));
    } else if (tagName === "text") {
      const content = childrenArgs[0]?.[0]?.textContent ?? "";
      nodes.push(this.builder.buildText(content, options));
    } else if (tagName === "multi") {
      nodes.push(this.builder.buildSubsuper(options, (baseSelf, subSelf, superSelf, leftSubSelf, leftSuperSelf) => {
        appendChildren(baseSelf, childrenArgs[0] ?? []);
        appendChildren(subSelf, childrenArgs[1] ?? []);
        appendChildren(superSelf, childrenArgs[2] ?? []);
        appendChildren(leftSubSelf, childrenArgs[3] ?? []);
        appendChildren(leftSuperSelf, childrenArgs[4] ?? []);
      }));
    } else if (tagName === "sbsp") {
      nodes.push(this.builder.buildSubsuper(options, (baseSelf, subSelf, superSelf, leftSubSelf, leftSuperSelf) => {
        appendChildren(baseSelf, childrenArgs[0] ?? []);
        appendChildren(subSelf, childrenArgs[1] ?? []);
        appendChildren(superSelf, childrenArgs[2] ?? []);
      }));
    } else if (tagName === "sb") {
      nodes.push(this.builder.buildSubsuper(options, (baseSelf, subSelf, superSelf, leftSubSelf, leftSuperSelf) => {
        appendChildren(baseSelf, childrenArgs[0] ?? []);
        appendChildren(subSelf, childrenArgs[1] ?? []);
      }));
    } else if (tagName === "sp") {
      nodes.push(this.builder.buildSubsuper(options, (baseSelf, subSelf, superSelf, leftSubSelf, leftSuperSelf) => {
        appendChildren(baseSelf, childrenArgs[0] ?? []);
        appendChildren(superSelf, childrenArgs[1] ?? []);
      }));
    } else if (tagName === "unov") {
      nodes.push(this.builder.buildUnderover(options, (baseSelf, underSelf, overSelf) => {
        appendChildren(baseSelf, childrenArgs[0] ?? []);
        appendChildren(underSelf, childrenArgs[1] ?? []);
        appendChildren(overSelf, childrenArgs[2] ?? []);
      }));
    } else if (tagName === "un") {
      nodes.push(this.builder.buildUnderover(options, (baseSelf, underSelf, overSelf) => {
        appendChildren(baseSelf, childrenArgs[0] ?? []);
        appendChildren(underSelf, childrenArgs[1] ?? []);
      }));
    } else if (tagName === "ov") {
      nodes.push(this.builder.buildUnderover(options, (baseSelf, underSelf, overSelf) => {
        appendChildren(baseSelf, childrenArgs[0] ?? []);
        appendChildren(overSelf, childrenArgs[1] ?? []);
      }));
    } else if (tagName === "frac") {
      nodes.push(this.builder.buildFraction(options, (numeratorSelf, denominatorSelf) => {
        appendChildren(numeratorSelf, childrenArgs[0] ?? []);
        appendChildren(denominatorSelf, childrenArgs[1] ?? []);
      }));
    } else if (tagName === "sqrt") {
      const level = parseInt(attributes.get("s") ?? "0");
      const symbol = ZOTICA_DATA.getRadicalSymbol(level) ?? "";
      const modify = !attributes.has("s");
      nodes.push(this.builder.buildRadical(symbol, modify, options, (contentSelf, indexSelf) => {
        appendChildren(contentSelf, childrenArgs[0] ?? []);
        appendChildren(indexSelf, childrenArgs[1] ?? []);
      }));
    } else if (tagName === "intlike") {
      const kind = attributes.get("k") ?? "int";
      const size = (attributes.has("in")) ? "inl" : "lrg" as ZoticaSymbolSize;
      const symbol = ZOTICA_DATA.getIntegralSymbol(kind, size) ?? "";
      nodes.push(this.builder.buildIntegral(symbol, size, options, (subSelf, superSelf) => {
        appendChildren(subSelf, childrenArgs[0] ?? []);
        appendChildren(superSelf, childrenArgs[1] ?? []);
      }));
    } else if (ZOTICA_DATA.isIntegralKind(tagName)) {
      const size = (attributes.has("in")) ? "inl" : "lrg" as ZoticaSymbolSize;
      const symbol = ZOTICA_DATA.getIntegralSymbol(tagName, size) ?? "";
      nodes.push(this.builder.buildIntegral(symbol, size, options, (subSelf, superSelf) => {
        appendChildren(subSelf, childrenArgs[0] ?? []);
        appendChildren(superSelf, childrenArgs[1] ?? []);
      }));
    } else if (tagName === "sumlike") {
      const kind = attributes.get("k") ?? "sum";
      const size = (attributes.has("in")) ? "inl" : "lrg" as ZoticaSymbolSize;
      const symbol = ZOTICA_DATA.getSumSymbol(kind, size) ?? "";
      nodes.push(this.builder.buildSum(symbol, size, options, (underSelf, overSelf) => {
        appendChildren(underSelf, childrenArgs[0] ?? []);
        appendChildren(overSelf, childrenArgs[1] ?? []);
      }));
    } else if (ZOTICA_DATA.isSumKind(tagName)) {
      const size = (attributes.has("in")) ? "inl" : "lrg" as ZoticaSymbolSize;
      const symbol = ZOTICA_DATA.getSumSymbol(tagName, size) ?? "";
      nodes.push(this.builder.buildSum(symbol, size, options, (underSelf, overSelf) => {
        appendChildren(underSelf, childrenArgs[0] ?? []);
        appendChildren(overSelf, childrenArgs[1] ?? []);
      }));
    } else if (tagName === "fence") {
      const level = parseInt(attributes.get("s") ?? "0");
      const leftKind = attributes.get("l") ?? "paren";
      const rightKind = attributes.get("r") ?? "paren";
      const leftSymbol = ZOTICA_DATA.getLeftFenceSymbol(leftKind, level) ?? "";
      const rightSymbol = ZOTICA_DATA.getRightFenceSymbol(rightKind, level) ?? "";
      const modify = !attributes.has("s");
      nodes.push(this.builder.buildFence(leftKind, rightKind, leftSymbol, rightSymbol, modify, options, (contentSelf) => {
        appendChildren(contentSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "set") {
      const level = parseInt(attributes.get("s") ?? "0");
      const leftKind = attributes.get("l") ?? "brace";
      const rightKind = attributes.get("r") ?? "brace";
      const centerKind = attributes.get("c") ?? "vert";
      const leftSymbol = ZOTICA_DATA.getLeftFenceSymbol(leftKind, level) ?? "";
      const rightSymbol = ZOTICA_DATA.getRightFenceSymbol(rightKind, level) ?? "";
      const centerSymbol = ZOTICA_DATA.getLeftFenceSymbol(centerKind, level) ?? "";
      const modify = !attributes.has("s");
      nodes.push(this.builder.buildSet(leftKind, rightKind, centerKind, leftSymbol, rightSymbol, centerSymbol, modify, options, (leftSelf, rightSelf) => {
        appendChildren(leftSelf, childrenArgs[0] ?? []);
        appendChildren(rightSelf, childrenArgs[1] ?? []);
      }));
    } else if (ZOTICA_DATA.isFenceKind(tagName)) {
      const level = parseInt(attributes.get("s") ?? "0");
      const leftSymbol = ZOTICA_DATA.getLeftFenceSymbol(tagName, level)!;
      const rightSymbol = ZOTICA_DATA.getRightFenceSymbol(tagName, level)!;
      const modify = !attributes.has("s");
      nodes.push(this.builder.buildFence(tagName, tagName, leftSymbol, rightSymbol, modify, options, (contentSelf) => {
        appendChildren(contentSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "accent") {
      const kind = attributes.get("k") ?? "tilde";
      const underSymbol = ZOTICA_DATA.getUnderAccentSymbol(kind);
      const overSymbol = ZOTICA_DATA.getOverAccentSymbol(kind);
      nodes.push(this.builder.buildAccent(underSymbol, overSymbol, options, (baseSelf) => {
        appendChildren(baseSelf, childrenArgs[0] ?? []);
      }));
    } else if (ZOTICA_DATA.isAccentKind(tagName)) {
      const underSymbol = ZOTICA_DATA.getUnderAccentSymbol(tagName);
      const overSymbol = ZOTICA_DATA.getOverAccentSymbol(tagName);
      nodes.push(this.builder.buildAccent(underSymbol, overSymbol, options, (baseSelf) => {
        appendChildren(baseSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "wide") {
      const kind = attributes.get("k") ?? "widetilde";
      const level = parseInt(attributes.get("s") ?? "0");
      const underSymbol = ZOTICA_DATA.getUnderWideSymbol(kind, level);
      const overSymbol = ZOTICA_DATA.getOverWideSymbol(kind, level);
      const modify = !attributes.has("s");
      nodes.push(this.builder.buildWide(kind, underSymbol, overSymbol, modify, options, (baseSelf) => {
        appendChildren(baseSelf, childrenArgs[0] ?? []);
      }));
    } else if (ZOTICA_DATA.isWideKind(tagName)) {
      const level = parseInt(attributes.get("s") ?? "0");
      const underSymbol = ZOTICA_DATA.getUnderWideSymbol(tagName, level);
      const overSymbol = ZOTICA_DATA.getOverWideSymbol(tagName, level);
      const modify = !attributes.has("s");
      nodes.push(this.builder.buildWide(tagName, underSymbol, overSymbol, modify, options, (baseSelf) => {
        appendChildren(baseSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "table") {
      const type = attributes.get("t") ?? "std";
      const alignCharsString = attributes.get("align") ?? null;
      const raw = attributes.has("raw");
      nodes.push(this.builder.buildTable(type, alignCharsString, raw, options, (tableSelf) => {
        appendChildren(tableSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "array") {
      const alignCharsString = attributes.get("align") ?? null;
      nodes.push(this.builder.buildTable("std", alignCharsString, true, options, (tableSelf) => {
        appendChildren(tableSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "matrix") {
      nodes.push(this.builder.buildTable("mat", null, false, options, (tableSelf) => {
        appendChildren(tableSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "case") {
      const leftSymbol = ZOTICA_DATA.getLeftFenceSymbol("brace", 0) ?? "";
      const rightSymbol = ZOTICA_DATA.getRightFenceSymbol("none", 0) ?? "";
      nodes.push(this.builder.buildFence("brace", "none", leftSymbol, rightSymbol, true, options, (contentSelf) => {
        contentSelf.appendChild(this.builder.buildTable("cas", "ll", false, options, (tableSelf) => {
          appendChildren(tableSelf, childrenArgs[0] ?? []);
        }));
      }));
    } else if (tagName === "stack") {
      nodes.push(this.builder.buildTable("stk", null, true, options, (tableSelf) => {
        appendChildren(tableSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "c") {
      nodes.push(this.builder.buildTableCell(options, (cellSelf) => {
        appendChildren(cellSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "cc") {
      for (const children of childrenArgs) {
        nodes.push(this.builder.buildTableCell(options, (cellSelf) => {
          appendChildren(cellSelf, children);
        }));
      }
      nodes.push(this.builder.buildTableBreak(options));
    } else if (tagName === "br") {
      nodes.push(this.builder.buildTableBreak(options));
    } else if (tagName === "diag") {
      const verticalGapsString = attributes.get("ver") ?? null;
      const horizontalGapsString = attributes.get("hor") ?? null;
      const alignBaseline = attributes.has("bl");
      nodes.push(this.builder.buildDiagram(verticalGapsString, horizontalGapsString, alignBaseline, options, (tableSelf) => {
        appendChildren(tableSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "v") {
      const name = attributes.get("name") ?? null;
      nodes.push(this.builder.buildDiagramVertex(name, options, (vertexSelf) => {
        appendChildren(vertexSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "vv") {
      for (const children of childrenArgs) {
        nodes.push(this.builder.buildDiagramVertex(null, options, (vertexSelf) => {
          appendChildren(vertexSelf, children);
        }));
      }
      nodes.push(this.builder.buildTableBreak(options));
    } else if (tagName === "ar") {
      const name = attributes.get("name") ?? null;
      const settings = {
        startPosition: attributes.get("s") ?? "0",
        endPosition: attributes.get("e") ?? "0",
        tipKinds: attributes.get("tip"),
        bendAngle: attributes.get("bend"),
        shift: attributes.get("shift"),
        lineCount: attributes.get("line"),
        dashed: attributes.has("dash"),
        labelPosition: attributes.get("pos"),
        inverted: attributes.has("inv"),
        mark: attributes.has("mark")
      };
      nodes.push(this.builder.buildArrow(name, settings, options, (labelSelf) => {
        appendChildren(labelSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "tree") {
      nodes.push(this.builder.buildTree(options, (contentSelf) => {
        appendChildren(contentSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "axm") {
      nodes.push(this.builder.buildTreeAxiom(options, (contentSelf) => {
        appendChildren(contentSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "infr") {
      const number = parseInt(attributes.get("n") ?? "0");
      nodes.push(this.builder.buildTreeInference(number, options, (contentSelf, rightLabelSelf, leftLabelSelf) => {
        appendChildren(contentSelf, childrenArgs[0] ?? []);
        appendChildren(rightLabelSelf, childrenArgs[1] ?? []);
        appendChildren(leftLabelSelf, childrenArgs[2] ?? []);
      }));
    } else if (tagName === "g") {
      const settings = {
        rotate: (attributes.has("rotate")) ? parseInt(attributes.get("rotate")!) : undefined
      };
      nodes.push(this.builder.buildGroup(settings, options, (contentSelf) => {
        appendChildren(contentSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "ph") {
      const type = attributes.get("t") ?? "bth";
      nodes.push(this.builder.buildPhantom(type, options, (contentSelf) => {
        appendChildren(contentSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "vph" || tagName === "hph") {
      const type = (tagName === "vph") ? "ver" : "hor";
      nodes.push(this.builder.buildPhantom(type, options, (contentSelf) => {
        appendChildren(contentSelf, childrenArgs[0] ?? []);
      }));
    } else if (tagName === "s") {
      const type = attributes.get("t") ?? "med";
      nodes.push(this.builder.buildSpace(type, options));
    } else if (ZOTICA_DATA.isSpaceTagName(tagName)) {
      const type = ZOTICA_DATA.getSpaceType(tagName)!;
      nodes.push(this.builder.buildSpace(type, options));
    } else {
      nodes.push(this.builder.createElement(tagName, (self) => {
        for (const [attributeName, attributeValue] of attributes) {
          self.setAttribute(attributeName, attributeValue);
        }
        for (const child of childrenArgs[0] ?? []) {
          self.appendChild(child);
        }
      }));
    }
    return nodes;
  }

  private createMathText(content: string): Nodes {
    const nodes = [];
    const options = {fonts: {main: TIMES_ZOTICA_FONT, math: MATH_ZOTICA_FONT}};
    for (const char of content) {
      if (char.match(/\p{Number}/u)) {
        nodes.push(this.builder.buildNumber(char, options));
      } else if (char.match(/\p{Letter}|\p{Mark}/u)) {
        nodes.push(this.builder.buildIdentifier(char, [], options));
      } else if (char === "'") {
        const {symbol, types} = ZOTICA_DATA.getOperatorSymbolSpec("pr")!;
        nodes.push(this.builder.buildSubsuper(options, (baseSelf, subSelf, superSelf) => {
          superSelf.appendChild(this.builder.buildOperator(symbol, types, options));
        }));
      } else if (!char.match(/\s/u)) {
        const nextChar = ZOTICA_DATA.getReplacedChar(char) ?? char;
        const {symbol, types} = ZOTICA_DATA.getOperatorSymbolSpecByChar(nextChar) ?? {symbol: char, types: ["bin"]};
        nodes.push(this.builder.buildOperator(symbol, types, options));
      }
    }
    return nodes;
  }

  private createMathEscape(char: string): string {
    const nextChar = ZOTICA_DATA.getGreekChar(char) ?? char;
    return nextChar;
  }

  private determineRole(attributes: ZenmlAttributes): ZoticaRole | undefined {
    for (const role of ZOTICA_ROLES) {
      if (attributes.has(role)) {
        return role as ZoticaRole;
      }
    }
    return undefined;
  }

  public readonly mathRoot: Parser<Nodes> = lazy(() => {
    const parser = this.nodes({}).map((nodes) => {
      const element = this.document.createElement("math-root");
      for (const node of nodes) {
        element.appendChild(node);
      }
      return [element];
    });
    return parser;
  });

  public readonly fullNodes: StateParser<Nodes, ZenmlParserState> = create((state) => {
    if (state.leaf) {
      const parser = this.leafText;
      return parser;
    } else {
      const innerParsers = [];
      innerParsers.push(this.element(state), this.braceElement(state), this.bracketElement(state));
      if (!state.inSlash) {
        innerParsers.push(this.slashElement(state));
      }
      innerParsers.push(this.comment, this.text);
      const parser = alt(...innerParsers).many().map((nodesList) => nodesList.flat());
      return parser;
    }
  });

  public readonly leafText: Parser<Nodes> = lazy(() => {
    const parser = this.verbalTextContentFragment.atLeast(1).thru(mapCatch((contents) => {
      const content = contents.join("");
      return this.createLeafText(content);
    }));
    return parser;
  });

  protected updateDocument(): void {
    const document = this.implementation.createDocument(null, null, null);
    this.setDocument(document);
  }

  public setDocument(document: Document): void {
    this.document = document;
    this.pluginManager.updateDocument(this.document);
    this.builder = new ZoticaBuilder(document);
  }

  protected determinePlugin(name: string): ZenmlPlugin | null {
    const plugin = this.pluginManager.getPlugin(name) ?? this.parentPluginManager?.getPlugin(name) ?? null;
    return plugin;
  }

  protected determineNextState(state: ZenmlParserState, tagName: string, marks: ZenmlMarks, attributes: ZenmlAttributes, macro: boolean): ZenmlParserState {
    let nextState = super.determineNextState(state, tagName, marks, attributes, macro);
    if (ZOTICA_DATA.isLeafKind(tagName)) {
      nextState = {...nextState, leaf: true};
    }
    return nextState;
  }

  protected createNormalElement(tagName: string, marks: ZenmlMarks, attributes: ZenmlAttributes, childrenArgs: ChildrenArgs): Nodes {
    const nodes = this.createMathElement(tagName, attributes, childrenArgs);
    return nodes;
  }

  protected createSpecialElement(kind: ZenmlSpecialElementKind, children: Nodes): Nodes {
    const nodes = this.createMathElement("g", new Map(), [children]);
    return nodes;
  }

  protected createText(content: string): Nodes {
    const nodes = this.createMathText(content);
    return nodes;
  }

  protected createLeafText(content: string): Nodes {
    const text = this.document.createTextNode(content);
    return [text];
  }

  protected createTextEscape(char: string): string {
    const string = this.createMathEscape(char);
    return string;
  }

}