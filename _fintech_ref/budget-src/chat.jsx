// chat.jsx — Assistant FAB + chat sheet
// The FAB shows on every screen. Tapping opens a chat sheet where the user
// can ask money questions (with a few canned prompts to start).

function BgChatFab({ onOpen }) {
  return (
    <button onClick={onOpen} style={{
      position: 'absolute', right: 18, bottom: 96, zIndex: 25,
      width: 54, height: 54, borderRadius: 4,
      background: 'var(--ax-gold)',
      border: '1px solid var(--ax-gold-bright)',
      color: 'var(--ax-midnight)', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 12px 30px -8px rgba(201,165,90,0.55), 0 0 0 4px rgba(201,165,90,0.10)',
      transition: 'transform 220ms var(--ax-ease)',
      animation: 'ax-pulse-gold 3.2s infinite',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
      <svg width="22" height="22" viewBox="0 0 24 24">
        <path d="M21 12c0 4.4-4 8-9 8-1.4 0-2.7-.2-3.8-.7L3 21l1.6-4.5C3.6 15.4 3 13.7 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="8.5" cy="12" r="0.9" fill="currentColor"/>
        <circle cx="12" cy="12" r="0.9" fill="currentColor"/>
        <circle cx="15.5" cy="12" r="0.9" fill="currentColor"/>
      </svg>
    </button>
  );
}

// ─── Chat sheet (full takeover) ────────────────────────────────────
function BgChatSheet({ onClose }) {
  const [messages, setMessages] = React.useState([
    {
      from: 'assistant',
      text: 'Good evening, Khalid. I\'ve reviewed your May ledger. Where shall we look?',
      time: 'Now',
    },
  ]);
  const [draft, setDraft] = React.useState('');
  const [typing, setTyping] = React.useState(false);
  const scrollRef = React.useRef(null);

  const prompts = [
    'How am I doing this month?',
    'Where can I cut $300?',
    'Forecast my savings',
    'What are my unused subs?',
  ];

  const RESPONSES = {
    'how am i doing': {
      text: 'You\'re on a Watch trajectory. Spent $8,420 in 19 days — at this pace you\'ll close at $13,738 vs $14,500 income. Coverage 95%. Dining and Shopping are the swing items.',
      followups: ['Why is dining over?', 'Show me a cut plan'],
    },
    'cut': {
      text: 'I can reclaim $544/mo with three small shifts: dining cap (–$280), pause shopping 14 days (–$226), drop 3 unused subs (–$52). Apply all?',
      followups: ['Apply the dining cut', 'Cancel unused subs'],
    },
    'forecast': {
      text: 'If you stick to plan, May closes with $762 surplus. Six-month projection: $4,572 to savings, plus the $2k auto-save you already route. That\'s $28K added to your vault by year-end.',
      followups: ['Boost auto-save', 'Compare to last year'],
    },
    'sub': {
      text: 'Three subscriptions sit unused for 2+ months: Anghami ($14.99), Audible ($24.99), Headspace ($12.99). Total drag: $52.97/mo. Want me to draft the cancellations?',
      followups: ['Yes, cancel all three', 'Just Anghami'],
    },
    'dining': {
      text: 'You spent $918 vs $600 planned. Weekend dinners (Sat/Fri) drove 71% of it. Capping weekend dining at 2 outings would bring you back to $600.',
      followups: ['Set the cap', 'Show all dining'],
    },
    'default': {
      text: 'Let me pull that. Looking at your last 30 days of activity… I can compare months, suggest cuts, forecast savings, or flag unused subscriptions. Which would help?',
      followups: ['Compare months', 'Suggest cuts'],
    },
  };

  const matchResponse = (q) => {
    const lower = q.toLowerCase();
    if (lower.includes('how') || lower.includes('doing') || lower.includes('month')) return RESPONSES['how am i doing'];
    if (lower.includes('cut') || lower.includes('save') || lower.includes('reclaim')) return RESPONSES['cut'];
    if (lower.includes('forecast') || lower.includes('predict') || lower.includes('saving')) return RESPONSES['forecast'];
    if (lower.includes('sub') || lower.includes('cancel')) return RESPONSES['sub'];
    if (lower.includes('dining') || lower.includes('food') || lower.includes('eat')) return RESPONSES['dining'];
    return RESPONSES['default'];
  };

  const send = (text) => {
    if (!text.trim()) return;
    const userMsg = { from: 'user', text, time: 'Now' };
    setMessages(m => [...m, userMsg]);
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      const resp = matchResponse(text);
      setMessages(m => [...m, { from: 'assistant', text: resp.text, followups: resp.followups, time: 'Now' }]);
      setTyping(false);
    }, 900 + Math.random() * 400);
  };

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'var(--ax-midnight)',
      animation: 'ax-fade-up 280ms var(--ax-ease)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Status bar safe area */}
      <div style={{ height: 60, flexShrink: 0 }} />

      {/* Header */}
      <div style={{
        padding: '0 24px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--ax-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1a1612 0%, #2a2218 100%)',
            border: '1px solid var(--ax-border-gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--ax-gold)', position: 'relative',
          }}>
            <Ax.Spark width="18" height="18" />
            <span style={{
              position: 'absolute', bottom: -1, right: -1, width: 10, height: 10,
              borderRadius: '50%', background: 'var(--ax-gold)',
              border: '2px solid var(--ax-midnight)',
              animation: 'ax-pulse-gold 2.4s infinite',
            }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--ax-font-display)', fontSize: 17, fontWeight: 400, lineHeight: 1 }}>
              <span style={{ fontStyle: 'italic', color: 'var(--ax-gold)' }}>Atlas</span>
              <span style={{ color: 'var(--ax-fg-muted)', fontStyle: 'italic', fontWeight: 300, fontSize: 12, marginLeft: 4 }}>
                · your assistant
              </span>
            </div>
            <div style={{
              fontSize: 10, letterSpacing: '0.28em', color: 'var(--ax-fg-muted)',
              textTransform: 'uppercase', fontWeight: 500, marginTop: 3,
            }}>
              Online · reviewing May
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{
          width: 38, height: 38, borderRadius: 4,
          background: 'transparent', border: '1px solid var(--ax-border)',
          color: 'var(--ax-fg)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Ax.Close width="16" height="16" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{
        flex: 1, overflow: 'auto', padding: '20px 24px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }} className="no-scrollbar">
        {messages.map((m, i) => (
          <Message key={i} msg={m} onFollowup={send} />
        ))}
        {typing && <TypingBubble />}
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div style={{
          padding: '0 24px 14px',
          display: 'flex', gap: 6, flexWrap: 'wrap',
        }}>
          {prompts.map(p => (
            <button key={p} onClick={() => send(p)} style={{
              padding: '8px 12px', borderRadius: 2,
              background: 'transparent',
              border: '1px solid var(--ax-border-gold-soft)',
              color: 'var(--ax-gold)',
              fontFamily: 'var(--ax-font-body)', fontSize: 11,
              cursor: 'pointer',
              transition: 'all 220ms var(--ax-ease)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--ax-gold)'; e.currentTarget.style.color = 'var(--ax-midnight)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ax-gold)'; }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <div style={{
        padding: '12px 24px 24px',
        borderTop: '1px solid var(--ax-border)',
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(draft); }}
          placeholder="Ask about your money…"
          style={{
            flex: 1, padding: '12px 14px',
            background: 'var(--ax-card)',
            border: '1px solid var(--ax-border)', borderRadius: 4,
            color: 'var(--ax-fg)', fontFamily: 'var(--ax-font-body)', fontSize: 13,
            outline: 'none',
            transition: 'border-color 220ms var(--ax-ease)',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--ax-gold)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--ax-border)'} />
        <button onClick={() => send(draft)} disabled={!draft.trim()} style={{
          width: 44, height: 44, borderRadius: 4,
          background: draft.trim() ? 'var(--ax-gold)' : 'rgba(201,165,90,0.18)',
          border: 0,
          color: draft.trim() ? 'var(--ax-midnight)' : 'var(--ax-fg-faint)',
          cursor: draft.trim() ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 220ms var(--ax-ease)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M5 12l14-7-3 8 3 8-14-7v-2z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function Message({ msg, onFollowup }) {
  const isUser = msg.from === 'user';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      animation: 'ax-slide-up 240ms var(--ax-ease)',
    }}>
      <div style={{
        maxWidth: '82%',
        padding: '12px 14px',
        background: isUser ? 'var(--ax-gold)' : 'var(--ax-card)',
        border: `1px solid ${isUser ? 'var(--ax-gold)' : 'var(--ax-border)'}`,
        borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
        color: isUser ? 'var(--ax-midnight)' : 'var(--ax-fg)',
        fontFamily: isUser ? 'var(--ax-font-body)' : 'var(--ax-font-display)',
        fontSize: isUser ? 13 : 15, fontWeight: isUser ? 400 : 300,
        lineHeight: isUser ? 1.5 : 1.45,
        whiteSpace: 'pre-wrap',
      }}>
        {msg.text}
      </div>
      {msg.followups && msg.followups.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: '82%' }}>
          {msg.followups.map(f => (
            <button key={f} onClick={() => onFollowup(f)} style={{
              padding: '6px 10px', borderRadius: 2,
              background: 'transparent',
              border: '1px solid var(--ax-border-gold-soft)',
              color: 'var(--ax-gold)',
              fontFamily: 'var(--ax-font-body)', fontSize: 11,
              cursor: 'pointer',
              transition: 'all 220ms var(--ax-ease)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ax-gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--ax-border-gold-soft)'}>
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TypingBubble() {
  return (
    <div style={{
      alignSelf: 'flex-start',
      padding: '14px 16px',
      background: 'var(--ax-card)',
      border: '1px solid var(--ax-border)',
      borderRadius: '12px 12px 12px 2px',
      display: 'flex', alignItems: 'center', gap: 4,
      animation: 'ax-slide-up 240ms var(--ax-ease)',
    }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: 'var(--ax-gold)',
          animation: `ax-typing 1.2s infinite ${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

window.BgChatFab = BgChatFab;
window.BgChatSheet = BgChatSheet;
