// @ts-nocheck

import ZOTICA_DATA_JSON from "../../data/data.json";
import {
  getChildElement,
  getFontSize,
  getHeight,
  getWidth
} from "./util";


export default function modify(element: HTMLElement): void {
  const squareElement = getChildElement(element, "math-sqrt");
  const indexElement = getChildElement(element, "math-index");
  const surdElement = getChildElement(squareElement, "math-surd");
  const contentElement = getChildElement(squareElement, "math-cont");
  const surdSymbolElement = surdElement.children[0];
  const stretchLevel = calcLevel(contentElement);
  surdSymbolElement.textContent = ZOTICA_DATA_JSON.radical[stretchLevel];
  if (indexElement) {
    modifyIndex(element, indexElement);
  }
}

function modifyIndex(element: Element, indexElement: HTMLElement): void {
  const width = getWidth(indexElement);
  const fontRatio = getFontSize(element) / getFontSize(indexElement);
  if (width / fontRatio < 0.5) {
    const margin = 0.5 * fontRatio - width;
    indexElement.style.marginLeft = "" + margin + "em";
  }
}

function calcLevel(element: Element): number {
  const heightAbs = getHeight(element) * 1000;
  let level = null;
  for (let i = 0 ; i <= 3 ; i ++) {
    if (heightAbs <= ZOTICA_DATA_JSON.radical.height[i]) {
      level = i;
      break;
    }
  }
  if (level === null) {
    level = 3;
  }
  return level;
}