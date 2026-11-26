// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Pages are static. Only the RSVP, address and admin routes run on the server.
// theperinis.net is the family site; the wedding lives under /wedding.
export default defineConfig({
  site: 'https://theperinis.net',
  output: 'static',
  adapter: vercel(),
  // Old links go to the new places. (/rsvp, /address and /admin keep their
  // ?code= part: see src/pages/rsvp.ts, address.ts and admin.ts.)
  redirects: {
    // Temporary (302): later theperinis.net becomes the family home page.
    '/': { status: 302, destination: '/wedding' },
    '/story': '/wedding#story',
    '/details': '/wedding/details',
    '/schedule': '/wedding/details#schedule',
    '/travel': '/wedding/details#travel',
    '/registry': '/wedding/details#registry',
    '/faq': '/wedding/details#faq',
  },
});
