import type { APIRoute } from 'astro';
import { isAdmin } from '../../../lib/auth';
import { listParties } from '../../../lib/guests';

export const prerender = false;

const cell = (v: unknown) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

// The guest list as CSV, with each invitation link, for mail merge or printing.
export const GET: APIRoute = async ({ cookies, url }) => {
  if (!isAdmin(cookies)) return new Response('Not found', { status: 404 });
  const parties = await listParties();
  const cols = ['list', 'name', 'email', 'seats', 'status', 'attending', 'code', 'link', 'invitedAt', 'respondedAt'];
  const rows = parties.map((p) =>
    [p.list, p.name, p.email, p.seats, p.status, p.attending, p.code, `${url.origin}/rsvp?code=${p.code}`, p.invitedAt, p.respondedAt]
      .map(cell)
      .join(','),
  );
  return new Response([cols.join(','), ...rows].join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="guests.csv"',
      'Cache-Control': 'no-store',
    },
  });
};
