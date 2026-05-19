// screens-home.jsx — Personal finance dashboard
// Hero: month coverage health (income vs spend, days into month, runway, projected)

function BgHomeScreen({ onOpenTxn, onNav, onOpenChat }) {
  const m = bgComputeMonth();
  const remaining = m.income - m.spent - m.saved;
  const dailyAfford = remaining / m.daysLeft;

  // Health status
  let status = 'on-track';
  if (m.projectedSpend > m.income) status = 'over';
  else if (m.projectedSpend > m.income * 0.85) status = 'watch';

  // Top categories by spend this month
  const topCats = [...BG_BUDGET]
    .filter(b => b.spent > 0 && b.cat !== 'savings' && b.cat !== 'housing')
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 4);

  return (
    <div style={{ paddingTop: 60, paddingBottom: 96 }}>
      {/* ── Greeting bar ── */}
      <div style={{
        padding: '0 24px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            border: '1px solid var(--ax-border-gold)',
            background: 'linear-gradient(135deg, #1a1612 0%, #2a2218 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--ax-font-display)', fontSize: 14, color: 'var(--ax-gold)',
          }}>{BG_USER.avatar}</div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.28em', color: 'var(--ax-fg-muted)', fontWeight: 500, textTransform: 'uppercase' }}>
              {TODAY.monthName} {TODAY.day} · Day {TODAY.day} of {TODAY.daysInMonth}
            </div>
            <div style={{ fontFamily: 'var(--ax-font-display)', fontSize: 18, marginTop: 2, lineHeight: 1 }}>
              <span style={{ color: 'var(--ax-fg-muted)', fontStyle: 'italic', fontWeight: 300 }}>Hello,</span>{' '}
              <span style={{ color: 'var(--ax-fg)', fontWeight: 400 }}>{BG_USER.firstName}</span>
            </div>
          </div>
        </div>
        <button style={{
          width: 38, height: 38, border: '1px solid var(--ax-border)',
          background: 'transparent', color: 'var(--ax-fg)', borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          position: 'relative',
        }}>
          <Ax.Bell width="18" height="18" />
          <span style={{
            position: 'absolute', top: 8, right: 8, width: 6, height: 6,
            borderRadius: '50%', background: 'var(--ax-gold)',
            animation: 'ax-pulse-gold 2.4s infinite',
          }} />
        </button>
      </div>

      {/* ── HERO: Coverage card ── */}
      <div style={{ padding: '0 24px', marginBottom: 24 }}>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, padding: '28px 24px 24px',
          position: 'relative', overflow: 'hidden',
        }}>
          <AxHalftone position="top-right" size={180} opacity={0.38} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <AxEyebrow num={1} label="May · Coverage" />
            <BgHealthPill status={status} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <BgCoverageRing
              size={150}
              income={m.income}
              spent={m.spent}
              saved={m.saved}
              projected={m.projectedSpend}
              dayOfMonth={TODAY.day}
              daysInMonth={TODAY.daysInMonth}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.32em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase', fontWeight: 500 }}>
                Available
              </div>
              <div className="ax-num" style={{
                fontFamily: 'var(--ax-font-display)', fontSize: 38, fontWeight: 300,
                letterSpacing: '-0.02em', lineHeight: 1, marginTop: 4,
                color: remaining > 0 ? 'var(--ax-fg)' : '#D97757',
              }}>
                ${Math.round(remaining).toLocaleString('en-US').replace(/,/g, '\u2009')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ax-fg-muted)', marginTop: 6, lineHeight: 1.4 }}>
                of <span className="ax-num" style={{ color: 'var(--ax-fg)' }}>${m.income.toLocaleString('en-US')}</span> deposited
              </div>
              <div style={{ marginTop: 10, height: 1, background: 'var(--ax-border)' }} />
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span className="ax-num" style={{
                  fontFamily: 'var(--ax-font-display)', fontSize: 22, fontStyle: 'italic',
                  fontWeight: 400, color: 'var(--ax-gold)',
                }}>${Math.round(dailyAfford)}</span>
                <span style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase' }}>
                  / day for {m.daysLeft} days
                </span>
              </div>
            </div>
          </div>

          {/* Quick stats triplet */}
          <div style={{
            marginTop: 22, paddingTop: 18,
            borderTop: '1px solid var(--ax-border)',
            display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr', gap: 14, alignItems: 'center',
          }}>
            <StatBlock label="Spent" value={bgFmt(m.spent)} />
            <span style={{ height: 28, background: 'var(--ax-border)' }} />
            <StatBlock label="Saved" value={bgFmt(m.saved)} gold />
            <span style={{ height: 28, background: 'var(--ax-border)' }} />
            <StatBlock label="Pay in" value={`${BG_INCOME.nextPayIn}d`} />
          </div>
        </div>
      </div>

      {/* ── The headline narrative (editorial insight card) ── */}
      <div style={{ padding: '0 24px', marginBottom: 28 }}>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, padding: '18px 20px',
          position: 'relative', cursor: 'pointer',
        }} onClick={() => onNav('insights')}>
          <div style={{
            position: 'absolute', left: 0, top: 18, bottom: 18, width: 2,
            background: 'var(--ax-gold)',
          }} />
          <div style={{ fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-gold)', textTransform: 'uppercase', fontWeight: 500 }}>
            Observation · May
          </div>
          <div style={{
            fontFamily: 'var(--ax-font-display)', fontSize: 18, fontWeight: 300,
            marginTop: 6, lineHeight: 1.35, color: 'var(--ax-fg)',
          }}>
            Dining is <span style={{ fontStyle: 'italic', color: '#D97757' }}>53% over</span> budget. Trim it to plan and reclaim <span style={{ fontStyle: 'italic', color: 'var(--ax-gold)' }}>$318</span> before payday.
          </div>
          <div style={{
            marginTop: 10, fontSize: 11, letterSpacing: '0.18em',
            color: 'var(--ax-fg-muted)', textTransform: 'uppercase', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            See 4 cut suggestions <Ax.ChevR width="11" height="11" />
          </div>
        </div>
      </div>

      {/* ── Top categories this month ── */}
      <div style={{ padding: '0 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <AxEyebrow num={2} label="Where it's going" />
          <button onClick={() => onNav('budget')} style={{
            background: 'transparent', border: 0, color: 'var(--ax-fg-muted)',
            fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: 'var(--ax-font-body)', fontWeight: 500, padding: 0,
          }}>
            All budgets <Ax.ChevR width="12" height="12" />
          </button>
        </div>

        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, overflow: 'hidden',
        }}>
          {topCats.map((b, i, arr) => {
            const cat = bgCat(b.cat);
            const pct = (b.spent / b.budget) * 100;
            const over = b.spent > b.budget;
            return (
              <div key={b.cat} style={{
                padding: '14px 16px',
                borderBottom: i < arr.length - 1 ? '1px solid var(--ax-border)' : 'none',
                cursor: 'pointer',
                transition: 'background 220ms var(--ax-ease)',
              }}
              onClick={() => onNav('budget')}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,165,90,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <BgCatIcon cat={b.cat} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: 'var(--ax-fg)', fontWeight: 400 }}>{cat.label}</span>
                      <span className="ax-num" style={{
                        fontFamily: 'var(--ax-font-display)', fontSize: 15, fontWeight: 400,
                        color: over ? '#D97757' : 'var(--ax-fg)',
                      }}>
                        ${b.spent.toLocaleString('en-US')}
                        <span style={{ color: 'var(--ax-fg-faint)', fontSize: 11, marginLeft: 4 }}>
                          / {b.budget.toLocaleString('en-US')}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <BgBar pct={pct} color={cat.color} height={2} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recent transactions preview ── */}
      <div style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <AxEyebrow num={3} label="Recent activity" />
          <button onClick={() => onNav('txns')} style={{
            background: 'transparent', border: 0, color: 'var(--ax-fg-muted)',
            fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: 'var(--ax-font-body)', fontWeight: 500, padding: 0,
          }}>
            All · {BG_TXNS.length} <Ax.ChevR width="12" height="12" />
          </button>
        </div>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, overflow: 'hidden',
        }}>
          {BG_TXNS.slice(0, 4).map((t, i, arr) => (
            <BgTxnRow key={t.id} txn={t} isLast={i === arr.length - 1} onClick={() => onOpenTxn(t.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value, gold }) {
  return (
    <div>
      <div style={{ fontSize: 9, letterSpacing: '0.28em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase', fontWeight: 500 }}>
        {label}
      </div>
      <div className="ax-num" style={{
        fontFamily: 'var(--ax-font-display)', fontSize: 18, fontWeight: 400,
        marginTop: 4, color: gold ? 'var(--ax-gold)' : 'var(--ax-fg)',
        fontStyle: gold ? 'italic' : 'normal',
      }}>{value}</div>
    </div>
  );
}

// ─── Shared transaction row (used in home + txns) ───────────────────
function BgTxnRow({ txn, isLast, onClick }) {
  const cat = bgCat(txn.cat);
  const isIncome = txn.amount > 0;
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 16px', cursor: onClick ? 'pointer' : 'default',
      borderBottom: isLast ? 'none' : '1px solid var(--ax-border)',
      transition: 'background 220ms var(--ax-ease)',
    }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.background = 'rgba(201,165,90,0.04)'; }}
    onMouseLeave={e => { if (onClick) e.currentTarget.style.background = 'transparent'; }}>
      <BgCatIcon cat={txn.cat} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: 'var(--ax-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {txn.merchant}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <BgCatDot cat={txn.cat} size={5} />
          <span style={{ fontSize: 11, color: 'var(--ax-fg-muted)' }}>
            {cat.label} · {txn.city}
          </span>
        </div>
      </div>
      <div className="ax-num" style={{
        fontFamily: 'var(--ax-font-display)', fontSize: 15, fontWeight: 400,
        color: isIncome ? 'var(--ax-gold)' : 'var(--ax-fg)',
        whiteSpace: 'nowrap',
      }}>
        {bgFmt(txn.amount, { sign: true, decimals: 0 })}
      </div>
    </div>
  );
}

window.BgHomeScreen = BgHomeScreen;
window.BgTxnRow = BgTxnRow;
