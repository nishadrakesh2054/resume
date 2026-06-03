# Content build (SEO)

Pre-renders **blog** and **case studies** from Supabase into static HTML with clean URLs.

## When to run

After you publish or update content in Supabase:

```bash
cd resume
npm install
npm run build:content
```

Then commit and push (including new `blog/*/index.html`, `case-studies/*/index.html`, and `sitemap.xml`).

## Credentials

Uses `.env` (copy from `.env.example`) or falls back to `assets/js/lib/supabase-config.js`.

## Output

| URL | File |
|-----|------|
| `/blog/` | `blog/index.html` (full list in HTML) |
| `/blog/my-slug/` | `blog/my-slug/index.html` (full article in HTML) |
| `/case-studies/` | `case-studies/index.html` |
| `/case-studies/my-slug/` | `case-studies/my-slug/index.html` |
| `sitemap.xml` | All URLs including each slug |

Old `post.html?slug=` and `study.html?slug=` redirect to clean URLs.
