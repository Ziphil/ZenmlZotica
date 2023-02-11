// @ts-nocheck

import ZOTICA_DATA_JSON from "../../data/data.json";
import {
  getChildElements,
  getFontSize,
  getHeight,
  getLowerHeight,
  getWidth
} from "./util";


const ANGLE_EPSILON = Math.PI / 90;
const UNIT = 1 / 18;
const ARROW_MARGIN = 8 * UNIT;
const LABEL_DISTANCE = 5 * UNIT;

export default function modify(element: HTMLElement): void {
  const arrowElements = getChildElements(element, "math-arrow");
  const cellElements = getChildElements(element, "math-cellwrap").map((child) => child.children[0]);
  const backgroundColor = getBackgroundColor(element);
  const graphic = createGraphic(element);
  element.appendChild(graphic);
  for (const arrowElement of arrowElements) {
    const arrowSpec = determineArrowSpec(graphic, arrowElement, cellElements, arrowElements);
    const arrows = createArrows(arrowSpec, backgroundColor);
    graphic.append(...arrows);
    const labelPoint = determineLabelPoint(graphic, arrowElement, arrowSpec);
    const fontRatio = getFontSize(graphic) / getFontSize(arrowElement);
    arrowElement.style.left = "" + (labelPoint[0] * fontRatio) + "em";
    arrowElement.style.top = "" + (labelPoint[1] * fontRatio) + "em";
  }
  const pathElements = Array.from(graphic.children).filter((child) => child.localName === "path");
  const extrusion = calcExtrusion(graphic, arrowElements.concat(pathElements));
  element.style.marginTop = "" + extrusion.top + "em";
  element.style.marginBottom = "" + extrusion.bottom + "em";
  element.style.marginLeft = "" + extrusion.left + "em";
  element.style.marginRight = "" + extrusion.right + "em";
}

function determineArrowSpec(graphic: SVGElement, arrowElement: Element, cellElements: Array<Element>, arrowElements: Array<Element>): any {
  const spec = {};
  const startPositionString = arrowElement.getAttribute("data-start");
  const endPositionString = arrowElement.getAttribute("data-end");
  const startPosition = parseEdgePosition(startPositionString, graphic, cellElements, arrowElements);
  const endPosition = parseEdgePosition(endPositionString, graphic, cellElements, arrowElements);
  if (startPosition && endPosition) {
    const bendAngleString = arrowElement.getAttribute("data-bend");
    if (bendAngleString) {
      spec.bendAngle = parseFloat(bendAngleString) * Math.PI / 180;
    }
    const shiftString = arrowElement.getAttribute("data-shift");
    if (shiftString) {
      spec.shift = parseFloat(shiftString) * UNIT;
    }
    const startElement = startPosition.element;
    const endElement = endPosition.element;
    const startDimension = startPosition.dimension;
    const endDimension = endPosition.dimension;
    if (startPosition.point) {
      spec.startPoint = startPosition.point;
    } else {
      spec.startPoint = calcEdgePoint(startDimension, endDimension, spec.bendAngle, spec.shift);
    }
    if (endPosition.point) {
      spec.endPoint = endPosition.point;
    } else {
      spec.endPoint = calcEdgePoint(endDimension, startDimension, -spec.bendAngle, -spec.shift);
    }
  } else {
    spec.startPoint = [0, 0];
    spec.endPoint = [0, 0];
  }
  const labelPositionString = arrowElement.getAttribute("data-pos");
  if (labelPositionString) {
    spec.labelPosition = parseFloat(labelPositionString) / 100;
  }
  const lineCountString = arrowElement.getAttribute("data-line");
  if (lineCountString) {
    spec.lineCount = parseInt(lineCountString);
  }
  const dashed = !!arrowElement.getAttribute("data-dash");
  if (dashed) {
    spec.dashed = true;
  }
  const inverted = !!arrowElement.getAttribute("data-inv");
  if (inverted) {
    spec.inverted = true;
  }
  const mark = !!arrowElement.getAttribute("data-mark");
  if (mark) {
    spec.mark = true;
  }
  const tipKindsString = arrowElement.getAttribute("data-tip");
  spec.tipKinds = parseTipKinds(tipKindsString, spec.lineCount);
  spec.intrudedStartPoint = calcIntrudedPoint(spec.startPoint, spec.endPoint, spec.bendAngle, spec.tipKinds.start);
  spec.intrudedEndPoint = calcIntrudedPoint(spec.endPoint, spec.startPoint, -spec.bendAngle, spec.tipKinds.end);
  return spec;
}

