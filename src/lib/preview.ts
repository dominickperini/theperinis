import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { getItem, setItem } from './store';

// Link previews, like the ones in a message app: the server reads the page
// behind a link and keeps its title, picture, shop name and price.

export interface Preview { title?: string; image?: string; site?: string; price?: string }

const CACHE = 'xmas:previews';
const WEEK = 7 * 24 * 60 * 60 * 1000;
const MAX_BYTES = 600_000;
// Shops give preview data to the programs of message apps. This is the
// name that link previews in message apps use.
const AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0';

function privateAddress(ip: string): boolean {
  const mapped = ip.toLowerCase().match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) ip = mapped[1];
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224
    );
  }
  const s = ip.toLowerCase();
  return s === '::' || s === '::1' || s.startsWith('fc') || s.startsWith('fd') || s.startsWith('fe8') || s.startsWith('fe9') || s.startsWith('fea') || s.startsWith('feb') || s.startsWith('::ffff:');
}

/** Only public web addresses: the server must not read pages on a private network. */
async function allowed(url: URL): Promise<boolean> {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  if (url.username || url.password) return false;
  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (import.meta.env.DEV && (host === 'localhost' || host === '127.0.0.1')) return true; // local tests
  if (url.port) return false;
  if (!host.includes('.') || /\.(local|internal|localhost|lan|home|corp)$/.test(host)) return false;
  if (isIP(host)) return !privateAddress(host);
  try {
    const found = await lookup(host, { all: true });
    return found.length > 0 && found.every((a) => !privateAddress(a.address));
  } catch {
    return false;
  }
}

async function readPage(start: string, signal: AbortSignal): Promise<{ html: string; url: URL } | null> {
  let url = new URL(start);
  for (let hop = 0; hop < 5; hop++) {
    if (!(await allowed(url))) return null;
    const res = await fetch(url, {
      redirect: 'manual',
      signal,
      headers: { 'User-Agent': AGENT, Accept: 'text/html,application/xhtml+xml', 'Accept-Language': 'en-US,en;q=0.8' },
    });
    if (res.status >= 300 && res.status < 400) {
      const next = res.headers.get('location');
      await res.body?.cancel();
      if (!next) return null;
      url = new URL(next, url);
      continue;
    }
    if (!res.ok || !/html/i.test(res.headers.get('content-type') ?? '') || !res.body) {
      await res.body?.cancel();
      return null;
    }
    // The preview data is in the head of the page. Read only the first part.
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (size < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      size += value.length;
    }
    await reader.cancel().catch(() => {});
    return { html: new TextDecoder('utf-8').decode(Buffer.concat(chunks)), url };
  }
  return null;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decode(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}
function attr(tag: string, name: string): string | undefined {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? (m[1] ?? m[2] ?? m[3]) : undefined;
}
const tidy = (s: string | undefined, max: number) => (s ? decode(s).replace(/\s+/g, ' ').trim().slice(0, max) : '');

export function parsePreview(html: string, url: URL): Preview | null {
  const meta: Record<string, string> = {};
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const key = (attr(m[0], 'property') ?? attr(m[0], 'name') ?? attr(m[0], 'itemprop'))?.toLowerCase();
    const content = attr(m[0], 'content');
    if (key && content && !(key in meta)) meta[key] = content;
  }
  const host = url.hostname.replace(/^www\./, '');
  const site = tidy(meta['og:site_name'], 60) || host;
  let title = tidy(meta['og:title'] ?? meta['twitter:title'] ?? html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1], 200);
  // "Wool socks | Shop name" -> "Wool socks"
  for (const sep of [' | ', ' - ', ' – ', ' — ', ': ']) {
    if (title.toLowerCase().endsWith(sep + site.toLowerCase())) title = title.slice(0, -(sep.length + site.length)).trim();
    if (title.toLowerCase().startsWith(site.toLowerCase() + sep)) title = title.slice(site.length + sep.length).trim();
  }
  let image: string | undefined;
  const raw = meta['og:image:secure_url'] ?? meta['og:image'] ?? meta['og:image:url'] ?? meta['twitter:image'] ?? meta['twitter:image:src'];
  if (raw) {
    try {
      const u = new URL(decode(raw).trim(), url);
      if (u.protocol === 'http:') u.protocol = 'https:';
      if (u.protocol === 'https:' && u.toString().length <= 1000) image = u.toString();
    } catch { /* no picture */ }
  }
  let price: string | undefined;
  const amount = Number(tidy(meta['product:price:amount'] ?? meta['og:price:amount'], 20).replace(/,/g, ''));
  if (amount > 0) {
    const currency = tidy(meta['product:price:currency'] ?? meta['og:price:currency'], 3).toUpperCase() || 'USD';
    try {
      price = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount).replace(/\.00$/, '');
    } catch {
      price = `${amount} ${currency}`;
    }
  }
  if (!title && !image) return null;
  return { title: title || undefined, image, site, price };
}

/** The preview of a link, or null. Results are kept for one week. */
export async function getPreview(link: string): Promise<Preview | null> {
  try {
    const kept = await getItem<{ p: Preview | null; at: number }>(CACHE, link);
    if (kept && Date.now() - kept.at < WEEK) return kept.p;
  } catch { /* read the page again */ }
  let p: Preview | null = null;
  try {
    const page = await readPage(link, AbortSignal.timeout(6000));
    if (page) p = parsePreview(page.html, page.url);
  } catch {
    p = null;
  }
  try {
    await setItem(CACHE, link, { p, at: Date.now() });
  } catch { /* not important */ }
  return p;
}
