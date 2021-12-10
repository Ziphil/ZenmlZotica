//


export function isElement(node: Node): node is Element {
  return node.nodeType === 1;
}

export function isText(node: Node): node is Text {
  return node.nodeType === 3;
}

export function insertFirst(parent: Node, child: Node): void {
  let firstChild = parent.childNodes.item(0);
  if (firstChild) {
    parent.insertBefore(child, firstChild);
  } else {
    parent.appendChild(child);
  }
}