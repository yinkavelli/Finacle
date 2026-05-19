// screens-insights.jsx — Spending insights / analytics

function InsightsScreen() {
  const data = window.AX_DATA;
  const ins = data.insights;
  const maxWeek = Math.max(...ins.week);

  // Donut math
  const radius = 70;
  const C = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div style={{ paddingTop: 60, paddingBottom: 96 }}>
      {/* Header */}
      <div style={{ padding: '0 24px', marginBottom: 24 }}>
        <AxScreenHeader
          num={4}
          eyebrow="May 2026"
          title="Spending,"
          italic="examined."
        />
      </div>

      {/* Donut chart */}
      <div style={{ padding: '0 24px', marginBottom: 28 }}>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, padding: 24, position: 'relative', overflow: 'hidden',
        }}>
          <AxHalftone position="bottom-right" size={180} opacity={0.3} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* SVG donut */}
            <div style={{ position: 'relative', width: 170, height: 170, flexShrink: 0 }}>
              <svg width="170" height="170" viewBox="0 0 170 170" style={{ transform: 'rotate(-90deg)' }}>
                {ins.categories.map((c, i) => {
                  const dash = (c.pct / 100) * C;
                  const offset = -cumulative;
                  cumulative += dash;
                  return (
                    <circle key={i} cx="85" cy="85" r={radius}
                      fill="none" stroke={c.color} strokeWidth="14"
                      strokeDasharray={`${dash} ${C}`}
                      strokeDashoffset={offset}
                      style={{ transition: 'stroke-dasharray 600ms var(--ax-ease)' }}
                    />
                  );
                })}
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ fontSize: 9, letterSpacing: '0.32em', color: 'var(--ax-fg-muted)', textTransform: 'uppercase', fontWeight: 500 }}>
                  Total
                </div>
                <div className="ax-num" style={{
                  fontFamily: 'var(--ax-font-display)', fontSize: 24, fontWeight: 300,
                  marginTop: 4, color: 'var(--ax-fg)',
                }}>
                  ${Math.round(ins.monthSpend / 1000).toLocaleString()}K
                </div>
                <div style={{ fontSize: 11, color: 'var(--ax-gold)', fontStyle: 'italic', fontFamily: 'var(--ax-font-display)', marginTop: 2 }}>
                  {ins.monthChange}% vs Apr
                </div>
              </div>
            </div>

            {/* Legend */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ins.categories.map(c => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, background: c.color, borderRadius: 1 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: 'var(--ax-fg)', fontWeight: 400 }}>{c.name}</div>
                    <div className="ax-num" style={{ fontSize: 10, color: 'var(--ax-fg-muted)', letterSpacing: '0.04em' }}>
                      ${(c.amount).toLocaleString('en-US')}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 11, color: 'var(--ax-gold)', fontFamily: 'var(--ax-font-display)',
                    fontStyle: 'italic',
                  }}>{c.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly trend bars */}
      <div style={{ padding: '0 24px', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <AxEyebrow label="This week" />
          <span style={{ fontSize: 11, color: 'var(--ax-fg-muted)' }}>
            <span className="ax-num" style={{ color: 'var(--ax-gold)', fontFamily: 'var(--ax-font-display)', fontSize: 14 }}>$11&thinsp;540</span> total
          </span>
        </div>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, padding: '20px 18px',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10,
            alignItems: 'flex-end', height: 140,
          }}>
            {ins.week.map((v, i) => {
              const isPeak = v === maxWeek;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span className="ax-num" style={{
                    fontSize: 9, color: isPeak ? 'var(--ax-gold)' : 'var(--ax-fg-muted)',
                    letterSpacing: '0.04em', fontWeight: 500,
                  }}>${Math.round(v/100)*100}</span>
                  <div style={{
                    width: '100%', height: `${(v / maxWeek) * 100}%`,
                    background: isPeak
                      ? 'linear-gradient(to top, var(--ax-gold) 0%, var(--ax-gold-bright) 100%)'
                      : 'rgba(245,243,239,0.12)',
                    borderRadius: 1,
                    transition: 'height 600ms var(--ax-ease)',
                    minHeight: 4,
                  }} />
                </div>
              );
            })}
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginTop: 10,
          }}>
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} style={{
                fontSize: 9, color: 'var(--ax-fg-muted)', textAlign: 'center',
                letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
              }}>{d}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Editorial notes */}
      <div style={{ padding: '0 24px' }}>
        <AxEyebrow label="Observations" />
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ins.notes.map((n, i) => (
            <div key={i} style={{
              padding: '18px 20px',
              background: 'var(--ax-midnight)',
              border: '1px solid var(--ax-border)',
              borderRadius: 4, position: 'relative',
            }}>
              <div style={{
                position: 'absolute', left: 0, top: 18, bottom: 18, width: 2,
                background: 'var(--ax-gold)',
              }} />
              <div style={{ fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-gold)', textTransform: 'uppercase', fontWeight: 500 }}>
                {n.eyebrow}
              </div>
              <div style={{
                fontFamily: 'var(--ax-font-display)', fontSize: 17, fontWeight: 300,
                marginTop: 6, lineHeight: 1.35, color: 'var(--ax-fg)',
              }}>{n.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.InsightsScreen = InsightsScreen;
