import type { APIRoute } from 'astro';
import { storageReady } from '../../lib/store';
import {
  addPerson, clean, counts, cleanLink, cleanText, deleteComment, deleteGift, getComment, getGift, getPerson,
  listFor, makeComment, makeGift, people, removePerson, saveComment, saveGift,
} from '../../lib/xmas';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
const fail = (error: string, status = 400) => json({ error }, status);

async function state(me: string, list: string) {
  const [everyone, count] = await Promise.all([people(), counts()]);
  const known = (id: string) => everyone.some((p) => p.id === id);
  const view = me && list && known(me) && known(list) ? await listFor(me, list) : null;
  return { people: everyone.map((p) => ({ ...p, count: count[p.id] ?? 0 })), view };
}

export const GET: APIRoute = async ({ url }) => {
  if (!storageReady()) return fail('storage', 503);
  try {
    return json(await state(url.searchParams.get('me') ?? '', url.searchParams.get('list') ?? ''));
  } catch (err) {
    console.error('xmas: could not read', err);
    return fail('server', 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!storageReady()) return fail('storage', 503);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail('bad request');
  }
  const action = String(body.action ?? '');
  const meId = String(body.me ?? '');
  const listId = String(body.list ?? '');

  try {
    if (action === 'addPerson') {
      const name = clean(body.name, 40);
      if (!name) return fail('Please type a name.');
      if ((await people()).length >= 200) return fail('There are too many lists.');
      const person = await addPerson(name);
      return json({ person, ...(await state(meId, listId)) });
    }

    const me = meId ? await getPerson(meId) : null;
    if (!me) return fail('Please select who you are.');

    switch (action) {
      case 'removePerson': {
        // Only an empty list can be removed, so a wrong tap cannot lose gifts.
        const id = String(body.id ?? '');
        const view = await listFor('', id);
        if (view.gifts.length || view.comments.length) return fail('This list has gifts on it, so we keep it.');
        await removePerson(id);
        break;
      }
      case 'addGift': {
        const owner = await getPerson(listId);
        if (!owner) return fail('This list does not exist.');
        const title = clean(body.title, 140);
        if (!title) return fail('Please type the gift.');
        const link = cleanLink(body.link);
        if (clean(body.link, 1000) && !link) return fail('This link is not correct.');
        await saveGift(makeGift(owner.id, me.id, title, link, cleanText(body.note, 600) || undefined));
        break;
      }
      case 'editGift': {
        const gift = await getGift(String(body.id ?? ''));
        if (!gift) return fail('This gift is not on the list now.');
        if (gift.addedBy !== me.id) return fail('Only the person who added a gift can change it.');
        const title = clean(body.title, 140);
        if (!title) return fail('Please type the gift.');
        const link = cleanLink(body.link);
        if (clean(body.link, 1000) && !link) return fail('This link is not correct.');
        await saveGift({ ...gift, title, link, note: cleanText(body.note, 600) || undefined });
        break;
      }
      case 'deleteGift': {
        const gift = await getGift(String(body.id ?? ''));
        if (gift) {
          if (gift.addedBy !== me.id) return fail('Only the person who added a gift can remove it.');
          await deleteGift(gift.id);
        }
        break;
      }
      case 'got': {
        const gift = await getGift(String(body.id ?? ''));
        if (!gift) return fail('This gift is not on the list now.');
        if (gift.owner === me.id) return fail('You cannot mark your own gifts.');
        const team = gift.team ?? [];
        if (body.got) {
          if (gift.gotBy && gift.gotBy !== me.id) return fail('Someone else got this gift already.');
          if (team.length && !team.includes(me.id)) return fail('Other people pair up on this gift. Join them first.');
          await saveGift({ ...gift, gotBy: me.id, gotAt: new Date().toISOString() });
        } else {
          if (gift.gotBy && gift.gotBy !== me.id && !team.includes(me.id)) return fail('Only the person who got it can remove the mark.');
          const { gotBy, gotAt, ...rest } = gift;
          await saveGift(rest);
        }
        break;
      }
      case 'pair': {
        // Pair up: two or more people buy one gift together.
        const gift = await getGift(String(body.id ?? ''));
        if (!gift) return fail('This gift is not on the list now.');
        if (gift.owner === me.id) return fail('You cannot pair up on your own gifts.');
        if (gift.gotBy) return fail('Someone got this gift already.');
        const team = (gift.team ?? []).filter((id) => id !== me.id);
        if (body.on) {
          if (team.length >= 8) return fail('This pair is full.');
          team.push(me.id);
        }
        const { team: _old, ...rest } = gift;
        await saveGift(team.length ? { ...rest, team } : rest);
        break;
      }
      case 'comment': {
        const owner = await getPerson(listId);
        if (!owner) return fail('This list does not exist.');
        if (owner.id === me.id) return fail('You cannot comment on your own list.');
        const text = cleanText(body.text, 600);
        if (!text) return fail('Please type a comment.');
        const giftId = clean(body.gift, 20);
        if (giftId) {
          const gift = await getGift(giftId);
          if (!gift || gift.owner !== owner.id) return fail('This gift is not on the list now.');
        }
        await saveComment(makeComment(owner.id, me.id, text, giftId || undefined));
        break;
      }
      case 'deleteComment': {
        const c = await getComment(String(body.id ?? ''));
        if (c) {
          if (c.by !== me.id) return fail('Only the person who wrote a comment can remove it.');
          await deleteComment(c.id);
        }
        break;
      }
      default:
        return fail('bad request');
    }
    return json(await state(me.id, listId));
  } catch (err) {
    console.error('xmas: could not save', err);
    return fail('server', 500);
  }
};
