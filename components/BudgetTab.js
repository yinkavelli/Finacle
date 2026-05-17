"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Plus, X, Trash2, Home, ShoppingCart, Tv, Car, Zap,
  Utensils, Package, Monitor, TrendingUp, ShoppingBag,
  AlertTriangle, CheckCircle, Info, PiggyBank, Pencil,
} from "lucide-react";

const BUDGET_CATEGORIES = [
  { name: "Food & Dining",  Icon: Utensils,    color: "#F59E0B", iconBg: "bg-amber-50 dark:bg-amber-500/10",   iconText: "text-amber-600 dark:text-amber-400"   },
  { name: "Housing",        Icon: Home,        color: "#6366F1", iconBg: "bg-indigo-50 dark:bg-indigo-500/10", iconText: "text-indigo-600 dark:text-indigo-400" },
  { name: "Transportation", Icon: Car,         color: "#3B82F6", iconBg: "bg-blue-50 dark:bg-blue-500/10",     iconText: "text-blue-600 dark:text-blue-400"     },
  { name: "Shopping",       Icon: ShoppingBag, color: "#0EA5E9", iconBg: "bg-sky-50 dark:bg-sky-500/10",       iconText: "text-sky-600 dark:text-sky-400"       },
  { name: "Entertainment",  Icon: Tv,          color: "#8B5CF6", iconBg: "bg-purple-50 dark:bg-purple-500/10", iconText: "text-purple-600 dark:text-purple-400" },
  { name: "Utilities",      Icon: Zap,         color: "#EAB308", iconBg: "bg-yellow-50 dark:bg-yellow-500/10", iconText: "text-yellow-600 dark:text-yellow-400" },
  { name: "Subscription",   Icon: Monitor,     color: "#F43F5E", iconBg: "bg-rose-50 dark:bg-rose-500/10",     iconText: "text-rose-600 dark:text-rose-400"     },
  { name: "General",        Icon: Package,     color: "#94A3B8", iconBg: "bg-slate-100 dark:bg-slate-500/10",  iconText: "text-slate-500 dark:text-slate-400"   },
];

const getCatMeta = (name) =>
  BUDGET_CATEGORIES.find((c) => c.name === name) || BUDGET_CATEGORIES[7];

const DEFAULT_BUDGETS = [
  { id: "default-1", name: "Food & Dining",  category: "Food & Dining",  limit: 2000 },
  { id: "default-2", name: "Housing",        category: "Housing",        limit: 8000 },
  { id: "default-3", name: "Transportation", category: "Transportation", limit: 1500 },
  { id: "default-4", name: "Entertainment",  category: "Entertainment",  limit: 500  },
];

const EMPTY_FORM = { name: "", category: "Food & Dining", limit: "" };

