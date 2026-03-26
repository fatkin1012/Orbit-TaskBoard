import n, { useState as m, useRef as w, useEffect as _, useCallback as f, useMemo as R, createElement as D } from "react";
import { createRoot as I } from "react-dom/client";
const N = "tasks", z = "1.0.0", A = [
  { key: "todo", label: "待辦" },
  { key: "in-progress", label: "進行中" },
  { key: "done", label: "已完成" }
];
function K(t) {
  return Array.isArray(t) ? t.filter((r) => {
    if (!r || typeof r != "object")
      return !1;
    const s = r;
    return typeof s.id == "string" && typeof s.title == "string" && (s.status === "todo" || s.status === "in-progress" || s.status === "done") && typeof s.createdAt == "string";
  }).map((r) => ({ ...r })) : [];
}
function p(t, r = "root") {
  if (Array.isArray(t))
    return { source: r, value: t };
  if (typeof t == "string")
    try {
      const i = JSON.parse(t);
      return p(i, `${r}:json`);
    } catch {
      return null;
    }
  if (!t || typeof t != "object")
    return null;
  const s = t, c = ["data", "value", "payload", "tasks"];
  for (const i of c) {
    const u = p(s[i], `${r}.${i}`);
    if (u)
      return u;
  }
  return null;
}
function L({ context: t }) {
  const [r, s] = m([]), [c, i] = m(""), [u, S] = m(!1), [b, v] = m(!1), E = w(!1);
  _(() => {
    let e = !1;
    return (async () => {
      try {
        console.info("[task-board] restore start");
        const o = await t.storage.get(N);
        if (e)
          return;
        const l = p(o), T = K((l == null ? void 0 : l.value) ?? []);
        s(T), console.info("[task-board] restore success", {
          count: T.length,
          source: (l == null ? void 0 : l.source) ?? "empty"
        });
      } catch (o) {
        console.error("[task-board] restore failed", o);
      } finally {
        e || (v(!0), S(!0));
      }
    })(), () => {
      e = !0;
    };
  }, [t]), _(() => {
    if (b) {
      if (!E.current) {
        E.current = !0;
        return;
      }
      console.info("[task-board] save triggered", { count: r.length }), t.storage.save(N, r, z).then(() => t.eventBus.emit("TASK_COUNT_CHANGED", { count: r.length })).catch((e) => {
        console.error("[task-board] save failed", e);
      });
    }
  }, [t, b, r]);
  const d = f(
    (e) => {
      s((a) => e(a));
    },
    []
  ), g = f(() => {
    const e = c.trim();
    if (!e)
      return;
    const a = (/* @__PURE__ */ new Date()).toISOString();
    d((o) => [
      {
        id: crypto.randomUUID(),
        title: e,
        status: "todo",
        createdAt: a
      },
      ...o
    ]), i("");
  }, [c, d]), k = f(
    (e, a) => {
      d((o) => o.map((l) => l.id === e ? { ...l, status: a } : l));
    },
    [d]
  ), O = f(
    (e) => {
      d((a) => a.filter((o) => o.id !== e));
    },
    [d]
  ), h = R(() => A.reduce(
    (e, a) => (e[a.key] = r.filter((o) => o.status === a.key), e),
    {
      todo: [],
      "in-progress": [],
      done: []
    }
  ), [r]);
  return /* @__PURE__ */ n.createElement("section", { className: "task-board", "aria-busy": !u }, /* @__PURE__ */ n.createElement("header", { className: "task-board__header" }, /* @__PURE__ */ n.createElement("div", null, /* @__PURE__ */ n.createElement("p", { className: "task-board__eyebrow" }, "Task Board"), /* @__PURE__ */ n.createElement("h1", null, "任務管理")), /* @__PURE__ */ n.createElement("p", { className: "task-board__count" }, "總任務: ", r.length)), /* @__PURE__ */ n.createElement("div", { className: "task-board__composer" }, /* @__PURE__ */ n.createElement("label", { htmlFor: "new-task", className: "sr-only" }, "新增任務"), /* @__PURE__ */ n.createElement(
    "input",
    {
      id: "new-task",
      type: "text",
      placeholder: "輸入任務內容...",
      value: c,
      onChange: (e) => i(e.target.value),
      onKeyDown: (e) => {
        e.key === "Enter" && g();
      }
    }
  ), /* @__PURE__ */ n.createElement("button", { type: "button", onClick: g }, "新增")), /* @__PURE__ */ n.createElement("div", { className: "task-board__grid" }, A.map((e) => /* @__PURE__ */ n.createElement("article", { key: e.key, className: "task-column" }, /* @__PURE__ */ n.createElement("header", null, /* @__PURE__ */ n.createElement("h2", null, e.label), /* @__PURE__ */ n.createElement("span", null, h[e.key].length)), /* @__PURE__ */ n.createElement("ul", null, h[e.key].map((a) => /* @__PURE__ */ n.createElement("li", { key: a.id, className: "task-card" }, /* @__PURE__ */ n.createElement("p", null, a.title), /* @__PURE__ */ n.createElement("div", { className: "task-card__actions" }, e.key !== "todo" && /* @__PURE__ */ n.createElement("button", { type: "button", onClick: () => k(a.id, "todo") }, "待辦"), e.key !== "in-progress" && /* @__PURE__ */ n.createElement("button", { type: "button", onClick: () => k(a.id, "in-progress") }, "進行中"), e.key !== "done" && /* @__PURE__ */ n.createElement("button", { type: "button", onClick: () => k(a.id, "done") }, "完成"), /* @__PURE__ */ n.createElement("button", { type: "button", className: "danger", onClick: () => O(a.id) }, "刪除")))))))));
}
const C = "plugin-task-board", y = /* @__PURE__ */ new WeakMap();
function M(t, r) {
  const s = document.createElement("div");
  s.id = C, t.appendChild(s);
  const c = I(s);
  y.set(t, c), c.render(D(L, { context: r }));
}
function U(t) {
  const r = y.get(t);
  r && (r.unmount(), y.delete(t)), t.innerHTML = "";
}
const H = {
  id: C,
  mount(t, r) {
    M(t, r);
  },
  unmount(t) {
    U(t);
  }
};
export {
  H as default
};
//# sourceMappingURL=plugin.js.map
