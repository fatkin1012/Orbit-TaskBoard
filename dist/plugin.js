import { useState as h, useEffect as w, useCallback as u, useMemo as A, createElement as E } from "react";
import { createRoot as O } from "react-dom/client";
import { jsxs as i, jsx as a } from "react/jsx-runtime";
const g = "tasks", S = "1.0", _ = [
  { key: "todo", label: "待辦" },
  { key: "in-progress", label: "進行中" },
  { key: "done", label: "已完成" }
];
function D(t) {
  return Array.isArray(t) ? t.filter((s) => {
    if (!s || typeof s != "object")
      return !1;
    const o = s;
    return typeof o.id == "string" && typeof o.title == "string" && (o.status === "todo" || o.status === "in-progress" || o.status === "done") && typeof o.createdAt == "string";
  }).map((s) => ({ ...s })) : [];
}
function I({ context: t }) {
  const [s, o] = h([]), [d, y] = h(""), [T, C] = h(!1);
  w(() => {
    let e = !1;
    return (async () => {
      try {
        const r = await t.storage.get(g);
        if (e)
          return;
        const c = D((r == null ? void 0 : r.data) ?? []);
        o(c);
      } finally {
        e || C(!0);
      }
    })(), () => {
      e = !0;
    };
  }, [t]);
  const m = u(
    async (e) => {
      await t.storage.save(g, e, S), await t.eventBus.emit("TASK_COUNT_CHANGED", { count: e.length });
    },
    [t]
  ), l = u(
    (e) => {
      o((n) => {
        const r = e(n);
        return m(r), r;
      });
    },
    [m]
  ), f = u(() => {
    const e = d.trim();
    if (!e)
      return;
    const n = (/* @__PURE__ */ new Date()).toISOString();
    l((r) => [
      {
        id: crypto.randomUUID(),
        title: e,
        status: "todo",
        createdAt: n
      },
      ...r
    ]), y("");
  }, [d, l]), p = u(
    (e, n) => {
      l((r) => r.map((c) => c.id === e ? { ...c, status: n } : c));
    },
    [l]
  ), v = u(
    (e) => {
      l((n) => n.filter((r) => r.id !== e));
    },
    [l]
  ), b = A(() => _.reduce(
    (e, n) => (e[n.key] = s.filter((r) => r.status === n.key), e),
    {
      todo: [],
      "in-progress": [],
      done: []
    }
  ), [s]);
  return /* @__PURE__ */ i("section", { className: "task-board", "aria-busy": !T, children: [
    /* @__PURE__ */ i("header", { className: "task-board__header", children: [
      /* @__PURE__ */ i("div", { children: [
        /* @__PURE__ */ a("p", { className: "task-board__eyebrow", children: "Task Board" }),
        /* @__PURE__ */ a("h1", { children: "任務管理" })
      ] }),
      /* @__PURE__ */ i("p", { className: "task-board__count", children: [
        "總任務: ",
        s.length
      ] })
    ] }),
    /* @__PURE__ */ i("div", { className: "task-board__composer", children: [
      /* @__PURE__ */ a("label", { htmlFor: "new-task", className: "sr-only", children: "新增任務" }),
      /* @__PURE__ */ a(
        "input",
        {
          id: "new-task",
          type: "text",
          placeholder: "輸入任務內容...",
          value: d,
          onChange: (e) => y(e.target.value),
          onKeyDown: (e) => {
            e.key === "Enter" && f();
          }
        }
      ),
      /* @__PURE__ */ a("button", { type: "button", onClick: f, children: "新增" })
    ] }),
    /* @__PURE__ */ a("div", { className: "task-board__grid", children: _.map((e) => /* @__PURE__ */ i("article", { className: "task-column", children: [
      /* @__PURE__ */ i("header", { children: [
        /* @__PURE__ */ a("h2", { children: e.label }),
        /* @__PURE__ */ a("span", { children: b[e.key].length })
      ] }),
      /* @__PURE__ */ a("ul", { children: b[e.key].map((n) => /* @__PURE__ */ i("li", { className: "task-card", children: [
        /* @__PURE__ */ a("p", { children: n.title }),
        /* @__PURE__ */ i("div", { className: "task-card__actions", children: [
          e.key !== "todo" && /* @__PURE__ */ a("button", { type: "button", onClick: () => p(n.id, "todo"), children: "待辦" }),
          e.key !== "in-progress" && /* @__PURE__ */ a("button", { type: "button", onClick: () => p(n.id, "in-progress"), children: "進行中" }),
          e.key !== "done" && /* @__PURE__ */ a("button", { type: "button", onClick: () => p(n.id, "done"), children: "完成" }),
          /* @__PURE__ */ a("button", { type: "button", className: "danger", onClick: () => v(n.id), children: "刪除" })
        ] })
      ] }, n.id)) })
    ] }, e.key)) })
  ] });
}
const N = "plugin-task-board", k = /* @__PURE__ */ new WeakMap();
function R(t, s) {
  const o = document.createElement("div");
  o.id = N, t.appendChild(o);
  const d = O(o);
  k.set(t, d), d.render(E(I, { context: s }));
}
function z(t) {
  const s = k.get(t);
  s && (s.unmount(), k.delete(t)), t.innerHTML = "";
}
const j = {
  id: N,
  mount(t, s) {
    R(t, s);
  },
  unmount(t) {
    z(t);
  }
};
export {
  j as default
};
//# sourceMappingURL=plugin.js.map
