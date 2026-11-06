import type { APIRoute } from 'astro';
import { getParty, saveParty } from '../../lib/guests';
import { parseAddress, saveAddress } from '../../lib/addresses';
import { storageReady } from '../../lib/store';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();

  // Bots fill in the hidden "website" field. People do not see it.
  if (form.get('website')) return redirect('/address/thanks', 303);

  const code = String(form.get('code') ?? '');
  const back = (error: string) => redirect(`/address?code=${encodeURIComponent(code)}&error=${error}`, 303);
  if (!storageReady()) {
    console.error('Storage is not set up. Add Upstash for Redis in Vercel.');
    return back('server');
  }

  try {
    const party = code ? await getParty(code) : null;
    if (!party) return back('code');

    const { address, error } = parseAddress(form);
    if (!address) return back(error ?? 'server');

    await saveAddress({ ...address, code: party.code, party: party.name });
    // Keep the email on the party too, if we do not have one yet.
    if (address.email && !party.email) await saveParty({ ...party, email: address.email });

    return redirect('/address/thanks', 303);
  } catch (err) {
    console.error('Could not save the address', err);
    return back('server');
  }
};
