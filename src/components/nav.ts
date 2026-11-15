import type { IconName } from './Icon';

export interface NavItem { to: string; label: string; icon: IconName; group: 'learn' | 'you' }

/** Single source of truth for primary navigation (sidebar, rail, tab bar, sheet). */
export const NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home', group: 'learn' },
  { to: '/learn', label: 'Learn', icon: 'learn', group: 'learn' },
  { to: '/roadmap', label: 'Roadmap', icon: 'roadmap', group: 'learn' },
  { to: '/library', label: 'Library', icon: 'library', group: 'learn' },
  { to: '/practice', label: 'Practice', icon: 'practice', group: 'learn' },
  { to: '/play', label: 'Play-along', icon: 'mic', group: 'learn' },
  { to: '/tuner', label: 'Tuner', icon: 'tuner', group: 'learn' },
  { to: '/progress', label: 'Progress', icon: 'progress', group: 'you' },
  { to: '/achievements', label: 'Achievements', icon: 'achievements', group: 'you' },
  { to: '/profile', label: 'Profile', icon: 'profile', group: 'you' },
  { to: '/settings', label: 'Settings', icon: 'settings', group: 'you' },
];

/** Shown in the mobile tab bar; everything else lives behind "More". */
export const MOBILE_TABS = ['/', '/learn', '/library', '/practice'];
