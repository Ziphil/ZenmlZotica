//

import {
  BaseBuilder,
  NodeLikeOf
} from "@zenml/zenml";
import {
  ZoticaFont
} from "../font/font";
import {
  insertFirst,
  isElement
} from "../util/dom";


export const ZOTICA_ROLES = ["bin", "rel", "sbin", "srel", "del", "fun", "not", "ord", "lpar", "rpar", "cpar"];

export type ZoticaRole = "bin" | "rel" | "sbin" | "srel" | "del" | "fun" | "not" | "ord" | "lpar" | "rpar" | "cpar";
export type ZoticaIdentifierType = "bf" | "rm" | "tt" | "fun" | "alt";
export type ZoticaOperatorType = ZoticaRole | "txt" | "sml";
export type ZoticaStrutType = "upper" | "dupper" | "lower" | "dlower" | "dfull";
export type ZoticaFontType = "main" | "math";
export type ZoticaSymbolSize = "inl" | "lrg";

export type ZoticaSubsuperCallback = (baseElement: Element, subElement: Element, superElement: Element, leftSubElement: Element, leftSuperElement: Element) => void;
export type ZoticaUnderoverCallback = (baseElement: Element, underElement: Element, overElement: Element) => void;
export type ZoticaFractionCallback = (numeratorElement: Element, denominatorElement: Element) => void;
export type ZoticaRadicalCallback = (contentElement: Element, indexElement: Element) => void;
export type ZoticaIntegralCallback = (subElement: Element, superElement: Element) => void;
export type ZoticaSumCallback = (underElement: Element, overElement: Element) => void;
export type ZoticaFenceCallback = (contentElement: Element) => void;
export type ZoticaSetCallback = (leftElement: Element, rightElement: Element) => void;

export type ZoticaCommonOptions = {
  role?: ZoticaRole,
  className?: string,
  style?: string,
  fonts: {main: ZoticaFont, math: ZoticaFont}
};


export class ZoticaBuilder extends BaseBuilder<Document> {

  public constructor(document: Document) {
    super(document);
  }

