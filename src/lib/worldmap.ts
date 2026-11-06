// A plain world map, drawn once at build time. No map service and no tiles.
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import land from 'world-atlas/land-110m.json';

export const MAP_W = 1000;
export const MAP_H = 440;

// Frame the part of the world where our places are.
const frame = {
  type: 'Feature',
  geometry: { type: 'MultiPoint', coordinates: [[-126, 18], [124, 18], [-126, 57], [124, 57]] },
} as const;
const projection = geoNaturalEarth1().fitExtent([[10, 10], [MAP_W - 10, MAP_H - 10]], frame as never);
const path = geoPath(projection);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const landShape = feature(land as any, (land as any).objects.land);
export const landPath = path(landShape as never) ?? '';
export const project = (lon: number, lat: number) => {
  const p = projection([lon, lat]) ?? [0, 0];
  return { x: +p[0].toFixed(1), y: +p[1].toFixed(1) };
};
