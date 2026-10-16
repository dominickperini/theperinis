# ThePerinis.net

The family website of Dominick and Sarah Perini. The first version is our wedding website.

Built with [Astro](https://astro.build). Hosted on [Vercel](https://vercel.com). The domain is at Cloudflare.

## Change the wedding details

All facts (date, venue, schedule, hotels, registry, FAQ) are in one file:
[`src/data/wedding.ts`](src/data/wedding.ts). Text in `[square brackets]` is a placeholder. Replace it.

## Run the site on your computer

```sh
npm install
npm run dev
```

Then open http://localhost:4321. On your computer, RSVPs stay in memory only.

## RSVPs

The RSVP form sends replies to `/api/rsvp`, a Vercel function. The function keeps the replies in
[Upstash for Redis](https://vercel.com/marketplace/upstash) (free plan). One reply is kept per email address,
so a guest can send the form again to change the reply.

To download all replies as a spreadsheet (CSV), open:

```
https://theperinis.net/api/rsvps?key=YOUR_ADMIN_KEY
```

### Set up RSVP storage on Vercel

1. In the Vercel project, go to **Storage** > **Create Database** > **Upstash for Redis**. Select the free plan.
   Connect it to this project. Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` for you.
2. Go to **Settings** > **Environment Variables**. Add `ADMIN_KEY` with a long random value.
3. Deploy again.

## Connect the domain (Cloudflare to Vercel)

1. In Vercel, go to **Settings** > **Domains**. Add `theperinis.net` and `www.theperinis.net`.
2. In Cloudflare, go to **DNS** > **Records**. Add the records that Vercel shows. Usually these are:
   - `A` record, name `@`, value `76.76.21.21`
   - `CNAME` record, name `www`, value `cname.vercel-dns.com`
3. Set the proxy status of both records to **DNS only** (grey cloud). Vercel then makes the SSL certificate.
