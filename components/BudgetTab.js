"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, X, Trash2, Pencil } from "lucide-react";
import { getCategoryConfig, ALL_PARENT_CATEGORIES, getParentCategory } from "@/utils/categoryConfig";

const DEFAULT_BUDGETS = [
  { id: "default-1", name: "Food & Dining",  category: "Food & Dining",  limit: 2000 },
  { id: "default-2", name: "Housing",        category: "Housing",        limit: 8000 },
  { id: "default-3", name: "Transportation", category: "Transportation", limit: 1500 },
  { id: "default-4", name: "Entertainment",  category: "Entertainment",  limit: 500  },
];

const EMPTY_FORM = { name: "", category: "Food & Dining", limit: "" };

function CatIcon({ category, size = 34 }) {
  const cfg = getCategoryConfig(category);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "var(--ax-midnight)",
      border: `1px solid ${cfg.color || "var(--ax-border-strong)"}55`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <cfg.Icon size={size * 0.44} style={{ color: cfg.color || "var(--ax-fg-muted)" }} />
    </div>
  );
}

function Eyebrow({ num, label }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      fontSize: "var(--ax-fs-eyebrow)", fontWeight: 500,
      textTransform: "uppercase", letterSpacing: "0.32em",
      color: "var(--ax-gold)", lineHeight: 1,
    }}>
      <span style={{ opacity: 0.6 }}>{String(num).padStart(2, "0")}</span>
      <span style={{ width: 1, height: 10, background: "var(--ax-border-gold)" }} />
      {label}
    </div>
  );
}

