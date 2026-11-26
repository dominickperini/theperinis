import type { APIRoute } from 'astro';

export const prerender = false;

// Old link: the page moved to /wedding/address. Keep the ?code= part of the link.
export const GET: APIRoute = ({ url }) =>
  new Response(null, { status: 308, headers: { Location: `/wedding/address${url.search}` } });
