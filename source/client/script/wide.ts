// @ts-nocheck

import ZOTICA_DATA_JSON from "../../data/data.json";
import {
  getChildElement,
  getWidth
} from "./util";


export default function modify(element: HTMLElement): void {
  let baseWrapperElement = getChildElement(element, "math-basewrap");
  let overElement = getChildElement(element, "math-over");
  let contentElement = baseWrapperElement.children[0];
  let parentElements = {un: baseWrapperElement.children[1], ov: overElement};
  let kind = calcKind(element);
  for (let position of ["un", "ov"]) {
    let parentElement = parentElements[position];
    if (parentElement) {
      let stretchLevel = calcLevel(contentElement, kind, position);
      if (stretchLevel !== null) {
        modifyStretch(contentElement, parentElement, kind, stretchLevel, position);
      } else {
        appendStretch(contentElement, parentElement, kind, position);
      }
    }
  }
}

function modifyStretch(contentElement: Element, parentElement: Element, kind: string, stretchLevel: number, position: "un" | "ov"): void {
  let symbolElement = parentElement.children[0];
  symbolElement.textContent = ZOTICA_DATA_JSON.wide[kind][position][stretchLevel];
}

function appendStretch(contentElement, parentElement, kind, position) {
  let stretchElement = document.createElement("math-hstretch");
  let hasStart = !!ZOTICA_DATA_JSON.wide[kind][position].start;
  let hasEnd = !!ZOTICA_DATA_JSON.wide[kind][position].end;
  let hasMiddle = !!ZOTICA_DATA_JSON.wide[kind][position].middle;
  let startElement = null;
  let endElement = null;
  let middleElement = null;
  if (hasStart) {
    startElement = document.createElement("math-start");
    startElement.textContent = ZOTICA_DATA_JSON.wide[kind][position].start;
    stretchElement.append(startElement);
  }
  if (hasMiddle) {
    middleElement = document.createElement("math-middle");
    middleElement.textContent = ZOTICA_DATA_JSON.wide[kind][position].middle;
    stretchElement.append(middleElement);
  }
  if (hasEnd) {
    endElement = document.createElement("math-end");
    endElement.textContent = ZOTICA_DATA_JSON.wide[kind][position].end;
    stretchElement.append(endElement);
  }
  parentElement.removeChild(parentElement.children[0]);
  parentElement.appendChild(stretchElement);
  let barSize = (hasMiddle) ? 2 : 1;
  let barWidth = calcBarWidth(contentElement, startElement, endElement, middleElement);
  for (let i = 0 ; i < barSize ; i ++) {
    let barWrapperElement = document.createElement("math-barwrap");
    let barElement = document.createElement("math-bar");
    barElement.textContent = ZOTICA_DATA_JSON.wide[kind][position].bar;
    barWrapperElement.style.width = "" + barWidth + "em";
    barWrapperElement.append(barElement);
    if (i === 0) {
      stretchElement.insertBefore(barWrapperElement, stretchElement.children[(hasStart) ? 1 : 0]);
    } else {
      stretchElement.insertBefore(barWrapperElement, stretchElement.children[(hasStart) ? 3 : 2]);
    }
  }
}

function calcKind(element: Element): string {
  let kind = "widetilde";
  if (element.getAttribute("data-kind")) {
    kind = element.getAttribute("data-kind");
  }
  return kind;
}

function calcMaxLevel(kind: string, position: "un" | "ov"): number {
  let keys = Object.keys(ZOTICA_DATA_JSON.wide[kind][position]);
  let maxLevel = -1;
  for (let key of keys) {
    if (key.match(/^\d+$/) && ZOTICA_DATA_JSON.wide[kind][position][key] && parseInt(key) > maxLevel) {
      maxLevel = parseInt(key);
    }
  }
  return maxLevel;
}

function calcLevel(element: Element, kind: string, position: "un" | "ov"): number {
  let widthAbs = getWidth(element) * 1000;
  let maxLevel = calcMaxLevel(kind, position);
  let level = null;
  for (let i = 0 ; i <= maxLevel ; i ++) {
    if (widthAbs <= ZOTICA_DATA_JSON.wide[kind][position]["width"][i]) {
      level = i;
      break;
    }
  }
  if (level === null && !ZOTICA_DATA_JSON.wide[kind][position].bar) {
    level = maxLevel;
  }
  return level;
}

function calcBarWidth(element: Element, startElement: Element, endElement: Element, middleElement: Element): number {
  let wholeWidth = getWidth(element);
  let startWidth = (startElement) ? getWidth(startElement) : 0;
  let endWidth = (endElement) ? getWidth(endElement) : 0;
  let middleWidth = (middleElement) ? getWidth(middleElement) : 0;
  let width = wholeWidth - startWidth - endWidth - middleWidth;
  if (middleElement) {
    width = width / 2;
  }
  if (width < 0) {
    width = 0;
  }
  return width;
}