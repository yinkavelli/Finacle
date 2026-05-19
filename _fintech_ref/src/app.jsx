// app.jsx — Axinity Mobile root: gradient shell, routing, tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "gradient": "amber",
  "aesthetic": "matte",
  "lightMode": false,
  "showHalftone": true,
  "animateGradient": true
}/*EDITMODE-END*/;

// Gradient palettes — keyed against bg
const GRADIENTS = {
  amber: {
    label: 'Amber Glow (Axinity)',
    bg: '#0A0908',
    halo: 'radial-gradient(ellipse 75% 55% at 50% 35%, rgba(255,179,71,0.16) 0%, rgba(201,165,90,0.06) 30%, transparent 65%)',
    deep: 'radial-gradient(ellipse 60% 40% at 50% 90%, rgba(154,123,61,0.12) 0%, transparent 60%)',
    spotlight: 'radial-gradient(circle at 80% 15%, rgba(212,183,106,0.10) 0%, transparent 40%)',
  },
  bronze: {
    label: 'Bronze Haze',
    bg: '#0A0908',
    halo: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(154,123,61,0.22) 0%, transparent 60%)',
    deep: 'radial-gradient(ellipse 60% 40% at 30% 100%, rgba(122,99,50,0.18) 0%, transparent 60%)',
    spotlight: 'radial-gradient(circle at 90% 80%, rgba(201,165,90,0.10) 0%, transparent 50%)',
  },
  spot: {
    label: 'Spotlight (subtle)',
    bg: '#050403',
    halo: 'radial-gradient(circle at 50% 50%, rgba(201,165,90,0.14) 0%, rgba(201,165,90,0.04) 35%, transparent 60%)',
    deep: 'transparent',
    spotlight: 'transparent',
  },
  indigo: {
    label: 'Midnight Indigo',
    bg: '#070710',
    halo: 'radial-gradient(ellipse 70% 55% at 50% 30%, rgba(86,76,156,0.18) 0%, transparent 60%)',
    deep: 'radial-gradient(ellipse 60% 45% at 50% 100%, rgba(201,165,90,0.10) 0%, transparent 60%)',
    spotlight: 'radial-gradient(circle at 85% 20%, rgba(150,130,200,0.10) 0%, transparent 40%)',
  },
};

