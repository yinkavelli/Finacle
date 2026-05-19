// budget-app/data.jsx — Personal coverage & budget data

// === Category palette (desaturated, premium — keeps the "colored dot" affordance) ===
const CATEGORIES = {
  housing:       { label: 'Housing',       color: '#6B7B8E', budget: 2400, spent: 2400 }, // Rent — fixed
  utilities:     { label: 'Utilities',     color: '#B17460', budget:  280, spent:  312 },
  groceries:     { label: 'Groceries',     color: '#5A8276', budget:  650, spent:  584 },
  dining:        { label: 'Dining',        color: '#C9A55A', budget:  400, spent:  612 },
  shopping:      { label: 'Shopping',      color: '#8A6E91', budget:  500, spent:  742 },
  transport:     { label: 'Transport',     color: '#9A7B3D', budget:  320, spent:  244 },
  subscriptions: { label: 'Subscriptions', color: '#A39477', budget:  180, spent:  189 },
  entertainment: { label: 'Entertainment', color: '#93823F', budget:  250, spent:  287 },
  health:        { label: 'Health',        color: '#7AA095', budget:  200, spent:   85 },
  savings:       { label: 'Savings',       color: '#D4B76A', budget:  800, spent:  800 },
  other:         { label: 'Other',         color: 'rgba(245,243,239,0.30)', budget: 120, spent: 95 },
};

