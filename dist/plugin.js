import t, { useState as d, useRef as S, useEffect as h, useCallback as u, useMemo as O, createElement as R } from "react";
import { createRoot as D } from "react-dom/client";
const _ = "tasks", I = "1.0.0", T = [
  { key: "todo", label: "待辦" },
  { key: "in-progress", label: "進行中" },
  { key: "done", label: "已完成" }
];
function z(r) {
  return Array.isArray(r) ? r.filter((a) => {
    if (!a || typeof a != "object")
      return !1;
    const s = a;
    return typeof s.id == "string" && typeof s.title == "string" && (s.status === "todo" || s.status === "in-progress" || s.status === "done") && typeof s.createdAt == "string";
  }).map((a) => ({ ...a })) : [];
}
function L({ context: r }) {
  const [a, s] = d([]), [l, f] = d(""), [v, C] = d(!1), [p, w] = d(!1), y = S(!1);
  h(() => {
    let e = !1;
    return (async () => {
      try {
        console.info("[task-board] restore start");
        const o = await r.storage.get(_);
        if (e)
          return;
        const i = o == null ? void 0 : o.data, g = z(i);
        s(g), console.info("[task-board] restore success", { count: g.length });
      } catch (o) {
        console.error("[task-board] restore failed", o);
      } finally {
        e || (w(!0), C(!0));
      }
    })(), () => {
      e = !0;
    };
  }, [r]), h(() => {
    if (p) {
      if (!y.current) {
        y.current = !0;
        return;
      }
      console.info("[task-board] save triggered", { count: a.length }), r.storage.save(_, a, I).then(() => r.eventBus.emit("TASK_COUNT_CHANGED", { count: a.length })).catch((e) => {
        console.error("[task-board] save failed", e);
      });
    }
  }, [r, p, a]);
  const c = u(
    (e) => {
      s((n) => e(n));
    },
    []
  ), E = u(() => {
    const e = l.trim();
    if (!e)
      return;
    const n = (/* @__PURE__ */ new Date()).toISOString();
    c((o) => [
      {
        id: crypto.randomUUID(),
        title: e,
        status: "todo",
        createdAt: n
      },
      ...o
    ]), f("");
  }, [l, c]), m = u(
    (e, n) => {
      c((o) => o.map((i) => i.id === e ? { ...i, status: n } : i));
    },
    [c]
  ), A = u(
    (e) => {
      c((n) => n.filter((o) => o.id !== e));
    },
    [c]
  ), b = O(() => T.reduce(
    (e, n) => (e[n.key] = a.filter((o) => o.status === n.key), e),
    {
      todo: [],
      "in-progress": [],
      done: []
    }
  ), [a]);
  return /* @__PURE__ */ t.createElement("section", { className: "task-board", "aria-busy": !v }, /* @__PURE__ */ t.createElement("header", { className: "task-board__header" }, /* @__PURE__ */ t.createElement("div", null, /* @__PURE__ */ t.createElement("p", { className: "task-board__eyebrow" }, "Task Board"), /* @__PURE__ */ t.createElement("h1", null, "任務管理")), /* @__PURE__ */ t.createElement("p", { className: "task-board__count" }, "總任務: ", a.length)), /* @__PURE__ */ t.createElement("div", { className: "task-board__composer" }, /* @__PURE__ */ t.createElement("label", { htmlFor: "new-task", className: "sr-only" }, "新增任務"), /* @__PURE__ */ t.createElement(
    "input",
    {
      id: "new-task",
      type: "text",
      placeholder: "輸入任務內容...",
      value: l,
      onChange: (e) => f(e.target.value),
      onKeyDown: (e) => {
        e.key === "Enter" && E();
      }
    }
  ), /* @__PURE__ */ t.createElement("button", { type: "button", onClick: E }, "新增")), /* @__PURE__ */ t.createElement("div", { className: "task-board__grid" }, T.map((e) => /* @__PURE__ */ t.createElement("article", { key: e.key, className: "task-column" }, /* @__PURE__ */ t.createElement("header", null, /* @__PURE__ */ t.createElement("h2", null, e.label), /* @__PURE__ */ t.createElement("span", null, b[e.key].length)), /* @__PURE__ */ t.createElement("ul", null, b[e.key].map((n) => /* @__PURE__ */ t.createElement("li", { key: n.id, className: "task-card" }, /* @__PURE__ */ t.createElement("p", null, n.title), /* @__PURE__ */ t.createElement("div", { className: "task-card__actions" }, e.key !== "todo" && /* @__PURE__ */ t.createElement("button", { type: "button", onClick: () => m(n.id, "todo") }, "待辦"), e.key !== "in-progress" && /* @__PURE__ */ t.createElement("button", { type: "button", onClick: () => m(n.id, "in-progress") }, "進行中"), e.key !== "done" && /* @__PURE__ */ t.createElement("button", { type: "button", onClick: () => m(n.id, "done") }, "完成"), /* @__PURE__ */ t.createElement("button", { type: "button", className: "danger", onClick: () => A(n.id) }, "刪除")))))))));
}
const N = "plugin-task-board", k = /* @__PURE__ */ new WeakMap();
function M(r, a) {
  const s = document.createElement("div");
  s.id = N, r.appendChild(s);
  const l = D(s);
  k.set(r, l), l.render(R(L, { context: a }));
}
function U(r) {
  const a = k.get(r);
  a && (a.unmount(), k.delete(r)), r.innerHTML = "";
}
const K = {
  id: N,
  mount(r, a) {
    M(r, a);
  },
  unmount(r) {
    U(r);
  }
};
export {
  K as default
};
//# sourceMappingURL=plugin.js.map
