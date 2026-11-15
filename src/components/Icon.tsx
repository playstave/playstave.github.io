/**
 * Stave icon set — drawn on a 24px grid, 1.75 stroke, round caps.
 * Original line icons; several borrow shapes from engraving (staff lines,
 * note heads, the metronome) to keep the product's visual language coherent.
 */
export type IconName =
  | 'home' | 'learn' | 'roadmap' | 'library' | 'practice' | 'progress'
  | 'achievements' | 'profile' | 'settings' | 'more' | 'close' | 'arrow-right'
  | 'lock' | 'check' | 'star' | 'flame' | 'search' | 'chevron-left' | 'info' | 'expand' | 'heart' | 'folder' | 'clock';

const paths: Record<IconName, JSX.Element> = {
  home: <><path d="M4 10.5 12 4l8 6.5" /><path d="M6 9v10h12V9" /><path d="M10 19v-5h4v5" /></>,
  learn: <><path d="M3.5 6.5c3-1.3 5.8-1.3 8.5.5 2.7-1.8 5.5-1.8 8.5-.5v12c-3-1.3-5.8-1.3-8.5.5-2.7-1.8-5.5-1.8-8.5-.5z" /><path d="M12 7v12" /></>,
  roadmap: <><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6" /></>,
  library: <><path d="M5 3.5h10l4 4v13H5z" /><path d="M15 3.5v4h4" /><path d="M8 11h8M8 13.5h8M8 16h8" /></>,
  practice: <><path d="M9 3.5h6l3.5 17h-13z" /><path d="M12 15 16 6" /><path d="M7.5 16.5h9" /></>,
  progress: <><path d="M4 20h16" /><path d="M7 16v-4M12 16V8M17 16V5" /></>,
  achievements: <><circle cx="12" cy="9" r="5" /><path d="m9 13.5-1.5 7L12 18l4.5 2.5-1.5-7" /></>,
  profile: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" /></>,
  more: <><circle cx="5.5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="18.5" cy="12" r="1.2" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
  'chevron-left': <path d="M15 5l-7 7 7 7" />,
  lock: <><rect x="5.5" y="10.5" width="13" height="9.5" rx="1.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  star: <path d="m12 3.8 2.5 5.2 5.6.7-4.1 3.9 1 5.6L12 16.5l-5 2.7 1-5.6-4.1-3.9 5.6-.7z" />,
  flame: <path d="M12 21c3.6 0 6-2.4 6-5.8 0-3.2-2.3-5-3.3-7.7-.5 2-1.6 3-2.7 3.5.3-3-1-5.6-3.5-7.5.2 3-1.9 5-3 7-.7 1.3-1.5 2.8-1.5 4.7C4 18.6 6.4 21 12 21z" />,
  search: <><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5" /></>,
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  folder: <path d="M3.5 6.5h6l2 2h9v10h-17z" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.8v.2" /></>,
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  /** Provide a label only when the icon conveys meaning on its own. */
  label?: string;
  filled?: boolean;
}

export function Icon({ name, size = 20, className, label, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
