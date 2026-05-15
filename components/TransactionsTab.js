"use client";

import { useState, useMemo } from "react";
import {
  Search, Download, Calendar, Filter, X,
  ChevronLeft, ChevronRight, TrendingUp,
} from "lucide-react";
import { getCategoryConfig, ALL_CATEGORIES } from "@/utils/categoryConfig";

const PAGE_SIZE = 20;

const DATE_RANGES = [
  { label: "Last 7 Days",   days: 7   },
  { label: "Last 30 Days",  days: 30  },
  { label: "Last 3 Months", days: 90  },
  { label: "All Time",      days: null },
];

const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const fmtDate = (dateStr) => {
  if (!dateStr) return "";
  const d = parseLocalDate(dateStr);
  return `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString("en-US", { month: "short" })}`;
};

export function TransactionsTab({ txList, currency }) {
  const [search, setSearch]           = useState("");
  const [dateRange, setDateRange]     = useState(null);
  const [categoryFilter, setCat]      = useState(null);
  const [page, setPage]               = useState(1);
  const [showDateMenu, setDateMenu]   = useState(false);
  const [showCatMenu, setCatMenu]     = useState(false);

  const fmt = (amount) => {
    const abs = Math.abs(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
    return currency === "AED" ? `Đ ${abs}` : `$${abs}`;
  };

  const filtered = useMemo(() => {
    let result = txList;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.description.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q),
      );
    }

    if (dateRange !== null) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - dateRange);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      result = result.filter((tx) => tx.date >= cutoffStr);
    }

    if (categoryFilter) {
      result = result.filter((tx) => tx.category === categoryFilter);
    }

    return result;
  }, [txList, search, dateRange, categoryFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageTx = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = search || dateRange !== null || categoryFilter;
  const activeDateLabel = dateRange !== null
    ? DATE_RANGES.find((r) => r.days === dateRange)?.label
    : null;

  const resetPage = () => setPage(1);

  const exportCSV = () => {
    const rows = [
      ["Date", "Description", "Category", "Amount", "Status"],
      ...filtered.map((tx) => [
        tx.date,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.category,
        tx.amount,
        tx.status || "Completed",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finacle_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const closeMenus = () => { setDateMenu(false); setCatMenu(false); };

  return (
    <div className="space-y-5 animate-slide-up" onClick={closeMenus}>

      {/* ── Page header ── */}
      <div className="flex justify-end">
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors shadow-sm shrink-0"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              placeholder="Search transactions…"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 transition-all"
            />
          </div>

          {/* Date filter */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setDateMenu((v) => !v); setCatMenu(false); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                dateRange !== null
                  ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400"
              }`}
            >
              <Calendar size={14} />
              {activeDateLabel || "Date Range"}
            </button>
            {showDateMenu && (
              <div className="absolute top-full mt-2 left-0 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[160px] animate-fade-in">
                {DATE_RANGES.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => { setDateRange(r.days); setDateMenu(false); resetPage(); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 ${
                      dateRange === r.days
                        ? "font-semibold text-slate-900 dark:text-white"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category filter */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setCatMenu((v) => !v); setDateMenu(false); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                categoryFilter
                  ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400"
              }`}
            >
              <Filter size={14} />
              {categoryFilter || "Category"}
            </button>
            {showCatMenu && (
              <div className="absolute top-full mt-2 left-0 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[190px] max-h-72 overflow-y-auto animate-fade-in">
                {ALL_CATEGORIES.map((cat) => {
                  const { Icon, iconText } = getCategoryConfig(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setCat(cat === categoryFilter ? null : cat);
                        setCatMenu(false);
                        resetPage();
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 ${
                        categoryFilter === cat
                          ? "font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Icon size={14} className={iconText} />
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setDateRange(null); setCat(null); resetPage(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <X size={13} />
              Clear
            </button>
          )}

          <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 shrink-0 tabular-nums">
            {filtered.length.toLocaleString()} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                {["Date", "Description", "Category", "Amount"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ${i === 3 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pageTx.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-400 dark:text-slate-500 text-sm">
                    {txList.length === 0
                      ? "No transactions yet — upload a CSV or load the demo."
                      : "No transactions match your filters."}
                  </td>
                </tr>
              ) : (
                pageTx.map((tx) => {
                  const { Icon, pill, iconBg, iconText } = getCategoryConfig(tx.category);
                  const isIncome = Number(tx.amount) > 0;
                  return (
                    <tr
                      key={tx.id}
                      className="group hover:bg-slate-50 dark:hover:bg-white/[0.025] transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">
                        {fmtDate(tx.date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                            <Icon size={15} className={iconText} />
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {tx.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${pill}`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold text-right tabular-nums whitespace-nowrap ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                        {isIncome ? "+" : "−"}{fmt(tx.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {pageTx.length === 0 ? (
            <p className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
              {txList.length === 0
                ? "Upload a CSV to get started."
                : "No transactions match your filters."}
            </p>
          ) : (
            pageTx.map((tx) => {
              const { Icon, pill, iconBg, iconText } = getCategoryConfig(tx.category);
              const isIncome = Number(tx.amount) > 0;
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.025] transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon size={17} className={iconText} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{fmtDate(tx.date)}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${pill}`}>
                        {tx.category}
                      </span>
                    </div>
                  </div>
                  <span className={`text-sm font-bold shrink-0 tabular-nums ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                    {isIncome ? "+" : "−"}{fmt(tx.amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length.toLocaleString()}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                let p;
                if (pageCount <= 5) p = i + 1;
                else if (page <= 3) p = i + 1;
                else if (page >= pageCount - 2) p = pageCount - 4 + i;
                else p = page - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      page === p
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page === pageCount}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── AI banner ── */}
      {txList.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-indigo-950 dark:to-slate-900 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl shrink-0">
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Spending Analysis</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {filtered.length.toLocaleString()} transaction{filtered.length !== 1 ? "s" : ""} shown — open the AI Advisor for personalised insights.
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500 shrink-0">Chat widget → bottom right</span>
        </div>
      )}
    </div>
  );
}