export function BudgetTab({ txList, currency, userId }) {
  const [budgets, setBudgets]       = useState([]);
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [hydrated, setHydrated]     = useState(false);

  const storageKey = userId ? `finacle_budgets_${userId}` : null;

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      setBudgets(raw ? JSON.parse(raw) : DEFAULT_BUDGETS);
    } catch { setBudgets(DEFAULT_BUDGETS); }
    setHydrated(true);
  }, [storageKey]);

  const persist = (next) => {
    setBudgets(next);
    if (storageKey) { try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {} }
  };

  const activeMonth = useMemo(() => {
    if (!txList.length) return new Date().toISOString().slice(0, 7);
    return txList.reduce((max, tx) => tx.date.slice(0, 7) > max ? tx.date.slice(0, 7) : max, "2000-01");
  }, [txList]);

  const activeMonthLabel = (() => {
    const [y, m] = activeMonth.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
  })();

  const monthlySpending = useMemo(() => {
    const map = {};
    txList
      .filter(tx => Number(tx.amount) < 0 && tx.date.startsWith(activeMonth))
      .forEach(tx => {
        const parent = getParentCategory(tx.category);
        map[parent] = (map[parent] || 0) + Math.abs(Number(tx.amount));
        map[tx.category] = (map[tx.category] || 0) + Math.abs(Number(tx.amount));
      });
    return map;
  }, [txList, activeMonth]);

  const fmt = (n) => {
    const s = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return currency === "AED" ? `Đ ${s}` : `$${s}`;
  };

  const totalLimit   = budgets.reduce((s, b) => s + Number(b.limit), 0);
  const totalSpent   = budgets.reduce((s, b) => s + (monthlySpending[b.category] || 0), 0);
  const totalRemain  = Math.max(0, totalLimit - totalSpent);
  const overallPct   = totalLimit > 0 ? Math.min(100, (totalSpent / totalLimit) * 100) : 0;

  const mostSpent = budgets.length
    ? budgets.reduce((max, b) => (monthlySpending[b.category] || 0) > (monthlySpending[max.category] || 0) ? b : max, budgets[0])
    : null;

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit   = (b)  => { setEditTarget(b);  setForm({ name: b.name, category: b.category, limit: String(b.limit) }); setShowModal(true); };

  const handleSave = () => {
    const limitNum = parseFloat(form.limit);
    if (!form.name.trim() || isNaN(limitNum) || limitNum <= 0) return;
    if (editTarget) {
      persist(budgets.map(b => b.id === editTarget.id ? { ...b, ...form, limit: limitNum } : b));
    } else {
      persist([...budgets, { id: `budget-${Date.now()}`, ...form, limit: limitNum }]);
    }
    setShowModal(false);
  };

  const deleteBudget = (id) => persist(budgets.filter(b => b.id !== id));

  if (!hydrated && storageKey) return null;

  return (
    <div style={{ padding: "20px 20px 8px", animation: "slide-up 0.42s cubic-bezier(0.22,1,0.36,1) forwards" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <Eyebrow num={3} label="Budget" />
          <div style={{ fontFamily: "var(--ax-font-display)", fontSize: 26, fontWeight: 300, marginTop: 6, color: "var(--ax-fg)" }}>
            Monthly <em style={{ color: "var(--ax-fg-muted)" }}>allocations.</em>
          </div>
          <div style={{ fontSize: 11, color: "var(--ax-fg-muted)", marginTop: 4 }}>{activeMonthLabel}</div>
        </div>
        <button onClick={openCreate} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "9px 14px", borderRadius: "var(--ax-radius-2)",
          background: "transparent", border: "1px solid var(--ax-border-gold)",
          color: "var(--ax-gold)",
          fontFamily: "var(--ax-font-body)", fontSize: 10,
          letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500,
          cursor: "pointer",
        }}>
          <Plus size={12} /> New
        </button>
      </div>

      {/* Hero card */}
      <div style={{
        background: "var(--ax-midnight)", border: "1px solid var(--ax-border-gold-soft)",
        borderRadius: "var(--ax-radius-2)", padding: "22px 20px", marginBottom: 20,
        position: "relative", overflow: "hidden",
      }}>
        <div className="ax-halftone" style={{ top: -20, right: -20, width: 180, height: 180, opacity: 0.4 }} />
        <div style={{ fontSize: 10, letterSpacing: "0.32em", color: "var(--ax-gold)", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>
          Remaining budget
        </div>
        <div style={{
          fontFamily: "var(--ax-font-display)", fontSize: 42, fontWeight: 300,
          letterSpacing: "-0.02em", lineHeight: 1,
          color: totalRemain > 0 ? "var(--ax-fg)" : "var(--ax-error)",
        }}>
          {fmt(totalRemain)}
        </div>

        {/* Overall progress bar */}
        <div style={{ marginTop: 18, height: 3, borderRadius: 2, background: "var(--ax-border)", overflow: "hidden" }}>
          <div style={{
            width: `${overallPct}%`, height: "100%",
            background: overallPct > 90 ? "var(--ax-error)" : overallPct > 70 ? "#D4B76A" : "var(--ax-gold)",
            transition: "width 600ms var(--ax-ease)",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 10, color: "var(--ax-fg-muted)", letterSpacing: "0.12em" }}>{fmt(totalSpent)} spent</span>
          <span style={{ fontSize: 10, color: "var(--ax-fg-muted)", letterSpacing: "0.12em" }}>{fmt(totalLimit)} limit</span>
        </div>

        {/* Stats row */}
        <div style={{
          marginTop: 16, paddingTop: 14,
          borderTop: "1px solid var(--ax-border)",
          display: "grid", gridTemplateColumns: "1fr 1px 1fr",
          gap: 12, alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.28em", color: "var(--ax-fg-muted)", textTransform: "uppercase", fontWeight: 500 }}>
              Most spent
            </div>
            <div style={{ fontFamily: "var(--ax-font-display)", fontSize: 16, fontWeight: 400, marginTop: 4, color: "var(--ax-fg)" }}>
              {mostSpent?.name || "—"}
            </div>
          </div>
          <span style={{ height: 28, background: "var(--ax-border)" }} />
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.28em", color: "var(--ax-fg-muted)", textTransform: "uppercase", fontWeight: 500 }}>
              Progress
            </div>
            <div style={{ fontFamily: "var(--ax-font-display)", fontSize: 16, fontWeight: 400, fontStyle: "italic", marginTop: 4, color: "var(--ax-gold)" }}>
              {Math.round(overallPct)}%
            </div>
          </div>
        </div>
      </div>

      {/* Budget rows */}
      {budgets.length === 0 ? (
        <div style={{
          padding: "40px 20px", textAlign: "center",
          border: "1px dashed var(--ax-border)", borderRadius: "var(--ax-radius-2)",
          color: "var(--ax-fg-muted)", fontSize: 13,
        }}>
          No budgets yet. Create one to start tracking.
        </div>
      ) : (
        <div style={{ background: "var(--ax-midnight)", border: "1px solid var(--ax-border)", borderRadius: "var(--ax-radius-2)", overflow: "hidden" }}>
          {budgets.map((b, i) => {
            const spent  = monthlySpending[b.category] || 0;
            const pct    = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;
            const over   = spent > b.limit;
            const cfg    = getCategoryConfig(b.category);
            return (
              <div key={b.id} style={{
                padding: "14px 16px",
                borderBottom: i < budgets.length - 1 ? "1px solid var(--ax-border)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <CatIcon category={b.category} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 14, color: "var(--ax-fg)" }}>{b.name}</span>
                      <span style={{
                        fontFamily: "var(--ax-font-display)", fontSize: 14,
                        color: over ? "var(--ax-error)" : "var(--ax-fg)",
                      }}>
                        {fmt(spent)}
                        <span style={{ color: "var(--ax-fg-faint)", fontSize: 11, marginLeft: 3 }}>
                          / {fmt(b.limit)}
                        </span>
                      </span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => openEdit(b)} style={{
                      background: "transparent", border: "none", color: "var(--ax-fg-muted)",
                      cursor: "pointer", padding: 4, display: "flex",
                    }}>
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => deleteBudget(b.id)} style={{
                      background: "transparent", border: "none", color: "var(--ax-fg-faint)",
                      cursor: "pointer", padding: 4, display: "flex",
                    }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: "100%", height: 3, borderRadius: 2, background: "var(--ax-border)", overflow: "hidden" }}>
                  <div style={{
                    width: `${pct}%`, height: "100%",
                    background: over ? "var(--ax-error)" : pct > 80 ? "#D4B76A" : (cfg.color || "var(--ax-gold)"),
                    transition: "width 600ms var(--ax-ease)",
                  }} />
                </div>
                {over && (
                  <div style={{ marginTop: 4, fontSize: 10, color: "var(--ax-error)", letterSpacing: "0.12em" }}>
                    Over by {fmt(spent - b.limit)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
          animation: "fade-in 220ms var(--ax-ease)",
        }} onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "var(--ax-midnight)", width: "100%", maxWidth: 480,
            borderRadius: "12px 12px 0 0",
            border: "1px solid var(--ax-border-gold-soft)",
            padding: "24px 24px 40px",
            animation: "slide-up-sheet 320ms cubic-bezier(0.22,1,0.36,1)",
          }}>
            {/* Drag handle */}
            <div style={{ width: 40, height: 3, background: "var(--ax-border-strong)", borderRadius: 2, margin: "0 auto 20px" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "var(--ax-font-display)", fontSize: 20, fontWeight: 400, color: "var(--ax-fg)" }}>
                {editTarget ? "Edit budget" : "New budget"}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "var(--ax-fg-muted)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Budget name">
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Monthly groceries"
                  style={inputStyle} />
              </Field>
              <Field label="Category">
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={inputStyle}>
                  {ALL_PARENT_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Monthly limit">
                <input value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))}
                  type="number" placeholder="0"
                  style={inputStyle} />
              </Field>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: "13px",
                background: "transparent", border: "1px solid var(--ax-border-strong)",
                color: "var(--ax-fg-muted)", borderRadius: "var(--ax-radius-2)",
                fontFamily: "var(--ax-font-body)", fontSize: 11,
                letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500, cursor: "pointer",
              }}>
                Cancel
              </button>
              <button onClick={handleSave} style={{
                flex: 1, padding: "13px",
                background: "var(--ax-gold)", border: "none",
                color: "var(--ax-midnight)", borderRadius: "var(--ax-radius-2)",
                fontFamily: "var(--ax-font-body)", fontSize: 11,
                letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer",
              }}>
                {editTarget ? "Save changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "11px 14px",
  background: "var(--ax-card)", border: "1px solid var(--ax-border)",
  borderRadius: "var(--ax-radius-2)",
  color: "var(--ax-fg)", fontFamily: "var(--ax-font-body)", fontSize: 14,
  outline: "none",
  appearance: "none", WebkitAppearance: "none",
};

function Field({ label, children }) {
  return (
    <div>
      <div style={{
        fontSize: 10, letterSpacing: "0.22em", color: "var(--ax-fg-muted)",
        textTransform: "uppercase", fontWeight: 500, marginBottom: 6,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}
