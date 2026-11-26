import type { APIRoute } from 'astro';
import { isAdmin } from '../../../lib/auth';
import { listParties } from '../../../lib/guests';
import { listAddresses } from '../../../lib/addresses';
import { csvCell, csvResponse } from '../../../lib/csv';
import { addressLink, emailMessage, subject, textMessage } from '../../../lib/savethedate';

export const prerender = false;

// The save-the-date send list, for a mail merge (for example in Gmail or Word).
// ?list=A or ?list=B gives one list only.
export const GET: APIRoute = async ({ cookies, url }) => {
  if (!isAdmin(cookies)) return new Response('Not found', { status: 404 });
  const list = url.searchParams.get('list')?.toUpperCase();
  const have = new Set((await listAddresses()).map((a) => a.code));
  const parties = (await listParties()).filter((p) => !list || p.list === list);
  const cols = ['list', 'party', 'email', 'phone', 'link', 'subject', 'textMessage', 'emailMessage', 'sentAt', 'addressReceived'];
  const rows = parties.map((p) =>
    [p.list, p.name, p.email, p.phone ?? '', addressLink(p, url.origin), subject, textMessage(p, url.origin), emailMessage(p, url.origin), p.stdSentAt ?? '', have.has(p.code) ? 'yes' : 'no']
      .map(csvCell)
      .join(','),
  );
  return csvResponse([cols.join(','), ...rows], 'save-the-dates.csv');
};
