/**
 * Keeps this device's progress and the account's copy in step.
 * Device-first: the app always works from local progress; the account copy is
 * merged in on sign-in and when the app regains focus, and changes are pushed
 * (debounced). Failed pushes are retried when the connection returns.
 */
import type { StudentProgress } from '../../state/progress';
import type { Backend } from './backend';
import { merge } from './merge';

export type SyncStatus = 'signed-out' | 'syncing' | 'synced' | 'offline' | 'error';

export interface EngineOptions {
  debounceMs?: number;
  /** Bring a stored document up to the current shape (the app's migrate()). */
  upgrade: (raw: unknown) => StudentProgress;
  onStatus?: (s: SyncStatus, detail?: string) => void;
}

export class SyncEngine {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pending: StudentProgress | null = null;
  private status: SyncStatus = 'signed-out';
  lastSyncedAt: string | null = null;

  constructor(private backend: Backend, private opts: EngineOptions) {}

  private set(s: SyncStatus, detail?: string) { this.status = s; this.opts.onStatus?.(s, detail); }
  get current() { return this.status; }

  /** Pull the account copy, merge with local, push the result. Returns what the app should now use. */
  async connect(local: StudentProgress): Promise<StudentProgress> {
    this.set('syncing');
    try {
      const remote = await this.backend.loadProgress();
      const merged = remote ? merge(local, this.opts.upgrade(remote.data)) : local;
      await this.backend.saveProgress(merged);
      this.lastSyncedAt = new Date().toISOString();
      this.set('synced');
      return merged;
    } catch (e) {
      this.set('offline', (e as Error).message);
      this.pending = local;
      return local;
    }
  }

  /** Queue a push of the latest progress. */
  schedule(p: StudentProgress) {
    this.pending = p;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => { void this.flush(); }, this.opts.debounceMs ?? 1500);
  }

  async flush(): Promise<boolean> {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    const p = this.pending;
    if (!p) return true;
    this.set('syncing');
    try {
      await this.backend.saveProgress(p);
      if (this.pending === p) this.pending = null;
      this.lastSyncedAt = new Date().toISOString();
      this.set('synced');
      return true;
    } catch (e) {
      this.set('offline', (e as Error).message);
      return false;
    }
  }

  get hasPending() { return this.pending !== null; }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.pending = null;
    this.set('signed-out');
  }
}
