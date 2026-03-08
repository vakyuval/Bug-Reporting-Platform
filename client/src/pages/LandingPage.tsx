import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STATS = [
  { value: '2,400+', label: 'Bugs Reported', sub: 'across all teams' },
  { value: '98%', label: 'Resolution Rate', sub: 'avg. last 90 days' },
  { value: '< 2h', label: 'First Response', sub: 'median time' },
  { value: '99.9%', label: 'Uptime', sub: 'platform reliability' },
];

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#1877F2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Structured Reporting',
    desc: 'Submit bug reports with categorized issue types, detailed descriptions, and file attachments — all in one standardized flow.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="#1877F2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Admin Dashboard',
    desc: 'Administrators get a full view of all reports with triage controls — approve, escalate, and resolve with a single action.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="#1877F2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="#1877F2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Full Visibility',
    desc: 'Track every report through its lifecycle. Users see their own submissions; admins see everything — with status and timestamps.',
  },
];

const STATUS_EXAMPLES = [
  { label: 'NEW',      color: '#1877F2', bg: '#EBF3FF', desc: 'Submitted, pending review' },
  { label: 'APPROVED', color: '#854d0e', bg: '#fef9c3', desc: 'Acknowledged by admin' },
  { label: 'RESOLVED', color: '#00A400', bg: '#F0F2F5', desc: 'Issue closed' },
];

const STATUS_DARK: Record<string, { color: string; bg: string }> = {
  NEW:      { color: '#60a5fa', bg: '#1e3a5f' },
  APPROVED: { color: '#fef9c3', bg: '#854d0e' },
  RESOLVED: { color: '#00A400', bg: '#166534' },
};

function GradientOrb({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{
      position: 'absolute', borderRadius: '50%',
      filter: 'blur(80px)', pointerEvents: 'none', ...style,
    }} />
  );
}

function AnimatedNumber({ target }: { target: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.6s ease, transform 0.6s ease',
    }}>
      {target}
    </div>
  );
}


