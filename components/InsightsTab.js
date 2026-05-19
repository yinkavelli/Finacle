"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCategoryConfig, getParentCategory } from "@/utils/categoryConfig";

// ── helpers ────────────────────────────────────────────────────────────────

const labelShort = (key) => { const [y,m]=key.split("-").map(Number); return new Date(y,m-1,1).toLocaleString("en-US",{month:"short",year:"2-digit"}); };
const labelLong  = (key) => { const [y,m]=key.split("-").map(Number); return new Date(y,m-1,1).toLocaleString("en-US",{month:"long",year:"numeric"}); };

const monthStats = (txList, mk) => {
  const mTx     = txList.filter(tx => tx.date.startsWith(mk));
  const income   = mTx.filter(t => Number(t.amount) > 0).reduce((s,t) => s+Number(t.amount), 0);
  const spending = Math.abs(mTx.filter(t => Number(t.amount) < 0).reduce((s,t) => s+Number(t.amount), 0));
  const rate     = income > 0 ? Math.round(((income - spending) / income) * 100) : 0;
  return { income, spending, saved: income - spending, rate };
};

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

// ── Main ────────────────────────────────────────────────────────────────────

export function InsightsTab({ txList, currency, onCategoryClick, userId }) {
  const fmt = (n) => {
    const s = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return currency === "AED" ? `Đ ${s}` : `$${s}`;
  };

  // Month navigation
  const availableMonths = useMemo(() =>
    [...new Set(txList.map(tx => tx.date.slice(0, 7)))].sort()
  , [txList]);

  const latestMonth    = availableMonths[availableMonths.length - 1] || new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const activeMonth    = selectedMonth || latestMonth;
  const monthIdx       = availableMonths.indexOf(activeMonth);
  const canGoBack      = monthIdx > 0;
  const canGoFwd       = monthIdx < availableMonths.length - 1;

  // Budgets
  const [budgets, setBudgets] = useState([]);
  useEffect(() => {
    if (!userId) return;
    try {
      const raw = localStorage.getItem(`axy_folio_budgets_${userId}`);
      if (raw) setBudgets(JSON.parse(raw));
    } catch {}
  }, [userId]);

  // Current month stats
  const ms = useMemo(() => monthStats(txList, activeMonth), [txList, activeMonth]);

  // 6-month trend
  const trend = useMemo(() => {
    const end   = activeMonth;
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const [y, m] = end.split("-").map(Number);
      const d      = new Date(y, m - 1 - i, 1);
      const key    = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      months.push(key);
    }
    return months.map(mk => {
      const s = monthStats(txList, mk);
      return { mk, label: labelShort(mk), income: s.income, spent: s.spending, savings: s.saved };
    });
  }, [txList, activeMonth]);

  const trendMax = Math.max(...trend.map(m => Math.max(m.income, m.spent)), 1);

  // Category breakdown
  const catBreakdown = useMemo(() => {
    const map = {};
    txList
      .filter(tx => tx.date.startsWith(activeMonth) && Number(tx.amount) < 0)
      .forEach(tx => {
        const parent = getParentCategory(tx.category);
        if (!map[parent]) map[parent] = { amount: 0, transactions: [] };
        map[parent].amount += Math.abs(Number(tx.amount));
        map[parent].transactions.push(tx);
      });
    return Object.entries(map)
      .filter(([k]) => k !== "Income" && k !== "Transfer")
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([name, data]) => ({ name, ...data }));
  }, [txList, activeMonth]);

  // Cut suggestions
  const prevMonth = useMemo(() => {
    if (monthIdx <= 0) return null;
    return availableMonths[monthIdx - 1];
  }, [monthIdx, availableMonths]);

  const prevMs = useMemo(() => prevMonth ? monthStats(txList, prevMonth) : null, [txList, prevMonth]);

  const cuts = useMemo(() => {
    if (!catBreakdown.length) return [];
    return catBreakdown
      .filter(cat => {
        const budget = budgets.find(b => b.category === cat.name);
        return budget && cat.amount > budget.limit;
      })
      .slice(0, 3)
      .map(cat => {
        const budget = budgets.find(b => b.category === cat.name);
        return {
          name: cat.name,
          amount: cat.amount,
          limit: budget.limit,
          over: cat.amount - budget.limit,
          transactions: cat.transactions,
        };
      });
  }, [catBreakdown, budgets]);

  // Savings rate status
  const savingsStatus = ms.rate >= 20 ? "on-track" : ms.rate >= 10 ? "watch" : "over";
  const statusMap = {
    "on-track": { label: "On track", color: "#7A8C6F" },
    "watch":    { label: "Watch",    color: "#D4B76A" },
    "over":     { label: "Low",      color: "#D97757" },
  };

  if (!txList.length) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--ax-font-display)", fontSize: 24, fontWeight: 300, color: "var(--ax-fg)", marginBottom: 8 }}>
          No data to analyse.
        </div>
        <div style={{ fontSize: 13, color: "var(--ax-fg-muted)" }}>
          Import a bank statement CSV to unlock insights.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 20px 8px", animation: "slide-up 0.42s cubic-bezier(0.22,1,0.36,1) forwards" }}>

      {/* Header + month nav */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <Eyebrow num={4} label="Insights" />
          <div style={{ fontFamily: "var(--ax-font-display)", fontSize: 26, fontWeight: 300, marginTop: 6, color: "var(--ax-fg)" }}>
            Where to <em style={{ color: "var(--ax-fg-muted)" }}>reclaim.</em>
          </div>
        </div>
        {availableMonths.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <button onClick={() => setSelectedMonth(availableMonths[monthIdx - 1])} disabled={!canGoBack} style={{
              width: 28, height: 28, borderRadius: "var(--ax-radius-2)",
              border: "1px solid var(--ax-border-strong)", background: "transparent",
              color: canGoBack ? "var(--ax-fg-muted)" : "var(--ax-fg-faint)",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: canGoBack ? "pointer" : "default",
            }}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: 11, color: "var(--ax-fg-muted)", minWidth: 70, textAlign: "center" }}>
              {labelLong(activeMonth).split(" ")[0]}
            </span>
            <button onClick={() => setSelectedMonth(availableMonths[monthIdx + 1])} disabled={!canGoFwd} style={{
              width: 28, height: 28, borderRadius: "var(--ax-radius-2)",
              border: "1px solid var(--ax-border-strong)", background: "transparent",
              color: canGoFwd ? "var(--ax-fg-muted)" : "var(--ax-fg-faint)",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: canGoFwd ? "pointer" : "default",
            }}>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Reclaim hero */}
      {(ms.income > 0 || ms.spending > 0) && (
        <div style={{
          background: "var(--ax-midnight)", border: "1px solid var(--ax-border-gold-soft)",
          borderRadius: "var(--ax-radius-2)", padding: "22px 20px", marginBottom: 20,
          position: "relative", overflow: "hidden",
        }}>
          <div className="ax-halftone" style={{ top: -20, right: -20, width: 200, height: 200, opacity: 0.5 }} />
          <div style={{ fontSize: 10, letterSpacing: "0.32em", color: "var(--ax-gold)", textTransform: "uppercase", fontWeight: 500 }}>
            {labelLong(activeMonth)}
          </div>
          <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{
              fontFamily: "var(--ax-font-display)", fontSize: 48, fontWeight: 300,
              letterSpacing: "-0.025em", lineHeight: 1,
              color: ms.saved >= 0 ? "var(--ax-gold)" : "var(--ax-error)",
            }}>
              {fmt(Math.abs(ms.saved))}
            </span>
            <span style={{ fontSize: 12, color: "var(--ax-fg-muted)" }}>
              {ms.saved >= 0 ? "saved" : "over-spent"}
            </span>
          </div>
          <div style={{
            fontFamily: "var(--ax-font-display)", fontSize: 16, fontWeight: 300,
            marginTop: 8, lineHeight: 1.4, color: "var(--ax-fg)",
          }}>
            <em style={{ color: "var(--ax-fg-muted)" }}>{fmt(ms.spending)}</em> spent of{" "}
            <em style={{ color: "var(--ax-gold)" }}>{fmt(ms.income)}</em> income —{" "}
            <em style={{ color: ms.rate >= 20 ? "#7A8C6F" : ms.rate >= 10 ? "#D4B76A" : "var(--ax-error)" }}>
              {ms.rate}% savings rate
            </em>
          </div>
        </div>
      )}

      {/* Over-budget alerts */}
      {cuts.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Eyebrow num={1} label="Over budget" />
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {cuts.map(cut => {
              const cfg = getCategoryConfig(cut.name);
              return (
                <div key={cut.name} style={{
                  background: "var(--ax-midnight)", border: "1px solid var(--ax-border)",
                  borderRadius: "var(--ax-radius-2)", padding: 16,
                  position: "relative", overflow: "hidden",
                  cursor: "pointer",
                  transition: "border-color 220ms var(--ax-ease)",
                }}
                onClick={() => onCategoryClick?.({ type: "category", title: cut.name, transactions: cut.transactions })}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--ax-border-gold-soft)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--ax-border)"}>
                  <div style={{ position: "absolute", left: 0, top: 14, bottom: 14, width: 2, background: cfg.color || "var(--ax-gold)" }} />
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <CatIcon category={cut.name} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, letterSpacing: "0.28em", color: cfg.color || "var(--ax-gold)", textTransform: "uppercase", fontWeight: 500 }}>
                          {cut.name}
                        </span>
                        <span style={{ fontFamily: "var(--ax-font-display)", fontSize: 18, fontStyle: "italic", color: "var(--ax-error)" }}>
                          +{fmt(cut.over)}
                        </span>
                      </div>
                      <div style={{ fontFamily: "var(--ax-font-display)", fontSize: 14, fontWeight: 300, color: "var(--ax-fg)", lineHeight: 1.4 }}>
                        {fmt(cut.amount)} spent vs {fmt(cut.limit)} budget.
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6-month trend */}
      <div style={{ marginBottom: 20 }}>
        <Eyebrow num={2} label="Coverage · 6 months" />
        <div style={{
          marginTop: 14, background: "var(--ax-midnight)",
          border: "1px solid var(--ax-border)", borderRadius: "var(--ax-radius-2)",
          padding: "20px 16px",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8,
            alignItems: "flex-end", height: 120,
          }}>
            {trend.map((m, i) => {
              const isCurrent = m.mk === activeMonth;
              const covered   = m.income >= m.spent;
              const spentH    = m.spent > 0 ? (m.spent / trendMax) * 100 : 2;
              const incomeY   = m.income > 0
                ? `${((m.income - m.spent) / Math.max(m.spent, 1)) * 100}%`
                : "0%";
              return (
                <div key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 4, height: "100%", justifyContent: "flex-end", position: "relative",
                }}>
                  <div style={{
                    width: "70%", height: `${spentH}%`,
                    background: covered ? "rgba(201,165,90,0.18)" : "rgba(217,119,87,0.4)",
                    borderTop: `2px solid ${covered ? "var(--ax-gold)" : "var(--ax-error)"}`,
                    transition: "all 600ms var(--ax-ease)", minHeight: 3,
                    position: "relative",
                  }}>
                    {m.income > 0 && (
                      <div style={{
                        position: "absolute", left: "-15%", right: "-15%",
                        bottom: incomeY, height: 0,
                        borderTop: "1px dashed var(--ax-fg-faint)",
                      }} />
                    )}
                  </div>
                  {isCurrent && (
                    <div style={{
                      position: "absolute", bottom: "calc(100% + 4px)",
                      fontSize: 8, color: "var(--ax-gold)",
                      fontFamily: "var(--ax-font-display)", fontStyle: "italic",
                      whiteSpace: "nowrap",
                    }}>so far</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Month labels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginTop: 10 }}>
            {trend.map((m, i) => (
              <div key={i} style={{
                fontSize: 9, textAlign: "center", letterSpacing: "0.14em",
                textTransform: "uppercase", fontWeight: 500,
                color: m.mk === activeMonth ? "var(--ax-gold)" : "var(--ax-fg-muted)",
              }}>
                {m.label}
              </div>
            ))}
          </div>

          {/* Legend + avg */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--ax-border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 10, color: "var(--ax-fg-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, borderTop: "1px dashed var(--ax-fg-muted)", display: "inline-block" }} />
                Income
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, background: "var(--ax-gold)", borderRadius: 1, display: "inline-block" }} />
                Spent
              </span>
            </div>
            <div style={{ fontSize: 11, color: "var(--ax-fg-muted)" }}>
              Avg saved:{" "}
              <span style={{ fontFamily: "var(--ax-font-display)", fontStyle: "italic", color: "var(--ax-gold)", fontSize: 14 }}>
                {fmt(trend.reduce((s, m) => s + m.savings, 0) / Math.max(trend.filter(m => m.income > 0).length, 1))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {catBreakdown.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Eyebrow num={3} label="Spending breakdown" />
          <div style={{
            marginTop: 14, background: "var(--ax-midnight)",
            border: "1px solid var(--ax-border)", borderRadius: "var(--ax-radius-2)",
            overflow: "hidden",
          }}>
            {catBreakdown.map((cat, i) => {
              const pct = ms.spending > 0 ? (cat.amount / ms.spending) * 100 : 0;
              const cfg = getCategoryConfig(cat.name);
              return (
                <div key={cat.name} style={{
                  padding: "14px 16px",
                  borderBottom: i < catBreakdown.length - 1 ? "1px solid var(--ax-border)" : "none",
                  cursor: "pointer", transition: "background 220ms var(--ax-ease)",
                }}
                onClick={() => onCategoryClick?.({ type: "category", title: cat.name, transactions: cat.transactions })}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(201,165,90,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <CatIcon category={cat.name} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 14, color: "var(--ax-fg)" }}>{cat.name}</span>
                        <span style={{ fontFamily: "var(--ax-font-display)", fontSize: 14, color: "var(--ax-fg)" }}>
                          {fmt(cat.amount)}
                          <span style={{ color: "var(--ax-fg-faint)", fontSize: 11, marginLeft: 4 }}>{pct.toFixed(0)}%</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ width: "100%", height: 2, borderRadius: 2, background: "var(--ax-border)", overflow: "hidden" }}>
                    <div style={{
                      width: `${Math.min(pct, 100)}%`, height: "100%",
                      background: cfg.color || "var(--ax-gold)",
                      transition: "width 600ms var(--ax-ease)",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Savings rate card */}
      <div>
        <Eyebrow num={4} label="Savings rate" />
        <div style={{
          marginTop: 14, background: "var(--ax-midnight)",
          border: "1px solid var(--ax-border)", borderRadius: "var(--ax-radius-2)",
          padding: "18px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontFamily: "var(--ax-font-display)", fontSize: 36, fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1,
              color: ms.rate >= 20 ? "#7A8C6F" : ms.rate >= 10 ? "#D4B76A" : "var(--ax-error)",
            }}>
              {ms.rate}%
            </div>
            <div style={{ fontSize: 11, color: "var(--ax-fg-muted)", marginTop: 6 }}>
              {ms.rate >= 20 ? "Excellent — you're building real wealth." :
               ms.rate >= 10 ? "Good — push to 20% for stronger reserves." :
               "Below target — consider cutting discretionary spend."}
            </div>
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 10px", borderRadius: 2,
            background: `${statusMap[savingsStatus].color}20`,
            border: `1px solid ${statusMap[savingsStatus].color}55`,
            color: statusMap[savingsStatus].color,
            fontSize: 10, fontWeight: 500, letterSpacing: "0.26em", textTransform: "uppercase",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusMap[savingsStatus].color }} />
            {statusMap[savingsStatus].label}
          </span>
        </div>
      </div>
    </div>
  );
}
