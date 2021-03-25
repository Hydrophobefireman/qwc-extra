import { init } from "../node_modules/@hydrophobefireman/qwc/dist/index.modern.js";
import { getTemplate } from "../getTemplate.js";

const tpl = getTemplate("cache-script");

const obj = {
  modifyPrototype(proto) {
    Object.defineProperties(proto, {
      _load: {
        value(abs, url) {
          let toFetch = false;
          if (this._corsSafe.includes(abs.host)) {
            toFetch = true;
          }
          if (!toFetch) return createScript({ src: url });
          return createScript(fetchScript(url));
        },
      },
      connectedCallback: {
        value() {
          this._corsSafe = [location.host];
          const props = this._pendingProps;
          if (props) this._load(props.abs, props.url);
          this._pendingProps = null;
        },
      },
    });
  },
  observedAttributes: [
    {
      prop: "cors-safe-origins",
      listener(o, n) {
        (this._corsSafe || (this._corsSafe = [])).concat(n.split(","));
      },
    },
    {
      prop: "src",
      listener(o, n) {
        const abs = new URL(n, location.href);
        const url = abs.toString();
        if (o === url || o === n) return;
        if (!this._corsSafe) {
          return (this._pendingProps = { abs, url });
        }
        this._load(abs, url);
      },
    },
  ],
};
function createScript(obj) {
  Promise.resolve(obj).then((data) =>
    document.head.appendChild(
      Object.assign(document.createElement("script"), data)
    )
  );
}
const hasCache = "caches" in self;
const fetchScript = hasCache
  ? (src) =>
      new Promise((resolve) =>
        caches.open("js").then((cache) =>
          cache.match(src).then((response) => {
            if (response) {
              response.text().then((x) => resolve(x));
            } else {
              fetch(src).then((resp) => {
                const clone = resp.clone();
                cache.put(src, clone);
                resp.text().then((x) => resolve({ text: x }));
              });
            }
          })
        )
      )
  : (src) =>
      new Promise((resolve) =>
        fetch(src)
          .then((x) => x.text())
          .then((txt) => resolve({ text: txt }))
      );

export default () =>
  init(
    {
      "cache-script": obj,
    },
    {},
    tpl
  );
