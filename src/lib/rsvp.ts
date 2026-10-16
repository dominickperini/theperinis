import { Redis } from '@upstash/redis';

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
}

const KEY = 'rsvps';

// Vercel sets KV_* when you connect Upstash for Redis from the Vercel dashboard.
// UPSTASH_* is the name Upstash uses when you set it up yourself.
function env(name: string): string | undefined {
  return process.env[name] ?? (import.meta.env as Record<string, string | undefined>)[name];
}

function getRedis(): Redis | null {
  const url = env('KV_REST_API_URL') ?? env('UPSTASH_REDIS_REST_URL');
  const token = env('KV_REST_API_TOKEN') ?? env('UPSTASH_REDIS_REST_TOKEN');
  return url && token ? new Redis({ url, token }) : null;
}

// Local development without a database keeps replies in memory only.
const memory = new Map<string, Rsvp>();

export function storageReady(): boolean {
  return getRedis() !== null || import.meta.env.DEV;
}

export async function saveRsvp(rsvp: Rsvp): Promise<void> {
  const id = rsvp.email.toLowerCase();
  const redis = getRedis();
  if (redis) {
    // One entry per email, so a guest can send the form again to change a reply.
    await redis.hset(KEY, { [id]: JSON.stringify(rsvp) });
  } else {
    memory.set(id, rsvp);
  }
}

export async function listRsvps(): Promise<Rsvp[]> {
  const redis = getRedis();
  let rows: Rsvp[];
  if (redis) {
    const all = (await redis.hgetall<Record<string, Rsvp | string>>(KEY)) ?? {};
    rows = Object.values(all).map((v) => (typeof v === 'string' ? JSON.parse(v) : v));
  } else {
    rows = [...memory.values()];
  }
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
    'submittedAt', 'name', 'email', 'attending', 'guests', 'guestNames', 'dietary', 'song', 'message',
  ];
  const cell = (v: unknown) => {
    let s = String(v ?? '');
    // Stop spreadsheet apps from running text that starts with a formula character.
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\r\n');
}
