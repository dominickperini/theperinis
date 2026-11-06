import { getAll, getItem, setItem } from './store';

// Mailing addresses for save-the-dates and invitations. One address per party,
// with the party code as the key, so a guest can send the form again to change it.
export interface Address {
  code: string;
  party: string; // Party name when the guest sent the form
  name: string; // Name to put on the envelope
  email: string;
  line1: string;
  line2: string;
  city: string;
  region: string; // State or province
  postal: string;
  country: string;
  submittedAt: string;
}

const KEY = 'addresses';

export async function saveAddress(a: Address): Promise<void> {
  await setItem(KEY, a.code, a);
}

export async function getAddress(code: string): Promise<Address | null> {
  return getItem<Address>(KEY, code);
}

export async function listAddresses(): Promise<Address[]> {
  return getAll<Address>(KEY);
}

const clean = (v: FormDataEntryValue | null, max: number) =>
  (typeof v === 'string' ? v : '').replace(/\s+/g, ' ').trim().slice(0, max);

export function parseAddress(form: FormData): { address?: Omit<Address, 'code' | 'party'>; error?: string } {
  const a = {
    name: clean(form.get('name'), 200),
    email: clean(form.get('email'), 200),
    line1: clean(form.get('line1'), 200),
    line2: clean(form.get('line2'), 200),
    city: clean(form.get('city'), 100),
    region: clean(form.get('region'), 100),
    postal: clean(form.get('postal'), 20),
    country: clean(form.get('country'), 100) || 'United States',
    submittedAt: new Date().toISOString(),
  };
  if (!a.name) return { error: 'name' };
  if (a.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) return { error: 'email' };
  if (!a.line1 || !a.city || !a.postal) return { error: 'address' };
  return { address: a };
}

export const ADDRESS_COLUMNS = ['addressName', 'address1', 'address2', 'city', 'state', 'postalCode', 'country'];

/** Address cells in the order of ADDRESS_COLUMNS. Empty cells when there is no address. */
export const addressCells = (a?: Address | null) =>
  a ? [a.name, a.line1, a.line2, a.city, a.region, a.postal, a.country] : ADDRESS_COLUMNS.map(() => '');
