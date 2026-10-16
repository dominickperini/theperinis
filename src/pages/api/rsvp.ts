import type { APIRoute } from 'astro';
import { parseRsvp, saveRsvp, storageReady } from '../../lib/rsvp';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();

  // Bots fill in the hidden "website" field. People do not see it.
  if (form.get('website')) return redirect('/rsvp/thanks', 303);

  const { rsvp, error } = parseRsvp(form);
  if (!rsvp) return redirect(`/rsvp?error=${error}`, 303);

  if (!storageReady()) {
    console.error('RSVP storage is not set up. Add Upstash for Redis in Vercel.');
    return redirect('/rsvp?error=server', 303);
  }

  try {
    await saveRsvp(rsvp);
  } catch (err) {
    console.error('Could not save RSVP', err);
    return redirect('/rsvp?error=server', 303);
  }

  return redirect(`/rsvp/thanks?attending=${rsvp.attending}`, 303);
};
