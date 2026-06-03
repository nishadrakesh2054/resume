/**
* Template Name: Craftivo
* Template URL: https://bootstrapmade.com/craftivo-bootstrap-portfolio-template/
* Updated: Oct 04 2025 with Bootstrap v5.3.8
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('#navmenu');
  const mobileNavBackdrop = document.querySelector('#mobile-nav-backdrop');
  const navIcon = mobileNavToggleBtn?.querySelector('i');
  let mobileNavScrollY = 0;

  function setMobileNavOpen(isOpen) {
    if (isOpen) {
      mobileNavScrollY = window.scrollY;
      document.body.style.top = `-${mobileNavScrollY}px`;
    } else {
      document.body.style.top = '';
      window.scrollTo(0, mobileNavScrollY);
    }
    document.body.classList.toggle('mobile-nav-active', isOpen);
    if (mobileNavToggleBtn) {
      mobileNavToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileNavToggleBtn.setAttribute(
        'aria-label',
        isOpen ? 'Close menu' : 'Open menu'
      );
    }
    if (mobileNavBackdrop) {
      mobileNavBackdrop.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    }
    if (navIcon) {
      navIcon.classList.toggle('bi-list', !isOpen);
      navIcon.classList.toggle('bi-x', isOpen);
    }
  }

  function mobileNavToggle() {
    setMobileNavOpen(!document.body.classList.contains('mobile-nav-active'));
  }

  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      mobileNavToggle();
    });
  }

  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', () => setMobileNavOpen(false));
  }

  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'Escape' &&
      document.body.classList.contains('mobile-nav-active')
    ) {
      setMobileNavOpen(false);
    }
  });

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach((link) => {
    link.addEventListener('click', () => {
      if (document.body.classList.contains('mobile-nav-active')) {
        setMobileNavOpen(false);
      }
    });
  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader — hide quickly (do not wait for all images)
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    const hidePreloader = () => {
      preloader.classList.add('preloader-hidden');
      setTimeout(() => preloader.remove(), 300);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', hidePreloader, { once: true });
    } else {
      hidePreloader();
    }
    setTimeout(hidePreloader, 1200);
  }

  /**
   * Circular scroll progress + back to top (bottom-right)
   */
  const scrollProgressBtn = document.getElementById('scroll-progress-btn');
  const scrollProgressBar = scrollProgressBtn?.querySelector('.scroll-progress-bar');
  const PROGRESS_RADIUS = 19;
  const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;

  function updateScrollProgressCircle() {
    const root = document.documentElement;
    const scrollable = root.scrollHeight - root.clientHeight;
    const ratio = scrollable > 0 ? root.scrollTop / scrollable : 0;

    if (scrollProgressBar) {
      scrollProgressBar.style.strokeDasharray = `${PROGRESS_CIRCUMFERENCE}`;
      scrollProgressBar.style.strokeDashoffset = `${PROGRESS_CIRCUMFERENCE * (1 - ratio)}`;
    }

    if (scrollProgressBtn) {
      scrollProgressBtn.classList.toggle('is-visible', root.scrollTop > 120);
    }
  }

  if (scrollProgressBtn) {
    scrollProgressBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', updateScrollProgressCircle, { passive: true });
    window.addEventListener('load', updateScrollProgressCircle);
    updateScrollProgressCircle();
  }

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aosInit, { once: true });
  } else {
    aosInit();
  }

  /**
   * Init typed.js (after DOM ready)
   */
  function initTyped() {
    const selectTyped = document.querySelector('.typed');
    if (!selectTyped || typeof Typed === 'undefined') return;
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTyped, { once: true });
  } else {
    initTyped();
  }

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

  /**
   * Experience tenure (LinkedIn-style month counts)
   */
  function formatExperienceTenure(totalMonths) {
    if (totalMonths < 1) return '1 mo';
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    if (years === 0) return `${months} mo${months === 1 ? '' : 's'}`;
    const yearPart = `${years} yr${years === 1 ? '' : 's'}`;
    if (months === 0) return yearPart;
    return `${yearPart} ${months} mo${months === 1 ? '' : 's'}`;
  }

  function monthsBetween(startYear, startMonth, endYear, endMonth, isPresent) {
    let total = (endYear - startYear) * 12 + (endMonth - startMonth);
    if (!isPresent) total += 1;
    return Math.max(total, 1);
  }

  function initExperienceTenure() {
    document.querySelectorAll('.exp-tenure[data-start]').forEach((el) => {
      const [startYear, startMonth] = el.dataset.start.split('-').map(Number);
      const endValue = el.dataset.end;
      const now = new Date();
      let endYear;
      let endMonth;
      const isPresent = !endValue || endValue === 'present';

      if (isPresent) {
        endYear = now.getFullYear();
        endMonth = now.getMonth() + 1;
      } else {
        [endYear, endMonth] = endValue.split('-').map(Number);
      }

      const totalMonths = monthsBetween(
        startYear,
        startMonth,
        endYear,
        endMonth,
        isPresent
      );
      el.textContent = formatExperienceTenure(totalMonths);
    });
  }

  window.addEventListener('load', initExperienceTenure);

  /**
   * Contact form — Web3Forms
   * https://web3forms.com/
   */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const botcheck = contactForm.querySelector('[name="botcheck"]');
      if (botcheck?.checked) return;

      const loading = contactForm.querySelector('.loading');
      const errorBox = contactForm.querySelector('.error-message');
      const sentBox = contactForm.querySelector('.sent-message');
      const submitBtn = contactForm.querySelector('#contact-submit');

      loading?.classList.add('d-block');
      errorBox?.classList.remove('d-block');
      sentBox?.classList.remove('d-block');
      if (submitBtn) submitBtn.disabled = true;

      const formData = new FormData(contactForm);
      const userSubject = formData.get('user_subject');
      if (userSubject) {
        formData.set(
          'subject',
          `Portfolio — ${userSubject}`
        );
        formData.delete('user_subject');
      }

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to send. Please try again.');
        }

        contactForm.reset();
        sentBox?.classList.add('d-block');
      } catch (err) {
        if (errorBox) {
          errorBox.textContent =
            err.message ||
            'Something went wrong. Email me at sahanirakesh877@gmail.com';
          errorBox.classList.add('d-block');
        }
      } finally {
        loading?.classList.remove('d-block');
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

})(); 