const TABS = [
  { id: 'home',     label: 'Home',     icon: Ax.Home },
  { id: 'cards',    label: 'Cards',    icon: Ax.Card },
  { id: 'activity', label: 'Activity', icon: Ax.Activity },
  { id: 'insights', label: 'Insights', icon: Ax.Insights },
  { id: 'vaults',   label: 'Vaults',   icon: Ax.Vault },
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = React.useState('home');
  const [sendOpen, setSendOpen] = React.useState(false);
  const [openTxId, setOpenTxId] = React.useState(null);
  const [openCardId, setOpenCardId] = React.useState(null);

  // Light mode flips midnight/parchment via overrides (kept restrained)
  const light = t.lightMode;
  const grad = GRADIENTS[t.gradient] || GRADIENTS.amber;

  React.useEffect(() => {
    const r = document.documentElement;
    if (light) {
      r.style.setProperty('--ax-midnight', '#F5F3EF');
      r.style.setProperty('--ax-parchment', '#0A0908');
      r.style.setProperty('--ax-card', '#EDEAE2');
      r.style.setProperty('--ax-fg', '#0A0908');
      r.style.setProperty('--ax-fg-muted', 'rgba(10,9,8,0.55)');
      r.style.setProperty('--ax-fg-faint', 'rgba(10,9,8,0.30)');
      r.style.setProperty('--ax-border', 'rgba(10,9,8,0.10)');
      r.style.setProperty('--ax-border-strong', 'rgba(10,9,8,0.20)');
      r.style.setProperty('--ax-bg', '#F5F3EF');
    } else {
      r.style.removeProperty('--ax-midnight');
      r.style.removeProperty('--ax-parchment');
      r.style.removeProperty('--ax-card');
      r.style.removeProperty('--ax-fg');
      r.style.removeProperty('--ax-fg-muted');
      r.style.removeProperty('--ax-fg-faint');
      r.style.removeProperty('--ax-border');
      r.style.removeProperty('--ax-border-strong');
      r.style.removeProperty('--ax-bg');
    }
  }, [light]);

  // Scroll back to top on tab change
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [tab]);

  // Phone dims
  const W = 390, H = 844;

  return (
    <div data-screen-label={`App · ${tab}`} style={{
      width: W, height: H, position: 'relative',
      borderRadius: 54, overflow: 'hidden',
      background: '#000',
      boxShadow: '0 60px 120px -30px rgba(0,0,0,0.75), 0 0 0 1px rgba(245,243,239,0.04), inset 0 0 0 1.5px rgba(245,243,239,0.08)',
      fontFamily: 'var(--ax-font-body)',
    }}>
      {/* Dynamic Island */}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        width: 124, height: 36, borderRadius: 24, background: '#000', zIndex: 100,
      }} />

      {/* ==== Background gradient + halftone (UNDER cards) ==== */}
      <div style={{
        position: 'absolute', inset: 0,
        background: light ? '#F5F3EF' : grad.bg,
        zIndex: 0,
      }} />
      {!light && (
        <>
          <div style={{
            position: 'absolute', inset: 0,
            background: grad.halo,
            animation: t.animateGradient ? 'ax-amber-drift 14s ease-in-out infinite' : 'none',
            zIndex: 1,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: grad.deep,
            zIndex: 1,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: grad.spotlight,
            zIndex: 1,
          }} />
          {/* Subtle film grain */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/></filter><rect width='180' height='180' filter='url(%23n)' opacity='0.55'/></svg>")`,
            opacity: 0.06, mixBlendMode: 'overlay',
            zIndex: 2, pointerEvents: 'none',
          }} />
          {/* Halftone signature top */}
          {t.showHalftone && (
            <div style={{
              position: 'absolute', top: 60, left: -40, width: 200, height: 200,
              backgroundImage: 'radial-gradient(circle at 4px 4px, rgba(255,179,71,0.7) 1.6px, transparent 2.4px)',
              backgroundSize: '11px 11px',
              WebkitMaskImage: 'radial-gradient(ellipse at top left, #000 5%, transparent 60%)',
              maskImage: 'radial-gradient(ellipse at top left, #000 5%, transparent 60%)',
              opacity: 0.55, zIndex: 2, pointerEvents: 'none',
            }} />
          )}
          {t.showHalftone && (
            <div style={{
              position: 'absolute', bottom: 140, right: -50, width: 220, height: 220,
              backgroundImage: 'radial-gradient(circle at 4px 4px, rgba(201,165,90,0.55) 1.4px, transparent 2.2px)',
              backgroundSize: '12px 12px',
              WebkitMaskImage: 'radial-gradient(ellipse at bottom right, #000 5%, transparent 65%)',
              maskImage: 'radial-gradient(ellipse at bottom right, #000 5%, transparent 65%)',
              opacity: 0.35, zIndex: 2, pointerEvents: 'none',
            }} />
          )}
        </>
      )}

      {/* ==== Status bar ==== */}
      <AxStatusBar light={!light} />

      {/* ==== Screen content (scrollable) ==== */}
      <div ref={scrollRef}
           data-screen-label={`Screen · ${tab}`}
           style={{
        position: 'absolute', inset: 0, zIndex: 5,
        overflowY: 'auto', overflowX: 'hidden',
      }} className="no-scrollbar">
        <div key={tab} style={{ animation: 'ax-fade-up 280ms var(--ax-ease)' }}>
          {tab === 'home' && (
            <HomeScreen
              aesthetic={t.aesthetic}
              onOpenSend={() => setSendOpen(true)}
              onOpenCard={(id) => { setOpenCardId(id); setTab('cards'); }}
              onOpenTx={(id) => { setOpenTxId(id); setTab('activity'); }}
              onNav={(t) => setTab(t)}
            />
          )}
          {tab === 'cards' && (
            <CardsScreen initialCardId={openCardId} onBack={() => setTab('home')} />
          )}
          {tab === 'activity' && (
            <ActivityScreen
              openTxId={openTxId}
              onOpenTx={(id) => setOpenTxId(id)}
              onCloseTx={() => setOpenTxId(null)}
            />
          )}
          {tab === 'insights' && <InsightsScreen />}
          {tab === 'vaults' && <VaultsScreen />}
        </div>
      </div>

      {/* ==== Tab bar ==== */}
      <AxTabBar tabs={TABS} active={tab} onChange={(id) => {
        setOpenTxId(null);
        setTab(id);
      }} />

      {/* ==== Send money flow overlay ==== */}
      {sendOpen && <SendMoneyFlow onClose={() => setSendOpen(false)} />}

      {/* ==== Home indicator ==== */}
      <div style={{
        position: 'absolute', bottom: 8, left: 0, right: 0, zIndex: 200,
        display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      }}>
        <div style={{
          width: 134, height: 5, borderRadius: 100,
          background: light ? 'rgba(10,9,8,0.30)' : 'rgba(245,243,239,0.55)',
        }} />
      </div>

      {/* ==== Tweaks panel ==== */}
      <TweaksPanel title="Axinity Tweaks" noDeckControls>
        <TweakSection label="Atmosphere">
          <TweakRadio label="Gradient" value={t.gradient}
            options={[
              { label: 'Amber', value: 'amber' },
              { label: 'Bronze', value: 'bronze' },
              { label: 'Spot', value: 'spot' },
              { label: 'Indigo', value: 'indigo' },
            ]}
            onChange={v => setTweak('gradient', v)} />
          <TweakToggle label="Animate gradient drift" value={t.animateGradient}
            onChange={v => setTweak('animateGradient', v)} />
          <TweakToggle label="Halftone signature" value={t.showHalftone}
            onChange={v => setTweak('showHalftone', v)} />
        </TweakSection>

        <TweakSection label="Surfaces">
          <TweakRadio label="Card aesthetic" value={t.aesthetic}
            options={[
              { label: 'Matte', value: 'matte' },
              { label: 'Metallic', value: 'metallic' },
              { label: 'Glass', value: 'glass' },
            ]}
            onChange={v => setTweak('aesthetic', v)} />
          <TweakToggle label="Light mode (parchment)" value={t.lightMode}
            onChange={v => setTweak('lightMode', v)} />
        </TweakSection>

        <TweakSection label="Jump to">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TABS.map(tab => (
              <TweakButton key={tab.id} label={tab.label} secondary
                onClick={() => setTab(tab.id)} />
            ))}
            <TweakButton label="Send money" onClick={() => setSendOpen(true)} />
          </div>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
