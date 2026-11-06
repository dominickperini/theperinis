import type { APIRoute } from 'astro';
import { isAdmin } from '../../../lib/auth';
import { listParties } from '../../../lib/guests';
import { ADDRESS_COLUMNS, addressCells, listAddresses } from '../../../lib/addresses';
import { csvCell, csvResponse } from '../../../lib/csv';

export const prerender = false;

// The guest list as CSV, with each invitation link and mailing address, for mail merge or printing.
export const GET: APIRoute = async ({ cookies, url }) => {
  if (!isAdmin(cookies)) return new Response('Not found', { status: 404 });
  const parties = await listParties();
  const byCode = new Map((await listAddresses()).map((a) => [a.code, a]));
  const cols = ['list', 'name', 'email', 'seats', 'status', 'attending', 'code', 'link', 'addressLink', 'invitedAt', 'respondedAt', ...ADDRESS_COLUMNS];
  const rows = parties.map((p) =>
    [
      p.list, p.name, p.email, p.seats, p.status, p.attending, p.code,
      `${url.origin}/rsvp?code=${p.code}`, `${url.origin}/address?code=${p.code}`,
      p.invitedAt, p.respondedAt, ...addressCells(byCode.get(p.code)),
    ]
      .map(csvCell)
      .join(','),
  );
  return csvResponse([cols.join(','), ...rows], 'guests.csv');
};
