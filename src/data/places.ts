// Places where our photos were taken. Points are city level only (one decimal),
// never an exact spot. Photo numbers are the pNN files in src/assets/photos.
// To add a photo to a place, add its number to `photos`.
import { byNumber, type Media } from './media';

export interface Place {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  photos: Media[];
}

const list: (Omit<Place, 'photos'> & { photos: number[] })[] = [
  { id: 'denver', name: 'Denver', region: 'Colorado', lat: 39.7, lon: -105.0, photos: [8, 9, 33, 40, 58, 59, 10, 32, 34, 45] },
  { id: 'foothills', name: 'The foothills', region: 'Colorado', lat: 39.7, lon: -105.3, photos: [37, 47, 50, 56] },
  { id: 'larkspur', name: 'Larkspur', region: 'Colorado', lat: 39.2, lon: -104.9, photos: [25] },
  { id: 'breckenridge', name: 'Breckenridge', region: 'Colorado', lat: 39.5, lon: -106.0, photos: [4] },
  { id: 'dunes', name: 'Great Sand Dunes', region: 'Colorado', lat: 37.8, lon: -105.5, photos: [15] },
  { id: 'vegas', name: 'Las Vegas', region: 'Nevada', lat: 36.1, lon: -115.2, photos: [2, 3, 57, 19] },
  { id: 'socal', name: 'Southern California', region: 'California', lat: 34.2, lon: -118.8, photos: [44] },
  { id: 'san-antonio', name: 'San Antonio', region: 'Texas', lat: 29.4, lon: -98.5, photos: [54] },
  { id: 'maryland', name: 'Maryland', region: 'Maryland', lat: 39.2, lon: -77.5, photos: [12, 21] },
  { id: 'london', name: 'London', region: 'England', lat: 51.5, lon: -0.1, photos: [41] },
  { id: 'dover', name: 'White cliffs', region: 'England', lat: 51.1, lon: 1.3, photos: [5] },
  { id: 'dolomites', name: 'The Dolomites', region: 'Italy', lat: 46.5, lon: 11.7, photos: [7, 36, 39] },
  { id: 'garda', name: 'Lake Garda', region: 'Italy', lat: 45.6, lon: 10.6, photos: [24, 31] },
  { id: 'venice', name: 'Venice', region: 'Italy', lat: 45.4, lon: 12.3, photos: [51] },
  { id: 'rajkot', name: 'Rajkot', region: 'India', lat: 22.3, lon: 70.8, photos: [35] },
  { id: 'guangdong', name: 'Guangdong', region: 'China', lat: 23.0, lon: 113.3, photos: [52] },
  { id: 'yangshuo', name: 'Yangshuo', region: 'China', lat: 24.8, lon: 110.5, photos: [13, 27] },
  { id: 'chongqing', name: 'Chongqing', region: 'China', lat: 29.6, lon: 106.6, photos: [28, 43] },
];

export const places: Place[] = list.map((p) => ({ ...p, photos: p.photos.map(byNumber) }));

const placed = new Set(list.flatMap((p) => p.photos));
/** Photos with no known place. */
export const unplaced: Media[] = Array.from({ length: 59 }, (_, i) => i + 1)
  .filter((n) => !placed.has(n))
  .map(byNumber);

/** Places grouped by region, for the map: one marker for each region. */
export const regions = [...new Set(places.map((p) => p.region))].map((region) => {
  const ps = places.filter((p) => p.region === region);
  return {
    id: region.toLowerCase().replace(/\s+/g, '-'),
    name: region,
    lat: ps.reduce((a, p) => a + p.lat, 0) / ps.length,
    lon: ps.reduce((a, p) => a + p.lon, 0) / ps.length,
    places: ps,
    count: ps.reduce((a, p) => a + p.photos.length, 0),
  };
});

/** "39.7° N · 105.0° W" */
export const coords = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(1)}° ${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lon).toFixed(1)}° ${lon >= 0 ? 'E' : 'W'}`;

/** The place of a photo, or undefined. */
const byMedia = new Map<Media, Place>(places.flatMap((p) => p.photos.map((m) => [m, p] as [Media, Place])));
export const placeOf = (m: Media) => byMedia.get(m);
