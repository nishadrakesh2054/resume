/**
 * Shared helpers for blog & case study pages.
 */

export const SITE_ORIGIN = 'https://nishadrakesh2054.github.io/rakesh';

/**
 * @param {string} path e.g. '/blog/' or '/blog/post.html'
 */
export function absoluteUrl(path) {
  const base = SITE_ORIGIN.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * @returns {string}
 */
export function getSlugFromQuery() {
  return new URLSearchParams(window.location.search).get('slug')?.trim() || '';
}

/**
 * @param {string} value
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {string | null | undefined} iso
 */
export function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

/**
 * @param {string} url
 * @param {number} width
 */
export function optimizeImageUrl(url, width = 800) {
  const trimmed = (url || '').trim();
  if (!trimmed.includes('res.cloudinary.com') || !trimmed.includes('/upload/')) {
    return trimmed;
  }
  return trimmed.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
}

/**
 * @param {string} markdown
 * @returns {Promise<string>}
 */
export async function renderMarkdown(markdown) {
  const { marked } = await import('https://cdn.jsdelivr.net/npm/marked@15.0.7/+esm');
  marked.setOptions({ gfm: true, breaks: false });
  const text = String(markdown || '')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t');
  return marked.parse(text);
}

/**
 * @param {{ title?: string, description?: string, canonical?: string, ogImage?: string, ogType?: string }} meta
 */
export function updatePageMeta(meta) {
  if (meta.title) {
    document.title = meta.title;
    setMetaProperty('property', 'og:title', meta.title);
    setMetaName('twitter:title', meta.title);
  }
  if (meta.description) {
    setMetaName('description', meta.description);
    setMetaProperty('property', 'og:description', meta.description);
    setMetaName('twitter:description', meta.description);
  }
  if (meta.canonical) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = meta.canonical;
    setMetaProperty('property', 'og:url', meta.canonical);
  }
  if (meta.ogImage) {
    setMetaProperty('property', 'og:image', meta.ogImage);
    setMetaName('twitter:image', meta.ogImage);
  }
  if (meta.ogType) {
    setMetaProperty('property', 'og:type', meta.ogType);
  }
}

/**
 * @param {string} name
 * @param {string} content
 */
function setMetaName(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

/**
 * @param {string} attr
 * @param {string} name
 * @param {string} content
 */
function setMetaProperty(attr, name, content) {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

/**
 * @param {string[] | null | undefined} tags
 */
export function renderTagsHtml(tags) {
  const list = Array.isArray(tags) ? tags.filter(Boolean) : [];
  if (!list.length) return '';
  return `<div class="content-tags">${list
    .map((t) => `<span class="content-tag">${escapeHtml(t)}</span>`)
    .join('')}</div>`;
}

/**
 * @param {string} message
 */
export function renderLoadingHtml(message = 'Loading…') {
  return `
    <div class="content-state content-state--loading" role="status" aria-live="polite">
      <div class="content-skeleton-grid" aria-hidden="true">
        <div class="content-skeleton-card"></div>
        <div class="content-skeleton-card"></div>
        <div class="content-skeleton-card"></div>
      </div>
      <p class="content-state-text">${escapeHtml(message)}</p>
    </div>`;
}

/**
 * @param {string} title
 * @param {string} message
 */
export function renderErrorHtml(title, message) {
  return `
    <div class="content-state content-state--error" role="alert">
      <h2 class="content-state-title">${escapeHtml(title)}</h2>
      <p class="content-state-text">${escapeHtml(message)}</p>
      <a class="btn btn-primary mt-3" href="../index.html">Back to portfolio</a>
    </div>`;
}

/**
 * @param {string} title
 * @param {string} message
 * @param {string} ctaHref
 * @param {string} ctaLabel
 */
export function renderEmptyHtml(title, message, ctaHref, ctaLabel) {
  return `
    <div class="content-state content-state--empty">
      <h2 class="content-state-title">${escapeHtml(title)}</h2>
      <p class="content-state-text">${escapeHtml(message)}</p>
      <a class="btn btn-outline-light mt-3" href="${escapeHtml(ctaHref)}">${escapeHtml(ctaLabel)}</a>
    </div>`;
}
