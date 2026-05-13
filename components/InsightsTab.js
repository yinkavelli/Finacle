"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar, Cell,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
} from "recharts";
import { getCategoryConfig, CATEGORY_CONFIG } from "@/utils/categoryConfig";

const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  const fmt = (v) => {
    const s = Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return currency === "AED" ? `AED ${s}` : `$${s}`;
  };
  return (
    <div className="bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2.5 shadow-xl">
      <p className="text-[11px] text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-sm font-bold text-white">{fmt(p.value)}</p>
      ))}
    </div>
  );
};

export function InsightsTab({ txList, currency }) {
  const fmt = (n) => {
    const s = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return currency === "AED" ? `AED ${s}` : `$${s}`;
  };

  // ── Cumulative balance by month ──
  const balanceChartData = useMemo(() => {
    if (!txList.length) return [];
    const byMonth = {};
    [...txList]
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((tx) => {
        const month = tx.date.slice(0, 7);
        byMonth[month] = (byMonth[month] || 0) + Number(tx.amount);
      });
    let cum = 0;
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, net]) => {
        cum += net;
        const [y, m] = month.split("-").map(Number);
        return {
          month: new Date(y, m - 1, 1).toLocaleString("en-US", { month: "short", year: "2-digit" }),
          balance: Math.round(cum * 100) / 100,
        };
      });
  }, [txList]);

  const latestBalance = balanceChartData[balanceChartData.length - 1]?.balance || 0;
  const balanceChange =
    balanceChartData.length >= 2
      ? ((latestBalance - (balanceChartData[0]?.balance || 0)) /
          Math.abs(balanceChartData[0]?.balance || 1)) * 100
      : 0;

  // ── Active / previous month ──
  const { currentMonth, prevMonth } = useMemo(() => {
    if (!txList.length) {
      const now = new Date();
      const cm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const pv = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return {
        currentMonth: cm,
        prevMonth: `${pv.getFullYear()}-${String(pv.getMonth() + 1).padStart(2, "0")}`,
      };
    }
    const months = [...new Set(txList.map((tx) => tx.date.slice(0, 7)))].sort();
    return {
      currentMonth: months[months.length - 1],
      prevMonth: months[months.length - 2] || "",
    };
  }, [txList]);

  const currentMonthLabel = (() => {
    const [y, m] = currentMonth.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
  })();

  // ── Income vs expenses (current month) ──
  const { cmIncome, cmExpenses } = useMemo(() => {
    const inc = txList
      .filter((tx) => tx.date.startsWith(currentMonth) && Number(tx.amount) > 0)
      .reduce((s, t) => s + Number(t.amount), 0);
    const exp = Math.abs(
      txList
        .filter((tx) => tx.date.startsWith(currentMonth) && Number(tx.amount) < 0)
        .reduce((s, t) => s + Number(t.amount), 0),
    );
    return { cmIncome: inc, cmExpenses: exp };
  }, [txList, currentMonth]);

  const cmNet = cmIncome - cmExpenses;
  const maxBar = cmIncome + cmExpenses || 1;

  // ── Top 4 categories with MoM change ──
  const topCategories = useMemo(() => {
    const curr = {}, prev = {};
    txList
      .filter((tx) => Number(tx.amount) < 0)
      .forEach((tx) => {
        const month = tx.date.slice(0, 7);
        const cat = tx.category;
        const amt = Math.abs(Number(tx.amount));
        if (month === currentMonth) curr[cat] = (curr[cat] || 0) + amt;
        if (month === prevMonth)    prev[cat] = (prev[cat] || 0) + amt;
      });
    return Object.entries(curr)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([cat, spent]) => {
        const prevSpent = prev[cat] || 0;
        const change = prevSpent > 0 ? ((spent - prevSpent) / prevSpent) * 100 : null;
        return { cat, spent, change };
      });
  }, [txList, currentMonth, prevMonth]);

  // ── All-time category spending (bar chart) ──
  const categoryBarData = useMemo(() => {
    const data = {};
    txList.filter((tx) => Number(tx.amount) < 0).forEach((tx) => {
      data[tx.category] = (data[tx.category] || 0) + Math.abs(Number(tx.amount));
    });
    return Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [txList]);

  const hasData = txList.length > 0;

  // ── Empty state ──
  if (!hasData) {
    return (
      <div className="animate-slide-up space-y-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Insights
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analysis of your net worth and spending patterns
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-14 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <TrendingUp size={28} className="text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Data Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Upload a CSV statement to generate your financial insights.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-up">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Financial Insights
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Analysis of your net worth and spending patterns
        </p>
      </div>

      {/* ── Bento row 1: balance chart + income vs expenses ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Balance progression */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Balance Progression</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cumulative net cashflow over time
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-black text-slate-900 dark:text-white">{fmt(latestBalance)}</p>
              <p className={`text-xs font-semibold flex items-center justify-end gap-1 mt-0.5 ${balanceChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                {balanceChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {balanceChange >= 0 ? "+" : ""}{balanceChange.toFixed(1)}% overall
              </p>
            </div>
          </div>

          <div className="h-52 md:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    currency === "AED"
                      ? `AED ${(v / 1000).toFixed(0)}k`
                      : `$${(v / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#balGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income vs expenses */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Income vs Expenses</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-6">{currentMonthLabel}</p>

          <div className="flex-1 flex flex-col justify-center space-y-5">
            {[
              { label: "Income",   value: cmIncome,   color: "#10B981", width: (cmIncome / maxBar) * 100   },
              { label: "Expenses", value: cmExpenses, color: "#EF4444", width: (cmExpenses / maxBar) * 100 },
            ].map(({ label, value, color, width }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{fmt(value)}</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${width}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Net Savings
              </span>
              <span className={`text-sm font-black tabular-nums ${cmNet >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                {cmNet >= 0 ? "+" : ""}{fmt(cmNet)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Top spending categories ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Spending Categories</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {currentMonthLabel} vs previous period
          </p>
        </div>

        {topCategories.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 py-4">
            No expense data for {currentMonthLabel}.
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {topCategories.map(({ cat, spent, change }) => {
              const { Icon, color } = getCategoryConfig(cat);
              const isUp   = change !== null && change > 0;
              const isDown = change !== null && change < 0;
              return (
                <div
                  key={cat}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${color}18` }}
                    >
                      <Icon size={18} style={{ color }} />
                    </div>
                    {change !== null && (
                      <span className={`text-[11px] font-bold flex items-center gap-0.5 ${isUp ? "text-red-500" : isDown ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                        {isUp   ? <TrendingUp   size={11} /> : null}
                        {isDown ? <TrendingDown size={11} /> : null}
                        {isUp ? "+" : ""}{change.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">{cat}</p>
                  <p className="text-base font-black text-slate-900 dark:text-white tabular-nums">
                    {fmt(spent)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* All-time category breakdown bar chart */}
        {categoryBarData.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              All-Time by Category
            </p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBarData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(n) => (n.length > 9 ? n.slice(0, 8) + "…" : n)}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {categoryBarData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={getCategoryConfig(entry.name).color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* ── AI Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 dark:from-[#060812] dark:via-indigo-950/60 dark:to-[#060812] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl shrink-0">
            <Sparkles size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">AI Financial Advisor</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Get personalised insights on your spending patterns, savings opportunities, and financial health — powered by GPT-4o.
            </p>
          </div>
        </div>
        <p className="relative text-xs text-slate-500 shrink-0">Open the chat widget →</p>
      </div>
    </div>
  );
}
