(function () {
  'use strict';

  const COMPANY_ORDER = ['Arksh Group', 'OneorEight', 'Navata Tech'];
  const INITIAL_VISIBLE = 4;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let projects = [];
  let activeCompany = 'all';
  let isExpanded = false;

  function optimizeImageUrl(url, width) {
    const trimmed = (url || '').trim();
    if (!trimmed.includes('res.cloudinary.com') || !trimmed.includes('/upload/')) {
      return trimmed;
    }
    return trimmed.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isExternalLink(url) {
    return /^https?:\/\//i.test((url || '').trim());
  }

  function getProjectsForTab(companyKey) {
    let list =
      companyKey === 'all'
        ? [...projects]
        : projects.filter((p) => p.company === companyKey);

    return list.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.id || 0) - (b.id || 0);
    });
  }

  function renderStackTags(project) {
    return (project.stack || [])
      .slice(0, 3)
      .map((tag) => `<span class="project-card-tag">${escapeHtml(tag)}</span>`)
      .join('');
  }

  function renderProjectCard(project, options) {
    const eager = options?.eager;
    const img = optimizeImageUrl(project.imageLink, 800);
    const alt = `${project.ProjectName} — web development project by Rakesh Kumar Sahani`;
    const link = escapeHtml(project.websiteLink);
    const liveLink = isExternalLink(project.websiteLink)
      ? `<a href="${link}" class="project-card-link" target="_blank" rel="noopener noreferrer">View live site <i class="bi bi-arrow-up-right"></i></a>`
      : '';

    return `
      <div class="col-lg-6">
        <article class="portfolio-project-card portfolio-project-card--featured">
          <a href="${link}" class="project-card-image" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHtml(project.ProjectName)}">
            <img src="${escapeHtml(img)}" alt="${escapeHtml(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="800" height="360" />
          </a>
          <div class="project-card-body">
            <h3 class="project-card-title">${escapeHtml(project.ProjectName)}</h3>
            <p class="project-card-meta">${escapeHtml(project.category)}</p>
            <div class="project-card-tags">${renderStackTags(project)}</div>
            ${liveLink}
          </div>
        </article>
      </div>
    `;
  }

  function updateShowToggle(list) {
    const btn = document.getElementById('portfolio-show-toggle');
    const wrap = document.querySelector('.portfolio-toggle-wrap');
    if (!btn || !wrap) return;

    const hasMore = list.length > INITIAL_VISIBLE;
    wrap.hidden = !hasMore;

    if (!hasMore) {
      btn.hidden = true;
      return;
    }

    btn.hidden = false;
    const remaining = list.length - INITIAL_VISIBLE;
    btn.textContent = isExpanded
      ? 'Show less'
      : `Show more (${remaining})`;
    btn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  }

  function renderCompanyNav() {
    const nav = document.getElementById('portfolio-company-nav');
    if (!nav) return;

    const tabs = [
      { key: 'all', label: 'All Projects' },
      ...COMPANY_ORDER.map((name) => ({ key: name, label: name })),
    ];

    nav.innerHTML = tabs
      .map(({ key, label }) => {
        const count = getProjectsForTab(key).length;
        const isActive = key === activeCompany;
        const tabId = `portfolio-tab-${key.replace(/\s+/g, '-').toLowerCase()}`;
        return `
          <button
            type="button"
            id="${tabId}"
            class="portfolio-company-tab${isActive ? ' is-active' : ''}"
            role="tab"
            aria-selected="${isActive ? 'true' : 'false'}"
            aria-controls="portfolio-grid-panel"
            tabindex="${isActive ? '0' : '-1'}"
            data-company="${escapeHtml(key)}"
          >
            <span class="portfolio-company-tab-label">${escapeHtml(label)}</span>
            <span class="portfolio-company-tab-count">${count}</span>
          </button>
        `;
      })
      .join('');

    const panel = document.getElementById('portfolio-grid-panel');
    const activeTab = nav.querySelector('.portfolio-company-tab.is-active');
    if (panel && activeTab) {
      panel.setAttribute('aria-labelledby', activeTab.id);
    }

    nav.querySelectorAll('.portfolio-company-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCompany = btn.getAttribute('data-company');
        isExpanded = false;
        const panel = document.getElementById('portfolio-grid-panel');
        nav.querySelectorAll('.portfolio-company-tab').forEach((tab) => {
          const selected = tab === btn;
          tab.classList.toggle('is-active', selected);
          tab.setAttribute('aria-selected', selected ? 'true' : 'false');
          tab.setAttribute('tabindex', selected ? '0' : '-1');
          if (selected && panel) {
            panel.setAttribute('aria-labelledby', tab.id);
          }
        });
        renderGridPanel();
      });
    });
  }

  function renderGridPanel() {
    const panel = document.getElementById('portfolio-grid-panel');
    if (!panel) return;

    const list = getProjectsForTab(activeCompany);

    if (!list.length) {
      panel.innerHTML = '<p class="portfolio-empty">No projects in this group.</p>';
      updateShowToggle(list);
      return;
    }

    const visible = isExpanded ? list : list.slice(0, INITIAL_VISIBLE);
    panel.innerHTML = `<div class="row gy-4">${visible
      .map((p, index) => renderProjectCard(p, { eager: index < 2 }))
      .join('')}</div>`;
    updateShowToggle(list);
  }

  function injectProjectSchema(list) {
    const existing = document.getElementById('portfolio-itemlist-schema');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'portfolio-itemlist-schema';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Web development portfolio — Rakesh Kumar Sahani',
      numberOfItems: list.length,
      itemListElement: list.map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'WebSite',
          name: project.ProjectName,
          url: project.websiteLink,
          description: `${project.category} — ${project.company}`,
        },
      })),
    });
    document.head.appendChild(script);
  }

  function bindShowToggle() {
    const btn = document.getElementById('portfolio-show-toggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
      isExpanded = !isExpanded;
      renderGridPanel();
      if (!isExpanded) {
        const panel = document.getElementById('portfolio-grid-panel');
        panel?.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'nearest',
        });
      }
    });
  }

  async function initPortfolio() {
    if (!document.getElementById('portfolio')) return;

    try {
      const response = await fetch('projects.json');
      if (!response.ok) throw new Error('Failed to load projects');
      projects = await response.json();
    } catch (error) {
      const panel = document.getElementById('portfolio-grid-panel');
      if (panel) {
        panel.innerHTML =
          '<p class="portfolio-error">Unable to load projects. Please refresh the page.</p>';
      }
      return;
    }

    injectProjectSchema(projects);
    renderCompanyNav();
    bindShowToggle();
    renderGridPanel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortfolio, { once: true });
  } else {
    initPortfolio();
  }
})();