const BUDGET_DATA = {
  user: {
    name: 'Maya Chen',
    firstName: 'Maya',
    avatar: 'MC',
    handle: '@maya.c',
    since: '2024',
  },
  // Current month
  current: {
    month: 'May 2026',
    salary: 8500.00,
    sideIncome: 420.00,
    incomeTotal: 8920.00,
    spendTotal: 6354.00,
    surplus: 2566.00,   // income - spend
    coveragePct: 71.2,  // spend / income
    healthScore: 'Healthy',
    daysLeft: 13,
    paydayIn: 13,
  },
  // 6-month trend (coverage % of income)
  history: [
    { m: 'Dec', income: 8500, spend: 7820, surplus: 680  },
    { m: 'Jan', income: 8500, spend: 7240, surplus: 1260 },
    { m: 'Feb', income: 8500, spend: 8120, surplus: 380  },
    { m: 'Mar', income: 8920, spend: 6980, surplus: 1940 },
    { m: 'Apr', income: 8920, spend: 7410, surplus: 1510 },
    { m: 'May', income: 8920, spend: 6354, surplus: 2566 },
  ],
  // Active categories this month (ordered by spend desc)
  categoriesOrder: [
    'housing','shopping','savings','dining','groceries','transport',
    'entertainment','utilities','health','subscriptions','other',
  ],

  // Transactions for the month (CSV-imported)
  transactions: [
    { id: 't1',  date: 'May 18', merchant: 'Trader Joe\'s',         amount: -84.20,  cat: 'groceries',     account: 'Chase ••4421' },
    { id: 't2',  date: 'May 18', merchant: 'Uber',                  amount: -22.40,  cat: 'transport',     account: 'Chase ••4421' },
    { id: 't3',  date: 'May 17', merchant: 'Netflix',               amount: -22.99,  cat: 'subscriptions', account: 'Chase ••4421', recurring: true },
    { id: 't4',  date: 'May 17', merchant: 'Bestia',                amount: -148.50, cat: 'dining',        account: 'Amex ••0042' },
    { id: 't5',  date: 'May 16', merchant: 'Aritzia',               amount: -284.00, cat: 'shopping',      account: 'Amex ••0042' },
    { id: 't6',  date: 'May 15', merchant: 'ConEd',                 amount: -142.18, cat: 'utilities',     account: 'Chase ••4421', recurring: true },
    { id: 't7',  date: 'May 15', merchant: 'Salary — Stripe',       amount:  8500.00, cat: 'income',       account: 'Chase ••4421' },
    { id: 't8',  date: 'May 14', merchant: 'Trader Joe\'s',         amount: -72.04,  cat: 'groceries',     account: 'Chase ••4421' },
    { id: 't9',  date: 'May 14', merchant: 'Spotify',               amount: -11.99,  cat: 'subscriptions', account: 'Chase ••4421', recurring: true },
    { id: 't10', date: 'May 13', merchant: 'Apple Store',           amount: -129.00, cat: 'shopping',      account: 'Amex ••0042' },
    { id: 't11', date: 'May 12', merchant: 'AMC Theaters',          amount: -42.00,  cat: 'entertainment', account: 'Chase ••4421' },
    { id: 't12', date: 'May 11', merchant: 'Lyft',                  amount: -18.20,  cat: 'transport',     account: 'Chase ••4421' },
    { id: 't13', date: 'May 11', merchant: 'Sweetgreen',            amount: -19.40,  cat: 'dining',        account: 'Amex ••0042' },
    { id: 't14', date: 'May 10', merchant: 'Equinox',               amount: -245.00, cat: 'health',        account: 'Chase ••4421', recurring: true },
    { id: 't15', date: 'May 10', merchant: 'Side gig — Webflow',    amount:   420.00, cat: 'income',       account: 'Chase ••4421' },
    { id: 't16', date: 'May 9',  merchant: 'Zara',                  amount: -188.50, cat: 'shopping',      account: 'Amex ••0042' },
    { id: 't17', date: 'May 8',  merchant: 'Whole Foods',           amount: -64.18,  cat: 'groceries',     account: 'Chase ••4421' },
    { id: 't18', date: 'May 8',  merchant: 'Verbier — flat 4',      amount: -2400.00, cat: 'housing',      account: 'Chase ••4421', recurring: true },
    { id: 't19', date: 'May 6',  merchant: 'Don Angie',             amount: -187.40, cat: 'dining',        account: 'Amex ••0042' },
    { id: 't20', date: 'May 5',  merchant: 'CVS Pharmacy',          amount: -38.20,  cat: 'health',        account: 'Chase ••4421' },
    { id: 't21', date: 'May 4',  merchant: 'NY Times',              amount: -17.00,  cat: 'subscriptions', account: 'Chase ••4421', recurring: true },
    { id: 't22', date: 'May 3',  merchant: 'Citi Bike',             amount: -19.95,  cat: 'transport',     account: 'Chase ••4421' },
    { id: 't23', date: 'May 2',  merchant: 'Vanguard — auto',       amount: -800.00, cat: 'savings',       account: 'Chase ••4421', recurring: true },
    { id: 't24', date: 'May 1',  merchant: 'Madewell',              amount: -156.80, cat: 'shopping',      account: 'Amex ••0042' },
  ],

  // Suggestion engine — programmatic insights
  suggestions: [
    {
      id: 's1',
      severity: 'cut',   // cut | optimise | praise
      title: 'Shopping is 48% over budget',
      detail: 'You\'ve spent $742 against a $500 budget. Pausing for the rest of May would reclaim $182 toward savings.',
      delta: -242, // overspend
      category: 'shopping',
      action: 'Pause for 13 days',
    },
    {
      id: 's2',
      severity: 'cut',
      title: 'Dining is trending up',
      detail: 'Three meals at sit-down restaurants this week — averaging $145. Two swaps to lunch saves ~$200/month.',
      delta: -212,
      category: 'dining',
      action: 'Set $400 hard cap',
    },
    {
      id: 's3',
      severity: 'optimise',
      title: 'Apple One bundle could replace 3 subs',
      detail: 'You hold Netflix, Spotify, and Apple TV+ separately. Apple One Premier ($37.95) replaces all three at a $20 saving.',
      delta: 240, // annualised save
      category: 'subscriptions',
      action: 'Review bundle',
    },
    {
      id: 's4',
      severity: 'praise',
      title: 'Savings on autopilot — 5th month',
      detail: '$800 to Vanguard executed on May 2. You\'re on pace for $9.6K by year-end at current rate.',
      delta: 800,
      category: 'savings',
      action: 'Increase to $900?',
    },
  ],

  // Saved categorisation rules
  rules: [
    { match: 'Trader Joe\'s', cat: 'groceries' },
    { match: 'Whole Foods', cat: 'groceries' },
    { match: 'Uber',     cat: 'transport' },
    { match: 'Lyft',     cat: 'transport' },
    { match: 'Netflix',  cat: 'subscriptions' },
    { match: 'Spotify',  cat: 'subscriptions' },
    { match: 'Vanguard', cat: 'savings' },
  ],

  // Bank accounts linked
  accounts: [
    { id: 'a1', label: 'Chase checking', last: '4421', balance: 12_840.10, kind: 'checking' },
    { id: 'a2', label: 'Amex Gold',      last: '0042', balance: -1_842.40, kind: 'credit'   },
    { id: 'a3', label: 'Vanguard taxable', last: '8810', balance: 38_240.85, kind: 'invest' },
    { id: 'a4', label: 'Marcus savings', last: '6019', balance: 24_180.00, kind: 'savings'  },
  ],

  // Chat assistant — preset prompts
  chatPresets: [
    'Where can I cut $300 next month?',
    'Am I on track to save $20K this year?',
    'What\'s growing fastest in my spend?',
    'How does May compare to my 6-mo average?',
  ],
};

// Helper: fmt
function bFmt(n, opts = {}) {
  const { sym = '$', sign = false, decimals = 2, thin = true } = opts;
  const abs = Math.abs(n);
  const parts = abs.toFixed(decimals).split('.');
  const sep = thin ? '\u2009' : ',';
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  const out = `${sym}${parts.join('.')}`;
  if (sign && n > 0) return `+ ${out}`;
  if (n < 0) return `– ${out}`;
  return out;
}

window.CATEGORIES = CATEGORIES;
window.BUDGET_DATA = BUDGET_DATA;
window.bFmt = bFmt;
