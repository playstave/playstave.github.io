import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { MOBILE_TABS, NAV } from './nav';
import { useAppState } from '../state/AppState';
import styles from './AppShell.module.css';

const isActivePath = (to: string, pathname: string) => (to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(to + '/'));

function SidebarStatus() {
  const { progress, derived } = useAppState();
  return (
    <Link to="/progress" className={styles.sideStatus} aria-label={`Level ${progress.currentLevel}, ${progress.xp} XP, ${derived.streak}-day streak. View progress.`}>
      <span className={styles.sideStatusItem}><span className="eyebrow">Level</span><span className="num">{progress.currentLevel}</span></span>
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
      onClose={onClose}
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

export function AppShell() {
  const { pathname, hash } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const firstRender = useRef(true);

  // On navigation: scroll to top and move focus to the new page's heading so
  // screen-reader and keyboard users know the page changed.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (hash) return; // the page scrolls to its own anchor
    window.scrollTo(0, 0);
    const h = document.querySelector<HTMLElement>('[data-page-title]');
    h?.focus({ preventScroll: true });
  }, [pathname, hash]);

  useEffect(() => {
    // Child effects run first, so the 404 page is already in the DOM here.
    if (document.querySelector('[data-not-found]')) { document.title = 'Page not found · Stave'; return; }
    const page = NAV.find((n) => isActivePath(n.to, pathname));
    document.title = page && page.to !== '/' ? `${page.label} · Stave` : 'Stave — Learn to read music';
  }, [pathname]);

  const moreActive = NAV.some((n) => !MOBILE_TABS.includes(n.to) && isActivePath(n.to, pathname));

  return (
    <div className={styles.shell}>
      <a href="#main" className="skip-link">Skip to content</a>

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
        <div className={styles.sideFoot}><SidebarStatus /></div>
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
        <footer className={styles.footer}>
          <p>Stave is free for every student. <Link to="/settings#privacy">Privacy &amp; data</Link></p>
        </footer>
      </main>

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
    </div>
  );
}
