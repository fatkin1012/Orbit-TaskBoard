import a, { useState as w, useRef as pr, useEffect as H, useCallback as y, useMemo as D, createElement as mr } from "react";
import { createRoot as ur } from "react-dom/client";
const W = "task-boards", fr = "tasks", O = "2.0.0", T = [
  { id: "todo", name: "待辦", order: 0 },
  { id: "doing", name: "進行中", order: 1 },
  { id: "done", name: "已完成", order: 2 }
];
function z(o) {
  if (typeof o != "string")
    return o;
  try {
    return JSON.parse(o);
  } catch {
    return o;
  }
}
function gr(o) {
  const n = z(o);
  if (!n || typeof n != "object")
    return n;
  const e = n;
  return "data" in e ? z(e.data) : n;
}
function q(o) {
  if (Array.isArray(o))
    return o;
  const n = z(o);
  if (!n || typeof n != "object")
    return null;
  const e = n, s = ["data", "value", "payload", "tasks"];
  for (const f of s) {
    const m = q(e[f]);
    if (m)
      return m;
  }
  return null;
}
function br(o) {
  return Array.isArray(o) ? o.filter((n) => {
    if (!n || typeof n != "object")
      return !1;
    const e = n;
    return typeof e.id == "string" && typeof e.title == "string" && (e.status === "todo" || e.status === "in-progress" || e.status === "done") && typeof e.createdAt == "string";
  }).map((n) => ({ ...n })) : [];
}
function F(o) {
  return {
    id: crypto.randomUUID(),
    name: "我的任務板",
    columns: T.map((e) => ({ ...e })),
    cards: [],
    createdAt: o,
    updatedAt: o
  };
}
function J() {
  const o = (/* @__PURE__ */ new Date()).toISOString(), n = F(o);
  return {
    schemaVersion: O,
    activeBoardId: n.id,
    boards: [n]
  };
}
function hr(o) {
  if (!Array.isArray(o))
    return T.map((e) => ({ ...e }));
  const n = o.filter((e) => {
    if (!e || typeof e != "object")
      return !1;
    const s = e;
    return typeof s.id == "string" && typeof s.name == "string" && typeof s.order == "number" && Number.isFinite(s.order);
  }).map((e) => ({
    id: e.id,
    name: e.name.trim() || "未命名欄位",
    order: e.order
  })).sort((e, s) => e.order - s.order).map((e, s) => ({ ...e, order: s }));
  return n.length > 0 ? n : T.map((e) => ({ ...e }));
}
function xr(o, n) {
  var h;
  if (!Array.isArray(o))
    return [];
  const e = new Set(n.map((c) => c.id)), s = ((h = n[0]) == null ? void 0 : h.id) ?? "todo", f = o.filter((c) => {
    if (!c || typeof c != "object")
      return !1;
    const p = c;
    return typeof p.id == "string" && typeof p.title == "string" && typeof p.description == "string" && typeof p.columnId == "string" && typeof p.order == "number" && Number.isFinite(p.order) && typeof p.createdAt == "string" && typeof p.updatedAt == "string";
  }).map((c) => ({
    ...c,
    title: c.title.trim() || "未命名卡片",
    columnId: e.has(c.columnId) ? c.columnId : s
  })), m = /* @__PURE__ */ new Set(), x = f.map((c) => {
    if (!m.has(c.id))
      return m.add(c.id), c;
    const p = crypto.randomUUID();
    return m.add(p), {
      ...c,
      id: p
    };
  }), v = /* @__PURE__ */ new Map();
  for (const c of x) {
    const p = v.get(c.columnId) ?? [];
    p.push(c), v.set(c.columnId, p);
  }
  const C = [];
  for (const [c, p] of v.entries())
    p.sort((E, u) => E.order - u.order).forEach((E, u) => {
      C.push({ ...E, columnId: c, order: u });
    });
  return C;
}
function yr(o) {
  return Array.isArray(o) ? o.filter((n) => {
    if (!n || typeof n != "object")
      return !1;
    const e = n;
    return typeof e.id == "string" && typeof e.name == "string" && typeof e.createdAt == "string" && typeof e.updatedAt == "string";
  }).map((n) => {
    const e = hr(n.columns), s = xr(n.cards, e);
    return {
      id: n.id,
      name: n.name.trim() || "未命名看板",
      columns: e,
      cards: s,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt
    };
  }) : [];
}
function wr(o) {
  const n = br(q(o) ?? []), e = (/* @__PURE__ */ new Date()).toISOString(), s = F(e), f = {
    todo: "todo",
    "in-progress": "doing",
    done: "done"
  };
  return s.cards = n.map((m, x) => ({
    id: m.id,
    title: m.title,
    description: "",
    columnId: f[m.status],
    order: x,
    createdAt: m.createdAt,
    updatedAt: m.createdAt
  })), s.updatedAt = e, {
    schemaVersion: O,
    activeBoardId: s.id,
    boards: [s]
  };
}
function vr(o) {
  const n = gr(o), e = z(n);
  if (!e || typeof e != "object")
    return null;
  const s = e, f = yr(s.boards);
  if (f.length === 0)
    return null;
  const m = typeof s.activeBoardId == "string" && f.some((x) => x.id === s.activeBoardId) ? s.activeBoardId : f[0].id;
  return {
    schemaVersion: O,
    activeBoardId: m,
    boards: f
  };
}
function B(o, n) {
  return o.filter((e) => e.columnId === n).sort((e, s) => e.order - s.order);
}
function _r(o, n, e, s) {
  const f = o.find((u) => u.id === n);
  if (!f)
    return o;
  const m = o.filter((u) => u.id !== n), x = B(m, e), v = s === null ? x.length : Math.max(0, x.findIndex((u) => u.id === s)), C = {
    ...f,
    columnId: e,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  x.splice(v, 0, C);
  const h = x.map((u, _) => ({ ...u, order: _ })), c = f.columnId;
  if (c === e)
    return [...m.filter((_) => _.columnId !== e), ...h];
  const p = B(m, c).map((u, _) => ({ ...u, order: _ }));
  return [...m.filter((u) => u.columnId !== c && u.columnId !== e), ...p, ...h];
}
function kr({ context: o }) {
  const [n, e] = w(() => J()), [s, f] = w(""), [m, x] = w(""), [v, C] = w({}), [h, c] = w(null), [p, E] = w({ title: "", description: "" }), [u, _] = w(null), [Q, A] = w(null), [X, Z] = w(!1), [R, rr] = w(!1), P = pr(!1);
  H(() => {
    let r = !1;
    return (async () => {
      try {
        const [t, l] = await Promise.all([
          o.storage.get(W),
          o.storage.get(fr)
        ]);
        if (r)
          return;
        const g = vr(t);
        if (g) {
          e(g);
          return;
        }
        if (l) {
          e(wr(l));
          return;
        }
        e(J());
      } catch (t) {
        console.error("[task-board] restore failed", t);
      } finally {
        r || (rr(!0), Z(!0));
      }
    })(), () => {
      r = !0;
    };
  }, [o]), H(() => {
    if (R) {
      if (!P.current) {
        P.current = !0;
        return;
      }
      o.storage.save(W, n, O).then(() => {
        const r = n.boards.reduce((d, t) => d + t.cards.length, 0);
        return o.eventBus.emit("TASK_COUNT_CHANGED", { count: r });
      }).catch((r) => {
        console.error("[task-board] save failed", r);
      });
    }
  }, [o, R, n]);
  const N = y((r) => {
    e((d) => r(d));
  }, []), i = D(
    () => n.boards.find((r) => r.id === n.activeBoardId) ?? n.boards[0] ?? null,
    [n.activeBoardId, n.boards]
  ), nr = D(
    () => n.boards.reduce((r, d) => r + d.cards.length, 0),
    [n.boards]
  ), b = y(
    (r, d) => {
      N((t) => ({
        ...t,
        boards: t.boards.map((l) => l.id !== r ? l : {
          ...d(l),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        })
      }));
    },
    [N]
  ), M = y(() => {
    const r = s.trim();
    if (!r)
      return;
    const d = (/* @__PURE__ */ new Date()).toISOString(), t = F(d);
    t.name = r, N((l) => ({
      ...l,
      boards: [...l.boards, t],
      activeBoardId: t.id
    })), f("");
  }, [s, N]), er = y(
    (r) => {
      var l;
      const d = n.boards.find((g) => g.id === r);
      if (!d)
        return;
      const t = (l = window.prompt("輸入新的看板名稱", d.name)) == null ? void 0 : l.trim();
      t && b(r, (g) => ({ ...g, name: t }));
    },
    [n.boards, b]
  ), tr = y(
    (r) => {
      if (n.boards.length <= 1) {
        window.alert("至少需要保留一個看板。");
        return;
      }
      const d = n.boards.find((t) => t.id === r);
      d && window.confirm(`確定刪除看板「${d.name}」嗎？`) && N((t) => {
        var g;
        const l = t.boards.filter((k) => k.id !== r);
        return {
          ...t,
          boards: l,
          activeBoardId: t.activeBoardId === r ? ((g = l[0]) == null ? void 0 : g.id) ?? null : t.activeBoardId
        };
      });
    },
    [N, n.boards]
  ), K = y(() => {
    if (!i)
      return;
    const r = m.trim();
    r && (b(i.id, (d) => ({
      ...d,
      columns: [...d.columns, { id: crypto.randomUUID(), name: r, order: d.columns.length }]
    })), x(""));
  }, [i, m, b]), ar = y(
    (r) => {
      var l;
      if (!i)
        return;
      const d = i.columns.find((g) => g.id === r);
      if (!d)
        return;
      const t = (l = window.prompt("輸入新的欄位名稱", d.name)) == null ? void 0 : l.trim();
      t && b(i.id, (g) => ({
        ...g,
        columns: g.columns.map((k) => k.id === r ? { ...k, name: t } : k)
      }));
    },
    [i, b]
  ), or = y(
    (r) => {
      if (!i || i.columns.length <= 1) {
        window.alert("至少需要保留一個欄位。");
        return;
      }
      const d = i.columns.find((t) => t.id === r);
      d && window.confirm(`確定刪除欄位「${d.name}」嗎？卡片會移到第一欄。`) && b(i.id, (t) => {
        var V;
        const l = t.columns.filter((I) => I.id !== r).map((I, cr) => ({ ...I, order: cr })), g = (V = l[0]) == null ? void 0 : V.id, k = g ? t.cards.map((I) => I.columnId === r ? { ...I, columnId: g } : I) : t.cards;
        return {
          ...t,
          columns: l,
          cards: k
        };
      });
    },
    [i, b]
  ), G = y(
    (r) => {
      if (!i)
        return;
      const d = (v[r] ?? "").trim();
      if (!d)
        return;
      const t = (/* @__PURE__ */ new Date()).toISOString();
      b(i.id, (l) => {
        const g = B(l.cards, r), k = {
          id: crypto.randomUUID(),
          title: d,
          description: "",
          columnId: r,
          order: g.length,
          createdAt: t,
          updatedAt: t
        };
        return {
          ...l,
          cards: [...l.cards, k]
        };
      }), C((l) => ({ ...l, [r]: "" }));
    },
    [i, v, b]
  ), Y = y(
    (r) => {
      if (!i)
        return;
      const d = i.cards.find((t) => t.id === r);
      d && (c(r), E({ title: d.title, description: d.description }));
    },
    [i]
  ), dr = y(() => {
    if (!i || !h)
      return;
    const r = p.title.trim();
    if (!r) {
      window.alert("標題不能為空");
      return;
    }
    b(i.id, (d) => ({
      ...d,
      cards: d.cards.map(
        (t) => t.id === h ? {
          ...t,
          title: r,
          description: p.description.trim(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        } : t
      )
    })), c(null);
  }, [i, p.description, p.title, h, b]), ir = y(
    (r) => {
      i && (b(i.id, (d) => ({
        ...d,
        cards: d.cards.filter((t) => t.id !== r)
      })), h === r && c(null));
    },
    [i, h, b]
  ), $ = y(
    (r, d) => {
      !i || !u || (b(i.id, (t) => ({
        ...t,
        cards: _r(t.cards, u, r, d)
      })), _(null), A(null));
    },
    [i, u, b]
  ), sr = D(() => !i || !h ? null : i.cards.find((r) => r.id === h) ?? null, [i, h]), lr = D(() => i ? [...i.columns].sort((r, d) => r.order - d.order) : [], [i]);
  return /* @__PURE__ */ a.createElement("section", { className: "kanban-shell", "aria-busy": !X }, /* @__PURE__ */ a.createElement("aside", { className: "board-sidebar" }, /* @__PURE__ */ a.createElement("div", { className: "board-sidebar__head" }, /* @__PURE__ */ a.createElement("p", { className: "board-sidebar__eyebrow" }, "Orbit Board"), /* @__PURE__ */ a.createElement("h1", null, "我的看板"), /* @__PURE__ */ a.createElement("p", { className: "board-sidebar__count" }, "總卡片: ", nr)), /* @__PURE__ */ a.createElement("div", { className: "board-sidebar__composer" }, /* @__PURE__ */ a.createElement("label", { htmlFor: "new-board", className: "sr-only" }, "新增看板"), /* @__PURE__ */ a.createElement(
    "input",
    {
      id: "new-board",
      type: "text",
      placeholder: "新增看板名稱",
      value: s,
      onChange: (r) => f(r.target.value),
      onKeyDown: (r) => {
        r.key === "Enter" && M();
      }
    }
  ), /* @__PURE__ */ a.createElement("button", { type: "button", onClick: M }, "建立看板")), /* @__PURE__ */ a.createElement("ul", { className: "board-list", role: "list" }, n.boards.map((r) => /* @__PURE__ */ a.createElement("li", { key: r.id }, /* @__PURE__ */ a.createElement(
    "button",
    {
      type: "button",
      className: r.id === (i == null ? void 0 : i.id) ? "board-item board-item--active" : "board-item",
      onClick: () => N((d) => ({ ...d, activeBoardId: r.id }))
    },
    /* @__PURE__ */ a.createElement("span", null, r.name),
    /* @__PURE__ */ a.createElement("small", null, r.cards.length)
  ), /* @__PURE__ */ a.createElement("div", { className: "board-item__actions" }, /* @__PURE__ */ a.createElement("button", { type: "button", className: "ghost", onClick: () => er(r.id) }, "改名"), /* @__PURE__ */ a.createElement("button", { type: "button", className: "danger", onClick: () => tr(r.id) }, "刪除")))))), /* @__PURE__ */ a.createElement("div", { className: "kanban-workspace" }, /* @__PURE__ */ a.createElement("header", { className: "workspace-header" }, /* @__PURE__ */ a.createElement("div", null, /* @__PURE__ */ a.createElement("p", { className: "workspace-header__eyebrow" }, "Task Workspace"), /* @__PURE__ */ a.createElement("h2", null, (i == null ? void 0 : i.name) ?? "未選擇看板")), /* @__PURE__ */ a.createElement("div", { className: "workspace-header__column-composer" }, /* @__PURE__ */ a.createElement("label", { htmlFor: "new-column", className: "sr-only" }, "新增欄位"), /* @__PURE__ */ a.createElement(
    "input",
    {
      id: "new-column",
      type: "text",
      placeholder: "新增欄位名稱",
      value: m,
      onChange: (r) => x(r.target.value),
      onKeyDown: (r) => {
        r.key === "Enter" && K();
      }
    }
  ), /* @__PURE__ */ a.createElement("button", { type: "button", onClick: K }, "新增欄位"))), /* @__PURE__ */ a.createElement("div", { className: "lanes" }, lr.map((r) => {
    const d = i ? B(i.cards, r.id) : [];
    return /* @__PURE__ */ a.createElement(
      "article",
      {
        key: r.id,
        className: Q === r.id ? "lane lane--drop" : "lane",
        onDragOver: (t) => {
          t.preventDefault(), A(r.id);
        },
        onDragLeave: () => A((t) => t === r.id ? null : t),
        onDrop: (t) => {
          t.preventDefault(), $(r.id, null);
        }
      },
      /* @__PURE__ */ a.createElement("header", { className: "lane__header" }, /* @__PURE__ */ a.createElement("h3", null, r.name), /* @__PURE__ */ a.createElement("span", null, d.length)),
      /* @__PURE__ */ a.createElement("div", { className: "lane__header-actions" }, /* @__PURE__ */ a.createElement("button", { type: "button", className: "ghost", onClick: () => ar(r.id) }, "改名"), /* @__PURE__ */ a.createElement("button", { type: "button", className: "danger", onClick: () => or(r.id) }, "刪除")),
      /* @__PURE__ */ a.createElement("div", { className: "lane__composer" }, /* @__PURE__ */ a.createElement("label", { htmlFor: `new-card-${r.id}`, className: "sr-only" }, "新增卡片"), /* @__PURE__ */ a.createElement(
        "input",
        {
          id: `new-card-${r.id}`,
          type: "text",
          placeholder: "新增卡片標題",
          value: v[r.id] ?? "",
          onChange: (t) => C((l) => ({
            ...l,
            [r.id]: t.target.value
          })),
          onKeyDown: (t) => {
            t.key === "Enter" && G(r.id);
          }
        }
      ), /* @__PURE__ */ a.createElement("button", { type: "button", onClick: () => G(r.id) }, "新增卡片")),
      /* @__PURE__ */ a.createElement("ul", { className: "card-list", role: "list" }, d.map((t) => /* @__PURE__ */ a.createElement(
        "li",
        {
          key: t.id,
          className: u === t.id ? "card card--dragging" : "card",
          draggable: !0,
          onDragStart: (l) => {
            l.dataTransfer.effectAllowed = "move", _(t.id);
          },
          onDragEnd: () => {
            _(null), A(null);
          },
          onDragOver: (l) => {
            l.preventDefault(), A(r.id);
          },
          onDrop: (l) => {
            l.preventDefault(), $(r.id, t.id);
          }
        },
        /* @__PURE__ */ a.createElement("button", { type: "button", className: "card__body", onClick: () => Y(t.id) }, /* @__PURE__ */ a.createElement("p", null, t.title), /* @__PURE__ */ a.createElement("small", null, t.description ? "已填寫詳情" : "尚無詳情")),
        /* @__PURE__ */ a.createElement("div", { className: "card__actions" }, /* @__PURE__ */ a.createElement("button", { type: "button", className: "ghost", onClick: () => Y(t.id) }, "編輯"), /* @__PURE__ */ a.createElement("button", { type: "button", className: "danger", onClick: () => ir(t.id) }, "刪除"))
      )))
    );
  }))), sr && /* @__PURE__ */ a.createElement("div", { className: "modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "card-modal-title" }, /* @__PURE__ */ a.createElement("div", { className: "modal__panel" }, /* @__PURE__ */ a.createElement("header", { className: "modal__header" }, /* @__PURE__ */ a.createElement("h4", { id: "card-modal-title" }, "卡片詳情"), /* @__PURE__ */ a.createElement("button", { type: "button", className: "ghost", onClick: () => c(null) }, "關閉")), /* @__PURE__ */ a.createElement("label", { htmlFor: "card-title" }, "標題"), /* @__PURE__ */ a.createElement(
    "input",
    {
      id: "card-title",
      type: "text",
      value: p.title,
      onChange: (r) => E((d) => ({ ...d, title: r.target.value }))
    }
  ), /* @__PURE__ */ a.createElement("label", { htmlFor: "card-desc" }, "描述"), /* @__PURE__ */ a.createElement(
    "textarea",
    {
      id: "card-desc",
      rows: 5,
      placeholder: "輸入和這張卡片相關的資訊",
      value: p.description,
      onChange: (r) => E((d) => ({ ...d, description: r.target.value }))
    }
  ), /* @__PURE__ */ a.createElement("div", { className: "modal__actions" }, /* @__PURE__ */ a.createElement("button", { type: "button", className: "ghost", onClick: () => c(null) }, "取消"), /* @__PURE__ */ a.createElement("button", { type: "button", onClick: dr }, "儲存")))));
}
const Er = `body {\r
  color-scheme: light;\r
  --bg-1: #fff8e7;\r
  --bg-2: #dceeff;\r
  --ink: #17202b;\r
  --muted: #5f6977;\r
  --line: #d6dbe2;\r
  --surface: rgba(255, 255, 255, 0.84);\r
  --surface-strong: #ffffff;\r
  --primary: #1f63c0;\r
  --primary-2: #15468b;\r
  --danger: #be3030;\r
  --danger-2: #8f1e1e;\r
  margin: 0;\r
  font-family: "Sora", "Noto Sans TC", sans-serif;\r
  background:\r
    radial-gradient(circle at 16% 16%, var(--bg-1) 0%, transparent 36%),\r
    radial-gradient(circle at 92% 4%, var(--bg-2) 0%, transparent 38%),\r
    #f4f7fb;\r
  color: var(--ink);\r
}\r
\r
* {\r
  box-sizing: border-box;\r
}\r
\r
#plugin-task-board {\r
  min-height: 100dvh;\r
  padding: clamp(10px, 1.5vw, 22px);\r
}\r
\r
.kanban-shell {\r
  width: 100%;\r
  max-width: 100%;\r
  margin: 0 auto;\r
  min-height: calc(100dvh - clamp(20px, 3vw, 44px));\r
  border: 1px solid var(--line);\r
  border-radius: 22px;\r
  padding: clamp(10px, 1.2vw, 18px);\r
  display: grid;\r
  grid-template-columns: clamp(260px, 20vw, 360px) minmax(0, 1fr);\r
  gap: clamp(10px, 1.1vw, 16px);\r
  background: var(--surface);\r
  backdrop-filter: blur(8px);\r
  box-shadow: 0 22px 40px rgba(30, 40, 56, 0.14);\r
}\r
\r
.board-sidebar {\r
  border: 1px solid var(--line);\r
  border-radius: 16px;\r
  background: linear-gradient(164deg, #ffffff 0%, #f7fbff 100%);\r
  padding: 14px;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 12px;\r
  min-height: 0;\r
}\r
\r
.board-sidebar__head {\r
  border-bottom: 1px solid var(--line);\r
  padding-bottom: 10px;\r
}\r
\r
.board-sidebar__eyebrow,\r
.workspace-header__eyebrow {\r
  margin: 0;\r
  text-transform: uppercase;\r
  letter-spacing: 0.15em;\r
  font-size: 11px;\r
  color: var(--muted);\r
}\r
\r
h1 {\r
  margin: 2px 0 0;\r
  font-size: clamp(1.3rem, 1.6vw, 1.6rem);\r
}\r
\r
h2,\r
h3,\r
h4 {\r
  margin: 0;\r
}\r
\r
.board-sidebar__count {\r
  margin: 0;\r
  color: var(--muted);\r
  font-size: 13px;\r
}\r
\r
.board-sidebar__composer,\r
.workspace-header__column-composer,\r
.lane__composer {\r
  display: grid;\r
  grid-template-columns: minmax(0, 1fr) auto;\r
  gap: 8px;\r
  align-items: center;\r
}\r
\r
input {\r
  min-height: 44px;\r
  border: 1px solid var(--line);\r
  border-radius: 10px;\r
  padding: 0 14px;\r
  background: #fff;\r
  font-size: 16px;\r
  color: var(--ink);\r
}\r
\r
textarea {\r
  width: 100%;\r
  border: 1px solid var(--line);\r
  border-radius: 10px;\r
  padding: 12px;\r
  resize: vertical;\r
  font-family: inherit;\r
  font-size: 15px;\r
}\r
\r
button {\r
  min-height: 44px;\r
  border: 0;\r
  border-radius: 10px;\r
  padding: 0 12px;\r
  display: inline-flex;\r
  align-items: center;\r
  justify-content: center;\r
  white-space: nowrap;\r
  line-height: 1;\r
  font-weight: 700;\r
  background: linear-gradient(135deg, var(--primary), var(--primary-2));\r
  color: #fff;\r
  cursor: pointer;\r
  transition: transform 180ms ease, filter 180ms ease, box-shadow 180ms ease;\r
}\r
\r
.board-sidebar__composer button,\r
.workspace-header__column-composer button,\r
.lane__composer button {\r
  min-width: 84px;\r
}\r
\r
button:hover {\r
  transform: translateY(-1px);\r
  filter: brightness(1.04);\r
  box-shadow: 0 8px 18px rgba(23, 68, 136, 0.24);\r
}\r
\r
button:focus-visible,\r
textarea:focus-visible,\r
input:focus-visible {\r
  outline: 3px solid #8fc5ff;\r
  outline-offset: 2px;\r
}\r
\r
.ghost {\r
  background: #e5edf9;\r
  color: #182c45;\r
  border: 1px solid #c4d2e7;\r
}\r
\r
.ghost:hover {\r
  filter: brightness(1.02);\r
  box-shadow: 0 8px 14px rgba(65, 90, 120, 0.2);\r
}\r
\r
.danger {\r
  background: linear-gradient(135deg, var(--danger), var(--danger-2));\r
  color: #fff;\r
  border: 1px solid #7f1b1b;\r
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);\r
}\r
\r
.danger:hover {\r
  filter: brightness(1.08);\r
  box-shadow: 0 10px 18px rgba(143, 30, 30, 0.32);\r
}\r
\r
.board-list,\r
.card-list {\r
  list-style: none;\r
  padding: 0;\r
  margin: 0;\r
}\r
\r
.board-list {\r
  display: grid;\r
  gap: 10px;\r
  overflow: auto;\r
}\r
\r
.board-list li {\r
  border: 1px solid var(--line);\r
  border-radius: 12px;\r
  background: #fff;\r
  padding: 8px;\r
}\r
\r
.board-item {\r
  width: 100%;\r
  min-height: 50px;\r
  padding: 10px;\r
  border-radius: 10px;\r
  border: 1px solid transparent;\r
  display: flex;\r
  justify-content: space-between;\r
  align-items: center;\r
  background: #f5f9ff;\r
  color: #203245;\r
  box-shadow: none;\r
}\r
\r
.board-item small {\r
  font-size: 12px;\r
  color: var(--muted);\r
}\r
\r
.board-item--active {\r
  border-color: #9bc3ff;\r
  background: #e6f1ff;\r
}\r
\r
.board-item__actions {\r
  margin-top: 6px;\r
  display: grid;\r
  grid-template-columns: 1fr 1fr;\r
  gap: 6px;\r
}\r
\r
.board-item__actions button {\r
  min-height: 36px;\r
  font-size: 13px;\r
}\r
\r
.kanban-workspace {\r
  border: 1px solid var(--line);\r
  border-radius: 16px;\r
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);\r
  padding: clamp(10px, 1vw, 16px);\r
  display: flex;\r
  flex-direction: column;\r
  min-height: 0;\r
}\r
\r
.workspace-header {\r
  display: flex;\r
  align-items: end;\r
  justify-content: space-between;\r
  gap: 14px;\r
  margin-bottom: 12px;\r
}\r
\r
.workspace-header h2 {\r
  font-size: clamp(1.2rem, 2vw, 1.8rem);\r
}\r
\r
.workspace-header__column-composer {\r
  width: min(680px, 100%);\r
}\r
\r
.lanes {\r
  display: grid;\r
  grid-auto-flow: column;\r
  grid-auto-columns: minmax(clamp(260px, 24vw, 340px), 1fr);\r
  gap: clamp(8px, 1vw, 14px);\r
  overflow-x: auto;\r
  overflow-y: hidden;\r
  padding-bottom: 8px;\r
}\r
\r
.lane {\r
  border: 1px solid var(--line);\r
  border-radius: 14px;\r
  background: #f8fbff;\r
  padding: 10px;\r
  display: flex;\r
  flex-direction: column;\r
  gap: 8px;\r
  min-height: 340px;\r
}\r
\r
.lane--drop {\r
  border-color: #96beff;\r
  background: #eaf4ff;\r
}\r
\r
.lane__header {\r
  display: flex;\r
  justify-content: space-between;\r
  align-items: center;\r
}\r
\r
.lane__header span {\r
  min-width: 28px;\r
  min-height: 28px;\r
  border-radius: 999px;\r
  display: inline-grid;\r
  place-items: center;\r
  background: #e3edf8;\r
  font-weight: 700;\r
}\r
\r
.lane__header-actions {\r
  display: grid;\r
  grid-template-columns: 1fr 1fr;\r
  gap: 6px;\r
}\r
\r
.lane__header-actions button,\r
.lane__composer button {\r
  min-height: 36px;\r
  font-size: 13px;\r
}\r
\r
.card-list {\r
  display: grid;\r
  gap: 8px;\r
}\r
\r
.card {\r
  border: 1px solid #cfd8e4;\r
  border-radius: 12px;\r
  background: var(--surface-strong);\r
  padding: 8px;\r
  display: grid;\r
  gap: 8px;\r
  box-shadow: 0 4px 10px rgba(40, 54, 72, 0.08);\r
}\r
\r
.card--dragging {\r
  opacity: 0.55;\r
}\r
\r
.card__body {\r
  min-height: 70px;\r
  text-align: left;\r
  width: 100%;\r
  display: block;\r
  border: 1px solid #d7e0ec;\r
  border-radius: 10px;\r
  background: #fbfdff;\r
  color: #1a2430;\r
  padding: 10px;\r
  box-shadow: none;\r
  white-space: normal;\r
  overflow-wrap: anywhere;\r
}\r
\r
.card__body p {\r
  margin: 0;\r
  font-weight: 600;\r
  line-height: 1.4;\r
  word-break: break-word;\r
}\r
\r
.card__body small {\r
  display: block;\r
  margin-top: 6px;\r
  color: var(--muted);\r
  line-height: 1.35;\r
  word-break: break-word;\r
}\r
\r
.card__actions {\r
  display: grid;\r
  grid-template-columns: 1fr 1fr;\r
  gap: 6px;\r
}\r
\r
.card__actions button {\r
  min-height: 34px;\r
  font-size: 13px;\r
}\r
\r
.modal {\r
  position: fixed;\r
  inset: 0;\r
  background: rgba(17, 25, 36, 0.42);\r
  display: grid;\r
  place-items: center;\r
  padding: 14px;\r
  z-index: 100;\r
}\r
\r
.modal__panel {\r
  width: min(560px, 100%);\r
  border-radius: 16px;\r
  border: 1px solid var(--line);\r
  background: #fff;\r
  padding: 14px;\r
  box-shadow: 0 20px 42px rgba(23, 33, 48, 0.24);\r
  display: grid;\r
  gap: 10px;\r
}\r
\r
.modal__header {\r
  display: flex;\r
  justify-content: space-between;\r
  align-items: center;\r
}\r
\r
.modal label {\r
  font-size: 14px;\r
  font-weight: 600;\r
}\r
\r
.modal__actions {\r
  display: flex;\r
  justify-content: end;\r
  gap: 8px;\r
}\r
\r
.sr-only {\r
  position: absolute;\r
  width: 1px;\r
  height: 1px;\r
  padding: 0;\r
  margin: -1px;\r
  overflow: hidden;\r
  clip: rect(0, 0, 0, 0);\r
  border: 0;\r
}\r
\r
@media (max-width: 960px) {\r
  #plugin-task-board {\r
    padding: 10px;\r
  }\r
\r
  .kanban-shell {\r
    grid-template-columns: 1fr;\r
    padding: 10px;\r
    min-height: auto;\r
  }\r
\r
  .workspace-header {\r
    flex-direction: column;\r
    align-items: stretch;\r
  }\r
\r
  .workspace-header__column-composer {\r
    width: 100%;\r
  }\r
\r
  .lanes {\r
    grid-auto-flow: row;\r
    grid-auto-columns: auto;\r
    grid-template-columns: 1fr;\r
    overflow-x: visible;\r
    overflow-y: visible;\r
  }\r
}\r
`, L = "plugin-task-board", j = `${L}-styles`;
let S = 0;
const U = /* @__PURE__ */ new WeakMap();
function Cr(o, n) {
  if (!document.getElementById(j)) {
    const f = document.createElement("style");
    f.id = j, f.textContent = Er, document.head.appendChild(f);
  }
  S++;
  const e = document.createElement("div");
  e.id = L, o.appendChild(e);
  const s = ur(e);
  U.set(o, s), s.render(mr(kr, { context: n }));
}
function Nr(o) {
  const n = U.get(o);
  if (n && (n.unmount(), U.delete(o)), o.innerHTML = "", S = Math.max(0, S - 1), S === 0) {
    const e = document.getElementById(j);
    e && e.remove();
  }
}
const Dr = {
  id: L,
  mount(o, n) {
    Cr(o, n);
  },
  unmount(o) {
    Nr(o);
  }
};
export {
  Dr as default
};
//# sourceMappingURL=plugin.js.map
