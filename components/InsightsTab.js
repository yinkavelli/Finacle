"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, AlertTriangle, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar, Cell,
  XAxis, Tooltip,
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
  return { income, spending, saved: income - spending };
};

// ── Revolut-style dark card ───────────────────────────────────────────────────
const RCard = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`rounded-2xl p-5 ${onClick ? "cursor-pointer active:opacity-80" : ""} ${className}`}
    style={{ background: "#131850", border: "1px solid rgba(255,255,255,0.05)" }}
  >
    {children}
  </div>
);

// ── Tooltip ───────────────────────────────────────────────────────────────────
const DarkTip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  const fmt = v => {
    const s = Math.abs(v).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0});
    return currency === "AED" ? `Đ ${s}` : `$${s}`;
  };
  return (
    <div className="rounded-xl px-2.5 py-1.5 text-xs shadow-xl"
      style={{ background: "#1C234A", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="text-white/40 mb-0.5">{label}</p>
      {payload.map(p => <p key={p.dataKey} className="font-bold text-white">{fmt(p.value)}</p>)}
    </div>
  );
};

// ── main ──────────────────────────────────────────────────────────────────────

export function InsightsTab({ txList, currency, onCategoryClick, userId }) {
  const fmt = (n, dec = 0) => {
    const s = Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:dec,maximumFractionDigits:dec});
    return currency === "AED" ? `Đ ${s}` : `$${s}`;
  };

  // ── month navigation ──────────────────────────────────────────────────────
  const availableMonths = useMemo(() =>
    [...new Set(txList.map(tx => tx.date.slice(0,7)))].sort()
  , [txList]);

  const latestMonth = availableMonths[availableMonths.length-1] || new Date().toISOString().slice(0,7);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const activeMonth = selectedMonth || latestMonth;
  const monthIdx   = availableMonths.indexOf(activeMonth);
  const canGoBack  = monthIdx > 0;
  const canGoFwd   = monthIdx < availableMonths.length - 1;

  // ── budgets ───────────────────────────────────────────────────────────────
  const [budgets, setBudgets] = useState([]);
  useEffect(() => {
    if (!userId) return;
    try { const r = localStorage.getItem(`finacle_budgets_${userId}`); if (r) setBudgets(JSON.parse(r)); } catch {}
  }, [userId]);

  // ── core monthly figures ──────────────────────────────────────────────────
  const { income, spending, saved } = useMemo(() => monthStats(txList, activeMonth), [txList, activeMonth]);
  const savingsRate = income > 0 ? (saved / income) * 100 : 0;

  // ── daily cumulative spending (for the main Spent line chart) ─────────────
  const dailyData = useMemo(() => {
    const [y, m] = activeMonth.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const byDay = {};
    txList.filter(tx => tx.date.startsWith(activeMonth) && Number(tx.amount) < 0).forEach(tx => {
      const day = parseInt(tx.date.split("-")[2]);
      byDay[day] = (byDay[day] || 0) + Math.abs(Number(tx.amount));
    });
    let cum = 0;
    return Array.from({ length: daysInMonth }, (_, i) => {
      cum += byDay[i+1] || 0;
      return { day: `${i+1}`, spent: Math.round(cum) };
    });
  }, [txList, activeMonth]);

  // ── 6-month income bars ───────────────────────────────────────────────────
  const incomeTrend = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const mk = offsetMonth(activeMonth, i - 5);
      return { month: labelShort(mk), income: Math.round(monthStats(txList, mk).income), isActive: i === 5 };
    })
  , [txList, activeMonth]);

  // ── 6-month savings bars ──────────────────────────────────────────────────
  const savingsTrend = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const mk = offsetMonth(activeMonth, i - 5);
      return { month: labelShort(mk), saved: Math.round(monthStats(txList, mk).saved), isActive: i === 5 };
    })
  , [txList, activeMonth]);

  // ── category breakdown ────────────────────────────────────────────────────
  const categoryBreakdown = useMemo(() => {
    const totals = {};
    txList.filter(tx => tx.date.startsWith(activeMonth) && Number(tx.amount) < 0).forEach(tx => {
      const p = getParentCategory(tx.category);
      totals[p] = (totals[p] || 0) + Math.abs(Number(tx.amount));
    });
    return Object.entries(totals).sort(([,a],[,b]) => b-a)
      .map(([cat, amount]) => ({ cat, amount, pct: spending > 0 ? (amount/spending)*100 : 0 }));
  }, [txList, activeMonth, spending]);

  // ── vs last month ─────────────────────────────────────────────────────────
  const vsLastMonth = useMemo(() => {
    const prev = offsetMonth(activeMonth, -1);
    const prevTotals = {};
    txList.filter(tx => tx.date.startsWith(prev) && Number(tx.amount) < 0).forEach(tx => {
      const p = getParentCategory(tx.category);
      prevTotals[p] = (prevTotals[p] || 0) + Math.abs(Number(tx.amount));
    });
    return categoryBreakdown.map(({ cat, amount, pct }) => {
      const prevAmt = prevTotals[cat] || 0;
      const change  = prevAmt > 0 ? ((amount - prevAmt) / prevAmt) * 100 : null;
      return { cat, amount, pct, prevAmt, change };
    });
  }, [txList, activeMonth, categoryBreakdown]);

  const alerts = vsLastMonth.filter(c => c.change !== null && c.change > 20 && c.amount > 200).slice(0, 3);

  const openModal = (cat) => {
    if (!onCategoryClick) return;
    const txs = txList.filter(tx => tx.category === cat && tx.date.startsWith(activeMonth));
    onCategoryClick({ type: "category", title: `${cat} — ${labelLong(activeMonth)}`, transactions: txs });
  };

  // ── empty state ───────────────────────────────────────────────────────────
  if (!txList.length) return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">Monthly analysis</p>
      </div>
      <RCard className="p-14 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
          <TrendingUp size={28} className="text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">No Data Yet</h3>
          <p className="text-sm text-white/40 mt-1">Upload a CSV statement to see your analytics.</p>
        </div>
      </RCard>
    </div>
  );

  return (
    <div className="space-y-4 animate-slide-up">

      {/* ── Selector row ── */}
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-1 text-white text-[15px] font-semibold">
          All accounts
          <ChevronDown size={15} className="text-white/50 mt-0.5" />
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => canGoBack && setSelectedMonth(availableMonths[monthIdx-1])}
            disabled={!canGoBack}
            className="p-1 text-white/30 disabled:opacity-20 hover:text-blue-400 transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button className="text-blue-400 text-[13px] font-semibold min-w-[80px] text-center">
            {labelLong(activeMonth)}
          </button>
          <button onClick={() => canGoFwd && setSelectedMonth(availableMonths[monthIdx+1])}
            disabled={!canGoFwd}
            className="p-1 text-white/30 disabled:opacity-20 hover:text-blue-400 transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Main Spent card ── */}
      <RCard>
        <p className="text-white/50 text-[13px] font-medium mb-1">Spent</p>
        {spending > 0 ? (
          <>
            <p className="text-white text-[28px] font-black tracking-tight tabular-nums leading-none mb-5">
              {fmt(spending)}
            </p>
            {/* Line chart */}
            <div style={{ height: 72 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                  </defs>
                  <Tooltip content={<DarkTip currency={currency} />} />
                  <Area type="monotone" dataKey="spent" stroke="rgba(255,255,255,0.5)"
                    strokeWidth={1.5} fill="url(#sg)" dot={false}
                    activeDot={{ r: 3, fill: "#fff", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Day markers */}
            <div className="flex justify-between text-white/25 text-[10px] mt-1.5 px-0.5">
              {["1","6","11","16","21","26","31"].map(d => <span key={d}>{d}</span>)}
            </div>
          </>
        ) : (
          <>
            <p className="text-white/40 text-[15px] font-medium mb-5">No spending this month</p>
            <div style={{ height: 72 }} className="flex items-end">
              <div className="w-full h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            </div>
            <div className="flex justify-between text-white/20 text-[10px] mt-1.5 px-0.5">
              {["1","6","11","16","21","26","31"].map(d => <span key={d}>{d}</span>)}
            </div>
          </>
        )}
      </RCard>

      {/* ── Income + Net cash flow ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Income */}
        <RCard className="!p-4">
          <p className="text-white/50 text-[12px] font-medium mb-0.5">Income</p>
          <p className="text-white text-[20px] font-black tracking-tight tabular-nums leading-tight mb-3">
            {fmt(income)}
          </p>
          <div style={{ height: 52 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={7}>
                <Tooltip content={<DarkTip currency={currency} />} />
                <Bar dataKey="income" radius={[2,2,0,0]}>
                  {incomeTrend.map((e, i) => (
                    <Cell key={i} fill={e.isActive ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.15)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </RCard>

        {/* Net cash flow */}
        <RCard className="!p-4">
          <p className="text-white/50 text-[12px] font-medium mb-0.5">Net cash flow</p>
          <p className={`text-[20px] font-black tracking-tight tabular-nums leading-tight mb-3 ${
            saved >= 0 ? "text-emerald-400" : "text-red-400"
          }`}>
            {saved >= 0 ? "" : "−"}{fmt(Math.abs(saved))}
          </p>
          <div style={{ height: 52 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={7}>
                <Tooltip content={<DarkTip currency={currency} />} />
                <Bar dataKey="saved" radius={[2,2,0,0]}>
                  {savingsTrend.map((e, i) => (
                    <Cell key={i} fill={
                      e.isActive
                        ? (e.saved >= 0 ? "rgba(52,211,153,0.85)" : "rgba(248,113,113,0.85)")
                        : "rgba(255,255,255,0.15)"
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </RCard>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-1.5 py-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`rounded-full transition-all ${i === 0 ? "w-4 h-1.5 bg-white/60" : "w-1.5 h-1.5 bg-white/20"}`} />
        ))}
      </div>

      {/* ── Overview section ── */}
      <p className="text-white text-[20px] font-bold mt-1">Overview</p>

      {/* Spending by category */}
      {categoryBreakdown.length > 0 && (
        <RCard>
          <p className="text-white/50 text-[12px] font-medium mb-4">Spending by category</p>
          <div className="space-y-4">
            {categoryBreakdown.map(({ cat, amount, pct }) => {
              const { Icon, color, iconBg, iconText } = getCategoryConfig(cat);
              return (
                <button key={cat} onClick={() => openModal(cat)}
                  className="w-full flex items-center gap-3 text-left hover:opacity-80 transition-opacity">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon size={14} className={iconText} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-white text-[13px] font-medium truncate">{cat}</span>
                      <span className="text-white/40 text-[11px] tabular-nums ml-2 shrink-0">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                  <span className="text-white/50 text-[12px] tabular-nums shrink-0 ml-1">{fmt(amount)}</span>
                </button>
              );
            })}
          </div>
        </RCard>
      )}

      {/* Savings rate card */}
      <RCard>
        <p className="text-white/50 text-[12px] font-medium mb-1">Savings rate</p>
        <p className={`text-[28px] font-black tracking-tight tabular-nums leading-none mb-4 ${
          savingsRate >= 15 ? "text-emerald-400" : savingsRate >= 5 ? "text-amber-400" : "text-red-400"
        }`}>
          {savingsRate.toFixed(1)}%
        </p>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.max(0, Math.min(100, savingsRate))}%`,
              background: savingsRate >= 15 ? "#34d399" : savingsRate >= 5 ? "#fbbf24" : "#f87171"
            }}
          />
        </div>
        <p className="text-white/30 text-[11px] mt-2">
          {savingsRate >= 25 ? "Excellent — keep it up" : savingsRate >= 15 ? "Healthy savings rate" : savingsRate >= 5 ? "Could be improved" : "Try to reduce spending"}
        </p>
      </RCard>

      {/* vs last month */}
      {vsLastMonth.length > 0 && (
        <RCard>
          <p className="text-white/50 text-[12px] font-medium mb-4">vs last month</p>
          <div className="space-y-3">
            {vsLastMonth.map(({ cat, amount, change }) => {
              const { Icon, iconBg, iconText } = getCategoryConfig(cat);
              const up   = change !== null && change >  5;
              const down = change !== null && change < -5;
              return (
                <button key={cat} onClick={() => openModal(cat)}
                  className="w-full flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon size={14} className={iconText} />
                  </div>
                  <span className="flex-1 text-white text-[13px] font-medium text-left truncate">{cat}</span>
                  {change !== null && (
                    <span className={`text-[11px] font-bold shrink-0 ${up ? "text-red-400" : down ? "text-emerald-400" : "text-white/30"}`}>
                      {up ? "↑" : down ? "↓" : "→"}{Math.abs(change).toFixed(0)}%
                    </span>
                  )}
                  <span className="text-white/50 text-[12px] tabular-nums shrink-0 ml-1">{fmt(amount)}</span>
                </button>
              );
            })}
          </div>
        </RCard>
      )}

      {/* Spending alerts */}
      {alerts.length > 0 && (
        <RCard className="border-amber-500/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={13} className="text-amber-400" />
            <p className="text-amber-400 text-[12px] font-bold uppercase tracking-wider">Alerts</p>
          </div>
          <div className="space-y-3">
            {alerts.map(({ cat, amount, change }) => {
              const { Icon, iconBg, iconText } = getCategoryConfig(cat);
              return (
                <button key={cat} onClick={() => openModal(cat)}
                  className="w-full flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon size={14} className={iconText} />
                  </div>
                  <span className="flex-1 text-white text-[13px] font-medium text-left">{cat}</span>
                  <span className="text-red-400 text-[11px] font-bold">+{change.toFixed(0)}%</span>
                  <span className="text-white/50 text-[12px] tabular-nums">{fmt(amount)}</span>
                </button>
              );
            })}
          </div>
        </RCard>
      )}

      {/* Bottom spacer */}
      <div className="h-2" />
    </div>
  );
}
