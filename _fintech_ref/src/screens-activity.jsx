// screens-activity.jsx — Transactions list with filter + detail sheet

function ActivityScreen({ openTxId, onOpenTx, onCloseTx }) {
  const data = window.AX_DATA;
  const [filter, setFilter] = React.useState('all');
  const [query, setQuery] = React.useState('');

  // Filter
  let txs = data.transactions;
  if (filter === 'in') txs = txs.filter(t => t.amount > 0);
  if (filter === 'out') txs = txs.filter(t => t.amount < 0);
  if (query) {
    const q = query.toLowerCase();
    txs = txs.filter(t => t.merchant.toLowerCase().includes(q) || t.cat.toLowerCase().includes(q));
  }

  // Group by relative date label
  const groups = {};
  txs.forEach(t => {
    const key = t.when.split(',')[0];
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  // Totals for header
  const totalIn = data.transactions.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const totalOut = data.transactions.filter(t => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);

  const openTx = openTxId ? data.transactions.find(t => t.id === openTxId) : null;

  return (
    <div style={{ paddingTop: 60, paddingBottom: 96, position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '0 24px', marginBottom: 24 }}>
        <AxScreenHeader
          num={3}
          eyebrow="Activity"
          title="A measured"
          italic="ledger."
        />
      </div>

      {/* In/Out summary */}
      <div style={{ padding: '0 24px', marginBottom: 20 }}>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, padding: 18,
          display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 18, alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.28em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase', fontWeight: 500 }}>
              In · 14 days
            </div>
            <div className="ax-num" style={{
              fontFamily: 'var(--ax-font-display)', fontSize: 22, fontWeight: 300, marginTop: 6,
              color: 'var(--ax-gold)',
            }}>
              + ${(totalIn).toLocaleString('en-US').replace(/,/g, '\u2009')}
            </div>
          </div>
          <div style={{ height: 36, background: 'var(--ax-border)' }} />
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.28em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase', fontWeight: 500 }}>
              Out · 14 days
            </div>
            <div className="ax-num" style={{
              fontFamily: 'var(--ax-font-display)', fontSize: 22, fontWeight: 300, marginTop: 6,
            }}>
              – ${(totalOut).toLocaleString('en-US').replace(/,/g, '\u2009')}
            </div>
          </div>
        </div>
      </div>

      {/* Search + filter */}
      <div style={{ padding: '0 24px', marginBottom: 20, display: 'flex', gap: 8 }}>
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

      {/* Tab chips */}
      <div style={{ padding: '0 24px', marginBottom: 16, display: 'flex', gap: 6 }}>
        {[
          { k: 'all', label: 'All' },
          { k: 'in', label: 'Incoming' },
          { k: 'out', label: 'Outgoing' },
        ].map(o => (
          <button key={o.k} onClick={() => setFilter(o.k)} style={{
            padding: '6px 14px', borderRadius: 2,
            background: filter === o.k ? 'var(--ax-gold)' : 'transparent',
            border: `1px solid ${filter === o.k ? 'var(--ax-gold)' : 'var(--ax-border-strong)'}`,
            color: filter === o.k ? 'var(--ax-midnight)' : 'var(--ax-fg-muted)',
            fontFamily: 'var(--ax-font-body)', fontSize: 10,
            letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
            cursor: 'pointer', transition: 'all 220ms var(--ax-ease)',
          }}>
            {o.label}
          </button>
        ))}
      </div>

      {/* Grouped transactions */}
      <div style={{ padding: '0 24px' }}>
        {Object.entries(groups).map(([day, items]) => (
          <div key={day} style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
              padding: '0 4px',
            }}>
              <span style={{
                fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-fg-muted)',
                textTransform: 'uppercase', fontWeight: 500,
              }}>{day}</span>
              <span style={{ flex: 1, height: 1, background: 'var(--ax-border)' }} />
            </div>
            <div style={{
              background: 'var(--ax-midnight)',
              border: '1px solid var(--ax-border)', borderRadius: 4,
              overflow: 'hidden',
            }}>
              {items.map((t, i) => (
                <div key={t.id} onClick={() => onOpenTx(t.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', cursor: 'pointer',
                  borderBottom: i < items.length - 1 ? '1px solid var(--ax-border)' : 'none',
                  transition: 'background 220ms var(--ax-ease)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,165,90,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <AxMerchant logo={t.logo} accent={t.accent} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: 'var(--ax-fg)' }}>{t.merchant}</div>
                    <div style={{ fontSize: 11, color: 'var(--ax-fg-muted)', marginTop: 2 }}>
                      {t.city}
                    </div>
                  </div>
                  <div className="ax-num" style={{
                    fontFamily: 'var(--ax-font-display)', fontSize: 16, fontWeight: 400,
                    color: t.amount > 0 ? 'var(--ax-gold)' : 'var(--ax-fg)',
                  }}>
                    {axFmt(t.amount, { sign: true })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Transaction detail sheet */}
      <TxDetailSheet tx={openTx} onClose={onCloseTx} />
    </div>
  );
}

function TxDetailSheet({ tx, onClose }) {
  if (!tx) return null;
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
        animation: 'ax-fade-up 320ms var(--ax-ease)',
        maxHeight: '88%', overflowY: 'auto',
      }} className="no-scrollbar">
        <div style={{
          width: 40, height: 3, background: 'var(--ax-border-strong)',
          borderRadius: 2, margin: '0 auto 24px',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <AxMerchant logo={tx.logo} accent={tx.accent} size={72} />
          <div style={{ fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-gold)', textTransform: 'uppercase', fontWeight: 500, marginTop: 16 }}>
            {tx.cat}
          </div>
          <h3 style={{
            fontFamily: 'var(--ax-font-display)', fontSize: 24, fontWeight: 300,
            margin: '6px 0 4px', letterSpacing: '-0.01em', textAlign: 'center',
          }}>{tx.merchant}</h3>
          <div className="ax-num" style={{
            fontFamily: 'var(--ax-font-display)', fontSize: 44, fontWeight: 300,
            color: tx.amount > 0 ? 'var(--ax-gold)' : 'var(--ax-fg)',
            margin: '8px 0', letterSpacing: '-0.02em',
          }}>
            {axFmt(tx.amount, { sign: true })}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ax-fg-muted)' }}>{tx.when} · {tx.city}</div>
        </div>

        <div style={{
          background: 'var(--ax-card)',
          border: '1px solid var(--ax-border)', borderRadius: 4,
          overflow: 'hidden', marginBottom: 16,
        }}>
          <DetailRow label="Card" value="Reserve · 4821" />
          <DetailRow label="Reference" value={tx.id.toUpperCase() + '-' + Math.floor(Math.random() * 9999)} mono />
          <DetailRow label="Status" value="Settled" valueColor="var(--ax-gold)"
            right={<span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ax-gold)' }} />} />
          <DetailRow label="Method" value="Apple Pay" isLast />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <SheetAction icon={Ax.Spark} label="Split bill" />
          <SheetAction icon={Ax.Filter} label="Categorise" />
          <SheetAction icon={Ax.Share} label="Receipt" />
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

window.ActivityScreen = ActivityScreen;
