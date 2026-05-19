// budget-app/home.jsx — Coverage dashboard

function HomeScreen({ onOpenCat, onNav, onOpenChat }) {
  const d = window.BUDGET_DATA;
  const cur = d.current;
  const remaining = cur.incomeTotal - cur.spendTotal;
  const dailyBudget = remaining / cur.daysLeft;

  // Top 4 categories
  const topCats = d.categoriesOrder
    .filter(k => k !== 'savings' && k !== 'other')
    .map(k => ({ key: k, ...window.CATEGORIES[k] }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 4);

  const surplusHistory = d.history.map(h => h.surplus);

  return (
    <div style={{ paddingTop: 60, paddingBottom: 96 }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', marginBottom: 28,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 4,
            border: '1px solid var(--ax-border-gold)',
            background: 'linear-gradient(135deg, #1a1612 0%, #2a2218 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--ax-font-display)', fontSize: 14, color: 'var(--ax-gold)',
          }}>{d.user.avatar}</div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.28em', color: 'var(--ax-fg-muted)', fontWeight: 500, textTransform: 'uppercase' }}>
              {cur.month} · day {31 - cur.daysLeft}
            </div>
            <div style={{ fontFamily: 'var(--ax-font-display)', fontSize: 18, marginTop: 2, lineHeight: 1 }}>
              <span style={{ color: 'var(--ax-fg-muted)', fontStyle: 'italic', fontWeight: 300 }}>Welcome back,</span>{' '}
              <span style={{ color: 'var(--ax-fg)', fontWeight: 400 }}>{d.user.firstName}</span>
            </div>
          </div>
        </div>
        <button style={{
          width: 38, height: 38, border: '1px solid var(--ax-border)',
          background: 'transparent', color: 'var(--ax-fg)', borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Ax.Bell width="18" height="18" />
        </button>
      </div>

      {/* === HERO — coverage === */}
      <div style={{ padding: '0 24px', marginBottom: 28 }}>
        <AxEyebrow num={1} label="Spending health" />
        <div style={{ marginTop: 16 }}>
          <div className="ax-num" style={{
            fontFamily: 'var(--ax-font-display)', fontSize: 64, fontWeight: 300,
            letterSpacing: '-0.025em', lineHeight: 1, color: 'var(--ax-fg)',
          }}>
            {bFmt(remaining, { decimals: 0 })}
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--ax-font-display)', fontSize: 16, fontStyle: 'italic',
              color: 'var(--ax-gold)', fontWeight: 400,
            }}>
              left to spend
            </span>
            <span style={{ fontSize: 11, color: 'var(--ax-fg-muted)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              · {cur.daysLeft} days to payday
            </span>
          </div>
        </div>

        {/* Coverage bar */}
        <div style={{ marginTop: 22 }}>
          <CoverageBar income={cur.incomeTotal} spend={cur.spendTotal} />
          <div style={{
            marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 11, color: 'var(--ax-fg-muted)', letterSpacing: '0.04em' }}>
              <span className="ax-num" style={{ color: 'var(--ax-fg)', fontFamily: 'var(--ax-font-display)', fontSize: 13 }}>
                {bFmt(cur.spendTotal, { decimals: 0 })}
              </span> spent of <span className="ax-num">{bFmt(cur.incomeTotal, { decimals: 0 })}</span>
            </span>
            <span style={{
              padding: '3px 8px', borderRadius: 2,
              background: 'rgba(201,165,90,0.12)',
              border: '1px solid var(--ax-border-gold-soft)',
              color: 'var(--ax-gold)', fontSize: 9, letterSpacing: '0.28em',
              textTransform: 'uppercase', fontWeight: 500,
            }}>{cur.healthScore}</span>
          </div>
        </div>
      </div>

      {/* === Stat tiles: Income / Spend / Daily === */}
      <div style={{ padding: '0 24px', marginBottom: 28 }}>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, padding: 20,
          display: 'flex', gap: 0,
        }}>
          <StatTile eyebrow="Income"
            value={bFmt(cur.incomeTotal, { decimals: 0 })}
            subtle="incl. side income"
            accent="var(--ax-fg-muted)" />
          <div style={{ width: 1, background: 'var(--ax-border)', margin: '0 16px' }} />
          <StatTile eyebrow="Spent"
            value={bFmt(cur.spendTotal, { decimals: 0 })}
            subtle="−12.4% vs Apr"
            accent="var(--ax-gold)" />
          <div style={{ width: 1, background: 'var(--ax-border)', margin: '0 16px' }} />
          <StatTile eyebrow="Daily"
            value={bFmt(dailyBudget, { decimals: 0 })}
            subtle="for 13 days"
            accent="var(--ax-fg-muted)"
            italic />
        </div>
      </div>

      {/* === Top insight card === */}
      <div style={{ padding: '0 24px', marginBottom: 28 }}>
        <div onClick={() => onNav('insights')} style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border-gold-soft)',
          borderRadius: 4, padding: 20,
          position: 'relative', overflow: 'hidden', cursor: 'pointer',
        }}>
          <AxHalftone position="top-right" size={140} opacity={0.35} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <SuggestionGlyph.cut width="14" height="14" style={{ color: 'var(--ax-gold)' }} />
            <span style={{
              fontSize: 9, letterSpacing: '0.32em', color: 'var(--ax-gold)',
              textTransform: 'uppercase', fontWeight: 500,
            }}>
              Top opportunity · this month
            </span>
          </div>
          <h3 style={{
            fontFamily: 'var(--ax-font-display)', fontSize: 22, fontWeight: 300,
            margin: '0 0 8px', letterSpacing: '-0.01em', lineHeight: 1.2,
          }}>
            Reallocate <span style={{ fontStyle: 'italic', color: 'var(--ax-gold)' }}>$454</span><br />
            from Shopping &amp; Dining
          </h3>
          <p style={{
            fontFamily: 'var(--ax-font-body)', fontSize: 12,
            color: 'var(--ax-fg-muted)', margin: '0 0 14px', lineHeight: 1.55,
          }}>
            Two categories ran over by a combined $454. Trimming them brings May's coverage to 65% — your strongest month in six.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <CatDot cat="shopping" size={6} />
              <CatDot cat="dining" size={6} />
            </div>
            <span style={{
              fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
              color: 'var(--ax-gold)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              View plan <Ax.ChevR width="12" height="12" />
            </span>
          </div>
        </div>
      </div>

      {/* === Categories — top 4 === */}
      <div style={{ padding: '0 24px', marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <AxEyebrow num={2} label="By category" />
          <button onClick={() => onNav('budget')} style={{
            background: 'transparent', border: 0, color: 'var(--ax-fg-muted)',
            fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: 'var(--ax-font-body)', fontWeight: 500, padding: 0,
          }}>
            All <Ax.ChevR width="12" height="12" />
          </button>
        </div>

        {/* Stacked bar */}
        <div style={{
          marginBottom: 12, background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)', borderRadius: 4, padding: 16,
        }}>
          <StackedCategoryBar
            height={6}
            total={d.categoriesOrder.reduce((s, k) => s + window.CATEGORIES[k].spent, 0)}
            items={d.categoriesOrder.map(k => ({ catKey: k, amount: window.CATEGORIES[k].spent }))}
          />
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: 14,
          }}>
            {topCats.map(c => (
              <div key={c.key} onClick={() => onOpenCat(c.key)} style={{
                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              }}>
                <CatDot cat={c.key} size={7} />
                <span style={{ fontSize: 11, color: 'var(--ax-fg-muted)' }}>{c.label}</span>
                <span className="ax-num" style={{
                  fontFamily: 'var(--ax-font-display)', fontSize: 12, color: 'var(--ax-fg)',
                }}>${c.spent}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CatDot cat="other" size={7} />
              <span style={{ fontSize: 11, color: 'var(--ax-fg-muted)' }}>+7 more</span>
            </div>
          </div>
        </div>

        {/* Detail rows for top 4 */}
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)', borderRadius: 4,
          overflow: 'hidden',
        }}>
          {topCats.map((c, i) => (
            <div key={c.key} style={{
              borderBottom: i < topCats.length - 1 ? '1px solid var(--ax-border)' : 'none',
            }}>
              <CategoryRow catKey={c.key} spent={c.spent} budget={c.budget} onClick={() => onOpenCat(c.key)} />
            </div>
          ))}
        </div>
      </div>

      {/* === 6-month surplus trend === */}
      <div style={{ padding: '0 24px', marginBottom: 28 }}>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)',
          borderRadius: 4, padding: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <AxEyebrow num={3} label="Surplus · 6 months" />
              <div className="ax-num" style={{
                fontFamily: 'var(--ax-font-display)', fontSize: 24, fontWeight: 300,
                marginTop: 8, letterSpacing: '-0.01em',
              }}>
                {bFmt(remaining, { decimals: 0 })}
                <span style={{ fontStyle: 'italic', color: 'var(--ax-gold)', fontSize: 14, marginLeft: 8 }}>
                  best yet
                </span>
              </div>
            </div>
            <Sparkline values={surplusHistory} width={100} height={36} area />
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4,
            alignItems: 'flex-end', height: 60,
          }}>
            {d.history.map((h, i) => {
              const max = Math.max(...d.history.map(x => x.surplus));
              const pct = (h.surplus / max) * 100;
              const isLast = i === d.history.length - 1;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: '100%', height: `${pct}%`,
                    background: isLast ? 'var(--ax-gold)' : 'rgba(245,243,239,0.18)',
                    borderRadius: 1, minHeight: 4,
                    transition: 'height 600ms var(--ax-ease)',
                  }} />
                  <span style={{
                    fontSize: 9, letterSpacing: '0.18em',
                    color: isLast ? 'var(--ax-gold)' : 'var(--ax-fg-muted)',
                    textTransform: 'uppercase', fontWeight: 500,
                  }}>{h.m}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* === Quick: ask assistant === */}
      <div style={{ padding: '0 24px' }}>
        <button onClick={onOpenChat} style={{
          width: '100%', textAlign: 'left',
          padding: 18, background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)', borderRadius: 4,
          cursor: 'pointer', position: 'relative', overflow: 'hidden',
          fontFamily: 'var(--ax-font-body)',
          transition: 'border-color 220ms var(--ax-ease)',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ax-border-gold-soft)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--ax-border)'}>
          <div style={{ fontSize: 9, letterSpacing: '0.32em', color: 'var(--ax-gold)', textTransform: 'uppercase', fontWeight: 500 }}>
            Ask Ledger
          </div>
          <div style={{
            fontFamily: 'var(--ax-font-display)', fontSize: 18, fontWeight: 300,
            marginTop: 6, color: 'var(--ax-fg)', letterSpacing: '-0.005em',
          }}>
            <span style={{ fontStyle: 'italic', color: 'var(--ax-gold)' }}>Where</span> can I cut $300 next month?
          </div>
          <div style={{
            position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--ax-gold)',
          }}>
            <Ax.ChevR width="16" height="16" />
          </div>
        </button>
      </div>
    </div>
  );
}

window.HomeScreen = HomeScreen;
