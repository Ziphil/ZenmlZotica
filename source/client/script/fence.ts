// @ts-nocheck

import ZOTICA_DATA_JSON from "../../data/data.json";
import {
  getChildElement,
  getChildElements,
  getHeight,
  getLowerHeight,
  getUpperHeight
} from "./util";


export default function modify(element: HTMLElement): void {
  let contentElements = getChildElements(element, "math-cont");
  let leftElement = getChildElement(element, "math-left");
  let rightElement = getChildElement(element, "math-right");
  let centerElement = getChildElement(element, "math-center");
  let parentElements = {left: leftElement, right: rightElement, center: centerElement};
  let kinds = calcKinds(element);
  for (let position of ["left", "right", "center"]) {
    let parentElement = parentElements[position];
    let kind = kinds[position];
    if (position === "center") {
      position = "left";
    }
    if (parentElement && kind !== "none") {
      let level = calcLevel(contentElements, kind, position);
      if (level !== null) {
        modifyStretch(contentElements, parentElement, kind, level, position);
      } else {
        appendStretch(contentElements, parentElement, kind, position);
      }
    }
  }
}

function modifyStretch(contentElements: Array<Element>, parentElement: HTMLElement, kind: string, level: number, position: "left" | "right" | "center"): void {
  let symbolElement = parentElement.children[0];
  let shift = calcShift(contentElements, level);
  symbolElement.textContent = ZOTICA_DATA_JSON.fence[kind][position][level];
  parentElement.style.verticalAlign = "" + shift + "em";
}

function appendStretch(contentElements: Array<Element>, parentElement: Element, kind: string, position: "left" | "right" | "center"): void {
  let stretchElement = document.createElement("math-vstretch");
  let hasStart = !!ZOTICA_DATA_JSON.fence[kind][position].start;
  let hasEnd = !!ZOTICA_DATA_JSON.fence[kind][position].end;
  let hasMiddle = !!ZOTICA_DATA_JSON.fence[kind][position].middle;
  let startElement = null;
  let endElement = null;
  let middleElement = null;
  if (hasStart) {
    startElement = document.createElement("math-start");
    startElement.textContent = ZOTICA_DATA_JSON.fence[kind][position].start;
    stretchElement.append(startElement);
  }
  if (hasMiddle) {
    middleElement = document.createElement("math-middle");
    middleElement.textContent = ZOTICA_DATA_JSON.fence[kind][position].middle;
    stretchElement.append(middleElement);
  }
  if (hasEnd) {
    endElement = document.createElement("math-end");
    endElement.textContent = ZOTICA_DATA_JSON.fence[kind][position].end;
    stretchElement.append(endElement);
  }
  parentElement.removeChild(parentElement.children[0]);
  parentElement.appendChild(stretchElement);
  let barSize = (hasMiddle) ? 2 : 1;
  let barHeight = calcBarHeight(contentElements, startElement, endElement, middleElement);
  let stretchShift = calcStretchShift(contentElements);
  for (let i = 0 ; i < barSize ; i ++) {
    let barWrapperElement = document.createElement("math-barwrap");
    let barElement = document.createElement("math-bar");
    barElement.textContent = ZOTICA_DATA_JSON.fence[kind][position].bar;
    barWrapperElement.style.height = "" + barHeight + "em";
    barWrapperElement.append(barElement);
    if (i === 0) {
      stretchElement.insertBefore(barWrapperElement, stretchElement.children[(hasStart) ? 1 : 0]);
    } else {
      stretchElement.insertBefore(barWrapperElement, stretchElement.children[(hasStart) ? 3 : 2]);
    }
  }
  stretchElement.style.verticalAlign = "" + stretchShift + "em";
}

function calcKinds(element: Element): any {
  let leftKind = "paren";
  let rightKind = "paren";
  let centerKind = "vert";
  if (element.getAttribute("data-left")) {
    leftKind = element.getAttribute("data-left");
  }
  if (element.getAttribute("data-right")) {
    rightKind = element.getAttribute("data-right");
  }
  if (element.getAttribute("data-center")) {
    centerKind = element.getAttribute("data-center");
  }
  return {left: leftKind, right: rightKind, center: centerKind};
}

function calcMaxLevel(kind: string, position: "left" | "right" | "center"): number {
  let keys = Object.keys(ZOTICA_DATA_JSON.fence[kind][position]);
  let maxLevel = 0;
  for (let key of keys) {
    if (key.match(/^\d+$/) && parseInt(key) > maxLevel) {
      maxLevel = parseInt(key);
    }
  }
  return maxLevel;
}

function calcWholeHeight(elements: Array<Element>): number {
  let upperHeights = [];
  let lowerHeights = [];
  for (let element of elements) {
    upperHeights.push(getUpperHeight(element));
    lowerHeights.push(getLowerHeight(element));
  }
  let maxUpperHeight = Math.max(...upperHeights);
  let maxLowerHeight = Math.max(...lowerHeights);
  return maxUpperHeight + maxLowerHeight;
}

function calcLevel(elements: Array<Element>, kind: string, position: "left" | "right" | "center"): number | null {
  let heightAbs = calcWholeHeight(elements) * 1000;
  let maxStretchLevel = calcMaxLevel(kind, position);
  let level = null;
  for (let i = 0 ; i <= maxStretchLevel ; i ++) {
    if (heightAbs <= 1059 + 242 * i) {
      level = i;
      break;
    }
  }
  if (level === null && !ZOTICA_DATA_JSON.fence[kind][position].bar) {
    level = maxStretchLevel;
  }
  return level;
}

function calcShift(elements: Array<Element>, level: number): number {
  let shift = calcWholeHeight(elements) / 2 - Math.max(...elements.map((element) => getLowerHeight(element)));
  if (level === 0) {
    shift = 0;
  }
  return shift;
}

function calcBarHeight(elements: Array<Element>, startElement: Element, endElement: Element, middleElement: Element): number {
  let wholeHeight = calcWholeHeight(elements);
  let startHeight = (startElement) ? getHeight(startElement) : 0;
  let endHeight = (endElement) ? getHeight(endElement) : 0;
  let middleHeight = (middleElement) ? getHeight(middleElement) : 0;
  let height = wholeHeight - startHeight - endHeight - middleHeight;
  if (middleElement) {
    height = height / 2;
  }
  if (height < 0) {
    height = 0;
  }
  return height;
}

function calcStretchShift(elements: Array<Element>): number {
  let shift = Math.max(...elements.map((element) => getUpperHeight(element))) - 0.95;
  return shift;
}