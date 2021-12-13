// @ts-nocheck

import ZOTICA_DATA_JSON from "../../data/data.json";
import {
  getChildElement,
  getFontSize,
  getOffsetLeft,
  getOffsetRight,
  getWidth
} from "./util";


export default function modify(element: HTMLElement): void {
  let antecendentContainerElement = getChildElement(element, "math-ant");
  let firstAntecedentElement = antecendentContainerElement.children[0];
  let lastAntecedentElement = antecendentContainerElement.children[antecendentContainerElement.children.length - 1];
  let firstContentElement = calcContentElement(firstAntecedentElement);
  let lastContentElement = calcContentElement(lastAntecedentElement);
  let leftLabelElement = element.previousElementSibling;
  let rightLabelElement = element.nextElementSibling;
  let consequentWrapperElement = getChildElement(element, "math-conwrap");
  let lineElement = getChildElement(consequentWrapperElement, "math-line");
  let consequentElement = getChildElement(consequentWrapperElement, "math-con");
  let contentElement = getChildElement(consequentElement, "math-cont");
  let fontRatio = getFontSize(element) / getFontSize(leftLabelElement);
  let leftLabelWidth = getWidth(leftLabelElement, element);
  let rightLabelWidth = getWidth(rightLabelElement, element);
  let contentWidth = getWidth(contentElement);
  let wholeWidth = getWidth(element);
  let leftExtrusion = 0;
  let rightExtrusion = 0;
  if (firstContentElement && firstContentElement.localName !== "math-axiom") {
    leftExtrusion = getOffsetLeft(firstContentElement);
  }
  if (lastContentElement && lastContentElement.localName !== "math-axiom") {
    rightExtrusion = getOffsetRight(lastContentElement);
  }
  let lineWidth = wholeWidth - leftExtrusion - rightExtrusion;
  let leftMargin = (lineWidth - contentWidth) / 2 + leftExtrusion;
  consequentElement.style.setProperty("margin-left", "" + leftMargin + "em");
  if (leftExtrusion > getOffsetLeft(contentElement) - leftLabelWidth) {
    leftExtrusion = getOffsetLeft(contentElement) - leftLabelWidth;
  }
  if (rightExtrusion > getOffsetRight(contentElement) - rightLabelWidth) {
    rightExtrusion = getOffsetRight(contentElement) - rightLabelWidth;
  }
  lineWidth = wholeWidth - leftExtrusion - rightExtrusion;
  lineElement.style.setProperty("width", "" + lineWidth + "em", "important");
  lineElement.style.setProperty("margin-left", "" + leftExtrusion + "em", "important");
  element.style.setProperty("margin-right", "" + (-rightExtrusion) + "em", "important");
  if (rightLabelWidth < rightExtrusion) {
    rightLabelElement.style.setProperty("margin-right", "" + ((rightExtrusion - rightLabelWidth) * fontRatio) + "em", "important");
  }
  element.style.setProperty("margin-left", "" + (-leftExtrusion) + "em", "important");
  if (leftLabelWidth < leftExtrusion) {
    leftLabelElement.style.setProperty("margin-left", "" + ((leftExtrusion - leftLabelWidth) * fontRatio) + "em", "important");
  }
}

function calcContentElement(antecedentElement: Element): Element {
  let contentElement = null;
  if (antecedentElement) {
    if (antecedentElement.localName === "math-axiom") {
      contentElement = antecedentElement;
    } else {
      let stepElement = getChildElement(antecedentElement, "math-step");
      let consequenceWrapperElement = getChildElement(stepElement, "math-conwrap");
      let consequentElement = getChildElement(consequenceWrapperElement, "math-con");
      contentElement = getChildElement(consequentElement, "math-cont");
    }
  }
  return contentElement;
}