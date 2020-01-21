export const getTemplate = (t, e) => {
  const r = document.createElement("template");
  r.setAttribute("is", "custom");
  r.setAttribute("custom-element", t);
  r.innerHTML = e || "";
  return r;
};
