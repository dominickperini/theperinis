import type { APIRoute } from 'astro';
import { isAdmin } from '../../../lib/auth';
import { listParties } from '../../../lib/guests';
import { ADDRESS_COLUMNS, addressCells, listAddresses } from '../../../lib/addresses';
import { csvCell, csvResponse } from '../../../lib/csv';

export const prerender = false;

// Mailing addresses for save-the-dates, for a mail merge or envelope printing.
// ?list=A or ?list=B gives one list only.
export const GET: APIRoute = async ({ cookies, url }) => {
  if (!isAdmin(cookies)) return new Response('Not found', { status: 404 });
  const list = url.searchParams.get('list')?.toUpperCase();
  const byCode = new Map((await listAddresses()).map((a) => [a.code, a]));
  const parties = (await listParties()).filter((p) => byCode.has(p.code) && (!list || p.list === list));
  const cols = ['list', 'party', ...ADDRESS_COLUMNS, 'email', 'submittedAt'];
  const rows = parties.map((p) => {
    const a = byCode.get(p.code)!;
    return [p.list, p.name, ...addressCells(a), a.email || p.email, a.submittedAt].map(csvCell).join(',');
  });
  return csvResponse([cols.join(','), ...rows], 'addresses.csv');
};
