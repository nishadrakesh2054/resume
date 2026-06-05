import {
  escapeHtml,
  formatDate,
  formatCategory,
  optimizeImageUrl,
  renderMarkdown,
  renderTagsHtml,
  absoluteUrl,
  normalizePublicUrl,
  SITE_ORIGIN,
} from './html-utils.mjs';

function renderBlogTags(tags, max = 2) {
  const list = Array.isArray(tags) ? tags.filter(Boolean).slice(0, max) : [];
  if (!list.length) return '';
  return `<div class="blog-tags blog-tags--compact">${list
    .map((t) => `<span class="blog-tag">${escapeHtml(t)}</span>`)
    .join('')}</div>`;
}

function blogPostHref(slug, prefix = '') {
  return `${prefix}${slug}/`;
}

function renderBlogCard(post, linkPrefix, index) {
  const cover = normalizePublicUrl(post.cover_image_url);
  const media = cover
    ? `<div class="blog-card__media"><img src="${escapeHtml(optimizeImageUrl(cover, 560))}" alt="${escapeHtml(post.cover_image_alt || post.title)}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async" width="280" height="158" /></div>`
    : `<div class="blog-card__media blog-card__media--empty" aria-hidden="true"><i class="bi bi-journal-richtext"></i></div>`;

  const readTime = post.reading_time_minutes ? `${post.reading_time_minutes} min` : '';
  const metaParts = [
    post.category ? escapeHtml(formatCategory(post.category)) : '',
    formatDate(post.published_at),
    readTime,
  ].filter(Boolean);

  const isLead = index === 0;

  return `
    <a class="blog-card${isLead ? ' blog-card--lead' : ''}" href="${blogPostHref(post.slug, linkPrefix)}" style="--blog-card-i: ${index}">
      ${media}
      <div class="blog-card__body">
        <p class="blog-card__meta">${metaParts.join('<span class="blog-card__meta-sep" aria-hidden="true">·</span>')}</p>
        <h2 class="blog-card__title">${escapeHtml(post.title)}</h2>
        <p class="blog-card__excerpt">${escapeHtml(post.excerpt)}</p>
        ${renderBlogTags(post.tags, 2)}
        <span class="blog-card__cta">Read article <i class="bi bi-arrow-right" aria-hidden="true"></i></span>
      </div>
    </a>`;
}

export function renderBlogFeed(posts, linkPrefix = '') {
  if (!posts.length) {
    return `<div class="content-state content-state--empty"><h2 class="content-state-title">No posts yet</h2></div>`;
  }

  const cards = posts.map((post, i) => renderBlogCard(post, linkPrefix, i)).join('');
  const countLabel = `${posts.length} article${posts.length === 1 ? '' : 's'}`;

  return `<div class="blog-feed">
    <div class="blog-feed__bar">
      <span class="blog-feed__label">Published</span>
      <span class="blog-feed__count">${countLabel}</span>
    </div>
    <div class="blog-grid">${cards}</div>
  </div>`;
}

