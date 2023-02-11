// @ts-nocheck

import modifyDiagram from "./diagram";
import modifyFence from "./fence";
import modifyRadical from "./radical";
import modifySubsuper from "./subsuper";
import modifyTree from "./tree";
import modifyUnderover from "./underover";
import modifyWide from "./wide";


export default function modify(): void {
  console.info("[Zotica] Start");
  const startDate = new Date();
  let elements = [];
  elements.push(...document.querySelectorAll("math-subsup"));
  elements.push(...document.querySelectorAll("math-underover"));
  elements.push(...document.querySelectorAll("math-rad.mod"));
  elements.push(...document.querySelectorAll("math-fence.mod"));
  elements.push(...document.querySelectorAll("math-diagram"));
  elements.push(...document.querySelectorAll("math-step"));
  elements = elements.sort((first, second) => getDepth(second) - getDepth(first));
  elements.forEach((element) => {
    const name = element.localName;
    if (name === "math-subsup") {
      modifySubsuper(element);
    } else if (name === "math-underover") {
      modifyUnderover(element);
      if (element.classList.contains("wid") && element.classList.contains("mod")) {
        modifyWide(element);
      }
    } else if (name === "math-rad") {
      modifyRadical(element);
    } else if (name === "math-fence") {
      modifyFence(element);
    } else if (name === "math-diagram") {
      modifyDiagram(element);
    } else if (name === "math-step") {
      modifyTree(element);
    }
  });
  const finishDate = new Date();
  const elapsedTime = (finishDate.getTime() - startDate.getTime()) / 1000;
  console.info("[Zotica] Finish (" + elements.length + " elements, " + elapsedTime.toFixed(4) + " seconds)");
}

function getDepth(element: Node): number {
  let depth = 0;
  const castElement = element as Node & {zoticaDepth?: number};
  if (castElement.zoticaDepth !== undefined) {
    depth = castElement.zoticaDepth;
  } else {
    const parent = castElement.parentNode;
    if (parent) {
      depth = getDepth(parent) + 1;
    } else {
      depth = 0;
    }
  }
  castElement.zoticaDepth = depth;
  return depth;
}