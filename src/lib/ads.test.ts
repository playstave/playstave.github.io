import { beforeEach, describe, expect, it } from 'vitest';
import { _resetAdsForTest, getAdConsent, isAdFreeRoute, loadAdScript, readAdConfig, setAdConsent } from './ads';

describe('ads configuration', () => {
  it('is off unless a real publisher ID and slot are set', () => {
    expect(readAdConfig({})).toBeNull();
    expect(readAdConfig({ VITE_ADSENSE_CLIENT: 'ca-pub-XXXXXXXX', VITE_ADSENSE_SLOT: '123' })).toBeNull();
    expect(readAdConfig({ VITE_ADSENSE_CLIENT: 'ca-pub-1234567890123456' })).toBeNull();
    expect(readAdConfig({ VITE_ADSENSE_CLIENT: 'ca-pub-1234567890123456', VITE_ADSENSE_SLOT: '9876543210' })).toEqual({ client: 'ca-pub-1234567890123456', slot: '9876543210' });
  });
});

describe('ad-free routes', () => {
  it('never shows ads during learning', () => {
    for (const p of ['/level/1', '/level/500', '/tuner', '/play', '/play/scale-d', '/welcome', '/library/ode-to-joy', '/practice/daily', '/install', '/privacy']) expect(isAdFreeRoute(p), p).toBe(true);
  });
  it('allows ads on browsing pages', () => {
    for (const p of ['/', '/learn', '/learn/world/2', '/roadmap', '/library', '/practice', '/progress', '/achievements', '/profile', '/settings']) expect(isAdFreeRoute(p), p).toBe(false);
  });
});

// Minimal browser stand-ins (the test runner has no DOM).
const store = new Map<string, string>();
const head: Record<string, unknown>[] = [];
const g = globalThis as Record<string, unknown>;
g.localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) };
g.window = g; g.dispatchEvent = () => true;
const doc = {
  head: { appendChild: (el: Record<string, unknown>) => void head.push(el) },
  createElement: () => ({ dataset: {} as Record<string, string> }) as Record<string, unknown>,
  querySelector: () => (head.length ? head[0] : null),
} as unknown as Document;

describe('consent', () => {
  beforeEach(() => { store.clear(); head.length = 0; _resetAdsForTest(); delete (g as { adsbygoogle?: unknown }).adsbygoogle; });
  it('starts unanswered and remembers the choice', () => {
    expect(getAdConsent()).toBeNull();
    setAdConsent('yes'); expect(getAdConsent()).toBe('yes');
    setAdConsent('no'); expect(getAdConsent()).toBe('no');
    setAdConsent(null); expect(getAdConsent()).toBeNull();
  });
  it('loads Google’s script once, asking for non-personalised ads first', () => {
    loadAdScript('ca-pub-1234567890123456', doc);
    loadAdScript('ca-pub-1234567890123456', doc);
    expect(head).toHaveLength(1);
    expect(head[0].src).toBe('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456');
    expect(head[0].async).toBe(true);
    expect(window.adsbygoogle?.requestNonPersonalizedAds).toBe(1);
  });
});
