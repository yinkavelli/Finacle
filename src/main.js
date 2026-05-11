const THEME = {
  light: {
    name: 'light', bg: '#F5F2EC', page: '#F5F2EC', surface: '#FFFFFF', sunken: '#EDEAE2',
    ink: '#14110E', ink2: '#5A554D', ink3: '#8A857B', line: 'rgba(20,17,14,0.07)',
    lineStrong: 'rgba(20,17,14,0.12)', chipBg: '#EFEBE3', pos: 'oklch(0.62 0.11 145)',
    neg: 'oklch(0.55 0.14 28)', posSoft: 'oklch(0.92 0.05 145)', negSoft: 'oklch(0.93 0.04 28)',
    accent: '#14110E', onAccent: '#F5F2EC', tabBarBg: 'rgba(255,255,255,0.85)',
  },
  dark: {
    name: 'dark', bg: '#0A0A0B', page: '#0A0A0B', surface: '#15151A', sunken: '#101015',
    ink: '#EDEAE3', ink2: '#9A968D', ink3: '#5C5950', line: 'rgba(237,234,227,0.08)',
    lineStrong: 'rgba(237,234,227,0.14)', chipBg: '#1E1E24', pos: 'oklch(0.78 0.13 145)',
    neg: 'oklch(0.72 0.14 28)', posSoft: 'oklch(0.32 0.06 145)', negSoft: 'oklch(0.30 0.06 28)',
    accent: '#EDEAE3', onAccent: '#0A0A0B', tabBarBg: 'rgba(21,21,26,0.85)',
  },
};

const CATS = [
  { key: 'Housing', amt: 1840.0, hue: 250, share: 0.36 }, { key: 'Food & Drink', amt: 612.4, hue: 30, share: 0.18 },
  { key: 'Transport', amt: 284.1, hue: 200, share: 0.09 }, { key: 'Subscriptions', amt: 198.0, hue: 320, share: 0.07 },
  { key: 'Shopping', amt: 421.55, hue: 8, share: 0.12 }, { key: 'Wellness', amt: 168.0, hue: 145, share: 0.05 },
  { key: 'Other', amt: 398.2, hue: 85, share: 0.13 },
];

const TX = [
  { day: 'Today', items: [
    { m: 'Blue Bottle', mono: 'BB', hue: 30, cat: 'Food & Drink', amt: -6.75, t: '8:42 AM' },
    { m: 'Lyft', mono: 'LY', hue: 320, cat: 'Transport', amt: -14.2, t: '8:10 AM' },
  ]},
  { day: 'Yesterday', items: [
    { m: 'Whole Foods', mono: 'WF', hue: 145, cat: 'Food & Drink', amt: -82.41, t: '6:18 PM' },
    { m: 'Spotify', mono: 'SP', hue: 145, cat: 'Subscriptions', amt: -11.99, t: '12:00 PM' },
    { m: 'Acme Payroll', mono: 'AP', hue: 145, cat: 'Income', amt: 4280.0, t: '9:01 AM', credit: true },
  ]},
  { day: 'Thu, May 7', items: [
    { m: 'Uniqlo', mono: 'UQ', hue: 8, cat: 'Shopping', amt: -64.3, t: '7:42 PM' },
    { m: 'Chevron', mono: 'CH', hue: 200, cat: 'Transport', amt: -52.1, t: '5:14 PM' },
    { m: 'Tartine Bakery', mono: 'TB', hue: 30, cat: 'Food & Drink', amt: -18.5, t: '10:24 AM' },
  ]},
];

