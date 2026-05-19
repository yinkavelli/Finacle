// data.jsx — sample data shared across all screens (Axinity Mobile)

const AX_DATA = {
  user: {
    firstName: 'Khalid',
    lastName: 'Al-Mansouri',
    handle: '@kalmansouri',
    avatar: 'KM',
    tier: 'Private',
    memberSince: '2019',
  },
  // Multi-currency: primary is USD
  balances: [
    { code: 'USD', symbol: '$', amount: 184_722.45, label: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', symbol: '€', amount: 42_180.10, label: 'Euro', flag: '🇪🇺' },
    { code: 'AED', symbol: 'د.إ', amount: 312_400.00, label: 'UAE Dirham', flag: '🇦🇪' },
    { code: 'GBP', symbol: '£', amount: 18_905.22, label: 'Pound Sterling', flag: '🇬🇧' },
  ],
  cards: [
    {
      id: 'c1', name: 'Reserve', type: 'Physical', last4: '4821',
      style: 'gold', // gold | obsidian | parchment
      number: '4821 •••• •••• 0042',
      expiry: '11 / 28',
      limit: 250_000,
      spent: 84_220,
      frozen: false,
    },
    {
      id: 'c2', name: 'Virtual', type: 'Virtual', last4: '9907',
      style: 'obsidian',
      number: '5189 •••• •••• 9907',
      expiry: '03 / 27',
      limit: 50_000,
      spent: 12_410,
      frozen: false,
    },
    {
      id: 'c3', name: 'Travel', type: 'Virtual', last4: '1140',
      style: 'parchment',
      number: '4012 •••• •••• 1140',
      expiry: '08 / 26',
      limit: 25_000,
      spent: 6_440,
      frozen: true,
    },
  ],
  // Transactions — last few weeks
  transactions: [
    { id: 't1', merchant: 'Emirates First Class', cat: 'Travel', amount: -8420.00, when: 'Today, 09:14', logo: 'EF', accent: '#C9A55A', city: 'Dubai → London' },
    { id: 't2', merchant: 'Nobu Dubai', cat: 'Dining', amount: -642.80, when: 'Today, 22:40', logo: 'N', accent: '#9A7B3D', city: 'DIFC' },
    { id: 't3', merchant: 'Bunker Settlement', cat: 'Transfer In', amount: 42_500.00, when: 'Yesterday', logo: '↓', accent: '#C9A55A', city: 'Lagos Port' },
    { id: 't4', merchant: 'Chaumet Paris', cat: 'Shopping', amount: -3_180.00, when: 'Yesterday', logo: 'C', accent: '#D4B76A', city: 'Place Vendôme' },
    { id: 't5', merchant: 'DIFC Parking', cat: 'Transport', amount: -42.00, when: 'Mon', logo: 'P', accent: '#9A7B3D', city: 'Dubai' },
    { id: 't6', merchant: 'Coutts & Co', cat: 'Transfer Out', amount: -25_000.00, when: 'Sun', logo: '↑', accent: '#9A7B3D', city: 'London' },
    { id: 't7', merchant: 'Apple One', cat: 'Subscription', amount: -32.99, when: 'Sat', logo: '', accent: '#9A7B3D', city: 'Recurring' },
    { id: 't8', merchant: 'Soneva Jani', cat: 'Travel', amount: -14_220.00, when: 'Fri', logo: 'S', accent: '#C9A55A', city: 'Maldives' },
    { id: 't9', merchant: 'Le Petit Maison', cat: 'Dining', amount: -489.50, when: 'Fri', logo: 'L', accent: '#9A7B3D', city: 'DIFC' },
    { id: 't10', merchant: 'Bentley Service', cat: 'Transport', amount: -2_840.00, when: 'Thu', logo: 'B', accent: '#9A7B3D', city: 'Dubai' },
  ],
  // Spending by category (this month)
  insights: {
    monthSpend: 41_822.30,
    monthChange: -8.2, // % vs last
    categories: [
      { name: 'Travel', amount: 22_640, pct: 54, color: '#C9A55A' },
      { name: 'Dining', amount: 6_182, pct: 15, color: '#D4B76A' },
      { name: 'Shopping', amount: 5_220, pct: 12, color: '#9A7B3D' },
      { name: 'Transport', amount: 3_960, pct: 9, color: '#7A6332' },
      { name: 'Other', amount: 3_820, pct: 10, color: 'rgba(245,243,239,0.18)' },
    ],
    // 7-day spend trend
    week: [820, 1240, 480, 2680, 1180, 4220, 920],
    // Insights highlights
    notes: [
      { eyebrow: 'Travel', body: 'Up 32% vs last month. Largest line — Emirates First, Dubai → London.' },
      { eyebrow: 'Recurring', body: '4 active subscriptions. $182 / mo.' },
    ],
  },
  vaults: [
    { id: 'v1', name: 'Yacht — Riva Aquariva', goal: 1_200_000, saved: 740_000, eta: 'Q3 2027', color: '#C9A55A' },
    { id: 'v2', name: 'Family office reserve', goal: 500_000, saved: 412_000, eta: 'Q1 2027', color: '#D4B76A' },
    { id: 'v3', name: 'Annual Hajj fund', goal: 80_000, saved: 64_500, eta: 'Mar 2026', color: '#9A7B3D' },
    { id: 'v4', name: 'Maldives villa', goal: 250_000, saved: 38_000, eta: 'Q4 2028', color: '#7A6332' },
  ],
  // Recipients for send-money
  recipients: [
    { id: 'r1', name: 'Layla Al-Mansouri', avatar: 'LM', handle: '@layla', note: 'Spouse' },
    { id: 'r2', name: 'Omar Al-Mansouri', avatar: 'OM', handle: '@omar.m', note: 'Son · Cambridge' },
    { id: 'r3', name: 'Coutts Private', avatar: 'CP', handle: 'IBAN •••• 4421', note: 'London' },
    { id: 'r4', name: 'Yusuf Adekunle', avatar: 'YA', handle: '@yusuf.lagos', note: 'Lagos · Partner' },
    { id: 'r5', name: 'Soneva Reservations', avatar: 'SR', handle: 'IBAN •••• 0810', note: 'Vendor' },
  ],
};

// helper: format currency with thin-space groupings for premium feel
function axFmt(n, opts = {}) {
  const { sym = '$', sign = false, decimals = 2 } = opts;
  const abs = Math.abs(n);
  const parts = abs.toFixed(decimals).split('.');
  // thin space grouping
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
  const out = `${sym}${parts.join('.')}`;
  if (sign && n > 0) return `+ ${out}`;
  if (n < 0) return `– ${out}`;
  return out;
}

window.AX_DATA = AX_DATA;
window.axFmt = axFmt;
