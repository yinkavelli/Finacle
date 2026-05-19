// data.jsx — Personal finance / budget app data
// CSV-imported, categorized, with monthly income & per-category budgets

// Day of month (mock — would come from real Date in production)
const TODAY = { day: 19, daysInMonth: 31, monthName: 'May', year: 2026 };

// Categories — restrained palette inside Axinity vocabulary
// (gold variations + 3 muted complementary tones)
const BG_CATS = [
  { id: 'housing',     label: 'Housing',       color: '#C9A55A', icon: 'home' },
  { id: 'groceries',   label: 'Groceries',     color: '#B89A5E', icon: 'cart' },
  { id: 'utilities',   label: 'Utilities',     color: '#7A8C6F', icon: 'bolt' },
  { id: 'transport',   label: 'Transport',     color: '#9A7B3D', icon: 'car' },
  { id: 'dining',      label: 'Dining',        color: '#D4B76A', icon: 'fork' },
  { id: 'shopping',    label: 'Shopping',      color: '#A89B7A', icon: 'bag' },
  { id: 'subs',        label: 'Subscriptions', color: '#7A6332', icon: 'repeat' },
  { id: 'entertain',   label: 'Entertainment', color: '#6B7344', icon: 'film' },
  { id: 'health',      label: 'Health',        color: '#8C5A4E', icon: 'heart' },
  { id: 'savings',     label: 'Savings',       color: '#5C6B7A', icon: 'vault' },
];

const BG_USER = {
  name: 'Khalid Al-Mansouri',
  firstName: 'Khalid',
  avatar: 'KM',
  email: 'k.almansouri@me.com',
  account: 'Mashreq • 4421',
  payday: '25th',
};

// Salary / income (monthly, net)
const BG_INCOME = {
  monthly: 14_500,        // net deposit
  annual: 174_000,        // gross
  payday: 25,             // day of month
  nextPayIn: 6,           // days
  source: 'Mashreq Bank · Salary',
};

// Per-category budgets vs spend (this month, day 19 of 31)
const BG_BUDGET = [
  { cat: 'housing',   budget: 3_200, spent: 3_200 },  // paid in full
  { cat: 'groceries', budget:   800, spent:   612 },
  { cat: 'utilities', budget:   420, spent:   389 },
  { cat: 'transport', budget:   500, spent:   480 },
  { cat: 'dining',    budget:   600, spent:   918 },  // OVER
  { cat: 'shopping',  budget:   400, spent:   626 },  // OVER
  { cat: 'subs',      budget:   200, spent:   182 },
  { cat: 'entertain', budget:   300, spent:   197 },
  { cat: 'health',    budget:   250, spent:    84 },
  { cat: 'savings',   budget: 2_000, spent: 2_000 },  // auto-saved
];

// Imported transactions (from a CSV bank statement)
const BG_TXNS = [
  // Today
  { id: 'b1', date: '2026-05-19', day: 'Today', when: 'Today, 14:22', merchant: 'Bu Qtair Seafood',    cat: 'dining',     amount: -148.00,  city: 'Jumeirah',     logo: 'B' },
  { id: 'b2', date: '2026-05-19', day: 'Today', when: 'Today, 09:30', merchant: 'Carrefour',           cat: 'groceries',  amount:  -84.20,  city: 'MOE',          logo: 'C' },
  // Yesterday
  { id: 'b3', date: '2026-05-18', day: 'Yesterday', when: 'Yesterday',  merchant: 'DEWA',              cat: 'utilities',  amount: -284.00,  city: 'Direct debit', logo: 'D' },
  { id: 'b4', date: '2026-05-18', day: 'Yesterday', when: 'Yesterday',  merchant: 'Careem',            cat: 'transport',  amount:  -42.50,  city: 'Ride',         logo: 'C' },
  { id: 'b5', date: '2026-05-18', day: 'Yesterday', when: 'Yesterday',  merchant: 'Netflix',           cat: 'subs',       amount:  -29.99,  city: 'Recurring',    logo: 'N' },
  // This week
  { id: 'b6', date: '2026-05-17', day: 'This week', when: 'Sat',        merchant: 'Zara',              cat: 'shopping',   amount: -284.00,  city: 'Dubai Mall',   logo: 'Z' },
  { id: 'b7', date: '2026-05-17', day: 'This week', when: 'Sat',        merchant: 'Reel Cinemas',      cat: 'entertain',  amount:  -94.00,  city: 'The Dubai Mall', logo: 'R' },
  { id: 'b8', date: '2026-05-16', day: 'This week', when: 'Fri',        merchant: 'Pizza Express',     cat: 'dining',     amount: -184.00,  city: 'JBR',          logo: 'P' },
  { id: 'b9', date: '2026-05-15', day: 'This week', when: 'Thu',        merchant: 'Spinneys',          cat: 'groceries',  amount: -122.40,  city: 'Marina',       logo: 'S' },
  { id: 'b10', date: '2026-05-15', day: 'This week', when: 'Thu',       merchant: 'Apple One',         cat: 'subs',       amount:  -32.99,  city: 'Recurring',    logo: 'A' },
  // Earlier
  { id: 'b11', date: '2026-05-13', day: 'Earlier', when: 'May 13',      merchant: 'Mashreq Salary',    cat: 'income',     amount: 14_500.00, city: 'Deposit',     logo: '↓' },
  { id: 'b12', date: '2026-05-12', day: 'Earlier', when: 'May 12',      merchant: 'Emaar Properties',  cat: 'housing',    amount: -3_200.00, city: 'Rent',        logo: 'E' },
  { id: 'b13', date: '2026-05-11', day: 'Earlier', when: 'May 11',      merchant: 'Auto Vault',        cat: 'savings',    amount: -2_000.00, city: 'Auto-save',   logo: '↑' },
  { id: 'b14', date: '2026-05-10', day: 'Earlier', when: 'May 10',      merchant: 'Salt',              cat: 'dining',     amount: -218.00,  city: 'JBR',          logo: 'S' },
  { id: 'b15', date: '2026-05-10', day: 'Earlier', when: 'May 10',      merchant: 'Etihad Fuel',       cat: 'transport',  amount:  -180.00, city: 'Sheikh Zayed', logo: 'E' },
  { id: 'b16', date: '2026-05-08', day: 'Earlier', when: 'May 8',       merchant: 'Spotify Family',    cat: 'subs',       amount:  -19.99,  city: 'Recurring',    logo: 'S' },
  { id: 'b17', date: '2026-05-08', day: 'Earlier', when: 'May 8',       merchant: 'Nike',              cat: 'shopping',   amount: -342.00,  city: 'MoE',          logo: 'N' },
  { id: 'b18', date: '2026-05-05', day: 'Earlier', when: 'May 5',       merchant: 'iCloud+',           cat: 'subs',       amount:   -9.99,  city: 'Recurring',    logo: 'i' },
  { id: 'b19', date: '2026-05-04', day: 'Earlier', when: 'May 4',       merchant: 'Aster Clinic',      cat: 'health',     amount:  -84.00,  city: 'Marina',       logo: 'A' },
  { id: 'b20', date: '2026-05-03', day: 'Earlier', when: 'May 3',       merchant: 'Du Internet',       cat: 'utilities',  amount: -105.00,  city: 'Monthly',      logo: 'D' },
];

