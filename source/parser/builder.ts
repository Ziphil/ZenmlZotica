//

import {
  BaseBuilder,
  NodeLikeOf
} from "@zenml/zenml";
import {
  isElement
} from "../util/dom";


const ZOTICA_ROLES = ["bin", "rel", "sbin", "srel", "del", "fun", "not", "ord", "lpar", "rpar", "cpar"];

export type ZoticaRole = "bin" | "rel" | "sbin" | "srel" | "del" | "fun" | "not" | "ord" | "lpar" | "rpar" | "cpar";
export type ZoticaFontType = "main" | "math";
export type ZoticaCommonOptions = {
  role?: ZoticaRole,
  className?: string,
  style?: string
};


export class ZoticaBuilder extends BaseBuilder<Document> {

  public constructor(document: Document) {
    super(document);
  }

  public buildNumber(content: string, options?: ZoticaCommonOptions): NodeLikeOf<Document> {
    let self = this.createDocumentFragment();
    let element = null as Element | null;
    this.appendElement(self, "math-n", (self) => {
      this.appendTextNode(self, content);
      element = self;
    });
    this.applyOptions(self, options);
    this.modifyVerticalMargins(element!, "main", options);
    return self;
  }

  public buildIdentifier(content: string, types: Array<"bf" | "rm" | "tt" | "fun" | "alt">, options?: ZoticaCommonOptions): NodeLikeOf<Document> {
    let self = this.createDocumentFragment();
    let element = null as Element | null;
    let fontType = (types.includes("alt")) ? "math" : "main" as ZoticaFontType;
    this.appendElement(self, "math-i", (self) => {
      self.setAttribute("class", types.join(" "));
      self.setAttribute("data-cont", content);
      this.appendTextNode(self, content);
      element = self;
    });
    this.applyOptions(self, options);
    this.modifyVerticalMargins(element!, fontType, options);
    return self;
  }

  public buildOperator(symbol: string, types: Array<"txt">, options?: ZoticaCommonOptions): NodeLikeOf<Document> {
    let self = this.createDocumentFragment();
    let element = null as Element | null;
    let fontType = (types.includes("txt")) ? "main" : "math" as ZoticaFontType;
    this.appendElement(self, "math-o", (self) => {
      self.setAttribute("class", types.join(" "));
      self.setAttribute("data-cont", symbol);
      this.appendTextNode(self, symbol);
      element = self;
    });
    this.applyOptions(self, options);
    this.modifyVerticalMargins(element!, fontType, options);
    return self;
  }

  private applyOptions(nodes: DocumentFragment, options?: ZoticaCommonOptions): void {
    for (let i = 0 ; i < nodes.childNodes.length ; i ++) {
      let node = nodes.childNodes.item(i);
      if (isElement(node)) {
        if (options?.role !== undefined) {
          let classNames = node.getAttribute("class")?.split(" ") ?? [];
          let nextClassNames = [...classNames.filter((className) => !ZOTICA_ROLES.includes(className)), options.role];
          node.setAttribute("class", nextClassNames.join(" "));
        }
        if (options?.className !== undefined) {
          node.setAttribute("class", (node.getAttribute("class") ?? "") + options.className);
        }
        if (options?.style !== undefined) {
          node.setAttribute("style", (node.getAttribute("style") ?? "") + options.style);
        }
      }
    }
  }

  // TODO: フォントデータの設計を決めたら実装してください。
  private modifyVerticalMargins(element: Element, fontType: ZoticaFontType, options?: {}): void {
  }

}