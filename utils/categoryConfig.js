import {
  Utensils, Car, Home, ShoppingBag, TrendingUp,
  ArrowRightLeft, Tv, Zap, Monitor, Package,
  // Sub-category icons
  Wrench, Fuel, Building2, ShoppingCart,
} from "lucide-react";

// ── Sub-category → Parent mapping ────────────────────────────────────────────

export const SUBCATEGORY_PARENT = {
  // Transportation sub-categories
  "Taxi":        "Transportation",
  "Fuel":        "Transportation",
  "Auto Repair": "Transportation",
  // Housing sub-categories
  "Rent":        "Housing",
  // Shopping sub-categories
  "Groceries":   "Shopping",
  // All top-level categories map to themselves (backward-compatible)
  "Food & Dining":  "Food & Dining",
  "Transportation": "Transportation",
  "Housing":        "Housing",
  "Shopping":       "Shopping",
  "Income":         "Income",
  "Transfer":       "Transfer",
  "Entertainment":  "Entertainment",
  "Utilities":      "Utilities",
  "Subscription":   "Subscription",
  "General":        "General",
};

/** Returns the parent/display category for any category or sub-category. */
export const getParentCategory = (cat) => SUBCATEGORY_PARENT[cat] || cat;

/** Sub-categories grouped under each parent. */
export const PARENT_SUBCATEGORIES = {
  "Transportation": ["Taxi", "Fuel", "Auto Repair"],
  "Housing":        ["Rent"],
  "Shopping":       ["Groceries"],
};

// ── Category visual config ────────────────────────────────────────────────────

export const CATEGORY_CONFIG = {
  // ── Top-level ──────────────────────────────────────────────────────────────
  "Food & Dining": {
    Icon: Utensils,
    color: "#F59E0B",
    pill: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconText: "text-amber-600 dark:text-amber-400",
    bar: "#F59E0B",
  },
  "Transportation": {
    Icon: Car,
    color: "#3B82F6",
    pill: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconText: "text-blue-600 dark:text-blue-400",
    bar: "#3B82F6",
  },
  "Housing": {
    Icon: Home,
    color: "#6366F1",
    pill: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
    iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
    iconText: "text-indigo-600 dark:text-indigo-400",
    bar: "#6366F1",
  },
  "Shopping": {
    Icon: ShoppingBag,
    color: "#0EA5E9",
    pill: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
    iconBg: "bg-sky-50 dark:bg-sky-500/10",
    iconText: "text-sky-600 dark:text-sky-400",
    bar: "#0EA5E9",
  },
  "Income": {
    Icon: TrendingUp,
    color: "#10B981",
    pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconText: "text-emerald-600 dark:text-emerald-400",
    bar: "#10B981",
  },
  "Transfer": {
    Icon: ArrowRightLeft,
    color: "#94A3B8",
    pill: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300",
    iconBg: "bg-slate-100 dark:bg-slate-500/10",
    iconText: "text-slate-500 dark:text-slate-400",
    bar: "#94A3B8",
  },
  "Entertainment": {
    Icon: Tv,
    color: "#8B5CF6",
    pill: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
    iconBg: "bg-purple-50 dark:bg-purple-500/10",
    iconText: "text-purple-600 dark:text-purple-400",
    bar: "#8B5CF6",
  },
  "Utilities": {
    Icon: Zap,
    color: "#EAB308",
    pill: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
    iconBg: "bg-yellow-50 dark:bg-yellow-500/10",
    iconText: "text-yellow-600 dark:text-yellow-400",
    bar: "#EAB308",
  },
  "Subscription": {
    Icon: Monitor,
    color: "#F43F5E",
    pill: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    iconBg: "bg-rose-50 dark:bg-rose-500/10",
    iconText: "text-rose-600 dark:text-rose-400",
    bar: "#F43F5E",
  },
  "General": {
    Icon: Package,
    color: "#94A3B8",
    pill: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400",
    iconBg: "bg-slate-50 dark:bg-slate-500/10",
    iconText: "text-slate-500 dark:text-slate-400",
    bar: "#94A3B8",
  },

  // ── Transportation sub-categories ─────────────────────────────────────────
  "Taxi": {
    Icon: Car,
    color: "#60A5FA",
    pill: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconText: "text-blue-500 dark:text-blue-300",
    bar: "#60A5FA",
    parent: "Transportation",
  },
  "Fuel": {
    Icon: Fuel,
    color: "#2563EB",
    pill: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
    iconBg: "bg-blue-100 dark:bg-blue-500/15",
    iconText: "text-blue-700 dark:text-blue-300",
    bar: "#2563EB",
    parent: "Transportation",
  },
  "Auto Repair": {
    Icon: Wrench,
    color: "#1D4ED8",
    pill: "bg-blue-100 text-blue-900 dark:bg-blue-600/15 dark:text-blue-200",
    iconBg: "bg-blue-100 dark:bg-blue-600/15",
    iconText: "text-blue-800 dark:text-blue-200",
    bar: "#1D4ED8",
    parent: "Transportation",
  },

  // ── Housing sub-categories ─────────────────────────────────────────────────
  "Rent": {
    Icon: Building2,
    color: "#4F46E5",
    pill: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
    iconBg: "bg-indigo-100 dark:bg-indigo-500/15",
    iconText: "text-indigo-700 dark:text-indigo-300",
    bar: "#4F46E5",
    parent: "Housing",
  },

  // ── Shopping sub-categories ────────────────────────────────────────────────
  "Groceries": {
    Icon: ShoppingCart,
    color: "#0284C7",
    pill: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
    iconBg: "bg-sky-100 dark:bg-sky-500/15",
    iconText: "text-sky-700 dark:text-sky-300",
    bar: "#0284C7",
    parent: "Shopping",
  },
};

export const getCategoryConfig = (category) =>
  CATEGORY_CONFIG[category] || CATEGORY_CONFIG["General"];

/** All top-level (parent) categories in display order. */
export const ALL_PARENT_CATEGORIES = [
  "Food & Dining", "Transportation", "Housing", "Shopping",
  "Income", "Transfer", "Entertainment", "Utilities", "Subscription", "General",
];

/** All categories including sub-categories, for filter dropdowns. */
export const ALL_CATEGORIES = [
  ...ALL_PARENT_CATEGORIES,
  "Taxi", "Fuel", "Auto Repair",
  "Rent",
  "Groceries",
];