function determineLabelPoint(graphic: SVGElement, labelElement: Element, arrowSpec: any): [number, number] {
  const labelDimension = calcDimension(graphic, labelElement);
  const startPoint = arrowSpec.startPoint;
  const endPoint = arrowSpec.endPoint;
  const bendAngle = arrowSpec.bendAngle;
  const position = (arrowSpec.labelPosition === undefined) ? 0.5 : arrowSpec.labelPosition;
  let basePoint = [0, 0];
  let angle = 0;
  if (bendAngle !== undefined) {
    const controlPoint = calcControlPoint(startPoint, endPoint, bendAngle);
    const basePointX = (1 - position) * (1 - position) * startPoint[0] + 2 * (1 - position) * position * controlPoint[0] + position * position * endPoint[0];
    const basePointY = (1 - position) * (1 - position) * startPoint[1] + 2 * (1 - position) * position * controlPoint[1] + position * position * endPoint[1];
    const speedX = -2 * (1 - position) * startPoint[0] + 2 * (1 - 2 * position) * controlPoint[0] + 2 * position * endPoint[0];
    const speedY = -2 * (1 - position) * startPoint[1] + 2 * (1 - 2 * position) * controlPoint[1] + 2 * position * endPoint[1];
    basePoint = [basePointX, basePointY];
    angle = calcAngle([0, 0], [speedX, speedY]) + Math.PI / 2;
  } else {
    const basePointX = (1 - position) * startPoint[0] + position * endPoint[0];
    const basePointY = (1 - position) * startPoint[1] + position * endPoint[1];
    basePoint = [basePointX, basePointY];
    angle = calcAngle(startPoint, endPoint) + Math.PI / 2;
  }
  if (arrowSpec.inverted) {
    angle += Math.PI;
  }
  angle = normalizeAngle(angle);
  let point;
  if (arrowSpec.mark) {
    const pointX = basePoint[0] + labelDimension.northWest[0] - labelDimension.center[0];
    const pointY = basePoint[1] + labelDimension.northWest[0] - labelDimension.center[1];
    point = [pointX, pointY];
  } else {
    point = calcLabelPoint(basePoint, labelDimension, angle, arrowSpec.lineCount);
  }
  return point;
}

function calcEdgePoint(baseDimension: any, destinationDimension: any, bendAngle: number, shift: number): [number, number] {
  const margin = ARROW_MARGIN;
  let angle = calcAngle(baseDimension.center, destinationDimension.center) + (bendAngle || 0);
  let shiftAngle = angle + Math.PI / 2;
  const southWestAngle = calcAngle(baseDimension.center, baseDimension.southWestMargined);
  const southEastAngle = calcAngle(baseDimension.center, baseDimension.southEastMargined);
  const northEastAngle = calcAngle(baseDimension.center, baseDimension.northEastMargined);
  const northWestAngle = calcAngle(baseDimension.center, baseDimension.northWestMargined);
  let x = 0;
  let y = 0;
  angle = normalizeAngle(angle);
  shiftAngle = normalizeAngle(shiftAngle);
  if (angle >= southWestAngle && angle <= southEastAngle) {
    x = baseDimension.center[0] + (baseDimension.center[1] - baseDimension.southMargined[1]) / Math.tan(angle);
    y = baseDimension.southMargined[1];
  } else if (angle >= southEastAngle && angle <= northEastAngle) {
    x = baseDimension.eastMargined[0];
    y = baseDimension.center[1] + (baseDimension.center[0] - baseDimension.eastMargined[0]) * Math.tan(angle);
  } else if (angle >= northEastAngle && angle <= northWestAngle) {
    x = baseDimension.center[0] + (baseDimension.center[1] - baseDimension.northMargined[1]) / Math.tan(angle);
    y = baseDimension.northMargined[1];
  } else if (angle >= northWestAngle || angle <= southWestAngle) {
    x = baseDimension.westMargined[0];
    y = baseDimension.center[1] + (baseDimension.center[0] - baseDimension.westMargined[0]) * Math.tan(angle);
  }
  if (shift) {
    x += Math.cos(shiftAngle) * shift;
    y -= Math.sin(shiftAngle) * shift;
  }
  return [x, y];
}

