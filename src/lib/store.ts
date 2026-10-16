import { Redis } from '@upstash/redis';

// A small key-value store on top of Redis hashes. Without Redis settings,
// local development keeps the data in memory.

function env(name: string): string | undefined {
  return process.env[name] ?? (import.meta.env as Record<string, string | undefined>)[name];
}

let client: Redis | null | undefined;
function redis(): Redis | null {
  if (client === undefined) {
    // Vercel sets KV_* when you connect Upstash for Redis from the Vercel dashboard.
    // UPSTASH_* is the name Upstash uses when you set it up yourself.
    const url = env('KV_REST_API_URL') ?? env('UPSTASH_REDIS_REST_URL');
    const token = env('KV_REST_API_TOKEN') ?? env('UPSTASH_REDIS_REST_TOKEN');
    client = url && token ? new Redis({ url, token }) : null;
  }
  return client;
}

const memory = new Map<string, Map<string, string>>();
const mem = (key: string) => {
  if (!memory.has(key)) memory.set(key, new Map());
  return memory.get(key)!;
};

export function storageReady(): boolean {
  return redis() !== null || import.meta.env.DEV;
}

const parse = <T>(v: unknown): T => (typeof v === 'string' ? JSON.parse(v) : v) as T;

export async function getItem<T>(key: string, field: string): Promise<T | null> {
  const r = redis();
  const v = r ? await r.hget(key, field) : mem(key).get(field);
  return v == null ? null : parse<T>(v);
}

export async function setItems(key: string, items: Record<string, unknown>): Promise<void> {
  const entries = Object.fromEntries(Object.entries(items).map(([k, v]) => [k, JSON.stringify(v)]));
  if (Object.keys(entries).length === 0) return;
  const r = redis();
  if (r) await r.hset(key, entries);
  else for (const [k, v] of Object.entries(entries)) mem(key).set(k, v);
}

export async function setItem(key: string, field: string, value: unknown): Promise<void> {
  await setItems(key, { [field]: value });
}

export async function deleteItem(key: string, field: string): Promise<void> {
  const r = redis();
  if (r) await r.hdel(key, field);
  else mem(key).delete(field);
}

export async function getAll<T>(key: string): Promise<T[]> {
  const r = redis();
  const all = r ? ((await r.hgetall<Record<string, unknown>>(key)) ?? {}) : Object.fromEntries(mem(key));
  return Object.values(all).map((v) => parse<T>(v));
}
