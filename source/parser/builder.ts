//

import {
  BaseBuilder
} from "@zenml/zenml";
import {
  ZoticaFont
} from "../font/font";
import {
  addAttribute,
  getChildElement,
  insertFirst,
  isElement
} from "../util/dom";


export const ZOTICA_ROLES = ["bin", "rel", "sbin", "srel", "del", "fun", "not", "ord", "lpar", "rpar", "cpar"];

export type ZoticaRole = "bin" | "rel" | "sbin" | "srel" | "del" | "fun" | "not" | "ord" | "lpar" | "rpar" | "cpar";
export type ZoticaIdentifierType = "bf" | "rm" | "tt" | "fun" | "alt";
export type ZoticaOperatorType = ZoticaRole | "txt" | "sml";
export type ZoticaStrutType = "upper" | "dupper" | "lower" | "dlower" | "dfull";
export type ZoticaTableType = "std" | "mat" | "cas" | "stk" | "diag";
export type ZoticaSpaceType = string;
export type ZoticaPhantomType = "bth" | "ver" | "hor";
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
export type ZoticaAccentCallback = (baseElement: Element) => void;
export type ZoticaWideCallback = (baseElement: Element) => void;
export type ZoticaTableCallback = (tableElement: Element) => void;
export type ZoticaTableCellCallback = (cellElement: Element) => void;
export type ZoticaDiagramCallback = (diagramElement: Element) => void;
export type ZoticaDiagramVertexCallback = (vertexElement: Element) => void;
export type ZoticaArrowCallback = (labelElement: Element) => void;
export type ZoticaTreeCallback = (contentElement: Element) => void;
export type ZoticaTreeAxiomCallback = (contentElement: Element) => void;
export type ZoticaTreeInferenceCallback = (contentElement: Element, rightLabelElement: Element, leftLabelElement: Element) => void;
export type ZoticaGroupCallback = (contentElement: Element) => void;
export type ZoticaPhantomCallback = (contentElement: Element) => void;

export type ZoticaArrowSettings = {
  startPosition: string,
  endPosition: string,
  tipKinds?: string,
  bendAngle?: string,
  shift?: string,
  lineCount?: string,
  dashed?: boolean,
  labelPosition?: string,
  inverted?: boolean,
  mark?: boolean
};
export type ZoticaGroupSettings = {
  rotate?: number
};
export type ZoticaBuilderOptions = {
  role?: ZoticaRole,
  className?: string,
  style?: string,
  fonts: {main: ZoticaFont, math: ZoticaFont}
};


export class ZoticaBuilder extends BaseBuilder<Document> {

  public constructor(document: Document) {
    super(document);
  }

