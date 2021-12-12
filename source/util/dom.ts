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

export function appendChildren(parent: Node, children: Array<Node>): void {
  for (let child of children) {
    parent.appendChild(child);
  }
}

export function addAttribute(element: Element, name: string, value: string): void {
  element.setAttribute(name, (element.getAttribute(name) ?? "") + value);
}

export function getChildElement(element: Element, tagName: string): Element | null {
  let nodes = element.childNodes;
  for (let i = 0 ; i < nodes.length ; i ++) {
    let node = nodes.item(i)!;
    if (isElement(node) && node.tagName === tagName) {
      return node;
    }
  }
  return null;
}