export function renderBlogPostPage(post) {
  const slug = post.slug;
  const title = post.meta_title || `${post.title} | Rakesh Kumar Sahani`;
  const description = post.meta_description || post.excerpt || '';
  const canonical = normalizePublicUrl(post.canonical_url) || absoluteUrl(`/blog/${slug}/`);
  const ogImage = normalizePublicUrl(post.og_image_url || post.cover_image_url || '');
  const bodyHtml =
    post.body_format === 'html' ? String(post.body || '') : renderMarkdown(String(post.body || ''));

  const coverUrl = normalizePublicUrl(post.cover_image_url);
  const heroMedia = coverUrl
    ? `<div class="blog-detail-hero__media">
        <img src="${escapeHtml(optimizeImageUrl(coverUrl, 1200))}" alt="${escapeHtml(post.cover_image_alt || post.title)}" width="640" height="400" decoding="async" />
        <div class="blog-detail-hero__frame" aria-hidden="true"></div>
      </div>`
    : `<div class="blog-detail-hero__media blog-detail-hero__media--placeholder" aria-hidden="true">
        <i class="bi bi-journal-richtext"></i>
      </div>`;

  const related = Array.isArray(post.related_case_study_slugs)
    ? post.related_case_study_slugs.filter(Boolean)
    : [];
  const relatedHtml = renderRelatedAside(
    'Related case studies',
    related.map((s) => ({
      href: `../../case-studies/${s}/`,
      label: slugToTitle(s),
    }))
  );

  const tagsAside =
    Array.isArray(post.tags) && post.tags.filter(Boolean).length
      ? `<div class="content-detail-aside__card">
          <h2 class="content-detail-aside__heading">Topics</h2>
          ${renderTagsHtml(post.tags)}
        </div>`
      : '';

  const article = `
    <section class="section content-detail-section">
      <div class="container container-xl">
        <article class="content-detail blog-detail">
          <nav class="content-breadcrumb" aria-label="Breadcrumb">
            <a href="../">Blog</a>
            <span class="content-breadcrumb__sep" aria-hidden="true">/</span>
            <span class="content-breadcrumb__current">${escapeHtml(post.title)}</span>
          </nav>
          <header class="blog-detail-hero">
            <div class="blog-detail-hero__grid">
              <div class="blog-detail-hero__copy">
                ${post.category ? `<span class="blog-pill">${escapeHtml(formatCategory(post.category))}</span>` : ''}
                <h1 class="blog-detail-hero__title">${escapeHtml(post.title)}</h1>
                ${post.subtitle ? `<p class="blog-detail-hero__subtitle">${escapeHtml(post.subtitle)}</p>` : ''}
                ${renderBlogMetaChips(post)}
              </div>
              ${heroMedia}
            </div>
          </header>
          <div class="content-detail-layout">
            <div class="content-detail-main">
              <div class="content-prose-card">
                <div class="content-prose">${bodyHtml}</div>
              </div>
              ${relatedHtml}
              ${renderDetailFooter('../', 'All posts')}
            </div>
            <aside class="content-detail-aside" aria-label="Article info">
              <div class="content-detail-aside__card content-detail-aside__card--author">
                <div class="content-detail-aside__avatar" aria-hidden="true"><i class="bi bi-person-circle"></i></div>
                <p class="content-detail-aside__label">Written by</p>
                <p class="content-detail-aside__name">${escapeHtml(post.author_name || 'Rakesh Kumar Sahani')}</p>
                <p class="content-detail-aside__hint">Full-stack developer · Nepal</p>
              </div>
              ${tagsAside}
            </aside>
          </div>
        </article>
      </div>
    </section>`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    datePublished: post.published_at,
    author: { '@type': 'Person', name: post.author_name || 'Rakesh Kumar Sahani' },
    url: canonical,
    image: ogImage || undefined,
  };

  const extraSchema =
    post.structured_data &&
    typeof post.structured_data === 'object' &&
    !Array.isArray(post.structured_data)
      ? post.structured_data
      : null;
  const jsonLdGraph =
    extraSchema && extraSchema['@type'] === 'FAQPage'
      ? { '@context': 'https://schema.org', '@graph': [jsonLd, extraSchema] }
      : jsonLd;

  return { title, description, canonical, ogImage, article, jsonLd: jsonLdGraph };
}

function caseStudyHref(slug, prefix = '') {
  return `${prefix}${slug}/`;
}