export function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userEmail, userStatus, logout } = useAuth();

  const handleLoginClick = () => {
    if (!userEmail) {
      navigate('/login');
      return;
    }
    if (userStatus === 'admin') {
      navigate('/reports');
    } else {
      navigate('/my-reports');
    }
  };

  const [dark, setDark] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.body.classList.contains('dark'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    if (next) { document.body.classList.add('dark'); }
    else       { document.body.classList.remove('dark'); }
    localStorage.setItem('darkMode', String(next));
  };

  const bg        = dark ? '#0f172a' : '#FFFFFF';
  const bgMuted   = dark ? '#1e293b' : '#F0F2F5';
  const bgCard    = dark ? '#1e293b' : '#FFFFFF';
  const border    = dark ? '#334155' : '#E4E6EB';
  const textMain  = dark ? '#f1f5f9' : '#1C1E21';
  const textMuted = dark ? '#94a3b8' : '#65676B';
  const textFaint = dark ? '#475569' : '#BCC0C4';
  const navBg     = scrolled
    ? dark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)'
    : 'transparent';

  const previewRows = [
    { type: 'Bug',     title: 'Submit button crashes on double-click', status: 'NEW',      time: '2m ago' },
    { type: 'Feature', title: 'Add dark mode for accessibility',       status: 'APPROVED', time: '1h ago' },
    { type: 'Bug',     title: 'Validation broken on mobile',           status: 'RESOLVED', time: '2d ago' },
  ];

  // Dark mode toggle button — shared between desktop and mobile
  const darkToggleBtn = (
    <button
      onClick={toggleDark}
      aria-label="Toggle dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        background: 'none', border: `1px solid ${border}`, borderRadius: 8,
        width: 36, height: 36, display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', fontSize: '1rem',
        transition: 'border-color 0.2s, background 0.2s', flexShrink: 0,
      }}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        .landing-nav * { box-sizing: border-box; margin: 0; padding: 0; }
        .landing > *:not(.landing-nav) * { box-sizing: border-box; margin: 0; padding: 0; }
        .landing-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; transition: all 0.3s ease; }
        .landing-nav-inner { max-width: 1200px; margin: 0 auto; padding: 1.1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .landing-nav-logo { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; }
        .landing-nav-actions { display: flex; align-items: center; gap: 0.5rem; }
        .landing-hamburger { display: none; background: none; border-radius: 8px; padding: 0.4rem 0.6rem; cursor: pointer; flex-direction: column; gap: 4px; }
        .landing-hamburger span { display: block; width: 20px; height: 2px; border-radius: 2px; }
        .landing-mobile-menu { display: none; flex-direction: column; gap: 0.5rem; padding: 1rem 1.5rem; }
        .landing-mobile-menu.open { display: flex; }
        .cta-primary { display: inline-flex; align-items: center; gap: 0.5rem; background: #1877F2; color: white; border: none; padding: 0.8rem 1.75rem; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; }
        .cta-primary:hover { background: #0e6ae0; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(24,119,242,0.35); }
        .cta-primary-lg { padding: 0.9rem 2rem; font-size: 1rem; }
        .cta-secondary { display: inline-flex; align-items: center; gap: 0.5rem; background: transparent; color: #1877F2; border: 1.5px solid #1877F2; padding: 0.8rem 1.75rem; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; }
        .cta-secondary:hover { background: #EBF3FF; transform: translateY(-1px); }
        .nav-btn { background: none; border: none; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500; cursor: pointer; padding: 0.5rem 0.75rem; border-radius: 6px; transition: all 0.15s; white-space: nowrap; }
        .nav-btn:hover { color: #1877F2; background: rgba(24,119,242,0.08); }
        .feature-card { border-radius: 16px; padding: 1.75rem; transition: all 0.25s ease; }
        .feature-card:hover { border-color: #1877F2 !important; box-shadow: 0 8px 32px rgba(24,119,242,0.1); transform: translateY(-4px); }
        .stat-card { padding: 1.75rem 1.25rem; border-radius: 16px; text-align: center; transition: all 0.25s; }
        .stat-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.12); transform: translateY(-3px); }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        .status-pill { display: inline-flex; align-items: center; padding: 0.3rem 0.75rem; border-radius: 100px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; }
        .divider-line { width: 48px; height: 3px; background: #1877F2; border-radius: 2px; margin: 0 auto 1rem; }
        .hero-preview { animation: float 4s ease-in-out infinite; }
        @media (max-width: 1024px) { .hero-grid { gap: 2.5rem; } .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          .landing-nav-actions { display: none; }
          .landing-hamburger { display: flex; }
          .hero-grid { grid-template-columns: 1fr; gap: 2.5rem; text-align: center; }
          .hero-left-content { display: flex; flex-direction: column; align-items: center; }
          .hero-buttons { justify-content: center !important; }
          .hero-social-proof { justify-content: center !important; }
          .hero-preview-wrap { display: none; }
          .features-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .status-flow { flex-direction: column !important; align-items: center !important; }
          .status-arrow { transform: rotate(90deg); }
          .section-pad { padding: 3.5rem 1.25rem !important; }
          .hero-section { padding: 7rem 1.25rem 3.5rem !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .stat-card { padding: 1.25rem 0.875rem; }
          .hero-buttons { flex-direction: column !important; width: 100%; }
          .hero-buttons button { width: 100%; justify-content: center; }
          .cta-banner-btn { width: 100%; justify-content: center; }
          .footer-inner { flex-direction: column !important; gap: 0.5rem; text-align: center; }
        }
      `}</style>

      <div className="landing" style={{
        fontFamily: "'DM Sans', sans-serif",
        background: bg, color: textMain,
        minHeight: '100vh', overflowX: 'hidden',
        transition: 'background 0.25s ease, color 0.25s ease',
      }}>

        {/* ── NAV ── */}
        <nav className="landing-nav" style={{
          background: navBg,
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? `1px solid ${border}` : 'none',
          boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.08)' : 'none',
        }}>
          <div className="landing-nav-inner">
            <div className="landing-nav-logo" onClick={() => navigate('/')}>
              <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🐛</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', color: textMain }}>
                Bug Reporter
              </span>
            </div>

            {/* Desktop nav actions */}
            <div className="landing-nav-actions">
              {/* Logged-in nav links */}
              {userEmail && (
                <>
                  <button className="nav-btn" style={{ color: textMuted }} onClick={() => navigate('/report')}>
                    Report Bug
                  </button>
                  {userStatus === 'allowed' && (
                    <button className="nav-btn" style={{ color: textMuted }} onClick={() => navigate('/my-reports')}>
                      My Reports
                    </button>
                  )}
                  {userStatus === 'admin' && (
                    <button className="nav-btn" style={{ color: textMuted }} onClick={() => navigate('/reports')}>
                      Admin Reports
                    </button>
                  )}
                  <button className="nav-btn" style={{ color: '#ef4444' }} onClick={() => { logout(); navigate('/login'); }}>
                    Logout
                  </button>
                </>
              )}
              {darkToggleBtn}
              {/* Auth buttons — only when logged out */}
              {!userEmail && (
                <>
                  <button className="nav-btn" style={{ color: textMuted }} onClick={() => navigate('/signup')}>
                    Sign Up
                  </button>
                  <button className="cta-primary" onClick={() => navigate('/login')} style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}>
                    Login
                  </button>
                </>
              )}
            </div>

            {/* Hamburger — always show on mobile */}
            <button
              className="landing-hamburger"
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Menu"
              style={{ border: `1px solid ${border}` }}
            >
              <span style={{ background: textMain }} />
              <span style={{ background: textMain }} />
              <span style={{ background: textMain }} />
            </button>
          </div>

          {/* Mobile dropdown */}
          <div
            className={`landing-mobile-menu${mobileMenuOpen ? ' open' : ''}`}
            style={{ background: bgCard, borderTop: `1px solid ${border}` }}
          >
            {darkToggleBtn}
            {userEmail ? (
              <>
                <button className="nav-btn" style={{ color: textMuted, textAlign: 'left' }}
                  onClick={() => { setMobileMenuOpen(false); navigate('/report'); }}>
                  Report Bug
                </button>
                {userStatus === 'allowed' && (
                  <button className="nav-btn" style={{ color: textMuted, textAlign: 'left' }}
                    onClick={() => { setMobileMenuOpen(false); navigate('/my-reports'); }}>
                    My Reports
                  </button>
                )}
                {userStatus === 'admin' && (
                  <button className="nav-btn" style={{ color: textMuted, textAlign: 'left' }}
                    onClick={() => { setMobileMenuOpen(false); navigate('/reports'); }}>
                    Admin Reports
                  </button>
                )}
                <button className="nav-btn" style={{ color: '#ef4444', textAlign: 'left' }}
                  onClick={() => { setMobileMenuOpen(false); logout(); navigate('/login'); }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="nav-btn" style={{ color: textMuted, textAlign: 'left' }}
                  onClick={() => { setMobileMenuOpen(false); navigate('/signup'); }}>
                  Sign Up
                </button>
                <button className="cta-primary" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>
                  Login
                </button>
              </>
            )}
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="hero-section" style={{
          position: 'relative', minHeight: '100vh',
          display: 'flex', alignItems: 'center',
          padding: '8rem 2rem 5rem', overflow: 'hidden',
        }}>
          <GradientOrb style={{ width: 500, height: 500, background: 'rgba(24,119,242,0.07)', top: -100, right: -150 }} />
          <GradientOrb style={{ width: 350, height: 350, background: 'rgba(24,119,242,0.05)', bottom: 0, left: -80 }} />
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
            backgroundImage: `radial-gradient(circle, ${dark ? '#334155' : '#D0D7E3'} 1px, transparent 1px)`,
            backgroundSize: '32px 32px', opacity: 0.45,
          }} />

          <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
            <div className="hero-grid">
              <div className="hero-left-content" style={{ animation: 'fadeUp 0.7s ease both' }}>
                <h1 style={{
                  fontSize: 'clamp(2.2rem, 5vw, 3.75rem)', fontWeight: 700,
                  lineHeight: 1.1, letterSpacing: '-0.03em',
                  marginBottom: '1.25rem', color: textMain,
                }}>
                  Report bugs.{' '}
                  <span style={{ color: '#1877F2' }}>Track progress.</span>
                  {' '}Resolve issues faster.
                </h1>

                <p style={{
                  fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', lineHeight: 1.7,
                  color: textMuted, marginBottom: '2rem', maxWidth: 460,
                }}>
                  A centralized bug reporting platform for reporting, triaging, and resolving bugs and vulnerabilities. It helps organizations surface critical issues early, improve visibility across teams, reduce risk, and build greater trust in the quality and security of their products.
                </p>

                <div className="hero-buttons" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                  <button className="cta-primary cta-primary-lg" onClick={handleLoginClick}>
                    Submit a Report
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path d="M13 7l5 5-5 5M6 12h12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                </div>

                <div className="hero-social-proof" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: textMuted, fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex' }}>
                    {['#1877F2', '#0e6ae0', '#3b9eff'].map((c, i) => (
                      <div key={i} style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: c, border: `2px solid ${bgCard}`,
                        marginLeft: i > 0 ? -7 : 0,
                      }} />
                    ))}
                  </div>
                  <span>Used by <strong style={{ color: textMain }}>40+ engineers</strong> across teams</span>
                </div>
              </div>

              <div className="hero-preview-wrap" style={{ animation: 'fadeUp 0.7s 0.15s ease both' }}>
                <div className="hero-preview" style={{
                  background: bgCard, border: `1px solid ${border}`,
                  borderRadius: 20, overflow: 'hidden',
                  boxShadow: dark
                    ? '0 24px 64px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)'
                    : '0 24px 64px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)',
                }}>
                  <div style={{
                    background: dark ? '#0f172a' : '#F0F2F5',
                    padding: '0.65rem 1rem', borderBottom: `1px solid ${border}`,
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                  }}>
                    {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
                      <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                    ))}
                    <div style={{
                      flex: 1, marginLeft: '0.4rem', background: bgCard, borderRadius: 5,
                      padding: '0.22rem 0.6rem', fontSize: '0.68rem', color: textMuted,
                      border: `1px solid ${border}`,
                    }}>my-reports</div>
                  </div>
                  <div style={{ padding: '0.85rem 1rem 0.6rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: textMain }}>My Reports</div>
                  </div>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '72px 68px 1fr 74px 62px 64px',
                    padding: '0 1rem 0.4rem', borderBottom: `2px solid ${border}`,
                  }}>
                    {['ID', 'Type', 'Description', 'Status', 'Created', 'Actions'].map(h => (
                      <div key={h} style={{ fontSize: '0.7rem', fontWeight: 700, color: textMuted }}>{h}</div>
                    ))}
                  </div>
                  {previewRows.map((r, i) => {
                    const sc = dark ? STATUS_DARK[r.status] : {
                      color: STATUS_EXAMPLES.find(s => s.label === r.status)!.color,
                      bg:    STATUS_EXAMPLES.find(s => s.label === r.status)!.bg,
                    };
                    return (
                      <div key={i} style={{
                        display: 'grid', gridTemplateColumns: '72px 68px 1fr 74px 62px 64px',
                        padding: '0.55rem 1rem',
                        borderBottom: i < previewRows.length - 1 ? `1px solid ${border}` : 'none',
                        alignItems: 'center',
                      }}>
                        <div style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: textMuted }}>a1b2c3...</div>
                        <div style={{ fontSize: '0.74rem', color: textMain }}>{r.type}</div>
                        <div style={{ fontSize: '0.74rem', color: textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '0.5rem' }}>{r.title}</div>
                        <div>
                          <span style={{ background: sc.bg, color: sc.color, padding: '2px 7px', borderRadius: 12, fontSize: '0.65rem', fontWeight: 700 }}>
                            {r.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: textMuted }}>3/8/2026</div>
                        <div style={{ display: 'flex', gap: 3 }}>
                          <span style={{ background: dark ? '#334155' : '#64748b', color: 'white', borderRadius: 5, padding: '2px 6px', fontSize: '0.65rem', fontWeight: 600 }}>View</span>
                          {r.status === 'NEW' && (
                            <span style={{ background: '#ef4444', color: 'white', borderRadius: 5, padding: '2px 6px', fontSize: '0.65rem', fontWeight: 600 }}>Del</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ height: '0.75rem' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="section-pad" style={{ background: bgMuted, padding: '4rem 2rem', borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="stats-grid">
              {STATS.map((s) => (
                <div key={s.label} className="stat-card" style={{ background: bgCard, border: `1px solid ${border}` }}>
                  <div style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 700, color: '#1877F2', letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
                    <AnimatedNumber target={s.value} />
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: textMain, marginBottom: '0.2rem' }}>{s.label}</div>
                  <div style={{ fontSize: '0.75rem', color: textFaint }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="section-pad" style={{ padding: '5rem 2rem', background: bg }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="divider-line" />
              <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '0.75rem', color: textMain }}>
                Bug Reporter Platform
              </h2>
              <p style={{ color: textMuted, fontSize: '0.95rem', maxWidth: 460, margin: '0 auto' }}>
                A streamlined workflow from bug discovery to resolution.
              </p>
            </div>
            <div className="features-grid">
              {FEATURES.map((f) => (
                <div key={f.title} className="feature-card" style={{ background: bgCard, border: `1px solid ${border}` }}>
                  <div style={{ width: 44, height: 44, background: dark ? 'rgba(24,119,242,0.15)' : '#EBF3FF', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: textMain }}>{f.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: textMuted, lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATUS LIFECYCLE ── */}
        <section className="section-pad" style={{ padding: '4.5rem 2rem', background: bgMuted }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <div className="divider-line" />
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '0.75rem', color: textMain }}>
              Clear status at every step
            </h2>
            <p style={{ color: textMuted, marginBottom: '2.5rem', fontSize: '0.9rem' }}>
              Every report has a clear lifecycle so nothing falls through the cracks.
            </p>
            <div className="status-flow" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {STATUS_EXAMPLES.map((s, i) => {
                const sc = dark ? STATUS_DARK[s.label] : s;
                return (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: bgCard, border: `1px solid ${border}`, borderRadius: 12, padding: '1.25rem 1.5rem', textAlign: 'center', minWidth: 130, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <span className="status-pill" style={{ background: sc.bg, color: sc.color, marginBottom: '0.6rem', display: 'inline-block' }}>
                        {s.label}
                      </span>
                      <p style={{ fontSize: '0.75rem', color: textMuted, margin: 0 }}>{s.desc}</p>
                    </div>
                    {i < STATUS_EXAMPLES.length - 1 && (
                      <svg className="status-arrow" width="18" height="18" fill="none" viewBox="0 0 24 24">
                        <path d="M9 18l6-6-6-6" stroke={textFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="section-pad" style={{ padding: '5rem 2rem', background: '#1877F2', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <GradientOrb style={{ width: 400, height: 400, background: 'rgba(255,255,255,0.08)', top: -150, right: -80 }} />
          <GradientOrb style={{ width: 300, height: 300, background: 'rgba(255,255,255,0.06)', bottom: -100, left: -50 }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 700, color: 'white', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
              Did you find a bug?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Log in and submit report in under 2 minutes.
            </p>
            <button
              className="cta-banner-btn"
              onClick={handleLoginClick}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'white', color: '#1877F2', border: 'none',
                padding: '0.9rem 2.25rem', borderRadius: 8, fontSize: '1rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
              onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              Get Started →
            </button>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ padding: '1.5rem 2rem', borderTop: `1px solid ${border}`, background: bgCard }}>
          <div className="footer-inner" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>🐛</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: textMain }}>Bug Reporter</span>
              <span style={{ fontSize: '0.8rem', color: textFaint, marginLeft: '0.25rem' }}>© 2026</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}