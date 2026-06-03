import {
  escapeHtml,
  formatDate,
  formatCategory,
  optimizeImageUrl,
  renderMarkdown,
  renderTagsHtml,
  absoluteUrl,
  SITE_ORIGIN,
} from './html-utils.mjs';

function renderBlogTags(tags) {
  const list = Array.isArray(tags) ? tags.filter(Boolean).slice(0, 4) : [];
  if (!list.length) return '';
  return `<div class="blog-tags">${list.map((t) => `<span class="blog-tag">${escapeHtml(t)}</span>`).join('')}</div>`;
}

function blogPostHref(slug, prefix = '') {
  return `${prefix}${slug}/`;
}

export function renderBlogFeed(posts, linkPrefix = '') {
  if (!posts.length) {
    return `<div class="content-state content-state--empty"><h2 class="content-state-title">No posts yet</h2></div>`;
  }
  const featured = posts.find((p) => p.featured) || posts[0];
  const rest = posts.filter((p) => p.slug !== featured.slug);
  const showFeaturedBadge = Boolean(featured.featured);

  const renderFeatured = (post) => {
    const img = post.cover_image_url
      ? `<div class="blog-featured__visual"><img src="${escapeHtml(optimizeImageUrl(post.cover_image_url, 960))}" alt="${escapeHtml(post.cover_image_alt || post.title)}" loading="eager" decoding="async" /><div class="blog-featured__shine" aria-hidden="true"></div></div>`
      : `<div class="blog-featured__visual blog-featured__visual--placeholder" aria-hidden="true"><i class="bi bi-journal-richtext"></i></div>`;
    const readTime = post.reading_time_minutes ? `${post.reading_time_minutes} min read` : '';
    return `
    <a class="blog-featured" href="${blogPostHref(post.slug, linkPrefix)}">
      ${showFeaturedBadge ? '<span class="blog-featured__badge"><i class="bi bi-star-fill" aria-hidden="true"></i> Featured</span>' : '<span class="blog-featured__badge blog-featured__badge--latest">Latest</span>'}
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
  };

  const renderItem = (post, i) => {
    const img = post.cover_image_url
      ? `<div class="blog-item__thumb"><img src="${escapeHtml(optimizeImageUrl(post.cover_image_url, 400))}" alt="" loading="lazy" decoding="async" /></div>`
      : `<div class="blog-item__thumb blog-item__thumb--empty"><i class="bi bi-file-text" aria-hidden="true"></i></div>`;
    const readTime = post.reading_time_minutes ? `${post.reading_time_minutes} min` : '';
    return `
    <a class="blog-item" href="${blogPostHref(post.slug, linkPrefix)}" style="--blog-item-i: ${i}">
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
  };

  const listHtml = rest.length
    ? `<div class="blog-list"><div class="blog-list__header"><h2 class="blog-list__heading">More articles</h2><span class="blog-list__count">${rest.length} post${rest.length === 1 ? '' : 's'}</span></div>${rest.map(renderItem).join('')}</div>`
    : '';

  return `<div class="blog-feed">${renderFeatured(featured)}${listHtml}</div>`;
}

