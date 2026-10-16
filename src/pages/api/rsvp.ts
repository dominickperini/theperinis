import type { APIRoute } from 'astro';
import { getParty, setReply } from '../../lib/guests';
import { parseRsvp, saveRsvp, storageReady } from '../../lib/rsvp';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();

  // Bots fill in the hidden "website" field. People do not see it.
  if (form.get('website')) return redirect('/rsvp/thanks', 303);

  if (!storageReady()) {
    console.error('RSVP storage is not set up. Add Upstash for Redis in Vercel.');
    return redirect('/rsvp?error=server', 303);
  }

  const code = String(form.get('code') ?? '');
  const back = (error: string) => redirect(`/rsvp?code=${encodeURIComponent(code)}&error=${error}`, 303);

  try {
    const party = code ? await getParty(code) : null;
    if (!party || party.status === 'not_invited') return back('code');

    const { rsvp, error } = parseRsvp(form);
    if (!rsvp) return back(error ?? 'server');

    rsvp.guests = Math.min(rsvp.guests, party.seats);
    rsvp.code = party.code;
    rsvp.party = party.name;
    await saveRsvp(rsvp);
    await setReply(party.code, rsvp.attending === 'yes' ? rsvp.guests : 0);

    return redirect(`/rsvp/thanks?attending=${rsvp.attending}`, 303);
  } catch (err) {
    console.error('Could not save RSVP', err);
    return back('server');
  }
};
