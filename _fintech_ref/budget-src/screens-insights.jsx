// screens-insights.jsx — Where you can cut & reallocate

function BgInsightsScreen({ onNav }) {
  const trend = BG_TREND;
  const maxBar = Math.max(...trend.map(m => Math.max(m.income, m.spent)));
  const unusedSubs = BG_SUBS.filter(s => s.flag === 'unused');
  const unusedTotal = unusedSubs.reduce((a, s) => a + s.amount, 0);

  // Cut suggestions
  const cuts = [
    {
      cat: 'dining', amount: 318, total: 918, plan: 600,
      headline: 'Dining',
      detail: 'You\'re $318 over plan. Cap weekend dinners at 2 — saves $280.',
    },
    {
      cat: 'shopping', amount: 226, total: 626, plan: 400,
      headline: 'Shopping',
      detail: 'Two single purchases drove 75% of overspend. Pause for 14 days?',
    },
    {
      cat: 'subs', amount: unusedTotal, total: 182, plan: 200,
      headline: 'Subscriptions',
      detail: `${unusedSubs.length} services unused for 2+ months. Reclaim $${unusedTotal.toFixed(0)}/mo.`,
    },
  ];

  const totalReclaim = cuts.reduce((a, c) => a + c.amount, 0);

  return (
    <div style={{ paddingTop: 60, paddingBottom: 96 }}>
      <div style={{ padding: '0 24px', marginBottom: 24 }}>
        <AxScreenHeader
          num={4}
          eyebrow="Insights"
          title="Where to"
          italic="reclaim."
        />
      </div>

      {/* Headline reclaim card */}
      <div style={{ padding: '0 24px', marginBottom: 24 }}>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border-gold-soft)',
          borderRadius: 4, padding: '24px 22px',
          position: 'relative', overflow: 'hidden',
        }}>
          <AxHalftone position="top-right" size={200} opacity={0.5} />
          <div style={{ fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-gold)', textTransform: 'uppercase', fontWeight: 500 }}>
            Reclaim opportunity
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="ax-num" style={{
              fontFamily: 'var(--ax-font-display)', fontSize: 52, fontWeight: 300,
              letterSpacing: '-0.025em', lineHeight: 1, color: 'var(--ax-gold)',
            }}>
              ${Math.round(totalReclaim).toLocaleString('en-US').replace(/,/g, '\u2009')}
            </span>
            <span style={{ fontSize: 12, color: 'var(--ax-fg-muted)' }}>/ mo</span>
          </div>
          <div style={{
            fontFamily: 'var(--ax-font-display)', fontSize: 17, fontWeight: 300,
            marginTop: 10, lineHeight: 1.4, color: 'var(--ax-fg)',
          }}>
            Three small shifts could route an extra <span style={{ fontStyle: 'italic', color: 'var(--ax-gold)' }}>${Math.round(totalReclaim * 12).toLocaleString('en-US')}</span> to your savings this year.
          </div>
        </div>
      </div>

      {/* Cut suggestions */}
      <div style={{ padding: '0 24px', marginBottom: 28 }}>
        <AxEyebrow num={1} label="Suggested cuts" />
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cuts.map((c, i) => (
            <CutCard key={i} cut={c} />
          ))}
        </div>
      </div>

      {/* 6-month coverage trend */}
      <div style={{ padding: '0 24px', marginBottom: 28 }}>
        <AxEyebrow num={2} label="Coverage · 6 months" />
        <div style={{
          marginTop: 14,
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, padding: '20px 18px',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10,
            alignItems: 'flex-end', height: 140,
          }}>
            {trend.map((m, i) => {
              const isCurrent = i === trend.length - 1;
              const covered = m.income >= m.spent;
              return (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 4, position: 'relative', height: '100%',
                  justifyContent: 'flex-end',
                }}>
                  {/* spent */}
                  <div style={{
                    width: '70%', height: `${(m.spent / maxBar) * 100}%`,
                    background: covered ? 'rgba(201,165,90,0.18)' : 'rgba(217,119,87,0.40)',
                    borderTop: `2px solid ${covered ? 'var(--ax-gold)' : '#D97757'}`,
                    transition: 'all 600ms var(--ax-ease)',
                    minHeight: 3,
                    position: 'relative',
                  }}>
                    {/* income line — drawn as a top border that extends */}
                    <div style={{
                      position: 'absolute',
                      left: '-15%', right: '-15%',
                      bottom: `${((m.income - m.spent) / m.spent) * 100}%`,
                      height: 1, background: 'var(--ax-fg-faint)',
                      borderTop: '1px dashed var(--ax-fg-muted)',
                    }} />
                  </div>
                  {isCurrent && (
                    <div style={{
                      position: 'absolute', bottom: '105%',
                      fontSize: 9, color: 'var(--ax-gold)', fontFamily: 'var(--ax-font-display)',
                      fontStyle: 'italic', whiteSpace: 'nowrap',
                    }}>so far</div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginTop: 12,
          }}>
            {trend.map((m, i) => (
              <div key={i} style={{
                fontSize: 10, color: i === trend.length-1 ? 'var(--ax-gold)' : 'var(--ax-fg-muted)',
                textAlign: 'center', letterSpacing: '0.18em',
                textTransform: 'uppercase', fontWeight: 500,
              }}>{m.m}</div>
            ))}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--ax-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, color: 'var(--ax-fg-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 0, borderTop: '1px dashed var(--ax-fg-muted)' }} />
                Income
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, background: 'var(--ax-gold)', borderRadius: 1 }} />
                Spent
              </span>
            </div>
            <div className="ax-num" style={{ fontSize: 11, color: 'var(--ax-fg-muted)' }}>
              Avg saved: <span style={{ color: 'var(--ax-gold)', fontFamily: 'var(--ax-font-display)', fontStyle: 'italic', fontSize: 14 }}>
                ${Math.round(trend.reduce((a,m)=>a+m.savings,0)/trend.length).toLocaleString('en-US')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription audit */}
      <div style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <AxEyebrow num={3} label="Subscription audit" />
          <span style={{ fontSize: 11, color: 'var(--ax-fg-muted)' }}>
            <span className="ax-num" style={{ color: 'var(--ax-gold)', fontFamily: 'var(--ax-font-display)', fontStyle: 'italic', fontSize: 14 }}>{BG_SUBS.length}</span> active
          </span>
        </div>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, overflow: 'hidden',
        }}>
          {BG_SUBS.map((s, i) => (
            <div key={s.name} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px',
              borderBottom: i < BG_SUBS.length - 1 ? '1px solid var(--ax-border)' : 'none',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 4,
                background: s.flag === 'unused' ? 'rgba(217,119,87,0.10)' : 'var(--ax-card)',
                border: `1px solid ${s.flag === 'unused' ? 'rgba(217,119,87,0.35)' : 'var(--ax-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: s.flag === 'unused' ? '#D97757' : 'var(--ax-fg-muted)',
                fontFamily: 'var(--ax-font-display)', fontSize: 14,
              }}>
                {s.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--ax-fg)' }}>{s.name}</div>
                <div style={{ fontSize: 10, color: s.flag === 'unused' ? '#D97757' : 'var(--ax-fg-muted)', marginTop: 2 }}>
                  {s.cadence} · last used {s.lastUsed}
                </div>
              </div>
              <div className="ax-num" style={{
                fontFamily: 'var(--ax-font-display)', fontSize: 14,
                color: s.flag === 'unused' ? '#D97757' : 'var(--ax-fg)',
              }}>
                ${s.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CutCard({ cut }) {
  const cat = bgCat(cut.cat);
  const [accepted, setAccepted] = React.useState(false);
  return (
    <div style={{
      background: 'var(--ax-midnight)',
      border: `1px solid ${accepted ? 'var(--ax-border-gold)' : 'var(--ax-border)'}`,
      borderRadius: 4, padding: 16,
      position: 'relative', overflow: 'hidden',
      transition: 'border-color 220ms var(--ax-ease)',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 16, bottom: 16, width: 2,
        background: cat.color,
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
        <BgCatIcon cat={cut.cat} size={36} />
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4,
          }}>
            <span style={{ fontSize: 10, letterSpacing: '0.32em', color: cat.color, textTransform: 'uppercase', fontWeight: 500 }}>
              {cut.headline}
            </span>
            <span className="ax-num" style={{
              fontFamily: 'var(--ax-font-display)', fontSize: 22, fontWeight: 400, fontStyle: 'italic',
              color: 'var(--ax-gold)',
            }}>+${cut.amount.toFixed(0)}</span>
          </div>
          <div style={{
            fontFamily: 'var(--ax-font-display)', fontSize: 15, fontWeight: 300,
            color: 'var(--ax-fg)', lineHeight: 1.4,
          }}>
            {cut.detail}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setAccepted(true)} style={{
          flex: 1, padding: '10px',
          background: accepted ? 'var(--ax-gold)' : 'transparent',
          border: `1px solid ${accepted ? 'var(--ax-gold)' : 'var(--ax-border-gold)'}`,
          color: accepted ? 'var(--ax-midnight)' : 'var(--ax-gold)',
          borderRadius: 4, cursor: 'pointer',
          fontFamily: 'var(--ax-font-body)', fontSize: 10,
          letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500,
        }}>
          {accepted ? '✓ Applied' : 'Apply'}
        </button>
        <button style={{
          padding: '10px 14px', background: 'transparent',
          border: '1px solid var(--ax-border)',
          color: 'var(--ax-fg-muted)', borderRadius: 4, cursor: 'pointer',
          fontFamily: 'var(--ax-font-body)', fontSize: 10,
          letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500,
        }}>Dismiss</button>
      </div>
    </div>
  );
}

window.BgInsightsScreen = BgInsightsScreen;