  public buildNumber(content: string, options: ZoticaBuilderOptions): DocumentFragment {
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

  public buildIdentifier(content: string, types: Array<ZoticaIdentifierType | string>, options: ZoticaBuilderOptions): DocumentFragment {
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

  public buildOperator(symbol: string, types: Array<ZoticaOperatorType | string>, options: ZoticaBuilderOptions): DocumentFragment {
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

  public buildText(content: string, options: ZoticaBuilderOptions): DocumentFragment {
    let self = this.createDocumentFragment();
    this.appendElement(self, "math-text", (self) => {
      this.appendTextNode(self, content);
    });
    this.applyOptions(self, options);
    return self;
  }

  public buildStrut(type: ZoticaStrutType, options: ZoticaBuilderOptions): DocumentFragment {
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

  private insertStrut(element: Element, type: ZoticaStrutType, options: ZoticaBuilderOptions): void {
    insertFirst(element, this.buildStrut(type, options).childNodes[0]);
  }

  public buildSubsuper(options: ZoticaBuilderOptions, callback?: ZoticaSubsuperCallback): DocumentFragment {
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

  public buildUnderover(options: ZoticaBuilderOptions, callback?: ZoticaUnderoverCallback): DocumentFragment {
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

  public buildFraction(options: ZoticaBuilderOptions, callback?: ZoticaFractionCallback): DocumentFragment {
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

  private modifyFraction(numeratorElement: Element, denominatorElement: Element, options: ZoticaBuilderOptions): void {
    this.insertStrut(numeratorElement, "dlower", options);
    this.insertStrut(denominatorElement, "upper", options);
  }

  public buildRadical(symbol: string, modify: boolean, options: ZoticaBuilderOptions, callback?: ZoticaRadicalCallback): DocumentFragment {
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

  private modifyRadical(contentElement: Element, indexElement: Element, options: ZoticaBuilderOptions): void {
    this.insertStrut(contentElement, "upper", options);
    if (indexElement.childNodes.length <= 0) {
      indexElement.parentNode!.removeChild(indexElement);
    }
  }

  public buildIntegral(symbol: string, size: ZoticaSymbolSize, options: ZoticaBuilderOptions, callback?: ZoticaIntegralCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let baseElement = null as Element | null;
    let subElement = null as Element | null;
    let superElement = null as Element | null;
    this.appendElement(self, "math-subsup", (self) => {
      self.setAttribute("class", "int");
      if (size !== "lrg") {
        addAttribute(self, "class", ` ${size}`);
      }
      this.appendElement(self, "math-base", (self) => {
        baseElement = self;
        this.appendElement(self, "math-o", (self) => {
          self.setAttribute("class", "int");
          if (size !== "lrg") {
            addAttribute(self, "class", ` ${size}`);
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

  public buildSum(symbol: string, size: ZoticaSymbolSize, options: ZoticaBuilderOptions, callback?: ZoticaSumCallback): DocumentFragment {
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

  public buildFence(leftKind: string, rightKind: string, leftSymbol: string, rightSymbol: string, modify: boolean, options: ZoticaBuilderOptions, callback?: ZoticaFenceCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let contentElement = null as Element | null;
    this.appendElement(self, "math-fence", (self) => {
      self.setAttribute("class", "par");
      if (modify) {
        addAttribute(self, "class", " mod");
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

  public buildSet(leftKind: string, rightKind: string, centerKind: string, leftSymbol: string, rightSymbol: string, centerSymbol: string, modify: boolean, options: ZoticaBuilderOptions, callback?: ZoticaSetCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let leftElement = null as Element | null;
    let rightElement = null as Element | null;
    this.appendElement(self, "math-fence", (self) => {
      self.setAttribute("class", "par");
      if (modify) {
        addAttribute(self, "class", " mod");
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

  public buildAccent(underSymbol: string | null, overSymbol: string | null, options: ZoticaBuilderOptions, callback?: ZoticaAccentCallback): DocumentFragment {
    let self = this.document.createDocumentFragment();
    let baseElement = null as Element | null;
    let underElement = null as Element | null;
    let overElement = null as Element | null;
    let mainElement = null as Element | null;
    this.appendElement(self, "math-underover", (self) => {
      mainElement = self;
      self.setAttribute("class", "acc");
      this.appendElement(self, "math-over", (self) => {
        overElement = self;
        if (overSymbol !== null) {
          this.appendElement(self, "math-o", (self) => {
            self.setAttribute("class", "acc");
            this.appendTextNode(self, overSymbol);
          });
        }
      });
      this.appendElement(self, "math-basewrap", (self) => {
        this.appendElement(self, "math-base", (self) => {
          baseElement = self;
        });
        this.appendElement(self, "math-under", (self) => {
          underElement = self;
          if (underSymbol !== null) {
            this.appendElement(self, "math-o", (self) => {
              self.setAttribute("class", "acc");
              this.appendTextNode(self, underSymbol);
            });
          }
        });
      });
    });
    this.applyOptions(self, options);
    callback?.(baseElement!);
    this.inheritRole(mainElement!, baseElement!);
    this.modifyUnderover(underElement!, overElement!);
    this.modifyAccent(baseElement!, underElement!, overElement!);
    return self;
  }

  private modifyAccent(baseElement: Element, underElement: Element, overElement: Element): void {
    let children = baseElement.childNodes;
    if (children.length === 1) {
      let child = children.item(0);
      if (isElement(child)) {
        let classNames = child.getAttribute("class")?.split(" ") ?? [];
        if (child.tagName === "math-i" && classNames.every((className) => className !== "rm" && className !== "alt")) {
          let underSymbolElement = underElement.childNodes.item(0);
          let overSymbolElement = overElement.childNodes.item(0);
          if (underSymbolElement && isElement(underSymbolElement)) {
            addAttribute(underSymbolElement, "class", " it");
          }
          if (overSymbolElement && isElement(overSymbolElement)) {
            addAttribute(overSymbolElement, "class", " it");
          }
        }
      }
    }
  }

  public buildWide(kind: string, underSymbol: string | null, overSymbol: string | null, modify: boolean, options: ZoticaBuilderOptions, callback?: ZoticaWideCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let baseElement = null as Element | null;
    let underElement = null as Element | null;
    let overElement = null as Element | null;
    let mainElement = null as Element | null;
    this.appendElement(self, "math-underover", (self) => {
      mainElement = self;
      self.setAttribute("class", "wid");
      if (modify) {
        addAttribute(self, "class", " mod");
        self.setAttribute("data-kind", kind);
      }
      this.appendElement(self, "math-over", (self) => {
        overElement = self;
        if (overSymbol !== null) {
          this.appendElement(self, "math-o", (self) => {
            self.setAttribute("class", "wid");
            this.appendTextNode(self, overSymbol);
          });
        }
      });
      this.appendElement(self, "math-basewrap", (self) => {
        this.appendElement(self, "math-base", (self) => {
          baseElement = self;
        });
        this.appendElement(self, "math-under", (self) => {
          underElement = self;
          if (underSymbol !== null) {
            this.appendElement(self, "math-o", (self) => {
              self.setAttribute("class", "wid");
              this.appendTextNode(self, underSymbol);
            });
          }
        });
      });
    });
    this.applyOptions(self, options);
    callback?.(baseElement!);
    this.inheritRole(mainElement!, baseElement!);
    this.modifyUnderover(underElement!, overElement!);
    return self;
  }

  public buildTable(type: ZoticaTableType | string, alignCharsString: string | null, raw: boolean, options: ZoticaBuilderOptions, callback?: ZoticaTableCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let tableElement = null as Element | null;
    this.appendElement(self, "math-table", (self) => {
      self.setAttribute("class", type);
      tableElement = self;
    });
    this.applyOptions(self, options);
    callback?.(tableElement!);
    this.modifyTable(tableElement!, type, alignCharsString, raw, options);
    return self;
  }

  private modifyTable(tableElement: Element, type: ZoticaTableType | string, alignCharsString: string | null, raw: boolean, options: ZoticaBuilderOptions): void {
    let alignChars = (alignCharsString !== null) ? [...alignCharsString] : null;
    let children = Array.from(tableElement.childNodes).filter((child) => isElement(child)) as Array<Element>;
    let column = 0;
    let row = 0;
    for (let index = 0 ; index < children.length ; index ++) {
      let child = children[index];
      if (child.tagName === "math-cell" || child.tagName === "math-cellwrap") {
        if (raw) {
          let extraClass = "";
          if (column !== 0) {
            extraClass += " lpres";
          }
          if (children[index + 1]?.tagName !== "math-sys-br") {
            extraClass += " rpres";
          }
          addAttribute(child, "class", ` ${extraClass}`);
        }
        addAttribute(child, "style", `grid-row: ${row + 1}; grid-column: ${column + 1};`);
        if (alignChars !== null) {
          let alignChar = alignChars[column];
          let align = (alignChar === "c") ? "center" : (alignChar === "r") ? "right" : "left";
          addAttribute(child, "style", `text-align: ${align};`);
        }
        if (type !== "stk" && type !== "diag") {
          this.insertStrut(child, "dfull", options);
        }
        column ++;
      } else if (child.tagName === "math-sys-br") {
        tableElement.removeChild(child);
        row ++;
        column = 0;
      }
    }
  }

  public buildTableCell(options: ZoticaBuilderOptions, callback?: ZoticaTableCellCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let cellElement = null as Element | null;
    this.appendElement(self, "math-cell", (self) => {
      cellElement = self;
    });
    this.applyOptions(self, options);
    callback?.(cellElement!);
    return self;
  }

  public buildTableBreak(options: ZoticaBuilderOptions): DocumentFragment {
    let self = this.createDocumentFragment();
    this.appendElement(self, "math-sys-br");
    return self;
  }

  public buildDiagram(verticalGapsString: string | null, horizontalGapsString: string | null, alignBaseline: boolean, options: ZoticaBuilderOptions, callback?: ZoticaDiagramCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let diagramElement = null as Element | null;
    this.appendElement(self, "math-diagram", (self) => {
      diagramElement = self;
      if (verticalGapsString !== null) {
        addAttribute(self, "class", " vnon");
      }
      if (horizontalGapsString !== null) {
        addAttribute(self, "class", " hnon");
      }
      if (alignBaseline) {
        addAttribute(self, "class", " baseline");
      }
    });
    this.applyOptions(self, options);
    callback?.(diagramElement!);
    this.modifyDiagram(diagramElement!, verticalGapsString, horizontalGapsString);
    this.modifyTable(diagramElement!, "diag", null, false, options);
    return self;
  }

  private modifyDiagram(diagramElement: Element, verticalGapsString: string | null, horizontalGapsString: string | null): void {
    let children = Array.from(diagramElement.childNodes).filter((child) => isElement(child)) as Array<Element>;
    let verticalGaps = verticalGapsString?.split(/\s*,\s*/) ?? null;
    let horizontalGaps = horizontalGapsString?.split(/\s*,\s*/) ?? null;
    let column = 0;
    let row = 0;
    for (let child of children) {
      if (child.tagName === "math-cellwrap") {
        let verticalGap = (verticalGaps !== null) ? verticalGaps[row - 1] ?? verticalGaps[verticalGaps.length - 1] : null;
        let horizontalGap = (horizontalGaps !== null) ? horizontalGaps[column - 1] ?? horizontalGaps[horizontalGaps.length - 1] : null;
        if (verticalGap !== null && row > 0) {
          if (verticalGap.match(/^\-?\d+$/)) {
            addAttribute(child, "style", `margin-top: ${parseInt(verticalGap) / 18}em;`);
          } else {
            addAttribute(child, "class", ` v${verticalGap}`);
          }
        }
        if (horizontalGap !== null && column > 0) {
          if (horizontalGap.match(/^\-?\d+$/)) {
            addAttribute(child, "style", `margin-left: ${parseInt(horizontalGap) / 18}em;`);
          } else {
            addAttribute(child, "class", ` h${horizontalGap}`);
          }
        }
        column ++;
      } else if (child.tagName === "math-sys-br") {
        row ++;
        column = 0;
      }
    }
  }

  public buildDiagramVertex(name: string | null, options: ZoticaBuilderOptions, callback?: ZoticaDiagramVertexCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let vertexElement = null as Element | null;
    this.appendElement(self, "math-cellwrap", (self) => {
      if (name !== null) {
        self.setAttribute("data-name", name);
      }
      this.appendElement(self, "math-cell", (self) => {
        vertexElement = self;
      });
    });
    this.applyOptions(self, options);
    callback?.(vertexElement!);
    return self;
  }

  public buildArrow(name: string | null, settings: ZoticaArrowSettings, options: ZoticaBuilderOptions, callback?: ZoticaArrowCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let labelElement = null as Element | null;
    this.appendElement(self, "math-arrow", (self) => {
      labelElement = self;
      self.setAttribute("data-start", settings.startPosition);
      self.setAttribute("data-end", settings.endPosition);
      if (settings.tipKinds !== undefined) {
        self.setAttribute("data-tip", settings.tipKinds);
      }
      if (settings.bendAngle !== undefined) {
        self.setAttribute("data-bend", settings.bendAngle);
      }
      if (settings.shift !== undefined) {
        self.setAttribute("data-shift", settings.shift);
      }
      if (settings.lineCount !== undefined) {
        self.setAttribute("data-line", settings.lineCount);
      }
      if (settings.dashed) {
        self.setAttribute("data-dash", "data-dash");
      }
      if (settings.labelPosition !== undefined) {
        self.setAttribute("data-pos", settings.labelPosition);
      }
      if (settings.inverted) {
        self.setAttribute("data-inv", "data-inv");
      }
      if (settings.mark) {
        self.setAttribute("data-mark", "data-mark");
      }
      if (name !== null) {
        self.setAttribute("data-name", name);
      }
    });
    this.applyOptions(self, options);
    callback?.(labelElement!);
    return self;
  }

  public buildTree(options: ZoticaBuilderOptions, callback?: ZoticaTreeCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let contentElement = null as Element | null;
    this.appendElement(self, "math-tree", (self) => {
      contentElement = self;
    });
    this.applyOptions(self, options);
    callback?.(contentElement!);
    this.modifyTree(contentElement!, options);
    return self;
  }

  private modifyTree(element: Element, options: ZoticaBuilderOptions): void {
    let stack = [];
    let children = Array.from(element.childNodes).filter((child) => isElement(child)) as Array<Element>;
    for (let child of children) {
      if (child.tagName === "math-axiom") {
        this.insertStrut(child, "dlower", options);
        stack.push(child);
      } else if (child.tagName === "math-sys-infer") {
        let number = parseInt(child.getAttribute("data-num") ?? "0");
        let leftLabelElement = getChildElement(child, "math-sys-llabel")!;
        let rightLabelElement = getChildElement(child, "math-sys-rlabel")!;
        let antecedentElements = (number > 0) ? stack.splice(-number) : [];
        let inferenceElement = this.createElement("math-infer", (self) => {
          this.appendElement(self, "math-label", (self) => {
            let leftLabelChildren = Array.from(leftLabelElement.childNodes);
            if (leftLabelChildren.length <= 0) {
              self.setAttribute("class", "non");
            }
            for (let leftLabelChild of leftLabelChildren) {
              self.appendChild(leftLabelChild);
            }
          });
          this.appendElement(self, "math-step", (self) => {
            this.appendElement(self, "math-ant", (self) => {
              for (let antecedentElement of antecedentElements) {
                self.appendChild(antecedentElement);
              }
            });
            this.appendElement(self, "math-conwrap", (self) => {
              this.appendElement(self, "math-line");
              this.appendElement(self, "math-con", (self) => {
                let contentElement = getChildElement(child, "math-cont")!;
                self.appendChild(contentElement);
                this.insertStrut(self, "dlower", options);
                this.insertStrut(self, "upper", options);
              });
            });
          });
          this.appendElement(self, "math-label", (self) => {
            let rightLabelChildren = Array.from(rightLabelElement.childNodes);
            if (rightLabelChildren.length <= 0) {
              self.setAttribute("class", "non");
            }
            for (let rightLabelChild of rightLabelChildren) {
              self.appendChild(rightLabelChild);
            }
          });
        });
        stack.push(inferenceElement);
      }
    }
    while (element.firstChild !== null) {
      element.removeChild(element.firstChild);
    }
    if (stack.length > 0) {
      element.appendChild(stack[0]);
    }
  }

  public buildTreeAxiom(options: ZoticaBuilderOptions, callback?: ZoticaTreeAxiomCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let contentElement = null as Element | null;
    this.appendElement(self, "math-axiom", (self) => {
      contentElement = self;
    });
    this.applyOptions(self, options);
    callback?.(contentElement!);
    return self;
  }

  public buildTreeInference(number: number, options: ZoticaBuilderOptions, callback?: ZoticaTreeInferenceCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let contentElement = null as Element | null;
    let rightLabelElement = null as Element | null;
    let leftLabelElement = null as Element | null;
    this.appendElement(self, "math-sys-infer", (self) => {
      self.setAttribute("data-num", number.toString());
      this.appendElement(self, "math-cont", (self) => {
        contentElement = self;
      });
      this.appendElement(self, "math-sys-rlabel", (self) => {
        rightLabelElement = self;
      });
      this.appendElement(self, "math-sys-llabel", (self) => {
        leftLabelElement = self;
      });
    });
    this.applyOptions(self, options);
    callback?.(contentElement!, rightLabelElement!, leftLabelElement!);
    return self;
  }

  public buildGroup(settings: ZoticaGroupSettings, options: ZoticaBuilderOptions, callback?: ZoticaGroupCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let contentElement = null as Element | null;
    this.appendElement(self, "math-group", (self) => {
      contentElement = self;
      let transforms = [];
      if (settings.rotate !== undefined) {
        transforms.push(`rotate(${settings.rotate}deg)`);
      }
      if (transforms.length > 0) {
        addAttribute(self, "style", "transform: " + transforms.join(" ") + ";");
      }
    });
    this.applyOptions(self, options);
    callback?.(contentElement!);
    return self;
  }

  public buildSpace(type: ZoticaSpaceType | string, options: ZoticaBuilderOptions): DocumentFragment {
    let self = this.createDocumentFragment();
    this.appendElement(self, "math-space", (self) => {
      if (type.match(/^\-?\d+$/)) {
        addAttribute(self, "style", `margin-left: ${parseInt(type) / 18}em !important;`);
      } else {
        if (type.startsWith("-")) {
          self.setAttribute("class", type.replace(/^\-/, "m"));
        } else {
          self.setAttribute("class", type);
        }
      }
    });
    this.applyOptions(self, options);
    return self;
  }

  public buildPhantom(type: ZoticaPhantomType | string, options: ZoticaBuilderOptions, callback?: ZoticaPhantomCallback): DocumentFragment {
    let self = this.createDocumentFragment();
    let contentElement = null as Element | null;
    this.appendElement(self, "math-phantom", (self) => {
      contentElement = self;
      self.setAttribute("class", "lpres rpres");
      if (type !== "bth") {
        addAttribute(self, "class", ` ${type}`);
      }
    });
    this.applyOptions(self, options);
    callback?.(contentElement!);
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
          if (targetClasses.every((className) => !ZOTICA_ROLES.includes(className))) {
            targetElement.setAttribute("class", [...targetClasses, sourceRole].join(" "));
          }
        }
      }
    }
  }

  private applyOptions(nodes: DocumentFragment, options: ZoticaBuilderOptions): void {
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

  private modifyVerticalMargins(element: Element, fontType: ZoticaFontType, options: ZoticaBuilderOptions): void {
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