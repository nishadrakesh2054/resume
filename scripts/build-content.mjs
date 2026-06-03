#!/usr/bin/env node
/**
 * Pre-render blog & case studies from Supabase → static HTML + sitemap.xml
 * Run: npm install && npm run build:content
 * Requires .env (copy from .env.example) or assets/js/lib/supabase-config.js
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { mkdir, writeFile, readdir, rm } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { renderPage } from './lib/page-shell.mjs';
import {
  renderBlogFeed,
  renderBlogPostPage,
  renderCaseFeed,
  renderCaseStudyPage,
} from './lib/render-content.mjs';
import { absoluteUrl, formatDateIso, SITE_ORIGIN } from './lib/html-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

config({ path: join(ROOT, '.env') });

function loadCredentials() {
  let url = process.env.SUPABASE_URL?.trim();
  let key = process.env.SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    try {
      const raw = readFileSync(join(ROOT, 'assets/js/lib/supabase-config.js'), 'utf8');
      const urlMatch = raw.match(/SUPABASE_URL\s*=\s*['"]([^'"]+)['"]/);
      const keyMatch = raw.match(/SUPABASE_ANON_KEY\s*=\s*['"]([^'"]+)['"]/);
      url = urlMatch?.[1]?.trim();
      key = keyMatch?.[1]?.trim();
    } catch {
      /* ignore */
    }
  }

  if (!url || !key || url.includes('YOUR_PROJECT') || key.includes('YOUR_ANON')) {
    console.error(
      'Missing Supabase credentials. Copy .env.example to .env or fill assets/js/lib/supabase-config.js'
    );
    process.exit(1);
  }

  return { url, key };
}