function calcIntrudedPoint(basePoint: [number, number], destinationPoint: [number, number], bendAngle: number, tipKind: any): [number, number] {
  if (tipKind !== "none") {
    let angle = calcAngle(basePoint, destinationPoint) + (bendAngle || 0);
    const distance = ZOTICA_DATA_JSON.arrow[tipKind].extrusion;
    angle = normalizeAngle(angle);
    const intrudedPointX = basePoint[0] + distance * Math.cos(angle);
    const intrudedPointY = basePoint[1] - distance * Math.sin(angle);
    const intrudedPoint = [intrudedPointX, intrudedPointY];
    return intrudedPoint;
  } else {
    return basePoint;
  }
}

function calcLabelPoint(basePoint: [number, number], labelDimension: any, angle: number, lineCount: number): [number, number] {
  const distance = LABEL_DISTANCE + ((lineCount || 1) - 1) * 0.09;
  let direction = "east";
  if (angle <= -Math.PI + ANGLE_EPSILON) {
    direction = "east";
  } else if (angle <= -Math.PI / 2 - ANGLE_EPSILON) {
    direction = "northEast";
  } else if (angle <= -Math.PI / 2 + ANGLE_EPSILON) {
    direction = "north";
  } else if (angle <= -ANGLE_EPSILON) {
    direction = "northWest";
  } else if (angle <= ANGLE_EPSILON) {
    direction = "west";
  } else if (angle <= Math.PI / 2 - ANGLE_EPSILON) {
    direction = "southWest";
  } else if (angle <= Math.PI / 2 + ANGLE_EPSILON) {
    direction = "south";
  } else if (angle <= Math.PI - ANGLE_EPSILON) {
    direction = "southEast";
  } else {
    direction = "east";
  }
  const x = basePoint[0] + Math.cos(angle) * distance + labelDimension.northWest[0] - labelDimension[direction][0];
  const y = basePoint[1] - Math.sin(angle) * distance + labelDimension.northWest[1] - labelDimension[direction][1];
  return [x, y];
}

function parseEdgePosition(string: string, graphic: SVGElement, cellElements: Array<Element>, arrowElements: Array<Element>): any {
  let config = null;
  const match = string.match(/(?:(\d+)|([A-Za-z]\w*))(?:\:(\w+))?/);
  if (match) {
    let element = null;
    if (match[1]) {
      const number = parseInt(match[1]) - 1;
      element = cellElements[number];
    } else if (match[2]) {
      const candidates = cellElements.map((candidate) => candidate.parentNode).concat(arrowElements);
      const name = match[2];
      element = candidates.find((candidate) => candidate.getAttribute("data-name") === name);
    }
    if (element) {
      const dimension = calcDimension(graphic, element);
      let point = null;
      if (match[3]) {
        point = parseEdgePoint(match[3], dimension);
      }
      config = {element, dimension, point};
    }
  }
  return config;
}

function parseEdgePoint(string: string, dimension: any): [number, number] {
  let point = null;
  let match;
  if (match = string.match(/^n(|w|e)|s(|w|e)|w|e|c$/)) {
    if (string === "nw") {
      point = dimension.northWestMargined;
    } else if (string === "n") {
      point = dimension.northMargined;
    } else if (string === "ne") {
      point = dimension.northEastMargined;
    } else if (string === "e") {
      point = dimension.eastMargined;
    } else if (string === "se") {
      point = dimension.southEastMargined;
    } else if (string === "s") {
      point = dimension.southMargined;
    } else if (string === "sw") {
      point = dimension.southWestMargined;
    } else if (string === "w") {
      point = dimension.westMargined;
    } else if (string === "c") {
      point = dimension.center;
    }
  } else if (match = string.match(/^(t|r|b|l)([\d.]+)$/)) {
    const direction = match[1];
    const position = parseFloat(match[2]) / 100;
    let pointX = null;
    let pointY = null;
    if (direction === "t") {
      pointX = (1 - position) * dimension.northWestMargined[0] + position * dimension.northEastMargined[0];
      pointY = dimension.northMargined[1];
    } else if (direction === "r") {
      pointX = dimension.eastMargined[0];
      pointY = (1 - position) * dimension.northEastMargined[1] + position * dimension.southEastMargined[1];
    } else if (direction === "b") {
      pointX = (1 - position) * dimension.southWestMargined[0] + position * dimension.southEastMargined[0];
      pointY = dimension.southMargined[1];
    } else if (direction === "l") {
      pointX = dimension.westMargined[0];
      pointY = (1 - position) * dimension.northWestMargined[1] + position * dimension.southWestMargined[1];
    }
    if (pointX !== null && pointY !== null) {
      point = [pointX, pointY];
    }
  }
  return point;
}

