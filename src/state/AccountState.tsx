import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { backend as defaultBackend } from '../lib/sync/supabaseBackend';
import { BackendError, normaliseUsername, passwordProblem, usernameProblem, type Backend, type Session } from '../lib/sync/backend';
import { SyncEngine, type SyncStatus } from '../lib/sync/engine';
import { migrate } from '../lib/rewards';
import { DEFAULT_PROGRESS, type StudentProgress } from './progress';
import { useAppState } from './AppState';

interface AccountValue {
  configured: boolean;
  ready: boolean;
  session: Session | null;
  status: SyncStatus;
  statusDetail?: string;
  lastSyncedAt: string | null;
  /** Device has progress that is not (yet) in an account. */
  deviceHasProgress: boolean;
  signUp: (username: string, password: string) => Promise<void>;
  signIn: (username: string, password: string, includeDeviceProgress: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  checkUsername: (username: string) => Promise<string | null>;
  syncNow: () => Promise<void>;
}

const Ctx = createContext<AccountValue | null>(null);
const upgrade = (raw: unknown) => migrate((raw ?? {}) as never, DEFAULT_PROGRESS);
const hasProgress = (p: StudentProgress) => p.xp > 0 || Object.keys(p.completedLevels).length > 0 || p.practiceDays.length > 0 || p.favorites.length > 0 || p.collections.length > 0;

export function AccountProvider({ children, backend = defaultBackend }: { children: ReactNode; backend?: Backend }) {
  const { progress, replaceProgress } = useAppState();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!backend.configured);
  const [status, setStatus] = useState<SyncStatus>('signed-out');
  const [statusDetail, setStatusDetail] = useState<string | undefined>();
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const engine = useMemo(() => new SyncEngine(backend, { upgrade, onStatus: (s, d) => { setStatus(s); setStatusDetail(d); } }), [backend]);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  // Set while we apply a server merge, so that replace doesn't immediately echo back.
  const applying = useRef(false);

  const connect = useCallback(async (local: StudentProgress) => {
    const merged = await engine.connect(local);
    // Only flag the echo when state really changes; an identical object causes no re-render,
    // and a stale flag would swallow the student's next change.
    if (merged !== progressRef.current) { applying.current = true; replaceProgress(merged); }
    setLastSyncedAt(engine.lastSyncedAt);
  }, [engine, replaceProgress]);

  // Restore an existing session on load.
  useEffect(() => {
    if (!backend.configured) return;
    let cancelled = false;
    backend.getSession().then(async (s) => {
      if (cancelled) return;
      setSession(s);
      if (s) await connect(progressRef.current);
      setReady(true);
    }).catch(() => setReady(true));
    const off = backend.onAuthChange((s) => { if (!s) { setSession(null); engine.stop(); } });
    return () => { cancelled = true; off(); };
  }, [backend, connect, engine]);

  // Push local changes while signed in.
  useEffect(() => {
    if (!session) return;
    if (applying.current) { applying.current = false; return; }
    engine.schedule(progress);
  }, [progress, session, engine]);

  // Retry when the connection returns; pick up changes from other devices on focus.
  useEffect(() => {
    if (!session) return;
    const onOnline = () => { void engine.flush().then(() => setLastSyncedAt(engine.lastSyncedAt)); };
    const onVisible = () => { if (document.visibilityState === 'visible' && !engine.hasPending) void connect(progressRef.current); };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.removeEventListener('online', onOnline); document.removeEventListener('visibilitychange', onVisible); };
  }, [session, engine, connect]);

  const checkUsername = useCallback(async (username: string) => {
    const problem = usernameProblem(username);
    if (problem) return problem;
    try { return (await backend.usernameAvailable(username)) ? null : 'That username is taken. Please choose another.'; }
    catch (e) { return e instanceof BackendError ? e.message : 'Could not check that username.'; }
  }, [backend]);

  const signUp = useCallback(async (username: string, password: string) => {
    const u = normaliseUsername(username);
    const problem = usernameProblem(u) ?? passwordProblem(password, u);
    if (problem) throw new BackendError(problem);
    if (!(await backend.usernameAvailable(u))) throw new BackendError('That username is taken. Please choose another.', 'username-taken');
    const s = await backend.signUp(u, password);
    setSession(s);
    await connect(progressRef.current); // a new account starts with this device's progress
  }, [backend, connect]);

  const signIn = useCallback(async (username: string, password: string, includeDeviceProgress: boolean) => {
    if (!normaliseUsername(username) || !password) throw new BackendError('Enter your username and password.');
    const s = await backend.signIn(username, password);
    setSession(s);
    await connect(includeDeviceProgress ? progressRef.current : structuredClone(DEFAULT_PROGRESS));
  }, [backend, connect]);

  const clearDevice = useCallback(() => {
    applying.current = true;
    replaceProgress(structuredClone(DEFAULT_PROGRESS));
  }, [replaceProgress]);

  const signOut = useCallback(async () => {
    await engine.flush();            // don't lose the last change
    await backend.signOut();
    engine.stop();
    setSession(null);
    clearDevice();                   // shared devices: the next person starts fresh
  }, [backend, engine, clearDevice]);

  const deleteAccount = useCallback(async () => {
    await backend.deleteAccount();
    engine.stop();
    setSession(null);
    clearDevice();
  }, [backend, engine, clearDevice]);

  const syncNow = useCallback(async () => { if (session) await connect(progressRef.current); }, [session, connect]);

  const value = useMemo<AccountValue>(() => ({
    configured: backend.configured, ready, session, status, statusDetail, lastSyncedAt,
    deviceHasProgress: !session && hasProgress(progress),
    signUp, signIn, signOut, deleteAccount, checkUsername, syncNow,
  }), [backend.configured, ready, session, status, statusDetail, lastSyncedAt, progress, signUp, signIn, signOut, deleteAccount, checkUsername, syncNow]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAccount(): AccountValue {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAccount must be used inside <AccountProvider>');
  return c;
}
