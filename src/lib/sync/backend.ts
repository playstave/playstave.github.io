/** What the app needs from an accounts/storage backend. Supabase implements it; tests use a fake. */
export interface Session { userId: string; username: string }

export class BackendError extends Error {
  constructor(message: string, readonly code: 'invalid-credentials' | 'username-taken' | 'network' | 'not-configured' | 'rate-limited' | 'other' = 'other') { super(message); }
}

export interface Backend {
  readonly configured: boolean;
  getSession(): Promise<Session | null>;
  onAuthChange(cb: (s: Session | null) => void): () => void;
  usernameAvailable(username: string): Promise<boolean>;
  signUp(username: string, password: string): Promise<Session>;
  signIn(username: string, password: string): Promise<Session>;
  signOut(): Promise<void>;
  loadProgress(): Promise<{ data: unknown; updatedAt: string } | null>;
  saveProgress(data: unknown): Promise<void>;
  deleteAccount(): Promise<void>;
}

/* ---------- usernames & passwords (validated on the client and again by the database) ---------- */

const RESERVED = new Set(['admin', 'administrator', 'root', 'stave', 'support', 'moderator', 'teacher', 'system', 'null', 'undefined']);

export const normaliseUsername = (raw: string) => raw.trim().toLowerCase();

export function usernameProblem(raw: string): string | null {
  const u = normaliseUsername(raw);
  if (u.length < 3) return 'Use at least 3 characters.';
  if (u.length > 20) return 'Use 20 characters or fewer.';
  if (!/^[a-z0-9_]+$/.test(u)) return 'Use only letters, numbers and underscores (no spaces).';
  if (RESERVED.has(u)) return 'That username is reserved. Please choose another.';
  if (/^\d+$/.test(u)) return 'Include at least one letter.';
  return null;
}

export function passwordProblem(pw: string, username?: string): string | null {
  if (pw.length < 8) return 'Use at least 8 characters.';
  if (pw.length > 72) return 'Use 72 characters or fewer.';
  if (username && pw.toLowerCase().includes(normaliseUsername(username))) return 'Don’t include your username in your password.';
  return null;
}

/** Students never give an email. Supabase needs one, so a non-deliverable address is derived from the username. */
export const syntheticEmail = (username: string) => `${normaliseUsername(username)}@students.stave.invalid`;
