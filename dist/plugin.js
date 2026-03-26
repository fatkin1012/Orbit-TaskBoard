import t, { useState as m, useEffect as C, useCallback as d, useMemo as v, createElement as w } from "react";
import { createRoot as A } from "react-dom/client";
const b = "tasks", O = "1.0", g = [
  { key: "todo", label: "待辦" },
  { key: "in-progress", label: "進行中" },
  { key: "done", label: "已完成" }
];
function S(a) {
  return Array.isArray(a) ? a.filter((s) => {
    if (!s || typeof s != "object")
      return !1;
    const o = s;
    return typeof o.id == "string" && typeof o.title == "string" && (o.status === "todo" || o.status === "in-progress" || o.status === "done") && typeof o.createdAt == "string";
  }).map((s) => ({ ...s })) : [];
}
function D({ context: a }) {
  const [s, o] = m([]), [l, k] = m(""), [N, T] = m(!1);
  C(() => {
    let e = !1;
    return (async () => {
      try {
        const r = await a.storage.get(b);
        if (e)
          return;
        const c = S((r == null ? void 0 : r.data) ?? []);
        o(c);
      } finally {
        e || T(!0);
      }
    })(), () => {
      e = !0;
    };
  }, [a]);
  const y = d(
    async (e) => {
      await a.storage.save(b, e, O), await a.eventBus.emit("TASK_COUNT_CHANGED", { count: e.length });
    },
    [a]
  ), i = d(
    (e) => {
      o((n) => {
        const r = e(n);
        return y(r), r;
      });
    },
    [y]
  ), E = d(() => {
    const e = l.trim();
    if (!e)
      return;
    const n = (/* @__PURE__ */ new Date()).toISOString();
    i((r) => [
      {
        id: crypto.randomUUID(),
        title: e,
        status: "todo",
        createdAt: n
      },
      ...r
    ]), k("");
  }, [l, i]), u = d(
    (e, n) => {
      i((r) => r.map((c) => c.id === e ? { ...c, status: n } : c));
    },
    [i]
  ), h = d(
    (e) => {
      i((n) => n.filter((r) => r.id !== e));
    },
    [i]
  ), f = v(() => g.reduce(
    (e, n) => (e[n.key] = s.filter((r) => r.status === n.key), e),
    {
      todo: [],
      "in-progress": [],
      done: []
    }
  ), [s]);
  return /* @__PURE__ */ t.createElement("section", { className: "task-board", "aria-busy": !N }, /* @__PURE__ */ t.createElement("header", { className: "task-board__header" }, /* @__PURE__ */ t.createElement("div", null, /* @__PURE__ */ t.createElement("p", { className: "task-board__eyebrow" }, "Task Board"), /* @__PURE__ */ t.createElement("h1", null, "任務管理")), /* @__PURE__ */ t.createElement("p", { className: "task-board__count" }, "總任務: ", s.length)), /* @__PURE__ */ t.createElement("div", { className: "task-board__composer" }, /* @__PURE__ */ t.createElement("label", { htmlFor: "new-task", className: "sr-only" }, "新增任務"), /* @__PURE__ */ t.createElement(
    "input",
    {
      id: "new-task",
      type: "text",
      placeholder: "輸入任務內容...",
      value: l,
      onChange: (e) => k(e.target.value),
      onKeyDown: (e) => {
        e.key === "Enter" && E();
      }
    }
  ), /* @__PURE__ */ t.createElement("button", { type: "button", onClick: E }, "新增")), /* @__PURE__ */ t.createElement("div", { className: "task-board__grid" }, g.map((e) => /* @__PURE__ */ t.createElement("article", { key: e.key, className: "task-column" }, /* @__PURE__ */ t.createElement("header", null, /* @__PURE__ */ t.createElement("h2", null, e.label), /* @__PURE__ */ t.createElement("span", null, f[e.key].length)), /* @__PURE__ */ t.createElement("ul", null, f[e.key].map((n) => /* @__PURE__ */ t.createElement("li", { key: n.id, className: "task-card" }, /* @__PURE__ */ t.createElement("p", null, n.title), /* @__PURE__ */ t.createElement("div", { className: "task-card__actions" }, e.key !== "todo" && /* @__PURE__ */ t.createElement("button", { type: "button", onClick: () => u(n.id, "todo") }, "待辦"), e.key !== "in-progress" && /* @__PURE__ */ t.createElement("button", { type: "button", onClick: () => u(n.id, "in-progress") }, "進行中"), e.key !== "done" && /* @__PURE__ */ t.createElement("button", { type: "button", onClick: () => u(n.id, "done") }, "完成"), /* @__PURE__ */ t.createElement("button", { type: "button", className: "danger", onClick: () => h(n.id) }, "刪除")))))))));
}
const _ = "plugin-task-board", p = /* @__PURE__ */ new WeakMap();
function R(a, s) {
  const o = document.createElement("div");
  o.id = _, a.appendChild(o);
  const l = A(o);
  p.set(a, l), l.render(w(D, { context: s }));
}
function I(a) {
  const s = p.get(a);
  s && (s.unmount(), p.delete(a)), a.innerHTML = "";
}
const M = {
  id: _,
  mount(a, s) {
    R(a, s);
  },
  unmount(a) {
    I(a);
  }
};
export {
  M as default
};
//# sourceMappingURL=plugin.js.map
