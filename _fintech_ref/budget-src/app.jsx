// app.jsx — Budget App root

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "gradient": "amber",
  "showHalftone": true,
  "animateGradient": true,
  "showFab": true
}/*EDITMODE-END*/;

const GRADIENTS = {
  amber: {
    label: 'Amber Glow',
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
    label: 'Spotlight',
    bg: '#050403',
    halo: 'radial-gradient(circle at 50% 50%, rgba(201,165,90,0.14) 0%, rgba(201,165,90,0.04) 35%, transparent 60%)',
    deep: 'transparent',
    spotlight: 'transparent',
  },
};

const BG_TABS = [
  { id: 'home',     label: 'Home',     icon: BgTabIcons.Home },
  { id: 'txns',     label: 'Txns',     icon: BgTabIcons.Txns },
  { id: 'budget',   label: 'Budget',   icon: BgTabIcons.Budget },
  { id: 'insights', label: 'Insights', icon: BgTabIcons.Insights },
  { id: 'settings', label: 'Settings', icon: BgTabIcons.Settings },
];

function BgApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = React.useState('home');
  const [chatOpen, setChatOpen] = React.useState(false);
  const [openTxnId, setOpenTxnId] = React.useState(null);

  const grad = GRADIENTS[t.gradient] || GRADIENTS.amber;
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [tab]);

  const W = 390, H = 844;

  return (
    <div data-screen-label={`Budget · ${tab}`} style={{
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

      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, background: grad.bg, zIndex: 0 }} />
      <div style={{
        position: 'absolute', inset: 0, background: grad.halo,
        animation: t.animateGradient ? 'ax-amber-drift 14s ease-in-out infinite' : 'none',
        zIndex: 1,
      }} />
      <div style={{ position: 'absolute', inset: 0, background: grad.deep, zIndex: 1 }} />
      <div style={{ position: 'absolute', inset: 0, background: grad.spotlight, zIndex: 1 }} />

      {/* Film grain */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/></filter><rect width='180' height='180' filter='url(%23n)' opacity='0.55'/></svg>")`,
        opacity: 0.06, mixBlendMode: 'overlay',
      }} />

      {/* Halftone signatures */}
      {t.showHalftone && (
        <>
          <div style={{
            position: 'absolute', top: 60, left: -40, width: 200, height: 200,
            backgroundImage: 'radial-gradient(circle at 4px 4px, rgba(255,179,71,0.7) 1.6px, transparent 2.4px)',
            backgroundSize: '11px 11px',
            WebkitMaskImage: 'radial-gradient(ellipse at top left, #000 5%, transparent 60%)',
            maskImage: 'radial-gradient(ellipse at top left, #000 5%, transparent 60%)',
            opacity: 0.55, zIndex: 2, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: 140, right: -50, width: 220, height: 220,
            backgroundImage: 'radial-gradient(circle at 4px 4px, rgba(201,165,90,0.55) 1.4px, transparent 2.2px)',
            backgroundSize: '12px 12px',
            WebkitMaskImage: 'radial-gradient(ellipse at bottom right, #000 5%, transparent 65%)',
            maskImage: 'radial-gradient(ellipse at bottom right, #000 5%, transparent 65%)',
            opacity: 0.35, zIndex: 2, pointerEvents: 'none',
          }} />
        </>
      )}

      {/* Status bar */}
      <AxStatusBar light />

      {/* Scrollable screen */}
      <div ref={scrollRef}
           data-screen-label={`Screen · ${tab}`}
           style={{
             position: 'absolute', inset: 0, zIndex: 5,
             overflowY: 'auto', overflowX: 'hidden',
           }} className="no-scrollbar">
        <div key={tab} style={{ animation: 'ax-fade-up 280ms var(--ax-ease)' }}>
          {tab === 'home' && (
            <BgHomeScreen
              onOpenTxn={(id) => { setOpenTxnId(id); setTab('txns'); }}
              onNav={setTab}
              onOpenChat={() => setChatOpen(true)}
            />
          )}
          {tab === 'txns' && (
            <BgTxnsScreen
              openTxnId={openTxnId}
              onOpenTxn={setOpenTxnId}
              onCloseTxn={() => setOpenTxnId(null)}
            />
          )}
          {tab === 'budget' && <BgBudgetScreen />}
          {tab === 'insights' && <BgInsightsScreen onNav={setTab} />}
          {tab === 'settings' && <BgSettingsScreen />}
        </div>
      </div>

      {/* Chat FAB */}
      {t.showFab && !chatOpen && <BgChatFab onOpen={() => setChatOpen(true)} />}

      {/* Tab bar */}
      <AxTabBar tabs={BG_TABS} active={tab} onChange={(id) => {
        setOpenTxnId(null);
        setTab(id);
      }} />

      {/* Chat overlay */}
      {chatOpen && <BgChatSheet onClose={() => setChatOpen(false)} />}

      {/* Home indicator */}
      <div style={{
        position: 'absolute', bottom: 8, left: 0, right: 0, zIndex: 200,
        display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      }}>
        <div style={{
          width: 134, height: 5, borderRadius: 100,
          background: 'rgba(245,243,239,0.55)',
        }} />
      </div>

      {/* Tweaks */}
      <TweaksPanel title="Budget App Tweaks" noDeckControls>
        <TweakSection label="Atmosphere">
          <TweakRadio label="Gradient" value={t.gradient}
            options={[
              { label: 'Amber', value: 'amber' },
              { label: 'Bronze', value: 'bronze' },
              { label: 'Spot', value: 'spot' },
            ]}
            onChange={v => setTweak('gradient', v)} />
          <TweakToggle label="Animate gradient drift" value={t.animateGradient}
            onChange={v => setTweak('animateGradient', v)} />
          <TweakToggle label="Halftone signature" value={t.showHalftone}
            onChange={v => setTweak('showHalftone', v)} />
          <TweakToggle label="Chat assistant FAB" value={t.showFab}
            onChange={v => setTweak('showFab', v)} />
        </TweakSection>

        <TweakSection label="Jump to">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {BG_TABS.map(b => (
              <TweakButton key={b.id} label={b.label} secondary
                onClick={() => setTab(b.id)} />
            ))}
            <TweakButton label="Open Atlas" onClick={() => setChatOpen(true)} />
          </div>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<BgApp />);
