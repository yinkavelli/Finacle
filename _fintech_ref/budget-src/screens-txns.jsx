// screens-txns.jsx — Transactions list (CSV-imported) with category filter + edit sheet

function BgTxnsScreen({ openTxnId, onOpenTxn, onCloseTxn }) {
  const [filter, setFilter] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [txns, setTxns] = React.useState(BG_TXNS);

  let visible = txns;
  if (filter !== 'all') visible = visible.filter(t => t.cat === filter);
  if (query) {
    const q = query.toLowerCase();
    visible = visible.filter(t => t.merchant.toLowerCase().includes(q));
  }

  // Group by day label
  const groups = {};
  visible.forEach(t => {
    if (!groups[t.day]) groups[t.day] = [];
    groups[t.day].push(t);
  });

  // Totals for filtered
  const totalIn = visible.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const totalOut = visible.filter(t => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);

  const openTxn = openTxnId ? txns.find(t => t.id === openTxnId) : null;

  const updateCategory = (id, newCat) => {
    setTxns(prev => prev.map(t => t.id === id ? { ...t, cat: newCat } : t));
  };

  return (
    <div style={{ paddingTop: 60, paddingBottom: 96, position: 'relative' }}>
      <div style={{ padding: '0 24px', marginBottom: 22 }}>
        <AxScreenHeader
          num={2}
          eyebrow="Transactions"
          title="An imported"
          italic="ledger."
        />
      </div>

      {/* Summary card */}
      <div style={{ padding: '0 24px', marginBottom: 18 }}>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, padding: 16,
          display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr', gap: 12, alignItems: 'center',
        }}>
          <SummaryCell label={`${visible.length} txns`} value="May" />
          <span style={{ height: 28, background: 'var(--ax-border)' }} />
          <SummaryCell label="In" value={bgFmt(totalIn)} gold />
          <span style={{ height: 28, background: 'var(--ax-border)' }} />
          <SummaryCell label="Out" value={bgFmt(-totalOut)} />
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '0 24px', marginBottom: 14, display: 'flex', gap: 8 }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)', borderRadius: 4,
        }}>
          <Ax.Search width="14" height="14" style={{ color: 'var(--ax-fg-muted)' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search merchants…"
            style={{
              flex: 1, background: 'transparent', border: 0, outline: 'none',
              color: 'var(--ax-fg)', fontFamily: 'var(--ax-font-body)', fontSize: 13,
            }} />
        </div>
        <button style={{
          width: 44, background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)', borderRadius: 4, cursor: 'pointer',
          color: 'var(--ax-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Ax.Filter width="16" height="16" />
        </button>
      </div>

      {/* Category filter chips */}
      <div style={{
        padding: '0 24px', marginBottom: 16, display: 'flex', gap: 6,
        overflowX: 'auto',
      }} className="no-scrollbar">
        <CatChip label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
        {BG_CATS.map(c => (
          <CatChip key={c.id} label={c.label} catColor={c.color}
            active={filter === c.id} onClick={() => setFilter(c.id)} />
        ))}
      </div>

      {/* Grouped list */}
      <div style={{ padding: '0 24px' }}>
        {Object.keys(groups).length === 0 && (
          <div style={{
            padding: '40px 20px', textAlign: 'center',
            border: '1px dashed var(--ax-border)', borderRadius: 4,
            color: 'var(--ax-fg-muted)', fontSize: 13,
          }}>
            No transactions match.
          </div>
        )}
        {Object.entries(groups).map(([day, items]) => (
          <div key={day} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, padding: '0 4px' }}>
              <span style={{
                fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-fg-muted)',
                textTransform: 'uppercase', fontWeight: 500,
              }}>{day}</span>
              <span style={{ flex: 1, height: 1, background: 'var(--ax-border)' }} />
              <span className="ax-num" style={{
                fontSize: 11, color: 'var(--ax-fg-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {items.length} · ${items.reduce((a, t) => a + Math.abs(t.amount), 0).toLocaleString('en-US')}
              </span>
            </div>
            <div style={{
              background: 'var(--ax-midnight)',
              border: '1px solid var(--ax-border)',
              borderRadius: 4, overflow: 'hidden',
            }}>
              {items.map((t, i) => (
                <BgTxnRow key={t.id} txn={t} isLast={i === items.length - 1} onClick={() => onOpenTxn(t.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail sheet */}
      {openTxn && <BgTxnSheet txn={openTxn} onClose={onCloseTxn} onChangeCat={(newCat) => updateCategory(openTxn.id, newCat)} />}
    </div>
  );
}

function SummaryCell({ label, value, gold }) {
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

function CatChip({ label, active, onClick, catColor }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0,
      padding: '6px 12px', borderRadius: 2,
      background: active ? 'var(--ax-gold)' : 'transparent',
      border: `1px solid ${active ? 'var(--ax-gold)' : 'var(--ax-border-strong)'}`,
      color: active ? 'var(--ax-midnight)' : 'var(--ax-fg-muted)',
      fontFamily: 'var(--ax-font-body)', fontSize: 10,
      letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
      cursor: 'pointer', transition: 'all 220ms var(--ax-ease)',
      display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
      {catColor && <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? 'var(--ax-midnight)' : catColor }} />}
      {label}
    </button>
  );
}

// ─── Transaction detail sheet with category picker ──────────────────
function BgTxnSheet({ txn, onClose, onChangeCat }) {
  const [editing, setEditing] = React.useState(false);
  const cat = bgCat(txn.cat);
  const isIncome = txn.amount > 0;

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
        maxHeight: '88%', overflowY: 'auto',
      }} className="no-scrollbar">
        <div style={{
          width: 40, height: 3, background: 'var(--ax-border-strong)',
          borderRadius: 2, margin: '0 auto 22px',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 22 }}>
          <BgCatIcon cat={txn.cat} size={64} />
          <div style={{ fontSize: 10, letterSpacing: '0.32em', color: cat.color, textTransform: 'uppercase', fontWeight: 500, marginTop: 14 }}>
            {cat.label}
          </div>
          <h3 style={{
            fontFamily: 'var(--ax-font-display)', fontSize: 22, fontWeight: 300,
            margin: '6px 0 0', letterSpacing: '-0.01em', textAlign: 'center',
          }}>{txn.merchant}</h3>
          <div className="ax-num" style={{
            fontFamily: 'var(--ax-font-display)', fontSize: 42, fontWeight: 300,
            color: isIncome ? 'var(--ax-gold)' : 'var(--ax-fg)',
            margin: '12px 0 6px', letterSpacing: '-0.02em',
          }}>
            {bgFmt(txn.amount, { sign: true })}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ax-fg-muted)' }}>
            {txn.when} · {txn.city}
          </div>
        </div>

        {/* Category picker (collapsed → expanded) */}
        <div style={{
          background: 'var(--ax-card)',
          border: '1px solid var(--ax-border)', borderRadius: 4,
          marginBottom: 12, overflow: 'hidden',
        }}>
          <div onClick={() => setEditing(s => !s)} style={{
            padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer',
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase', fontWeight: 500 }}>
              Category
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BgCatDot cat={txn.cat} size={8} />
              <span style={{ fontFamily: 'var(--ax-font-display)', fontSize: 15, color: 'var(--ax-fg)' }}>
                {cat.label}
              </span>
              <span style={{ fontSize: 10, color: 'var(--ax-gold)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, marginLeft: 6 }}>
                {editing ? 'Done' : 'Edit'}
              </span>
            </div>
          </div>
          {editing && (
            <div style={{
              padding: '4px 12px 14px',
              borderTop: '1px solid var(--ax-border)',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4,
              animation: 'ax-fade-in 220ms var(--ax-ease)',
            }}>
              {BG_CATS.filter(c => c.id !== 'savings').map(c => (
                <button key={c.id} onClick={() => { onChangeCat(c.id); setEditing(false); }}
                  style={{
                    padding: '10px 12px',
                    background: c.id === txn.cat ? 'rgba(201,165,90,0.10)' : 'transparent',
                    border: `1px solid ${c.id === txn.cat ? 'var(--ax-gold)' : 'var(--ax-border)'}`,
                    borderRadius: 2,
                    color: c.id === txn.cat ? c.color : 'var(--ax-fg)',
                    fontFamily: 'var(--ax-font-body)', fontSize: 12,
                    cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'all 180ms var(--ax-ease)',
                  }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{
          background: 'var(--ax-card)',
          border: '1px solid var(--ax-border)', borderRadius: 4,
          overflow: 'hidden', marginBottom: 16,
        }}>
          <BgDetailRow label="Account" value={BG_USER.account} />
          <BgDetailRow label="Date" value={txn.date} mono />
          <BgDetailRow label="Reference" value={txn.id.toUpperCase() + '-' + Math.floor(Math.random()*9999)} mono isLast />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <SheetAction icon={Ax.Spark} label="Split" />
          <SheetAction icon={Ax.Filter} label="Rule" />
          <SheetAction icon={Ax.Share} label="Export" />
        </div>
      </div>
    </>
  );
}

function SheetAction({ icon: Icon, label }) {
  return (
    <button style={{
      flex: 1, padding: '14px 8px', background: 'transparent',
      border: '1px solid var(--ax-border-strong)', borderRadius: 4,
      color: 'var(--ax-fg)', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      transition: 'border-color 220ms var(--ax-ease)',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ax-border-gold)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--ax-border-strong)'}>
      <Icon width="16" height="16" />
      <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--ax-fg-muted)' }}>
        {label}
      </span>
    </button>
  );
}

window.BgTxnsScreen = BgTxnsScreen;
