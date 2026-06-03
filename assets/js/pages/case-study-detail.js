import { isSupabaseConfigured, fetchCaseStudyBySlug } from '../lib/supabase-client.js';
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

/**
 * @param {unknown} metrics
 */
function renderMetrics(metrics) {
  if (!Array.isArray(metrics) || !metrics.length) return '';
  const items = metrics
    .filter((m) => m && (m.label || m.value))
    .map(
      (m) => `
      <div class="content-metric">
        <span class="content-metric-value">${escapeHtml(m.value ?? '')}</span>
        <span class="content-metric-label">${escapeHtml(m.label ?? '')}</span>
      </div>`
    )
    .join('');
  return items ? `<div class="content-metrics">${items}</div>` : '';
}

/**
 * @param {unknown} gallery
 */
function renderGallery(gallery) {
  if (!Array.isArray(gallery) || !gallery.length) return '';
  const figures = gallery
    .filter((g) => g && g.url)
    .map(
      (g) => `
      <figure>
        <img src="${escapeHtml(optimizeImageUrl(g.url, 800))}" alt="${escapeHtml(g.alt || '')}" loading="lazy" />
        ${g.caption ? `<figcaption>${escapeHtml(g.caption)}</figcaption>` : ''}
      </figure>`
    )
    .join('');
  return figures ? `<div class="content-gallery">${figures}</div>` : '';
}

/**
 * @param {string} title
 * @param {string | null | undefined} text
 */
function renderBlock(title, text) {
  if (!text?.trim()) return '';
  return `
    <section class="content-block">
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(text)}</p>
    </section>`;
}

function postUrl(slug) {
  return `../blog/${encodeURIComponent(slug)}/`;
}

/**
 * @param {string[] | null | undefined} slugs
 */
function renderRelatedBlog(slugs) {
  const list = Array.isArray(slugs) ? slugs.filter(Boolean) : [];
  if (!list.length) return '';
  return `
    <aside class="content-related">
      <h2>Related articles</h2>
      <ul>
        ${list.map((s) => `<li><a href="${postUrl(s)}">${escapeHtml(s.replace(/-/g, ' '))}</a></li>`).join('')}
      </ul>
    </aside>`;
}

/**
 * @param {Record<string, unknown>} item
 */
async function renderStudy(item) {
  const title = item.meta_title || `${item.title} Case Study | Rakesh Kumar Sahani`;
  const description = item.meta_description || item.excerpt || '';
  const canonical = item.canonical_url || absoluteUrl(`/case-studies/${item.slug}/`);
  const ogImage = item.og_image_url || item.hero_image_url || item.cover_image_url || '';

  updatePageMeta({
    title,
    description,
    canonical,
    ogImage: ogImage ? String(ogImage) : undefined,
    ogType: 'article',
  });

  const bodyHtml =
    item.body_format === 'html'
      ? String(item.body || '')
      : await renderMarkdown(String(item.body || ''));

  const heroSrc = item.hero_image_url || item.cover_image_url;
  const hero = heroSrc
    ? `<div class="content-detail-hero"><img src="${escapeHtml(optimizeImageUrl(heroSrc, 1200))}" alt="${escapeHtml(item.cover_image_alt || item.title)}" /></div>`
    : '';

  const stack = Array.isArray(item.stack) ? item.stack : [];
  const stackHtml = stack.length
    ? `<div class="content-stack">${stack.map((t) => `<span class="content-tag">${escapeHtml(t)}</span>`).join('')}</div>`
    : '';

  const actions = [];
  if (item.live_url) {
    actions.push(
      `<a class="btn btn-primary" href="${escapeHtml(item.live_url)}" target="_blank" rel="noopener noreferrer">Live site</a>`
    );
  }
  if (item.github_url) {
    actions.push(
      `<a class="btn btn-outline-light" href="${escapeHtml(item.github_url)}" target="_blank" rel="noopener noreferrer">GitHub</a>`
    );
  }
  if (item.demo_video_url) {
    actions.push(
      `<a class="btn btn-outline-light" href="${escapeHtml(item.demo_video_url)}" target="_blank" rel="noopener noreferrer">Demo video</a>`
    );
  }

  const testimonial =
    item.testimonial_quote && item.testimonial_author
      ? `
    <blockquote class="content-block mt-4">
      <p class="fst-italic">"${escapeHtml(item.testimonial_quote)}"</p>
      <footer class="small text-muted">— ${escapeHtml(item.testimonial_author)}${item.testimonial_role ? `, ${escapeHtml(item.testimonial_role)}` : ''}</footer>
    </blockquote>`
      : '';

  const metaParts = [
    item.company,
    item.client_name,
    item.role,
    formatDate(item.published_at),
    item.duration_label,
  ].filter(Boolean);

  root.innerHTML = `
    <article class="content-detail">
      <nav class="content-breadcrumb" aria-label="Breadcrumb">
        <a href="index.html">Case studies</a> / <span>${escapeHtml(item.title)}</span>
      </nav>
      ${hero}
      <h1>${escapeHtml(item.title)}</h1>
      ${item.tagline ? `<p class="lead">${escapeHtml(item.tagline)}</p>` : ''}
      <div class="content-detail-meta">${escapeHtml(metaParts.join(' · '))}</div>
      ${stackHtml}
      ${actions.length ? `<div class="content-actions">${actions.join('')}</div>` : ''}
      ${renderMetrics(item.metrics)}
      ${item.overview ? renderBlock('Overview', item.overview) : ''}
      ${renderBlock('Challenge', item.challenge)}
      ${renderBlock('Solution', item.solution)}
      ${renderBlock('Results', item.results)}
      ${renderBlock('Lessons learned', item.lessons_learned)}
      ${renderGallery(item.gallery)}
      ${bodyHtml.trim() ? `<div class="content-prose">${bodyHtml}</div>` : ''}
      ${testimonial}
      ${renderTagsHtml(item.tags)}
      ${renderRelatedBlog(item.related_blog_slugs)}
      <p class="mt-4"><a href="index.html" class="btn btn-outline-light btn-sm">← All case studies</a></p>
    </article>`;
}

async function init() {
  if (!root) return;
  const slug = getSlugFromQuery();

  if (!slug) {
    root.innerHTML = renderErrorHtml('Missing case study', 'No slug was provided in the URL.');
    return;
  }

  root.innerHTML = renderLoadingHtml('Loading case study…');

  if (!isSupabaseConfigured()) {
    root.innerHTML = renderErrorHtml(
      'Supabase not configured',
      'Add your credentials in assets/js/lib/supabase-config.js'
    );
    return;
  }

  const { data, error } = await fetchCaseStudyBySlug(slug);

  if (error) {
    root.innerHTML = renderErrorHtml('Could not load case study', error.message || 'Unknown error');
    return;
  }

  if (!data) {
    root.innerHTML = renderErrorHtml(
      'Case study not found',
      'This project may be unpublished or the slug is incorrect.'
    );
    return;
  }

  await renderStudy(data);
}

init();
