// budget-app/txns.jsx — Transaction list with categorization

function TxnsScreen({ filterCat, setFilterCat }) {
  const d = window.BUDGET_DATA;
  const [q, setQ] = React.useState('');
  const [openTx, setOpenTx] = React.useState(null);
  const [showRecurring, setShowRecurring] = React.useState(false);

  let txs = d.transactions.slice();
  if (filterCat) txs = txs.filter(t => t.cat === filterCat);
  if (showRecurring) txs = txs.filter(t => t.recurring);
  if (q) {
    const ql = q.toLowerCase();
    txs = txs.filter(t => t.merchant.toLowerCase().includes(ql));
  }

  // group by date
  const groups = {};
  txs.forEach(t => {
    if (!groups[t.date]) groups[t.date] = [];
    groups[t.date].push(t);
  });

  const filterLabel = filterCat ? window.CATEGORIES[filterCat].label : 'All categories';
  const totalSpent = txs.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalIn    = txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ paddingTop: 60, paddingBottom: 96, position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '0 24px', marginBottom: 24 }}>
        <AxScreenHeader
          num={2}
          eyebrow={`${d.transactions.length} entries · ${d.current.month}`}
          title="Transactions,"
          italic="examined."
        />
      </div>

      {/* In/out summary */}
      <div style={{ padding: '0 24px', marginBottom: 20 }}>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, padding: 18,
          display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 18,
        }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.28em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase', fontWeight: 500 }}>
              In · this view
            </div>
            <div className="ax-num" style={{
              fontFamily: 'var(--ax-font-display)', fontSize: 22, fontWeight: 300, marginTop: 6,
              color: 'var(--ax-gold)',
            }}>
              + {bFmt(totalIn, { decimals: 0 })}
            </div>
          </div>
          <div style={{ height: 36, background: 'var(--ax-border)' }} />
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.28em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase', fontWeight: 500 }}>
              Out · this view
            </div>
            <div className="ax-num" style={{
              fontFamily: 'var(--ax-font-display)', fontSize: 22, fontWeight: 300, marginTop: 6,
            }}>
              – {bFmt(totalSpent, { decimals: 0 })}
            </div>
          </div>
        </div>
      </div>

      {/* Search + recurring filter */}
      <div style={{ padding: '0 24px', marginBottom: 16, display: 'flex', gap: 8 }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)', borderRadius: 4,
        }}>
          <Ax.Search width="14" height="14" style={{ color: 'var(--ax-fg-muted)' }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search merchants…"
            style={{
              flex: 1, background: 'transparent', border: 0, outline: 'none',
              color: 'var(--ax-fg)', fontFamily: 'var(--ax-font-body)', fontSize: 13,
            }} />
        </div>
        <button onClick={() => setShowRecurring(s => !s)} style={{
          padding: '0 14px', background: showRecurring ? 'var(--ax-gold)' : 'var(--ax-midnight)',
          color: showRecurring ? 'var(--ax-midnight)' : 'var(--ax-fg)',
          border: '1px solid ' + (showRecurring ? 'var(--ax-gold)' : 'var(--ax-border)'),
          borderRadius: 4, cursor: 'pointer',
          fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
          fontFamily: 'var(--ax-font-body)',
          transition: 'all 220ms var(--ax-ease)',
        }}>
          Recurring
        </button>
      </div>

      {/* Category chips */}
      <div style={{
        padding: '0 24px 16px', display: 'flex', gap: 6,
        overflowX: 'auto', whiteSpace: 'nowrap',
      }} className="no-scrollbar">
        <CatChip active={!filterCat} onClick={() => setFilterCat(null)}>
          All
        </CatChip>
        {d.categoriesOrder.map(k => (
          <CatChip key={k} active={filterCat === k} catKey={k} onClick={() => setFilterCat(filterCat === k ? null : k)}>
            {window.CATEGORIES[k].label}
          </CatChip>
        ))}
      </div>

      {/* Grouped txns */}
      <div style={{ padding: '0 24px' }}>
        {Object.entries(groups).map(([day, items]) => (
          <div key={day} style={{ marginBottom: 18 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
              padding: '0 4px',
            }}>
              <span style={{
                fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-fg-muted)',
                textTransform: 'uppercase', fontWeight: 500,
              }}>{day}</span>
              <span style={{ flex: 1, height: 1, background: 'var(--ax-border)' }} />
              <span className="ax-num" style={{
                fontSize: 10, color: 'var(--ax-fg-muted)', letterSpacing: '0.08em',
              }}>
                {bFmt(items.reduce((s, t) => s + t.amount, 0), { decimals: 0, sign: true })}
              </span>
            </div>
            <div style={{
              background: 'var(--ax-midnight)',
              border: '1px solid var(--ax-border)', borderRadius: 4,
              overflow: 'hidden',
            }}>
              {items.map((t, i) => (
                <TxnRow key={t.id} tx={t} onOpen={() => setOpenTx(t)}
                  last={i === items.length - 1} />
              ))}
            </div>
          </div>
        ))}
        {txs.length === 0 && (
          <div style={{
            textAlign: 'center', padding: 40, color: 'var(--ax-fg-muted)',
            fontFamily: 'var(--ax-font-display)', fontStyle: 'italic', fontSize: 16,
          }}>
            No transactions match.
          </div>
        )}
      </div>

      {openTx && <TxnSheet tx={openTx} onClose={() => setOpenTx(null)} />}
    </div>
  );
}

