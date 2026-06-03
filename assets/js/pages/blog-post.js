import { isSupabaseConfigured, fetchBlogPostBySlug } from '../lib/supabase-client.js';
import {
  absoluteUrl,
  getSlugFromQuery,
  escapeHtml,
  formatDate,
  optimizeImageUrl,
  renderMarkdown,
  updatePageMeta,
  renderLoadingHtml,
  renderErrorHtml,
  renderTagsHtml,
} from '../lib/content-utils.js';

const root = document.getElementById('content-root');

function studyUrl(slug) {
  return `../case-studies/${encodeURIComponent(slug)}/`;
}

/**
 * @param {string[] | null | undefined} slugs
 */
function renderRelatedCaseStudies(slugs) {
  const list = Array.isArray(slugs) ? slugs.filter(Boolean) : [];
  if (!list.length) return '';
  return `
    <aside class="content-related">
      <h2>Related case studies</h2>
      <ul>
        ${list.map((s) => `<li><a href="${studyUrl(s)}">${escapeHtml(s.replace(/-/g, ' '))}</a></li>`).join('')}
      </ul>
    </aside>`;
}

/**
 * @param {Record<string, unknown>} post
 */
async function renderPost(post) {
  const title = post.meta_title || `${post.title} | Rakesh Kumar Sahani`;
  const description = post.meta_description || post.excerpt || '';
  const canonical = post.canonical_url || absoluteUrl(`/blog/${post.slug}/`);
  const ogImage = post.og_image_url || post.cover_image_url || '';

  updatePageMeta({
    title,
    description,
    canonical,
    ogImage: ogImage ? String(ogImage) : undefined,
    ogType: 'article',
  });

  const bodyHtml =
    post.body_format === 'html'
      ? String(post.body || '')
      : await renderMarkdown(String(post.body || ''));

  const hero = post.cover_image_url
    ? `<div class="content-detail-hero"><img src="${escapeHtml(optimizeImageUrl(post.cover_image_url, 1200))}" alt="${escapeHtml(post.cover_image_alt || post.title)}" /></div>`
    : '';

  const metaParts = [
    formatDate(post.published_at),
    post.author_name,
    post.reading_time_minutes ? `${post.reading_time_minutes} min read` : '',
    post.category,
  ].filter(Boolean);

  root.innerHTML = `
    <article class="content-detail">
      <nav class="content-breadcrumb" aria-label="Breadcrumb">
        <a href="index.html">Blog</a> / <span>${escapeHtml(post.title)}</span>
      </nav>
      ${hero}
      <h1>${escapeHtml(post.title)}</h1>
      ${post.subtitle ? `<p class="lead">${escapeHtml(post.subtitle)}</p>` : ''}
      <div class="content-detail-meta">${escapeHtml(metaParts.join(' · '))}</div>
      ${renderTagsHtml(post.tags)}
      <div class="content-prose">${bodyHtml}</div>
      ${renderRelatedCaseStudies(post.related_case_study_slugs)}
      <p class="mt-4"><a href="index.html" class="btn btn-outline-light btn-sm">← All posts</a></p>
    </article>`;
}

async function init() {
  if (!root) return;
  const slug = getSlugFromQuery();

  if (!slug) {
    root.innerHTML = renderErrorHtml('Missing post', 'No article slug was provided in the URL.');
    return;
  }

  root.innerHTML = renderLoadingHtml('Loading article…');

  if (!isSupabaseConfigured()) {
    root.innerHTML = renderErrorHtml(
      'Supabase not configured',
      'Add your credentials in assets/js/lib/supabase-config.js'
    );
    return;
  }

  const { data, error } = await fetchBlogPostBySlug(slug);

  if (error) {
    root.innerHTML = renderErrorHtml('Could not load post', error.message || 'Unknown error');
    return;
  }

  if (!data) {
    root.innerHTML = renderErrorHtml(
      'Post not found',
      'This article may be unpublished or the slug is incorrect.'
    );
    return;
  }

  await renderPost(data);
}

init();
