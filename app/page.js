"use client";

import { ChatWidget } from "@/components/ChatWidget";
import { TransactionsTab } from "@/components/TransactionsTab";
import { BudgetTab } from "@/components/BudgetTab";
import { InsightsTab } from "@/components/InsightsTab";
import { getCategoryConfig, getParentCategory } from "@/utils/categoryConfig";
import { ArrowLeft, X, Trash2, Sparkles, Plus, Upload } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const TABS = {
  DASHBOARD:    "dashboard",
  TRANSACTIONS: "transactions",
  BUDGET:       "budget",
  INSIGHTS:     "insights",
  SETTINGS:     "settings",
};

const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const fmt = (n, currency = "AED") => {
  const abs = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return currency === "AED" ? `Đ ${abs}` : `$${abs}`;
};

const fmtFull = (n, currency = "AED") => {
  const abs = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency === "AED" ? `Đ ${abs}` : `$${abs}`;
};

// ── Tab icons ──────────────────────────────────────────────────────────────

function IconHome({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.2" />
      <rect x="14" y="3" width="7" height="7" rx="1.2" />
      <rect x="3" y="14" width="7" height="7" rx="1.2" />
      <rect x="14" y="14" width="7" height="7" rx="1.2" />
    </svg>
  );
}
function IconTxns() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="1.4" />
      <path d="M12 7v10M9 10l3-3 3 3M9 14l3 3 3-3" />
    </svg>
  );
}
function IconBudget() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18s2-3 5-3 4 2 7 1 4-4 4-4M4 13v6a1 1 0 001 1h14a1 1 0 001-1V5a3 3 0 00-3-3H7a3 3 0 00-3 3v8z" />
    </svg>
  );
}
function IconInsights() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
    </svg>
  );
}
function IconChevR() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

// ── Coverage ring ──────────────────────────────────────────────────────────

