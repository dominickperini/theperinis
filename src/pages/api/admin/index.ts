import type { APIRoute } from 'astro';
import { isAdmin, keyMatches, logIn, logOut } from '../../../lib/auth';
import {
  addParties,
  deleteParty,
  getSettings,
  listParties,
  markInvited,
  markSaveTheDate,
  normalizeName,
  parseGuestLines,
  saveSettings,
  setContact,
  setReply,
} from '../../../lib/guests';

export const prerender = false;

// All admin page buttons post here with an "action" field.
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const action = String(form.get('action') ?? '');
  // Pages that post here can ask to come back to themselves.
  const back = form.get('back') === 'save-the-dates' ? '/wedding/admin/save-the-dates' : '/wedding/admin';
  const done = (msg: string) => redirect(`${back}?msg=${encodeURIComponent(msg)}`, 303);
  const json = form.get('ajax') === '1';

  if (action === 'login') {
    if (!keyMatches(String(form.get('key') ?? ''))) return redirect('/wedding/admin?error=key', 303);
    logIn(cookies);
    return redirect('/wedding/admin', 303);
  }
  if (action === 'logout') {
    logOut(cookies);
    return redirect('/wedding/admin', 303);
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
    case 'contact': {
      const party = await setContact(String(form.get('code') ?? ''), String(form.get('email') ?? ''), String(form.get('phone') ?? ''));
      return done(party ? `Saved the email and phone for ${party.name}.` : 'We cannot find this invitation.');
    }
    case 'contacts': {
      // One line each: invitation code or the exact party name, email, phone.
      const parties = await listParties();
      const missing: string[] = [];
      let n = 0;
      for (const line of String(form.get('lines') ?? '').split(/\r?\n/)) {
        if (!line.trim()) continue;
        const [key = '', email = '', phone = ''] = line.split(/\t|,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((c) => c.trim().replace(/^"|"$/g, ''));
        const p =
          parties.find((x) => x.code === key.toUpperCase()) ??
          parties.find((x) => normalizeName(x.name) === normalizeName(key));
        if (!p) { missing.push(key); continue; }
        await setContact(p.code, email || p.email, phone || p.phone || '');
        n++;
      }
      const miss = missing.length ? ` Not found: ${missing.slice(0, 5).join('; ')}${missing.length > 5 ? '…' : ''}.` : '';
      return done(`Saved contacts for ${n} ${n === 1 ? 'invitation' : 'invitations'}.${miss}`);
    }
    case 'std': {
      const sent = form.get('sent') === '1';
      const party = await markSaveTheDate(String(form.get('code') ?? ''), sent);
      if (json) return Response.json({ ok: !!party, sentAt: party?.stdSentAt ?? null });
      return done(party ? `${party.name}: save-the-date marked as ${sent ? 'sent' : 'not sent'}.` : 'We cannot find this invitation.');
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
