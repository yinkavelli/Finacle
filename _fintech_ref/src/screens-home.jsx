// screens-home.jsx — Home / Balance dashboard

function HomeScreen({ aesthetic, onOpenSend, onOpenCard, onOpenTx, onNav }) {
  const [showBalance, setShowBalance] = React.useState(true);
  const [activeCurrency, setActiveCurrency] = React.useState(0);
  const data = window.AX_DATA;
  const bal = data.balances[activeCurrency];

  // Animated counter on balance change
  const [displayAmount, setDisplayAmount] = React.useState(bal.amount);
  React.useEffect(() => {
    let start = displayAmount;
    const target = bal.amount;
    const duration = 600;
    const t0 = performance.now();
    let raf;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayAmount(start + (target - start) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [activeCurrency, bal.amount]);

  const card = data.cards[0]; // hero is gold reserve

  return (
    <div style={{ paddingTop: 60, paddingBottom: 96 }}>
      {/* === Top bar: greeting + tier + notif === */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            border: '1px solid var(--ax-border-gold)',
            background: 'linear-gradient(135deg, #1a1612 0%, #2a2218 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--ax-font-display)', fontSize: 14, color: 'var(--ax-gold)',
          }}>{data.user.avatar}</div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.28em', color: 'var(--ax-fg-muted)', fontWeight: 500, textTransform: 'uppercase' }}>
              {data.user.tier} · est. {data.user.memberSince}
            </div>
            <div style={{ fontFamily: 'var(--ax-font-display)', fontSize: 18, marginTop: 2, lineHeight: 1 }}>
              <span style={{ color: 'var(--ax-fg-muted)', fontStyle: 'italic', fontWeight: 300 }}>Good evening,</span>{' '}
              <span style={{ color: 'var(--ax-fg)', fontWeight: 400 }}>{data.user.firstName}</span>
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

      {/* === Hero: Balance === */}
      <div style={{ padding: '0 24px', marginBottom: 24, position: 'relative' }}>
        <AxEyebrow num={1} label="Total Holdings" />
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--ax-font-display)', fontSize: 56, fontWeight: 300,
            letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--ax-fg)',
          }} className="ax-num">
            {showBalance
              ? <>{bal.symbol}{Math.floor(displayAmount).toLocaleString('en-US').replace(/,/g, '\u2009')}<span style={{ color: 'var(--ax-fg-faint)', fontSize: 36 }}>.{String(Math.floor((displayAmount % 1) * 100)).padStart(2, '0')}</span></>
              : <span>•••••••</span>}
          </span>
          <button onClick={() => setShowBalance(s => !s)} style={{
            background: 'transparent', border: 0, color: 'var(--ax-fg-muted)',
            cursor: 'pointer', padding: 4, display: 'flex',
          }}>
            {showBalance ? <Ax.Eye width="16" height="16" /> : <Ax.EyeOff width="16" height="16" />}
          </button>
        </div>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--ax-gold)', fontFamily: 'var(--ax-font-display)', fontStyle: 'italic', fontWeight: 400 }}>
            + $4&thinsp;218 today
          </span>
          <span style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase' }}>
            · +2.3%
          </span>
        </div>

        {/* Currency selector */}
        <div style={{
          marginTop: 18, display: 'flex', gap: 6,
          overflowX: 'auto', paddingBottom: 4,
        }} className="no-scrollbar">
          {data.balances.map((b, i) => (
            <button key={b.code} onClick={() => setActiveCurrency(i)} style={{
              flexShrink: 0,
              padding: '6px 12px', borderRadius: 2,
              background: i === activeCurrency ? 'var(--ax-gold)' : 'transparent',
              border: `1px solid ${i === activeCurrency ? 'var(--ax-gold)' : 'var(--ax-border-strong)'}`,
              color: i === activeCurrency ? 'var(--ax-midnight)' : 'var(--ax-fg-muted)',
              fontFamily: 'var(--ax-font-body)', fontSize: 10,
              letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
              cursor: 'pointer', transition: 'all 220ms var(--ax-ease)',
            }}>
              {b.code}
            </button>
          ))}
        </div>
      </div>

      {/* === Quick actions === */}
      <div style={{
        margin: '0 24px 28px',
        padding: '20px 16px',
        background: 'var(--ax-midnight)',
        border: '1px solid var(--ax-border)',
        borderRadius: 4,
        display: 'flex', gap: 4,
      }}>
        <AxQuickAction icon={Ax.ArrowUp} label="Send" onClick={onOpenSend} accent />
        <AxQuickAction icon={Ax.ArrowDown} label="Request" />
        <AxQuickAction icon={Ax.Swap} label="Exchange" />
        <AxQuickAction icon={Ax.Plus} label="Top up" />
        <AxQuickAction icon={Ax.More} label="More" />
      </div>

      {/* === Featured card === */}
      <div style={{ padding: '0 24px', marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <AxEyebrow num={2} label="Reserve Card" />
          <button onClick={() => onNav('cards')} style={{
            background: 'transparent', border: 0, color: 'var(--ax-fg-muted)',
            fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: 'var(--ax-font-body)', fontWeight: 500, padding: 0,
          }}>
            All cards <Ax.ChevR width="12" height="12" />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}
             onClick={() => onOpenCard(card.id)}>
          <div style={{ cursor: 'pointer', transition: 'transform 320ms var(--ax-ease)' }}
               onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <AxCardVisual card={card} width={320} />
          </div>
        </div>

        {/* Spending pill under card */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)', borderRadius: 4,
        }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.28em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase', fontWeight: 500 }}>
              This month
            </div>
            <div style={{ fontFamily: 'var(--ax-font-display)', fontSize: 20, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
              ${(84_220).toLocaleString('en-US').replace(/,/g, '\u2009')} <span style={{ color: 'var(--ax-fg-faint)', fontSize: 14 }}>/ $250&thinsp;000</span>
            </div>
          </div>
          <div style={{ position: 'relative', width: 56, height: 56 }}>
            <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(245,243,239,0.1)" strokeWidth="1.5"/>
              <circle cx="28" cy="28" r="24" fill="none" stroke="var(--ax-gold)" strokeWidth="1.5"
                strokeDasharray={`${(84220/250000) * 150.8} 150.8`} strokeLinecap="round" />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--ax-font-display)', fontSize: 14, fontStyle: 'italic',
              color: 'var(--ax-gold)',
            }}>34%</div>
          </div>
        </div>
      </div>

      {/* === Recent activity preview === */}
      <div style={{ padding: '0 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <AxEyebrow num={3} label="Recent Activity" />
          <button onClick={() => onNav('activity')} style={{
            background: 'transparent', border: 0, color: 'var(--ax-fg-muted)',
            fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: 'var(--ax-font-body)', fontWeight: 500, padding: 0,
          }}>
            View all <Ax.ChevR width="12" height="12" />
          </button>
        </div>

        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)', borderRadius: 4,
          overflow: 'hidden',
        }}>
          {data.transactions.slice(0, 4).map((t, i, arr) => (
            <div key={t.id} onClick={() => onOpenTx(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', cursor: 'pointer',
              borderBottom: i < arr.length - 1 ? '1px solid var(--ax-border)' : 'none',
              transition: 'background 220ms var(--ax-ease)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,165,90,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <AxMerchant logo={t.logo} accent={t.accent} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: 'var(--ax-fg)', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.merchant}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ax-fg-muted)', letterSpacing: '0.04em', marginTop: 2 }}>
                  {t.when} · {t.city}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="ax-num" style={{
                  fontFamily: 'var(--ax-font-display)', fontSize: 16, fontWeight: 400,
                  color: t.amount > 0 ? 'var(--ax-gold)' : 'var(--ax-fg)',
                }}>
                  {axFmt(t.amount, { sign: true })}
                </div>
                <div style={{ fontSize: 10, color: 'var(--ax-fg-muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>
                  {t.cat}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === Vault teaser === */}
      <div style={{ padding: '0 24px' }}>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)', borderRadius: 4,
          padding: 20, position: 'relative', overflow: 'hidden',
          cursor: 'pointer',
        }} onClick={() => onNav('vaults')}>
          <AxHalftone position="top-right" size={140} opacity={0.4} />
          <AxEyebrow num={4} label="Active Vaults" />
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{
                fontFamily: 'var(--ax-font-display)', fontSize: 24, fontWeight: 300,
                margin: '8px 0 4px', letterSpacing: '-0.01em',
              }}>
                4 vaults, <span style={{ fontStyle: 'italic', color: 'var(--ax-gold)' }}>compounding</span>
              </h3>
              <div style={{ fontSize: 12, color: 'var(--ax-fg-muted)' }}>
                $1.25M saved · $2.03M target
              </div>
            </div>
            <Ax.ChevR width="20" height="20" style={{ color: 'var(--ax-gold)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

window.HomeScreen = HomeScreen;
