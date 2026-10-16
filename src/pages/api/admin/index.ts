import type { APIRoute } from 'astro';
import { isAdmin, keyMatches, logIn, logOut } from '../../../lib/auth';
import {
  addParties,
  deleteParty,
  getSettings,
  markInvited,
  parseGuestLines,
  saveSettings,
  setReply,
} from '../../../lib/guests';

export const prerender = false;

// All admin page buttons post here with an "action" field.
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const action = String(form.get('action') ?? '');
  const done = (msg: string) => redirect(`/admin?msg=${encodeURIComponent(msg)}`, 303);

  if (action === 'login') {
    if (!keyMatches(String(form.get('key') ?? ''))) return redirect('/admin?error=key', 303);
    logIn(cookies);
    return redirect('/admin', 303);
  }
  if (action === 'logout') {
    logOut(cookies);
    return redirect('/admin', 303);
  }
  if (!isAdmin(cookies)) return new Response('Not found', { status: 404 });

  switch (action) {
    case 'import': {
      const { rows, errors } = parseGuestLines(String(form.get('lines') ?? ''));
      if (errors.length) return done(`Nothing added. ${errors.slice(0, 3).join(' ')}`);
      const n = await addParties(rows);
      return done(`Added ${n} ${n === 1 ? 'invitation' : 'invitations'}.`);
    }
    case 'invite': {
      const codes = form.getAll('code').map(String);
      const n = await markInvited(codes);
      return done(`Marked ${n} ${n === 1 ? 'invitation' : 'invitations'} as sent.`);
    }
    case 'reply': {
      const code = String(form.get('code') ?? '');
      const value = String(form.get('reply') ?? '');
      const reply = value === 'waiting' ? null : Math.max(0, Number.parseInt(value, 10) || 0);
      const party = await setReply(code, reply);
      return done(party ? `Saved the reply for ${party.name}.` : 'We cannot find this invitation.');
    }
    case 'delete': {
      await deleteParty(String(form.get('code') ?? ''));
      return done('Deleted the invitation.');
    }
    case 'settings': {
      const capacity = Number.parseInt(String(form.get('capacity') ?? ''), 10);
      if (!(capacity > 0 && capacity < 10000)) return done('The guest limit must be a number more than 0.');
      await saveSettings({ ...(await getSettings()), capacity });
      return done(`The guest limit is now ${capacity}.`);
    }
    default:
      return done('Unknown action.');
  }
};
