// send-money.jsx — 3-step send money flow modal

function SendMoneyFlow({ onClose }) {
  const data = window.AX_DATA;
  const [step, setStep] = React.useState(0); // 0: amount, 1: recipient, 2: confirm, 3: success
  const [amount, setAmount] = React.useState('');
  const [recipient, setRecipient] = React.useState(null);
  const [note, setNote] = React.useState('');

  const amountN = parseFloat(amount) || 0;

  const next = () => setStep(s => s + 1);
  const back = () => {
    if (step === 0) onClose();
    else setStep(s => s - 1);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'var(--ax-midnight)',
      animation: 'ax-fade-up 280ms var(--ax-ease)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Background gradient (matches app shell) */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at top, rgba(255,179,71,0.08) 0%, transparent 50%)',
      }} />

      {/* Status bar safe area */}
      <div style={{ height: 60, flexShrink: 0 }} />

      {/* Header */}
      <div style={{
        padding: '0 24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 1,
      }}>
        <button onClick={back} style={{
          width: 38, height: 38, borderRadius: 4,
          background: 'transparent', border: '1px solid var(--ax-border)',
          color: 'var(--ax-fg)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {step === 0 ? <Ax.Close width="16" height="16" /> : <Ax.ChevL width="16" height="16" />}
        </button>
        <StepIndicator step={step} total={3} />
        <div style={{ width: 38 }} />
      </div>

      {/* Step content */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 1 }} className="no-scrollbar">
        {step === 0 && <StepAmount amount={amount} setAmount={setAmount} onNext={amountN > 0 ? next : null} />}
        {step === 1 && <StepRecipient recipient={recipient} setRecipient={setRecipient} onNext={recipient ? next : null} amount={amountN} />}
        {step === 2 && <StepConfirm amount={amountN} recipient={recipient} note={note} setNote={setNote} onConfirm={next} />}
        {step === 3 && <StepSuccess amount={amountN} recipient={recipient} onDone={onClose} />}
      </div>
    </div>
  );
}

function StepIndicator({ step, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          width: i === step ? 24 : 4, height: 2,
          background: i <= step ? 'var(--ax-gold)' : 'var(--ax-border-strong)',
          transition: 'all 320ms var(--ax-ease)',
        }} />
      ))}
    </div>
  );
}

