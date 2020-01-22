import { init } from "../node_modules/@hydrophobefireman/qwc/dist/index.modern.js";
import { getTemplate } from "../getTemplate.js";

const empty = t => {
  for (let e; (e = t.lastChild); ) t.removeChild(e);
};

function render(dom, data, that) {
  empty(dom);
  if (typeof data === "function") data = data(getNPath(that));
  dom.appendChild(data);
}
function pathJoin(...parts) {
  const separator = "/";
  parts = parts.map((part, index) => {
    if (index) {
      part = part.replace(new RegExp("^" + separator), "");
    }
    if (index !== parts.length - 1) {
      part = part.replace(new RegExp(separator + "$"), "");
    }
    return part;
  });
  return parts.join(separator);
}
const LINK_CLICK_EVENT = "dom-router-on-link-click";
const _base = (document.querySelector("base") || {}).href;
const getBase = (t, sanitize) => {
  const base = t.base || _base;
  if (!sanitize) return base;
  return new URL(base || "/", location.href).pathname;
};
function getNPath(that) {
  const base = getBase(that);
  let np = window.location.pathname;
  base &&
    (np = new URL(
      np.replace(new URL(base, location.href).pathname, ""),
      location.href
    ).pathname);
  np = np.replace(/^\//, "");
  return np || "/";
}
const parse = t => ("string" == typeof t ? JSON.parse(t) : t);
const h = () =>
  init(
    {
      "dom-link": {
        modifyPrototype(pr) {
          Object.defineProperties(pr, {
            __oc: {
              value(e) {
                if (!this.a.href) return;
                e.preventDefault();
                window.history.pushState(
                  0,
                  0,
                  pathJoin(getBase(this, true), new URL(this.a.href).pathname)
                );
                dispatchEvent(new Event(LINK_CLICK_EVENT));
              }
            },
            disconnectedCallback: {
              value() {
                this.a.removeEventListener(this._oc);
              }
            },
            connectedCallback: {
              value() {
                this._oc = this.__oc.bind(this);
                this.a = this.s.getElementById("dom-link");
                this.a.addEventListener("click", this._oc);
                let o;
                while ((o = (this._pendingProps || []).pop())) {
                  this.a[o[0]] = o[1];
                }
              }
            },
            attributeChangedCallback: {
              value(p, o, n) {
                if (this.a) {
                  this.a[p] = n;
                } else {
                  const c = this._pendingProps || [];
                  this._pendingProps = c;
                  c.push([p, n]);
                }
              }
            }
          });
        },
        modifyConstructor(cls) {
          cls.observedAttributes = [
            "target",
            "download",
            "ping",
            "rel",
            "relList",
            "hreflang",
            "type",
            "referrerPolicy",
            "text",
            "coords",
            "charset",
            "name",
            "rev",
            "shape",
            "href",
            "origin",
            "protocol",
            "username",
            "password",
            "host",
            "hostname",
            "port",
            "pathname",
            "search",
            "hash",
            "style"
          ];
        }
      },
      "dom-router": {
        modifyPrototype(pr) {
          Object.defineProperties(pr, {
            paths: {
              get() {
                return this._paths;
              },
              set(t) {
                const e = this._paths;
                if (e === t) return;
                this._paths = t;
                this.setAttribute("path-data", Object.keys(t).join(", "));
                this._onPop();
              }
            },
            __onPop: {
              value() {
                const np = getNPath(this);
                if (np === this.current) return;
                const data = this._paths[np];
                this.current = np;
                render(this.s, data, this);
              }
            },
            connectedCallback: {
              value() {
                this._onPop = this.__onPop.bind(this);
                window.addEventListener(LINK_CLICK_EVENT, this._onPop);
                window.addEventListener("popstate", this._onPop);
              }
            },
            disconnectedCallback: {
              value() {
                window.removeEventListener(LINK_CLICK_EVENT, this._onPop);
                window.removeEventListener("popstate", this._onPop);
              }
            }
          });
        },
        observedAttributes: [{ prop: "base" }]
      }
    },
    {},
    [
      getTemplate("dom-router"),
      getTemplate("dom-link", "<a id='dom-link'><slot></slot></a>")
    ]
  );
export default h;
export { LINK_CLICK_EVENT };