export function BudgetTab({ txList, currency, userId }) {
  const [budgets, setBudgets]       = useState([]);
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [hydrated, setHydrated]     = useState(false);

  const storageKey = userId ? `finacle_budgets_${userId}` : null;

  // Hydrate from localStorage once
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      setBudgets(raw ? JSON.parse(raw) : DEFAULT_BUDGETS);
    } catch {
      setBudgets(DEFAULT_BUDGETS);
    }
    setHydrated(true);
  }, [storageKey]);

  const persist = (next) => {
    setBudgets(next);
    if (storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
    }
  };

  // Latest month with data (so demo dataset shows real spending)
  const activeMonth = useMemo(() => {
    if (!txList.length) return new Date().toISOString().slice(0, 7);
    return txList.reduce(
      (max, tx) => (tx.date.slice(0, 7) > max ? tx.date.slice(0, 7) : max),
      "2000-01",
    );
  }, [txList]);

  const activeMonthLabel = (() => {
    const [y, m] = activeMonth.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
  })();

  // Spending per category for the active month
  const monthlySpending = useMemo(() => {
    const map = {};
    txList
      .filter((tx) => Number(tx.amount) < 0 && tx.date.startsWith(activeMonth))
      .forEach((tx) => {
        map[tx.category] = (map[tx.category] || 0) + Math.abs(Number(tx.amount));
      });
    return map;
  }, [txList, activeMonth]);

  const fmt = (n) => {
    const s = Math.abs(n).toLocaleString("en-US", {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
    return currency === "AED" ? `AED ${s}` : `$${s}`;
  };

  // Summary figures
  const totalLimit     = budgets.reduce((s, b) => s + Number(b.limit), 0);
  const totalSpent     = budgets.reduce((s, b) => s + (monthlySpending[b.category] || 0), 0);
  const totalRemaining = Math.max(0, totalLimit - totalSpent);
  const overallPct     = totalLimit > 0 ? Math.min(100, (totalSpent / totalLimit) * 100) : 0;

  const mostSpentBudget = budgets.length
    ? budgets.reduce(
        (max, b) =>
          (monthlySpending[b.category] || 0) > (monthlySpending[max.category] || 0) ? b : max,
        budgets[0],
      )
    : null;

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditTarget(b);
    setForm({ name: b.name, category: b.category, limit: String(b.limit) });
    setShowModal(true);
  };

  const handleSave = () => {
    const limitNum = parseFloat(form.limit);
    if (!form.name.trim() || isNaN(limitNum) || limitNum <= 0) return;
    if (editTarget) {
      persist(budgets.map((b) => (b.id === editTarget.id ? { ...b, ...form, limit: limitNum } : b)));
    } else {
      persist([...budgets, { id: `budget-${Date.now()}`, ...form, limit: limitNum }]);
    }
    setShowModal(false);
  };

  const deleteBudget = (id) => persist(budgets.filter((b) => b.id !== id));

  if (!hydrated && storageKey) return null; // prevent SSR mismatch

  return (
    <div className="space-y-6 animate-slide-up">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track your monthly allocations — {activeMonthLabel}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm shrink-0"
        >
          <Plus size={16} />
          Create Budget
        </button>
      </div>

      {/* ── Hero + Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Hero */}
        <div className="md:col-span-8 relative overflow-hidden rounded-2xl bg-slate-900 dark:bg-indigo-950/60 dark:border dark:border-indigo-500/20 p-7 flex flex-col justify-between min-h-[190px]">
          <div className="absolute -right-12 -bottom-12 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-16 top-10 w-28 h-28 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Remaining Monthly Budget
            </p>
            <p className="text-4xl md:text-5xl font-black text-white tracking-tight">
              {fmt(totalRemaining)}
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap gap-3 mt-6">
            {[
              { label: "Total Spent", value: fmt(totalSpent) },
              { label: "Total Limit", value: fmt(totalLimit) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl">
                <p className="text-[11px] text-slate-400">{label}</p>
                <p className="text-sm font-bold text-white mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="md:col-span-4 grid grid-rows-2 gap-5">
          <div className="bg-[#E8ECF5] dark:bg-[#0F1535] border border-slate-100 dark:border-white/[0.07] rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Most Spent Category</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {mostSpentBudget?.name || "—"}
              </p>
            </div>
            {mostSpentBudget && (() => {
              const { Icon, iconBg, iconText } = getCatMeta(mostSpentBudget.category);
              return (
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${iconBg}`}>
                  <Icon size={20} className={iconText} />
                </div>
              );
            })()}
          </div>

          <div className="bg-[#E8ECF5] dark:bg-[#0F1535] border border-slate-100 dark:border-white/[0.07] rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Monthly Progress</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {overallPct.toFixed(0)}% Spent
              </p>
            </div>
            <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
              overallPct >= 90 ? "bg-red-50 dark:bg-red-500/10"
              : overallPct >= 65 ? "bg-amber-50 dark:bg-amber-500/10"
              : "bg-emerald-50 dark:bg-emerald-500/10"
            }`}>
              <TrendingUp size={20} className={
                overallPct >= 90 ? "text-red-500"
                : overallPct >= 65 ? "text-amber-500"
                : "text-emerald-500"
              } />
            </div>
          </div>
        </div>
      </div>

      {/* ── Budget cards ── */}
      {budgets.length > 0 ? (
        <>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Budgets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {budgets.map((budget) => {
              const { Icon, iconBg, iconText, color } = getCatMeta(budget.category);
              const spent  = monthlySpending[budget.category] || 0;
              const pct    = budget.limit > 0 ? Math.min(100, (spent / budget.limit) * 100) : 0;
              const over   = spent > budget.limit;
              const near   = !over && pct >= 75;
              const barClr = over ? "#EF4444" : near ? "#F59E0B" : "#10B981";

              return (
                <div
                  key={budget.id}
                  className="bg-[#E8ECF5] dark:bg-[#0F1535] border border-slate-100 dark:border-white/[0.07] rounded-2xl p-5 shadow-sm flex flex-col gap-5"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                        <Icon size={18} className={iconText} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{budget.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{budget.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => openEdit(budget)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => deleteBudget(budget.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500 dark:text-slate-400">
                        Spent:{" "}
                        <span className={`font-bold ${over ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
                          {fmt(spent)}
                        </span>
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Limit:{" "}
                        <span className="font-bold text-slate-900 dark:text-white">{fmt(budget.limit)}</span>
                      </span>
                    </div>

                    <div className="h-2 w-full bg-slate-100 dark:bg-[#161E30] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${pct}%`, backgroundColor: barClr }}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 min-h-[18px]">
                      {over ? (
                        <>
                          <AlertTriangle size={12} className="text-red-500 shrink-0" />
                          <p className="text-xs font-bold text-red-500">{fmt(spent - budget.limit)} over limit</p>
                        </>
                      ) : pct >= 100 ? (
                        <>
                          <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Budget fully used</p>
                        </>
                      ) : near ? (
                        <>
                          <Info size={12} className="text-amber-500 shrink-0" />
                          <p className="text-xs text-amber-600 dark:text-amber-400">{pct.toFixed(0)}% of budget reached</p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {fmt(budget.limit - spent)} remaining
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add card */}
            <button
              onClick={openCreate}
              className="bg-[#DDE2ED]/60 dark:bg-white/[0.03] border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all min-h-[160px] group"
            >
              <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <span className="text-sm font-semibold">Add Category</span>
            </button>
          </div>
        </>
      ) : (
        <div className="bg-[#E8ECF5] dark:bg-[#0F1535] border border-slate-100 dark:border-white/[0.07] rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <PiggyBank size={28} className="text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Budgets Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Set monthly spending limits to track your habits.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
          >
            <Plus size={16} />
            Create First Budget
          </button>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#E8ECF5] dark:bg-[#0F1535] w-full max-w-sm rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/[0.07] p-6 animate-zoom-in overflow-y-auto scroll-thin max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editTarget ? "Edit Budget" : "Create Budget"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category: e.target.value,
                      name: f.name || e.target.value,
                    }))
                  }
                  className="w-full bg-[#DDE2ED] dark:bg-[#161E30] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 transition-all"
                >
                  {BUDGET_CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Budget Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={form.category}
                  className="w-full bg-[#DDE2ED] dark:bg-[#161E30] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Monthly Limit ({currency})
                </label>
                <input
                  type="number"
                  value={form.limit}
                  onChange={(e) => setForm((f) => ({ ...f, limit: e.target.value }))}
                  placeholder="0.00"
                  min="1"
                  step="any"
                  className="w-full bg-[#DDE2ED] dark:bg-[#161E30] border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || !form.limit || Number(form.limit) <= 0}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all"
              >
                {editTarget ? "Save Changes" : "Create Budget"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
