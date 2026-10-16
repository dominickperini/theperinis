import { createHash, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

export const COOKIE = 'admin_session';

function adminKey(): string {
  // Trim spaces and line breaks that a copy and paste can add.
  return (process.env.ADMIN_KEY ?? import.meta.env.ADMIN_KEY ?? '').trim();
}

const token = (key: string) => createHash('sha256').update(`theperinis-admin:${key}`).digest('hex');

function same(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function keyMatches(given: string): boolean {
  const expected = adminKey();
  return expected !== '' && same(given.trim(), expected);
}

export function isAdmin(cookies: AstroCookies): boolean {
  const expected = adminKey();
  const value = cookies.get(COOKIE)?.value ?? '';
  return expected !== '' && same(value, token(expected));
}

export function logIn(cookies: AstroCookies): void {
  cookies.set(COOKIE, token(adminKey()), {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function logOut(cookies: AstroCookies): void {
  cookies.delete(COOKIE, { path: '/' });
}