export function renderCaseFeed(studies, linkPrefix = '') {
  if (!studies.length) {
    return `<div class="content-state content-state--empty"><h2 class="content-state-title">No case studies yet</h2></div>`;
  }

  return `<div class="case-feed">${studies
    .map((item, index) => {
      const reversed = index % 2 === 1;
      const cover = normalizePublicUrl(item.cover_image_url);
      const img = cover
        ? `<div class="case-row__media"><img src="${escapeHtml(optimizeImageUrl(cover, 900))}" alt="${escapeHtml(item.cover_image_alt || item.title)}" loading="lazy" decoding="async" /><div class="case-row__media-glow" aria-hidden="true"></div></div>`
        : `<div class="case-row__media case-row__media--placeholder" aria-hidden="true"><i class="bi bi-window-stack"></i></div>`;
      const company = item.company || item.client_name;
      const category = item.category ? formatCategory(item.category) : '';
      const stack = Array.isArray(item.stack) ? item.stack.slice(0, 5) : [];
      const metrics = Array.isArray(item.metrics) ? item.metrics : [];
      const firstMetric = metrics.find((m) => m && (m.label || m.value));

      return `
    <a class="case-row${reversed ? ' case-row--reverse' : ''}${item.featured ? ' case-row--featured' : ''}" href="${caseStudyHref(item.slug, linkPrefix)}" style="--case-row-i: ${index}">
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
          ${
            stack.length
              ? `<div class="case-stack">${stack.map((t) => `<span class="case-stack__item">${escapeHtml(t)}</span>`).join('')}</div>`
              : ''
          }
          <div class="case-row__footer">
            ${item.role ? `<span class="case-row__role"><i class="bi bi-person-badge" aria-hidden="true"></i> ${escapeHtml(item.role)}</span>` : ''}
            <span class="case-row__date">${escapeHtml(formatDate(item.published_at))}</span>
          </div>
          ${
            firstMetric
              ? `<div class="case-metric-preview"><span class="case-metric-preview__value">${escapeHtml(firstMetric.value ?? '')}</span><span class="case-metric-preview__label">${escapeHtml(firstMetric.label ?? '')}</span></div>`
              : ''
          }
          <span class="case-row__cta">Explore case study <i class="bi bi-arrow-right" aria-hidden="true"></i></span>
        </div>
      </div>
    </a>`;
    })
    .join('')}</div>`;
}

const NARRATIVE_STEPS = [
  { key: 'overview', title: 'Overview', icon: 'bi-compass' },
  { key: 'challenge', title: 'Challenge', icon: 'bi-lightning' },
  { key: 'solution', title: 'Solution', icon: 'bi-gear-wide-connected' },
  { key: 'results', title: 'Results', icon: 'bi-graph-up-arrow' },
];

function renderBlock(title, text) {
  if (!text?.trim()) return '';
  return `<section class="content-block"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></section>`;
}

function renderNarrativeGrid(item) {
  const blocks = NARRATIVE_STEPS.map((step, i) => {
    const text = item[step.key];
    if (!text?.trim()) return '';
    return `
      <article class="case-narrative__card" style="--narrative-i: ${i}">
        <div class="case-narrative__icon" aria-hidden="true"><i class="bi ${step.icon}"></i></div>
        <span class="case-narrative__step">0${i + 1}</span>
        <h2 class="case-narrative__title">${escapeHtml(step.title)}</h2>
        <p class="case-narrative__text">${escapeHtml(text)}</p>
      </article>`;
  }).filter(Boolean);
  if (!blocks.length) return '';
  const lessons = item.lessons_learned?.trim()
    ? `<article class="case-narrative__card case-narrative__card--wide">
        <div class="case-narrative__icon" aria-hidden="true"><i class="bi bi-journal-check"></i></div>
        <h2 class="case-narrative__title">Lessons learned</h2>
        <p class="case-narrative__text">${escapeHtml(item.lessons_learned)}</p>
      </article>`
    : '';
  return `<div class="case-narrative">${blocks.join('')}${lessons}</div>`;
}

function renderBlogMetaChips(post) {
  const chips = [];
  if (post.category) {
    chips.push(
      `<span class="detail-chip detail-chip--category">${escapeHtml(formatCategory(post.category))}</span>`
    );
  }
  if (post.published_at) {
    chips.push(
      `<span class="detail-chip"><i class="bi bi-calendar3" aria-hidden="true"></i> ${escapeHtml(formatDate(post.published_at))}</span>`
    );
  }
  if (post.reading_time_minutes) {
    chips.push(
      `<span class="detail-chip"><i class="bi bi-clock" aria-hidden="true"></i> ${escapeHtml(String(post.reading_time_minutes))} min read</span>`
    );
  }
  if (post.author_name) {
    chips.push(
      `<span class="detail-chip"><i class="bi bi-person" aria-hidden="true"></i> ${escapeHtml(post.author_name)}</span>`
    );
  }
  return chips.length ? `<div class="detail-meta-chips">${chips.join('')}</div>` : '';
}

