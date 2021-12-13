// @ts-nocheck


export function getFontSize(element: Element): number {
  let fontSizeString = window.getComputedStyle(element).fontSize;
  let fontSize = parseFloat(fontSizeString);
  return fontSize;
}

export function getWidthPx(element: Element): number {
  let width = element.getBoundingClientRect().width;
  return width;
}

export function getWidth(element: Element, fontElement?: Element): number {
  let width = getWidthPx(element) / getFontSize(fontElement || element);
  return width;
}

export function getHeightPx(element: Element): number {
  let height = element.getBoundingClientRect().height;
  return height;
}

export function getHeight(element: Element, fontElement?: Element): number {
  let height = getHeightPx(element) / getFontSize(fontElement || element);
  return height;
}

export function getLowerHeightPx(element: Element): number {
  let bottom = element.getBoundingClientRect().bottom + window.pageYOffset;
  let locator = document.createElement("math-sys-locator");
  element.appendChild(locator);
  locator.style.verticalAlign = "baseline";
  let baselineBottom = locator.getBoundingClientRect().bottom + window.pageYOffset;
  let height = bottom - baselineBottom + getFontSize(element) * 0.3;
  element.removeChild(locator);
  return height;
}

export function getLowerHeight(element: Element, fontElement?: Element): number {
  let height = getLowerHeightPx(element) / getFontSize(fontElement || element);
  return height;
}

export function getUpperHeightPx(element: Element): number {
  let height = getHeightPx(element) - getLowerHeightPx(element);
  return height;
}

export function getUpperHeight(element: Element, fontElement?: Element): number {
  let height = getHeight(element, fontElement) - getLowerHeight(element, fontElement);
  return height;
}

export function getOffsetLeft(element: HTMLElement, fontElement?: Element): number {
  let offset = element.offsetLeft / getFontSize(fontElement || element);
  return offset;
}

export function getOffsetRight(element: HTMLElement, fontElement?: Element): number {
  let offset = (element.offsetParent.offsetWidth - element.offsetLeft - element.offsetWidth) / getFontSize(fontElement || element);
  return offset;
}

export function getChildElement(element: Element, tagName: string): HTMLElement | undefined {
  return Array.from(element.children).find((child) => child.localName === tagName);
}

export function getChildElements(element: Element, tagName: string): Array<HTMLElement> {
  return Array.from(element.children).filter((child) => child.localName === tagName);
}