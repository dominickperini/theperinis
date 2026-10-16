import { getAll, setItem, storageReady } from './store';

export interface Rsvp {
  name: string;
  email: string;
  attending: 'yes' | 'no';
  guests: number;
  guestNames: string;
  dietary: string;
  song: string;
  message: string;
  submittedAt: string;
  code?: string;
  party?: string;
}

const KEY = 'rsvps';

export { storageReady };

export async function saveRsvp(rsvp: Rsvp): Promise<void> {
  // One entry per invitation (or per email without a code), so a guest can
  // send the form again to change a reply.
  await setItem(KEY, rsvp.code || rsvp.email.toLowerCase(), rsvp);
}

export async function listRsvps(): Promise<Rsvp[]> {
  const rows = await getAll<Rsvp>(KEY);
  return rows.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
}

const clean = (v: FormDataEntryValue | null, max: number) =>
  (typeof v === 'string' ? v : '').trim().slice(0, max);

export function parseRsvp(form: FormData): { rsvp?: Rsvp; error?: string } {
  const name = clean(form.get('name'), 200);
  const email = clean(form.get('email'), 200);
  const attending = clean(form.get('attending'), 3);
  const guestsRaw = Number.parseInt(clean(form.get('guests'), 3) || '1', 10);

  if (!name) return { error: 'name' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'email' };
  if (attending !== 'yes' && attending !== 'no') return { error: 'attending' };

  return {
    rsvp: {
      name,
      email,
      attending,
      guests: attending === 'yes' ? Math.min(Math.max(guestsRaw || 1, 1), 10) : 0,
      guestNames: clean(form.get('guestNames'), 500),
      dietary: clean(form.get('dietary'), 500),
      song: clean(form.get('song'), 200),
      message: clean(form.get('message'), 2000),
      submittedAt: new Date().toISOString(),
    },
  };
}

export function toCsv(rows: Rsvp[]): string {
  const cols: (keyof Rsvp)[] = [
    'submittedAt', 'party', 'code', 'name', 'email', 'attending', 'guests', 'guestNames', 'dietary', 'song', 'message',
  ];
  const cell = (v: unknown) => {
    let s = String(v ?? '');
    // Stop spreadsheet apps from running text that starts with a formula character.
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\r\n');
}
