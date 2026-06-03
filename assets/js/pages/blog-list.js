import { isSupabaseConfigured, fetchPublishedBlogPosts } from '../lib/supabase-client.js';
import {
  escapeHtml,
  formatDate,
  optimizeImageUrl,
  renderErrorHtml,
  renderEmptyHtml,
} from '../lib/content-utils.js';

const root = document.getElementById('content-root');

function postUrl(slug) {
  return `${encodeURIComponent(slug)}/`;
}

function formatCategory(category) {
  if (!category) return '';
  return String(category).replace(/-/g, ' ');
}

function renderBlogTags(tags) {
  const list = Array.isArray(tags) ? tags.filter(Boolean).slice(0, 4) : [];
  if (!list.length) return '';
  return `<div class="blog-tags">${list.map((t) => `<span class="blog-tag">${escapeHtml(t)}</span>`).join('')}</div>`;
}

/**
 * @param {Record<string, unknown>} post
 * @param {boolean} isFeatured
 */
function renderFeatured(post, isFeatured) {
  const img = post.cover_image_url
    ? `<div class="blog-featured__visual">
        <img src="${escapeHtml(optimizeImageUrl(post.cover_image_url, 960))}" alt="${escapeHtml(post.cover_image_alt || post.title)}" loading="eager" decoding="async" />
        <div class="blog-featured__shine" aria-hidden="true"></div>
      </div>`
    : `<div class="blog-featured__visual blog-featured__visual--placeholder" aria-hidden="true">
        <i class="bi bi-journal-richtext"></i>
      </div>`;

  const readTime = post.reading_time_minutes ? `${post.reading_time_minutes} min read` : '';

  return `
    <a class="blog-featured" href="${postUrl(post.slug)}">
      ${isFeatured ? '<span class="blog-featured__badge"><i class="bi bi-star-fill" aria-hidden="true"></i> Featured</span>' : '<span class="blog-featured__badge blog-featured__badge--latest">Latest</span>'}
      <div class="blog-featured__grid">
        <div class="blog-featured__content">
          ${post.category ? `<span class="blog-pill">${escapeHtml(formatCategory(post.category))}</span>` : ''}
          <h2 class="blog-featured__title">${escapeHtml(post.title)}</h2>
          ${post.subtitle ? `<p class="blog-featured__subtitle">${escapeHtml(post.subtitle)}</p>` : ''}
          <p class="blog-featured__excerpt">${escapeHtml(post.excerpt)}</p>
          ${renderBlogTags(post.tags)}
          <div class="blog-featured__meta">
            <span><i class="bi bi-calendar3" aria-hidden="true"></i> ${escapeHtml(formatDate(post.published_at))}</span>
            ${readTime ? `<span><i class="bi bi-clock" aria-hidden="true"></i> ${escapeHtml(readTime)}</span>` : ''}
          </div>
          <span class="blog-featured__cta">Read full article <i class="bi bi-arrow-right" aria-hidden="true"></i></span>
        </div>
        ${img}
      </div>
    </a>`;
}

/**
 * @param {Record<string, unknown>} post
 * @param {number} index
 */
function renderBlogItem(post, index) {
  const img = post.cover_image_url
    ? `<div class="blog-item__thumb">
        <img src="${escapeHtml(optimizeImageUrl(post.cover_image_url, 400))}" alt="" loading="lazy" decoding="async" />
      </div>`
    : `<div class="blog-item__thumb blog-item__thumb--empty"><i class="bi bi-file-text" aria-hidden="true"></i></div>`;

  const readTime = post.reading_time_minutes ? `${post.reading_time_minutes} min` : '';

  return `
    <a class="blog-item" href="${postUrl(post.slug)}" style="--blog-item-i: ${index}">
      <div class="blog-item__date">
        <span class="blog-item__day">${escapeHtml(formatDate(post.published_at))}</span>
        ${readTime ? `<span class="blog-item__read">${escapeHtml(readTime)}</span>` : ''}
      </div>
      <div class="blog-item__main">
        <div class="blog-item__head">
          ${post.category ? `<span class="blog-pill blog-pill--sm">${escapeHtml(formatCategory(post.category))}</span>` : ''}
          <h3 class="blog-item__title">${escapeHtml(post.title)}</h3>
        </div>
        <p class="blog-item__excerpt">${escapeHtml(post.excerpt)}</p>
        ${renderBlogTags(post.tags)}
      </div>
      ${img}
      <span class="blog-item__arrow" aria-hidden="true"><i class="bi bi-arrow-up-right"></i></span>
    </a>`;
}

function renderBlogLoading() {
  return `
    <div class="blog-feed blog-feed--loading" role="status" aria-live="polite">
      <div class="blog-skeleton blog-skeleton--featured"></div>
      <div class="blog-skeleton blog-skeleton--row"></div>
      <div class="blog-skeleton blog-skeleton--row"></div>
      <p class="content-state-text">Loading articles…</p>
    </div>`;
}

/**
 * @param {Record<string, unknown>[]} data
 */
function renderFeed(data) {
  const featured = data.find((p) => p.featured) || data[0];
  const rest = data.filter((p) => p.slug !== featured.slug);
  const showFeaturedBadge = Boolean(featured.featured);

  const listHtml = rest.length
    ? `<div class="blog-list">
        <div class="blog-list__header">
          <h2 class="blog-list__heading">More articles</h2>
          <span class="blog-list__count">${rest.length} post${rest.length === 1 ? '' : 's'}</span>
        </div>
        ${rest.map((p, i) => renderBlogItem(p, i)).join('')}
      </div>`
    : '';

  return `
    <div class="blog-feed">
      ${renderFeatured(featured, showFeaturedBadge)}
      ${listHtml}
    </div>`;
}

async function init() {
  if (!root) return;
  root.innerHTML = renderBlogLoading();

  if (!isSupabaseConfigured()) {
    root.innerHTML = renderErrorHtml(
      'Supabase not configured',
      'Add your Project URL and anon key in assets/js/lib/supabase-config.js'
    );
    return;
  }

  const { data, error } = await fetchPublishedBlogPosts();

  if (error) {
    root.innerHTML = renderErrorHtml('Could not load posts', error.message || 'Unknown error');
    return;
  }

  if (!data?.length) {
    root.innerHTML = renderEmptyHtml(
      'No posts yet',
      'Published blog posts will appear here once you add them in Supabase.',
      '../index.html',
      'Back to portfolio'
    );
    return;
  }

  root.innerHTML = renderFeed(data);
}

init();
