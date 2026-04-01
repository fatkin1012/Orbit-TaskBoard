import o, { useState as y, useRef as G, useEffect as ar, useCallback as b, useMemo as V, createElement as Mr } from "react";
import { createRoot as Pr } from "react-dom/client";
const Er = "task-boards", Gr = "tasks", H = "2.0.0", or = [
  { id: "todo", name: "待辦", order: 0 },
  { id: "doing", name: "進行中", order: 1 },
  { id: "done", name: "已完成", order: 2 }
];
function X(i) {
  if (typeof i != "string")
    return i;
  try {
    return JSON.parse(i);
  } catch {
    return i;
  }
}
function Vr(i) {
  const t = X(i);
  if (!t || typeof t != "object")
    return t;
  const a = t;
  return "data" in a ? X(a.data) : t;
}
function Ir(i) {
  if (Array.isArray(i))
    return i;
  const t = X(i);
  if (!t || typeof t != "object")
    return null;
  const a = t, l = ["data", "value", "payload", "tasks"];
  for (const m of l) {
    const f = Ir(a[m]);
    if (f)
      return f;
  }
  return null;
}
function Wr(i) {
  return Array.isArray(i) ? i.filter((t) => {
    if (!t || typeof t != "object")
      return !1;
    const a = t;
    return typeof a.id == "string" && typeof a.title == "string" && (a.status === "todo" || a.status === "in-progress" || a.status === "done") && typeof a.createdAt == "string";
  }).map((t) => ({ ...t })) : [];
}
function sr(i) {
  return {
    id: crypto.randomUUID(),
    name: "我的任務板",
    columns: or.map((a) => ({ ...a })),
    cards: [],
    createdAt: i,
    updatedAt: i
  };
}
function vr() {
  const i = (/* @__PURE__ */ new Date()).toISOString(), t = sr(i);
  return {
    schemaVersion: H,
    activeBoardId: t.id,
    boards: [t]
  };
}
function Xr(i) {
  if (!Array.isArray(i))
    return or.map((a) => ({ ...a }));
  const t = i.filter((a) => {
    if (!a || typeof a != "object")
      return !1;
    const l = a;
    return typeof l.id == "string" && typeof l.name == "string" && typeof l.order == "number" && Number.isFinite(l.order);
  }).map((a) => ({
    id: a.id,
    name: a.name.trim() || "未命名欄位",
    order: a.order
  })).sort((a, l) => a.order - l.order).map((a, l) => ({ ...a, order: l }));
  return t.length > 0 ? t : or.map((a) => ({ ...a }));
}
function $r(i, t) {
  var w;
  if (!Array.isArray(i))
    return [];
  const a = new Set(t.map((c) => c.id)), l = ((w = t[0]) == null ? void 0 : w.id) ?? "todo", m = i.filter((c) => {
    if (!c || typeof c != "object")
      return !1;
    const p = c;
    return typeof p.id == "string" && typeof p.title == "string" && typeof p.description == "string" && typeof p.columnId == "string" && typeof p.order == "number" && Number.isFinite(p.order) && typeof p.createdAt == "string" && typeof p.updatedAt == "string";
  }).map((c) => ({
    ...c,
    title: c.title.trim() || "未命名卡片",
    columnId: a.has(c.columnId) ? c.columnId : l
  })), f = /* @__PURE__ */ new Set(), _ = m.map((c) => {
    if (!f.has(c.id))
      return f.add(c.id), c;
    const p = crypto.randomUUID();
    return f.add(p), {
      ...c,
      id: p
    };
  }), I = /* @__PURE__ */ new Map();
  for (const c of _) {
    const p = I.get(c.columnId) ?? [];
    p.push(c), I.set(c.columnId, p);
  }
  const v = [];
  for (const [c, p] of I.entries())
    p.sort((C, g) => C.order - g.order).forEach((C, g) => {
      v.push({ ...C, columnId: c, order: g });
    });
  return v;
}
function Hr(i) {
  return Array.isArray(i) ? i.filter((t) => {
    if (!t || typeof t != "object")
      return !1;
    const a = t;
    return typeof a.id == "string" && typeof a.name == "string" && typeof a.createdAt == "string" && typeof a.updatedAt == "string";
  }).map((t) => {
    const a = Xr(t.columns), l = $r(t.cards, a);
    return {
      id: t.id,
      name: t.name.trim() || "未命名看板",
      columns: a,
      cards: l,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    };
  }) : [];
}
function Jr(i) {
  const t = Wr(Ir(i) ?? []), a = (/* @__PURE__ */ new Date()).toISOString(), l = sr(a), m = {
    todo: "todo",
    "in-progress": "doing",
    done: "done"
  };
  return l.cards = t.map((f, _) => ({
    id: f.id,
    title: f.title,
    description: "",
    columnId: m[f.status],
    order: _,
    createdAt: f.createdAt,
    updatedAt: f.createdAt
  })), l.updatedAt = a, {
    schemaVersion: H,
    activeBoardId: l.id,
    boards: [l]
  };
}
function qr(i) {
  const t = Vr(i), a = X(t);
  if (!a || typeof a != "object")
    return null;
  const l = a, m = Hr(l.boards);
  if (m.length === 0)
    return null;
  const f = typeof l.activeBoardId == "string" && m.some((_) => _.id === l.activeBoardId) ? l.activeBoardId : m[0].id;
  return {
    schemaVersion: H,
    activeBoardId: f,
    boards: m
  };
}
function $(i, t) {
  return i.filter((a) => a.columnId === t).sort((a, l) => a.order - l.order);
}
function Qr(i, t, a, l) {
  const m = i.find((g) => g.id === t);
  if (!m)
    return i;
  const f = i.filter((g) => g.id !== t), _ = $(f, a), I = l === null ? _.length : Math.max(0, _.findIndex((g) => g.id === l)), v = {
    ...m,
    columnId: a,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  _.splice(I, 0, v);
  const w = _.map((g, A) => ({ ...g, order: A })), c = m.columnId;
  if (c === a)
    return [...f.filter((A) => A.columnId !== a), ...w];
  const p = $(f, c).map((g, A) => ({ ...g, order: A }));
  return [...f.filter((g) => g.columnId !== c && g.columnId !== a), ...p, ...w];
}
function Cr(i) {
  const t = i.currentTarget.getBoundingClientRect();
  return i.clientY - t.top < t.height / 2 ? "before" : "after";
}
function Dr(i) {
  const t = i.currentTarget.getBoundingClientRect();
  return i.clientX - t.left < t.width / 2 ? "before" : "after";
}
function Zr({ context: i }) {
  const [t, a] = y(() => vr()), [l, m] = y(""), [f, _] = y(null), [I, v] = y(""), [w, c] = y(null), [p, C] = y(""), [g, A] = y(""), [J, cr] = y({}), [S, O] = y(null), [T, q] = y({ title: "", description: "" }), [Y, Q] = y(null), [Nr, j] = y(null), [N, Z] = y(null), [z, F] = y(null), [L, rr] = y(null), [R, U] = y(null), [Br, Ar] = y(!1), [ur, Sr] = y(!1), fr = G(!1), nr = G(!1), er = G(!1), pr = G(null);
  ar(() => {
    let r = !1;
    return (async () => {
      try {
        const [n, s] = await Promise.all([
          i.storage.get(Er),
          i.storage.get(Gr)
        ]);
        if (r)
          return;
        const u = qr(n);
        if (u) {
          a(u);
          return;
        }
        if (s) {
          a(Jr(s));
          return;
        }
        a(vr());
      } catch (n) {
        console.error("[task-board] restore failed", n);
      } finally {
        r || (Sr(!0), Ar(!0));
      }
    })(), () => {
      r = !0;
    };
  }, [i]), ar(() => {
    if (ur) {
      if (!fr.current) {
        fr.current = !0;
        return;
      }
      i.storage.save(Er, t, H).then(() => {
        const r = t.boards.reduce((e, n) => e + n.cards.length, 0);
        return i.eventBus.emit("TASK_COUNT_CHANGED", { count: r });
      }).catch((r) => {
        console.error("[task-board] save failed", r);
      });
    }
  }, [i, ur, t]);
  const D = b((r) => {
    a((e) => r(e));
  }, []), d = V(
    () => t.boards.find((r) => r.id === t.activeBoardId) ?? t.boards[0] ?? null,
    [t.activeBoardId, t.boards]
  ), zr = V(
    () => t.boards.reduce((r, e) => r + e.cards.length, 0),
    [t.boards]
  ), x = b(
    (r, e) => {
      D((n) => ({
        ...n,
        boards: n.boards.map((s) => s.id !== r ? s : {
          ...e(s),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        })
      }));
    },
    [D]
  ), mr = b(() => {
    const r = l.trim();
    if (!r)
      return;
    const e = (/* @__PURE__ */ new Date()).toISOString(), n = sr(e);
    n.name = r, D((s) => ({
      ...s,
      boards: [...s.boards, n],
      activeBoardId: n.id
    })), m("");
  }, [l, D]), gr = b(
    (r) => {
      const e = t.boards.find((n) => n.id === r);
      e && (_(r), v(e.name), D((n) => ({
        ...n,
        activeBoardId: r
      })));
    },
    [D, t.boards]
  ), M = b(
    (r) => {
      if (!t.boards.find((s) => s.id === r)) {
        _(null), v("");
        return;
      }
      const n = I.trim();
      if (!n) {
        _(null), v("");
        return;
      }
      x(r, (s) => ({ ...s, name: n })), _(null), v("");
    },
    [I, t.boards, x]
  ), Rr = b(
    (r) => {
      if (f === r) {
        M(r);
        return;
      }
      gr(r);
    },
    [f, M, gr]
  ), Tr = b(() => {
    _(null), v("");
  }, []), Or = b(
    (r) => {
      if (t.boards.length <= 1) {
        window.alert("至少需要保留一個看板。");
        return;
      }
      const e = t.boards.find((n) => n.id === r);
      e && window.confirm(`確定刪除看板「${e.name}」嗎？`) && D((n) => {
        var u;
        const s = n.boards.filter((B) => B.id !== r);
        return {
          ...n,
          boards: s,
          activeBoardId: n.activeBoardId === r ? ((u = s[0]) == null ? void 0 : u.id) ?? null : n.activeBoardId
        };
      });
    },
    [D, t.boards]
  ), br = b(
    (r, e = "before") => {
      L && (D((n) => {
        const s = n.boards.findIndex((h) => h.id === L);
        if (s < 0)
          return n;
        const u = n.boards.filter((h) => h.id !== L), B = n.boards[s];
        let E = u.length;
        if (r !== null) {
          const h = u.findIndex((K) => K.id === r);
          if (h < 0)
            return n;
          E = e === "after" ? h + 1 : h;
        }
        if (E < 0 || E > u.length)
          return n;
        const k = [...u];
        return k.splice(E, 0, B), {
          ...n,
          boards: k
        };
      }), rr(null), U(null));
    },
    [L, D]
  ), hr = b(() => {
    if (!d)
      return;
    const r = g.trim();
    r && (x(d.id, (e) => ({
      ...e,
      columns: [...e.columns, { id: crypto.randomUUID(), name: r, order: e.columns.length }]
    })), A(""));
  }, [d, g, x]), xr = b(
    (r) => {
      if (!d)
        return;
      const e = d.columns.find((n) => n.id === r);
      e && (c(r), C(e.name));
    },
    [d]
  ), P = b(
    (r) => {
      if (!d)
        return;
      if (!d.columns.find((s) => s.id === r)) {
        c(null), C("");
        return;
      }
      const n = p.trim();
      if (!n) {
        c(null), C("");
        return;
      }
      x(d.id, (s) => ({
        ...s,
        columns: s.columns.map((u) => u.id === r ? { ...u, name: n } : u)
      })), c(null), C("");
    },
    [d, p, x]
  ), jr = b(
    (r) => {
      if (w === r) {
        P(r);
        return;
      }
      xr(r);
    },
    [w, P, xr]
  ), tr = b(() => {
    c(null), C("");
  }, []);
  ar(() => {
    if (!d || !w)
      return;
    d.columns.some((e) => e.id === w) || tr();
  }, [d, tr, w]);
  const Fr = b(
    (r) => {
      if (!d || d.columns.length <= 1) {
        window.alert("至少需要保留一個欄位。");
        return;
      }
      const e = d.columns.find((n) => n.id === r);
      e && window.confirm(`確定刪除欄位「${e.name}」嗎？卡片會移到第一欄。`) && x(d.id, (n) => {
        var E;
        const s = n.columns.filter((k) => k.id !== r).map((k, h) => ({ ...k, order: h })), u = (E = s[0]) == null ? void 0 : E.id, B = u ? n.cards.map((k) => k.columnId === r ? { ...k, columnId: u } : k) : n.cards;
        return {
          ...n,
          columns: s,
          cards: B
        };
      });
    },
    [d, x]
  ), yr = b(
    (r, e = "before") => {
      !d || !N || (x(d.id, (n) => {
        const s = n.columns.findIndex((h) => h.id === N);
        if (s < 0)
          return n;
        const u = n.columns.filter((h) => h.id !== N), B = n.columns[s];
        let E = u.length;
        if (r !== null) {
          const h = u.findIndex((K) => K.id === r);
          if (h < 0)
            return n;
          E = e === "after" ? h + 1 : h;
        }
        if (E < 0 || E > u.length)
          return n;
        const k = [...u];
        return k.splice(E, 0, B), {
          ...n,
          columns: k.map((h, K) => ({ ...h, order: K }))
        };
      }), Z(null), F(null));
    },
    [d, N, x]
  ), _r = b(
    (r) => {
      if (!d)
        return;
      const e = (J[r] ?? "").trim();
      if (!e)
        return;
      const n = (/* @__PURE__ */ new Date()).toISOString();
      x(d.id, (s) => {
        const u = $(s.cards, r), B = {
          id: crypto.randomUUID(),
          title: e,
          description: "",
          columnId: r,
          order: u.length,
          createdAt: n,
          updatedAt: n
        };
        return {
          ...s,
          cards: [...s.cards, B]
        };
      }), cr((s) => ({ ...s, [r]: "" }));
    },
    [d, J, x]
  ), wr = b(
    (r) => {
      if (!d)
        return;
      const e = d.cards.find((n) => n.id === r);
      e && (O(r), q({ title: e.title, description: e.description }));
    },
    [d]
  ), Lr = b(() => {
    if (!d || !S)
      return;
    const r = T.title.trim();
    if (!r) {
      window.alert("標題不能為空");
      return;
    }
    x(d.id, (e) => ({
      ...e,
      cards: e.cards.map(
        (n) => n.id === S ? {
          ...n,
          title: r,
          description: T.description.trim(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        } : n
      )
    })), O(null);
  }, [d, T.description, T.title, S, x]), Ur = b(
    (r) => {
      d && (x(d.id, (e) => ({
        ...e,
        cards: e.cards.filter((n) => n.id !== r)
      })), S === r && O(null));
    },
    [d, S, x]
  ), kr = b(
    (r, e) => {
      !d || !Y || (x(d.id, (n) => ({
        ...n,
        cards: Qr(n.cards, Y, r, e)
      })), Q(null), j(null));
    },
    [d, Y, x]
  ), Kr = V(() => !d || !S ? null : d.cards.find((r) => r.id === S) ?? null, [d, S]), Yr = V(() => d ? [...d.columns].sort((r, e) => r.order - e.order) : [], [d]);
  return /* @__PURE__ */ o.createElement("section", { className: "kanban-shell", "aria-busy": !Br }, /* @__PURE__ */ o.createElement("aside", { className: "board-sidebar" }, /* @__PURE__ */ o.createElement("div", { className: "board-sidebar__head" }, /* @__PURE__ */ o.createElement("p", { className: "board-sidebar__eyebrow" }, "Orbit Board"), /* @__PURE__ */ o.createElement("h1", null, "我的看板"), /* @__PURE__ */ o.createElement("p", { className: "board-sidebar__count" }, "總卡片: ", zr)), /* @__PURE__ */ o.createElement("div", { className: "board-sidebar__composer" }, /* @__PURE__ */ o.createElement("label", { htmlFor: "new-board", className: "sr-only" }, "新增看板"), /* @__PURE__ */ o.createElement(
    "input",
    {
      id: "new-board",
      type: "text",
      placeholder: "新增看板名稱",
      value: l,
      onChange: (r) => m(r.target.value),
      onKeyDown: (r) => {
        r.key === "Enter" && mr();
      }
    }
  ), /* @__PURE__ */ o.createElement("button", { type: "button", onClick: mr }, "建立看板")), /* @__PURE__ */ o.createElement(
    "ul",
    {
      className: "board-list",
      role: "list",
      onDragOver: (r) => {
        r.target === r.currentTarget && (r.preventDefault(), U(null));
      },
      onDrop: (r) => {
        r.target === r.currentTarget && (r.preventDefault(), br(null));
      }
    },
    t.boards.map((r) => /* @__PURE__ */ o.createElement(
      "li",
      {
        key: r.id,
        className: [
          "board-list__item",
          L === r.id ? "board-list__item--dragging" : "",
          (R == null ? void 0 : R.id) === r.id && R.position === "before" ? "board-list__item--indicator-before" : "",
          (R == null ? void 0 : R.id) === r.id && R.position === "after" ? "board-list__item--indicator-after" : ""
        ].filter(Boolean).join(" "),
        draggable: !0,
        onDragStart: (e) => {
          e.dataTransfer.effectAllowed = "move", rr(r.id);
        },
        onDragEnd: () => {
          rr(null), U(null);
        },
        onDragOver: (e) => {
          e.preventDefault();
          const n = Cr(e);
          U({ id: r.id, position: n });
        },
        onDragLeave: () => {
          U((e) => (e == null ? void 0 : e.id) === r.id ? null : e);
        },
        onDrop: (e) => {
          e.preventDefault();
          const n = Cr(e);
          br(r.id, n);
        }
      },
      /* @__PURE__ */ o.createElement(
        "button",
        {
          type: "button",
          className: r.id === (d == null ? void 0 : d.id) ? "board-item board-item--active" : "board-item",
          onClick: () => D((e) => ({ ...e, activeBoardId: r.id }))
        },
        /* @__PURE__ */ o.createElement("span", null, r.name),
        /* @__PURE__ */ o.createElement("small", null, r.cards.length)
      ),
      /* @__PURE__ */ o.createElement("div", { className: "board-item__actions" }, /* @__PURE__ */ o.createElement(
        "button",
        {
          type: "button",
          className: "ghost",
          "data-board-rename-id": r.id,
          onClick: () => Rr(r.id)
        },
        f === r.id ? "保存" : "改名"
      ), /* @__PURE__ */ o.createElement("button", { type: "button", className: "danger", onClick: () => Or(r.id) }, "刪除"))
    ))
  )), /* @__PURE__ */ o.createElement("div", { className: "kanban-workspace" }, /* @__PURE__ */ o.createElement("header", { className: "workspace-header" }, /* @__PURE__ */ o.createElement("div", null, /* @__PURE__ */ o.createElement("p", { className: "workspace-header__eyebrow" }, "Task Workspace"), d && f === d.id ? /* @__PURE__ */ o.createElement(
    "input",
    {
      type: "text",
      className: "workspace-header__title-input",
      value: I,
      onChange: (r) => v(r.target.value),
      onKeyDown: (r) => {
        r.key === "Enter" && M(d.id), r.key === "Escape" && (nr.current = !0, Tr());
      },
      onBlur: (r) => {
        const e = r.relatedTarget;
        if ((e == null ? void 0 : e.dataset.boardRenameId) !== d.id) {
          if (nr.current) {
            nr.current = !1;
            return;
          }
          M(d.id);
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
      value: g,
      onChange: (r) => A(r.target.value),
      onKeyDown: (r) => {
        r.key === "Enter" && hr();
      }
    }
  ), /* @__PURE__ */ o.createElement("button", { type: "button", onClick: hr }, "新增欄位"))), /* @__PURE__ */ o.createElement(
    "div",
    {
      className: "lanes",
      ref: pr,
      onDragOver: (r) => {
        if (!N)
          return;
        const e = pr.current;
        if (e) {
          const n = e.getBoundingClientRect(), s = 96, u = 20;
          r.clientX < n.left + s ? e.scrollLeft -= u : r.clientX > n.right - s && (e.scrollLeft += u);
        }
        r.target === r.currentTarget && (r.preventDefault(), F(null));
      },
      onDrop: (r) => {
        N && r.target === r.currentTarget && (r.preventDefault(), yr(null));
      }
    },
    Yr.map((r) => {
      const e = d ? $(d.cards, r.id) : [];
      return /* @__PURE__ */ o.createElement(
        "article",
        {
          key: r.id,
          className: [
            "lane",
            Nr === r.id ? "lane--drop" : "",
            (z == null ? void 0 : z.id) === r.id && z.position === "before" ? "lane--indicator-before" : "",
            (z == null ? void 0 : z.id) === r.id && z.position === "after" ? "lane--indicator-after" : "",
            N === r.id ? "lane--dragging" : ""
          ].filter(Boolean).join(" "),
          onDragOver: (n) => {
            if (n.preventDefault(), N) {
              const s = Dr(n);
              F({ id: r.id, position: s });
              return;
            }
            j(r.id);
          },
          onDragLeave: () => {
            j((n) => n === r.id ? null : n), F((n) => (n == null ? void 0 : n.id) === r.id ? null : n);
          },
          onDrop: (n) => {
            if (n.preventDefault(), N) {
              const s = Dr(n);
              yr(r.id, s);
              return;
            }
            kr(r.id, null);
          }
        },
        /* @__PURE__ */ o.createElement("header", { className: "lane__header" }, w === r.id ? /* @__PURE__ */ o.createElement(
          "input",
          {
            type: "text",
            className: "lane__title-input",
            value: p,
            onChange: (n) => C(n.target.value),
            onKeyDown: (n) => {
              n.key === "Enter" && P(r.id), n.key === "Escape" && (er.current = !0, tr());
            },
            onBlur: (n) => {
              const s = n.relatedTarget;
              if ((s == null ? void 0 : s.dataset.columnRenameId) !== r.id) {
                if (er.current) {
                  er.current = !1;
                  return;
                }
                P(r.id);
              }
            },
            autoFocus: !0,
            "aria-label": "編輯欄位名稱"
          }
        ) : /* @__PURE__ */ o.createElement(
          "div",
          {
            className: "lane__title-grip",
            draggable: !0,
            title: "拖動欄位排序",
            onDragStart: (n) => {
              n.dataTransfer.effectAllowed = "move", Z(r.id);
            },
            onDragEnd: () => {
              Z(null), F(null);
            }
          },
          /* @__PURE__ */ o.createElement("h3", null, r.name)
        ), /* @__PURE__ */ o.createElement("div", { className: "lane__header-tools" }, /* @__PURE__ */ o.createElement("span", null, e.length))),
        /* @__PURE__ */ o.createElement("div", { className: "lane__header-actions" }, /* @__PURE__ */ o.createElement(
          "button",
          {
            type: "button",
            className: "ghost",
            "data-column-rename-id": r.id,
            onClick: () => jr(r.id)
          },
          w === r.id ? "保存" : "改名"
        ), /* @__PURE__ */ o.createElement("button", { type: "button", className: "danger", onClick: () => Fr(r.id) }, "刪除")),
        /* @__PURE__ */ o.createElement("div", { className: "lane__composer" }, /* @__PURE__ */ o.createElement("label", { htmlFor: `new-card-${r.id}`, className: "sr-only" }, "新增卡片"), /* @__PURE__ */ o.createElement(
          "input",
          {
            id: `new-card-${r.id}`,
            type: "text",
            placeholder: "新增卡片標題",
            value: J[r.id] ?? "",
            onChange: (n) => cr((s) => ({
              ...s,
              [r.id]: n.target.value
            })),
            onKeyDown: (n) => {
              n.key === "Enter" && _r(r.id);
            }
          }
        ), /* @__PURE__ */ o.createElement("button", { type: "button", onClick: () => _r(r.id) }, "新增卡片")),
        /* @__PURE__ */ o.createElement("ul", { className: "card-list", role: "list" }, e.map((n) => /* @__PURE__ */ o.createElement(
          "li",
          {
            key: n.id,
            className: Y === n.id ? "card card--dragging" : "card",
            draggable: !0,
            onDragStart: (s) => {
              s.dataTransfer.effectAllowed = "move", Q(n.id);
            },
            onDragEnd: () => {
              Q(null), j(null);
            },
            onDragOver: (s) => {
              s.preventDefault(), j(r.id);
            },
            onDrop: (s) => {
              s.preventDefault(), kr(r.id, n.id);
            }
          },
          /* @__PURE__ */ o.createElement("button", { type: "button", className: "card__body", onClick: () => wr(n.id) }, /* @__PURE__ */ o.createElement("p", null, n.title), /* @__PURE__ */ o.createElement("small", null, n.description ? "已填寫詳情" : "尚無詳情")),
          /* @__PURE__ */ o.createElement("div", { className: "card__actions" }, /* @__PURE__ */ o.createElement("button", { type: "button", className: "ghost", onClick: () => wr(n.id) }, "編輯"), /* @__PURE__ */ o.createElement("button", { type: "button", className: "danger", onClick: () => Ur(n.id) }, "刪除"))
        )))
      );
    })
  )), Kr && /* @__PURE__ */ o.createElement("div", { className: "modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "card-modal-title" }, /* @__PURE__ */ o.createElement("div", { className: "modal__panel" }, /* @__PURE__ */ o.createElement("header", { className: "modal__header" }, /* @__PURE__ */ o.createElement("h4", { id: "card-modal-title" }, "卡片詳情"), /* @__PURE__ */ o.createElement("button", { type: "button", className: "ghost", onClick: () => O(null) }, "關閉")), /* @__PURE__ */ o.createElement("label", { htmlFor: "card-title" }, "標題"), /* @__PURE__ */ o.createElement(
    "input",
    {
      id: "card-title",
      type: "text",
      value: T.title,
      onChange: (r) => q((e) => ({ ...e, title: r.target.value }))
    }
  ), /* @__PURE__ */ o.createElement("label", { htmlFor: "card-desc" }, "描述"), /* @__PURE__ */ o.createElement(
    "textarea",
    {
      id: "card-desc",
      rows: 5,
      placeholder: "輸入和這張卡片相關的資訊",
      value: T.description,
      onChange: (r) => q((e) => ({ ...e, description: r.target.value }))
    }
  ), /* @__PURE__ */ o.createElement("div", { className: "modal__actions" }, /* @__PURE__ */ o.createElement("button", { type: "button", className: "ghost", onClick: () => O(null) }, "取消"), /* @__PURE__ */ o.createElement("button", { type: "button", onClick: Lr }, "儲存")))));
}
const rn = `body {\r
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
.board-list__item {\r
  position: relative;\r
  border: 1px solid var(--line);\r
  border-radius: 12px;\r
  background: #fff;\r
  padding: 8px;\r
}\r
\r
.board-list__item--dragging {\r
  opacity: 0.55;\r
}\r
\r
.board-list__item--indicator-before::before,\r
.board-list__item--indicator-after::after {\r
  content: '';\r
  position: absolute;\r
  left: 8px;\r
  right: 8px;\r
  height: 3px;\r
  border-radius: 999px;\r
  background: #2d6fc8;\r
  box-shadow: 0 0 0 1px rgba(45, 111, 200, 0.18);\r
}\r
\r
.board-list__item--indicator-before::before {\r
  top: -6px;\r
}\r
\r
.board-list__item--indicator-after::after {\r
  bottom: -6px;\r
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
  position: relative;\r
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
.lane--indicator-before::before,\r
.lane--indicator-after::after {\r
  content: '';\r
  position: absolute;\r
  top: 10px;\r
  bottom: 10px;\r
  width: 4px;\r
  border-radius: 999px;\r
  background: #2d6fc8;\r
  box-shadow: 0 0 0 1px rgba(45, 111, 200, 0.18);\r
}\r
\r
.lane--indicator-before::before {\r
  left: -7px;\r
}\r
\r
.lane--indicator-after::after {\r
  right: -7px;\r
}\r
\r
.lane--dragging {\r
  opacity: 0.62;\r
}\r
\r
.lane__header {\r
  display: flex;\r
  justify-content: space-between;\r
  align-items: center;\r
}\r
\r
.lane__title-grip {\r
  display: inline-flex;\r
  align-items: center;\r
  min-height: 36px;\r
  padding: 0 6px;\r
  border-radius: 8px;\r
  cursor: grab;\r
  user-select: none;\r
}\r
\r
.lane__title-grip:active {\r
  cursor: grabbing;\r
}\r
\r
.lane__header-tools {\r
  display: inline-flex;\r
  align-items: center;\r
  gap: 6px;\r
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
`, lr = "plugin-task-board", ir = `${lr}-styles`;
let W = 0;
const dr = /* @__PURE__ */ new WeakMap();
function nn(i, t) {
  if (!document.getElementById(ir)) {
    const m = document.createElement("style");
    m.id = ir, m.textContent = rn, document.head.appendChild(m);
  }
  W++;
  const a = document.createElement("div");
  a.id = lr, i.appendChild(a);
  const l = Pr(a);
  dr.set(i, l), l.render(Mr(Zr, { context: t }));
}
function en(i) {
  const t = dr.get(i);
  if (t && (t.unmount(), dr.delete(i)), i.innerHTML = "", W = Math.max(0, W - 1), W === 0) {
    const a = document.getElementById(ir);
    a && a.remove();
  }
}
const on = {
  id: lr,
  mount(i, t) {
    nn(i, t);
  },
  unmount(i) {
    en(i);
  }
};
export {
  on as default
};
//# sourceMappingURL=plugin.js.map
