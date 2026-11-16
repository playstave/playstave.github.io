import { describe, expect, it } from 'vitest';
import { safeNext } from './safeNext';

describe('safeNext', () => {
  it('keeps in-app paths', () => {
    for (const p of ['/', '/learn', '/level/12', '/library?q=bach&sort=title', '/settings#privacy']) expect(safeNext(p)).toBe(p);
  });
  it('rejects anything that could leave the app', () => {
    for (const p of ['//evil.com', '/\\evil.com', '\\\\evil.com', '/\\/evil.com', 'https://evil.com', 'javascript:alert(1)', ' /learn', '/le arn', '/\tevil', 'evil.com', '']) expect(safeNext(p), p).toBe('/');
    expect(safeNext(null)).toBe('/');
  });
});
