"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, X,
  TrendingUp, TrendingDown, Minus,
  AlertTriangle, Sparkles, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart, BarChart, Bar, ReferenceLine,
  Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from "recharts";
import { getCategoryConfig, getParentCategory } from "@/utils/categoryConfig";

// ── helpers ──────────────────────────────────────────────────────────────────

const offsetMonth = (key, delta) => {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const labelLong  = (key) => { const [y,m]=key.split("-").map(Number); return new Date(y,m-1,1).toLocaleString("en-US",{month:"long",year:"numeric"}); };
const labelShort = (key) => { const [y,m]=key.split("-").map(Number); return new Date(y,m-1,1).toLocaleString("en-US",{month:"short",year:"2-digit"}); };

const monthStats = (txList, mk) => {
  const mTx = txList.filter(tx => tx.date.startsWith(mk));
  const income   = mTx.filter(t => Number(t.amount) > 0).reduce((s,t) => s+Number(t.amount), 0);
  const spending = Math.abs(mTx.filter(t => Number(t.amount) < 0).reduce((s,t) => s+Number(t.amount), 0));
  const saved    = income - spending;
  const rate     = income > 0 ? (saved / income) * 100 : 0;
  return { income, spending, saved, rate };
};

const rateLabel = (r) =>
  r >= 25 ? { text: "Excellent", cls: "text-emerald-600 dark:text-emerald-400" }
  : r >= 15 ? { text: "Healthy",   cls: "text-emerald-600 dark:text-emerald-400" }
  : r >= 5  ? { text: "Fair",      cls: "text-amber-500" }
  :           { text: "Low",       cls: "text-red-500" };

// ── tooltip ──────────────────────────────────────────────────────────────────

const SlimTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  const fmt = (v) => {
    const s = Math.abs(v).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0});
    return currency === "AED" ? `Đ ${s}` : `$${s}`;
  };
  return (
    <div className="bg-slate-900/95 border border-white/10 rounded-xl px-3 py-2.5 shadow-xl min-w-[130px]">
      <p className="text-[10px] text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex justify-between gap-3 items-center text-xs mb-0.5">
          <span style={{ color: p.color }} className="font-medium">{p.name}</span>
          <span className="font-bold text-white">{p.dataKey === "rate" ? `${Number(p.value).toFixed(1)}%` : fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ── main component ────────────────────────────────────────────────────────────

export function InsightsTab({ txList, currency, onCategoryClick, userId }) {
  const fmt = (n, dec = 0) => {
    const s = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    return currency === "AED" ? `Đ ${s}` : `$${s}`;
  };
  const fmtDec = (n) => fmt(n, 2);

  // ── month navigation ──────────────────────────────────────────────────────
  const availableMonths = useMemo(() =>
    [...new Set(txList.map(tx => tx.date.slice(0,7)))].sort()
  , [txList]);

  const latestMonth = availableMonths[availableMonths.length - 1] || new Date().toISOString().slice(0,7);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const activeMonth = selectedMonth || latestMonth;

  const monthIdx  = availableMonths.indexOf(activeMonth);
  const canGoBack = monthIdx > 0;
  const canGoFwd  = monthIdx < availableMonths.length - 1;
  const goBack = () => canGoBack && setSelectedMonth(availableMonths[monthIdx - 1]);
  const goFwd  = () => canGoFwd  && setSelectedMonth(availableMonths[monthIdx + 1]);

  // ── chart category selection (carousel only) ──────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ── budgets from localStorage ─────────────────────────────────────────────
  const [budgets, setBudgets] = useState([]);
  useEffect(() => {
    if (!userId) return;
    try {
      const raw = localStorage.getItem(`finacle_budgets_${userId}`);
      if (raw) setBudgets(JSON.parse(raw));
    } catch {}
  }, [userId]);

  const selectedCategoryBudget = useMemo(() =>
    selectedCategory ? (budgets.find(b => b.category === selectedCategory)?.limit ?? null) : null
  , [budgets, selectedCategory]);

  // ── core monthly figures ──────────────────────────────────────────────────
  const { income, spending, saved, rate: savingsRate } = useMemo(
    () => monthStats(txList, activeMonth), [txList, activeMonth]
  );
  const rl = rateLabel(savingsRate);

  // ── category breakdown ────────────────────────────────────────────────────
  const categoryBreakdown = useMemo(() => {
    const totals = {};
    txList.filter(tx => tx.date.startsWith(activeMonth) && Number(tx.amount) < 0).forEach(tx => {
      const parent = getParentCategory(tx.category);
      totals[parent] = (totals[parent] || 0) + Math.abs(Number(tx.amount));
    });
    return Object.entries(totals)
      .sort(([,a],[,b]) => b - a)
      .map(([cat, amount]) => ({
        cat, amount,
        pctOfIncome:   income   > 0 ? (amount / income)   * 100 : 0,
        pctOfSpending: spending > 0 ? (amount / spending) * 100 : 0,
      }));
  }, [txList, activeMonth, income, spending]);

  // ── category performance vs prev / 3-month avg ───────────────────────────
  const categoryPerf = useMemo(() => {
    const prev1 = offsetMonth(activeMonth, -1);
    const prev2 = offsetMonth(activeMonth, -2);
    const prev3 = offsetMonth(activeMonth, -3);
    const spendByMonthCat = {};
    txList.filter(tx => Number(tx.amount) < 0).forEach(tx => {
      const mk = tx.date.slice(0,7);
      const parent = getParentCategory(tx.category);
      if (!spendByMonthCat[mk]) spendByMonthCat[mk] = {};
      spendByMonthCat[mk][parent] = (spendByMonthCat[mk][parent] || 0) + Math.abs(Number(tx.amount));
    });
    return categoryBreakdown.map(({ cat, amount, pctOfIncome, pctOfSpending }) => {
      const prevAmt = spendByMonthCat[prev1]?.[cat] || 0;
      const avg3    = ([prev1, prev2, prev3].reduce((s, mk) => s + (spendByMonthCat[mk]?.[cat] || 0), 0)) / 3;
      return {
        cat, amount, pctOfIncome, pctOfSpending,
        prevAmt, avg3,
        vsPrev: prevAmt > 0 ? ((amount - prevAmt) / prevAmt) * 100 : null,
        vsAvg:  avg3   > 0 ? ((amount - avg3)   / avg3)   * 100 : null,
      };
    });
  }, [txList, activeMonth, categoryBreakdown]);

  // ── 6-month income/spending trend ─────────────────────────────────────────
  const trendData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const mk = offsetMonth(activeMonth, i - 5);
      const { income: inc, spending: spd, saved: sv, rate } = monthStats(txList, mk);
      return { month: labelShort(mk), income: Math.round(inc), spending: Math.round(spd), saved: Math.round(sv), rate: Math.round(rate * 10) / 10 };
    })
  , [txList, activeMonth]);

  // ── selected category 6-month trend ──────────────────────────────────────
  const categoryTrendData = useMemo(() => {
    if (!selectedCategory) return [];
    return Array.from({ length: 6 }, (_, i) => {
      const mk = offsetMonth(activeMonth, i - 5);
      const amount = txList
        .filter(tx => tx.date.startsWith(mk) && getParentCategory(tx.category) === selectedCategory && Number(tx.amount) < 0)
        .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
      return { month: labelShort(mk), amount: Math.round(amount * 100) / 100, isActive: mk === activeMonth };
    });
  }, [txList, activeMonth, selectedCategory]);

  const catColor = selectedCategory ? (getCategoryConfig(selectedCategory).color || "#6366f1") : "#6366f1";

  // ── alerts ────────────────────────────────────────────────────────────────
  const alerts = useMemo(() =>
    categoryPerf.filter(c => c.vsAvg !== null && c.vsAvg > 20 && c.amount > 200)
      .sort((a,b) => b.vsAvg - a.vsAvg).slice(0, 3)
  , [categoryPerf]);

  // ── open modal for a category (does NOT change the chart) ─────────────────
  const openCategoryModal = (cat) => {
    if (!onCategoryClick) return;
    const monthTx = txList.filter(tx => tx.category === cat && tx.date.startsWith(activeMonth));
    onCategoryClick({ type: "category", title: `${cat} — ${labelLong(activeMonth)}`, transactions: monthTx });
  };

  // Allocation bar: normalise widths when total spending > income
  const totalSpentPct = categoryBreakdown.reduce((s, c) => s + c.pctOfIncome, 0);
  const isOverspent   = totalSpentPct > 100;
  const barScale      = isOverspent ? (100 / totalSpentPct) : 1;
  const savingsBarPct = isOverspent ? 0 : Math.max(0, savingsRate);

  // ── empty state ───────────────────────────────────────────────────────────
  if (!txList.length) {
    return (
      <div className="animate-slide-up space-y-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-14 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <TrendingUp size={28} className="text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Data Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload a CSV statement to analyse how you're allocating your income.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5 animate-slide-up">

      {/* ── Month Picker ── */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400">Monthly income allocation & spending analysis</p>
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 md:px-4 py-2 shadow-sm shrink-0">
          <button onClick={goBack} disabled={!canGoBack}
            className="p-1 md:p-1.5 rounded-lg text-slate-500 dark:text-slate-400 disabled:opacity-25 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft size={14} />
          </button>
          <span className="text-[11px] md:text-sm font-bold text-slate-900 dark:text-white min-w-[90px] md:min-w-[130px] text-center select-none px-1">
            {labelLong(activeMonth)}
          </span>
          <button onClick={goFwd} disabled={!canGoFwd}
            className="p-1 md:p-1.5 rounded-lg text-slate-500 dark:text-slate-400 disabled:opacity-25 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Income",       value: fmt(income),          sub: "Inflows this month", valueClass: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-500/20", Icon: ArrowUpRight,   iconClass: "text-emerald-500", iconBg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Total Spent",  value: fmt(spending),        sub: income > 0 ? `${((spending/income)*100).toFixed(0)}% of income` : "No income", valueClass: "text-slate-900 dark:text-white", border: "border-red-100 dark:border-red-500/20", Icon: ArrowDownRight, iconClass: "text-red-500", iconBg: "bg-red-50 dark:bg-red-500/10" },
          { label: "Saved",        value: fmt(Math.abs(saved)), sub: saved >= 0 ? "Kept" : "Over-spent", valueClass: saved >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-red-500", border: saved >= 0 ? "border-indigo-100 dark:border-indigo-500/20" : "border-red-100 dark:border-red-500/20", Icon: saved >= 0 ? TrendingUp : TrendingDown, iconClass: saved >= 0 ? "text-indigo-500" : "text-red-500", iconBg: saved >= 0 ? "bg-indigo-50 dark:bg-indigo-500/10" : "bg-red-50 dark:bg-red-500/10" },
          { label: "Savings Rate", value: `${savingsRate.toFixed(1)}%`, sub: rl.text, valueClass: rl.cls, border: "border-slate-100 dark:border-slate-800", Icon: savingsRate >= 15 ? TrendingUp : savingsRate >= 5 ? Minus : TrendingDown, iconClass: savingsRate >= 15 ? "text-emerald-500" : savingsRate >= 5 ? "text-amber-500" : "text-red-500", iconBg: savingsRate >= 15 ? "bg-emerald-50 dark:bg-emerald-500/10" : savingsRate >= 5 ? "bg-amber-50 dark:bg-amber-500/10" : "bg-red-50 dark:bg-red-500/10" },
        ].map(({ label, value, sub, valueClass, border, Icon, iconClass, iconBg }) => (
          <div key={label} className={`bg-white dark:bg-slate-900 border ${border} rounded-2xl p-3 md:p-4 shadow-sm`}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-[9px] md:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight">{label}</p>
              <div className={`w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={12} className={iconClass} />
              </div>
            </div>
            <p className={`text-base md:text-xl font-black tabular-nums leading-tight ${valueClass}`}>{value}</p>
            <p className="text-[9px] md:text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-tight">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Income Allocation Bar ── */}
      {income > 0 && categoryBreakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">Income Allocation</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isOverspent ? `Spending (Đ ${fmt(spending)}) exceeds income (Đ ${fmt(income)}) this month` : `Every dirham of your ${fmt(income)} — where it went`}
              </p>
            </div>
            {isOverspent ? (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 shrink-0">Over-spent</span>
            ) : savingsRate > 0 && (
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 shrink-0 ${rl.cls}`}>
                {savingsRate.toFixed(0)}% saved
              </span>
            )}
          </div>

          {/* Stacked allocation bar — always fits 100% */}
          <div className="h-8 w-full flex rounded-xl overflow-hidden gap-px mb-4">
            {categoryBreakdown.map(({ cat, pctOfIncome }) => {
              const { color } = getCategoryConfig(cat);
              const barW = pctOfIncome * barScale;
              return barW > 0.5 ? (
                <div
                  key={cat}
                  className="h-full transition-all duration-700 ease-out relative cursor-pointer hover:opacity-80"
                  style={{ width: `${barW}%`, backgroundColor: color }}
                  title={`${cat}: ${pctOfIncome.toFixed(1)}% of income`}
                  onClick={() => openCategoryModal(cat)}
                >
                  {barW > 10 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/90 select-none">
                      {pctOfIncome.toFixed(0)}%
                    </span>
                  )}
                </div>
              ) : null;
            })}
            {savingsBarPct > 0.5 && (
              <div className="h-full bg-emerald-500 transition-all duration-700 ease-out relative"
                style={{ flex: `0 0 ${savingsBarPct}%` }}>
                {savingsBarPct > 10 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/90 select-none">Saved</span>
                )}
              </div>
            )}
          </div>

          {/* Legend — 2-column grid, properly aligned */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {categoryBreakdown.map(({ cat, pctOfIncome }) => {
              const { color } = getCategoryConfig(cat);
              return pctOfIncome * barScale > 0.5 ? (
                <button key={cat} onClick={() => openCategoryModal(cat)}
                  className="flex items-center gap-1.5 text-left min-w-0 hover:opacity-80 transition-opacity">
                  <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate">{cat}</span>
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white shrink-0 ml-auto pl-1">
                    {pctOfIncome.toFixed(0)}%
                  </span>
                </button>
              ) : null;
            })}
            {savingsBarPct > 0.5 && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-sm shrink-0 bg-emerald-500" />
                <span className="text-[11px] text-slate-600 dark:text-slate-300">Saved</span>
                <span className={`text-[11px] font-bold ml-auto pl-1 ${rl.cls}`}>{savingsRate.toFixed(0)}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Category table + Dynamic chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">

        {/* Category Performance Table */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">Category Performance</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tap a row to see transactions</p>
          </div>

          <div className="hidden sm:grid grid-cols-[1fr_100px_70px_55px] gap-2 px-4 md:px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50">
            {["Category","This Month","vs Prev","% Inc"].map((h,i) => (
              <span key={h} className={`text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ${i>0?"text-right":""}`}>{h}</span>
            ))}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {categoryPerf.length === 0 ? (
              <p className="p-4 text-sm text-slate-400">No spending data for this month.</p>
            ) : categoryPerf.map(({ cat, amount, pctOfIncome, vsPrev }) => {
              const { Icon, iconBg, iconText, color } = getCategoryConfig(cat);
              const up   = vsPrev !== null && vsPrev >  5;
              const down = vsPrev !== null && vsPrev < -5;
              return (
                <div key={cat} onClick={() => openCategoryModal(cat)}
                  className="px-4 md:px-5 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  {/* Mobile */}
                  <div className="sm:hidden flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                        <Icon size={13} className={iconText} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-slate-900 dark:text-white truncate">{cat}</p>
                        <p className={`text-[10px] font-semibold ${up ? "text-red-500" : down ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                          {vsPrev !== null ? `${up?"+":""}${vsPrev.toFixed(0)}% vs prev` : "No prior data"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[12px] font-bold text-slate-900 dark:text-white tabular-nums">{fmtDec(amount)}</p>
                      <p className="text-[10px] text-slate-400">{pctOfIncome.toFixed(1)}% inc</p>
                    </div>
                  </div>
                  {/* Desktop */}
                  <div className="hidden sm:grid grid-cols-[1fr_100px_70px_55px] gap-2 items-center">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                        <Icon size={13} className={iconText} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{cat}</p>
                        <div className="h-1 max-w-[90px] bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${Math.min(100,pctOfIncome)}%`, backgroundColor:color }} />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white text-right tabular-nums">{fmtDec(amount)}</p>
                    <p className={`text-xs font-bold text-right tabular-nums ${up?"text-red-500":down?"text-emerald-600 dark:text-emerald-400":"text-slate-400 dark:text-slate-500"}`}>
                      {vsPrev !== null ? `${up?"+":""}${vsPrev.toFixed(0)}%` : "—"}
                    </p>
                    <p className="text-xs font-semibold text-right tabular-nums text-slate-500 dark:text-slate-400">
                      {pctOfIncome.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Chart Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col">
          <div className="flex items-start justify-between mb-2.5">
            <div>
              <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-tight">
                {selectedCategory || "Income vs Spending"}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedCategory
                  ? `6-month trend${selectedCategoryBudget ? " · budget shown" : ""}`
                  : "Last 6 months — gap = savings"}
              </p>
            </div>
            {selectedCategory && (
              <button onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
                <X size={12} /> Reset
              </button>
            )}
          </div>

          {/* ── Premium Category Carousel ── */}
          <div className="relative mb-3">
            {/* Glass container */}
            <div className="relative rounded-xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.12)" }}>
              {/* Dark mode inner surface */}
              <div className="absolute inset-0 bg-slate-100/70 dark:bg-slate-800/70 rounded-xl" />
              {/* Left fade */}
              <div className="absolute left-0 top-0 bottom-0 w-5 pointer-events-none z-10 rounded-l-xl"
                style={{ background: "linear-gradient(to right, rgba(241,245,249,0.95), transparent)" }} />
              <div className="absolute left-0 top-0 bottom-0 w-5 pointer-events-none z-10 rounded-l-xl dark:block hidden"
                style={{ background: "linear-gradient(to right, rgba(15,23,42,0.9), transparent)" }} />
              {/* Right fade */}
              <div className="absolute right-0 top-0 bottom-0 w-5 pointer-events-none z-10 rounded-r-xl"
                style={{ background: "linear-gradient(to left, rgba(241,245,249,0.95), transparent)" }} />
              <div className="absolute right-0 top-0 bottom-0 w-5 pointer-events-none z-10 rounded-r-xl dark:block hidden"
                style={{ background: "linear-gradient(to left, rgba(15,23,42,0.9), transparent)" }} />

              {/* Scrollable pills */}
              <div className="relative overflow-x-auto scrollbar-none flex items-center gap-1.5 px-3 py-2">
                {/* Overview pill */}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap shadow-sm ${
                    !selectedCategory
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                      : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white/90"
                  }`}
                >
                  Overview
                </button>

                {categoryBreakdown.map(({ cat }) => {
                  const { color } = getCategoryConfig(cat);
                  const isSel = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(isSel ? null : cat)}
                      className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap shadow-sm ${
                        isSel ? "text-white" : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white/90"
                      }`}
                      style={isSel ? { backgroundColor: color, boxShadow: `0 2px 10px ${color}55` } : {}}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1" style={{ minHeight: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              {selectedCategory ? (
                <BarChart data={categoryTrendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="catBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={catColor} stopOpacity={0.95} />
                      <stop offset="100%" stopColor={catColor} stopOpacity={0.55} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} width={42}
                    tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<SlimTooltip currency={currency} />} />
                  <Bar dataKey="amount" name={selectedCategory} radius={[5,5,0,0]} maxBarSize={36}>
                    {categoryTrendData.map((entry, i) => (
                      <Cell key={i} fill={entry.isActive ? catColor : `${catColor}60`} />
                    ))}
                  </Bar>
                  {selectedCategoryBudget && (
                    <ReferenceLine y={selectedCategoryBudget} stroke="#EF4444" strokeWidth={2} strokeDasharray="6 3"
                      label={{ value: `Budget`, position: "insideTopRight", fill: "#EF4444", fontSize: 10, fontWeight: 600 }}
                    />
                  )}
                </BarChart>
              ) : (
                <ComposedChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={2}>
                  <defs>
                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="spdGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="amt" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} width={38}
                    tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <YAxis yAxisId="rate" orientation="right" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} width={28}
                    tickFormatter={v => `${v}%`} domain={[0, 100]} />
                  <Tooltip content={<SlimTooltip currency={currency} />} />
                  <Bar yAxisId="amt" dataKey="income"   name="Income" fill="url(#incGrad)" radius={[4,4,0,0]} maxBarSize={20} />
                  <Bar yAxisId="amt" dataKey="spending" name="Spent"  fill="url(#spdGrad)" radius={[4,4,0,0]} maxBarSize={20} />
                  <Line yAxisId="rate" type="monotone" dataKey="rate" name="Savings %"
                    stroke="#6366f1" strokeWidth={2} dot={{ r: 2.5, fill: "#6366f1", strokeWidth: 0 }}
                    activeDot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Chart legend */}
          <div className="flex items-center justify-center flex-wrap gap-3 md:gap-5 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
            {selectedCategory ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: catColor }} />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">This month</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm opacity-40" style={{ backgroundColor: catColor }} />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Prior months</span>
                </div>
                {selectedCategoryBudget && (
                  <div className="flex items-center gap-1.5">
                    <svg width={14} height={7}><line x1={0} y1={3.5} x2={14} y2={3.5} stroke="#EF4444" strokeWidth={2} strokeDasharray="4 2" /></svg>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Budget</span>
                  </div>
                )}
              </>
            ) : (
              <>
                {[{ color: "#10B981", label: "Income" }, { color: "#EF4444", label: "Spent" }, { color: "#6366f1", label: "Savings %", dash: true }].map(({ color, label, dash }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    {dash ? (
                      <svg width={14} height={7}><line x1={0} y1={3.5} x2={14} y2={3.5} stroke={color} strokeWidth={2} strokeDasharray="3 2" /></svg>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                    )}
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{label}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Overspending Alerts ── */}
      {alerts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 md:p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={15} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Spending Alerts</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Tap to see transactions</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {alerts.map(({ cat, amount, avg3, vsAvg }) => {
              const { Icon, iconBg, iconText } = getCategoryConfig(cat);
              return (
                <div key={cat} onClick={() => openCategoryModal(cat)}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/[0.06] border border-amber-100 dark:border-amber-500/20 cursor-pointer hover:border-amber-300 dark:hover:border-amber-500/40 transition-all">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon size={14} className={iconText} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-slate-900 dark:text-white truncate">{cat}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">avg {fmtDec(avg3)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[12px] font-black text-red-500">{fmtDec(amount)}</p>
                    <p className="text-[10px] font-bold text-red-400">+{vsAvg.toFixed(0)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── AI Nudge ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 dark:from-[#060812] dark:via-indigo-950/60 dark:to-[#060812] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(99,102,241,0.15),transparent_55%)] pointer-events-none" />
        <div className="relative flex items-start gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-xl shrink-0">
            <Sparkles size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Want a deeper analysis?</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Ask the AI Advisor — "Where am I overspending?"</p>
          </div>
        </div>
        <p className="relative text-[11px] text-slate-500 shrink-0">Chat → bottom right</p>
      </div>

    </div>
  );
}
