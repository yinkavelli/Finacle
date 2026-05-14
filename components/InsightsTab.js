"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, Minus,
  AlertTriangle, Sparkles, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart, BarChart, Bar,
  Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, Legend,
} from "recharts";
import { getCategoryConfig } from "@/utils/categoryConfig";

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
  :           { text: "Low — review spending", cls: "text-red-500" };

// ── tooltip ──────────────────────────────────────────────────────────────────

const SlimTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  const fmt = (v) => {
    const s = Math.abs(v).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0});
    return currency === "AED" ? `AED ${s}` : `$${s}`;
  };
  return (
    <div className="bg-slate-900/95 border border-white/10 rounded-xl px-3 py-2.5 shadow-xl min-w-[140px]">
      <p className="text-[10px] text-slate-400 mb-2 font-semibold uppercase tracking-wider">{label}</p>
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

export function InsightsTab({ txList, currency }) {
  const fmt = (n) => {
    const s = Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0});
    return currency === "AED" ? `AED ${s}` : `$${s}`;
  };
  const fmtDec = (n) => {
    const s = Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
    return currency === "AED" ? `AED ${s}` : `$${s}`;
  };

  // Available months (sorted)
  const availableMonths = useMemo(() =>
    [...new Set(txList.map(tx => tx.date.slice(0,7)))].sort()
  , [txList]);

  const latestMonth = availableMonths[availableMonths.length - 1] || new Date().toISOString().slice(0,7);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const activeMonth = selectedMonth || latestMonth;

  const monthIdx    = availableMonths.indexOf(activeMonth);
  const canGoBack   = monthIdx > 0;
  const canGoFwd    = monthIdx < availableMonths.length - 1;
  const goBack  = () => canGoBack  && setSelectedMonth(availableMonths[monthIdx - 1]);
  const goFwd   = () => canGoFwd   && setSelectedMonth(availableMonths[monthIdx + 1]);

  // ── Current month core figures ────────────────────────────────────────────
  const { income, spending, saved, rate: savingsRate } = useMemo(
    () => monthStats(txList, activeMonth), [txList, activeMonth]
  );
  const rl = rateLabel(savingsRate);

  // ── Category breakdown for active month ──────────────────────────────────
  const categoryBreakdown = useMemo(() => {
    const totals = {};
    txList.filter(tx => tx.date.startsWith(activeMonth) && Number(tx.amount) < 0).forEach(tx => {
      totals[tx.category] = (totals[tx.category] || 0) + Math.abs(Number(tx.amount));
    });
    return Object.entries(totals)
      .sort(([,a],[,b]) => b - a)
      .map(([cat, amount]) => ({
        cat, amount,
        pctOfIncome:   income   > 0 ? (amount / income)   * 100 : 0,
        pctOfSpending: spending > 0 ? (amount / spending) * 100 : 0,
      }));
  }, [txList, activeMonth, income, spending]);

  // ── Category performance vs prev / 3-month avg ───────────────────────────
  const categoryPerf = useMemo(() => {
    const prev1 = offsetMonth(activeMonth, -1);
    const prev2 = offsetMonth(activeMonth, -2);
    const prev3 = offsetMonth(activeMonth, -3);

    const spendByMonthCat = {}; // spendByMonthCat[month][cat] = amount
    txList.filter(tx => Number(tx.amount) < 0).forEach(tx => {
      const mk  = tx.date.slice(0,7);
      const cat = tx.category;
      const amt = Math.abs(Number(tx.amount));
      if (!spendByMonthCat[mk]) spendByMonthCat[mk] = {};
      spendByMonthCat[mk][cat] = (spendByMonthCat[mk][cat] || 0) + amt;
    });

    return categoryBreakdown.map(({ cat, amount, pctOfIncome, pctOfSpending }) => {
      const prevAmt = spendByMonthCat[prev1]?.[cat] || 0;
      const avg3 = ([prev1, prev2, prev3].reduce((s, mk) => s + (spendByMonthCat[mk]?.[cat] || 0), 0)) / 3;

      const vsPrev = prevAmt > 0 ? ((amount - prevAmt) / prevAmt) * 100 : null;
      const vsAvg  = avg3   > 0 ? ((amount - avg3)   / avg3)   * 100 : null;

      return { cat, amount, pctOfIncome, pctOfSpending, prevAmt, avg3, vsPrev, vsAvg };
    });
  }, [txList, activeMonth, categoryBreakdown]);

  // ── 6-month trend window ─────────────────────────────────────────────────
  const trendData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const mk = offsetMonth(activeMonth, i - 5);
      const { income: inc, spending: spd, saved: sv, rate } = monthStats(txList, mk);
      return {
        month: labelShort(mk),
        income: Math.round(inc),
        spending: Math.round(spd),
        saved: Math.round(sv),
        rate: Math.round(rate * 10) / 10,
        hasData: inc > 0 || spd > 0,
      };
    });
  }, [txList, activeMonth]);

  // ── Overspending alerts ───────────────────────────────────────────────────
  const alerts = useMemo(() =>
    categoryPerf
      .filter(c => c.vsAvg !== null && c.vsAvg > 20 && c.amount > 200)
      .sort((a,b) => b.vsAvg - a.vsAvg)
      .slice(0, 3)
  , [categoryPerf]);

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!txList.length) {
    return (
      <div className="animate-slide-up space-y-5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Financial Insights</h1>
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
    <div className="space-y-5 animate-slide-up">

      {/* ── Header + Month Picker ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Financial Insights</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">How you're allocating your income — month by month</p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 shadow-sm shrink-0 self-start sm:self-auto">
          <button onClick={goBack} disabled={!canGoBack}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 disabled:opacity-25 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm font-bold text-slate-900 dark:text-white min-w-[130px] text-center select-none">
            {labelLong(activeMonth)}
          </span>
          <button onClick={goFwd} disabled={!canGoFwd}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 disabled:opacity-25 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Income",
            value: fmt(income),
            sub: "Salary & other inflows",
            valueClass: "text-emerald-600 dark:text-emerald-400",
            border: "border-emerald-100 dark:border-emerald-500/20",
            Icon: ArrowUpRight,
            iconClass: "text-emerald-500",
            iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
          },
          {
            label: "Total Spent",
            value: fmt(spending),
            sub: income > 0 ? `${((spending/income)*100).toFixed(0)}% of income` : "No income recorded",
            valueClass: "text-slate-900 dark:text-white",
            border: "border-red-100 dark:border-red-500/20",
            Icon: ArrowDownRight,
            iconClass: "text-red-500",
            iconBg: "bg-red-50 dark:bg-red-500/10",
          },
          {
            label: "Saved",
            value: fmt(Math.abs(saved)),
            sub: saved >= 0 ? "Kept this month" : "Over-spent income",
            valueClass: saved >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-red-500",
            border: saved >= 0 ? "border-indigo-100 dark:border-indigo-500/20" : "border-red-100 dark:border-red-500/20",
            Icon: saved >= 0 ? TrendingUp : TrendingDown,
            iconClass: saved >= 0 ? "text-indigo-500" : "text-red-500",
            iconBg: saved >= 0 ? "bg-indigo-50 dark:bg-indigo-500/10" : "bg-red-50 dark:bg-red-500/10",
          },
          {
            label: "Savings Rate",
            value: `${savingsRate.toFixed(1)}%`,
            sub: rl.text,
            valueClass: rl.cls,
            border: "border-slate-100 dark:border-slate-800",
            Icon: savingsRate >= 15 ? TrendingUp : savingsRate >= 5 ? Minus : TrendingDown,
            iconClass: savingsRate >= 15 ? "text-emerald-500" : savingsRate >= 5 ? "text-amber-500" : "text-red-500",
            iconBg: savingsRate >= 15 ? "bg-emerald-50 dark:bg-emerald-500/10" : savingsRate >= 5 ? "bg-amber-50 dark:bg-amber-500/10" : "bg-red-50 dark:bg-red-500/10",
          },
        ].map(({ label, value, sub, valueClass, border, Icon, iconClass, iconBg }) => (
          <div key={label} className={`bg-white dark:bg-slate-900 border ${border} rounded-2xl p-4 shadow-sm`}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
                <Icon size={14} className={iconClass} />
              </div>
            </div>
            <p className={`text-xl font-black tabular-nums leading-tight ${valueClass}`}>{value}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Income Allocation Bar ── */}
      {income > 0 && categoryBreakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Income Allocation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every dirham of your {fmt(income)} — where it went
              </p>
            </div>
            {savingsRate > 0 && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 ${rl.cls}`}>
                {savingsRate.toFixed(0)}% saved
              </span>
            )}
          </div>

          {/* Stacked bar */}
          <div className="h-9 w-full flex rounded-xl overflow-hidden gap-px mb-5">
            {categoryBreakdown.map(({ cat, pctOfIncome }) => {
              const { color } = getCategoryConfig(cat);
              return pctOfIncome > 0.5 ? (
                <div key={cat} className="h-full transition-all duration-700 ease-out relative group"
                  style={{ width: `${pctOfIncome}%`, backgroundColor: color }}
                  title={`${cat}: ${pctOfIncome.toFixed(1)}%`}
                >
                  {/* Label inside bar if wide enough */}
                  {pctOfIncome > 8 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/90 select-none">
                      {pctOfIncome.toFixed(0)}%
                    </span>
                  )}
                </div>
              ) : null;
            })}
            {savingsRate > 0.5 && (
              <div className="h-full bg-emerald-500 transition-all duration-700 ease-out relative"
                style={{ flex: `0 0 ${savingsRate}%` }}
                title={`Saved: ${savingsRate.toFixed(1)}%`}
              >
                {savingsRate > 8 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/90 select-none">
                    Saved
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {categoryBreakdown.map(({ cat, pctOfIncome }) => {
              const { color } = getCategoryConfig(cat);
              return pctOfIncome > 0.5 ? (
                <div key={cat} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                  <span>{cat}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{pctOfIncome.toFixed(0)}%</span>
                </div>
              ) : null;
            })}
            {savingsRate > 0.5 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-sm shrink-0 bg-emerald-500" />
                <span>Saved</span>
                <span className={`font-bold ${rl.cls}`}>{savingsRate.toFixed(0)}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Category table + Trend chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Category Performance */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Category Performance</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This month vs last month and 3-month average</p>
          </div>

          {/* Desktop header */}
          <div className="hidden sm:grid grid-cols-[1fr_100px_70px_60px] gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50">
            {["Category", "This Month", "vs Prev", "% Inc"].map((h, i) => (
              <span key={h} className={`text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ${i > 0 ? "text-right" : ""}`}>{h}</span>
            ))}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {categoryPerf.length === 0 ? (
              <p className="p-5 text-sm text-slate-400">No spending data for this month.</p>
            ) : categoryPerf.map(({ cat, amount, pctOfIncome, vsPrev, vsAvg }) => {
              const { Icon, iconBg, iconText, color } = getCategoryConfig(cat);
              const up   = vsPrev !== null && vsPrev >  5;
              const down = vsPrev !== null && vsPrev < -5;
              const flat = vsPrev !== null && !up && !down;

              return (
                <div key={cat} className="px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  {/* Mobile */}
                  <div className="sm:hidden flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                        <Icon size={14} className={iconText} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{cat}</p>
                        <p className={`text-[11px] font-semibold ${up ? "text-red-500" : down ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                          {vsPrev !== null ? `${up?"+":""}${vsPrev.toFixed(0)}% vs last month` : "No prior data"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{fmtDec(amount)}</p>
                      <p className="text-[11px] text-slate-400">{pctOfIncome.toFixed(1)}% of income</p>
                    </div>
                  </div>

                  {/* Desktop */}
                  <div className="hidden sm:grid grid-cols-[1fr_100px_70px_60px] gap-2 items-center">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                        <Icon size={14} className={iconText} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{cat}</p>
                        {/* mini % of income bar */}
                        <div className="h-1 max-w-[100px] bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${Math.min(100,pctOfIncome)}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white text-right tabular-nums">{fmtDec(amount)}</p>
                    <p className={`text-xs font-bold text-right tabular-nums ${up ? "text-red-500" : down ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}>
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

        {/* 6-month Trend */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Income vs Spending</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Last 6 months — gap = savings</p>
          </div>

          <div className="flex-1" style={{ minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
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
                <YAxis
                  yAxisId="amt"
                  stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} width={45}
                  tickFormatter={v => currency === "AED" ? `${(v/1000).toFixed(0)}k` : `$${(v/1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="rate"
                  orientation="right"
                  stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} width={32}
                  tickFormatter={v => `${v}%`}
                  domain={[0, 100]}
                />
                <Tooltip content={<SlimTooltip currency={currency} />} />
                <Bar yAxisId="amt" dataKey="income"   name="Income"  fill="url(#incGrad)" radius={[4,4,0,0]} maxBarSize={22} />
                <Bar yAxisId="amt" dataKey="spending" name="Spent"   fill="url(#spdGrad)" radius={[4,4,0,0]} maxBarSize={22} />
                <Line
                  yAxisId="rate" type="monotone" dataKey="rate" name="Savings %"
                  stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {[
              { color: "#10B981", label: "Income" },
              { color: "#EF4444", label: "Spent"  },
              { color: "#6366f1", label: "Savings rate", dash: true },
            ].map(({ color, label, dash }) => (
              <div key={label} className="flex items-center gap-1.5">
                {dash ? (
                  <svg width={16} height={8}><line x1={0} y1={4} x2={16} y2={4} stroke={color} strokeWidth={2} strokeDasharray="4 2" /></svg>
                ) : (
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                )}
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Overspending Alerts ── */}
      {alerts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Spending Alerts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Categories running significantly above their 3-month average — consider cutting back
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {alerts.map(({ cat, amount, avg3, vsAvg }) => {
              const { Icon, iconBg, iconText } = getCategoryConfig(cat);
              return (
                <div key={cat} className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/[0.06] border border-amber-100 dark:border-amber-500/20">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon size={16} className={iconText} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{cat}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">avg {fmtDec(avg3)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-red-500">{fmtDec(amount)}</p>
                    <p className="text-[11px] font-bold text-red-400">+{vsAvg.toFixed(0)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── AI Nudge ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 dark:from-[#060812] dark:via-indigo-950/60 dark:to-[#060812] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(99,102,241,0.15),transparent_55%)] pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl shrink-0">
            <Sparkles size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Want a deeper analysis?</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Ask the AI Advisor — "Where am I overspending?" or "How can I improve my savings rate?"
            </p>
          </div>
        </div>
        <p className="relative text-xs text-slate-500 shrink-0">Chat widget → bottom right</p>
      </div>

    </div>
  );
}
