// screens-cards.jsx — Accounts & Cards (carousel + details)

function CardsScreen({ initialCardId, onBack }) {
  const data = window.AX_DATA;
  const startIdx = Math.max(0, data.cards.findIndex(c => c.id === initialCardId));
  const [idx, setIdx] = React.useState(startIdx === -1 ? 0 : startIdx);
  const [reveal, setReveal] = React.useState(false);
  const [frozen, setFrozen] = React.useState(data.cards.map(c => c.frozen));

  const card = { ...data.cards[idx], frozen: frozen[idx] };
  const number = reveal ? card.number.replace(/•/g, () => Math.floor(Math.random() * 10).toString()) : card.number;

  return (
    <div style={{ paddingTop: 60, paddingBottom: 96 }}>
      {/* Header */}
      <div style={{ padding: '0 24px', marginBottom: 32 }}>
        <AxScreenHeader
          num={2}
          eyebrow="Your Cards"
          title="Cards &"
          italic="vaults."
        />
      </div>

      {/* Card carousel */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{
          display: 'flex', gap: 18, padding: '12px 36px 24px',
          overflowX: 'auto', scrollSnapType: 'x mandatory',
        }} className="no-scrollbar">
          {data.cards.map((c, i) => (
            <div key={c.id} onClick={() => setIdx(i)}
                 style={{
                   scrollSnapAlign: 'center', flexShrink: 0,
                   transition: 'all 320ms var(--ax-ease)',
                   transform: i === idx ? 'scale(1)' : 'scale(0.92)',
                   opacity: i === idx ? 1 : 0.55,
                   cursor: 'pointer',
                 }}>
              <AxCardVisual card={{ ...c, frozen: frozen[i] }} width={300} />
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 8, marginTop: -8,
        }}>
          {data.cards.map((_, i) => (
            <span key={i} style={{
              width: i === idx ? 18 : 4, height: 2,
              background: i === idx ? 'var(--ax-gold)' : 'var(--ax-border-strong)',
              transition: 'all 320ms var(--ax-ease)',
            }} />
          ))}
        </div>
      </div>

      {/* Card title block */}
      <div style={{ padding: '0 24px', marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-gold)', fontWeight: 500, textTransform: 'uppercase' }}>
          Axinity {card.name}
        </div>
        <h2 style={{
          fontFamily: 'var(--ax-font-display)', fontSize: 28, fontWeight: 300,
          letterSpacing: '-0.01em', margin: '6px 0 0',
        }}>
          •••• {card.last4}
          <span style={{ fontStyle: 'italic', color: 'var(--ax-fg-muted)', fontSize: 18, marginLeft: 8 }}>
            {card.type}
          </span>
        </h2>
      </div>

      {/* Limit ring */}
      <div style={{ padding: '0 24px', marginBottom: 24 }}>
        <div style={{
          background: 'var(--ax-midnight)', border: '1px solid var(--ax-border)',
          borderRadius: 4, padding: 20, display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
            <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(245,243,239,0.08)" strokeWidth="2"/>
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--ax-gold)" strokeWidth="2"
                strokeDasharray={`${(card.spent / card.limit) * 213.6} 213.6`}
                strokeLinecap="round" style={{ transition: 'stroke-dasharray 600ms var(--ax-ease)' }}/>
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
            }}>
              <div style={{ fontFamily: 'var(--ax-font-display)', fontSize: 18, fontStyle: 'italic', color: 'var(--ax-gold)', lineHeight: 1 }}>
                {Math.round((card.spent / card.limit) * 100)}%
              </div>
              <div style={{ fontSize: 8, letterSpacing: '0.18em', color: 'var(--ax-fg-muted)', marginTop: 2 }}>USED</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.28em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase', fontWeight: 500 }}>
              Monthly limit
            </div>
            <div className="ax-num" style={{
              fontFamily: 'var(--ax-font-display)', fontSize: 26, fontWeight: 300,
              margin: '4px 0 2px',
            }}>
              ${card.limit.toLocaleString('en-US').replace(/,/g, '\u2009')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ax-fg-muted)' }}>
              <span style={{ color: 'var(--ax-gold)' }}>${card.spent.toLocaleString('en-US').replace(/,/g, '\u2009')}</span> spent this month
            </div>
          </div>
        </div>
      </div>

      {/* Card details */}
      <div style={{ padding: '0 24px', marginBottom: 24 }}>
        <div style={{
          background: 'var(--ax-midnight)', border: '1px solid var(--ax-border)',
          borderRadius: 4, overflow: 'hidden',
        }}>
          <DetailRow label="Card number" value={number} mono right={
            <button onClick={() => setReveal(s => !s)} style={{
              background: 'transparent', border: 0, color: 'var(--ax-gold)', cursor: 'pointer',
              padding: 0, display: 'flex', alignItems: 'center',
            }}>
              {reveal ? <Ax.EyeOff width="16" height="16" /> : <Ax.Eye width="16" height="16" />}
            </button>
          } />
          <DetailRow label="Expires" value={card.expiry} mono />
          <DetailRow label="CVV" value={reveal ? '847' : '•••'} mono />
          <DetailRow label="Status" value={frozen[idx] ? 'Frozen' : 'Active'}
            valueColor={frozen[idx] ? 'var(--ax-fg-muted)' : 'var(--ax-gold)'}
            isLast right={
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: frozen[idx] ? 'var(--ax-fg-muted)' : 'var(--ax-gold)',
                animation: frozen[idx] ? 'none' : 'ax-pulse-gold 2.4s infinite',
              }} />
            } />
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '0 24px', display: 'flex', gap: 8, flexDirection: 'column' }}>
        <button onClick={() => setFrozen(arr => arr.map((v, i) => i === idx ? !v : v))} style={{
          padding: '14px 16px', background: 'transparent',
          border: '1px solid var(--ax-border-gold)',
          color: 'var(--ax-gold)', borderRadius: 4, cursor: 'pointer',
          fontFamily: 'var(--ax-font-body)', fontSize: 12,
          letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          transition: 'all 220ms var(--ax-ease)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--ax-gold)'; e.currentTarget.style.color = 'var(--ax-midnight)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ax-gold)'; }}>
          <Ax.Lock width="14" height="14" />
          {frozen[idx] ? 'Unfreeze card' : 'Freeze card'}
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <CardSubAction icon={Ax.Settings} label="Limits" />
          <CardSubAction icon={Ax.Share} label="Share" />
          <CardSubAction icon={Ax.More} label="More" />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono, valueColor, right, isLast }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px',
      borderBottom: isLast ? 'none' : '1px solid var(--ax-border)',
    }}>
      <div style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase', fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className={mono ? 'ax-num' : ''} style={{
          fontFamily: mono ? 'var(--ax-font-body)' : 'var(--ax-font-display)',
          fontSize: mono ? 14 : 15,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: mono ? '0.1em' : '0',
          color: valueColor || 'var(--ax-fg)',
        }}>{value}</span>
        {right}
      </div>
    </div>
  );
}

function CardSubAction({ icon: Icon, label }) {
  return (
    <button style={{
      flex: 1, padding: '14px 8px', background: 'var(--ax-midnight)',
      border: '1px solid var(--ax-border)', color: 'var(--ax-fg)',
      borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--ax-font-body)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      transition: 'all 220ms var(--ax-ease)',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ax-border-gold-soft)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ax-border)'; }}>
      <Icon width="18" height="18" />
      <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--ax-fg-muted)' }}>
        {label}
      </span>
    </button>
  );
}

window.CardsScreen = CardsScreen;
