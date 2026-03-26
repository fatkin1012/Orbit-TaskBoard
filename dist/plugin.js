import a, { useState as C, useRef as ce, useEffect as V, useCallback as h, useMemo as S, createElement as le } from "react";
import { createRoot as ue } from "react-dom/client";
const $ = "task-boards", me = "tasks", T = "2.0.0", z = [
  { id: "todo", name: "待辦", order: 0 },
  { id: "doing", name: "進行中", order: 1 },
  { id: "done", name: "已完成", order: 2 }
];
function B(o) {
  if (typeof o != "string")
    return o;
  try {
    return JSON.parse(o);
  } catch {
    return o;
  }
}
function fe(o) {
  const t = B(o);
  if (!t || typeof t != "object")
    return t;
  const n = t;
  return "data" in n ? B(n.data) : t;
}
function W(o) {
  if (Array.isArray(o))
    return o;
  const t = B(o);
  if (!t || typeof t != "object")
    return null;
  const n = t, i = ["data", "value", "payload", "tasks"];
  for (const y of i) {
    const m = W(n[y]);
    if (m)
      return m;
  }
  return null;
}
function pe(o) {
  return Array.isArray(o) ? o.filter((t) => {
    if (!t || typeof t != "object")
      return !1;
    const n = t;
    return typeof n.id == "string" && typeof n.title == "string" && (n.status === "todo" || n.status === "in-progress" || n.status === "done") && typeof n.createdAt == "string";
  }).map((t) => ({ ...t })) : [];
}
function F(o) {
  return {
    id: crypto.randomUUID(),
    name: "我的任務板",
    columns: z.map((n) => ({ ...n })),
    cards: [],
    createdAt: o,
    updatedAt: o
  };
}
function H() {
  const o = (/* @__PURE__ */ new Date()).toISOString(), t = F(o);
  return {
    schemaVersion: T,
    activeBoardId: t.id,
    boards: [t]
  };
}
function ye(o) {
  if (!Array.isArray(o))
    return z.map((n) => ({ ...n }));
  const t = o.filter((n) => {
    if (!n || typeof n != "object")
      return !1;
    const i = n;
    return typeof i.id == "string" && typeof i.name == "string" && typeof i.order == "number" && Number.isFinite(i.order);
  }).map((n) => ({
    id: n.id,
    name: n.name.trim() || "未命名欄位",
    order: n.order
  })).sort((n, i) => n.order - i.order).map((n, i) => ({ ...n, order: i }));
  return t.length > 0 ? t : z.map((n) => ({ ...n }));
}
function ge(o, t) {
  var b;
  if (!Array.isArray(o))
    return [];
  const n = new Set(t.map((l) => l.id)), i = ((b = t[0]) == null ? void 0 : b.id) ?? "todo", y = o.filter((l) => {
    if (!l || typeof l != "object")
      return !1;
    const u = l;
    return typeof u.id == "string" && typeof u.title == "string" && typeof u.description == "string" && typeof u.columnId == "string" && typeof u.order == "number" && Number.isFinite(u.order) && typeof u.createdAt == "string" && typeof u.updatedAt == "string";
  }).map((l) => ({
    ...l,
    title: l.title.trim() || "未命名卡片",
    columnId: n.has(l.columnId) ? l.columnId : i
  })), m = /* @__PURE__ */ new Set(), E = y.map((l) => {
    if (!m.has(l.id))
      return m.add(l.id), l;
    const u = crypto.randomUUID();
    return m.add(u), {
      ...l,
      id: u
    };
  }), N = /* @__PURE__ */ new Map();
  for (const l of E) {
    const u = N.get(l.columnId) ?? [];
    u.push(l), N.set(l.columnId, u);
  }
  const k = [];
  for (const [l, u] of N.entries())
    u.sort((I, f) => I.order - f.order).forEach((I, f) => {
      k.push({ ...I, columnId: l, order: f });
    });
  return k;
}
function be(o) {
  return Array.isArray(o) ? o.filter((t) => {
    if (!t || typeof t != "object")
      return !1;
    const n = t;
    return typeof n.id == "string" && typeof n.name == "string" && typeof n.createdAt == "string" && typeof n.updatedAt == "string";
  }).map((t) => {
    const n = ye(t.columns), i = ge(t.cards, n);
    return {
      id: t.id,
      name: t.name.trim() || "未命名看板",
      columns: n,
      cards: i,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    };
  }) : [];
}
function Ee(o) {
  const t = pe(W(o) ?? []), n = (/* @__PURE__ */ new Date()).toISOString(), i = F(n), y = {
    todo: "todo",
    "in-progress": "doing",
    done: "done"
  };
  return i.cards = t.map((m, E) => ({
    id: m.id,
    title: m.title,
    description: "",
    columnId: y[m.status],
    order: E,
    createdAt: m.createdAt,
    updatedAt: m.createdAt
  })), i.updatedAt = n, {
    schemaVersion: T,
    activeBoardId: i.id,
    boards: [i]
  };
}
function he(o) {
  const t = fe(o), n = B(t);
  if (!n || typeof n != "object")
    return null;
  const i = n, y = be(i.boards);
  if (y.length === 0)
    return null;
  const m = typeof i.activeBoardId == "string" && y.some((E) => E.id === i.activeBoardId) ? i.activeBoardId : y[0].id;
  return {
    schemaVersion: T,
    activeBoardId: m,
    boards: y
  };
}
function O(o, t) {
  return o.filter((n) => n.columnId === t).sort((n, i) => n.order - i.order);
}
function Ce(o, t, n, i) {
  const y = o.find((f) => f.id === t);
  if (!y)
    return o;
  const m = o.filter((f) => f.id !== t), E = O(m, n), N = i === null ? E.length : Math.max(0, E.findIndex((f) => f.id === i)), k = {
    ...y,
    columnId: n,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  E.splice(N, 0, k);
  const b = E.map((f, w) => ({ ...f, order: w })), l = y.columnId;
  if (l === n)
    return [...m.filter((w) => w.columnId !== n), ...b];
  const u = O(m, l).map((f, w) => ({ ...f, order: w }));
  return [...m.filter((f) => f.columnId !== l && f.columnId !== n), ...u, ...b];
}
function Ne({ context: o }) {
  const [t, n] = C(() => H()), [i, y] = C(""), [m, E] = C(""), [N, k] = C({}), [b, l] = C(null), [u, I] = C({ title: "", description: "" }), [f, w] = C(null), [J, D] = C(null), [q, Q] = C(!1), [L, X] = C(!1), R = ce(!1);
  V(() => {
    let e = !1;
    return (async () => {
      try {
        const [r, c] = await Promise.all([
          o.storage.get($),
          o.storage.get(me)
        ]);
        if (e)
          return;
        const p = he(r);
        if (p) {
          n(p);
          return;
        }
        if (c) {
          n(Ee(c));
          return;
        }
        n(H());
      } catch (r) {
        console.error("[task-board] restore failed", r);
      } finally {
        e || (X(!0), Q(!0));
      }
    })(), () => {
      e = !0;
    };
  }, [o]), V(() => {
    if (L) {
      if (!R.current) {
        R.current = !0;
        return;
      }
      o.storage.save($, t, T).then(() => {
        const e = t.boards.reduce((s, r) => s + r.cards.length, 0);
        return o.eventBus.emit("TASK_COUNT_CHANGED", { count: e });
      }).catch((e) => {
        console.error("[task-board] save failed", e);
      });
    }
  }, [o, L, t]);
  const A = h((e) => {
    n((s) => e(s));
  }, []), d = S(
    () => t.boards.find((e) => e.id === t.activeBoardId) ?? t.boards[0] ?? null,
    [t.activeBoardId, t.boards]
  ), Z = S(
    () => t.boards.reduce((e, s) => e + s.cards.length, 0),
    [t.boards]
  ), g = h(
    (e, s) => {
      A((r) => ({
        ...r,
        boards: r.boards.map((c) => c.id !== e ? c : {
          ...s(c),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        })
      }));
    },
    [A]
  ), x = h(() => {
    const e = i.trim();
    if (!e)
      return;
    const s = (/* @__PURE__ */ new Date()).toISOString(), r = F(s);
    r.name = e, A((c) => ({
      ...c,
      boards: [...c.boards, r],
      activeBoardId: r.id
    })), y("");
  }, [i, A]), ee = h(
    (e) => {
      var c;
      const s = t.boards.find((p) => p.id === e);
      if (!s)
        return;
      const r = (c = window.prompt("輸入新的看板名稱", s.name)) == null ? void 0 : c.trim();
      r && g(e, (p) => ({ ...p, name: r }));
    },
    [t.boards, g]
  ), te = h(
    (e) => {
      if (t.boards.length <= 1) {
        window.alert("至少需要保留一個看板。");
        return;
      }
      const s = t.boards.find((r) => r.id === e);
      s && window.confirm(`確定刪除看板「${s.name}」嗎？`) && A((r) => {
        var p;
        const c = r.boards.filter((v) => v.id !== e);
        return {
          ...r,
          boards: c,
          activeBoardId: r.activeBoardId === e ? ((p = c[0]) == null ? void 0 : p.id) ?? null : r.activeBoardId
        };
      });
    },
    [A, t.boards]
  ), P = h(() => {
    if (!d)
      return;
    const e = m.trim();
    e && (g(d.id, (s) => ({
      ...s,
      columns: [...s.columns, { id: crypto.randomUUID(), name: e, order: s.columns.length }]
    })), E(""));
  }, [d, m, g]), re = h(
    (e) => {
      var c;
      if (!d)
        return;
      const s = d.columns.find((p) => p.id === e);
      if (!s)
        return;
      const r = (c = window.prompt("輸入新的欄位名稱", s.name)) == null ? void 0 : c.trim();
      r && g(d.id, (p) => ({
        ...p,
        columns: p.columns.map((v) => v.id === e ? { ...v, name: r } : v)
      }));
    },
    [d, g]
  ), ne = h(
    (e) => {
      if (!d || d.columns.length <= 1) {
        window.alert("至少需要保留一個欄位。");
        return;
      }
      const s = d.columns.find((r) => r.id === e);
      s && window.confirm(`確定刪除欄位「${s.name}」嗎？卡片會移到第一欄。`) && g(d.id, (r) => {
        var G;
        const c = r.columns.filter((_) => _.id !== e).map((_, ie) => ({ ..._, order: ie })), p = (G = c[0]) == null ? void 0 : G.id, v = p ? r.cards.map((_) => _.columnId === e ? { ..._, columnId: p } : _) : r.cards;
        return {
          ...r,
          columns: c,
          cards: v
        };
      });
    },
    [d, g]
  ), j = h(
    (e) => {
      if (!d)
        return;
      const s = (N[e] ?? "").trim();
      if (!s)
        return;
      const r = (/* @__PURE__ */ new Date()).toISOString();
      g(d.id, (c) => {
        const p = O(c.cards, e), v = {
          id: crypto.randomUUID(),
          title: s,
          description: "",
          columnId: e,
          order: p.length,
          createdAt: r,
          updatedAt: r
        };
        return {
          ...c,
          cards: [...c.cards, v]
        };
      }), k((c) => ({ ...c, [e]: "" }));
    },
    [d, N, g]
  ), K = h(
    (e) => {
      if (!d)
        return;
      const s = d.cards.find((r) => r.id === e);
      s && (l(e), I({ title: s.title, description: s.description }));
    },
    [d]
  ), ae = h(() => {
    if (!d || !b)
      return;
    const e = u.title.trim();
    if (!e) {
      window.alert("標題不能為空");
      return;
    }
    g(d.id, (s) => ({
      ...s,
      cards: s.cards.map(
        (r) => r.id === b ? {
          ...r,
          title: e,
          description: u.description.trim(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        } : r
      )
    })), l(null);
  }, [d, u.description, u.title, b, g]), oe = h(
    (e) => {
      d && (g(d.id, (s) => ({
        ...s,
        cards: s.cards.filter((r) => r.id !== e)
      })), b === e && l(null));
    },
    [d, b, g]
  ), M = h(
    (e, s) => {
      !d || !f || (g(d.id, (r) => ({
        ...r,
        cards: Ce(r.cards, f, e, s)
      })), w(null), D(null));
    },
    [d, f, g]
  ), se = S(() => !d || !b ? null : d.cards.find((e) => e.id === b) ?? null, [d, b]), de = S(() => d ? [...d.columns].sort((e, s) => e.order - s.order) : [], [d]);
  return /* @__PURE__ */ a.createElement("section", { className: "kanban-shell", "aria-busy": !q }, /* @__PURE__ */ a.createElement("aside", { className: "board-sidebar" }, /* @__PURE__ */ a.createElement("div", { className: "board-sidebar__head" }, /* @__PURE__ */ a.createElement("p", { className: "board-sidebar__eyebrow" }, "Orbit Board"), /* @__PURE__ */ a.createElement("h1", null, "我的看板"), /* @__PURE__ */ a.createElement("p", { className: "board-sidebar__count" }, "總卡片: ", Z)), /* @__PURE__ */ a.createElement("div", { className: "board-sidebar__composer" }, /* @__PURE__ */ a.createElement("label", { htmlFor: "new-board", className: "sr-only" }, "新增看板"), /* @__PURE__ */ a.createElement(
    "input",
    {
      id: "new-board",
      type: "text",
      placeholder: "新增看板名稱",
      value: i,
      onChange: (e) => y(e.target.value),
      onKeyDown: (e) => {
        e.key === "Enter" && x();
      }
    }
  ), /* @__PURE__ */ a.createElement("button", { type: "button", onClick: x }, "建立看板")), /* @__PURE__ */ a.createElement("ul", { className: "board-list", role: "list" }, t.boards.map((e) => /* @__PURE__ */ a.createElement("li", { key: e.id }, /* @__PURE__ */ a.createElement(
    "button",
    {
      type: "button",
      className: e.id === (d == null ? void 0 : d.id) ? "board-item board-item--active" : "board-item",
      onClick: () => A((s) => ({ ...s, activeBoardId: e.id }))
    },
    /* @__PURE__ */ a.createElement("span", null, e.name),
    /* @__PURE__ */ a.createElement("small", null, e.cards.length)
  ), /* @__PURE__ */ a.createElement("div", { className: "board-item__actions" }, /* @__PURE__ */ a.createElement("button", { type: "button", className: "ghost", onClick: () => ee(e.id) }, "改名"), /* @__PURE__ */ a.createElement("button", { type: "button", className: "danger", onClick: () => te(e.id) }, "刪除")))))), /* @__PURE__ */ a.createElement("div", { className: "kanban-workspace" }, /* @__PURE__ */ a.createElement("header", { className: "workspace-header" }, /* @__PURE__ */ a.createElement("div", null, /* @__PURE__ */ a.createElement("p", { className: "workspace-header__eyebrow" }, "Task Workspace"), /* @__PURE__ */ a.createElement("h2", null, (d == null ? void 0 : d.name) ?? "未選擇看板")), /* @__PURE__ */ a.createElement("div", { className: "workspace-header__column-composer" }, /* @__PURE__ */ a.createElement("label", { htmlFor: "new-column", className: "sr-only" }, "新增欄位"), /* @__PURE__ */ a.createElement(
    "input",
    {
      id: "new-column",
      type: "text",
      placeholder: "新增欄位名稱",
      value: m,
      onChange: (e) => E(e.target.value),
      onKeyDown: (e) => {
        e.key === "Enter" && P();
      }
    }
  ), /* @__PURE__ */ a.createElement("button", { type: "button", onClick: P }, "新增欄位"))), /* @__PURE__ */ a.createElement("div", { className: "lanes" }, de.map((e) => {
    const s = d ? O(d.cards, e.id) : [];
    return /* @__PURE__ */ a.createElement(
      "article",
      {
        key: e.id,
        className: J === e.id ? "lane lane--drop" : "lane",
        onDragOver: (r) => {
          r.preventDefault(), D(e.id);
        },
        onDragLeave: () => D((r) => r === e.id ? null : r),
        onDrop: (r) => {
          r.preventDefault(), M(e.id, null);
        }
      },
      /* @__PURE__ */ a.createElement("header", { className: "lane__header" }, /* @__PURE__ */ a.createElement("h3", null, e.name), /* @__PURE__ */ a.createElement("span", null, s.length)),
      /* @__PURE__ */ a.createElement("div", { className: "lane__header-actions" }, /* @__PURE__ */ a.createElement("button", { type: "button", className: "ghost", onClick: () => re(e.id) }, "改名"), /* @__PURE__ */ a.createElement("button", { type: "button", className: "danger", onClick: () => ne(e.id) }, "刪除")),
      /* @__PURE__ */ a.createElement("div", { className: "lane__composer" }, /* @__PURE__ */ a.createElement("label", { htmlFor: `new-card-${e.id}`, className: "sr-only" }, "新增卡片"), /* @__PURE__ */ a.createElement(
        "input",
        {
          id: `new-card-${e.id}`,
          type: "text",
          placeholder: "新增卡片標題",
          value: N[e.id] ?? "",
          onChange: (r) => k((c) => ({
            ...c,
            [e.id]: r.target.value
          })),
          onKeyDown: (r) => {
            r.key === "Enter" && j(e.id);
          }
        }
      ), /* @__PURE__ */ a.createElement("button", { type: "button", onClick: () => j(e.id) }, "新增卡片")),
      /* @__PURE__ */ a.createElement("ul", { className: "card-list", role: "list" }, s.map((r) => /* @__PURE__ */ a.createElement(
        "li",
        {
          key: r.id,
          className: f === r.id ? "card card--dragging" : "card",
          draggable: !0,
          onDragStart: (c) => {
            c.dataTransfer.effectAllowed = "move", w(r.id);
          },
          onDragEnd: () => {
            w(null), D(null);
          },
          onDragOver: (c) => {
            c.preventDefault(), D(e.id);
          },
          onDrop: (c) => {
            c.preventDefault(), M(e.id, r.id);
          }
        },
        /* @__PURE__ */ a.createElement("button", { type: "button", className: "card__body", onClick: () => K(r.id) }, /* @__PURE__ */ a.createElement("p", null, r.title), /* @__PURE__ */ a.createElement("small", null, r.description ? "已填寫詳情" : "尚無詳情")),
        /* @__PURE__ */ a.createElement("div", { className: "card__actions" }, /* @__PURE__ */ a.createElement("button", { type: "button", className: "ghost", onClick: () => K(r.id) }, "編輯"), /* @__PURE__ */ a.createElement("button", { type: "button", className: "danger", onClick: () => oe(r.id) }, "刪除"))
      )))
    );
  }))), se && /* @__PURE__ */ a.createElement("div", { className: "modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "card-modal-title" }, /* @__PURE__ */ a.createElement("div", { className: "modal__panel" }, /* @__PURE__ */ a.createElement("header", { className: "modal__header" }, /* @__PURE__ */ a.createElement("h4", { id: "card-modal-title" }, "卡片詳情"), /* @__PURE__ */ a.createElement("button", { type: "button", className: "ghost", onClick: () => l(null) }, "關閉")), /* @__PURE__ */ a.createElement("label", { htmlFor: "card-title" }, "標題"), /* @__PURE__ */ a.createElement(
    "input",
    {
      id: "card-title",
      type: "text",
      value: u.title,
      onChange: (e) => I((s) => ({ ...s, title: e.target.value }))
    }
  ), /* @__PURE__ */ a.createElement("label", { htmlFor: "card-desc" }, "描述"), /* @__PURE__ */ a.createElement(
    "textarea",
    {
      id: "card-desc",
      rows: 5,
      placeholder: "輸入和這張卡片相關的資訊",
      value: u.description,
      onChange: (e) => I((s) => ({ ...s, description: e.target.value }))
    }
  ), /* @__PURE__ */ a.createElement("div", { className: "modal__actions" }, /* @__PURE__ */ a.createElement("button", { type: "button", className: "ghost", onClick: () => l(null) }, "取消"), /* @__PURE__ */ a.createElement("button", { type: "button", onClick: ae }, "儲存")))));
}
const Y = "plugin-task-board", U = /* @__PURE__ */ new WeakMap();
function we(o, t) {
  const n = document.createElement("div");
  n.id = Y, o.appendChild(n);
  const i = ue(n);
  U.set(o, i), i.render(le(Ne, { context: t }));
}
function ve(o) {
  const t = U.get(o);
  t && (t.unmount(), U.delete(o)), o.innerHTML = "";
}
const Ae = {
  id: Y,
  mount(o, t) {
    we(o, t);
  },
  unmount(o) {
    ve(o);
  }
};
export {
  Ae as default
};
//# sourceMappingURL=plugin.js.map
