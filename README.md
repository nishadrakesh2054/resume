# Portfolio — Rakesh Kumar Sahani

Static portfolio on GitHub Pages with blog powered by Supabase.

**Live:** https://rakeshsahani.vercel.app/

## Publish content (after editing Supabase)

```bash
npm install          # once
npm run build:content
git add .
git commit -m "Update content"
git push
```

## Project layout

| Path | Purpose |
|------|---------|
| `index.html` | Homepage |
| `blog/` | Pre-built static blog pages (generated) |
| `scripts/build-content.mjs` | Fetches Supabase → HTML + sitemap |
| `supabase/schema.sql` | Database schema (run once in Supabase) |
| `assets/` | CSS, JS, images |

## Secrets (never commit)

- `.env` — for `npm run build:content` (copy from `.env.example`)
- `assets/js/lib/supabase-config.js` — gitignored

## Optional SQL

- `supabase/seed-example.sql` — sample rows for testing only
- `supabase/seed-coolify-blog.sql` — clears case studies + seeds one blog post (run in Supabase SQL Editor)
- `supabase/seeds/*.json` — local blog source; merged by `npm run build:content` when DB is empty or ahead of remote

Regenerate Coolify seed from markdown:

```bash
node scripts/generate-coolify-seed.mjs
```
