/**
 * DEVELOPMENT-ONLY in-browser backend for exercising account screens without a
 * server. Accounts live in localStorage under "stave-mock:"; each account can
 * only read its own progress (mirroring the database's row-level security).
 * Enable with  localStorage.setItem('stave:dev-mock-backend', '1')  and reload.
 * Simulate going offline with  window.__staveMockOffline = true.
 * Never used in production builds (guarded by import.meta.env.DEV).
 */
import { BackendError, normaliseUsername, type Backend, type Session } from './backend';

interface Account { userId: string; username: string; pwHash: string }
const K = { accounts: 'stave-mock:accounts', session: 'stave-mock:session', progress: (id: string) => `stave-mock:progress:${id}` };
const read = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : d; } catch { return d; } };
const write = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));

async function hash(pw: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`stave-mock:${pw}`));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const offline = () => (window as unknown as { __staveMockOffline?: boolean }).__staveMockOffline === true;
const net = async () => { await new Promise((r) => setTimeout(r, 60)); if (offline()) throw new BackendError('Can’t reach the server. Check your connection and try again.', 'network'); };

export class MockBackend implements Backend {
  readonly configured = true;
  private listeners = new Set<(s: Session | null) => void>();
  private current(): Session | null { return read<Session | null>(K.session, null); }

  async getSession() { return this.current(); }
  onAuthChange(cb: (s: Session | null) => void) { this.listeners.add(cb); return () => { this.listeners.delete(cb); }; }
  private emit(s: Session | null) { this.listeners.forEach((l) => l(s)); }

  async usernameAvailable(username: string) { await net(); return !read<Account[]>(K.accounts, []).some((a) => a.username === normaliseUsername(username)); }

  async signUp(username: string, password: string) {
    await net();
    const u = normaliseUsername(username);
    const accounts = read<Account[]>(K.accounts, []);
    if (accounts.some((a) => a.username === u)) throw new BackendError('That username is taken. Please choose another.', 'username-taken');
    const acc = { userId: crypto.randomUUID(), username: u, pwHash: await hash(password) };
    write(K.accounts, [...accounts, acc]);
    const s = { userId: acc.userId, username: u };
    write(K.session, s); this.emit(s);
    return s;
  }

  async signIn(username: string, password: string) {
    await net();
    const acc = read<Account[]>(K.accounts, []).find((a) => a.username === normaliseUsername(username));
    if (!acc || acc.pwHash !== await hash(password)) throw new BackendError('That username and password don’t match.', 'invalid-credentials');
    const s = { userId: acc.userId, username: acc.username };
    write(K.session, s); this.emit(s);
    return s;
  }

  async signOut() { localStorage.removeItem(K.session); this.emit(null); }

  async loadProgress() {
    await net();
    const s = this.current(); if (!s) throw new BackendError('Not signed in.');
    const row = read<{ data: unknown; updatedAt: string } | null>(K.progress(s.userId), null);
    return row;
  }

  async saveProgress(data: unknown) {
    await net();
    const s = this.current(); if (!s) throw new BackendError('Not signed in.');
    write(K.progress(s.userId), { data, updatedAt: new Date().toISOString() });
  }

  async deleteAccount() {
    await net();
    const s = this.current(); if (!s) throw new BackendError('Not signed in.');
    write(K.accounts, read<Account[]>(K.accounts, []).filter((a) => a.userId !== s.userId));
    localStorage.removeItem(K.progress(s.userId));
    await this.signOut();
  }
}
