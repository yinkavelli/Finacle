// screens-vaults.jsx — Vaults / savings goals

function VaultsScreen() {
  const data = window.AX_DATA;
  const [openId, setOpenId] = React.useState(null);
  const totalGoal = data.vaults.reduce((a, v) => a + v.goal, 0);
  const totalSaved = data.vaults.reduce((a, v) => a + v.saved, 0);
  const openVault = openId ? data.vaults.find(v => v.id === openId) : null;

  return (
    <div style={{ paddingTop: 60, paddingBottom: 96, position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '0 24px', marginBottom: 24 }}>
        <AxScreenHeader
          num={5}
          eyebrow="Vaults"
          title="Saved with"
          italic="intent."
        />
      </div>

      {/* Top summary */}
      <div style={{ padding: '0 24px', marginBottom: 24 }}>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, padding: 24, position: 'relative', overflow: 'hidden',
        }}>
          <AxHalftone position="top-right" size={160} opacity={0.4} />
          <div style={{ fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-gold)', textTransform: 'uppercase', fontWeight: 500 }}>
            All vaults
          </div>
          <div className="ax-num" style={{
            fontFamily: 'var(--ax-font-display)', fontSize: 44, fontWeight: 300,
            marginTop: 8, letterSpacing: '-0.02em', lineHeight: 1,
          }}>
            ${(totalSaved / 1_000_000).toFixed(2)}M
          </div>
          <div style={{ fontSize: 12, color: 'var(--ax-fg-muted)', marginTop: 6 }}>
            of <span style={{ color: 'var(--ax-fg)' }}>${(totalGoal / 1_000_000).toFixed(2)}M</span> across <span style={{ color: 'var(--ax-gold)', fontStyle: 'italic', fontFamily: 'var(--ax-font-display)' }}>{data.vaults.length} mandates</span>
          </div>

          {/* Stacked progress bar */}
          <div style={{
            marginTop: 18, height: 6, borderRadius: 2,
            background: 'var(--ax-border)', overflow: 'hidden',
            display: 'flex',
          }}>
            {data.vaults.map(v => (
              <div key={v.id} style={{
                width: `${(v.saved / totalGoal) * 100}%`,
                background: v.color, height: '100%',
                transition: 'width 600ms var(--ax-ease)',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Add vault button */}
      <div style={{ padding: '0 24px', marginBottom: 16 }}>
        <button style={{
          width: '100%', padding: '14px',
          background: 'transparent',
          border: '1px dashed var(--ax-border-gold-soft)',
          color: 'var(--ax-gold)', borderRadius: 4, cursor: 'pointer',
          fontFamily: 'var(--ax-font-body)', fontSize: 11,
          letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          transition: 'all 220ms var(--ax-ease)',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ax-gold)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--ax-border-gold-soft)'}>
          <Ax.Plus width="14" height="14" />
          New vault
        </button>
      </div>

      {/* Vault list */}
      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.vaults.map((v, i) => (
          <VaultCard key={v.id} vault={v} num={i + 1} onOpen={() => setOpenId(v.id)} />
        ))}
      </div>

      {/* Vault detail sheet */}
      {openVault && <VaultSheet vault={openVault} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function VaultCard({ vault, num, onOpen }) {
  const pct = (vault.saved / vault.goal) * 100;
  return (
    <div onClick={onOpen} style={{
      background: 'var(--ax-midnight)',
      border: '1px solid var(--ax-border)',
      borderRadius: 4, padding: 18, cursor: 'pointer',
      position: 'relative', overflow: 'hidden',
      transition: 'all 220ms var(--ax-ease)',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ax-border-gold-soft)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ax-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-gold)',
            textTransform: 'uppercase', fontWeight: 500,
          }}>
            <span style={{ color: 'var(--ax-gold)' }}>{String(num).padStart(2, '0')}</span>
            <span style={{ margin: '0 8px', color: 'var(--ax-fg-faint)' }}>—</span>
            <span style={{ color: 'var(--ax-fg-muted)' }}>{vault.eta}</span>
          </div>
          <h3 style={{
            fontFamily: 'var(--ax-font-display)', fontSize: 20, fontWeight: 300,
            margin: '6px 0 0', letterSpacing: '-0.01em',
          }}>{vault.name}</h3>
        </div>
        <Ax.ChevR width="18" height="18" style={{ color: 'var(--ax-fg-muted)', flexShrink: 0, marginLeft: 12 }} />
      </div>

      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <div className="ax-num" style={{
          fontFamily: 'var(--ax-font-display)', fontSize: 22, fontWeight: 400,
          color: 'var(--ax-fg)',
        }}>
          ${(vault.saved / 1000).toFixed(0)}K
          <span style={{ color: 'var(--ax-fg-faint)', fontSize: 13, fontWeight: 300 }}>
            {' '}/ ${(vault.goal / 1000).toFixed(0)}K
          </span>
        </div>
        <div style={{
          fontSize: 12, color: 'var(--ax-gold)',
          fontFamily: 'var(--ax-font-display)', fontStyle: 'italic',
        }}>{pct.toFixed(0)}%</div>
      </div>

      <div style={{
        height: 3, borderRadius: 2, background: 'var(--ax-border)', overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(to right, ${vault.color} 0%, var(--ax-gold-bright) 100%)`,
          transition: 'width 600ms var(--ax-ease)',
        }} />
      </div>
    </div>
  );
}

function VaultSheet({ vault, onClose }) {
  const pct = (vault.saved / vault.goal) * 100;
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
      }}>
        <div style={{
          width: 40, height: 3, background: 'var(--ax-border-strong)',
          borderRadius: 2, margin: '0 auto 24px',
        }} />

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-gold)', textTransform: 'uppercase', fontWeight: 500 }}>
            Target {vault.eta}
          </div>
          <h2 style={{
            fontFamily: 'var(--ax-font-display)', fontSize: 28, fontWeight: 300,
            margin: '8px 0 0', letterSpacing: '-0.01em',
          }}>{vault.name}</h2>
        </div>

        {/* Big ring */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ position: 'relative', width: 200, height: 200 }}>
            <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r="86" fill="none" stroke="rgba(245,243,239,0.08)" strokeWidth="3"/>
              <circle cx="100" cy="100" r="86" fill="none" stroke="var(--ax-gold)" strokeWidth="3"
                strokeDasharray={`${(pct/100) * 540} 540`} strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 800ms var(--ax-ease)' }} />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div className="ax-num" style={{
                fontFamily: 'var(--ax-font-display)', fontSize: 38, fontWeight: 300,
                letterSpacing: '-0.02em', lineHeight: 1,
              }}>${(vault.saved / 1000).toFixed(0)}K</div>
              <div style={{ fontSize: 11, color: 'var(--ax-fg-muted)', marginTop: 6, letterSpacing: '0.04em' }}>
                of ${(vault.goal / 1000).toFixed(0)}K
              </div>
              <div style={{
                fontFamily: 'var(--ax-font-display)', fontSize: 16, fontStyle: 'italic',
                color: 'var(--ax-gold)', marginTop: 4,
              }}>{pct.toFixed(0)}%</div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--ax-card)',
          border: '1px solid var(--ax-border)', borderRadius: 4,
          overflow: 'hidden', marginBottom: 16,
        }}>
          <DetailRow label="Monthly contribution" value="$ 12&thinsp;500" mono />
          <DetailRow label="Yield (APY)" value="4.85%" valueColor="var(--ax-gold)" />
          <DetailRow label="Last deposit" value="3 days ago" />
          <DetailRow label="Auto-save" value="Active" valueColor="var(--ax-gold)" isLast
            right={<span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ax-gold)' }} />} />
        </div>

        <button style={{
          width: '100%', padding: '14px',
          background: 'var(--ax-gold)', border: 0,
          color: 'var(--ax-midnight)', borderRadius: 4, cursor: 'pointer',
          fontFamily: 'var(--ax-font-body)', fontSize: 12,
          letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 600,
          transition: 'background 220ms var(--ax-ease)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--ax-gold-bright)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--ax-gold)'}>
          Add to vault
        </button>
      </div>
    </>
  );
}

window.VaultsScreen = VaultsScreen;
