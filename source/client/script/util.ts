// @ts-nocheck


export function getFontSize(element: Element): number {
  const fontSizeString = window.getComputedStyle(element).fontSize;
  const fontSize = parseFloat(fontSizeString);
  return fontSize;
}

export function getWidthPx(element: Element): number {
  const width = element.getBoundingClientRect().width;
  return width;
}

export function getWidth(element: Element, fontElement?: Element): number {
  const width = getWidthPx(element) / getFontSize(fontElement || element);
  return width;
}

export function getHeightPx(element: Element): number {
  const height = element.getBoundingClientRect().height;
  return height;
}

export function getHeight(element: Element, fontElement?: Element): number {
  const height = getHeightPx(element) / getFontSize(fontElement || element);
  return height;
}

export function getLowerHeightPx(element: Element): number {
  const bottom = element.getBoundingClientRect().bottom + window.pageYOffset;
  const locator = document.createElement("math-sys-locator");
  element.appendChild(locator);
  locator.style.verticalAlign = "baseline";
  const baselineBottom = locator.getBoundingClientRect().bottom + window.pageYOffset;
  const height = bottom - baselineBottom + getFontSize(element) * 0.3;
  element.removeChild(locator);
  return height;
}

export function getLowerHeight(element: Element, fontElement?: Element): number {
  const height = getLowerHeightPx(element) / getFontSize(fontElement || element);
  return height;
}

export function getUpperHeightPx(element: Element): number {
  const height = getHeightPx(element) - getLowerHeightPx(element);
  return height;
}

export function getUpperHeight(element: Element, fontElement?: Element): number {
  const height = getHeight(element, fontElement) - getLowerHeight(element, fontElement);
  return height;
}

export function getOffsetLeft(element: HTMLElement, fontElement?: Element): number {
  const offset = element.offsetLeft / getFontSize(fontElement || element);
  return offset;
}

export function getOffsetRight(element: HTMLElement, fontElement?: Element): number {
  const offset = (element.offsetParent.offsetWidth - element.offsetLeft - element.offsetWidth) / getFontSize(fontElement || element);
  return offset;
}

export function getChildElement(element: Element, tagName: string): HTMLElement | undefined {
  return Array.from(element.children).find((child) => child.localName === tagName);
}

export function getChildElements(element: Element, tagName: string): Array<HTMLElement> {
  return Array.from(element.children).filter((child) => child.localName === tagName);
}