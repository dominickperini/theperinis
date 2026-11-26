// Plain world maps, drawn once at build time. No map service and no tiles.
import { geoEquirectangular, geoNaturalEarth1, geoPath, type GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import land from 'world-atlas/land-110m.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const landShape = feature(land as any, (land as any).objects.land);

const make = (projection: GeoProjection, w: number, h: number, west: number, east: number, south: number, north: number) => {
  const frame = {
    type: 'Feature',
    geometry: { type: 'MultiPoint', coordinates: [[west, south], [east, south], [west, north], [east, north]] },
  };
  projection.fitExtent([[10, 10], [w - 10, h - 10]], frame as never);
  const path = geoPath(projection);
  return {
    w,
    h,
    landPath: path(landShape as never) ?? '',
    project: (lon: number, lat: number) => {
      const p = projection([lon, lat]) ?? [0, 0];
      return { x: +p[0].toFixed(1), y: +p[1].toFixed(1) };
    },
  };
};

// The part of the world where our places are.
const world = make(geoNaturalEarth1(), 1000, 440, -126, 124, 18, 57);
export const MAP_W = world.w;
export const MAP_H = world.h;
export const landPath = world.landPath;
export const project = world.project;

/** A long, low strip of the same part of the world, for a header band. */
export const strip = make(geoEquirectangular(), 1000, 170, -126, 124, 18, 57);
