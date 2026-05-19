"use client";

import { useState, useMemo } from "react";
import { Search, Download } from "lucide-react";
import { getCategoryConfig, ALL_CATEGORIES, getParentCategory } from "@/utils/categoryConfig";

const PAGE_SIZE = 20;

const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const fmtDate = (dateStr) => {
  if (!dateStr) return "";
  const d = parseLocalDate(dateStr);
  return `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`;
};

const fmtDay = (dateStr) => {
  if (!dateStr) return "";
  const d = parseLocalDate(dateStr);
  return d.toLocaleString("en-US", { weekday: "short", day: "numeric", month: "short" });
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

export function TransactionsTab({ txList, currency }) {
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("all");
  const [page, setPage]             = useState(1);

  const fmt = (amount) => {
    const abs = Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return currency === "AED" ? `Đ ${abs}` : `$${abs}`;
  };

  const filtered = useMemo(() => {
    let result = txList;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.description?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q)
      );
    }
    if (catFilter !== "all") {
      result = result.filter(t => t.category === catFilter || getParentCategory(t.category) === catFilter);
    }
    return result;
  }, [txList, search, catFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Group by day
  const groups = useMemo(() => {
    const g = {};
    paged.forEach(tx => {
      const key = tx.date;
      if (!g[key]) g[key] = [];
      g[key].push(tx);
    });
    return Object.entries(g).sort((a, b) => b[0].localeCompare(a[0]));
  }, [paged]);

  const totalIn  = filtered.filter(t => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0);
  const totalOut = filtered.filter(t => Number(t.amount) < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  // Top-level categories present in txList
  const availableCats = useMemo(() => {
    const cats = new Set(txList.map(t => getParentCategory(t.category)));
    return ["all", ...ALL_CATEGORIES.filter(c => cats.has(c))];
  }, [txList]);

  const exportCSV = () => {
    const header = "Date,Description,Category,Amount\n";
    const rows   = filtered
      .map(t => `${t.date},"${t.description}","${t.category}",${t.amount}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "axy_folio_transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "20px 20px 8px", animation: "slide-up 0.42s cubic-bezier(0.22,1,0.36,1) forwards" }}>

      {/* Header eyebrow */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{
            fontSize: "var(--ax-fs-eyebrow)", fontWeight: 500, textTransform: "uppercase",
            letterSpacing: "0.32em", color: "var(--ax-gold)", display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ opacity: 0.6 }}>02</span>
            <span style={{ width: 1, height: 10, background: "var(--ax-border-gold)" }} />
            Transactions
          </div>
          <div style={{ fontFamily: "var(--ax-font-display)", fontSize: 26, fontWeight: 300, marginTop: 4, color: "var(--ax-fg)" }}>
            An imported <em style={{ color: "var(--ax-fg-muted)" }}>ledger.</em>
          </div>
        </div>
        <button onClick={exportCSV} style={{
          width: 36, height: 36, borderRadius: "var(--ax-radius-2)",
          border: "1px solid var(--ax-border-strong)",
          background: "transparent", color: "var(--ax-fg-muted)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}>
          <Download size={14} />
        </button>
      </div>

      {/* Summary card */}
      <div style={{
        background: "var(--ax-midnight)", border: "1px solid var(--ax-border)",
        borderRadius: "var(--ax-radius-2)", padding: 14, marginBottom: 16,
        display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr", gap: 12, alignItems: "center",
      }}>
        <SummaryCell label={`${filtered.length} txns`} value="" sub="filtered" />
        <span style={{ height: 28, background: "var(--ax-border)" }} />
        <SummaryCell label="In" value={fmt(totalIn)} gold />
        <span style={{ height: 28, background: "var(--ax-border)" }} />
        <SummaryCell label="Out" value={fmt(totalOut)} />
      </div>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", marginBottom: 12,
        background: "var(--ax-midnight)", border: "1px solid var(--ax-border)",
        borderRadius: "var(--ax-radius-2)",
      }}>
        <Search size={14} style={{ color: "var(--ax-fg-muted)", flexShrink: 0 }} />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search merchants, categories…"
          style={{
            flex: 1, background: "transparent", border: 0, outline: "none",
            color: "var(--ax-fg)", fontFamily: "var(--ax-font-body)", fontSize: 13,
          }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--ax-fg-muted)", cursor: "pointer", padding: 0 }}>
            ×
          </button>
        )}
      </div>

      {/* Category filter chips */}
      <div style={{
        display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 16,
        msOverflowStyle: "none", scrollbarWidth: "none",
      }} className="scrollbar-none">
        {availableCats.map(cat => {
          const isAll = cat === "all";
          const cfg   = !isAll ? getCategoryConfig(cat) : null;
          const active = catFilter === cat;
          return (
            <button key={cat} onClick={() => { setCatFilter(cat); setPage(1); }} style={{
              flexShrink: 0,
              padding: "6px 12px", borderRadius: 2,
              background: active ? "var(--ax-gold)" : "transparent",
              border: `1px solid ${active ? "var(--ax-gold)" : "var(--ax-border-strong)"}`,
              color: active ? "var(--ax-midnight)" : "var(--ax-fg-muted)",
              fontFamily: "var(--ax-font-body)", fontSize: 10,
              letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500,
              cursor: "pointer", transition: "all 220ms var(--ax-ease)",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              {cfg && (
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: active ? "var(--ax-midnight)" : cfg.color,
                }} />
              )}
              {isAll ? "All" : cat}
            </button>
          );
        })}
      </div>

      {/* Grouped list */}
      {groups.length === 0 ? (
        <div style={{
          padding: "40px 20px", textAlign: "center",
          border: "1px dashed var(--ax-border)", borderRadius: "var(--ax-radius-2)",
          color: "var(--ax-fg-muted)", fontSize: 13,
        }}>
          No transactions match.
        </div>
      ) : (
        groups.map(([date, items]) => {
          const dayTotal = items.reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
          return (
            <div key={date} style={{ marginBottom: 20 }}>
              {/* Day header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, padding: "0 2px" }}>
                <span style={{
                  fontSize: 10, letterSpacing: "0.28em", color: "var(--ax-fg-muted)",
                  textTransform: "uppercase", fontWeight: 500, whiteSpace: "nowrap",
                }}>
                  {fmtDay(date)}
                </span>
                <span style={{ flex: 1, height: 1, background: "var(--ax-border)" }} />
                <span style={{ fontSize: 11, color: "var(--ax-fg-muted)", whiteSpace: "nowrap" }}>
                  {items.length} · {fmt(dayTotal)}
                </span>
              </div>

              {/* Txn list */}
              <div style={{
                background: "var(--ax-midnight)", border: "1px solid var(--ax-border)",
                borderRadius: "var(--ax-radius-2)", overflow: "hidden",
              }}>
                {items.map((tx, i) => {
                  const isIncome = Number(tx.amount) > 0;
                  return (
                    <div key={tx.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "13px 16px",
                      borderBottom: i < items.length - 1 ? "1px solid var(--ax-border)" : "none",
                      transition: "background 220ms var(--ax-ease)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(201,165,90,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <CatIcon category={tx.category} size={36} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, color: "var(--ax-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {tx.description}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                          <span style={{
                            fontSize: 9, letterSpacing: "0.18em",
                            color: getCategoryConfig(tx.category).color || "var(--ax-fg-muted)",
                            textTransform: "uppercase", fontWeight: 500,
                            padding: "1px 6px", border: `1px solid ${getCategoryConfig(tx.category).color || "var(--ax-border-strong)"}44`,
                            borderRadius: 2,
                          }}>
                            {tx.category}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        fontFamily: "var(--ax-font-display)", fontSize: 15, fontWeight: 400,
                        color: isIncome ? "var(--ax-gold)" : "var(--ax-fg)",
                        whiteSpace: "nowrap",
                      }}>
                        {isIncome ? "+" : ""}{fmt(tx.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "12px 0" }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
            background: "transparent", border: "1px solid var(--ax-border-strong)",
            borderRadius: "var(--ax-radius-2)", padding: "8px 16px",
            color: page === 1 ? "var(--ax-fg-faint)" : "var(--ax-fg-muted)",
            fontFamily: "var(--ax-font-body)", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500,
            cursor: page === 1 ? "default" : "pointer",
          }}>
            Prev
          </button>
          <span style={{ fontSize: 11, color: "var(--ax-fg-muted)" }}>
            {page} / {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
            background: "transparent", border: "1px solid var(--ax-border-strong)",
            borderRadius: "var(--ax-radius-2)", padding: "8px 16px",
            color: page === totalPages ? "var(--ax-fg-faint)" : "var(--ax-fg-muted)",
            fontFamily: "var(--ax-font-body)", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500,
            cursor: page === totalPages ? "default" : "pointer",
          }}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function SummaryCell({ label, value, gold, sub }) {
  return (
    <div>
      <div style={{ fontSize: 9, letterSpacing: "0.28em", color: "var(--ax-fg-muted)", textTransform: "uppercase", fontWeight: 500 }}>
        {label}
      </div>
      {value && (
        <div style={{
          fontFamily: "var(--ax-font-display)", fontSize: 16, fontWeight: 400,
          marginTop: 4, color: gold ? "var(--ax-gold)" : "var(--ax-fg)",
          fontStyle: gold ? "italic" : "normal",
        }}>
          {value}
        </div>
      )}
    </div>
  );
}