function parseTipKinds(string: string | null, lineCount: number): any {
  const tipKinds = {start: "none", end: "normal"};
  if (string !== null) {
    const specifiedTipKinds = string.split(/\s*,\s*/);
    for (const specifiedTipKind of specifiedTipKinds) {
      const spec = ZOTICA_DATA_JSON.arrow[specifiedTipKind];
      if (spec) {
        tipKinds[spec.edge] = specifiedTipKind;
      }
      if (specifiedTipKind === "none") {
        tipKinds.end = "none";
      }
    }
  }
  if (lineCount === 2) {
    if (tipKinds.start !== "none") {
      tipKinds.start = "d" + tipKinds.start;
    }
    if (tipKinds.end !== "none") {
      tipKinds.end = "d" + tipKinds.end;
    }
  } else if (lineCount === 3) {
    if (tipKinds.start !== "none") {
      tipKinds.start = "t" + tipKinds.start;
    }
    if (tipKinds.end !== "none") {
      tipKinds.end = "t" + tipKinds.end;
    }
  }
  return tipKinds;
}

function calcAngle(basePoint: [number, number], destinationPoint: [number, number]): number {
  const x = destinationPoint[0] - basePoint[0];
  const y = destinationPoint[1] - basePoint[1];
  const angle = -Math.atan2(y, x);
  return angle;
}

function normalizeAngle(angle: number): number {
  const normalizedAngle = (angle + Math.PI) % (Math.PI * 2) - Math.PI;
  return normalizedAngle;
}

function createArrows(arrowSpec: any, backgroundColor: string): Array<SVGElement> {
  const startPoint = arrowSpec.intrudedStartPoint;
  const endPoint = arrowSpec.intrudedEndPoint;
  const bendAngle = arrowSpec.bendAngle;
  const lineCount = (arrowSpec.lineCount === undefined) ? 1 : arrowSpec.lineCount;
  let command = "M " + startPoint[0] + " " + startPoint[1];
  if (bendAngle !== undefined) {
    const controlPoint = calcControlPoint(startPoint, endPoint, bendAngle);
    command += " Q " + controlPoint[0] + " " + controlPoint[1] + ", " + endPoint[0] + " " + endPoint[1];
  } else {
    command += " L " + endPoint[0] + " " + endPoint[1];
  }
  const arrows = [];
  for (let i = 0 ; i < lineCount ; i ++) {
    const arrow = createSvgElement("path");
    arrow.setAttribute("d", command);
    if (arrowSpec.tipKinds.start !== "none" && i === lineCount - 1) {
      arrow.setAttribute("marker-start", "url(#tip-" + arrowSpec.tipKinds.start + ")");
    }
    if (arrowSpec.tipKinds.end !== "none" && i === lineCount - 1) {
      arrow.setAttribute("marker-end", "url(#tip-" + arrowSpec.tipKinds.end + ")");
    }
    if (arrowSpec.dashed && i % 2 === 0) {
      arrow.classList.add("dashed");
    }
    if (i === 0) {
      arrow.classList.add("base");
    } else if (i === 1) {
      arrow.classList.add("cover");
      arrow.style.stroke = backgroundColor;
    } else if (i === 2) {
      arrow.classList.add("front");
    }
    if (lineCount === 2) {
      arrow.classList.add("double");
    } else if (lineCount === 3) {
      arrow.classList.add("triple");
    }
    arrows.push(arrow);
  }
  return arrows;
}

function calcControlPoint(startPoint: [number, number], endPoint: [number, number], bendAngle: number): [number, number] {
  const x = (endPoint[0] + startPoint[0] + (endPoint[1] - startPoint[1]) * Math.tan(bendAngle)) / 2;
  const y = (endPoint[1] + startPoint[1] - (endPoint[0] - startPoint[0]) * Math.tan(bendAngle)) / 2;
  return [x, y];
}

