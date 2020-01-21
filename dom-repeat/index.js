import { init } from "../node_modules/@hydrophobefireman/qwc/dist/index.modern.js";
import { getTemplate } from "../getTemplate.js";
const DATA = "{{data}}";

const makeDom = (obj, spec) => {
  obj === DATA && (obj = spec);
  if ("object" != typeof obj) return document.createTextNode(obj);
  let { el, attrs, children } = obj;
  !Array.isArray(children) && (children = [children]);
  const i = document.createElement(el);
  for (let a of Object.keys(attrs || {})) {
    a === DATA && (a = spec);
    let u = attrs[a];
    u === DATA && (u = spec),
      "o" === a[0] && "n" === a[1]
        ? i.addEventListener(a.substr(2), u)
        : i.setAttribute(a, u);
  }
  for (const c of children || []) i.appendChild(makeDom(c, spec));
  return i;
};

const empty = t => {
  for (let e; (e = t.lastChild); ) t.removeChild(e);
};
const parse = t => ("string" == typeof t ? JSON.parse(t) : t);
const h = () =>
  init(
    {
      "dom-repeat": {
        observedAttributes: [
          {
            prop: "domfor",
            listener(t, e) {
              if (t == e) {
                return;
              }
              t && empty(this.shadowRoot);
              let r;
              const el = (e = parse(e)).tree.el;
              r =
                "Fragment" === el || null == el
                  ? document.createDocumentFragment()
                  : document.createElement(el);
              const child = e.tree.child;
              for (const i of parse(e.loop)) {
                const a = makeDom(child, i);
                r.appendChild(a);
              }
              this.s.appendChild(r);
            }
          }
        ]
      }
    },
    {},
    getTemplate("dom-repeat")
  );

export default h
