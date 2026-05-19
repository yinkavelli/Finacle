// screens-budget.jsx — Per-category budgets with reallocation mode

function BgBudgetScreen() {
  const [budgets, setBudgets] = React.useState(BG_BUDGET);
  const [reallocateMode, setReallocateMode] = React.useState(false);
  const [openCat, setOpenCat] = React.useState(null);

  const totalBudget = budgets.reduce((a, b) => a + b.budget, 0);
  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);
  const totalAvailable = totalBudget - totalSpent;
  const overBudgetCats = budgets.filter(b => b.spent > b.budget).length;

  const adjustBudget = (cat, delta) => {
    setBudgets(prev => {
      // Find the cat, adjust, then balance against another
      const idx = prev.findIndex(b => b.cat === cat);
      const next = [...prev];
      const newAmount = Math.max(0, next[idx].budget + delta);
      const actualDelta = newAmount - next[idx].budget;
      next[idx] = { ...next[idx], budget: newAmount };
      // Pull from "savings" pot
      const sIdx = next.findIndex(b => b.cat === 'savings');
      if (sIdx !== -1 && sIdx !== idx) {
        next[sIdx] = { ...next[sIdx], budget: Math.max(0, next[sIdx].budget - actualDelta) };
      }
      return next;
    });
  };

  const openCatData = openCat ? budgets.find(b => b.cat === openCat) : null;

  return (
    <div style={{ paddingTop: 60, paddingBottom: 96, position: 'relative' }}>
      <div style={{ padding: '0 24px', marginBottom: 22 }}>
        <AxScreenHeader
          num={3}
          eyebrow="Budget · May"
          title="A plan,"
          italic="examined."
        />
      </div>

      {/* Summary card */}
      <div style={{ padding: '0 24px', marginBottom: 18 }}>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, padding: '20px 22px',
          position: 'relative', overflow: 'hidden',
        }}>
          <AxHalftone position="top-right" size={140} opacity={0.3} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <AxEyebrow label="Available to plan" />
            {overBudgetCats > 0 && (
              <BgHealthPill status="over" />
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="ax-num" style={{
              fontFamily: 'var(--ax-font-display)', fontSize: 44, fontWeight: 300,
              letterSpacing: '-0.02em', lineHeight: 1,
              color: totalAvailable > 0 ? 'var(--ax-fg)' : '#D97757',
            }}>
              ${Math.abs(totalAvailable).toLocaleString('en-US').replace(/,/g, '\u2009')}
            </span>
            <span style={{ fontSize: 12, color: 'var(--ax-fg-muted)' }}>
              of <span className="ax-num" style={{ color: 'var(--ax-fg)' }}>${totalBudget.toLocaleString('en-US')}</span>
            </span>
          </div>
          {/* Stacked bar across all categories */}
          <div style={{
            marginTop: 16, height: 6, borderRadius: 2,
            background: 'var(--ax-border)', overflow: 'hidden', display: 'flex',
          }}>
            {budgets.map(b => {
              const cat = bgCat(b.cat);
              return (
                <div key={b.cat} style={{
                  width: `${(b.budget / totalBudget) * 100}%`,
                  background: cat.color, height: '100%',
                  transition: 'width 600ms var(--ax-ease)',
                  position: 'relative',
                }}>
                  {/* Spent overlay (darker tint) */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${Math.min(100, (b.spent / b.budget) * 100)}%`,
                    background: 'rgba(0,0,0,0.45)',
                  }} />
                </div>
              );
            })}
          </div>
          <div style={{
            marginTop: 10, fontSize: 11, color: 'var(--ax-fg-muted)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 6, height: 6, background: 'rgba(0,0,0,0.5)', borderRadius: 1 }} />
            Spent ${totalSpent.toLocaleString('en-US')}
            <span style={{ margin: '0 6px', color: 'var(--ax-fg-faint)' }}>·</span>
            <span style={{ width: 6, height: 6, background: 'var(--ax-gold)', borderRadius: 1 }} />
            Remaining ${Math.max(0, totalBudget - totalSpent).toLocaleString('en-US')}
          </div>
        </div>
      </div>

      {/* Reallocate toggle */}
      <div style={{ padding: '0 24px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <AxEyebrow label={reallocateMode ? 'Tap +/– to shift' : 'Categories'} />
        <button onClick={() => setReallocateMode(s => !s)} style={{
          padding: '6px 12px', borderRadius: 2,
          background: reallocateMode ? 'var(--ax-gold)' : 'transparent',
          border: `1px solid ${reallocateMode ? 'var(--ax-gold)' : 'var(--ax-border-gold)'}`,
          color: reallocateMode ? 'var(--ax-midnight)' : 'var(--ax-gold)',
          fontFamily: 'var(--ax-font-body)', fontSize: 10,
          letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
          transition: 'all 220ms var(--ax-ease)',
        }}>
          <Ax.Swap width="11" height="11" />
          {reallocateMode ? 'Done' : 'Reallocate'}
        </button>
      </div>

      {/* Budget rows */}
      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {budgets.map(b => (
          <BudgetRow key={b.cat} budget={b}
            reallocateMode={reallocateMode}
            onAdjust={(d) => adjustBudget(b.cat, d)}
            onOpen={() => setOpenCat(b.cat)}
          />
        ))}
      </div>

      {openCatData && <BudgetCatSheet budget={openCatData} onClose={() => setOpenCat(null)} />}
    </div>
  );
}

function BudgetRow({ budget, reallocateMode, onAdjust, onOpen }) {
  const cat = bgCat(budget.cat);
  const pct = (budget.spent / budget.budget) * 100;
  const over = budget.spent > budget.budget;
  const available = budget.budget - budget.spent;

  return (
    <div style={{
      background: 'var(--ax-midnight)',
      border: '1px solid var(--ax-border)',
      borderRadius: 4, padding: '14px 16px',
      transition: 'all 220ms var(--ax-ease)',
      cursor: reallocateMode ? 'default' : 'pointer',
    }}
    onClick={() => { if (!reallocateMode) onOpen(); }}
    onMouseEnter={e => { if (!reallocateMode) e.currentTarget.style.borderColor = 'var(--ax-border-gold-soft)'; }}
    onMouseLeave={e => { if (!reallocateMode) e.currentTarget.style.borderColor = 'var(--ax-border)'; }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <BgCatIcon cat={budget.cat} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: 'var(--ax-fg)', fontWeight: 400 }}>{cat.label}</div>
          <div className="ax-num" style={{
            fontSize: 11, color: 'var(--ax-fg-muted)', marginTop: 2,
            fontVariantNumeric: 'tabular-nums',
          }}>
            <span style={{ color: over ? '#D97757' : 'var(--ax-fg-muted)' }}>
              ${budget.spent.toLocaleString('en-US')}
            </span>
            {' '}/ ${budget.budget.toLocaleString('en-US')}
            {over && <span style={{ color: '#D97757', marginLeft: 6 }}>· {bgFmt(budget.spent - budget.budget)} over</span>}
          </div>
        </div>

        {!reallocateMode && (
          <div className="ax-num" style={{
            fontFamily: 'var(--ax-font-display)',
            fontSize: 18, fontWeight: 400,
            color: over ? '#D97757' : 'var(--ax-fg)',
            fontStyle: over ? 'italic' : 'normal',
            textAlign: 'right',
          }}>
            {available >= 0 ? '$' + Math.round(available).toLocaleString('en-US') : '–$' + Math.round(Math.abs(available)).toLocaleString('en-US')}
            <div style={{
              fontFamily: 'var(--ax-font-body)', fontSize: 8,
              letterSpacing: '0.28em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase', fontWeight: 500,
              marginTop: 2,
            }}>{over ? 'Over' : 'Left'}</div>
          </div>
        )}

        {reallocateMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RealoBtn label="–" onClick={() => onAdjust(-50)} />
            <span className="ax-num" style={{
              fontFamily: 'var(--ax-font-display)', fontSize: 18,
              minWidth: 70, textAlign: 'center',
            }}>${budget.budget.toLocaleString('en-US')}</span>
            <RealoBtn label="+" onClick={() => onAdjust(50)} />
          </div>
        )}
      </div>
      <BgBar pct={pct} color={cat.color} height={3} />
    </div>
  );
}

function RealoBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 30, height: 30, borderRadius: 4,
      background: 'var(--ax-card)', border: '1px solid var(--ax-border-gold-soft)',
      color: 'var(--ax-gold)', cursor: 'pointer',
      fontFamily: 'var(--ax-font-display)', fontSize: 18, fontWeight: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 180ms var(--ax-ease)',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'var(--ax-gold)'; e.currentTarget.style.color = 'var(--ax-midnight)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'var(--ax-card)'; e.currentTarget.style.color = 'var(--ax-gold)'; }}>
      {label}
    </button>
  );
}

// ─── Drill-in sheet for a single category ───────────────────────────
function BudgetCatSheet({ budget, onClose }) {
  const cat = bgCat(budget.cat);
  const pct = (budget.spent / budget.budget) * 100;
  const over = budget.spent > budget.budget;
  const txns = BG_TXNS.filter(t => t.cat === budget.cat);

  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
        zIndex: 30, animation: 'ax-fade-up 220ms var(--ax-ease)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 31,
        background: 'var(--ax-midnight)',
        border: '1px solid var(--ax-border-gold-soft)',
        borderRadius: '12px 12px 0 0',
        padding: '20px 24px 40px',
        animation: 'ax-slide-up 320ms var(--ax-ease)',
        maxHeight: '90%', overflowY: 'auto',
      }} className="no-scrollbar">
        <div style={{
          width: 40, height: 3, background: 'var(--ax-border-strong)',
          borderRadius: 2, margin: '0 auto 24px',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <BgCatIcon cat={budget.cat} size={60} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.32em', color: cat.color, textTransform: 'uppercase', fontWeight: 500 }}>
              Category
            </div>
            <h3 style={{
              fontFamily: 'var(--ax-font-display)', fontSize: 26, fontWeight: 300,
              margin: '4px 0 0', letterSpacing: '-0.01em',
            }}>{cat.label}</h3>
          </div>
        </div>

        {/* Big ring */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <div style={{ position: 'relative', width: 180, height: 180 }}>
            <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="90" cy="90" r="76" fill="none" stroke="rgba(245,243,239,0.08)" strokeWidth="6"/>
              <circle cx="90" cy="90" r="76" fill="none"
                stroke={over ? '#D97757' : cat.color} strokeWidth="6"
                strokeDasharray={`${(Math.min(pct, 100)/100) * 477} 477`} strokeLinecap="round" />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 9, letterSpacing: '0.32em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase', fontWeight: 500 }}>
                Spent
              </div>
              <div className="ax-num" style={{
                fontFamily: 'var(--ax-font-display)', fontSize: 30, fontWeight: 300,
                color: over ? '#D97757' : 'var(--ax-fg)', letterSpacing: '-0.02em',
              }}>${budget.spent.toLocaleString('en-US')}</div>
              <div style={{ fontSize: 11, color: 'var(--ax-fg-muted)', marginTop: 4 }}>
                of <span style={{ color: 'var(--ax-fg)' }} className="ax-num">${budget.budget.toLocaleString('en-US')}</span>
              </div>
              <div style={{ fontFamily: 'var(--ax-font-display)', fontSize: 14, fontStyle: 'italic', color: over ? '#D97757' : cat.color, marginTop: 4 }}>
                {pct.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Detail rows */}
        <div style={{
          background: 'var(--ax-card)',
          border: '1px solid var(--ax-border)', borderRadius: 4,
          overflow: 'hidden', marginBottom: 18,
        }}>
          <BgDetailRow label="Transactions" value={`${txns.length}`} />
          <BgDetailRow label="Avg / txn" value={txns.length ? bgFmt(-txns.reduce((a,t) => a + Math.abs(t.amount), 0) / txns.length) : '—'} />
          <BgDetailRow label="vs Apr"
            value={over ? '+18%' : '–6%'}
            valueColor={over ? '#D97757' : 'var(--ax-gold)'} isLast />
        </div>

        {txns.length > 0 && (
          <>
            <div style={{
              fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-fg-muted)',
              textTransform: 'uppercase', fontWeight: 500, marginBottom: 10,
            }}>This month</div>
            <div style={{
              background: 'var(--ax-card)',
              border: '1px solid var(--ax-border)', borderRadius: 4,
              overflow: 'hidden', marginBottom: 20,
            }}>
              {txns.map((t, i) => (
                <BgTxnRow key={t.id} txn={t} isLast={i === txns.length - 1} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

window.BgBudgetScreen = BgBudgetScreen;
