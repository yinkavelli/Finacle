import {
  Utensils, Car, Home, ShoppingBag, TrendingUp,
  ArrowRightLeft, Tv, Zap, Monitor, Package,
} from "lucide-react";

export const CATEGORY_CONFIG = {
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
};

export const getCategoryConfig = (category) =>
  CATEGORY_CONFIG[category] || CATEGORY_CONFIG["General"];

export const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG);
