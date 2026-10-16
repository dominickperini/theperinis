import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { listRsvps, toCsv } from '../../lib/rsvp';

export const prerender = false;

function keyMatches(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Download all replies as a CSV file: /api/rsvps?key=YOUR_ADMIN_KEY
export const GET: APIRoute = async ({ url }) => {
  const expected = process.env.ADMIN_KEY ?? import.meta.env.ADMIN_KEY;
  const given = url.searchParams.get('key') ?? '';
  if (!expected || !keyMatches(given, expected)) {
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
