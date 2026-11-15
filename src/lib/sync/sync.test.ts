import { describe, expect, it, vi } from 'vitest';
import { merge } from './merge';
import { SyncEngine } from './engine';
import { passwordProblem, syntheticEmail, usernameProblem, type Backend } from './backend';
import { amountForKey, xpFromKeys, XP } from '../xp';
import { recordActivity, migrate } from '../rewards';
import { DEFAULT_PROGRESS, type StudentProgress } from '../../state/progress';

const fresh = (): StudentProgress => structuredClone(DEFAULT_PROGRESS);
const day = (d: number) => new Date(2026, 10, d, 10);
const play = (s: StudentProgress, n: number, stars: number, d = 14) => recordActivity(s, { kind: 'lesson', level: n, stars, score: 60 + stars * 10 }, day(d)).state;

describe('xp from keys', () => {
  it('matches the amounts actually paid by the reward rules', () => {
    let s = fresh();
    for (let n = 1; n <= 50; n++) s = play(s, n, (n % 3) + 1, 1 + (n % 9));
    s = recordActivity(s, { kind: 'daily', correct: 3, total: 5 }, day(14)).state;
    s = recordActivity(s, { kind: 'practiceSet' }, day(14)).state;
    expect(xpFromKeys(s.awarded)).toBe(s.xp);
  });
  it('knows every key kind', () => {
    expect(amountForKey('level:10:pass')).toBe(XP.checkpointPass);
    expect(amountForKey('level:7:pass')).toBe(XP.lessonPass);
    expect(amountForKey('milestone:100')).toBe(XP.milestone100);
    expect(amountForKey('streak:7')).toBe(25);
    expect(amountForKey('unknown')).toBe(0);
  });
});

describe('merge', () => {
  it('device ahead of account: keeps everything from both, no double XP', () => {
    let account = play(play(fresh(), 1, 1), 2, 2);
    let device = play(play(play(fresh(), 1, 3), 2, 1), 3, 2);
    account = recordActivity(account, { kind: 'daily', correct: 5, total: 5 }, day(13)).state;
    device = { ...device, favorites: ['twinkle'], openedScores: ['twinkle', 'ode-to-joy'] };
    const m = merge(device, account);
    expect(m.currentLevel).toBe(4);
    expect(m.completedLevels[1]).toEqual({ stars: 3, bestScore: 90 });
    expect(m.completedLevels[2]).toEqual({ stars: 2, bestScore: 80 });
    expect(m.xp).toBe(xpFromKeys(m.awarded));
    expect(m.awarded['daily:2026-11-13']).toBe(true);
    expect(m.counters.scoresOpened).toBe(2);
    expect(m.favorites).toEqual(['twinkle']);
  });
  it('is idempotent and symmetric in what it keeps', () => {
    const a = play(play(fresh(), 1, 2), 2, 3);
    const b = play(fresh(), 1, 3);
    const ab = merge(a, b);
    expect(merge(ab, b)).toEqual(ab);
    const ba = merge(b, a);
    expect(ba.completedLevels).toEqual(ab.completedLevels);
    expect(ba.xp).toBe(ab.xp);
    expect(Object.keys(ba.achievements).sort()).toEqual(Object.keys(ab.achievements).sort());
  });
  it('keeps the earliest badge date and unions collections by id', () => {
    const a = { ...fresh(), achievements: { 'first-lesson': '2026-11-10T00:00:00Z' }, collections: [{ id: 'c1', name: 'Mine', scoreIds: ['a'], createdAt: '2026-11-01' }] };
    const b = { ...fresh(), achievements: { 'first-lesson': '2026-11-05T00:00:00Z' }, collections: [{ id: 'c1', name: 'Mine', scoreIds: ['b'], createdAt: '2026-11-01' }, { id: 'c2', name: 'Other', scoreIds: [], createdAt: '2026-11-02' }] };
    const m = merge(a, b);
    expect(m.achievements['first-lesson']).toBe('2026-11-05T00:00:00Z');
    expect(m.collections.map((c) => [c.id, c.scoreIds])).toEqual([['c1', ['a', 'b']], ['c2', []]]);
  });
  it('accepts an old-format account copy via migrate', () => {
    const v1 = { currentLevel: 3, completedLevels: { 1: { stars: 2, bestScore: 80 }, 2: { stars: 1, bestScore: 60 } }, practiceDays: [], noteDrill: { answered: 0, correct: 0 }, displayName: '', xp: 0 };
    const m = merge(fresh(), migrate(v1 as never, DEFAULT_PROGRESS, day(14)));
    expect(m.currentLevel).toBe(3);
    expect(m.xp).toBe(20 + 10 + 20 + 5);
  });
});

