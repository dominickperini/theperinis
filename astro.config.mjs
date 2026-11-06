// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Pages are static. Only the RSVP API routes run on the server.
export default defineConfig({
  site: 'https://theperinis.net',
  output: 'static',
  adapter: vercel(),
  // The site has three tabs now. Old links go to the new places.
  redirects: {
    '/story': '/#story',
    '/schedule': '/details#schedule',
    '/travel': '/details#travel',
    '/registry': '/details#registry',
    '/faq': '/details#faq',
  },
});
