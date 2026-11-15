/**
 * Supabase implementation of the Backend interface.
 * Configuration comes from VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * (see .env.example). The anon key is public by design; the database's
 * row-level security (supabase/schema.sql) is what protects student data.
 */
import { createClient, type SupabaseClient, type AuthError } from '@supabase/supabase-js';
import { BackendError, normaliseUsername, syntheticEmail, type Backend, type Session } from './backend';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function friendly(e: AuthError | Error | { message?: string; code?: string; status?: number } | null): BackendError {
  const msg = (e?.message ?? '').toLowerCase();
  if (msg.includes('invalid login credentials')) return new BackendError('That username and password don’t match.', 'invalid-credentials');
  if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('duplicate')) return new BackendError('That username is taken. Please choose another.', 'username-taken');
  if (msg.includes('rate limit') || (e as { status?: number })?.status === 429) return new BackendError('Too many attempts. Please wait a minute and try again.', 'rate-limited');
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) return new BackendError('Can’t reach the server. Check your connection and try again.', 'network');
  if (msg.includes('email not confirmed')) return new BackendError('This account isn’t active yet (the server requires email confirmation — see setup notes).', 'other');
  return new BackendError('Something went wrong. Please try again.', 'other');
}

const toSession = (user: { id: string; user_metadata?: Record<string, unknown> } | null | undefined): Session | null =>
  user ? { userId: user.id, username: String(user.user_metadata?.username ?? '') } : null;

export class SupabaseBackend implements Backend {
  readonly configured: boolean;
  private client: SupabaseClient | null;

  constructor() {
    this.configured = !!(url && anonKey);
    this.client = this.configured ? createClient(url!, anonKey!, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'stave:auth' } }) : null;
  }

  private c(): SupabaseClient {
    if (!this.client) throw new BackendError('Accounts are not set up on this copy of Stave.', 'not-configured');
    return this.client;
  }

  async getSession(): Promise<Session | null> {
    if (!this.client) return null;
    const { data } = await this.client.auth.getSession();
    return toSession(data.session?.user);
  }

  onAuthChange(cb: (s: Session | null) => void): () => void {
    if (!this.client) return () => {};
    const { data } = this.client.auth.onAuthStateChange((_e, session) => cb(toSession(session?.user)));
    return () => data.subscription.unsubscribe();
  }

  async usernameAvailable(username: string): Promise<boolean> {
    const { data, error } = await this.c().rpc('username_available', { name: normaliseUsername(username) });
    if (error) throw friendly(error);
    return data === true;
  }

  async signUp(username: string, password: string): Promise<Session> {
    const u = normaliseUsername(username);
    const { data, error } = await this.c().auth.signUp({ email: syntheticEmail(u), password, options: { data: { username: u } } });
    if (error) throw friendly(error);
    // With "Confirm email" off (required), signUp returns a session immediately.
    if (!data.session) throw new BackendError('Account created, but the server requires email confirmation. Turn off “Confirm email” in Supabase Auth settings.', 'other');
    return toSession(data.user)!;
  }

  async signIn(username: string, password: string): Promise<Session> {
    const { data, error } = await this.c().auth.signInWithPassword({ email: syntheticEmail(username), password });
    if (error) throw friendly(error);
    return toSession(data.user)!;
  }

  async signOut(): Promise<void> {
    await this.c().auth.signOut();
  }

  async loadProgress() {
    const s = await this.getSession();
    if (!s) throw new BackendError('Not signed in.', 'other');
    const { data, error } = await this.c().from('progress').select('data, updated_at').eq('user_id', s.userId).maybeSingle();
    if (error) throw friendly(error);
    return data ? { data: data.data as unknown, updatedAt: data.updated_at as string } : null;
  }

  async saveProgress(progress: unknown): Promise<void> {
    const s = await this.getSession();
    if (!s) throw new BackendError('Not signed in.', 'other');
    const { error } = await this.c().from('progress').upsert({ user_id: s.userId, data: progress, version: 2 });
    if (error) throw friendly(error);
  }

  async deleteAccount(): Promise<void> {
    const { error } = await this.c().rpc('delete_own_account');
    if (error) throw friendly(error);
    await this.c().auth.signOut();
  }
}

import { MockBackend } from './mockBackend';

const useMock = import.meta.env.DEV && (() => { try { return localStorage.getItem('stave:dev-mock-backend') === '1'; } catch { return false; } })();

/** The app's backend: Supabase when configured; the in-browser mock only in dev builds when explicitly enabled. */
export const backend: Backend = useMock ? new MockBackend() : new SupabaseBackend();
