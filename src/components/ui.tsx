import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from './Icon';
import styles from './ui.module.css';

const cx = (...c: Array<string | false | undefined | null>) => c.filter(Boolean).join(' ');

/* ---------- Button ---------- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
interface ButtonBase { variant?: Variant; size?: 'sm' | 'md' | 'lg'; icon?: IconName; iconAfter?: IconName; className?: string; children: ReactNode }

type ButtonProps = ButtonBase & ButtonHTMLAttributes<HTMLButtonElement>;
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, iconAfter, className, children, type = 'button', ...rest }, ref,
) {
  return (
    <button ref={ref} type={type} className={cx(styles.btn, styles[variant], styles[size], className)} {...rest}>
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
      {iconAfter && <Icon name={iconAfter} size={18} />}
    </button>
  );
});

/** A router link styled as a button — for navigation, never for actions. */
export function ButtonLink({ to, variant = 'primary', size = 'md', icon, iconAfter, className, children }: ButtonBase & { to: string }) {
  return (
    <Link to={to} className={cx(styles.btn, styles[variant], styles[size], className)}>
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
      {iconAfter && <Icon name={iconAfter} size={18} />}
    </Link>
  );
}

/* ---------- Page header ---------- */
export function PageHeader({ eyebrow, title, lede, actions }: { eyebrow?: string; title: string; lede?: ReactNode; actions?: ReactNode }) {
  return (
    <header className={styles.pageHeader}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className={styles.pageTitle} tabIndex={-1} data-page-title>{title}</h1>
        {lede && <p className={styles.lede}>{lede}</p>}
      </div>
      {actions && <div className={styles.headerActions}>{actions}</div>}
    </header>
  );
}

/* ---------- Panel ---------- */
export function Panel({ children, className, as: As = 'section', tone = 'raised', ...rest }:
  { children: ReactNode; className?: string; as?: 'section' | 'div' | 'article' | 'aside'; tone?: 'raised' | 'sunk' | 'plain'; 'aria-labelledby'?: string }) {
  return <As className={cx(styles.panel, styles[`panel_${tone}`], className)} {...rest}>{children}</As>;
}

export function SectionTitle({ id, children, action }: { id?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className={styles.sectionTitleRow}>
      <h2 id={id} className={styles.sectionTitle}>{children}</h2>
      {action}
    </div>
  );
}

/* ---------- Stat ---------- */
export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className={styles.stat}>
      <dt className={styles.statLabel}>{label}</dt>
      <dd className={styles.statValue}>{value}</dd>
      {sub && <dd className={styles.statSub}>{sub}</dd>}
    </div>
  );
}

/* ---------- Progress bar ---------- */
export function ProgressBar({ value, max, label, color }: { value: number; max: number; label: string; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={styles.progress} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <div className={styles.progressFill} style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

/* ---------- Stars ---------- */
export function Stars({ earned, size = 16 }: { earned: number; size?: number }) {
  return (
    <span className={styles.stars} role="img" aria-label={`${earned} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < earned ? styles.starOn : styles.starOff}><Icon name="star" size={size} filled={i < earned} /></span>
      ))}
    </span>
  );
}

/* ---------- Notice: honest status of unbuilt features ---------- */
export function Notice({ title, children, icon = 'info' }: { title: string; children: ReactNode; icon?: IconName }) {
  return (
    <div className={styles.notice} role="note">
      <Icon name={icon} size={20} className={styles.noticeIcon} />
      <div>
        <p className={styles.noticeTitle}>{title}</p>
        <div className={styles.noticeBody}>{children}</div>
      </div>
    </div>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <svg className={styles.emptyArt} viewBox="0 0 120 40" aria-hidden="true">
        {[8, 14, 20, 26, 32].map((y) => <line key={y} x1="0" x2="120" y1={y} y2={y} />)}
        <line x1="92" x2="92" y1="8" y2="32" />
        <rect x="58" y="14" width="10" height="3.5" />
      </svg>
      <p className={styles.emptyTitle}>{title}</p>
      {children && <div className={styles.emptyBody}>{children}</div>}
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  );
}

/* ---------- Segmented control (radio group) ---------- */
export function Segmented<T extends string | number>({ name, label, value, options, onChange }:
  { name: string; label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <fieldset className={styles.segmented}>
      <legend className="visually-hidden">{label}</legend>
      {options.map((o) => (
        <label key={String(o.value)} className={cx(styles.segment, o.value === value && styles.segmentOn)}>
          <input type="radio" name={name} value={String(o.value)} checked={o.value === value} onChange={() => onChange(o.value)} />
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

export { cx };
