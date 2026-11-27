import { randomBytes } from 'node:crypto';
import { deleteItem, getAll, getItem, setItem } from './store';
import { getPreview, type Preview } from './preview';

// Christmas lists at /xmas. There are no passwords: each person picks
// "I am ..." on their device. The server removes the surprise data
// (who got what, ideas from others, comments) when a person looks at
// their own list, so it is not in the page at all.

/** Sizes that help others buy the right fit. All people can see them. */
export const SIZE_KEYS = ['top', 'bottom', 'shoe', 'ring', 'other'] as const;
export type Sizes = Partial<Record<(typeof SIZE_KEYS)[number], string>>;
export interface Person { id: string; name: string; createdAt: string; sizes?: Sizes }
export interface Gift {
  id: string;
  owner: string;      // the person whose list it is on
  title: string;
  link?: string;
  note?: string;
  size?: string;      // the size to buy, for example "M" or "10.5"
  preview?: Preview;  // title, picture, shop and price of the link
  previewAt?: string; // when the server last tried to read the link
  addedBy: string;    // person id
  idea: boolean;      // true when someone else added it (secret from the owner)
  gotBy?: string;     // person id
  gotAt?: string;
  team?: string[];    // people who pair up on this gift (secret from the owner)
  createdAt: string;
}
export interface Comment {
  id: string;
  owner: string;      // the list it is on
  gift?: string;      // empty for a comment on the whole list
  by: string;         // person id
  text: string;
  createdAt: string;
}

const PEOPLE = 'xmas:people';
const GIFTS = 'xmas:gifts';
const COMMENTS = 'xmas:comments';
const REMOVED = 'xmas:removed'; // copies of removed people and their records, for a restore

export const newId = () => randomBytes(6).toString('base64url');
const now = () => new Date().toISOString();
const byDate = (a: { createdAt: string }, b: { createdAt: string }) => a.createdAt.localeCompare(b.createdAt);

export function clean(value: unknown, max: number): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}
export function cleanText(value: unknown, max: number): string {
  return String(value ?? '').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
}
export function cleanLink(value: unknown): string | undefined {
  let s = clean(value, 1000);
  if (!s) return undefined;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

export async function people(): Promise<Person[]> {
  return (await getAll<Person>(PEOPLE)).sort((a, b) => a.name.localeCompare(b.name));
}
export const getPerson = (id: string) => getItem<Person>(PEOPLE, id);

export async function addPerson(name: string): Promise<Person> {
  const existing = (await people()).find((p) => p.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing;
  const person = { id: newId(), name, createdAt: now() };
  await setItem(PEOPLE, person.id, person);
  return person;
}
export async function renamePerson(id: string, name: string) {
  const p = await getPerson(id);
  if (p) await setItem(PEOPLE, id, { ...p, name });
}
/**
 * Removes a person and all that they made: their list, their surprises, their notes and their marks.
 * Before it deletes, it saves a copy of each record that it deletes or changes in the hash
 * `xmas:removed`, so a removal by mistake can be restored.
 */
export async function removePerson(id: string) {
  const person = await getPerson(id);
  const allGifts = await getAll<Gift>(GIFTS);
  const allComments = await getAll<Comment>(COMMENTS);

  const goneGifts = allGifts.filter((g) => g.owner === id || g.addedBy === id);
  const gone = new Set(goneGifts.map((g) => g.id));
  const changedGifts = allGifts.filter((g) => !gone.has(g.id) && (g.gotBy === id || (g.team ?? []).includes(id)));
  const goneComments = allComments.filter((c) => c.owner === id || c.by === id || (c.gift && gone.has(c.gift)));

  const at = now();
  await setItem(REMOVED, `${id}:${at}`, { at, person, gifts: goneGifts, changedGifts, comments: goneComments });

  for (const g of goneGifts) await deleteItem(GIFTS, g.id);
  for (const g of changedGifts) {
    const team = (g.team ?? []).filter((t) => t !== id);
    const next: Gift = { ...g, team };
    if (!team.length) delete next.team;
    if (g.gotBy === id) {
      // The others of the team keep the mark. If there are none, the gift is free again.
      if (team.length) next.gotBy = team[0];
      else { delete next.gotBy; delete next.gotAt; }
    }
    await setItem(GIFTS, g.id, next);
  }
  for (const c of goneComments) await deleteItem(COMMENTS, c.id);
  await deleteItem(PEOPLE, id);
}

export const getGift = (id: string) => getItem<Gift>(GIFTS, id);
export const saveGift = (g: Gift) => setItem(GIFTS, g.id, g);
export const deleteGift = async (id: string) => {
  await deleteItem(GIFTS, id);
  for (const c of await getAll<Comment>(COMMENTS)) if (c.gift === id) await deleteItem(COMMENTS, c.id);
};
export const getComment = (id: string) => getItem<Comment>(COMMENTS, id);
export const saveComment = (c: Comment) => setItem(COMMENTS, c.id, c);
export const deleteComment = (id: string) => deleteItem(COMMENTS, id);

export function makeGift(owner: string, addedBy: string, fields: Pick<Gift, 'title' | 'link' | 'note' | 'size' | 'preview'>): Gift {
  return { id: newId(), owner, ...fields, previewAt: fields.link ? now() : undefined, addedBy, idea: owner !== addedBy, createdAt: now() };
}

export async function saveSizes(id: string, input: unknown) {
  const p = await getPerson(id);
  if (!p) return;
  const sizes: Sizes = {};
  const given = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  for (const key of SIZE_KEYS) {
    const v = clean(given[key], key === 'other' ? 120 : 30);
    if (v) sizes[key] = v;
  }
  await setItem(PEOPLE, id, { ...p, sizes });
}

/** Gifts from before link previews: read their links now, a small number at a time. */
async function fillPreviews(gifts: Gift[]) {
  const todo = gifts.filter((g) => g.link && !g.previewAt).slice(0, 3);
  await Promise.all(
    todo.map(async (g) => {
      g.preview = (await getPreview(g.link!)) ?? undefined;
      g.previewAt = now();
      await saveGift(g);
    }),
  );
}
export function makeComment(owner: string, by: string, text: string, gift?: string): Comment {
  return { id: newId(), owner, gift, by, text, createdAt: now() };
}

/** How many gifts each person asked for. Ideas from others are not counted, so this is safe to show to all. */
export async function counts(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const g of await getAll<Gift>(GIFTS)) if (!g.idea) out[g.owner] = (out[g.owner] ?? 0) + 1;
  return out;
}

/** The list as one viewer may see it. */
export async function listFor(me: string, owner: string) {
  const all = (await getAll<Gift>(GIFTS)).filter((g) => g.owner === owner).sort(byDate);
  await fillPreviews(all).catch(() => {});
  if (me === owner) {
    // Own list: only the gifts you added, with no status, no pairs and no comments.
    const gifts = all
      .filter((g) => !g.idea)
      .map(({ id, owner, title, link, note, size, preview, addedBy, createdAt }) => ({ id, owner, title, link, note, size, preview, addedBy, idea: false, createdAt }));
    return { own: true, gifts, comments: [] as Comment[] };
  }
  const comments = (await getAll<Comment>(COMMENTS)).filter((c) => c.owner === owner).sort(byDate);
  return { own: false, gifts: all, comments };
}
