// @ts-nocheck

import ZOTICA_DATA_JSON from "../../data/data.json";
import {
  getChildElement,
  getFontSize,
  getHeight,
  getLowerHeight,
  getUpperHeight,
  getWidth
} from "./util";


export default function modify(element: HTMLElement): void {
  let baseElement = getChildElement(element, "math-base");
  let subElement = getChildElement(element, "math-sub");
  let superElement = getChildElement(element, "math-sup");
  let leftSubElement = getChildElement(element, "math-lsub");
  let leftSuperElement = getChildElement(element, "math-lsup");
  modifySide(element, baseElement, subElement, superElement, "right");
  modifySide(element, baseElement, leftSubElement, leftSuperElement, "left");
}

function modifySide(element: Element, baseElement: Element, subElement: HTMLElement, superElement: HTMLElement, side: "left" | "right"): void {
  let bothShifts = calcBothShifts(baseElement, subElement, superElement);
  let subShift = bothShifts.sub;
  let superShift = bothShifts.super;
  let subMargin = 0;
  let superMargin = (subElement) ? -getWidth(subElement) : 0;
  let subWidth = (subElement) ? getWidth(subElement) : 0;
  let superWidth = (superElement) ? getWidth(superElement) : 0;
  if (side === "right" && element.classList.contains("int")) {
    let slope = (element.classList.contains("inl")) ? 0.3 : 0.6;
    subWidth -= slope;
    subMargin -= slope;
    if (subElement) {
      superMargin += slope;
    }
  }
  if (subElement) {
    subElement.style.verticalAlign = "" + subShift + "em";
    subElement.style.marginLeft = "" + subMargin + "em";
  }
  if (superElement) {
    superElement.style.verticalAlign = "" + superShift + "em";
    superElement.style.marginLeft = "" + superMargin + "em";
  }
  if (side === "right" && superElement && subWidth > superWidth) {
    superElement.style.width = "" + subWidth + "em";
  }
  if (side === "left" && subElement && superWidth > subWidth) {
    subElement.style.width = "" + superWidth + "em";
  }
}

function calcBothShifts(baseElement: Element, subElement: Element, superElement: Element): any {
  let subShift = (subElement) ? calcSubShift(baseElement, subElement) : 0;
  let superShift = (superElement) ? calcSuperShift(baseElement, superElement) : 0;
  if (subElement && superElement) {
    let subHeight = getHeight(subElement);
    let gap = -subShift + superShift - subHeight;
    if (gap < 0.2) {
      subShift -= (0.2 - gap) / 2;
      superShift += (0.2 - gap) / 2;
    }
  }
  return {sub: subShift, super: superShift};
}

function calcSubShift(baseElement: Element, subElement: Element): number {
  let fontRatio = getFontSize(baseElement) / getFontSize(subElement);
  let height = getLowerHeight(baseElement);
  if (height < 0.4875) {
    height = 0.4875;
  }
  let shiftConst = -0.25;
  if (baseElement.parentNode.classList.contains("int") && !baseElement.parentNode.classList.contains("inl")) {
    shiftConst = -0.15;
  }
  let shift = (height + shiftConst) * fontRatio;
  return -shift;
}

function calcSuperShift(baseElement: Element, superElement: Element): number {
  let fontRatio = getFontSize(baseElement) / getFontSize(superElement);
  let height = getUpperHeight(baseElement);
  if (height < 0.5125) {
    height = 0.5125;
  }
  let shiftConst = -0.2;
  if (baseElement.parentNode.classList.contains("int") && !baseElement.parentNode.classList.contains("inl")) {
    shiftConst = -0.1;
  }
  let shift = (height + shiftConst) * fontRatio;
  return shift;
}