class FakeBackend implements Backend {
  configured = true;
  stored: unknown = null;
  saves = 0;
  failNext = 0;
  async getSession() { return { userId: 'u1', username: 'mira' }; }
  onAuthChange() { return () => {}; }
  async usernameAvailable() { return true; }
  async signUp() { return { userId: 'u1', username: 'mira' }; }
  async signIn() { return { userId: 'u1', username: 'mira' }; }
  async signOut() {}
  async loadProgress() { if (this.failNext) { this.failNext--; throw new Error('network down'); } return this.stored ? { data: this.stored, updatedAt: 'x' } : null; }
  async saveProgress(d: unknown) { if (this.failNext) { this.failNext--; throw new Error('network down'); } this.saves++; this.stored = structuredClone(d); }
  async deleteAccount() { this.stored = null; }
}
const upgrade = (raw: unknown) => migrate(raw as never, DEFAULT_PROGRESS, day(14));

describe('sync engine', () => {
  it('first sign-in uploads device progress', async () => {
    const b = new FakeBackend();
    const local = play(fresh(), 1, 2);
    const e = new SyncEngine(b, { upgrade });
    const out = await e.connect(local);
    expect(out).toEqual(local);
    expect((b.stored as StudentProgress).completedLevels[1].stars).toBe(2);
    expect(e.current).toBe('synced');
  });
  it('signing in on a new device brings the account progress down', async () => {
    const b = new FakeBackend();
    b.stored = play(play(fresh(), 1, 3), 2, 2);
    const out = await new SyncEngine(b, { upgrade }).connect(fresh());
    expect(out.currentLevel).toBe(3);
    expect(out.xp).toBe((b.stored as StudentProgress).xp);
  });
  it('debounces pushes and sends only the latest progress', async () => {
    vi.useFakeTimers();
    const b = new FakeBackend();
    const e = new SyncEngine(b, { upgrade, debounceMs: 1000 });
    let s = fresh();
    for (let n = 1; n <= 3; n++) { s = play(s, n, 1); e.schedule(s); }
    expect(b.saves).toBe(0);
    await vi.advanceTimersByTimeAsync(1100);
    expect(b.saves).toBe(1);
    expect((b.stored as StudentProgress).currentLevel).toBe(4);
    vi.useRealTimers();
  });
  it('goes offline on failure, keeps the change and succeeds on retry', async () => {
    const b = new FakeBackend();
    const statuses: string[] = [];
    const e = new SyncEngine(b, { upgrade, onStatus: (st) => statuses.push(st) });
    const s = play(fresh(), 1, 1);
    e.schedule(s);
    b.failNext = 1;
    expect(await e.flush()).toBe(false);
    expect(e.current).toBe('offline');
    expect(e.hasPending).toBe(true);
    expect(await e.flush()).toBe(true);
    expect(e.current).toBe('synced');
    expect((b.stored as StudentProgress).completedLevels[1]).toBeTruthy();
    expect(statuses).toEqual(['syncing', 'offline', 'syncing', 'synced']);
  });
  it('connect failure keeps local progress and marks offline', async () => {
    const b = new FakeBackend();
    b.failNext = 1;
    const local = play(fresh(), 1, 1);
    const e = new SyncEngine(b, { upgrade });
    expect(await e.connect(local)).toEqual(local);
    expect(e.current).toBe('offline');
  });
});

describe('sign-up rules', () => {
  it('validates usernames', () => {
    expect(usernameProblem('ab')).toMatch(/3/);
    expect(usernameProblem('a'.repeat(21))).toMatch(/20/);
    expect(usernameProblem('mira lee')).toMatch(/letters/);
    expect(usernameProblem('admin')).toMatch(/reserved/);
    expect(usernameProblem('12345')).toMatch(/letter/);
    expect(usernameProblem('  Mira_7 ')).toBeNull();
  });
  it('validates passwords', () => {
    expect(passwordProblem('short')).toMatch(/8/);
    expect(passwordProblem('mira_7rocks', 'Mira_7')).toMatch(/username/);
    expect(passwordProblem('correct horse')).toBeNull();
  });
  it('derives a non-deliverable email from the username', () => {
    expect(syntheticEmail(' Mira_7 ')).toBe('mira_7@students.stave.invalid');
  });
});

describe('student setup (instrument, experience)', () => {
  it('survives migration and the newer answer wins a merge', async () => {
    const { migrate } = await import('../rewards');
    const { DEFAULT_PROGRESS } = await import('../../state/progress');
    const { merge } = await import('./merge');
    const old = migrate({} as never, DEFAULT_PROGRESS);
    expect(old.student).toBeNull();
    const a = { ...old, student: { instrument: 'violin' as const, experience: 'new' as const, setAt: '2026-11-15T10:00:00.000Z' } };
    const b = { ...old, student: { instrument: 'cello' as const, experience: 'some' as const, setAt: '2026-11-15T12:00:00.000Z' } };
    expect(merge(a, b).student?.instrument).toBe('cello');
    expect(merge(b, a).student?.instrument).toBe('cello');
    expect(merge(a, old).student?.instrument).toBe('violin');
    expect(merge(old, a).student?.instrument).toBe('violin');
    expect(migrate(JSON.parse(JSON.stringify(a)), DEFAULT_PROGRESS).student).toEqual(a.student);
  });
});
