(function () {
  'use strict';

  function enhanceSkillProgressBars() {
    document.querySelectorAll('.skill-item').forEach((item) => {
      const name = item.querySelector('.skill-name')?.textContent?.trim();
      const bar = item.querySelector('.progress-bar[role="progressbar"]');
      if (name && bar && !bar.getAttribute('aria-label')) {
        bar.setAttribute('aria-label', `${name} proficiency`);
      }
    });
  }

  function enhanceContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const loading = form.querySelector('.loading');
    const sent = form.querySelector('.sent-message');
    const error = form.querySelector('.error-message');

    [loading, sent, error].forEach((el) => {
      if (!el) return;
      el.hidden = !el.classList.contains('d-block');
    });

    if (loading) {
      loading.setAttribute('role', 'status');
      loading.setAttribute('aria-live', 'polite');
    }
    if (sent) {
      sent.setAttribute('role', 'status');
      sent.setAttribute('aria-live', 'polite');
    }
    if (error) {
      error.setAttribute('role', 'alert');
      error.setAttribute('aria-live', 'assertive');
    }
  }

  function enhanceExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      const rel = (link.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      if (!rel.includes('noopener')) rel.push('noopener');
      if (!rel.includes('noreferrer')) rel.push('noreferrer');
      link.setAttribute('rel', rel.join(' '));
    });
  }

  function init() {
    enhanceSkillProgressBars();
    enhanceContactForm();
    enhanceExternalLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
