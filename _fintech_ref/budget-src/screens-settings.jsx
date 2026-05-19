// screens-settings.jsx — Profile, CSV import, salary, categories

function BgSettingsScreen() {
  const [importState, setImportState] = React.useState('idle'); // idle | uploading | done
  const [progress, setProgress] = React.useState(0);
  const [income, setIncome] = React.useState(BG_INCOME.monthly);

  const startImport = () => {
    setImportState('uploading');
    setProgress(0);
    let p = 0;
    const tick = setInterval(() => {
      p += 4 + Math.random() * 8;
      if (p >= 100) {
        p = 100;
        clearInterval(tick);
        setTimeout(() => setImportState('done'), 280);
      }
      setProgress(p);
    }, 60);
  };

  return (
    <div style={{ paddingTop: 60, paddingBottom: 96 }}>
      <div style={{ padding: '0 24px', marginBottom: 22 }}>
        <AxScreenHeader
          num={5}
          eyebrow="Settings"
          title="Your"
          italic="ledger."
        />
      </div>

      {/* Profile card */}
      <div style={{ padding: '0 24px', marginBottom: 24 }}>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, padding: '20px 22px',
          display: 'flex', alignItems: 'center', gap: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          <AxHalftone position="top-right" size={140} opacity={0.3} />
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            border: '1px solid var(--ax-border-gold)',
            background: 'linear-gradient(135deg, #1a1612 0%, #2a2218 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--ax-font-display)', fontSize: 20, color: 'var(--ax-gold)',
          }}>{BG_USER.avatar}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontFamily: 'var(--ax-font-display)', fontSize: 20, fontWeight: 300,
              margin: 0, letterSpacing: '-0.01em',
            }}>{BG_USER.name}</h3>
            <div style={{ fontSize: 12, color: 'var(--ax-fg-muted)', marginTop: 2 }}>{BG_USER.email}</div>
            <div style={{
              marginTop: 8,
              fontSize: 10, letterSpacing: '0.28em', color: 'var(--ax-gold)',
              textTransform: 'uppercase', fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <Ax.Spark width="10" height="10" />
              Pro · est. 2024
            </div>
          </div>
        </div>
      </div>

      {/* CSV Import — the centerpiece since this is how the app gets data */}
      <div style={{ padding: '0 24px', marginBottom: 24 }}>
        <AxEyebrow num={1} label="Import" />
        <div style={{
          marginTop: 14,
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, padding: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 4,
              background: 'rgba(201,165,90,0.08)',
              border: '1px solid var(--ax-border-gold-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ax-gold)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M14 3v6h6M9 13h6M9 17h6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{
                fontFamily: 'var(--ax-font-display)', fontSize: 18, fontWeight: 400,
                margin: 0, letterSpacing: '-0.01em',
              }}>Bank statement (CSV)</h4>
              <div style={{ fontSize: 11, color: 'var(--ax-fg-muted)', marginTop: 2 }}>
                Last imported · May 13, {BG_TXNS.length} transactions
              </div>
            </div>
          </div>

          {importState === 'idle' && (
            <button onClick={startImport} style={{
              width: '100%', padding: '14px',
              background: 'var(--ax-gold)', border: 0,
              color: 'var(--ax-midnight)', borderRadius: 4, cursor: 'pointer',
              fontFamily: 'var(--ax-font-body)', fontSize: 11,
              letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'background 220ms var(--ax-ease)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--ax-gold-bright)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--ax-gold)'}>
              <Ax.Plus width="14" height="14" />
              Upload statement
            </button>
          )}

          {importState === 'uploading' && (
            <div>
              <div style={{
                height: 4, borderRadius: 2, background: 'var(--ax-border)',
                overflow: 'hidden', marginBottom: 10,
              }}>
                <div style={{
                  height: '100%', width: `${progress}%`,
                  background: 'var(--ax-gold)',
                  transition: 'width 80ms linear',
                }} />
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500,
              }}>
                <span style={{ color: 'var(--ax-gold)' }}>Parsing · categorising</span>
                <span className="ax-num" style={{ color: 'var(--ax-fg-muted)' }}>{Math.round(progress)}%</span>
              </div>
            </div>
          )}

          {importState === 'done' && (
            <div style={{
              background: 'rgba(201,165,90,0.08)',
              border: '1px solid var(--ax-border-gold-soft)',
              borderRadius: 2, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
              animation: 'ax-fade-in 320ms var(--ax-ease)',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'var(--ax-gold)', color: 'var(--ax-midnight)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24">
                  <path d="M5 12l5 5 9-11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div style={{ flex: 1, fontSize: 12, color: 'var(--ax-fg)' }}>
                <span className="ax-num" style={{ fontFamily: 'var(--ax-font-display)', fontStyle: 'italic', color: 'var(--ax-gold)', fontSize: 16 }}>23</span> new transactions · all auto-categorised.
              </div>
              <button onClick={() => setImportState('idle')} style={{
                background: 'transparent', border: 0, color: 'var(--ax-fg-muted)',
                cursor: 'pointer', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
              }}>Done</button>
            </div>
          )}
        </div>
      </div>

      {/* Income */}
      <div style={{ padding: '0 24px', marginBottom: 24 }}>
        <AxEyebrow num={2} label="Income · Salary" />
        <div style={{
          marginTop: 14,
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 16px 14px',
            borderBottom: '1px solid var(--ax-border)',
          }}>
            <div style={{ fontSize: 10, letterSpacing: '0.28em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase', fontWeight: 500 }}>
              Monthly net
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
              <span style={{ fontFamily: 'var(--ax-font-display)', fontSize: 26, color: 'var(--ax-fg-muted)' }}>$</span>
              <input value={income} onChange={e => setIncome(parseInt(e.target.value) || 0)}
                className="ax-num"
                style={{
                  background: 'transparent', border: 0, outline: 'none',
                  color: 'var(--ax-fg)', fontFamily: 'var(--ax-font-display)',
                  fontSize: 30, fontWeight: 300, letterSpacing: '-0.01em',
                  width: 160, padding: 0,
                  fontVariantNumeric: 'tabular-nums',
                }} />
              <span style={{ marginLeft: 'auto', fontSize: 10, letterSpacing: '0.28em', color: 'var(--ax-gold)', textTransform: 'uppercase', fontWeight: 500 }}>
                / mo
              </span>
            </div>
          </div>
          <BgDetailRow label="Source" value={BG_INCOME.source} />
          <BgDetailRow label="Payday" value={`${BG_INCOME.payday}th of month`} />
          <BgDetailRow label="Annual gross" value={bgFmt(BG_INCOME.annual)} mono isLast />
        </div>
      </div>

      {/* Categories */}
      <div style={{ padding: '0 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <AxEyebrow num={3} label="Categories" />
          <button style={{
            background: 'transparent', border: 0, color: 'var(--ax-gold)',
            fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            cursor: 'pointer', fontWeight: 500, padding: 0,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Ax.Plus width="11" height="11" /> New
          </button>
        </div>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, overflow: 'hidden',
        }}>
          {BG_CATS.map((c, i) => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 16px',
              borderBottom: i < BG_CATS.length - 1 ? '1px solid var(--ax-border)' : 'none',
              cursor: 'pointer',
              transition: 'background 220ms var(--ax-ease)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,165,90,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <BgCatIcon cat={c.id} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--ax-fg)' }}>{c.label}</div>
                <div style={{ fontSize: 10, color: 'var(--ax-fg-muted)', marginTop: 2, fontFamily: 'monospace' }}>
                  {c.color}
                </div>
              </div>
              <Ax.ChevR width="14" height="14" style={{ color: 'var(--ax-fg-muted)' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Misc settings list */}
      <div style={{ padding: '0 24px' }}>
        <AxEyebrow num={4} label="Preferences" />
        <div style={{
          marginTop: 14,
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, overflow: 'hidden',
        }}>
          <BgDetailRow label="Notifications" value="On" valueColor="var(--ax-gold)" onClick={() => {}} right={<Ax.ChevR width="14" height="14" style={{ color: 'var(--ax-fg-muted)' }} />} />
          <BgDetailRow label="Currency" value="USD ($)" onClick={() => {}} right={<Ax.ChevR width="14" height="14" style={{ color: 'var(--ax-fg-muted)' }} />} />
          <BgDetailRow label="Privacy & data" value="" onClick={() => {}} right={<Ax.ChevR width="14" height="14" style={{ color: 'var(--ax-fg-muted)' }} />} />
          <BgDetailRow label="About" value="v2.4.1" onClick={() => {}} right={<Ax.ChevR width="14" height="14" style={{ color: 'var(--ax-fg-muted)' }} />} isLast />
        </div>

        <button style={{
          width: '100%', marginTop: 24, padding: '14px',
          background: 'transparent',
          border: '1px solid var(--ax-border-strong)',
          color: 'var(--ax-fg-muted)', borderRadius: 4, cursor: 'pointer',
          fontFamily: 'var(--ax-font-body)', fontSize: 10,
          letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500,
        }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

window.BgSettingsScreen = BgSettingsScreen;
