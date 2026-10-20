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

## Guest list and RSVPs

Open `https://theperinis.net/admin` and log in with the `ADMIN_KEY` value.

- **Add guests:** Paste one invitation on each line: `name, email, list, seats`. The list is `A` or `B`.
  Put the last name of each person in the party name (for example `John Smith and Jane Lee`), because guests
  find their invitation by last name.
- **Send invitations:** Select the invitations and click **Mark selected as sent**. Only sent invitations can
  RSVP. Guests go to `/rsvp`, type their last name, and select their party. Each invitation also has its own
  RSVP link, which you can send if you want.
- **Backfill from the B list:** An invitation holds all its seats until the guests reply. A "no" frees all
  seats, and a "yes" for fewer people frees the rest. **Invite next** shows the next B-list invitations, in the
  order you added them, that fit in the open seats.
- **Guest limit:** Set it on the admin page. The default is 150 guests.
- **Phone or paper replies:** Use **Change reply** on the guest row.
- **Downloads:** The guest list (with links) and all RSVP answers download as CSV files.

Guests can send the RSVP form again from the same link to change a reply. The data is kept in
[Upstash for Redis](https://vercel.com/marketplace/upstash) (free plan).

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
