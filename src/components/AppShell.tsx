import { useEffect, useRef, useState } from 'react';
import { AdSlot } from './ads/AdSlot';
import { AdConsentBanner } from './ads/AdConsent';
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { MOBILE_TABS, NAV } from './nav';
import { useAppState } from '../state/AppState';
import { useAccount } from '../state/AccountState';
import { CelebrationOverlay } from './CelebrationOverlay';
import { Toasts } from './Toasts';
import { DevModeBanner } from './DevModeBanner';
import styles from './AppShell.module.css';

const isActivePath = (to: string, pathname: string) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(to + '/'));

function AccountChip() {
  const a = useAccount();
  if (!a.configured) return null;
  return (
    <Link to="/profile#account-h" className={styles.accountChip} data-account-chip>
      {a.session ? <>@{a.session.username}<span className={`${styles.syncDot} ${a.status === 'offline' ? styles.syncOff : ''}`} aria-label={a.status === 'offline' ? 'offline' : 'synced'} /></> : 'Sign in to save progress'}
    </Link>
  );
}

function SidebarStatus() {
  const { progress, derived } = useAppState();
  return (
    <Link to="/progress" className={styles.sideStatus} aria-label={`Level ${Math.min(progress.currentLevel, 500)}, ${progress.xp} XP, ${derived.streak}-day streak. View progress.`}>
      <span className={styles.sideStatusItem}><span className="eyebrow">Level</span><span className="num">{Math.min(progress.currentLevel, 500)}</span></span>
      <span className={styles.sideStatusItem}><span className="eyebrow">XP</span><span className="num">{progress.xp}</span></span>
      <span className={styles.sideStatusItem}><span className="eyebrow">Streak</span><span className="num">{derived.streak}</span></span>
    </Link>
  );
}

function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const extra = NAV.filter((n) => !MOBILE_TABS.includes(n.to));
  return (
    <dialog
      ref={ref}
      className={styles.sheet}
      aria-label="More pages"
      onClose={() => { if (!ref.current?.open) onClose(); /* ignore a late close event after reopening */ }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.sheetInner}>
        <div className={styles.sheetHead}>
          <p className={styles.sheetTitle}>More</p>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close menu"><Icon name="close" /></button>
        </div>
        <ul className={styles.sheetList}>
          {extra.map((n) => (
            <li key={n.to}>
              <Link to={n.to} className={styles.sheetLink} aria-current={isActivePath(n.to, pathname) ? 'page' : undefined} onClick={onClose}>
                <Icon name={n.icon} /><span>{n.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}

/** Pages a student can reach before answering the welcome questions (to sign in, or change settings). */
const OPEN_BEFORE_WELCOME = ['/profile', '/settings', '/install'];

export function AppShell() {
  const { pathname, hash, search } = useLocation();
  const { progress } = useAppState();
  if (!progress.student && !OPEN_BEFORE_WELCOME.includes(pathname)) {
    const next = pathname === '/' ? '' : `?next=${encodeURIComponent(pathname + search + hash)}`;
    return <Navigate to={`/welcome${next}`} replace />;
  }
  return <Shell />;
}

function Shell() {
  const { pathname, hash } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const { dismissCelebration } = useAppState();
  // A celebration belongs to the page it happened on.
  useEffect(() => { dismissCelebration(); }, [pathname, dismissCelebration]);
  const firstRender = useRef(true);

  // On navigation: scroll to top and move focus to the new page's heading so
  // screen-reader and keyboard users know the page changed.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    // Pages with anchors, or that position themselves (the roadmap), handle their own scroll.
    if (!hash && !document.querySelector('[data-manages-scroll]')) window.scrollTo(0, 0);
    const h = document.querySelector<HTMLElement>('[data-page-title]');
    h?.focus({ preventScroll: true });
  }, [pathname, hash]);

  useEffect(() => {
    // Child effects run first, so the 404 page is already in the DOM here.
    if (document.querySelector('[data-not-found]')) { document.title = 'Page not found · Stave'; return; }
    if (pathname === '/') { document.title = 'Stave — Learn to read music'; return; }
    // Title follows the page's own heading, e.g. "Level 7 · Stave", "First Steps · Stave".
    const h1 = document.querySelector<HTMLElement>('[data-page-title]')?.innerText.trim();
    const page = NAV.find((n) => isActivePath(n.to, pathname));
    document.title = `${h1 || page?.label || 'Stave'} · Stave`;
  }, [pathname]);

  const moreActive = NAV.some((n) => !MOBILE_TABS.includes(n.to) && isActivePath(n.to, pathname));

  return (
    <div className={styles.shell}>
      <a href="#main" className="skip-link">Skip to content</a>
      <DevModeBanner />

      {/* Desktop sidebar / tablet rail */}
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.brand} aria-label="Stave home">
          <span className={styles.brandFull}><Logo /></span>
          <span className={styles.brandCompact}><Logo compact /></span>
        </Link>
        <nav aria-label="Main" className={styles.sideNav}>
          {(['learn', 'you'] as const).map((group) => (
            <ul key={group} className={styles.sideGroup}>
              {group === 'you' && <li className={styles.sideGroupLabel} aria-hidden="true">You</li>}
              {NAV.filter((n) => n.group === group).map((n) => (
                <li key={n.to}>
                  <NavLink to={n.to} end={n.to === '/'} className={({ isActive }) => `${styles.sideLink} ${isActive ? styles.active : ''}`} title={n.label}>
                    <Icon name={n.icon} size={20} />
                    <span className={styles.sideLabel}>{n.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          ))}
        </nav>
        <div className={styles.sideFoot}><AccountChip /><SidebarStatus /></div>
      </aside>

      {/* Mobile top bar */}
      <header className={styles.topbar}>
        <Link to="/" aria-label="Stave home"><Logo /></Link>
        <Link to="/profile" className={styles.iconBtn} aria-label="Profile"><Icon name="profile" /></Link>
      </header>

      <main id="main" className={styles.main} tabIndex={-1}>
        <div className={styles.content}>
          <Outlet />
        </div>
        <AdSlot />
        <footer className={styles.footer}>
          <p>Stave is free for every student. <Link to="/settings#privacy">Privacy &amp; data</Link></p>
        </footer>
      </main>
      <AdConsentBanner />

      {/* Mobile tab bar */}
      <nav aria-label="Main" className={styles.tabbar}>
        <ul>
          {MOBILE_TABS.map((to) => {
            const n = NAV.find((x) => x.to === to)!;
            return (
              <li key={to}>
                <NavLink to={to} end={to === '/'} className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}>
                  <Icon name={n.icon} size={22} /><span>{n.label}</span>
                </NavLink>
              </li>
            );
          })}
          <li>
            <button type="button" className={`${styles.tab} ${moreActive ? styles.tabActive : ''}`} onClick={() => setMoreOpen(true)} aria-haspopup="dialog" aria-expanded={moreOpen}>
              <Icon name="more" size={22} /><span>More</span>
            </button>
          </li>
        </ul>
      </nav>
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
      <CelebrationOverlay />
      <Toasts />
    </div>
  );
}