function CatChip({ active, catKey, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, padding: '6px 12px', borderRadius: 2,
      background: active ? 'var(--ax-gold)' : 'transparent',
      border: `1px solid ${active ? 'var(--ax-gold)' : 'var(--ax-border-strong)'}`,
      color: active ? 'var(--ax-midnight)' : 'var(--ax-fg-muted)',
      fontFamily: 'var(--ax-font-body)', fontSize: 10,
      letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
      cursor: 'pointer', transition: 'all 220ms var(--ax-ease)',
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {catKey && <CatDot cat={catKey} size={6} />}
      {children}
    </button>
  );
}

function TxnRow({ tx, onOpen, last }) {
  const c = tx.cat === 'income' ? null : window.CATEGORIES[tx.cat];
  return (
    <div onClick={onOpen} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', cursor: 'pointer',
      borderBottom: last ? 'none' : '1px solid var(--ax-border)',
      transition: 'background 220ms var(--ax-ease)',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,165,90,0.04)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {/* category dot — large, the visual anchor */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'var(--ax-card)',
        border: `1px solid ${c ? c.color + '55' : 'var(--ax-border-gold)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: c ? c.color : 'var(--ax-gold)',
        }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, color: 'var(--ax-fg)', whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {tx.merchant}
          {tx.recurring && (
            <span style={{
              fontSize: 8, padding: '1px 5px', borderRadius: 1,
              color: 'var(--ax-gold)', letterSpacing: '0.18em',
              border: '1px solid var(--ax-border-gold-soft)',
              textTransform: 'uppercase', fontWeight: 500,
            }}>R</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ax-fg-muted)', marginTop: 2 }}>
          {c ? c.label : 'Income'} · {tx.account}
        </div>
      </div>
      <div className="ax-num" style={{
        fontFamily: 'var(--ax-font-display)', fontSize: 16, fontWeight: 400,
        color: tx.amount > 0 ? 'var(--ax-gold)' : 'var(--ax-fg)',
      }}>
        {bFmt(tx.amount, { sign: true, decimals: 2 })}
      </div>
    </div>
  );
}

function TxnSheet({ tx, onClose }) {
  const d = window.BUDGET_DATA;
  const [cat, setCat] = React.useState(tx.cat);
  const c = cat === 'income' ? null : window.CATEGORIES[cat];

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
        padding: '20px 24px 36px',
        animation: 'ax-fade-up 320ms var(--ax-ease)',
        maxHeight: '88%', overflowY: 'auto',
      }} className="no-scrollbar">
        <div style={{
          width: 40, height: 3, background: 'var(--ax-border-strong)',
          borderRadius: 2, margin: '0 auto 20px',
        }} />

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            border: `1px solid ${c ? c.color : 'var(--ax-gold)'}`,
            margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--ax-card)',
          }}>
            <span style={{
              width: 12, height: 12, borderRadius: '50%',
              background: c ? c.color : 'var(--ax-gold)',
              boxShadow: c ? `0 0 16px ${c.color}` : '0 0 16px var(--ax-gold)',
            }} />
          </div>
          <div style={{
            fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-gold)',
            textTransform: 'uppercase', fontWeight: 500, marginTop: 16,
          }}>
            {tx.date} · {tx.account}
          </div>
          <h3 style={{
            fontFamily: 'var(--ax-font-display)', fontSize: 24, fontWeight: 300,
            margin: '6px 0 4px', letterSpacing: '-0.01em',
          }}>{tx.merchant}</h3>
          <div className="ax-num" style={{
            fontFamily: 'var(--ax-font-display)', fontSize: 44, fontWeight: 300,
            color: tx.amount > 0 ? 'var(--ax-gold)' : 'var(--ax-fg)',
            margin: '8px 0', letterSpacing: '-0.02em',
          }}>
            {bFmt(tx.amount, { sign: true })}
          </div>
        </div>

        {/* Category re-assign */}
        <div style={{ marginBottom: 18 }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-fg-muted)',
            textTransform: 'uppercase', fontWeight: 500, marginBottom: 10,
          }}>Category</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {d.categoriesOrder.map(k => {
              const cc = window.CATEGORIES[k];
              const sel = cat === k;
              return (
                <button key={k} onClick={() => setCat(k)} style={{
                  padding: '6px 10px', borderRadius: 2,
                  background: sel ? cc.color + '20' : 'transparent',
                  border: `1px solid ${sel ? cc.color : 'var(--ax-border)'}`,
                  color: sel ? 'var(--ax-fg)' : 'var(--ax-fg-muted)',
                  fontFamily: 'var(--ax-font-body)', fontSize: 10,
                  letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 220ms var(--ax-ease)',
                }}>
                  <CatDot cat={k} size={6} />
                  {cc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Details */}
        <div style={{
          background: 'var(--ax-card)',
          border: '1px solid var(--ax-border)', borderRadius: 4,
          overflow: 'hidden', marginBottom: 16,
        }}>
          <TxRow label="Account" value={tx.account} />
          <TxRow label="Status" value="Cleared" gold />
          <TxRow label="Type" value={tx.recurring ? 'Recurring' : 'One-off'} />
          <TxRow label="Reference" value={tx.id.toUpperCase()} mono last />
        </div>

        <button onClick={() => { /* save */ onClose(); }} style={{
          width: '100%', padding: '14px',
          background: 'var(--ax-gold)', border: 0,
          color: 'var(--ax-midnight)', borderRadius: 4, cursor: 'pointer',
          fontFamily: 'var(--ax-font-body)', fontSize: 12,
          letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 600,
        }}>
          Save & apply rule
        </button>
      </div>
    </>
  );
}

function TxRow({ label, value, gold, mono, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px',
      borderBottom: last ? 'none' : '1px solid var(--ax-border)',
    }}>
      <span style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase', fontWeight: 500 }}>
        {label}
      </span>
      <span className={mono ? 'ax-num' : ''} style={{
        fontFamily: mono ? 'var(--ax-font-body)' : 'var(--ax-font-display)',
        fontSize: mono ? 13 : 15,
        letterSpacing: mono ? '0.08em' : '0',
        color: gold ? 'var(--ax-gold)' : 'var(--ax-fg)',
      }}>{value}</span>
    </div>
  );
}

window.TxnsScreen = TxnsScreen;
