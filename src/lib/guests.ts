import { randomInt } from 'node:crypto';
import { getAll, getItem, setItem, setItems, deleteItem } from './store';

// A party is one invitation: one person, a couple, or a family.
export type Status = 'not_invited' | 'invited' | 'attending' | 'declined';

export interface Party {
  code: string; // Also the id. Guests type it, or open the link with it.
  name: string;
  email: string;
  list: 'A' | 'B';
  seats: number; // How many people the invitation is for
  order: number; // Backfill order inside the list (lower goes first)
  status: Status;
  attending: number; // People who said yes
  invitedAt?: string;
  respondedAt?: string;
}

export interface Settings {
  capacity: number; // Total number of guests the venue and budget allow
}

const PARTIES = 'parties';
const SETTINGS = 'settings';
export const DEFAULT_CAPACITY = 150;

// No 0/O, 1/I/L, so guests do not confuse letters.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');

export const normalizeCode = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, '');

export async function listParties(): Promise<Party[]> {
  const parties = await getAll<Party>(PARTIES);
  return parties.sort((a, b) => a.list.localeCompare(b.list) || a.order - b.order);
}

export async function getParty(code: string): Promise<Party | null> {
  return getItem<Party>(PARTIES, normalizeCode(code));
}

// Lower case, no accents, and only letters and spaces. "O'Brien-Núñez" -> "obrien nunez".
export const normalizeName = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z]+/g, ' ')
    .trim();

/**
 * Invited parties that have the last name as a full word in the party name.
 * A part of a word does not match ("Lee" does not find "Leeson"), so a search
 * shows only the parties of that family.
 */
export async function findParties(lastName: string): Promise<Party[]> {
  const q = normalizeName(lastName);
  if (q.length < 2) return [];
  const parties = await listParties();
  return parties
    .filter((p) => p.status !== 'not_invited' && ` ${normalizeName(p.name)} `.includes(` ${q} `))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 20);
}

export async function saveParty(party: Party): Promise<void> {
  await setItem(PARTIES, party.code, party);
}

export async function deleteParty(code: string): Promise<void> {
  await deleteItem(PARTIES, normalizeCode(code));
}

export async function getSettings(): Promise<Settings> {
  return (await getItem<Settings>(SETTINGS, 'main')) ?? { capacity: DEFAULT_CAPACITY };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await setItem(SETTINGS, 'main', settings);
}

/**
 * Reads one party per line: name, email, list, seats.
 * Email may be empty. List is A or B (default B). Seats default to 1.
 * A name that contains a comma must be in double quotes.
 */
export function parseGuestLines(text: string): { rows: Omit<Party, 'code' | 'order'>[]; errors: string[] } {
  const rows: Omit<Party, 'code' | 'order'>[] = [];
  const errors: string[] = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    const cells = splitCsvLine(line).map((c) => c.trim());
    const [name = '', email = '', list = 'B', seats = '1'] = cells;
    if (/^name$/i.test(name)) return; // Header row
    const n = Number.parseInt(seats, 10);
    const l = list.toUpperCase();
    if (!name) errors.push(`Line ${i + 1}: the name is empty.`);
    else if (l !== 'A' && l !== 'B') errors.push(`Line ${i + 1}: the list must be A or B.`);
    else if (!(n >= 1 && n <= 20)) errors.push(`Line ${i + 1}: seats must be a number from 1 to 20.`);
    else
      rows.push({
        name: name.slice(0, 200),
        email: email.slice(0, 200),
        list: l,
        seats: n,
        status: 'not_invited',
        attending: 0,
      });
  });
  return { rows, errors };
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',' || ch === '\t') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

export async function addParties(rows: Omit<Party, 'code' | 'order'>[]): Promise<number> {
  const existing = await listParties();
  const codes = new Set(existing.map((p) => p.code));
  let order = existing.reduce((max, p) => Math.max(max, p.order), 0);
  const items: Record<string, Party> = {};
  for (const row of rows) {
    let code = newCode();
    while (codes.has(code)) code = newCode();
    codes.add(code);
    items[code] = { ...row, code, order: ++order };
  }
  await setItems(PARTIES, items);
  return rows.length;
}

export interface Stats {
  capacity: number;
  held: number; // Seats held by guests who are invited and have not replied, or said yes
  open: number;
  attending: number;
  declined: number; // Parties
  awaiting: number; // Parties invited with no reply
  aNotInvited: number;
  bNotInvited: number;
}

/** Seats a party holds now: all seats while we wait for a reply, the yes count after a reply. */
export const seatsHeld = (p: Party) =>
  p.status === 'invited' ? p.seats : p.status === 'attending' ? p.attending : 0;

export function stats(parties: Party[], settings: Settings): Stats {
  const held = parties.reduce((sum, p) => sum + seatsHeld(p), 0);
  return {
    capacity: settings.capacity,
    held,
    open: settings.capacity - held,
    attending: parties.reduce((sum, p) => sum + (p.status === 'attending' ? p.attending : 0), 0),
    declined: parties.filter((p) => p.status === 'declined').length,
    awaiting: parties.filter((p) => p.status === 'invited').length,
    aNotInvited: parties.filter((p) => p.list === 'A' && p.status === 'not_invited').length,
    bNotInvited: parties.filter((p) => p.list === 'B' && p.status === 'not_invited').length,
  };
}

/** The next B-list parties, in order, that fit in the open seats. */
export function backfill(parties: Party[], open: number): Party[] {
  const out: Party[] = [];
  let left = open;
  for (const p of parties) {
    if (p.list !== 'B' || p.status !== 'not_invited') continue;
    if (p.seats <= left) {
      out.push(p);
      left -= p.seats;
    }
  }
  return out;
}

export async function markInvited(codes: string[]): Promise<number> {
  const now = new Date().toISOString();
  const items: Record<string, Party> = {};
  for (const code of codes) {
    const p = await getParty(code);
    if (p && p.status === 'not_invited') items[p.code] = { ...p, status: 'invited', invitedAt: now };
  }
  await setItems(PARTIES, items);
  return Object.keys(items).length;
}

export async function setReply(code: string, attending: number | null): Promise<Party | null> {
  const p = await getParty(code);
  if (!p) return null;
  const updated: Party =
    attending === null
      ? { ...p, status: 'invited', attending: 0, respondedAt: undefined }
      : attending > 0
        ? { ...p, status: 'attending', attending: Math.min(attending, p.seats), respondedAt: new Date().toISOString() }
        : { ...p, status: 'declined', attending: 0, respondedAt: new Date().toISOString() };
  if (!updated.invitedAt) updated.invitedAt = new Date().toISOString();
  await saveParty(updated);
  return updated;
}