// Recurring subscriptions (audit list)
const BG_SUBS = [
  { name: 'Netflix Premium', amount: 29.99, cat: 'subs', cadence: 'Monthly', lastUsed: '4 days ago', flag: null },
  { name: 'Apple One Family', amount: 32.99, cat: 'subs', cadence: 'Monthly', lastUsed: '1 day ago', flag: null },
  { name: 'Spotify Family', amount: 19.99, cat: 'subs', cadence: 'Monthly', lastUsed: '2 hrs ago', flag: null },
  { name: 'iCloud+ 2TB', amount: 9.99, cat: 'subs', cadence: 'Monthly', lastUsed: 'Active', flag: null },
  { name: 'Anghami Gold', amount: 14.99, cat: 'subs', cadence: 'Monthly', lastUsed: '3 months ago', flag: 'unused' },
  { name: 'Audible', amount: 24.99, cat: 'subs', cadence: 'Monthly', lastUsed: '2 months ago', flag: 'unused' },
  { name: 'Headspace', amount: 12.99, cat: 'subs', cadence: 'Monthly', lastUsed: '6 months ago', flag: 'unused' },
];

// 6-month coverage trend (income covered % of spending)
const BG_TREND = [
  { m: 'Dec', income: 14500, spent: 11_240, savings: 3_260 },
  { m: 'Jan', income: 14500, spent: 13_800, savings:   700 },
  { m: 'Feb', income: 14500, spent: 12_420, savings: 2_080 },
  { m: 'Mar', income: 14500, spent: 14_120, savings:   380 },
  { m: 'Apr', income: 14500, spent:  9_820, savings: 4_680 },
  { m: 'May', income: 14500, spent:  8_420, savings: 2_000 },  // in progress
];

// Helpers
function bgFmt(n, opts = {}) {
  const { sym = '$', decimals = 0, sign = false } = opts;
  const abs = Math.abs(n);
  const parts = abs.toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
  const out = `${sym}${parts.join('.')}`;
  if (sign && n > 0) return `+ ${out}`;
  if (n < 0) return `– ${out}`;
  return out;
}

function bgCat(id) {
  return BG_CATS.find(c => c.id === id) || { id, label: id, color: '#9A7B3D' };
}

// Derived: total spent this month, total income received, days remaining
function bgComputeMonth() {
  const txns = BG_TXNS;
  const spent = txns.filter(t => t.amount < 0 && t.cat !== 'savings').reduce((a, t) => a + Math.abs(t.amount), 0);
  const saved = txns.filter(t => t.cat === 'savings').reduce((a, t) => a + Math.abs(t.amount), 0);
  const income = BG_INCOME.monthly;
  const daysLeft = TODAY.daysInMonth - TODAY.day;
  const dailyBurnRate = spent / TODAY.day;
  const projectedSpend = dailyBurnRate * TODAY.daysInMonth;
  const remaining = income - spent - saved;
  const coverage = Math.round(((income - projectedSpend) / income) * 100);
  // Runway: days until current available equals zero at current burn
  const runway = Math.floor(remaining / dailyBurnRate);
  return { spent, saved, income, daysLeft, projectedSpend, remaining, coverage, runway, dailyBurnRate };
}

window.BG_CATS = BG_CATS;
window.BG_USER = BG_USER;
window.BG_INCOME = BG_INCOME;
window.BG_BUDGET = BG_BUDGET;
window.BG_TXNS = BG_TXNS;
window.BG_SUBS = BG_SUBS;
window.BG_TREND = BG_TREND;
window.TODAY = TODAY;
window.bgFmt = bgFmt;
window.bgCat = bgCat;
window.bgComputeMonth = bgComputeMonth;
