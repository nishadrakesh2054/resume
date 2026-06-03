import { marked } from 'marked';

export const SITE_ORIGIN = 'https://nishadrakesh2054.github.io/rakesh';

marked.setOptions({ gfm: true, breaks: false });

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

export function formatDateIso(iso) {
  if (!iso) return new Date().toISOString().slice(0, 10);
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export function optimizeImageUrl(url, width = 800) {
  const trimmed = (url || '').trim();
  if (!trimmed.includes('res.cloudinary.com') || !trimmed.includes('/upload/')) {
    return trimmed;
  }
  return trimmed.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
}

export function absoluteUrl(path) {
  const base = SITE_ORIGIN.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export function renderMarkdown(md) {
  const text = String(md || '')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t');
  return marked.parse(text);
}

export function renderTagsHtml(tags) {
  const list = Array.isArray(tags) ? tags.filter(Boolean) : [];
  if (!list.length) return '';
  return `<div class="content-tags">${list
    .map((t) => `<span class="content-tag">${escapeHtml(t)}</span>`)
    .join('')}</div>`;
}

export function formatCategory(category) {
  if (!category) return '';
  return String(category).replace(/-/g, ' ');
}