const state = { themeName: 'dark', screen: 'home' };
const fmt = (n) => `${n < 0 ? '−' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtCompact = (n) => `$${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const categoryColor = (hue) => `oklch(0.7 0.1 ${hue})`;
const icon = (name, size = 20) => ({
  home: `<svg width="${size}" height="${size}" viewBox="0 0 22 22" fill="none"><path d="M3 10L11 3l8 7v8a1 1 0 01-1 1h-4v-6h-6v6H4a1 1 0 01-1-1v-8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  bars: `<svg width="${size}" height="${size}" viewBox="0 0 22 22" fill="none"><rect x="3" y="12" width="3.5" height="7" rx=".8" stroke="currentColor" stroke-width="1.5"/><rect x="9.25" y="7" width="3.5" height="12" rx=".8" stroke="currentColor" stroke-width="1.5"/><rect x="15.5" y="3" width="3.5" height="16" rx=".8" stroke="currentColor" stroke-width="1.5"/></svg>`,
  list: `<svg width="${size}" height="${size}" viewBox="0 0 22 22" fill="none"><path d="M3 6h16M3 11h16M3 16h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  user: `<svg width="${size}" height="${size}" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="3.5" stroke="currentColor" stroke-width="1.5"/><path d="M4 19c1.5-3.5 4.2-5 7-5s5.5 1.5 7 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  sun: `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none"><path d="M8 2v1m0 10v1M2 8h1m10 0h1M3.5 3.5l.7.7m7.6 7.6l.7.7M3.5 12.5l.7-.7m7.6-7.6l.7-.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="8" cy="8" r="2.5" stroke="currentColor" stroke-width="1.3"/></svg>`,
  moon: `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none"><path d="M13 10.7A5.8 5.8 0 015.3 3a5.8 5.8 0 107.7 7.7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`,
  bell: `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none"><path d="M4 6a4 4 0 118 0c0 4 1.5 4.5 1.5 4.5h-11S4 10 4 6zM6.7 13a1.6 1.6 0 002.6 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
  filter: `<svg width="${size}" height="${size}" viewBox="0 0 14 14" fill="none"><path d="M2 3h10M3.5 7h7M5 11h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  search: `<svg width="${size}" height="${size}" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.4"/><path d="M9.5 9.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  shield: `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none"><path d="M10 2l6 2v5c0 4-2.5 7-6 9-3.5-2-6-5-6-9V4l6-2z" stroke="currentColor" stroke-width="1.5"/><path d="M7 10l2 2 4-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  spark: `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none"><path d="M10 2l1.5 5L16 9l-4.5 2L10 16l-1.5-5L4 9l4.5-2L10 2z" stroke="currentColor" stroke-width="1.5"/><path d="M16 2v4M14 4h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  wallet: `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M14 10h3v3h-3a1.5 1.5 0 010-3zM5 5V4a2 2 0 012-2h7" stroke="currentColor" stroke-width="1.5"/></svg>`,
}[name]);

function render() {
  const t = THEME[state.themeName];
  const title = { home: 'Command center', insights: 'Spending intelligence', tx: 'Transaction ledger' }[state.screen];
  document.body.innerHTML = `<main class="app" data-theme="${state.themeName}" style="--page:${t.page};--ink:${t.ink}">
    <section class="hero-panel">
      <nav class="brand-row" aria-label="Product"><div class="brand-mark">F</div><div><p class="eyebrow">Finacle</p><h1>Premium money clarity for every account.</h1></div></nav>
      <p class="hero-copy">A refined personal finance and budgeting app that turns balances, budgets, and everyday transactions into calm, actionable decisions.</p>
      <div class="hero-actions"><a href="#demo" class="primary-cta">Explore demo</a><button class="ghost-cta" data-screen="insights">View insights</button></div>
      <div class="trust-grid" aria-label="Finacle highlights">${feature('shield', 'Bank-grade posture', 'Privacy-first account views and secure controls.')}${feature('spark', 'Premium budgeting', 'Elegant trends, category budgets, and merchant signals.')}${feature('wallet', 'All accounts', 'Checking, savings, and card activity in one place.')}</div>
    </section>
    <section class="showcase" id="demo" aria-label="Finacle app preview">
      <div class="showcase-toolbar"><div><p class="eyebrow">Live prototype</p><h2>${title}</h2></div><button class="theme-toggle" data-theme-toggle>${icon(state.themeName === 'dark' ? 'sun' : 'moon', 16)}${state.themeName === 'dark' ? 'Light' : 'Dark'}</button></div>
      <div class="device-shell" style="background:${t.bg}"><div class="phone" style="background:${t.page};color:${t.ink}">${statusBar(t)}${screen(t)}${tabBar(t)}</div></div>
    </section>
  </main>`;
  document.querySelectorAll('[data-screen]').forEach((btn) => btn.addEventListener('click', () => { state.screen = btn.dataset.screen; render(); }));
  document.querySelector('[data-theme-toggle]').addEventListener('click', () => { state.themeName = state.themeName === 'dark' ? 'light' : 'dark'; render(); });
}

const feature = (ic, title, text) => `<article class="feature-card"><div class="feature-icon">${icon(ic, 18)}</div><h3>${title}</h3><p>${text}</p></article>`;
const statusBar = (t) => `<div class="status-bar" style="color:${t.ink2}"><span>9:41</span><span class="status-pill" style="background:${t.ink};opacity:.16"></span></div>`;
const screen = (t) => state.screen === 'home' ? home(t) : state.screen === 'insights' ? insights(t) : transactions(t);
const dot = (c, size = 8) => `<span class="dot" style="width:${size}px;height:${size}px;background:${c}"></span>`;
const monogram = (x, t) => `<div class="monogram" style="background:oklch(${t.name === 'dark' ? 0.32 : 0.92} 0.04 ${x.hue});color:oklch(${t.name === 'dark' ? 0.85 : 0.35} 0.08 ${x.hue})">${x.mono}</div>`;
const card = (t, body, cls = '') => `<section class="card ${cls}" style="background:${t.surface};border-color:${t.line}">${body}</section>`;

function header(t, kicker, title, action = '') {
  return `<header class="screen-header"><div><p style="color:${t.ink3}">${kicker}</p><h2 style="color:${t.ink}">${title}</h2></div>${action}</header>`;
}

function home(t) {
  const spent = 3922.25, budget = 5400;
  return `<div class="screen-content home-screen">
    <div class="home-topline"><div class="mini-brand" style="background:${t.accent};color:${t.onAccent}">F</div><div><strong style="color:${t.ink}">Good morning, Alex</strong><span style="color:${t.ink3}">Tuesday · May 12</span></div><button class="icon-button" style="border-color:${t.lineStrong};color:${t.ink2}" aria-label="Notifications">${icon('bell', 16)}</button></div>
    <section class="balance-block"><p style="color:${t.ink3}">Net cash · all accounts</p><div class="balance-line"><span style="color:${t.ink}">$24,318</span><small style="color:${t.ink2}">.47</small></div><div class="variance-row"><b style="color:${t.pos};background:${t.posSoft}">↑ $612.40</b><span style="color:${t.ink3}">vs. last month</span></div></section>
    <section class="account-strip" aria-label="Accounts">${accounts(t)}</section>
    ${card(t, `<div class="card-top"><div><p style="color:${t.ink3}">May spending</p><h3 style="color:${t.ink}">$3,922<span style="color:${t.ink2}">.25</span></h3><small style="color:${t.ink3}">of $5,400 budget · 12 days left</small></div>${ring(spent / budget, t)}</div><div class="category-bars">${CATS.slice(0,4).map((c) => categoryBar(c,t)).join('')}</div>`, 'spend-card')}
    ${sectionTitle(t, 'Recent activity', 'See all')}
    <div class="recent-list">${TX[0].items.concat(TX[1].items.slice(0,1)).map((x) => txRow(x,t)).join('')}</div>
  </div>`;
}

function accounts(t) {
  return [
    { name: 'Checking', sub: 'Chase ·· 4421', amt: 8420.12, hue: 250 }, { name: 'Savings', sub: 'Ally ·· 9088', amt: 14982.35, hue: 145 }, { name: 'Credit', sub: 'Amex ·· 1003', amt: -1084, hue: 28 },
  ].map((a) => `<article class="account-card" style="background:${t.surface};border-color:${t.line}"><div>${dot(categoryColor(a.hue))}<span style="color:${t.ink2}">${a.name}</span></div><strong style="color:${t.ink}">${a.amt < 0 ? '−' : ''}$${Math.abs(a.amt).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong><small style="color:${t.ink3}">${a.sub}</small></article>`).join('');
}

function insights(t) {
  const months = [{m:'Dec',v:4120},{m:'Jan',v:4540},{m:'Feb',v:3890},{m:'Mar',v:5210},{m:'Apr',v:4310},{m:'May',v:3922}];
  const max = Math.max(...months.map((m) => m.v));
  return `<div class="screen-content insights-screen">${header(t, 'Insights', 'Where it goes')}
    <div class="segmented" style="background:${t.sunken}">${['Week','Month','6 Months','Year'].map((label,i) => `<button style="color:${i===2?t.ink:t.ink2};background:${i===2?t.surface:'transparent'}">${label}</button>`).join('')}</div>
    ${card(t, `<div class="card-top align-end"><div><p style="color:${t.ink3}">Avg monthly</p><h3 style="color:${t.ink}">$4,332</h3></div><b class="trend-badge" style="color:${t.neg};background:${t.negSoft}">↓ 9.5%</b></div><div class="bar-chart"><i style="bottom:${22 + (4332/max)*110}px;border-color:${t.lineStrong}"></i>${months.map((mo,i) => bar(mo, i===months.length-1, max, t)).join('')}</div>`)}
    ${card(t, `${categoryDonut(t)}<div class="donut-legend">${CATS.slice(0,5).map((c) => `<div>${dot(categoryColor(c.hue))}<span style="color:${t.ink}">${c.key}</span><b style="color:${t.ink2}">${Math.round(c.share*100)}%</b></div>`).join('')}</div>`, 'donut-card')}
    ${sectionTitle(t, 'Top merchants this month')}
    ${[{m:'Whole Foods',mono:'WF',hue:145,n:7,amt:412.3},{m:'Lyft',mono:'LY',hue:320,n:14,amt:184.2},{m:'Blue Bottle',mono:'BB',hue:30,n:11,amt:74.25}].map((x) => merchantRow(x,t)).join('')}
  </div>`;
}

function transactions(t) {
  const action = `<button class="icon-button" style="border-color:${t.lineStrong};color:${t.ink2}" aria-label="Filter">${icon('filter',16)}</button>`;
  return `<div class="screen-content tx-screen">${header(t, 'Activity', 'Everything', action)}
    <div class="search-box" style="background:${t.sunken};color:${t.ink3}">${icon('search',14)}Search merchant, category, amount</div>
    <div class="chips">${['All','Food','Transport','Shopping','Bills'].map((label,i) => `<button style="background:${i===0?t.accent:t.chipBg};color:${i===0?t.onAccent:t.ink2};border-color:${t.line}">${label}</button>`).join('')}</div>
    ${card(t, `${metric('This week','−$284.55',t)}${divider(t)}${metric('Income','+$4,280',t,t.pos)}${divider(t)}${metric('Tx','14',t)}`, 'summary-strip')}
    <div class="tx-groups">${TX.map((g) => `<section><h3 style="color:${t.ink3}">${g.day}</h3>${g.items.map((x) => txRow(x,t)).join('')}</section>`).join('')}</div>
  </div>`;
}

const sectionTitle = (t, label, action) => `<div class="section-title"><h3 style="color:${t.ink3}">${label}</h3>${action ? `<button style="color:${t.ink2}">${action} ›</button>` : ''}</div>`;
const metric = (label, value, t, color) => `<div><span style="color:${t.ink3}">${label}</span><strong style="color:${color || t.ink}">${value}</strong></div>`;
const divider = (t) => `<i class="divider" style="background:${t.line}"></i>`;

function ring(pct, t) {
  const r = 28, c = 2 * Math.PI * r;
  return `<svg class="ring" width="72" height="72" viewBox="0 0 72 72" aria-label="${Math.round(pct*100)} percent of budget used"><circle cx="36" cy="36" r="${r}" stroke="${t.sunken}" stroke-width="6" fill="none"/><circle cx="36" cy="36" r="${r}" stroke="${t.accent}" stroke-width="6" fill="none" stroke-dasharray="${c*pct} ${c}" stroke-linecap="round" transform="rotate(-90 36 36)"/><text x="36" y="40" text-anchor="middle" style="fill:${t.ink}">${Math.round(pct*100)}%</text></svg>`;
}

function categoryBar(cat, t) {
  return `<div class="category-bar"><div>${dot(categoryColor(cat.hue))}<span style="color:${t.ink}">${cat.key}</span></div><div class="track" style="background:${t.sunken}"><i style="width:${(cat.share/0.36)*100}%;background:${categoryColor(cat.hue)}"></i></div><strong style="color:${t.ink2}">${fmtCompact(cat.amt)}</strong></div>`;
}

function bar(mo, active, max, t) {
  return `<div class="bar-wrap"><div class="bar" style="height:${(mo.v/max)*110}px;background:${active?t.accent:t.sunken};border-color:${t.line}">${active ? `<span style="color:${t.ink}">$3.9k</span>` : ''}</div><small style="color:${active?t.ink:t.ink3}">${mo.m}</small></div>`;
}

function categoryDonut(t) {
  const size = 116, r = 46, c = 2 * Math.PI * r;
  let off = 0;
  const segs = CATS.map((cat) => { const seg = { ...cat, off }; off += cat.share; return seg; });
  return `<svg class="category-donut" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="58" cy="58" r="${r}" stroke="${t.sunken}" stroke-width="14" fill="none"/>${segs.map((s) => `<circle cx="58" cy="58" r="${r}" stroke="${categoryColor(s.hue)}" stroke-width="14" fill="none" stroke-dasharray="${c*s.share-1.5} ${c}" stroke-dashoffset="${-c*s.off}" transform="rotate(-90 58 58)"/>`).join('')}<text x="58" y="56" text-anchor="middle" style="fill:${t.ink}">$3.9k</text><text x="58" y="72" text-anchor="middle" class="donut-label" style="fill:${t.ink3}">SPENT</text></svg>`;
}

function txRow(x, t) {
  return `<article class="tx-row" style="border-color:${t.line}">${monogram(x,t)}<div><strong style="color:${t.ink}">${x.m}</strong><span style="color:${t.ink3}">${x.cat} · ${x.t}</span></div><b style="color:${x.credit ? t.pos : t.ink}">${x.credit ? '+' : ''}${fmt(x.amt)}</b></article>`;
}

function merchantRow(x, t) {
  return `<article class="tx-row" style="border-color:${t.line}">${monogram(x,t)}<div><strong style="color:${t.ink}">${x.m}</strong><span style="color:${t.ink3}">${x.n} visits</span></div><b style="color:${t.ink}">−$${x.amt.toFixed(2)}</b></article>`;
}

function tabBar(t) {
  const items = [{ k: 'home', label: 'Home', iconName: 'home' }, { k: 'insights', label: 'Insights', iconName: 'bars' }, { k: 'tx', label: 'Activity', iconName: 'list' }, { k: 'me', label: 'You', iconName: 'user' }];
  return `<nav class="tab-bar" style="background:${t.tabBarBg};border-color:${t.line}" aria-label="App tabs">${items.map((it) => `<button ${it.k !== 'me' ? `data-screen="${it.k}"` : ''} style="color:${it.k === state.screen ? t.ink : t.ink3}">${icon(it.iconName, 21)}<span>${it.label}</span></button>`).join('')}</nav>`;
}

render();
