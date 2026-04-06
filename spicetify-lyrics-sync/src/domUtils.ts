export type Props = { [key: string]: any };

/**
 * Declarative DOM helper (hyperscript-like).
 * @param tag XML/HTML tag name.
 * @param props Attributes, events (on-prefixed), and styles.
 * @param children Optional children (text or HTMLElement).
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  ...children: (Element | string | null | undefined | (Element | string | null | undefined)[])[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);

  for (const [key, val] of Object.entries(props)) {
    if (key === "style" && typeof val === "object") {
      Object.assign(el.style, val);
    } else if (key.startsWith("on") && typeof val === "function") {
      const event = key.toLowerCase().substring(2);
      el.addEventListener(event, val);
    } else if (key === "className") {
      el.className = val;
    } else if (key === "classList" && Array.isArray(val)) {
      el.classList.add(...val.filter(Boolean));
    } else if (key === "dataset" && typeof val === "object") {
      Object.assign(el.dataset, val);
    } else {
      (el as any)[key] = val;
    }
  }

  const addChildren = (childList: any[]) => {
    for (const child of childList) {
      if (child === null || child === undefined) continue;
      if (Array.isArray(child)) {
        addChildren(child);
      } else if (typeof child === "string") {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Element) {
        el.appendChild(child);
      }
    }
  };

  addChildren(children);
  return el;
}

export function hSvg(
  tag: string,
  props: Props = {},
  ...children: (Element | string | null | undefined | (Element | string | null | undefined)[])[]
): SVGElement {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag) as SVGElement;

  for (const [key, val] of Object.entries(props)) {
    if (key === "className") {
      el.setAttribute("class", val);
    } else if (key === "style" && typeof val === "object") {
      Object.assign((el as any).style, val);
    } else {
      el.setAttribute(key, String(val));
    }
  }

  const addChildren = (childList: any[]) => {
    for (const child of childList) {
      if (child === null || child === undefined) continue;
      if (Array.isArray(child)) {
        addChildren(child);
      } else if (typeof child === "string") {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Element) {
        el.appendChild(child);
      }
    }
  };

  addChildren(children);
  return el;
}

export function setStyles(el: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
  Object.assign(el.style, styles);
}