// ─── Step 1: Amount with keypad ─────────────────────────────────────
function StepAmount({ amount, setAmount, onNext }) {
  const press = (k) => {
    setAmount(a => {
      if (k === 'del') return a.slice(0, -1);
      if (k === '.' && a.includes('.')) return a;
      if (a === '0' && k !== '.') return k;
      if (a.includes('.') && a.split('.')[1].length >= 2) return a;
      return a + k;
    });
  };

  const display = amount || '0';
  // Insert thin spaces in integer part
  const [intPart, decPart] = display.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 24px' }}>
      <div style={{ marginBottom: 16 }}>
        <AxEyebrow num={1} label="Amount" />
        <h1 style={{
          fontFamily: 'var(--ax-font-display)', fontSize: 30, fontWeight: 300,
          letterSpacing: '-0.015em', margin: '12px 0 0', lineHeight: 1.05,
        }}>
          How much to <span style={{ fontStyle: 'italic', color: 'var(--ax-gold)' }}>send?</span>
        </h1>
      </div>

      {/* Amount display */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        <div style={{
          fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-gold)',
          textTransform: 'uppercase', fontWeight: 500, marginBottom: 12,
        }}>USD</div>
        <div className="ax-num" style={{
          fontFamily: 'var(--ax-font-display)', fontSize: 72, fontWeight: 300,
          letterSpacing: '-0.03em', lineHeight: 1, color: amount ? 'var(--ax-fg)' : 'var(--ax-fg-faint)',
          display: 'flex', alignItems: 'baseline',
        }}>
          <span style={{ fontSize: 38, marginRight: 8, color: 'var(--ax-fg-muted)' }}>$</span>
          <span>{formattedInt}</span>
          {decPart !== undefined && <span style={{ color: 'var(--ax-fg-faint)' }}>.{decPart || ''}</span>}
        </div>
        <div style={{
          marginTop: 18, fontSize: 12, color: 'var(--ax-fg-muted)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ax-gold)' }} />
          From Reserve · $184&thinsp;722.45 available
        </div>

        {/* Quick amount chips */}
        <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
          {[1000, 5000, 25000].map(v => (
            <button key={v} onClick={() => setAmount(String(v))} style={{
              padding: '8px 14px', borderRadius: 2,
              background: 'transparent',
              border: '1px solid var(--ax-border-strong)',
              color: 'var(--ax-fg-muted)',
              fontFamily: 'var(--ax-font-body)', fontSize: 11,
              letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
              cursor: 'pointer', transition: 'all 220ms var(--ax-ease)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ax-gold)'; e.currentTarget.style.color = 'var(--ax-gold)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ax-border-strong)'; e.currentTarget.style.color = 'var(--ax-fg-muted)'; }}>
              ${v.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Keypad */}
      <div style={{ paddingBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginBottom: 14 }}>
          {['1','2','3','4','5','6','7','8','9','.','0','del'].map(k => (
            <button key={k} onClick={() => press(k)} style={{
              padding: '16px 0', background: 'transparent', border: 0,
              fontFamily: 'var(--ax-font-display)', fontSize: 26, fontWeight: 300,
              color: 'var(--ax-fg)', cursor: 'pointer',
              transition: 'background 180ms var(--ax-ease)',
              borderRadius: 4,
            }}
            onMouseDown={e => e.currentTarget.style.background = 'rgba(201,165,90,0.08)'}
            onMouseUp={e => e.currentTarget.style.background = 'transparent'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {k === 'del'
                ? <Ax.ChevL width="20" height="20" style={{ display: 'inline' }} />
                : k}
            </button>
          ))}
        </div>
        <PrimaryButton onClick={onNext} disabled={!onNext}>
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
}

// ─── Step 2: Recipient ──────────────────────────────────────────────
function StepRecipient({ recipient, setRecipient, onNext, amount }) {
  const data = window.AX_DATA;
  const [q, setQ] = React.useState('');
  const filtered = data.recipients.filter(r =>
    r.name.toLowerCase().includes(q.toLowerCase()) ||
    r.handle.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <AxEyebrow num={2} label="Recipient" />
        <h1 style={{
          fontFamily: 'var(--ax-font-display)', fontSize: 30, fontWeight: 300,
          letterSpacing: '-0.015em', margin: '12px 0 0', lineHeight: 1.05,
        }}>
          Send <span className="ax-num" style={{ color: 'var(--ax-gold)', fontStyle: 'italic' }}>${amount.toLocaleString('en-US')}</span> to…
        </h1>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        background: 'var(--ax-card)',
        border: '1px solid var(--ax-border)', borderRadius: 4,
        marginBottom: 18,
      }}>
        <Ax.Search width="14" height="14" style={{ color: 'var(--ax-fg-muted)' }} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Name, @handle or IBAN…" autoFocus
          style={{
            flex: 1, background: 'transparent', border: 0, outline: 'none',
            color: 'var(--ax-fg)', fontFamily: 'var(--ax-font-body)', fontSize: 13,
          }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto' }} className="no-scrollbar">
        <div style={{
          fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-fg-muted)',
          textTransform: 'uppercase', fontWeight: 500, marginBottom: 10,
        }}>Frequent</div>
        <div style={{
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)', borderRadius: 4,
          overflow: 'hidden',
        }}>
          {filtered.map((r, i) => {
            const isSel = recipient && recipient.id === r.id;
            return (
              <div key={r.id} onClick={() => setRecipient(r)} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', cursor: 'pointer',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--ax-border)' : 'none',
                background: isSel ? 'rgba(201,165,90,0.08)' : 'transparent',
                transition: 'background 220ms var(--ax-ease)',
              }}>
                <AxMerchant logo={r.avatar} accent={isSel ? 'var(--ax-gold)' : 'var(--ax-border-strong)'} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: 'var(--ax-fg)' }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ax-fg-muted)', marginTop: 2 }}>
                    {r.handle} · {r.note}
                  </div>
                </div>
                {isSel && <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'var(--ax-gold)', color: 'var(--ax-midnight)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11,
                }}>✓</span>}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--ax-fg-muted)', fontSize: 13 }}>
              No matches — use IBAN instead.
            </div>
          )}
        </div>
      </div>

      <div style={{ paddingBottom: 20, paddingTop: 14 }}>
        <PrimaryButton onClick={onNext} disabled={!onNext}>
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
}

