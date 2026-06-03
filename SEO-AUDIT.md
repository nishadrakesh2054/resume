# SEO Audit — Rakesh Kumar Sahani Portfolio

**Site URL (configure):** `https://nishadrakesh2054.github.io/rakesh/`  
**Last audit:** 2026-06-01  
**Site type:** Single-page portfolio (sections = logical pages)

---

## Overall SEO score: **82 / 100** (Strong foundation)

| Area | Score | Status |
|------|-------|--------|
| Technical SEO | 88/100 | Good |
| On-page SEO | 85/100 | Good |
| Content & keywords | 80/100 | Good |
| Structured data | 90/100 | Excellent |
| Performance (SEO impact) | 72/100 | Needs work |
| Off-page / authority | N/A | Your backlinks & LinkedIn |

---

## What was implemented

### Technical
- [x] Unique `<title>` with primary keywords (name + role + location + stack)
- [x] Meta description (155 chars, skills + hire intent)
- [x] Meta keywords (supporting only; Google ignores for ranking)
- [x] Canonical URL + `hreflang`
- [x] `robots.txt` + `sitemap.xml`
- [x] `site.webmanifest` (PWA metadata)
- [x] Open Graph + Twitter Card (full set)
- [x] Geo tags (Kathmandu, Nepal)
- [x] Skip link + `main` landmark
- [x] One `<h1>` per page; section `<h2>` with keyword-rich titles

### Structured data (JSON-LD)
- [x] `WebSite` + `ProfilePage`
- [x] `Person` (skills, location, LinkedIn, employer, education)
- [x] `ProfessionalService`
- [x] `BreadcrumbList`
- [x] `FAQPage` (matches visible FAQ in Contact section)

### Content (by section)
| Section | SEO focus |
|---------|-----------|
| **Hero** | H1: Full Stack Developer Nepal; MERN, React, Next.js |
| **About** | Skills stacks, 3+ years, Kathmandu |
| **Resume** | Arksh Group, One or Eight, Navata Tech |
| **Services** | Hire intent, freelance, full stack services |
| **Portfolio** | 23 project images with unique descriptive `alt` text |
| **Contact** | Hire developer Kathmandu + FAQ |

### Files to update when you get a custom domain
1. `seo.config.json` → `siteUrl`
2. `sitemap.xml` → all `<loc>` URLs
3. `robots.txt` → Sitemap line
4. `index.html` → canonical, OG, Twitter, `meta site-url`
5. JSON-LD in `index.html` (search `nishadrakesh2054.github.io`)

---

## Remaining improvements (to reach 90+)

1. **Custom domain** — `rakeshsahani.com` ranks better than `github.io` subpaths.
2. **Google Search Console** — verify site, submit `sitemap.xml`.
3. **Page speed** — compress hero/portfolio images (WebP), reduce font weights.
4. **GitHub / empty `href="#"`** — add real GitHub URL on social links.
5. **Blog or case studies** — separate URLs help rank long-tail keywords.
6. **Backlinks** — LinkedIn, GitHub README, dev.to articles linking to portfolio.
7. **Local SEO** — Google Business Profile (if offering local freelance).

---

## Target keywords (tracked)

**Primary**
- Rakesh Kumar Sahani
- Full stack developer Nepal
- MERN developer Kathmandu

**Secondary**
- React developer Nepal
- Next.js developer Kathmandu
- Hire full stack developer Nepal
- Freelance web developer Nepal

**Technical long-tail**
- Docker Coolify deployment Nepal
- React Next.js portfolio developer

---

## Validation tools (run after deploy)

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Google Search Console](https://search.google.com/search-console)

---

## Important note on ranking

SEO on-page work **does not guarantee top Google rankings**. Rankings also depend on domain authority, competition, content volume, and time. This portfolio is optimized to compete for **your name** and **niche Nepal developer** queries first; broader terms like "React developer" need ongoing content and backlinks.