  public buildNumber(content: string, options: ZoticaCommonOptions): DocumentFragment {
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

  public buildIdentifier(content: string, types: Array<ZoticaIdentifierType | string>, options: ZoticaCommonOptions): DocumentFragment {
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

  public buildOperator(symbol: string, types: Array<ZoticaOperatorType | string>, options: ZoticaCommonOptions): DocumentFragment {
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

  public buildText(content: string, options: ZoticaCommonOptions): DocumentFragment {
    let self = this.createDocumentFragment();
    this.appendElement(self, "math-text", (self) => {
      this.appendTextNode(self, content);
    });
    this.applyOptions(self, options);
    return self;
  }

  public buildStrut(type: ZoticaStrutType, options: ZoticaCommonOptions): DocumentFragment {
    let self = this.createDocumentFragment();
    this.appendElement(self, "math-strut", (self) => {
      let style = self.getAttribute("style") ?? "";
      let [bottomMargin, topMargin] = options.fonts.main.getMetrics(72) ?? [0, 0];
      if (type === "upper" || type === "dupper") {
        style += "margin-bottom: -0.5em;";
      } else if (type === "dlower" || type === "dfull") {
        style += "margin-bottom: -0em;";
      } else {
        style += `margin-bottom: ${bottomMargin}em;`;
      }
      if (type === "lower" || type === "dlower") {
        style += "margin-top: -0.5em;";
      } else if (type === "dupper" || type === "dfull") {
        style += "margin-top: -0em;";
      } else {
        style += `margin-top: ${topMargin}em;`;
      }
      self.setAttribute("style", style);
      this.appendElement(self, "math-text", (self) => {
        self.setAttribute("style", (self.getAttribute("style") ?? "") + "line-height: 1;");
        this.appendTextNode(self, " ");
      });
    });
    this.applyOptions(self, options);
    return self;
  }

  private insertStrut(element: Element, type: ZoticaStrutType, options: ZoticaCommonOptions): void {
    insertFirst(element, this.buildStrut(type, options).childNodes[0]);
  }

  public buildSubsuper(options: ZoticaCommonOptions, callback?: ZoticaSubsuperCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let baseElement = null as Element | null;
    let subElement = null as Element | null;
    let superElement = null as Element | null;
    let leftSubElement = null as Element | null;
    let leftSuperElement = null as Element | null;
    let mainElement = null as Element | null;
    this.appendElement(self, "math-subsup", (self) => {
      mainElement = self;
      this.appendElement(self, "math-lsub", (self) => {
        leftSubElement = self;
      });
      this.appendElement(self, "math-lsup", (self) => {
        leftSuperElement = self;
      });
      this.appendElement(self, "math-base", (self) => {
        baseElement = self;
      });
      this.appendElement(self, "math-sub", (self) => {
        subElement = self;
      });
      this.appendElement(self, "math-sup", (self) => {
        superElement = self;
      });
    });
    this.applyOptions(self, options);
    callback?.(baseElement!, subElement!, superElement!, leftSubElement!, leftSuperElement!);
    this.inheritRole(mainElement!, baseElement!);
    this.modifySubsuper(baseElement!, subElement!, superElement!, leftSubElement!, leftSuperElement!);
    return self;
  }

  private modifySubsuper(baseElement: Element, subElement: Element, superElement: Element, leftSubElement?: Element, leftSuperElement?: Element): void {
    if (subElement.childNodes.length <= 0) {
      subElement.parentNode!.removeChild(subElement);
    }
    if (superElement.childNodes.length <= 0) {
      superElement.parentNode!.removeChild(superElement);
    }
    if (leftSubElement !== undefined && leftSubElement.childNodes.length <= 0) {
      leftSubElement.parentNode!.removeChild(leftSubElement);
    }
    if (leftSuperElement !== undefined && leftSuperElement.childNodes.length <= 0) {
      leftSuperElement.parentNode!.removeChild(leftSuperElement);
    }
  }

  public buildUnderover(options: ZoticaCommonOptions, callback?: ZoticaUnderoverCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let baseElement = null as Element | null;
    let underElement = null as Element | null;
    let overElement = null as Element | null;
    let mainElement = null as Element | null;
    this.appendElement(self, "math-underover", (self) => {
      mainElement = self;
      this.appendElement(self, "math-over", (self) => {
        overElement = self;
      });
      this.appendElement(self, "math-basewrap", (self) => {
        this.appendElement(self, "math-base", (self) => {
          baseElement = self;
        });
        this.appendElement(self, "math-under", (self) => {
          underElement = self;
        });
      });
    });
    this.applyOptions(self, options);
    callback?.(baseElement!, underElement!, overElement!);
    this.inheritRole(mainElement!, baseElement!);
    this.modifyUnderover(underElement!, overElement!);
    return self;
  }

  private modifyUnderover(underElement: Element, overElement: Element): void {
    if (underElement.childNodes.length <= 0) {
      underElement.parentNode!.removeChild(underElement);
    }
    if (overElement.childNodes.length <= 0) {
      overElement.parentNode!.removeChild(overElement);
    }
  }

  public buildFraction(options: ZoticaCommonOptions, callback?: ZoticaFractionCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let numeratorElement = null as Element | null;
    let denominatorElement = null as Element | null;
    this.appendElement(self, "math-frac", (self) => {
      this.appendElement(self, "math-num", (self) => {
        numeratorElement = self;
      });
      this.appendElement(self, "math-denwrap", (self) => {
        this.appendElement(self, "math-line");
        this.appendElement(self, "math-den", (self) => {
          denominatorElement = self;
        });
      });
    });
    this.applyOptions(self, options);
    callback?.(numeratorElement!, denominatorElement!);
    this.modifyFraction(numeratorElement!, denominatorElement!, options);
    return self;
  }

  private modifyFraction(numeratorElement: Element, denominatorElement: Element, options: ZoticaCommonOptions): void {
    this.insertStrut(numeratorElement, "dlower", options);
    this.insertStrut(denominatorElement, "upper", options);
  }

  public buildRadical(symbol: string, modify: boolean, options: ZoticaCommonOptions, callback?: ZoticaRadicalCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let contentElement = null as Element | null;
    let indexElement = null as Element | null;
    this.appendElement(self, "math-rad", (self) => {
      if (modify) {
        self.setAttribute("class", "mod");
      }
      this.appendElement(self, "math-index", (self) => {
        indexElement = self;
      });
      this.appendElement(self, "math-sqrt", (self) => {
        this.appendElement(self, "math-surd", (self) => {
          this.appendElement(self, "math-o", (self) => {
            this.appendTextNode(self, symbol);
          });
        });
        this.appendElement(self, "math-cont", (self) => {
          contentElement = self;
        });
      });
    });
    this.applyOptions(self, options);
    callback?.(contentElement!, indexElement!);
    this.modifyRadical(contentElement!, indexElement!, options);
    return self;
  }

  private modifyRadical(contentElement: Element, indexElement: Element, options: ZoticaCommonOptions): void {
    this.insertStrut(contentElement, "upper", options);
    if (indexElement.childNodes.length <= 0) {
      indexElement.parentNode!.removeChild(indexElement);
    }
  }

  public buildIntegral(symbol: string, size: ZoticaSymbolSize, options: ZoticaCommonOptions, callback?: ZoticaIntegralCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let baseElement = null as Element | null;
    let subElement = null as Element | null;
    let superElement = null as Element | null;
    this.appendElement(self, "math-subsup", (self) => {
      self.setAttribute("class", "int");
      if (size !== "lrg") {
        self.setAttribute("class", (self.getAttribute("class") ?? "") + ` ${size}`);
      }
      this.appendElement(self, "math-base", (self) => {
        baseElement = self;
        this.appendElement(self, "math-o", (self) => {
          self.setAttribute("class", "int");
          if (size !== "lrg") {
            self.setAttribute("class", (self.getAttribute("class") ?? "") + ` ${size}`);
          }
          this.appendTextNode(self, symbol);
        });
      });
      this.appendElement(self, "math-sub", (self) => {
        subElement = self;
      });
      this.appendElement(self, "math-sup", (self) => {
        superElement = self;
      });
    });
    this.applyOptions(self, options);
    callback?.(subElement!, superElement!);
    this.modifySubsuper(baseElement!, subElement!, superElement!);
    return self;
  }

  public buildSum(symbol: string, size: ZoticaSymbolSize, options: ZoticaCommonOptions, callback?: ZoticaSumCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    if (size === "lrg") {
      let underElement = null as Element | null;
      let overElement = null as Element | null;
      this.appendElement(self, "math-underover", (self) => {
        self.setAttribute("class", "sum");
        this.appendElement(self, "math-over", (self) => {
          overElement = self;
        });
        this.appendElement(self, "math-basewrap", (self) => {
          this.appendElement(self, "math-base", (self) => {
            this.appendElement(self, "math-o", (self) => {
              self.setAttribute("class", "sum");
              this.appendTextNode(self, symbol);
            });
          });
          this.appendElement(self, "math-under", (self) => {
            underElement = self;
          });
        });
      });
      this.applyOptions(self, options);
      callback?.(underElement!, overElement!);
      this.modifyUnderover(underElement!, overElement!);
    } else {
      let baseElement = null as Element | null;
      let subElement = null as Element | null;
      let superElement = null as Element | null;
      this.appendElement(self, "math-subsup", (self) => {
        self.setAttribute("class", "sum inl");
        this.appendElement(self, "math-base", (self) => {
          baseElement = self;
          this.appendElement(self, "math-o", (self) => {
            self.setAttribute("class", "sum inl");
            this.appendTextNode(self, symbol);
          });
        });
        this.appendElement(self, "math-sub", (self) => {
          subElement = self;
        });
        this.appendElement(self, "math-sup", (self) => {
          superElement = self;
        });
      });
      this.applyOptions(self, options);
      callback?.(subElement!, superElement!);
      this.modifySubsuper(baseElement!, subElement!, superElement!);
    }
    return self;
  }

  public buildFence(leftKind: string, rightKind: string, leftSymbol: string, rightSymbol: string, modify: boolean, options: ZoticaCommonOptions, callback?: ZoticaFenceCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let contentElement = null as Element | null;
    this.appendElement(self, "math-fence", (self) => {
      self.setAttribute("class", "par");
      if (modify) {
        self.setAttribute("class", (self.getAttribute("class") ?? "") + " mod");
        self.setAttribute("data-left", leftKind);
        self.setAttribute("data-right", rightKind);
      }
      this.appendElement(self, "math-left", (self) => {
        this.appendElement(self, "math-o", (self) => {
          this.appendTextNode(self, leftSymbol);
        });
      });
      this.appendElement(self, "math-cont", (self) => {
        contentElement = self;
      });
      this.appendElement(self, "math-right", (self) => {
        this.appendElement(self, "math-o", (self) => {
          this.appendTextNode(self, rightSymbol);
        });
      });
    });
    this.applyOptions(self, options);
    callback?.(contentElement!);
    return self;
  }

  public buildSet(leftKind: string, rightKind: string, centerKind: string, leftSymbol: string, rightSymbol: string, centerSymbol: string, modify: boolean, options: ZoticaCommonOptions, callback?: ZoticaSetCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let leftElement = null as Element | null;
    let rightElement = null as Element | null;
    this.appendElement(self, "math-fence", (self) => {
      self.setAttribute("class", "par");
      if (modify) {
        self.setAttribute("class", (self.getAttribute("class") ?? "") + " mod");
        self.setAttribute("data-left", leftKind);
        self.setAttribute("data-right", rightKind);
        self.setAttribute("data-center", centerKind);
      }
      this.appendElement(self, "math-left", (self) => {
        this.appendElement(self, "math-o", (self) => {
          this.appendTextNode(self, leftSymbol);
        });
      });
      this.appendElement(self, "math-cont", (self) => {
        leftElement = self;
      });
      this.appendElement(self, "math-center", (self) => {
        self.setAttribute("class", "cpar");
        this.appendElement(self, "math-o", (self) => {
          this.appendTextNode(self, centerSymbol);
        });
      });
      this.appendElement(self, "math-cont", (self) => {
        rightElement = self;
      });
      this.appendElement(self, "math-right", (self) => {
        this.appendElement(self, "math-o", (self) => {
          this.appendTextNode(self, rightSymbol);
        });
      });
    });
    this.applyOptions(self, options);
    callback?.(leftElement!, rightElement!);
    return self;
  }

  private inheritRole(targetElement: Element, sourceElement: Element): void {
    let sourceChildren = sourceElement.childNodes;
    if (sourceChildren.length === 1) {
      let sourceChild = sourceChildren.item(0);
      if (isElement(sourceChild)) {
        let sourceClassNames = sourceChild.getAttribute("class")?.split(" ") ?? [];
        let sourceRole = sourceClassNames.find((className) => ZOTICA_ROLES.includes(className));
        if (sourceRole !== undefined) {
          let targetClasses = targetElement.getAttribute("class")?.split(" ") ?? [];
          if (targetClasses.some((className) => ZOTICA_ROLES.includes(className))) {
            targetElement.setAttribute("class", [...targetClasses, sourceRole].join(" "));
          }
        }
      }
    }
  }

  private applyOptions(nodes: DocumentFragment, options: ZoticaCommonOptions): void {
    for (let i = 0 ; i < nodes.childNodes.length ; i ++) {
      let node = nodes.childNodes.item(i);
      if (isElement(node)) {
        if (options.role !== undefined) {
          let classNames = node.getAttribute("class")?.split(" ") ?? [];
          let nextClassNames = [...classNames.filter((className) => !ZOTICA_ROLES.includes(className)), options.role];
          node.setAttribute("class", nextClassNames.join(" "));
        }
        if (options.className !== undefined) {
          node.setAttribute("class", (node.getAttribute("class") ?? "") + options.className);
        }
        if (options.style !== undefined) {
          node.setAttribute("style", (node.getAttribute("style") ?? "") + options.style);
        }
      }
    }
  }

  private modifyVerticalMargins(element: Element, fontType: ZoticaFontType, options: ZoticaCommonOptions): void {
    let content = element.textContent ?? "";
    let maxTopMargin = -2;
    let maxBottomMargin = -2;
    for (let char of content) {
      let codePoint = char.codePointAt(0)!;
      let [bottomMargin, topMargin] = options.fonts[fontType].getMetrics(codePoint) ?? [0, 0];
      if (topMargin > maxTopMargin) {
        maxTopMargin = topMargin;
      }
      if (bottomMargin > maxBottomMargin) {
        maxBottomMargin = bottomMargin;
      }
    }
    let style = element.getAttribute("style") ?? "";
    style += "line-height: 1;";
    style += `margin-top: ${maxTopMargin}em;`;
    style += `margin-bottom: ${maxBottomMargin}em;`;
    element.setAttribute("style", style);
  }

}