function renderCaseMetaChips(item) {
  const chips = [];
  const company = item.company || item.client_name;
  if (company) {
    chips.push(
      `<span class="detail-chip detail-chip--client"><i class="bi bi-building" aria-hidden="true"></i> ${escapeHtml(company)}</span>`
    );
  }
  if (item.category) {
    chips.push(`<span class="detail-chip">${escapeHtml(formatCategory(item.category))}</span>`);
  }
  if (item.role) {
    chips.push(
      `<span class="detail-chip"><i class="bi bi-person-badge" aria-hidden="true"></i> ${escapeHtml(item.role)}</span>`
    );
  }
  if (item.published_at) {
    chips.push(
      `<span class="detail-chip"><i class="bi bi-calendar3" aria-hidden="true"></i> ${escapeHtml(formatDate(item.published_at))}</span>`
    );
  }
  if (item.duration_label) {
    chips.push(`<span class="detail-chip">${escapeHtml(item.duration_label)}</span>`);
  }
  return chips.length ? `<div class="detail-meta-chips">${chips.join('')}</div>` : '';
}

function renderDetailFooter(backHref, backLabel) {
  return `
    <footer class="content-detail-footer">
      <a href="${backHref}" class="content-detail-back">
        <span class="content-detail-back__icon" aria-hidden="true"><i class="bi bi-arrow-left"></i></span>
        <span class="content-detail-back__text">${escapeHtml(backLabel)}</span>
      </a>
    </footer>`;
}

function renderRelatedAside(title, links) {
  if (!links.length) return '';
  return `
    <aside class="content-related-card">
      <h2 class="content-related-card__title">${escapeHtml(title)}</h2>
      <ul class="content-related-card__list">
        ${links.map((l) => `<li><a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a></li>`).join('')}
      </ul>
    </aside>`;
}

