import { isSupabaseConfigured, fetchPublishedCaseStudies } from '../lib/supabase-client.js';
import {
  escapeHtml,
  formatDate,
  optimizeImageUrl,
  renderErrorHtml,
  renderEmptyHtml,
} from '../lib/content-utils.js';

const root = document.getElementById('content-root');

function studyUrl(slug) {
  return `${encodeURIComponent(slug)}/`;
}

/**
 * @param {unknown} metrics
 */
function renderMetricPreview(metrics) {
  if (!Array.isArray(metrics) || !metrics.length) return '';
  const first = metrics.find((m) => m && (m.label || m.value));
  if (!first) return '';
  return `
    <div class="case-metric-preview">
      <span class="case-metric-preview__value">${escapeHtml(first.value ?? '')}</span>
      <span class="case-metric-preview__label">${escapeHtml(first.label ?? '')}</span>
    </div>`;
}

function renderCaseStack(stack) {
  const list = Array.isArray(stack) ? stack.filter(Boolean).slice(0, 5) : [];
  if (!list.length) return '';
  return `<div class="case-stack">${list.map((t) => `<span class="case-stack__item">${escapeHtml(t)}</span>`).join('')}</div>`;
}

/**
 * @param {Record<string, unknown>} item
 * @param {number} index
 */
function renderCaseRow(item, index) {
  const reversed = index % 2 === 1;
  const img = item.cover_image_url
    ? `<div class="case-row__media">
        <img src="${escapeHtml(optimizeImageUrl(item.cover_image_url, 900))}" alt="${escapeHtml(item.cover_image_alt || item.title)}" loading="lazy" decoding="async" />
        <div class="case-row__media-glow" aria-hidden="true"></div>
      </div>`
    : `<div class="case-row__media case-row__media--placeholder" aria-hidden="true">
        <i class="bi bi-window-stack"></i>
      </div>`;

  const company = item.company || item.client_name;
  const category = item.category ? String(item.category).replace(/-/g, ' ') : '';

  return `
    <a class="case-row${reversed ? ' case-row--reverse' : ''}${item.featured ? ' case-row--featured' : ''}" href="${studyUrl(item.slug)}" style="--case-row-i: ${index}">
      ${item.featured ? '<span class="case-row__ribbon">Featured project</span>' : ''}
      <div class="case-row__inner">
        ${img}
        <div class="case-row__content">
          <div class="case-row__labels">
            ${company ? `<span class="case-chip case-chip--client"><i class="bi bi-building" aria-hidden="true"></i> ${escapeHtml(company)}</span>` : ''}
            ${category ? `<span class="case-chip">${escapeHtml(category)}</span>` : ''}
          </div>
          <h2 class="case-row__title">${escapeHtml(item.title)}</h2>
          ${item.tagline ? `<p class="case-row__tagline">${escapeHtml(item.tagline)}</p>` : ''}
          <p class="case-row__excerpt">${escapeHtml(item.excerpt)}</p>
          ${renderCaseStack(item.stack)}
          <div class="case-row__footer">
            ${item.role ? `<span class="case-row__role"><i class="bi bi-person-badge" aria-hidden="true"></i> ${escapeHtml(item.role)}</span>` : ''}
            <span class="case-row__date">${escapeHtml(formatDate(item.published_at))}</span>
          </div>
          ${renderMetricPreview(item.metrics)}
          <span class="case-row__cta">Explore case study <i class="bi bi-arrow-right" aria-hidden="true"></i></span>
        </div>
      </div>
    </a>`;
}

function renderCaseLoading() {
  return `
    <div class="case-feed case-feed--loading" role="status" aria-live="polite">
      <div class="case-skeleton case-skeleton--row"></div>
      <div class="case-skeleton case-skeleton--row"></div>
      <p class="content-state-text">Loading case studies…</p>
    </div>`;
}

async function init() {
  if (!root) return;
  root.innerHTML = renderCaseLoading();

  if (!isSupabaseConfigured()) {
    root.innerHTML = renderErrorHtml(
      'Supabase not configured',
      'Add your Project URL and anon key in assets/js/lib/supabase-config.js'
    );
    return;
  }

  const { data, error } = await fetchPublishedCaseStudies();

  if (error) {
    root.innerHTML = renderErrorHtml('Could not load case studies', error.message || 'Unknown error');
    return;
  }

  if (!data?.length) {
    root.innerHTML = renderEmptyHtml(
      'No case studies yet',
      'Published case studies will appear here once you add them in Supabase.',
      '../index.html',
      'Back to portfolio'
    );
    return;
  }

  root.innerHTML = `<div class="case-feed">${data.map((item, i) => renderCaseRow(item, i)).join('')}</div>`;
}

init();
