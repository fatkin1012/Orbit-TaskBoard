import o, { useState as x, useRef as V, useEffect as H, useCallback as g, useMemo as T, createElement as Ar } from "react";
import { createRoot as Dr } from "react-dom/client";
const cr = "task-boards", Br = "tasks", L = "2.0.0", W = [
  { id: "todo", name: "待辦", order: 0 },
  { id: "doing", name: "進行中", order: 1 },
  { id: "done", name: "已完成", order: 2 }
];
function F(i) {
  if (typeof i != "string")
    return i;
  try {
    return JSON.parse(i);
  } catch {
    return i;
  }
}
function Sr(i) {
  const e = F(i);
  if (!e || typeof e != "object")
    return e;
  const t = e;
  return "data" in t ? F(t.data) : e;
}
function mr(i) {
  if (Array.isArray(i))
    return i;
  const e = F(i);
  if (!e || typeof e != "object")
    return null;
  const t = e, l = ["data", "value", "payload", "tasks"];
  for (const p of l) {
    const u = mr(t[p]);
    if (u)
      return u;
  }
  return null;
}
function zr(i) {
  return Array.isArray(i) ? i.filter((e) => {
    if (!e || typeof e != "object")
      return !1;
    const t = e;
    return typeof t.id == "string" && typeof t.title == "string" && (t.status === "todo" || t.status === "in-progress" || t.status === "done") && typeof t.createdAt == "string";
  }).map((e) => ({ ...e })) : [];
}
function Q(i) {
  return {
    id: crypto.randomUUID(),
    name: "我的任務板",
    columns: W.map((t) => ({ ...t })),
    cards: [],
    createdAt: i,
    updatedAt: i
  };
}
function ur() {
  const i = (/* @__PURE__ */ new Date()).toISOString(), e = Q(i);
  return {
    schemaVersion: L,
    activeBoardId: e.id,
    boards: [e]
  };
}
function Rr(i) {
  if (!Array.isArray(i))
    return W.map((t) => ({ ...t }));
  const e = i.filter((t) => {
    if (!t || typeof t != "object")
      return !1;
    const l = t;
    return typeof l.id == "string" && typeof l.name == "string" && typeof l.order == "number" && Number.isFinite(l.order);
  }).map((t) => ({
    id: t.id,
    name: t.name.trim() || "未命名欄位",
    order: t.order
  })).sort((t, l) => t.order - l.order).map((t, l) => ({ ...t, order: l }));
  return e.length > 0 ? e : W.map((t) => ({ ...t }));
}
function Or(i, e) {
  var y;
  if (!Array.isArray(i))
    return [];
  const t = new Set(e.map((c) => c.id)), l = ((y = e[0]) == null ? void 0 : y.id) ?? "todo", p = i.filter((c) => {
    if (!c || typeof c != "object")
      return !1;
    const m = c;
    return typeof m.id == "string" && typeof m.title == "string" && typeof m.description == "string" && typeof m.columnId == "string" && typeof m.order == "number" && Number.isFinite(m.order) && typeof m.createdAt == "string" && typeof m.updatedAt == "string";
  }).map((c) => ({
    ...c,
    title: c.title.trim() || "未命名卡片",
    columnId: t.has(c.columnId) ? c.columnId : l
  })), u = /* @__PURE__ */ new Set(), h = p.map((c) => {
    if (!u.has(c.id))
      return u.add(c.id), c;
    const m = crypto.randomUUID();
    return u.add(m), {
      ...c,
      id: m
    };
  }), v = /* @__PURE__ */ new Map();
  for (const c of h) {
    const m = v.get(c.columnId) ?? [];
    m.push(c), v.set(c.columnId, m);
  }
  const _ = [];
  for (const [c, m] of v.entries())
    m.sort((k, f) => k.order - f.order).forEach((k, f) => {
      _.push({ ...k, columnId: c, order: f });
    });
  return _;
}
function Tr(i) {
  return Array.isArray(i) ? i.filter((e) => {
    if (!e || typeof e != "object")
      return !1;
    const t = e;
    return typeof t.id == "string" && typeof t.name == "string" && typeof t.createdAt == "string" && typeof t.updatedAt == "string";
  }).map((e) => {
    const t = Rr(e.columns), l = Or(e.cards, t);
    return {
      id: e.id,
      name: e.name.trim() || "未命名看板",
      columns: t,
      cards: l,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt
    };
  }) : [];
}
function jr(i) {
  const e = zr(mr(i) ?? []), t = (/* @__PURE__ */ new Date()).toISOString(), l = Q(t), p = {
    todo: "todo",
    "in-progress": "doing",
    done: "done"
  };
  return l.cards = e.map((u, h) => ({
    id: u.id,
    title: u.title,
    description: "",
    columnId: p[u.status],
    order: h,
    createdAt: u.createdAt,
    updatedAt: u.createdAt
  })), l.updatedAt = t, {
    schemaVersion: L,
    activeBoardId: l.id,
    boards: [l]
  };
}
function Fr(i) {
  const e = Sr(i), t = F(e);
  if (!t || typeof t != "object")
    return null;
  const l = t, p = Tr(l.boards);
  if (p.length === 0)
    return null;
  const u = typeof l.activeBoardId == "string" && p.some((h) => h.id === l.activeBoardId) ? l.activeBoardId : p[0].id;
  return {
    schemaVersion: L,
    activeBoardId: u,
    boards: p
  };
}
function U(i, e) {
  return i.filter((t) => t.columnId === e).sort((t, l) => t.order - l.order);
}
function Ur(i, e, t, l) {
  const p = i.find((f) => f.id === e);
  if (!p)
    return i;
  const u = i.filter((f) => f.id !== e), h = U(u, t), v = l === null ? h.length : Math.max(0, h.findIndex((f) => f.id === l)), _ = {
    ...p,
    columnId: t,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  h.splice(v, 0, _);
  const y = h.map((f, C) => ({ ...f, order: C })), c = p.columnId;
  if (c === t)
    return [...u.filter((C) => C.columnId !== t), ...y];
  const m = U(u, c).map((f, C) => ({ ...f, order: C }));
  return [...u.filter((f) => f.columnId !== c && f.columnId !== t), ...m, ...y];
}
function Lr({ context: i }) {
  const [e, t] = x(() => ur()), [l, p] = x(""), [u, h] = x(null), [v, _] = x(""), [y, c] = x(null), [m, k] = x(""), [f, C] = x(""), [K, Z] = x({}), [N, D] = x(null), [A, P] = x({ title: "", description: "" }), [z, M] = x(null), [pr, B] = x(null), [fr, gr] = x(!1), [rr, br] = x(!1), nr = V(!1), G = V(!1), Y = V(!1);
  H(() => {
    let r = !1;
    return (async () => {
      try {
        const [n, s] = await Promise.all([
          i.storage.get(cr),
          i.storage.get(Br)
        ]);
        if (r)
          return;
        const w = Fr(n);
        if (w) {
          t(w);
          return;
        }
        if (s) {
          t(jr(s));
          return;
        }
        t(ur());
      } catch (n) {
        console.error("[task-board] restore failed", n);
      } finally {
        r || (br(!0), gr(!0));
      }
    })(), () => {
      r = !0;
    };
  }, [i]), H(() => {
    if (rr) {
      if (!nr.current) {
        nr.current = !0;
        return;
      }
      i.storage.save(cr, e, L).then(() => {
        const r = e.boards.reduce((a, n) => a + n.cards.length, 0);
        return i.eventBus.emit("TASK_COUNT_CHANGED", { count: r });
      }).catch((r) => {
        console.error("[task-board] save failed", r);
      });
    }
  }, [i, rr, e]);
  const E = g((r) => {
    t((a) => r(a));
  }, []), d = T(
    () => e.boards.find((r) => r.id === e.activeBoardId) ?? e.boards[0] ?? null,
    [e.activeBoardId, e.boards]
  ), hr = T(
    () => e.boards.reduce((r, a) => r + a.cards.length, 0),
    [e.boards]
  ), b = g(
    (r, a) => {
      E((n) => ({
        ...n,
        boards: n.boards.map((s) => s.id !== r ? s : {
          ...a(s),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        })
      }));
    },
    [E]
  ), er = g(() => {
    const r = l.trim();
    if (!r)
      return;
    const a = (/* @__PURE__ */ new Date()).toISOString(), n = Q(a);
    n.name = r, E((s) => ({
      ...s,
      boards: [...s.boards, n],
      activeBoardId: n.id
    })), p("");
  }, [l, E]), tr = g(
    (r) => {
      const a = e.boards.find((n) => n.id === r);
      a && (h(r), _(a.name), E((n) => ({
        ...n,
        activeBoardId: r
      })));
    },
    [E, e.boards]
  ), R = g(
    (r) => {
      const a = v.trim();
      if (!a) {
        window.alert("看板名稱不能為空。");
        return;
      }
      b(r, (n) => ({ ...n, name: a })), h(null), _("");
    },
    [v, b]
  ), xr = g(
    (r) => {
      if (u === r) {
        R(r);
        return;
      }
      tr(r);
    },
    [u, R, tr]
  ), yr = g(() => {
    h(null), _("");
  }, []), wr = g(
    (r) => {
      if (e.boards.length <= 1) {
        window.alert("至少需要保留一個看板。");
        return;
      }
      const a = e.boards.find((n) => n.id === r);
      a && window.confirm(`確定刪除看板「${a.name}」嗎？`) && E((n) => {
        var w;
        const s = n.boards.filter((S) => S.id !== r);
        return {
          ...n,
          boards: s,
          activeBoardId: n.activeBoardId === r ? ((w = s[0]) == null ? void 0 : w.id) ?? null : n.activeBoardId
        };
      });
    },
    [E, e.boards]
  ), ar = g(() => {
    if (!d)
      return;
    const r = f.trim();
    r && (b(d.id, (a) => ({
      ...a,
      columns: [...a.columns, { id: crypto.randomUUID(), name: r, order: a.columns.length }]
    })), C(""));
  }, [d, f, b]), or = g(
    (r) => {
      if (!d)
        return;
      const a = d.columns.find((n) => n.id === r);
      a && (c(r), k(a.name));
    },
    [d]
  ), O = g(
    (r) => {
      if (!d)
        return;
      const a = m.trim();
      if (!a) {
        window.alert("欄位名稱不能為空。");
        return;
      }
      b(d.id, (n) => ({
        ...n,
        columns: n.columns.map((s) => s.id === r ? { ...s, name: a } : s)
      })), c(null), k("");
    },
    [d, m, b]
  ), vr = g(
    (r) => {
      if (y === r) {
        O(r);
        return;
      }
      or(r);
    },
    [y, O, or]
  ), $ = g(() => {
    c(null), k("");
  }, []);
  H(() => {
    if (!d || !y)
      return;
    d.columns.some((a) => a.id === y) || $();
  }, [d, $, y]);
  const _r = g(
    (r) => {
      if (!d || d.columns.length <= 1) {
        window.alert("至少需要保留一個欄位。");
        return;
      }
      const a = d.columns.find((n) => n.id === r);
      a && window.confirm(`確定刪除欄位「${a.name}」嗎？卡片會移到第一欄。`) && b(d.id, (n) => {
        var lr;
        const s = n.columns.filter((I) => I.id !== r).map((I, Ir) => ({ ...I, order: Ir })), w = (lr = s[0]) == null ? void 0 : lr.id, S = w ? n.cards.map((I) => I.columnId === r ? { ...I, columnId: w } : I) : n.cards;
        return {
          ...n,
          columns: s,
          cards: S
        };
      });
    },
    [d, b]
  ), ir = g(
    (r) => {
      if (!d)
        return;
      const a = (K[r] ?? "").trim();
      if (!a)
        return;
      const n = (/* @__PURE__ */ new Date()).toISOString();
      b(d.id, (s) => {
        const w = U(s.cards, r), S = {
          id: crypto.randomUUID(),
          title: a,
          description: "",
          columnId: r,
          order: w.length,
          createdAt: n,
          updatedAt: n
        };
        return {
          ...s,
          cards: [...s.cards, S]
        };
      }), Z((s) => ({ ...s, [r]: "" }));
    },
    [d, K, b]
  ), dr = g(
    (r) => {
      if (!d)
        return;
      const a = d.cards.find((n) => n.id === r);
      a && (D(r), P({ title: a.title, description: a.description }));
    },
    [d]
  ), kr = g(() => {
    if (!d || !N)
      return;
    const r = A.title.trim();
    if (!r) {
      window.alert("標題不能為空");
      return;
    }
    b(d.id, (a) => ({
      ...a,
      cards: a.cards.map(
        (n) => n.id === N ? {
          ...n,
          title: r,
          description: A.description.trim(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        } : n
      )
    })), D(null);
  }, [d, A.description, A.title, N, b]), Er = g(
    (r) => {
      d && (b(d.id, (a) => ({
        ...a,
        cards: a.cards.filter((n) => n.id !== r)
      })), N === r && D(null));
    },
    [d, N, b]
  ), sr = g(
    (r, a) => {
      !d || !z || (b(d.id, (n) => ({
        ...n,
        cards: Ur(n.cards, z, r, a)
      })), M(null), B(null));
    },
    [d, z, b]
  ), Cr = T(() => !d || !N ? null : d.cards.find((r) => r.id === N) ?? null, [d, N]), Nr = T(() => d ? [...d.columns].sort((r, a) => r.order - a.order) : [], [d]);
  return /* @__PURE__ */ o.createElement("section", { className: "kanban-shell", "aria-busy": !fr }, /* @__PURE__ */ o.createElement("aside", { className: "board-sidebar" }, /* @__PURE__ */ o.createElement("div", { className: "board-sidebar__head" }, /* @__PURE__ */ o.createElement("p", { className: "board-sidebar__eyebrow" }, "Orbit Board"), /* @__PURE__ */ o.createElement("h1", null, "我的看板"), /* @__PURE__ */ o.createElement("p", { className: "board-sidebar__count" }, "總卡片: ", hr)), /* @__PURE__ */ o.createElement("div", { className: "board-sidebar__composer" }, /* @__PURE__ */ o.createElement("label", { htmlFor: "new-board", className: "sr-only" }, "新增看板"), /* @__PURE__ */ o.createElement(
    "input",
    {
      id: "new-board",
      type: "text",
      placeholder: "新增看板名稱",
      value: l,
      onChange: (r) => p(r.target.value),
      onKeyDown: (r) => {
        r.key === "Enter" && er();
      }
    }
  ), /* @__PURE__ */ o.createElement("button", { type: "button", onClick: er }, "建立看板")), /* @__PURE__ */ o.createElement("ul", { className: "board-list", role: "list" }, e.boards.map((r) => /* @__PURE__ */ o.createElement("li", { key: r.id }, /* @__PURE__ */ o.createElement(
    "button",
    {
      type: "button",
      className: r.id === (d == null ? void 0 : d.id) ? "board-item board-item--active" : "board-item",
      onClick: () => E((a) => ({ ...a, activeBoardId: r.id }))
    },
    /* @__PURE__ */ o.createElement("span", null, r.name),
    /* @__PURE__ */ o.createElement("small", null, r.cards.length)
  ), /* @__PURE__ */ o.createElement("div", { className: "board-item__actions" }, /* @__PURE__ */ o.createElement(
    "button",
    {
      type: "button",
      className: "ghost",
      "data-board-rename-id": r.id,
      onClick: () => xr(r.id)
    },
    u === r.id ? "保存" : "改名"
  ), /* @__PURE__ */ o.createElement("button", { type: "button", className: "danger", onClick: () => wr(r.id) }, "刪除")))))), /* @__PURE__ */ o.createElement("div", { className: "kanban-workspace" }, /* @__PURE__ */ o.createElement("header", { className: "workspace-header" }, /* @__PURE__ */ o.createElement("div", null, /* @__PURE__ */ o.createElement("p", { className: "workspace-header__eyebrow" }, "Task Workspace"), d && u === d.id ? /* @__PURE__ */ o.createElement(
    "input",
    {
      type: "text",
      className: "workspace-header__title-input",
      value: v,
      onChange: (r) => _(r.target.value),
      onKeyDown: (r) => {
        r.key === "Enter" && R(d.id), r.key === "Escape" && (G.current = !0, yr());
      },
      onBlur: (r) => {
        const a = r.relatedTarget;
        if ((a == null ? void 0 : a.dataset.boardRenameId) !== d.id) {
          if (G.current) {
            G.current = !1;
            return;
          }
          R(d.id);
        }
      },
      autoFocus: !0,
      "aria-label": "編輯看板名稱"
    }
  ) : /* @__PURE__ */ o.createElement("h2", null, (d == null ? void 0 : d.name) ?? "未選擇看板")), /* @__PURE__ */ o.createElement("div", { className: "workspace-header__column-composer" }, /* @__PURE__ */ o.createElement("label", { htmlFor: "new-column", className: "sr-only" }, "新增欄位"), /* @__PURE__ */ o.createElement(
    "input",
    {
      id: "new-column",
      type: "text",
      placeholder: "新增欄位名稱",
      value: f,
      onChange: (r) => C(r.target.value),
      onKeyDown: (r) => {
        r.key === "Enter" && ar();
      }
    }
  ), /* @__PURE__ */ o.createElement("button", { type: "button", onClick: ar }, "新增欄位"))), /* @__PURE__ */ o.createElement("div", { className: "lanes" }, Nr.map((r) => {
    const a = d ? U(d.cards, r.id) : [];
    return /* @__PURE__ */ o.createElement(
      "article",
      {
        key: r.id,
        className: pr === r.id ? "lane lane--drop" : "lane",
        onDragOver: (n) => {
          n.preventDefault(), B(r.id);
        },
        onDragLeave: () => B((n) => n === r.id ? null : n),
        onDrop: (n) => {
          n.preventDefault(), sr(r.id, null);
        }
      },
      /* @__PURE__ */ o.createElement("header", { className: "lane__header" }, y === r.id ? /* @__PURE__ */ o.createElement(
        "input",
        {
          type: "text",
          className: "lane__title-input",
          value: m,
          onChange: (n) => k(n.target.value),
          onKeyDown: (n) => {
            n.key === "Enter" && O(r.id), n.key === "Escape" && (Y.current = !0, $());
          },
          onBlur: (n) => {
            const s = n.relatedTarget;
            if ((s == null ? void 0 : s.dataset.columnRenameId) !== r.id) {
              if (Y.current) {
                Y.current = !1;
                return;
              }
              O(r.id);
            }
          },
          autoFocus: !0,
          "aria-label": "編輯欄位名稱"
        }
      ) : /* @__PURE__ */ o.createElement("h3", null, r.name), /* @__PURE__ */ o.createElement("span", null, a.length)),
      /* @__PURE__ */ o.createElement("div", { className: "lane__header-actions" }, /* @__PURE__ */ o.createElement(
        "button",
        {
          type: "button",
          className: "ghost",
          "data-column-rename-id": r.id,
          onClick: () => vr(r.id)
        },
        y === r.id ? "保存" : "改名"
      ), /* @__PURE__ */ o.createElement("button", { type: "button", className: "danger", onClick: () => _r(r.id) }, "刪除")),
      /* @__PURE__ */ o.createElement("div", { className: "lane__composer" }, /* @__PURE__ */ o.createElement("label", { htmlFor: `new-card-${r.id}`, className: "sr-only" }, "新增卡片"), /* @__PURE__ */ o.createElement(
        "input",
        {
          id: `new-card-${r.id}`,
          type: "text",
          placeholder: "新增卡片標題",
          value: K[r.id] ?? "",
          onChange: (n) => Z((s) => ({
            ...s,
            [r.id]: n.target.value
          })),
          onKeyDown: (n) => {
            n.key === "Enter" && ir(r.id);
          }
        }
      ), /* @__PURE__ */ o.createElement("button", { type: "button", onClick: () => ir(r.id) }, "新增卡片")),
      /* @__PURE__ */ o.createElement("ul", { className: "card-list", role: "list" }, a.map((n) => /* @__PURE__ */ o.createElement(
        "li",
        {
          key: n.id,
          className: z === n.id ? "card card--dragging" : "card",
          draggable: !0,
          onDragStart: (s) => {
            s.dataTransfer.effectAllowed = "move", M(n.id);
          },
          onDragEnd: () => {
            M(null), B(null);
          },
          onDragOver: (s) => {
            s.preventDefault(), B(r.id);
          },
          onDrop: (s) => {
            s.preventDefault(), sr(r.id, n.id);
          }
        },
        /* @__PURE__ */ o.createElement("button", { type: "button", className: "card__body", onClick: () => dr(n.id) }, /* @__PURE__ */ o.createElement("p", null, n.title), /* @__PURE__ */ o.createElement("small", null, n.description ? "已填寫詳情" : "尚無詳情")),
        /* @__PURE__ */ o.createElement("div", { className: "card__actions" }, /* @__PURE__ */ o.createElement("button", { type: "button", className: "ghost", onClick: () => dr(n.id) }, "編輯"), /* @__PURE__ */ o.createElement("button", { type: "button", className: "danger", onClick: () => Er(n.id) }, "刪除"))
      )))
    );
  }))), Cr && /* @__PURE__ */ o.createElement("div", { className: "modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "card-modal-title" }, /* @__PURE__ */ o.createElement("div", { className: "modal__panel" }, /* @__PURE__ */ o.createElement("header", { className: "modal__header" }, /* @__PURE__ */ o.createElement("h4", { id: "card-modal-title" }, "卡片詳情"), /* @__PURE__ */ o.createElement("button", { type: "button", className: "ghost", onClick: () => D(null) }, "關閉")), /* @__PURE__ */ o.createElement("label", { htmlFor: "card-title" }, "標題"), /* @__PURE__ */ o.createElement(
    "input",
    {
      id: "card-title",
      type: "text",
      value: A.title,
      onChange: (r) => P((a) => ({ ...a, title: r.target.value }))
    }
  ), /* @__PURE__ */ o.createElement("label", { htmlFor: "card-desc" }, "描述"), /* @__PURE__ */ o.createElement(
    "textarea",
    {
      id: "card-desc",
      rows: 5,
      placeholder: "輸入和這張卡片相關的資訊",
      value: A.description,
      onChange: (r) => P((a) => ({ ...a, description: r.target.value }))
    }
  ), /* @__PURE__ */ o.createElement("div", { className: "modal__actions" }, /* @__PURE__ */ o.createElement("button", { type: "button", className: "ghost", onClick: () => D(null) }, "取消"), /* @__PURE__ */ o.createElement("button", { type: "button", onClick: kr }, "儲存")))));
}
const Kr = `body {\r
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
.lane__title-input {\r
  min-height: 40px;\r
  font-size: 1rem;\r
  font-weight: 700;\r
  border: 1px solid #9bc3ff;\r
  background: #ffffff;\r
}\r
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
.workspace-header__title-input {\r
  min-height: 44px;\r
  min-width: min(520px, 100%);\r
  font-size: clamp(1.1rem, 1.8vw, 1.6rem);\r
  font-weight: 700;\r
  border: 1px solid #9bc3ff;\r
  background: #ffffff;\r
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
`, X = "plugin-task-board", J = `${X}-styles`;
let j = 0;
const q = /* @__PURE__ */ new WeakMap();
function Pr(i, e) {
  if (!document.getElementById(J)) {
    const p = document.createElement("style");
    p.id = J, p.textContent = Kr, document.head.appendChild(p);
  }
  j++;
  const t = document.createElement("div");
  t.id = X, i.appendChild(t);
  const l = Dr(t);
  q.set(i, l), l.render(Ar(Lr, { context: e }));
}
function Mr(i) {
  const e = q.get(i);
  if (e && (e.unmount(), q.delete(i)), i.innerHTML = "", j = Math.max(0, j - 1), j === 0) {
    const t = document.getElementById(J);
    t && t.remove();
  }
}
const $r = {
  id: X,
  mount(i, e) {
    Pr(i, e);
  },
  unmount(i) {
    Mr(i);
  }
};
export {
  $r as default
};
//# sourceMappingURL=plugin.js.map
