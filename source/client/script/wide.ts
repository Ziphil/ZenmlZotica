// @ts-nocheck

import ZOTICA_DATA_JSON from "../../data/data.json";
import {
  getChildElement,
  getWidth
} from "./util";


export default function modify(element: HTMLElement): void {
  const baseWrapperElement = getChildElement(element, "math-basewrap");
  const overElement = getChildElement(element, "math-over");
  const contentElement = baseWrapperElement.children[0];
  const parentElements = {un: baseWrapperElement.children[1], ov: overElement};
  const kind = calcKind(element);
  for (const position of ["un", "ov"]) {
    const parentElement = parentElements[position];
    if (parentElement) {
      const stretchLevel = calcLevel(contentElement, kind, position);
      if (stretchLevel !== null) {
        modifyStretch(contentElement, parentElement, kind, stretchLevel, position);
      } else {
        appendStretch(contentElement, parentElement, kind, position);
      }
    }
  }
}

function modifyStretch(contentElement: Element, parentElement: Element, kind: string, stretchLevel: number, position: "un" | "ov"): void {
  const symbolElement = parentElement.children[0];
  symbolElement.textContent = ZOTICA_DATA_JSON.wide[kind][position][stretchLevel];
}

function appendStretch(contentElement, parentElement, kind, position) {
  const stretchElement = document.createElement("math-hstretch");
  const hasStart = !!ZOTICA_DATA_JSON.wide[kind][position].start;
  const hasEnd = !!ZOTICA_DATA_JSON.wide[kind][position].end;
  const hasMiddle = !!ZOTICA_DATA_JSON.wide[kind][position].middle;
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
  const barSize = (hasMiddle) ? 2 : 1;
  const barWidth = calcBarWidth(contentElement, startElement, endElement, middleElement);
  for (let i = 0 ; i < barSize ; i ++) {
    const barWrapperElement = document.createElement("math-barwrap");
    const barElement = document.createElement("math-bar");
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
  const keys = Object.keys(ZOTICA_DATA_JSON.wide[kind][position]);
  let maxLevel = -1;
  for (const key of keys) {
    if (key.match(/^\d+$/) && ZOTICA_DATA_JSON.wide[kind][position][key] && parseInt(key) > maxLevel) {
      maxLevel = parseInt(key);
    }
  }
  return maxLevel;
}

function calcLevel(element: Element, kind: string, position: "un" | "ov"): number {
  const widthAbs = getWidth(element) * 1000;
  const maxLevel = calcMaxLevel(kind, position);
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
  const wholeWidth = getWidth(element);
  const startWidth = (startElement) ? getWidth(startElement) : 0;
  const endWidth = (endElement) ? getWidth(endElement) : 0;
  const middleWidth = (middleElement) ? getWidth(middleElement) : 0;
  let width = wholeWidth - startWidth - endWidth - middleWidth;
  if (middleElement) {
    width /= 2;
  }
  if (width < 0) {
    width = 0;
  }
  return width;
}