export function renderBlogPostPage(post) {
  const slug = post.slug;
  const title = post.meta_title || `${post.title} | Rakesh Kumar Sahani`;
  const description = post.meta_description || post.excerpt || '';
  const canonical = post.canonical_url || absoluteUrl(`/blog/${slug}/`);
  const ogImage = post.og_image_url || post.cover_image_url || '';
  const bodyHtml =
    post.body_format === 'html' ? String(post.body || '') : renderMarkdown(String(post.body || ''));

  const hero = post.cover_image_url
    ? `<div class="content-detail-hero"><img src="${escapeHtml(optimizeImageUrl(post.cover_image_url, 1200))}" alt="${escapeHtml(post.cover_image_alt || post.title)}" /></div>`
    : '';

  const metaParts = [
    formatDate(post.published_at),
    post.author_name,
    post.reading_time_minutes ? `${post.reading_time_minutes} min read` : '',
    post.category,
  ].filter(Boolean);

  const related = Array.isArray(post.related_case_study_slugs)
    ? post.related_case_study_slugs.filter(Boolean)
    : [];
  const relatedHtml = related.length
    ? `<aside class="content-related"><h2>Related case studies</h2><ul>${related
        .map(
          (s) =>
            `<li><a href="../../case-studies/${escapeHtml(s)}/">${escapeHtml(s.replace(/-/g, ' '))}</a></li>`
        )
        .join('')}</ul></aside>`
    : '';

  const article = `
    <section class="section">
      <div class="container">
        <article class="content-detail">
          <nav class="content-breadcrumb" aria-label="Breadcrumb">
            <a href="../">Blog</a> / <span>${escapeHtml(post.title)}</span>
          </nav>
          ${hero}
          <h1>${escapeHtml(post.title)}</h1>
          ${post.subtitle ? `<p class="lead">${escapeHtml(post.subtitle)}</p>` : ''}
          <div class="content-detail-meta">${escapeHtml(metaParts.join(' · '))}</div>
          ${renderTagsHtml(post.tags)}
          <div class="content-prose">${bodyHtml}</div>
          ${relatedHtml}
          <p class="mt-4"><a href="../" class="btn btn-outline-light btn-sm">← All posts</a></p>
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

  return { title, description, canonical, ogImage, article, jsonLd };
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
      const img = item.cover_image_url
        ? `<div class="case-row__media"><img src="${escapeHtml(optimizeImageUrl(item.cover_image_url, 900))}" alt="${escapeHtml(item.cover_image_alt || item.title)}" loading="lazy" decoding="async" /><div class="case-row__media-glow" aria-hidden="true"></div></div>`
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

function renderBlock(title, text) {
  if (!text?.trim()) return '';
  return `<section class="content-block"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></section>`;
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
  return figures ? `<div class="content-gallery">${figures}</div>` : '';
}

export function renderCaseStudyPage(item) {
  const slug = item.slug;
  const title = item.meta_title || `${item.title} Case Study | Rakesh Kumar Sahani`;
  const description = item.meta_description || item.excerpt || '';
  const canonical = item.canonical_url || absoluteUrl(`/case-studies/${slug}/`);
  const ogImage = item.og_image_url || item.hero_image_url || item.cover_image_url || '';
  const bodyHtml =
    item.body_format === 'html' ? String(item.body || '') : renderMarkdown(String(item.body || ''));

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

  const testimonial =
    item.testimonial_quote && item.testimonial_author
      ? `<blockquote class="content-block mt-4"><p class="fst-italic">"${escapeHtml(item.testimonial_quote)}"</p><footer class="small text-muted">— ${escapeHtml(item.testimonial_author)}</footer></blockquote>`
      : '';

  const metaParts = [item.company, item.client_name, item.role, formatDate(item.published_at), item.duration_label].filter(Boolean);

  const related = Array.isArray(item.related_blog_slugs) ? item.related_blog_slugs.filter(Boolean) : [];
  const relatedHtml = related.length
    ? `<aside class="content-related"><h2>Related articles</h2><ul>${related
        .map((s) => `<li><a href="../../blog/${escapeHtml(s)}/">${escapeHtml(s.replace(/-/g, ' '))}</a></li>`)
        .join('')}</ul></aside>`
    : '';

  const article = `
    <section class="section">
      <div class="container">
        <article class="content-detail">
          <nav class="content-breadcrumb" aria-label="Breadcrumb">
            <a href="../">Case studies</a> / <span>${escapeHtml(item.title)}</span>
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
          ${relatedHtml}
          <p class="mt-4"><a href="../" class="btn btn-outline-light btn-sm">← All case studies</a></p>
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