function slugToTitle(slug) {
  return String(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderMetrics(metrics) {
  if (!Array.isArray(metrics) || !metrics.length) return '';
  const items = metrics
    .filter((m) => m && (m.label || m.value))
    .map(
      (m) =>
        `<div class="content-metric"><span class="content-metric-value">${escapeHtml(m.value ?? '')}</span><span class="content-metric-label">${escapeHtml(m.label ?? '')}</span></div>`
    )
    .join('');
  return items ? `<div class="content-metrics">${items}</div>` : '';
}

function renderGallery(gallery) {
  if (!Array.isArray(gallery) || !gallery.length) return '';
  const figures = gallery
    .filter((g) => g && g.url)
    .map(
      (g) =>
        `<figure><img src="${escapeHtml(optimizeImageUrl(g.url, 800))}" alt="${escapeHtml(g.alt || '')}" loading="lazy" />${g.caption ? `<figcaption>${escapeHtml(g.caption)}</figcaption>` : ''}</figure>`
    )
    .join('');
  return figures ? `<div class="content-gallery content-gallery--detail">${figures}</div>` : '';
}

export function renderCaseStudyPage(item) {
  const slug = item.slug;
  const title = item.meta_title || `${item.title} Case Study | Rakesh Kumar Sahani`;
  const description = item.meta_description || item.excerpt || '';
  const canonical = normalizePublicUrl(item.canonical_url) || absoluteUrl(`/case-studies/${slug}/`);
  const ogImage = normalizePublicUrl(
    item.og_image_url || item.hero_image_url || item.cover_image_url || ''
  );
  const bodyHtml =
    item.body_format === 'html' ? String(item.body || '') : renderMarkdown(String(item.body || ''));

  const heroSrc = normalizePublicUrl(item.hero_image_url || item.cover_image_url);
  const heroMedia = heroSrc
    ? `<img src="${escapeHtml(optimizeImageUrl(heroSrc, 1400))}" alt="${escapeHtml(item.cover_image_alt || item.title)}" width="1400" height="560" decoding="async" fetchpriority="high" />`
    : '';

  const stack = Array.isArray(item.stack) ? item.stack : [];
  const stackHtml = stack.length
    ? `<div class="case-detail-toolbar__stack">${stack.map((t) => `<span class="case-stack__item">${escapeHtml(t)}</span>`).join('')}</div>`
    : '';

  const actions = [];
  if (item.live_url) {
    actions.push(
      `<a class="btn btn-primary case-detail-toolbar__btn" href="${escapeHtml(item.live_url)}" target="_blank" rel="noopener noreferrer"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> Live site</a>`
    );
  }
  if (item.github_url) {
    actions.push(
      `<a class="btn btn-outline-light case-detail-toolbar__btn" href="${escapeHtml(item.github_url)}" target="_blank" rel="noopener noreferrer"><i class="bi bi-github" aria-hidden="true"></i> GitHub</a>`
    );
  }

  const testimonial =
    item.testimonial_quote && item.testimonial_author
      ? `<blockquote class="case-testimonial">
          <i class="bi bi-quote case-testimonial__mark" aria-hidden="true"></i>
          <p class="case-testimonial__quote">${escapeHtml(item.testimonial_quote)}</p>
          <footer class="case-testimonial__author">— ${escapeHtml(item.testimonial_author)}</footer>
        </blockquote>`
      : '';

  const related = Array.isArray(item.related_blog_slugs) ? item.related_blog_slugs.filter(Boolean) : [];
  const relatedHtml = renderRelatedAside(
    'Related articles',
    related.map((s) => ({
      href: `../../blog/${s}/`,
      label: slugToTitle(s),
    }))
  );

  const metricsHtml = renderMetrics(item.metrics);
  const narrativeHtml = renderNarrativeGrid(item);
  const galleryHtml = renderGallery(item.gallery);
  const proseHtml = bodyHtml.trim()
    ? `<section class="content-prose-card content-prose-card--case">
        <h2 class="content-prose-card__label">Technical deep dive</h2>
        <div class="content-prose">${bodyHtml}</div>
      </section>`
    : '';
  const tagsHtml =
    Array.isArray(item.tags) && item.tags.filter(Boolean).length
      ? `<div class="case-detail-tags">${renderTagsHtml(item.tags)}</div>`
      : '';

  const article = `
    <section class="section content-detail-section">
      <div class="container container-xl">
        <article class="content-detail case-detail">
          <nav class="content-breadcrumb content-breadcrumb--on-hero" aria-label="Breadcrumb">
            <a href="../">Case studies</a>
            <span class="content-breadcrumb__sep" aria-hidden="true">/</span>
            <span class="content-breadcrumb__current">${escapeHtml(item.title)}</span>
          </nav>
          <header class="case-detail-hero${heroMedia ? '' : ' case-detail-hero--no-media'}">
            ${heroMedia ? `<div class="case-detail-hero__media">${heroMedia}<div class="case-detail-hero__overlay" aria-hidden="true"></div></div>` : '<div class="case-detail-hero__mesh" aria-hidden="true"></div>'}
            <div class="case-detail-hero__content">
              ${item.category ? `<span class="case-chip">${escapeHtml(formatCategory(item.category))}</span>` : ''}
              <h1 class="case-detail-hero__title">${escapeHtml(item.title)}</h1>
              ${item.tagline ? `<p class="case-detail-hero__tagline">${escapeHtml(item.tagline)}</p>` : ''}
              ${renderCaseMetaChips(item)}
            </div>
          </header>
          <div class="case-detail-toolbar">
            ${stackHtml}
            ${actions.length ? `<div class="case-detail-toolbar__actions">${actions.join('')}</div>` : ''}
          </div>
          ${metricsHtml}
          ${narrativeHtml}
          ${galleryHtml}
          ${proseHtml}
          ${testimonial}
          ${tagsHtml}
          ${relatedHtml}
          ${renderDetailFooter('../', 'All case studies')}
        </article>
      </div>
    </section>`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: item.title,
    description,
    url: canonical,
    image: ogImage || undefined,
    author: { '@type': 'Person', name: 'Rakesh Kumar Sahani', url: SITE_ORIGIN },
  };

  return { title, description, canonical, ogImage, article, jsonLd };
}