// ─── Step 3: Confirm ────────────────────────────────────────────────
function StepConfirm({ amount, recipient, note, setNote, onConfirm }) {
  const [holding, setHolding] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const rafRef = React.useRef(null);
  const startRef = React.useRef(0);

  const onPressStart = () => {
    setHolding(true);
    startRef.current = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - startRef.current) / 900);
      setProgress(t);
      if (t < 1 && holdingRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (t >= 1) {
        onConfirm();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };
  // We need a ref to read the current 'holding' inside rAF
  const holdingRef = React.useRef(false);
  React.useEffect(() => { holdingRef.current = holding; }, [holding]);

  const onPressEnd = () => {
    setHolding(false);
    holdingRef.current = false;
    cancelAnimationFrame(rafRef.current);
    setProgress(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <AxEyebrow num={3} label="Confirm" />
        <h1 style={{
          fontFamily: 'var(--ax-font-display)', fontSize: 30, fontWeight: 300,
          letterSpacing: '-0.015em', margin: '12px 0 0', lineHeight: 1.05,
        }}>
          A measured <span style={{ fontStyle: 'italic', color: 'var(--ax-gold)' }}>review.</span>
        </h1>
      </div>

      {/* Recipient + amount */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <AxMerchant logo={recipient.avatar} accent="var(--ax-gold)" size={64} />
        <div style={{ fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-gold)', textTransform: 'uppercase', fontWeight: 500, marginTop: 14 }}>
          To
        </div>
        <h3 style={{
          fontFamily: 'var(--ax-font-display)', fontSize: 22, fontWeight: 300,
          margin: '4px 0 0', letterSpacing: '-0.01em',
        }}>{recipient.name}</h3>
        <div style={{ fontSize: 11, color: 'var(--ax-fg-muted)', marginTop: 4 }}>{recipient.handle}</div>

        <div className="ax-num" style={{
          fontFamily: 'var(--ax-font-display)', fontSize: 56, fontWeight: 300,
          letterSpacing: '-0.025em', marginTop: 18, color: 'var(--ax-fg)',
        }}>
          ${amount.toLocaleString('en-US').replace(/,/g, '\u2009')}
        </div>
      </div>

      {/* Details */}
      <div style={{
        background: 'var(--ax-midnight)',
        border: '1px solid var(--ax-border)', borderRadius: 4,
        overflow: 'hidden', marginBottom: 16,
      }}>
        <DetailRow label="From" value="Reserve · 4821" />
        <DetailRow label="Fee" value="$0.00" valueColor="var(--ax-gold)" mono />
        <DetailRow label="Arrival" value="Instant" valueColor="var(--ax-gold)" isLast />
      </div>

      <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (optional)"
        style={{
          width: '100%',
          padding: '12px 14px',
          background: 'var(--ax-midnight)',
          border: '1px solid var(--ax-border)', borderRadius: 4,
          color: 'var(--ax-fg)', fontFamily: 'var(--ax-font-body)', fontSize: 13,
          outline: 'none', marginBottom: 16,
        }}
        onFocus={e => e.currentTarget.style.borderColor = 'var(--ax-gold)'}
        onBlur={e => e.currentTarget.style.borderColor = 'var(--ax-border)'}
      />

      {/* Hold to confirm */}
      <div style={{ marginTop: 'auto', paddingBottom: 20 }}>
        <button
          onMouseDown={onPressStart} onMouseUp={onPressEnd} onMouseLeave={onPressEnd}
          onTouchStart={onPressStart} onTouchEnd={onPressEnd}
          style={{
            width: '100%', padding: '16px',
            background: 'var(--ax-gold)', border: 0,
            color: 'var(--ax-midnight)', borderRadius: 4, cursor: 'pointer',
            fontFamily: 'var(--ax-font-body)', fontSize: 12,
            letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 600,
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${progress * 100}%`,
            background: 'var(--ax-gold-bright)',
            transition: 'width 30ms linear',
          }} />
          <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Ax.Faceid width="18" height="18" />
            Hold to confirm
          </span>
        </button>
        <div style={{ textAlign: 'center', fontSize: 10, letterSpacing: '0.18em', color: 'var(--ax-fg-faint)', marginTop: 12, textTransform: 'uppercase' }}>
          Authenticated by Face ID
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Success ────────────────────────────────────────────────
function StepSuccess({ amount, recipient, onDone }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', padding: '0 32px', textAlign: 'center', position: 'relative',
    }}>
      {/* Background halo */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 50% 40%, rgba(201,165,90,0.18) 0%, transparent 50%)',
      }} />

      <div style={{
        position: 'relative', width: 96, height: 96, marginBottom: 32,
        animation: 'ax-fade-up 600ms var(--ax-ease)',
      }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '1px solid var(--ax-gold)', animation: 'ax-pulse-gold 2.4s infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 8, borderRadius: '50%',
          background: 'var(--ax-gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ax-midnight)',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24">
            <path d="M5 12l5 5 9-11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div style={{
        fontSize: 10, letterSpacing: '0.32em', color: 'var(--ax-gold)',
        textTransform: 'uppercase', fontWeight: 500,
      }}>Settled</div>
      <h2 style={{
        fontFamily: 'var(--ax-font-display)', fontSize: 32, fontWeight: 300,
        letterSpacing: '-0.02em', margin: '12px 0 12px', lineHeight: 1.1,
      }}>
        <span className="ax-num">${amount.toLocaleString('en-US').replace(/,/g, '\u2009')}</span>
        <br />
        <span style={{ fontStyle: 'italic', color: 'var(--ax-gold)', fontWeight: 300 }}>delivered</span>{' '}
        to {recipient.name}
      </h2>
      <p style={{ fontSize: 13, color: 'var(--ax-fg-muted)', maxWidth: 280, lineHeight: 1.5, margin: '0 0 32px' }}>
        Funds arrived instantly. A receipt has been filed against your Reserve account.
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, width: '100%' }}>
        <button style={{
          flex: 1, padding: '14px',
          background: 'transparent',
          border: '1px solid var(--ax-border-strong)',
          color: 'var(--ax-fg)', borderRadius: 4, cursor: 'pointer',
          fontFamily: 'var(--ax-font-body)', fontSize: 11,
          letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500,
        }}>Share</button>
        <button style={{
          flex: 1, padding: '14px',
          background: 'transparent',
          border: '1px solid var(--ax-border-strong)',
          color: 'var(--ax-fg)', borderRadius: 4, cursor: 'pointer',
          fontFamily: 'var(--ax-font-body)', fontSize: 11,
          letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 500,
        }}>Save receipt</button>
      </div>
      <button onClick={onDone} style={{
        width: '100%', padding: '14px',
        background: 'var(--ax-gold)', border: 0,
        color: 'var(--ax-midnight)', borderRadius: 4, cursor: 'pointer',
        fontFamily: 'var(--ax-font-body)', fontSize: 12,
        letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 600,
      }}>
        Done
      </button>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '16px',
      background: disabled ? 'rgba(201,165,90,0.18)' : 'var(--ax-gold)',
      border: 0,
      color: disabled ? 'var(--ax-fg-faint)' : 'var(--ax-midnight)',
      borderRadius: 4, cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'var(--ax-font-body)', fontSize: 12,
      letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 600,
      transition: 'background 220ms var(--ax-ease)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'var(--ax-gold-bright)'; }}
    onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = 'var(--ax-gold)'; }}>
      {children}
      <span style={{
        display: 'inline-block', width: 22, height: 1, background: 'currentColor',
        position: 'relative',
      }}>
        <span style={{
          position: 'absolute', right: -1, top: -3, width: 7, height: 7,
          borderTop: '1px solid currentColor', borderRight: '1px solid currentColor',
          transform: 'rotate(45deg)',
        }} />
      </span>
    </button>
  );
}

window.SendMoneyFlow = SendMoneyFlow;
