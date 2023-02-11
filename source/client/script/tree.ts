// @ts-nocheck

import {
  getChildElement,
  getFontSize,
  getOffsetLeft,
  getOffsetRight,
  getWidth
} from "./util";


export default function modify(element: HTMLElement): void {
  const antecendentContainerElement = getChildElement(element, "math-ant");
  const firstAntecedentElement = antecendentContainerElement.children[0];
  const lastAntecedentElement = antecendentContainerElement.children[antecendentContainerElement.children.length - 1];
  const firstContentElement = calcContentElement(firstAntecedentElement);
  const lastContentElement = calcContentElement(lastAntecedentElement);
  const leftLabelElement = element.previousElementSibling;
  const rightLabelElement = element.nextElementSibling;
  const consequentWrapperElement = getChildElement(element, "math-conwrap");
  const lineElement = getChildElement(consequentWrapperElement, "math-line");
  const consequentElement = getChildElement(consequentWrapperElement, "math-con");
  const contentElement = getChildElement(consequentElement, "math-cont");
  const fontRatio = getFontSize(element) / getFontSize(leftLabelElement);
  const leftLabelWidth = getWidth(leftLabelElement, element);
  const rightLabelWidth = getWidth(rightLabelElement, element);
  const contentWidth = getWidth(contentElement);
  const wholeWidth = getWidth(element);
  let leftExtrusion = 0;
  let rightExtrusion = 0;
  if (firstContentElement && firstContentElement.localName !== "math-axiom") {
    leftExtrusion = getOffsetLeft(firstContentElement);
  }
  if (lastContentElement && lastContentElement.localName !== "math-axiom") {
    rightExtrusion = getOffsetRight(lastContentElement);
  }
  let lineWidth = wholeWidth - leftExtrusion - rightExtrusion;
  const leftMargin = (lineWidth - contentWidth) / 2 + leftExtrusion;
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
      const stepElement = getChildElement(antecedentElement, "math-step");
      const consequenceWrapperElement = getChildElement(stepElement, "math-conwrap");
      const consequentElement = getChildElement(consequenceWrapperElement, "math-con");
      contentElement = getChildElement(consequentElement, "math-cont");
    }
  }
  return contentElement;
}