async function cleanSlugDirs(parentDir, keepNames, keepFiles = []) {
  let entries;
  try {
    entries = await readdir(parentDir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (keepNames.has(entry.name)) continue;
    await rm(join(parentDir, entry.name), { recursive: true, force: true });
    console.log(`  removed stale ${parentDir}/${entry.name}/`);
  }
}

function buildSitemap(urls) {
  const body = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

async function main() {
  const { url, key } = loadCredentials();
  const supabase = createClient(url, key);

  console.log('Fetching published content from Supabase…');

  const [{ data: posts, error: postsErr }, { data: studies, error: studiesErr }] =
    await Promise.all([
      supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false }),
      supabase
        .from('case_studies')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false }),
    ]);

  if (postsErr) throw new Error(`blog_posts: ${postsErr.message}`);
  if (studiesErr) throw new Error(`case_studies: ${studiesErr.message}`);

  const blogPosts = posts || [];
  const caseStudies = studies || [];
  const blogSlugs = new Set(blogPosts.map((p) => p.slug));
  const studySlugs = new Set(caseStudies.map((s) => s.slug));

  await cleanSlugDirs(join(ROOT, 'blog'), blogSlugs);
  await cleanSlugDirs(join(ROOT, 'case-studies'), studySlugs);

  const sitemapUrls = [
    { loc: absoluteUrl('/'), lastmod: formatDateIso(), changefreq: 'weekly', priority: '1.0' },
    { loc: absoluteUrl('/blog/'), lastmod: formatDateIso(), changefreq: 'weekly', priority: '0.9' },
    {
      loc: absoluteUrl('/case-studies/'),
      lastmod: formatDateIso(),
      changefreq: 'weekly',
      priority: '0.9',
    },
  ];

  // Blog index (static list — SEO + no client fetch required)
  const blogIndexMain = `
      <section class="section content-page-hero blog-hero">
        <div class="blog-hero__mesh" aria-hidden="true"></div>
        <div class="container position-relative">
          <nav class="content-breadcrumb" aria-label="Breadcrumb">
            <a href="../index.html">Portfolio</a> / <span>Blog</span>
          </nav>
          <p class="blog-hero__eyebrow"><i class="bi bi-pencil-square" aria-hidden="true"></i> Writing</p>
          <h1>Insights &amp; tutorials</h1>
          <p class="lead">DevOps, full-stack craft, and lessons from shipping real products.</p>
        </div>
      </section>
      <section class="section pt-0"><div class="container">${renderBlogFeed(blogPosts)}</div></section>`;

  await writeFile(
    join(ROOT, 'blog/index.html'),
    renderPage({
      assetBase: '../',
      activeNav: 'blog',
      title: 'Blog | Rakesh Kumar Sahani — Full Stack Developer',
      description:
        'Tutorials and notes on React, Next.js, DevOps, Docker, Coolify, and full-stack development by Rakesh Kumar Sahani.',
      canonical: absoluteUrl('/blog/'),
      bodyClass: 'content-page blog-page',
      mainHtml: blogIndexMain,
    }),
    'utf8'
  );
  console.log('✓ blog/index.html');

  for (const post of blogPosts) {
    const dir = join(ROOT, 'blog', post.slug);
    await mkdir(dir, { recursive: true });
    const { title, description, canonical, ogImage, article, jsonLd } = renderBlogPostPage(post);
    await writeFile(
      join(dir, 'index.html'),
      renderPage({
        assetBase: '../../',
        activeNav: 'blog',
        title,
        description,
        canonical,
        ogImage,
        ogType: 'article',
        bodyClass: 'content-page blog-page blog-detail-page',
        mainHtml: article,
        jsonLd,
      }),
      'utf8'
    );
    sitemapUrls.push({
      loc: canonical,
      lastmod: formatDateIso(post.updated_at || post.published_at),
      changefreq: 'monthly',
      priority: '0.8',
    });
    console.log(`✓ blog/${post.slug}/index.html`);
  }

  // Case studies index
  const caseIndexMain = `
      <section class="section content-page-hero case-hero">
        <div class="case-hero__mesh" aria-hidden="true"></div>
        <div class="container position-relative">
          <nav class="content-breadcrumb" aria-label="Breadcrumb">
            <a href="../index.html">Portfolio</a> / <span>Case studies</span>
          </nav>
          <p class="case-hero__eyebrow"><i class="bi bi-briefcase" aria-hidden="true"></i> Selected work</p>
          <h1>Project deep dives</h1>
          <p class="lead">Production builds — strategy, stack, challenges, and measurable outcomes.</p>
        </div>
      </section>
      <section class="section pt-0"><div class="container">${renderCaseFeed(caseStudies)}</div></section>`;

  await writeFile(
    join(ROOT, 'case-studies/index.html'),
    renderPage({
      assetBase: '../',
      activeNav: 'case-studies',
      title: 'Case Studies | Rakesh Kumar Sahani — Full Stack Projects',
      description:
        'In-depth case studies of ecommerce, SaaS, and web projects built with React, Next.js, Node.js, and PostgreSQL.',
      canonical: absoluteUrl('/case-studies/'),
      bodyClass: 'content-page case-studies-page',
      mainHtml: caseIndexMain,
    }),
    'utf8'
  );
  console.log('✓ case-studies/index.html');

  for (const item of caseStudies) {
    const dir = join(ROOT, 'case-studies', item.slug);
    await mkdir(dir, { recursive: true });
    const { title, description, canonical, ogImage, article, jsonLd } = renderCaseStudyPage(item);
    await writeFile(
      join(dir, 'index.html'),
      renderPage({
        assetBase: '../../',
        activeNav: 'case-studies',
        title,
        description,
        canonical,
        ogImage,
        ogType: 'article',
        bodyClass: 'content-page case-studies-page case-detail-page',
        mainHtml: article,
        jsonLd,
      }),
      'utf8'
    );
    sitemapUrls.push({
      loc: canonical,
      lastmod: formatDateIso(item.updated_at || item.published_at),
      changefreq: 'monthly',
      priority: '0.85',
    });
    console.log(`✓ case-studies/${item.slug}/index.html`);
  }

  const postRedirect = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><title>Redirect</title></head><body>
<script>
var s=new URLSearchParams(location.search).get('slug');
if(s)location.replace(s+'/');else location.replace('./');
</script>
<p><a href="./">Blog</a></p></body></html>`;
  await writeFile(join(ROOT, 'blog/post.html'), postRedirect, 'utf8');

  const studyRedirect = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><title>Redirect</title></head><body>
<script>
var s=new URLSearchParams(location.search).get('slug');
if(s)location.replace(s+'/');else location.replace('./');
</script>
<p><a href="./">Case studies</a></p></body></html>`;
  await writeFile(join(ROOT, 'case-studies/study.html'), studyRedirect, 'utf8');

  await writeFile(join(ROOT, 'sitemap.xml'), buildSitemap(sitemapUrls), 'utf8');
  console.log(`✓ sitemap.xml (${sitemapUrls.length} URLs)`);
  console.log('\nDone. Commit and push to deploy pre-rendered pages for SEO.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