function CoverageRing({ size = 160, income, spent, dayOfMonth, daysInMonth }) {
  const r1 = size / 2 - 7;
  const r2 = size / 2 - 22;
  const C1 = 2 * Math.PI * r1;
  const C2 = 2 * Math.PI * r2;
  const monthPct = Math.min(dayOfMonth / daysInMonth, 1);
  const burnPct  = Math.min(income > 0 ? spent / income : 0, 1);
  const isOver   = income > 0 && spent > income;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,243,239,0.06)" strokeWidth="3" />
      <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,243,239,0.25)" strokeWidth="3"
        strokeDasharray={`${monthPct * C1} ${C1}`} strokeLinecap="round" />
      <circle cx={size/2} cy={size/2} r={r2} fill="none" stroke="rgba(245,243,239,0.08)" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r2} fill="none"
        stroke={isOver ? "#D97757" : "var(--ax-gold)"} strokeWidth="6"
        strokeDasharray={`${burnPct * C2} ${C2}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 800ms var(--ax-ease), stroke 320ms var(--ax-ease)" }} />
    </svg>
  );
}

// ── Category icon ──────────────────────────────────────────────────────────

function CatIcon({ category, size = 36 }) {
  const cfg = getCategoryConfig(category);
  const color = cfg.color || "#9A7B3D";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "var(--ax-midnight)",
      border: `1px solid ${color}55`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <cfg.Icon size={size * 0.44} style={{ color }} />
    </div>
  );
}

// ── Transaction row ────────────────────────────────────────────────────────

function TxnRow({ tx, isLast, onClick, currency }) {
  const isIncome = Number(tx.amount) > 0;
  const amt = fmtFull(tx.amount, currency);
  const d = parseLocalDate(tx.date);
  const dateStr = `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`;
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "13px 16px", cursor: onClick ? "pointer" : "default",
      borderBottom: isLast ? "none" : "1px solid var(--ax-border)",
      transition: "background 220ms var(--ax-ease)",
    }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.background = "rgba(201,165,90,0.04)"; }}
    onMouseLeave={e => { if (onClick) e.currentTarget.style.background = "transparent"; }}>
      <CatIcon category={tx.category} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: "var(--ax-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {tx.description}
        </div>
        <div style={{ fontSize: 11, color: "var(--ax-fg-muted)", marginTop: 2 }}>
          {tx.category} · {dateStr}
        </div>
      </div>
      <div style={{
        fontFamily: "var(--ax-font-display)", fontSize: 15, fontWeight: 400,
        color: isIncome ? "var(--ax-gold)" : "var(--ax-fg)",
        whiteSpace: "nowrap",
      }}>
        {isIncome ? "+" : ""}{amt}
      </div>
    </div>
  );
}

// ── Eyebrow label ──────────────────────────────────────────────────────────

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

// ── Health pill ────────────────────────────────────────────────────────────

function HealthPill({ status }) {
  const map = {
    "on-track": { label: "On track", color: "#7A8C6F", bg: "rgba(122,140,111,0.12)" },
    "watch":    { label: "Watch",    color: "#D4B76A", bg: "rgba(212,183,106,0.14)" },
    "over":     { label: "Over",     color: "#D97757", bg: "rgba(217,119,87,0.15)" },
  };
  const s = map[status] || map.watch;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 10px", borderRadius: 2,
      background: s.bg, border: `1px solid ${s.color}55`,
      color: s.color, fontSize: 10, fontWeight: 500, letterSpacing: "0.26em",
      textTransform: "uppercase",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color }} />
      {s.label}
    </span>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

export default function Home() {
  const [activeTab, setActiveTab]             = useState(TABS.DASHBOARD);
  const [txList, setTxList]                   = useState([]);
  const [isLoading, setIsLoading]             = useState(true);
  const [isUploading, setIsUploading]         = useState(false);
  const [currency, setCurrency]               = useState("AED");
  const [uploadProgress, setUploadProgress]   = useState("");
  const [user, setUser]                       = useState(null);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const fileInputRef = useRef(null);
  const supabase     = useMemo(() => createClient(), []);
  const router       = useRouter();

  const changeTab = (tab) => { setActiveTab(tab); setSelectedInsight(null); };

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push("/login"); return; }
      setUser(user);
      const { data: txData, error: txError } = await supabase
        .from("transactions").select("*").order("date", { ascending: false });
      if (!txError && txData) setTxList(txData);
      setIsLoading(false);
    };
    fetchUserAndData();
  }, [router, supabase]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadProgress("Parsing & categorising…");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res  = await fetch("/api/ingest", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setUploadProgress("Updating ledger…");
        setTxList((prev) => [...data.transactions, ...prev]);
      } else {
        alert("Error parsing document: " + data.error);
      }
    } catch { alert("Error uploading document"); }
    finally {
      setIsUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const loadDemoData = async () => {
    setIsUploading(true);
    setUploadProgress("Loading demo ledger…");
    try {
      const res  = await fetch("/showcase_sample.csv");
      const blob = await res.blob();
      const file = new File([blob], "showcase_sample.csv", { type: "text/csv" });
      const formData = new FormData();
      formData.append("file", file);
      const ingestRes = await fetch("/api/ingest", { method: "POST", body: formData });
      const data = await ingestRes.json();
      if (data.success) {
        setUploadProgress("Updating ledger…");
        setTxList((prev) => [...data.transactions, ...prev]);
      } else {
        alert("Error loading demo: " + data.error);
      }
    } catch { alert("Error loading demo data"); }
    finally { setIsUploading(false); setUploadProgress(""); }
  };

  const handleDeleteAll = async () => {
    setDeleteConfirmOpen(false);
    setIsLoading(true);
    const { error: deleteError } = await supabase
      .from("transactions").delete().eq("user_id", user.id);
    if (deleteError) {
      alert("Failed to clear data. Please try again.");
    } else {
      setTxList([]);
    }
    setIsLoading(false);
  };

  // ── Derived data ────────────────────────────────────────────────────────

  const currentMonthStats = useMemo(() => {
    if (!txList.length) return { income: 0, spending: 0, net: 0, label: "", month: "" };
    const months = [...new Set(txList.map(tx => tx.date.slice(0, 7)))].sort();
    const latestMonth = months[months.length - 1];
    const [y, m] = latestMonth.split("-").map(Number);
    const label = new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
    const monthTx   = txList.filter(tx => tx.date.startsWith(latestMonth));
    const income    = monthTx.filter(t => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0);
    const spending  = Math.abs(monthTx.filter(t => Number(t.amount) < 0).reduce((s, t) => s + Number(t.amount), 0));
    return { income, spending, net: income - spending, label, month: latestMonth };
  }, [txList]);

  const topCategories = useMemo(() => {
    if (!txList.length) return [];
    const month = currentMonthStats.month;
    const monthTx = month ? txList.filter(t => t.date.startsWith(month) && Number(t.amount) < 0) : txList.filter(t => Number(t.amount) < 0);
    const totals = {};
    monthTx.forEach(t => {
      const parent = getParentCategory(t.category);
      totals[parent] = (totals[parent] || 0) + Math.abs(Number(t.amount));
    });
    return Object.entries(totals)
      .filter(([k]) => k !== "Income" && k !== "Transfer")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));
  }, [txList, currentMonthStats]);

  const recentTxns = useMemo(() => txList.slice(0, 5), [txList]);

  const totalIncome   = useMemo(() => txList.filter(t => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0), [txList]);
  const totalSpending = useMemo(() => Math.abs(txList.filter(t => Number(t.amount) < 0).reduce((s, t) => s + Number(t.amount), 0)), [txList]);

  // Coverage ring inputs
  const now = new Date();
  const dayOfMonth   = now.getDate();
  const daysInMonth  = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const available    = currentMonthStats.income - currentMonthStats.spending;
  const dailyBudget  = currentMonthStats.income > 0 ? available / Math.max(daysInMonth - dayOfMonth, 1) : 0;

  let coverageStatus = "on-track";
  if (currentMonthStats.spending > currentMonthStats.income) coverageStatus = "over";
  else if (currentMonthStats.income > 0 && currentMonthStats.spending > currentMonthStats.income * 0.85) coverageStatus = "watch";

  // Narrative observation for home card
  const observation = useMemo(() => {
    if (!topCategories.length) return null;
    const top = topCategories[0];
    if (!top) return null;
    return {
      category: top.name,
      amount: top.amount,
      pct: currentMonthStats.spending > 0 ? Math.round((top.amount / currentMonthStats.spending) * 100) : 0,
    };
  }, [topCategories, currentMonthStats]);

  // ── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{
        display: "flex", height: "100dvh", width: "100%",
        alignItems: "center", justifyContent: "center",
        background: "var(--ax-midnight)",
        flexDirection: "column", gap: 20,
      }}>
        <svg viewBox="0 0 24 24" width="32" height="32" style={{ animation: "spin 1s linear infinite" }}>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(201,165,90,0.2)" strokeWidth="2.5" />
          <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="var(--ax-gold)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <p style={{ fontFamily: "var(--ax-font-display)", fontSize: 18, color: "var(--ax-fg-muted)", fontStyle: "italic", fontWeight: 300 }}>
          Loading Finacle…
        </p>
      </div>
    );
  }

  // ── Layout ───────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", width: "100%", overflow: "hidden", background: "var(--ax-midnight)" }}>
      {/* ── Top bar ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: 56, flexShrink: 0,
        borderBottom: "1px solid var(--ax-border)",
        background: "var(--ax-midnight)",
        position: "relative", zIndex: 20,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo-dark.png" alt="Finacle" style={{ height: 28, width: "auto", objectFit: "contain" }} />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="file" style={{ display: "none" }} ref={fileInputRef} onChange={handleFileUpload} accept=".csv" />

          {txList.length === 0 && (
            <button onClick={loadDemoData} disabled={isUploading}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: "var(--ax-radius-2)",
                background: "transparent",
                border: "1px solid var(--ax-border-strong)",
                color: "var(--ax-fg-muted)",
                fontFamily: "var(--ax-font-body)", fontSize: 11,
                letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500,
                cursor: "pointer",
              }}>
              <Sparkles size={13} style={{ color: "var(--ax-gold)" }} />
              Demo
            </button>
          )}

          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: "var(--ax-radius-2)",
              background: "var(--ax-gold)",
              border: "none",
              color: "var(--ax-midnight)",
              fontFamily: "var(--ax-font-body)", fontSize: 11,
              letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600,
              cursor: "pointer",
              transition: "background var(--ax-dur-fast) var(--ax-ease)",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--ax-gold-bright)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--ax-gold)"}>
            <Upload size={13} />
            <span>{isUploading ? uploadProgress || "…" : "Import"}</span>
          </button>

          {/* User avatar / sign out */}
          <button onClick={async () => {
            const { error } = await supabase.auth.signOut();
            if (!error) { setUser(null); router.push("/login"); }
          }}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              border: "1px solid var(--ax-border-gold)",
              background: "linear-gradient(135deg, #1a1612 0%, #2a2218 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--ax-font-display)", fontSize: 13, color: "var(--ax-gold)",
              cursor: "pointer",
            }}>
            {user?.email?.[0]?.toUpperCase() || "U"}
          </button>
        </div>
      </header>

      {/* ── Tab content ── */}
      <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: 88 }} className="scroll-thin">

        {/* DASHBOARD */}
        {activeTab === TABS.DASHBOARD && (
          <div style={{ padding: "0 0 8px", animation: "slide-up 0.42s cubic-bezier(0.22,1,0.36,1) forwards" }}>

            {/* Greeting */}
            <div style={{ padding: "20px 20px 0" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.28em", color: "var(--ax-fg-muted)", fontWeight: 500, textTransform: "uppercase" }}>
                {now.toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </div>
              {currentMonthStats.label && (
                <div style={{ fontFamily: "var(--ax-font-display)", fontSize: 22, marginTop: 4, lineHeight: 1 }}>
                  <span style={{ color: "var(--ax-fg-muted)", fontStyle: "italic", fontWeight: 300 }}>Coverage — </span>
                  <span style={{ color: "var(--ax-fg)", fontWeight: 400 }}>{currentMonthStats.label}</span>
                </div>
              )}
            </div>

            {/* Coverage hero card */}
            <div style={{ padding: "16px 20px 0" }}>
              <div className="ax-card-midnight" style={{ padding: "22px 20px 20px", position: "relative", overflow: "hidden" }}>
                {/* Halftone accent */}
                <div className="ax-halftone" style={{ top: -20, right: -20, width: 160, height: 160, opacity: 0.35 }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <Eyebrow num={1} label={currentMonthStats.label || "May · Coverage"} />
                  <HealthPill status={coverageStatus} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <CoverageRing
                    size={150}
                    income={currentMonthStats.income}
                    spent={currentMonthStats.spending}
                    dayOfMonth={dayOfMonth}
                    daysInMonth={daysInMonth}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, letterSpacing: "0.32em", color: "var(--ax-fg-muted)", textTransform: "uppercase", fontWeight: 500 }}>
                      Available
                    </div>
                    <div style={{
                      fontFamily: "var(--ax-font-display)", fontSize: 36, fontWeight: 300,
                      letterSpacing: "-0.02em", lineHeight: 1, marginTop: 4,
                      color: available >= 0 ? "var(--ax-fg)" : "var(--ax-error)",
                    }}>
                      {txList.length === 0 ? "—" : fmt(Math.abs(available), currency)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ax-fg-muted)", marginTop: 6, lineHeight: 1.4 }}>
                      {txList.length === 0 ? "Import a CSV to begin" : (
                        <>of <span style={{ color: "var(--ax-fg)", fontFamily: "var(--ax-font-display)" }}>{fmt(currentMonthStats.income, currency)}</span> income</>
                      )}
                    </div>
                    {txList.length > 0 && (
                      <>
                        <div style={{ marginTop: 10, height: 1, background: "var(--ax-border)" }} />
                        <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 6 }}>
                          <span style={{
                            fontFamily: "var(--ax-font-display)", fontSize: 20,
                            fontStyle: "italic", fontWeight: 400, color: "var(--ax-gold)",
                          }}>{fmt(Math.max(dailyBudget, 0), currency)}</span>
                          <span style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--ax-fg-muted)", textTransform: "uppercase" }}>
                            / day · {daysInMonth - dayOfMonth}d left
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                {txList.length > 0 && (
                  <div style={{
                    marginTop: 20, paddingTop: 16,
                    borderTop: "1px solid var(--ax-border)",
                    display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr",
                    gap: 12, alignItems: "center",
                  }}>
                    <StatBlock label="Spent" value={fmt(currentMonthStats.spending, currency)} />
                    <span style={{ height: 28, background: "var(--ax-border)" }} />
                    <StatBlock label="Saved" value={fmt(Math.max(currentMonthStats.net, 0), currency)} gold />
                    <span style={{ height: 28, background: "var(--ax-border)" }} />
                    <StatBlock label="Day" value={`${dayOfMonth}/${daysInMonth}`} />
                  </div>
                )}
              </div>
            </div>

            {/* Narrative observation */}
            {observation && (
              <div style={{ padding: "14px 20px 0" }}>
                <div className="ax-card-midnight" style={{
                  padding: "16px 18px", position: "relative", cursor: "pointer",
                }}
                onClick={() => changeTab(TABS.INSIGHTS)}>
                  <div style={{
                    position: "absolute", left: 0, top: 16, bottom: 16,
                    width: 2, background: "var(--ax-gold)",
                  }} />
                  <div style={{ fontSize: 10, letterSpacing: "0.32em", color: "var(--ax-gold)", textTransform: "uppercase", fontWeight: 500 }}>
                    Observation · {currentMonthStats.label}
                  </div>
                  <div style={{
                    fontFamily: "var(--ax-font-display)", fontSize: 17, fontWeight: 300,
                    marginTop: 6, lineHeight: 1.35, color: "var(--ax-fg)",
                  }}>
                    <span style={{ fontStyle: "italic", color: "var(--ax-fg-muted)" }}>{observation.category}</span> accounts for{" "}
                    <span style={{ color: observation.pct > 40 ? "var(--ax-error)" : "var(--ax-gold)", fontStyle: "italic" }}>{observation.pct}%</span>{" "}
                    of this month's spend — {fmt(observation.amount, currency)} total.
                  </div>
                  <div style={{
                    marginTop: 10, fontSize: 11, letterSpacing: "0.18em",
                    color: "var(--ax-fg-muted)", textTransform: "uppercase", fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    See insights <IconChevR />
                  </div>
                </div>
              </div>
            )}

            {/* Top categories */}
            {topCategories.length > 0 && (
              <div style={{ padding: "20px 20px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Eyebrow num={2} label="Where it's going" />
                  <button onClick={() => changeTab(TABS.BUDGET)} style={{
                    background: "transparent", border: 0, color: "var(--ax-fg-muted)",
                    fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                    fontFamily: "var(--ax-font-body)", fontWeight: 500, padding: 0,
                  }}>
                    Budgets <IconChevR />
                  </button>
                </div>
                <div className="ax-card-midnight" style={{ overflow: "hidden" }}>
                  {topCategories.map((cat, i) => {
                    const cfg = getCategoryConfig(cat.name);
                    const pct = currentMonthStats.spending > 0 ? (cat.amount / currentMonthStats.spending) * 100 : 0;
                    return (
                      <div key={cat.name} style={{
                        padding: "12px 16px",
                        borderBottom: i < topCategories.length - 1 ? "1px solid var(--ax-border)" : "none",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                          <CatIcon category={cat.name} size={30} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                              <span style={{ fontSize: 13, color: "var(--ax-fg)" }}>{cat.name}</span>
                              <span style={{ fontFamily: "var(--ax-font-display)", fontSize: 14, color: "var(--ax-fg)", fontWeight: 400 }}>
                                {fmt(cat.amount, currency)}
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

            {/* Recent transactions */}
            {recentTxns.length > 0 && (
              <div style={{ padding: "20px 20px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Eyebrow num={3} label="Recent activity" />
                  <button onClick={() => changeTab(TABS.TRANSACTIONS)} style={{
                    background: "transparent", border: 0, color: "var(--ax-fg-muted)",
                    fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                    fontFamily: "var(--ax-font-body)", fontWeight: 500, padding: 0,
                  }}>
                    All · {txList.length} <IconChevR />
                  </button>
                </div>
                <div className="ax-card-midnight" style={{ overflow: "hidden" }}>
                  {recentTxns.map((tx, i) => (
                    <TxnRow key={tx.id} tx={tx} isLast={i === recentTxns.length - 1} currency={currency}
                      onClick={() => setSelectedInsight({
                        type: "category", title: tx.category,
                        transactions: [tx], isIncome: Number(tx.amount) > 0,
                      })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {txList.length === 0 && (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--ax-font-display)", fontSize: 28, fontWeight: 300,
                  color: "var(--ax-fg)", marginBottom: 8,
                }}>
                  Your ledger awaits.
                </div>
                <div style={{ fontSize: 14, color: "var(--ax-fg-muted)", marginBottom: 24, lineHeight: 1.6 }}>
                  Import a bank statement CSV to see<br />your complete financial picture.
                </div>
                <button onClick={() => fileInputRef.current?.click()} style={{
                  padding: "14px 28px", borderRadius: "var(--ax-radius-2)",
                  background: "var(--ax-gold)", border: "none",
                  color: "var(--ax-midnight)",
                  fontFamily: "var(--ax-font-body)", fontSize: 11,
                  letterSpacing: "0.28em", textTransform: "uppercase", fontWeight: 600,
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
                }}>
                  <Plus size={14} />
                  Upload Statement
                </button>
                <div style={{ marginTop: 14 }}>
                  <button onClick={loadDemoData} style={{
                    background: "transparent", border: "none",
                    color: "var(--ax-fg-muted)", fontFamily: "var(--ax-font-body)",
                    fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
                    cursor: "pointer", fontWeight: 500,
                  }}>
                    or try the demo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TRANSACTIONS */}
        {activeTab === TABS.TRANSACTIONS && (
          <TransactionsTab txList={txList} currency={currency} />
        )}

        {/* BUDGET */}
        {activeTab === TABS.BUDGET && (
          <BudgetTab txList={txList} currency={currency} userId={user?.id} />
        )}

        {/* INSIGHTS */}
        {activeTab === TABS.INSIGHTS && (
          <InsightsTab
            txList={txList}
            currency={currency}
            onCategoryClick={setSelectedInsight}
            userId={user?.id}
          />
        )}

        {/* SETTINGS */}
        {activeTab === TABS.SETTINGS && (
          <div style={{ padding: "24px 20px", animation: "slide-up 0.42s cubic-bezier(0.22,1,0.36,1) forwards" }}>

            {/* Profile card */}
            <div className="ax-card-midnight" style={{ padding: "20px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
              <div className="ax-halftone" style={{ top: -20, right: -20, width: 140, height: 140, opacity: 0.3 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: "50%",
                  border: "1px solid var(--ax-border-gold)",
                  background: "linear-gradient(135deg, #1a1612 0%, #2a2218 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--ax-font-display)", fontSize: 18, color: "var(--ax-gold)",
                }}>
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--ax-font-display)", fontSize: 18, fontWeight: 300, color: "var(--ax-fg)" }}>
                    {user?.email || "Account"}
                  </div>
                  <div style={{
                    marginTop: 6, fontSize: 10, letterSpacing: "0.28em",
                    color: "var(--ax-gold)", textTransform: "uppercase", fontWeight: 500,
                  }}>
                    {txList.length} transactions · {[...new Set(txList.map(t => t.date.slice(0, 7)))].length} months
                  </div>
                </div>
              </div>
            </div>

            <Eyebrow num={1} label="Import" />
            <div className="ax-card-midnight" style={{ padding: 18, marginTop: 14, marginBottom: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "var(--ax-radius-2)",
                  background: "rgba(201,165,90,0.08)",
                  border: "1px solid var(--ax-border-gold-soft)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--ax-gold)",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
                    <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z" />
                    <path d="M14 3v6h6M9 13h6M9 17h6" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--ax-font-display)", fontSize: 16, fontWeight: 400, color: "var(--ax-fg)" }}>
                    Bank statement (CSV)
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ax-fg-muted)", marginTop: 2 }}>
                    {txList.length > 0 ? `${txList.length} transactions imported` : "No data yet"}
                  </div>
                </div>
              </div>
              <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                style={{
                  width: "100%", padding: "13px",
                  background: isUploading ? "rgba(201,165,90,0.5)" : "var(--ax-gold)",
                  border: "none", color: "var(--ax-midnight)",
                  borderRadius: "var(--ax-radius-2)", cursor: "pointer",
                  fontFamily: "var(--ax-font-body)", fontSize: 11,
                  letterSpacing: "0.28em", textTransform: "uppercase", fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                <Upload size={13} />
                {isUploading ? uploadProgress || "Importing…" : "Upload statement"}
              </button>
            </div>

            <Eyebrow num={2} label="Currency" />
            <div className="ax-card-midnight" style={{ overflow: "hidden", marginTop: 14, marginBottom: 20 }}>
              {["AED", "USD"].map((c, i) => (
                <div key={c} onClick={() => setCurrency(c)} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", cursor: "pointer",
                  borderBottom: i === 0 ? "1px solid var(--ax-border)" : "none",
                  background: currency === c ? "rgba(201,165,90,0.06)" : "transparent",
                  transition: "background 220ms var(--ax-ease)",
                }}>
                  <div style={{ fontSize: 14, color: "var(--ax-fg)" }}>
                    {c === "AED" ? "UAE Dirham (Đ)" : "US Dollar ($)"}
                  </div>
                  {currency === c && (
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ax-gold)" }} />
                  )}
                </div>
              ))}
            </div>

            <Eyebrow num={3} label="Data" />
            <div className="ax-card-midnight" style={{ overflow: "hidden", marginTop: 14 }}>
              {txList.length > 0 && (
                <div onClick={() => setDeleteConfirmOpen(true)} style={{
                  padding: "14px 16px", cursor: "pointer",
                  borderBottom: "1px solid var(--ax-border)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "background 220ms var(--ax-ease)",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(217,119,87,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ fontSize: 14, color: "var(--ax-error)" }}>Clear all transactions</div>
                  <Trash2 size={14} style={{ color: "var(--ax-error)" }} />
                </div>
              )}
              <div onClick={async () => {
                const { error } = await supabase.auth.signOut();
                if (!error) { setUser(null); router.push("/login"); }
              }} style={{
                padding: "14px 16px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                transition: "background 220ms var(--ax-ease)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(245,243,239,0.03)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ fontSize: 14, color: "var(--ax-fg-muted)" }}>Sign out</div>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--ax-fg-muted)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Bottom navigation ── */}
      <nav style={{
        position: "fixed", bottom: 16, left: 12, right: 12,
        background: "rgba(10,9,8,0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 28,
        border: "1px solid var(--ax-border-strong)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,165,90,0.06) inset",
        zIndex: 50,
      }}>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "10px 8px" }}>
          {[
            { tab: TABS.DASHBOARD,    icon: <IconHome />,     label: "Home"    },
            { tab: TABS.TRANSACTIONS, icon: <IconTxns />,     label: "Txns"    },
            { tab: TABS.BUDGET,       icon: <IconBudget />,   label: "Budget"  },
            { tab: TABS.INSIGHTS,     icon: <IconInsights />, label: "Insights"},
            { tab: TABS.SETTINGS,     icon: <IconSettings />, label: "Settings"},
          ].map(({ tab, icon, label }) => (
            <button key={tab} onClick={() => changeTab(tab)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "6px 10px", borderRadius: 18,
              background: "transparent", border: "none",
              color: activeTab === tab ? "var(--ax-gold)" : "var(--ax-fg-muted)",
              cursor: "pointer",
              transition: "color var(--ax-dur-fast) var(--ax-ease)",
            }}>
              {icon}
              <span style={{
                fontSize: 9, fontWeight: 500, letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: activeTab === tab ? "var(--ax-gold)" : "var(--ax-fg-faint)",
              }}>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Chat widget ── */}
      <ChatWidget txList={txList} currency={currency} />

      {/* ── Insight modal ── */}
      <InsightModal insight={selectedInsight} onClose={() => setSelectedInsight(null)} currency={currency} />

      {/* ── Delete confirm modal ── */}
      {deleteConfirmOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
          animation: "fade-in 220ms var(--ax-ease)",
        }}>
          <div style={{
            background: "var(--ax-card)", width: "100%", maxWidth: 360,
            borderRadius: "var(--ax-radius-2)",
            border: "1px solid var(--ax-border-gold-soft)",
            padding: 24,
            animation: "zoom-in 320ms var(--ax-ease)",
          }}>
            <div style={{ fontFamily: "var(--ax-font-display)", fontSize: 20, fontWeight: 400, marginBottom: 8, color: "var(--ax-fg)" }}>
              Clear all data?
            </div>
            <div style={{ fontSize: 14, color: "var(--ax-fg-muted)", marginBottom: 24, lineHeight: 1.5 }}>
              This will permanently delete all your transactions. This cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirmOpen(false)} style={{
                flex: 1, padding: "12px",
                background: "transparent", border: "1px solid var(--ax-border-strong)",
                color: "var(--ax-fg-muted)", borderRadius: "var(--ax-radius-2)",
                fontFamily: "var(--ax-font-body)", fontSize: 11,
                letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500, cursor: "pointer",
              }}>
                Cancel
              </button>
              <button onClick={handleDeleteAll} style={{
                flex: 1, padding: "12px",
                background: "var(--ax-error)", border: "none",
                color: "var(--ax-parchment)", borderRadius: "var(--ax-radius-2)",
                fontFamily: "var(--ax-font-body)", fontSize: 11,
                letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, cursor: "pointer",
              }}>
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── StatBlock ──────────────────────────────────────────────────────────────

function StatBlock({ label, value, gold }) {
  return (
    <div>
      <div style={{ fontSize: 9, letterSpacing: "0.28em", color: "var(--ax-fg-muted)", textTransform: "uppercase", fontWeight: 500 }}>
        {label}
      </div>
      <div style={{
        fontFamily: "var(--ax-font-display)", fontSize: 17, fontWeight: 400,
        marginTop: 4, color: gold ? "var(--ax-gold)" : "var(--ax-fg)",
        fontStyle: gold ? "italic" : "normal",
      }}>
        {value}
      </div>
    </div>
  );
}

// ── InsightModal ───────────────────────────────────────────────────────────

function InsightModal({ insight, onClose, currency }) {
  const [drillStack, setDrillStack] = useState([]);

  useEffect(() => {
    if (insight) {
      if (insight.type === "summary") {
        setDrillStack([{ mode: "category", title: insight.title, transactions: insight.transactions, showToggle: true, isIncome: insight.isIncome }]);
      } else if (insight.type === "date") {
        setDrillStack([{ mode: "category", title: insight.title, transactions: insight.transactions, showToggle: false, isIncome: insight.isIncome }]);
      } else {
        setDrillStack([{ mode: "transactions", title: insight.title, transactions: insight.transactions, showToggle: false, isIncome: insight.isIncome }]);
      }
    } else {
      setDrillStack([]);
    }
  }, [insight]);

  if (!insight || drillStack.length === 0) return null;

  const currentView  = drillStack[drillStack.length - 1];
  const txs          = currentView.transactions || [];
  const totalAmount  = txs.reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);

  const formatAmt = (amt) => fmtFull(amt, currency);
  const formatDt  = (dateStr) => {
    if (!dateStr) return "";
    const d = parseLocalDate(dateStr);
    return `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`;
  };

  let groupedItems = [];
  if (["category", "subcategory", "month"].includes(currentView.mode)) {
    const groups = {};
    txs.forEach((tx) => {
      let key;
      if (currentView.mode === "category")    key = getParentCategory(tx.category) || "Uncategorized";
      else if (currentView.mode === "subcategory") key = tx.category || "Uncategorized";
      else key = parseLocalDate(tx.date).toLocaleString("en-US", { month: "long", year: "numeric" });
      if (!groups[key]) groups[key] = { name: key, amount: 0, transactions: [] };
      groups[key].amount += Math.abs(Number(tx.amount));
      groups[key].transactions.push(tx);
    });
    Object.values(groups).forEach(g => {
      const subs = new Set(g.transactions.map(t => getParentCategory(t.category) === g.name ? t.category : null).filter(Boolean));
      g.hasSubcategories = subs.size > 1 || (subs.size === 1 && ![...subs][0].includes(g.name));
    });
    groupedItems = Object.values(groups).sort((a, b) => b.amount - a.amount);
  }

  const handleGroupClick = (item) => {
    let nextMode = "transactions";
    if (currentView.showToggle)    nextMode = currentView.mode === "category" ? "month" : "category";
    else if (currentView.mode === "category" && item.hasSubcategories) nextMode = "subcategory";
    setDrillStack(prev => [...prev, {
      mode: nextMode, title: `${currentView.title} › ${item.name}`,
      transactions: item.transactions, showToggle: false, isIncome: currentView.isIncome,
    }]);
  };

  const setSummaryMode = (mode) => {
    setDrillStack(prev => {
      const next = [...prev];
      next[next.length - 1] = { ...next[next.length - 1], mode };
      return next;
    });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
      animation: "fade-in 220ms var(--ax-ease)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--ax-midnight)",
        border: "1px solid var(--ax-border-gold-soft)",
        borderRadius: "12px 12px 0 0",
        width: "100%", maxWidth: 480,
        maxHeight: "88vh",
        display: "flex", flexDirection: "column",
        animation: "slide-up-sheet 320ms cubic-bezier(0.22,1,0.36,1)",
        overflow: "hidden",
      }}>
        {/* Drag handle */}
        <div style={{ width: 40, height: 3, background: "var(--ax-border-strong)", borderRadius: 2, margin: "16px auto 0" }} />

        {/* Header */}
        <div style={{
          padding: "16px 20px 14px",
          borderBottom: "1px solid var(--ax-border)",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {drillStack.length > 1 && (
                <button onClick={() => setDrillStack(prev => prev.slice(0, -1))} style={{
                  background: "transparent", border: "none", color: "var(--ax-fg-muted)",
                  cursor: "pointer", padding: 0, display: "flex",
                }}>
                  <ArrowLeft size={18} />
                </button>
              )}
              <div style={{ fontFamily: "var(--ax-font-display)", fontSize: 20, fontWeight: 400, color: "var(--ax-fg)" }}>
                {currentView.title}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span style={{
                fontFamily: "var(--ax-font-display)", fontSize: 16,
                fontStyle: "italic", fontWeight: 300,
                color: currentView.isIncome ? "var(--ax-gold)" : "var(--ax-fg-muted)",
              }}>
                {formatAmt(totalAmount)}
              </span>
              <span style={{ fontSize: 11, color: "var(--ax-fg-faint)" }}>
                {txs.length} item{txs.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "transparent", border: "none",
            color: "var(--ax-fg-muted)", cursor: "pointer",
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Toggle */}
        {currentView.showToggle && (
          <div style={{ padding: "12px 20px 0" }}>
            <div style={{
              display: "flex", background: "var(--ax-card)", borderRadius: "var(--ax-radius-2)",
              border: "1px solid var(--ax-border)", overflow: "hidden",
            }}>
              {["category", "month"].map(mode => (
                <button key={mode} onClick={() => setSummaryMode(mode)} style={{
                  flex: 1, padding: "10px",
                  background: currentView.mode === mode ? "rgba(201,165,90,0.12)" : "transparent",
                  border: "none",
                  color: currentView.mode === mode ? "var(--ax-gold)" : "var(--ax-fg-muted)",
                  fontFamily: "var(--ax-font-body)", fontSize: 11,
                  letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500,
                  cursor: "pointer",
                  borderRight: mode === "category" ? "1px solid var(--ax-border)" : "none",
                  transition: "all 220ms var(--ax-ease)",
                }}>
                  By {mode}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* List */}
        <div style={{ overflowY: "auto", flex: 1, padding: "12px 20px 32px" }} className="scroll-thin">
          {txs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ax-fg-muted)", fontSize: 13 }}>
              No transactions found.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["category", "month", "subcategory"].includes(currentView.mode) ? (
                groupedItems.map((item, idx) => {
                  const pct = totalAmount > 0 ? ((item.amount / totalAmount) * 100).toFixed(1) : 0;
                  const cfg = getCategoryConfig(item.name);
                  return (
                    <div key={idx} onClick={() => handleGroupClick(item)} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "14px 16px", borderRadius: "var(--ax-radius-2)",
                      background: "var(--ax-card)", border: "1px solid var(--ax-border)",
                      cursor: "pointer", transition: "border-color 220ms var(--ax-ease)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--ax-border-gold-soft)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--ax-border)"}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "var(--ax-midnight)",
                        border: `1px solid ${cfg.color || "var(--ax-border-strong)"}55`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <cfg.Icon size={16} style={{ color: cfg.color || "var(--ax-fg-muted)" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, color: "var(--ax-fg)", fontWeight: 400 }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: "var(--ax-fg-muted)", marginTop: 2 }}>
                          {item.transactions.length} txn{item.transactions.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "var(--ax-font-display)", fontSize: 15, color: "var(--ax-fg)", fontWeight: 400 }}>
                          {formatAmt(item.amount)}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--ax-fg-muted)", marginTop: 2 }}>{pct}%</div>
                      </div>
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--ax-fg-faint)" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  );
                })
              ) : (
                txs.map((tx) => {
                  const isInc = Number(tx.amount) > 0;
                  const cfg   = getCategoryConfig(tx.category);
                  return (
                    <div key={tx.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "13px 16px", borderRadius: "var(--ax-radius-2)",
                      background: "var(--ax-card)", border: "1px solid var(--ax-border)",
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: "var(--ax-midnight)",
                        border: `1px solid ${cfg.color || "var(--ax-border-strong)"}55`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <cfg.Icon size={14} style={{ color: cfg.color || "var(--ax-fg-muted)" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: "var(--ax-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {tx.description}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--ax-fg-muted)", marginTop: 2 }}>
                          {formatDt(tx.date)} · {tx.category}
                        </div>
                      </div>
                      <div style={{
                        fontFamily: "var(--ax-font-display)", fontSize: 14, fontWeight: 400,
                        color: isInc ? "var(--ax-gold)" : "var(--ax-fg)",
                        whiteSpace: "nowrap",
                      }}>
                        {isInc ? "+" : ""}{formatAmt(tx.amount)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