function calcExtrusion(graphic: SVGElement, elements: Array<Element>): any {
  const fontSize = getFontSize(graphic);
  const xOffset = window.pageXOffset;
  const yOffset = window.pageYOffset;
  const graphicRect = graphic.getBoundingClientRect();
  const graphicTop = graphicRect.top + yOffset;
  const graphicBottom = graphicRect.bottom + yOffset;
  const graphicLeft = graphicRect.left + xOffset;
  const graphicRight = graphicRect.right + xOffset;
  const extrusion = {top: 0, bottom: 0, left: 0, right: 0};
  for (const element of elements) {
    const rect = element.getBoundingClientRect();
    const topExtrusion = -(rect.top + yOffset - graphicTop) / fontSize;
    const bottomExtrusion = (rect.bottom + yOffset - graphicBottom) / fontSize;
    const leftExtrusion = -(rect.left + xOffset - graphicLeft) / fontSize;
    const rightExtrusion = (rect.right + xOffset - graphicRight) / fontSize;
    if (topExtrusion > extrusion.top) {
      extrusion.top = topExtrusion;
    }
    if (bottomExtrusion > extrusion.bottom) {
      extrusion.bottom = bottomExtrusion;
    }
    if (leftExtrusion > extrusion.left) {
      extrusion.left = leftExtrusion;
    }
    if (rightExtrusion > extrusion.right) {
      extrusion.right = rightExtrusion;
    }
  }
  return extrusion;
}

function createGraphic(element: HTMLElement): SVGElement {
  const width = getWidth(element);
  const height = getHeight(element);
  const graphic = createSvgElement("svg");
  graphic.setAttribute("viewBox", "0 0 " + width + " " + height);
  const definitionElement = createSvgElement("defs");
  const tipSpecKeys = Object.keys(ZOTICA_DATA_JSON.arrow);
  for (const tipSpecKey of tipSpecKeys) {
    const tipSpec = ZOTICA_DATA_JSON.arrow[tipSpecKey];
    const markerElement = createSvgElement("marker");
    const markerPathElement = createSvgElement("path");
    markerElement.setAttribute("id", "tip-" + tipSpecKey);
    markerElement.setAttribute("refX", tipSpec["x"]);
    markerElement.setAttribute("refY", tipSpec["y"]);
    markerElement.setAttribute("markerWidth", tipSpec["width"]);
    markerElement.setAttribute("markerHeight", tipSpec["height"]);
    markerElement.setAttribute("markerUnits", "userSpaceOnUse");
    markerElement.setAttribute("orient", "auto");
    markerPathElement.setAttribute("d", tipSpec["command"]);
    markerElement.appendChild(markerPathElement);
    definitionElement.appendChild(markerElement);
  }
  graphic.appendChild(definitionElement);
  return graphic;
}

function createSvgElement(name: string): SVGElement {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  return element;
}

function calcDimension(graphic: SVGElement, element: Element): any {
  const dimension = {};
  const margin = ARROW_MARGIN;
  const fontSize = getFontSize(graphic);
  const graphicTop = graphic.getBoundingClientRect().top + window.pageYOffset;
  const graphicLeft = graphic.getBoundingClientRect().left + window.pageXOffset;
  const top = (element.getBoundingClientRect().top + window.pageYOffset - graphicTop) / fontSize;
  const left = (element.getBoundingClientRect().left + window.pageXOffset - graphicLeft) / fontSize;
  const width = getWidth(element, graphic);
  const height = getHeight(element, graphic);
  const lowerHeight = getLowerHeight(element, graphic);
  dimension.northWest = [left, top];
  dimension.north = [left + width / 2, top];
  dimension.northEast = [left + width, top];
  dimension.west = [left, top + height - lowerHeight];
  dimension.center = [left + width / 2, top + height - lowerHeight];
  dimension.east = [left + width, top + height - lowerHeight];
  dimension.southWest = [left, top + height];
  dimension.south = [left + width / 2, top + height];
  dimension.southEast = [left + width, top + height];
  dimension.northWestMargined = [left - margin, top - margin];
  dimension.northMargined = [left + width / 2, top - margin];
  dimension.northEastMargined = [left + width + margin, top - margin];
  dimension.westMargined = [left - margin, top + height - lowerHeight];
  dimension.centerMargined = [left + width / 2, top + height - lowerHeight];
  dimension.eastMargined = [left + width + margin, top + height - lowerHeight];
  dimension.southWestMargined = [left - margin, top + height + margin];
  dimension.southMargined = [left + width / 2, top + height + margin];
  dimension.southEastMargined = [left + width + margin, top + height + margin];
  return dimension;
}

function getBackgroundColor(element: Node): string {
  let currentElement = element as Node | null;
  let color = "white";
  while (currentElement && currentElement instanceof Element) {
    const currentColor = window.getComputedStyle(currentElement).backgroundColor;
    if (currentColor !== "rgba(0, 0, 0, 0)" && currentColor !== "transparent") {
      color = currentColor;
      break;
    }
    currentElement = currentElement.parentNode;
  }
  return color;
}