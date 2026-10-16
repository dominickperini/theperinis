import type { APIRoute } from 'astro';
import { isAdmin, keyMatches } from '../../lib/auth';
import { listRsvps, toCsv } from '../../lib/rsvp';

export const prerender = false;

// Download all replies as a CSV file. Log in on /admin, or use
// /api/rsvps?key=YOUR_ADMIN_KEY
export const GET: APIRoute = async ({ url, cookies }) => {
  if (!isAdmin(cookies) && !keyMatches(url.searchParams.get('key') ?? '')) {
    return new Response('Not found', { status: 404 });
  }

  const rows = await listRsvps();
  return new Response(toCsv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="rsvps.csv"',
      'Cache-Control': 'no-store',
    },
  });
};
