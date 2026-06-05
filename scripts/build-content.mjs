#!/usr/bin/env node
/**
 * Pre-render blog from Supabase → static HTML + sitemap.xml
 * Run: npm install && npm run build:content
 * Requires .env (copy from .env.example) or assets/js/lib/supabase-config.js
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { mkdir, writeFile, readdir, rm, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { renderPage } from './lib/page-shell.mjs';
import { renderBlogFeed, renderBlogPostPage } from './lib/render-content.mjs';
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
    return null;
  }

  return { url, key };
}

/** Merge published posts from supabase/seeds/*.json (local source of truth when DB row missing). */
async function loadLocalBlogSeeds() {
  const seedsDir = join(ROOT, 'supabase/seeds');
  let files;
  try {
    files = await readdir(seedsDir);
  } catch {
    return [];
  }
  const posts = [];
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const raw = await readFile(join(seedsDir, file), 'utf8');
      const row = JSON.parse(raw);
      if (row?.slug && row.status === 'published') posts.push(row);
    } catch (err) {
      console.warn(`  skip seed ${file}: ${err.message}`);
    }
  }
  return posts;
}

function mergeBlogPosts(remotePosts, localSeeds) {
  const bySlug = new Map();
  for (const p of remotePosts || []) bySlug.set(p.slug, p);
  for (const p of localSeeds) {
    const existing = bySlug.get(p.slug);
    if (!existing || new Date(p.updated_at || p.published_at || 0) >= new Date(existing.updated_at || existing.published_at || 0)) {
      bySlug.set(p.slug, { ...existing, ...p });
    }
  }
  return [...bySlug.values()].sort(
    (a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0)
  );
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
  const creds = loadCredentials();
  const localSeeds = await loadLocalBlogSeeds();

  let posts = [];

  if (creds) {
    const supabase = createClient(creds.url, creds.key);
    console.log('Fetching published blog posts from Supabase…');
    const { data: remotePosts, error: postsErr } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    if (postsErr) throw new Error(`blog_posts: ${postsErr.message}`);
    posts = remotePosts || [];
  } else {
    console.warn(
      'No Supabase credentials — building blog pages from supabase/seeds/*.json only.\n' +
        '  Add .env or run supabase/seed-coolify-blog.sql in Supabase for production CMS.'
    );
  }

  const blogPosts = mergeBlogPosts(posts, localSeeds);
  if (localSeeds.length) {
    console.log(`Blog posts (${blogPosts.length}): ${blogPosts.map((p) => p.slug).join(', ')}`);
  }
  const blogSlugs = new Set(blogPosts.map((p) => p.slug));

  await cleanSlugDirs(join(ROOT, 'blog'), blogSlugs);

  try {
    await rm(join(ROOT, 'case-studies'), { recursive: true, force: true });
    console.log('✓ removed case-studies/');
  } catch {
    /* already gone */
  }

  const sitemapUrls = [
    { loc: absoluteUrl('/'), lastmod: formatDateIso(), changefreq: 'weekly', priority: '1.0' },
    { loc: absoluteUrl('/blog/'), lastmod: formatDateIso(), changefreq: 'weekly', priority: '0.9' },
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

  const postRedirect = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><title>Redirect</title></head><body>
<script>
var s=new URLSearchParams(location.search).get('slug');
if(s)location.replace(s+'/');else location.replace('./');
</script>
<p><a href="./">Blog</a></p></body></html>`;
  await writeFile(join(ROOT, 'blog/post.html'), postRedirect, 'utf8');

  await writeFile(join(ROOT, 'sitemap.xml'), buildSitemap(sitemapUrls), 'utf8');
  console.log(`✓ sitemap.xml (${sitemapUrls.length} URLs)`);
  console.log('\nDone. Commit and push to deploy pre-rendered pages for SEO.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
