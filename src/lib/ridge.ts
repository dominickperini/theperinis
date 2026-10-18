// Ridgeline: a mountain profile, like the skyline of the Colorado foothills.
// Used for the hover line on the "The details" rows. Each seed gives a
// different ridge, and each build draws the same shapes.

export const RIDGE_W = 1000; // drawing width (the SVG stretches to the row)
export const RIDGE_H = 16; // drawing height

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function ridgePath(seed: number): string {
  const r = rng(seed);
  const W = RIDGE_W, H = RIDGE_H;
  let y = 12;
  let d = `M0 ${H}L0 ${y}`;
  for (let x = 8; x <= W; x += 8) {
    const peak = Math.sin(x / 130) * 4.5 + Math.sin(x / 41) * 2.2;
    y = Math.min(H - 1, Math.max(1, 9.5 - peak + (r() - 0.5) * 2.4));
    d += `L${x} ${y.toFixed(2)}`;
  }
  return d + `L${W} ${H}`;
}
