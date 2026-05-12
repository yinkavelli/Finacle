"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  LayoutDashboard, 
  WalletCards, 
  PieChart as ChartIcon, 
  Bot, 
  Settings, 
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";



const formatCurrency = (amount, currencyCode, showPlus = false) => {
  const isNegative = amount < 0;
  const isPositive = amount > 0;
  const absAmount = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const prefix = isNegative ? '-' : (showPlus && isPositive ? '+' : '');
  
  if (currencyCode === 'AED') {
    return (
      <span className="inline-flex items-center">
        {prefix}
        <svg width="0.85em" height="0.85em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block relative -top-[1px] mx-[2px] opacity-90">
          <path d="M8 4v16" />
          <path d="M8 4h5a7 7 0 0 1 0 14H8" />
          <path d="M5 10h11" />
          <path d="M5 14h11" />
        </svg>
        {absAmount}
      </span>
    );
  }
  
  return prefix + Math.abs(amount).toLocaleString('en-US', { style: 'currency', currency: currencyCode }).replace('-', '');
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [txList, setTxList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [currency, setCurrency] = useState('AED');
  const [uploadProgress, setUploadProgress] = useState('');
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (!txError && txData) {
        setTxList(txData);
      }
      setIsLoading(false);
    };

    fetchUserAndData();
  }, [router, supabase]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress("Reading & AI Parsing...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadProgress("Updating Dashboard...");
        // Prepend the new transactions returned from the DB to our local state
        setTxList(prevList => [...data.transactions, ...prevList]);
      } else {
        alert("Error parsing document: " + data.error);
      }
    } catch (error) {
      alert("Error uploading document");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- Dynamic Dashboard Calculations ---
  const totalBalance = txList.reduce((acc, tx) => acc + Number(tx.amount), 0);
  const totalSpending = Math.abs(txList.filter(tx => Number(tx.amount) < 0).reduce((acc, tx) => acc + Number(tx.amount), 0));
  const totalIncome = txList.filter(tx => Number(tx.amount) > 0).reduce((acc, tx) => acc + Number(tx.amount), 0);

  // Pie Chart Data (Group Expenses by Category)
  const categoryTotals = {};
  txList.filter(tx => Number(tx.amount) < 0).forEach(tx => {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Math.abs(Number(tx.amount));
  });
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];
  const dynamicExpensesData = Object.keys(categoryTotals).map((key, i) => ({
    name: key,
    value: categoryTotals[key],
    color: colors[i % colors.length]
  }));

  // Bar Chart Data (Group Expenses by Date, last 7 unique days)
  const last7DaysTotals = {};
  txList.filter(tx => Number(tx.amount) < 0).forEach(tx => {
    last7DaysTotals[tx.date] = (last7DaysTotals[tx.date] || 0) + Math.abs(Number(tx.amount));
  });
  const dynamicBarData = Object.keys(last7DaysTotals)
    .sort((a, b) => new Date(a) - new Date(b))
    .slice(-7)
    .map(date => ({
      name: date.slice(5), // MM-DD
      spent: last7DaysTotals[date]
    }));

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--color-accent-primary)]/30 border-t-[var(--color-accent-primary)] rounded-full animate-spin"></div>
          <p className="text-[var(--color-foreground)] opacity-70 font-medium">Loading Finacle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden overscroll-none">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--color-card-border)] bg-[var(--color-background)] flex flex-col hidden md:flex z-10 relative">
        <div className="p-6">
          <div className="flex items-center">
            <img src="/logo-light.png" alt="Finacle Logo" className="w-32 h-auto object-contain dark:hidden" />
            <img src="/logo-dark.png" alt="Finacle Logo" className="w-32 h-auto object-contain hidden dark:block" />
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<WalletCards size={20}/>} label="Transactions" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
          <NavItem icon={<ChartIcon size={20}/>} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          <NavItem icon={<Bot size={20}/>} label="AI Advisor" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
        </nav>

        <div className="p-4 border-t border-[var(--color-card-border)]">
          <NavItem icon={<Settings size={20}/>} label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto overscroll-y-none">
        {/* Header */}
        <header className="pt-4 pb-3 md:pt-6 md:pb-4 min-h-[4.5rem] md:min-h-[5.5rem] border-b border-[var(--color-card-border)] flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 backdrop-blur-xl bg-[var(--color-background)]/80">
          <h1 className="text-lg md:text-xl font-semibold dark:text-white text-slate-900">
            {activeTab === 'dashboard' && 'Overview'}
            {activeTab === 'transactions' && 'Transactions'}
            {activeTab === 'analytics' && 'Analytics'}
            {activeTab === 'ai' && 'AI Advisor'}
          </h1>
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setCurrency(currency === 'USD' ? 'AED' : 'USD')}
              className="px-2 py-1.5 md:px-3 md:py-2 rounded-xl text-xs md:text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {currency}
            </button>
            <ThemeToggle />
            
            {/* Hidden File Input */}
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="relative overflow-hidden flex items-center gap-1 md:gap-2 border dark:border-indigo-500/50 border-indigo-200 bg-gradient-to-br dark:from-indigo-600 dark:to-indigo-900 from-indigo-500 to-indigo-700 text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl text-sm md:text-base font-medium shadow-[0_4px_24px_rgba(99,102,241,0.3)] dark:shadow-[0_4px_24px_rgba(99,102,241,0.5)] hover:scale-[1.02] active:scale-95 transition-all group"
            >
              <div className="shimmer-overlay shimmer-overlay-indigo"></div>
              <Plus size={16} className={`relative z-10 md:w-[18px] md:h-[18px] ${isUploading ? 'animate-spin' : ''}`} />
              <span className="relative z-10 hidden sm:inline">{isUploading ? uploadProgress || 'Processing...' : 'Upload CSV'}</span>
              <span className="relative z-10 inline sm:hidden">{isUploading ? '...' : 'Upload'}</span>
            </button>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-300 border-2 dark:border-indigo-500 border-indigo-300 overflow-hidden shadow-lg shrink-0">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-4 md:space-y-8 pb-24 md:pb-8">
          
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Top Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <MetricCard 
                  title="Net Balance" 
                  amount={formatCurrency(totalBalance, currency)} 
                  subtitle="Overall position" 
                  subtitleColor="neutral" 
                  variant="indigo" 
                  icon={<ArrowUpRight size={18} strokeWidth={2.5} />} 
                />
                <MetricCard 
                  title="Total Spending" 
                  amount={formatCurrency(totalSpending, currency)} 
                  subtitle="All-time expenses" 
                  subtitleColor="down" 
                  variant="emerald" 
                  icon={<ArrowDownRight size={18} strokeWidth={2.5} />} 
                />
                <MetricCard 
                  title="Total Income" 
                  amount={formatCurrency(totalIncome, currency)} 
                  subtitle="All-time inflows" 
                  subtitleColor="up" 
                  variant="violet" 
                  icon={<ArrowUpRight size={18} strokeWidth={2.5} />} 
                />
              </div>

              {/* AI Insights Card */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-emerald-500/50 bg-white dark:bg-slate-950 dark:bg-gradient-to-br dark:from-emerald-900/40 dark:to-emerald-950/20 p-4 md:p-6 shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex gap-3 md:gap-4 items-start group">
                <div className="shimmer-overlay shimmer-overlay-emerald"></div>
                <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-accent-positive)]"></div>
                <div className="relative z-10 flex gap-4 w-full">
                  <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold mb-1 text-slate-900 dark:text-white">AI Financial Insight</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs md:text-sm">
                      You've spent 20% less on Food & Dining this week compared to last week. If you maintain this trend, you could save an additional $140 by the end of the month. Great job!
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Pie Chart */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-indigo-500/30 bg-white dark:bg-slate-950 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-950/80 p-4 md:p-6 shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                  <div className="shimmer-overlay shimmer-overlay-indigo opacity-50"></div>
                  <div className="relative z-10">
                    <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6 text-slate-900 dark:text-white">Spending Breakdown</h3>
                    <div className="h-48 md:h-64 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <defs>
                            <linearGradient id="gradHousing" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#60a5fa" />
                              <stop offset="100%" stopColor="#1d4ed8" />
                            </linearGradient>
                            <linearGradient id="gradFood" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#34d399" />
                              <stop offset="100%" stopColor="#047857" />
                            </linearGradient>
                            <linearGradient id="gradTransport" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#fbbf24" />
                              <stop offset="100%" stopColor="#b45309" />
                            </linearGradient>
                            <linearGradient id="gradEntertainment" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#a78bfa" />
                              <stop offset="100%" stopColor="#5b21b6" />
                            </linearGradient>
                            <linearGradient id="gradUtilities" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#f472b6" />
                              <stop offset="100%" stopColor="#be185d" />
                            </linearGradient>
                          </defs>
                          <Pie
                            data={dynamicExpensesData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth={2}
                          >
                            {dynamicExpensesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(99, 102, 241, 0.5)', borderRadius: '12px', backdropFilter: 'blur(10px)', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center mt-4">
                      {dynamicExpensesData.map((item, idx) => (
                        <div key={item.name} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <span className="w-3 h-3 rounded-full" style={{ background: `linear-gradient(135deg, ${item.color}, transparent)` }}></span>
                          <span>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-indigo-500/30 bg-white dark:bg-slate-950 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-950/80 p-4 md:p-6 shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                  <div className="shimmer-overlay shimmer-overlay-indigo opacity-50"></div>
                  <div className="relative z-10">
                    <h3 className="text-base md:text-lg font-semibold mb-4 md:mb-6 text-slate-900 dark:text-white">Weekly Activity</h3>
                    <div className="h-48 md:h-64 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dynamicBarData}>
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#818cf8" />
                              <stop offset="100%" stopColor="#3730a3" stopOpacity={0.8} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(val) => currency === 'AED' ? val + ' AED' : '$' + val} />
                          <Tooltip 
                            cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(99, 102, 241, 0.5)', borderRadius: '12px', color: '#fff' }}
                          />
                          <Bar dataKey="spent" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-indigo-500/30 bg-white dark:bg-slate-950 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-950/80 p-4 md:p-6 shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                <div className="shimmer-overlay shimmer-overlay-indigo opacity-30"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">Transaction History</h3>
                  </div>
                  
                  {/* Mobile View */}
                  <div className="md:hidden flex flex-col">
                    {txList.map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-slate-900 dark:text-white text-sm">{tx.description}</span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                            <span>{tx.date}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                            <span>{tx.category}</span>
                          </div>
                        </div>
                        <div className={`text-sm font-semibold ${tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                          {formatCurrency(tx.amount, currency, true)}
                        </div>
                      </div>
                    ))}
                    {txList.length === 0 && (
                      <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                        No transactions found. Upload a CSV statement to begin.
                      </div>
                    )}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] md:text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          <th className="pb-2 md:pb-3 font-medium">Date</th>
                          <th className="pb-2 md:pb-3 font-medium">Description</th>
                          <th className="pb-2 md:pb-3 font-medium">Category</th>
                          <th className="pb-2 md:pb-3 font-medium hidden sm:table-cell">Status</th>
                          <th className="pb-2 md:pb-3 font-medium text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-600 dark:text-slate-300">
                        {txList.map((tx) => (
                          <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                            <td className="py-2 md:py-4 text-xs md:text-sm opacity-80 whitespace-nowrap">{tx.date}</td>
                            <td className="py-2 md:py-4 text-sm md:text-base font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{tx.description}</td>
                            <td className="py-2 md:py-4">
                              <span className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[10px] md:text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {tx.category}
                              </span>
                            </td>
                            <td className="py-2 md:py-4 text-xs md:text-sm opacity-80 hidden sm:table-cell">{tx.status}</td>
                            <td className={`py-2 md:py-4 text-right text-sm md:text-base font-semibold whitespace-nowrap ${tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                              {formatCurrency(tx.amount, currency, true)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {txList.length === 0 && (
                      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                        No transactions found. Upload a CSV statement to begin.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[var(--color-background)]/90 backdrop-blur-xl border-t border-[var(--color-card-border)] pb-safe">
          <div className="flex justify-around items-center px-2 py-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <LayoutDashboard size={20} />
              <span className="text-[10px] font-medium">Home</span>
            </button>
            <button 
              onClick={() => setActiveTab('transactions')}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === 'transactions' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <WalletCards size={20} />
              <span className="text-[10px] font-medium">History</span>
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === 'analytics' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <ChartIcon size={20} />
              <span className="text-[10px] font-medium">Analytics</span>
            </button>
            <button 
              onClick={() => setActiveTab('ai')}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === 'ai' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <Bot size={20} />
              <span className="text-[10px] font-medium">Advisor</span>
            </button>
          </div>
        </nav>
      </main>
    </div>
  );
}

// Subcomponents
function NavItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium ${
        active 
          ? 'bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]' 
          : 'text-[var(--color-foreground)] opacity-70 hover:opacity-100 hover:bg-[var(--color-card-border)]/50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MetricCard({ title, amount, subtitle, icon, variant = 'indigo', subtitleColor = 'neutral' }) {
  const colorMap = {
    indigo: {
      cardGrad: 'bg-white dark:bg-slate-950 dark:from-indigo-900/40 dark:to-indigo-950/20 shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] border-slate-200 dark:border-indigo-500/50',
      iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
      iconText: 'text-indigo-600 dark:text-indigo-400',
      shimmer: 'shimmer-overlay-indigo',
      titleText: 'text-slate-500 dark:text-slate-400',
      amountText: 'text-slate-900 dark:text-white',
    },
    emerald: {
      cardGrad: 'bg-white dark:bg-slate-950 dark:from-emerald-900/40 dark:to-emerald-950/20 shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] border-slate-200 dark:border-emerald-500/50',
      iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
      iconText: 'text-emerald-600 dark:text-emerald-400',
      shimmer: 'shimmer-overlay-emerald',
      titleText: 'text-slate-500 dark:text-slate-400',
      amountText: 'text-slate-900 dark:text-white',
    },
    violet: {
      cardGrad: 'bg-white dark:bg-slate-950 dark:from-violet-900/40 dark:to-violet-950/20 shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] border-slate-200 dark:border-violet-500/50',
      iconBg: 'bg-violet-100 dark:bg-violet-500/20',
      iconText: 'text-violet-600 dark:text-violet-400',
      shimmer: 'shimmer-overlay-violet',
      titleText: 'text-slate-500 dark:text-slate-400',
      amountText: 'text-slate-900 dark:text-white',
    }
  };

  const stMap = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-slate-500 dark:text-slate-400'
  };

  const colors = colorMap[variant] || colorMap.indigo;

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${colors.cardGrad} dark:bg-gradient-to-br p-3 md:p-4 transition-all duration-200 hover:scale-[0.98] active:scale-95 cursor-pointer group`}>
      <div className={`shimmer-overlay ${colors.shimmer}`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2 md:mb-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-[10px] md:text-xs font-medium uppercase tracking-wider ${colors.titleText}`}>{title}</span>
            <span className="text-[9px] font-medium text-indigo-400/70 opacity-0 group-hover:opacity-100 transition-opacity">tap</span>
          </div>
          <div className={`flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-lg md:rounded-xl ${colors.iconBg} ${colors.iconText}`}>
            {icon}
          </div>
        </div>
        
        <div className={`mb-1 font-sans text-2xl md:text-3xl font-bold tracking-tight ${colors.amountText}`}>
          {amount}
        </div>
        
        <div className={`text-[10px] md:text-xs font-medium ${stMap[subtitleColor]}`}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}
