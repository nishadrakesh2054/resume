/**
 * Shared header & footer for blog / case study pages (matches index.html).
 * Load as first script: <script type="module" src=".../site-chrome.js"></script>
 *
 * Body data attributes:
 *   data-site-base="../"   — path to site root
 *   data-active-nav="blog" | "case-studies"
 */

/**
 * @param {string} base
 * @param {string} activeNav
 */
function renderHeader(base, activeNav) {
  const home = `${base}index.html`;
  const isActive = (key) => (activeNav === key ? ' class="active"' : '');

  return `
    <header id="header" class="header d-flex align-items-center fixed-top">
      <div class="container-fluid container-xl position-relative d-flex align-items-center">
        <a href="${home}#hero" class="logo d-flex align-items-center me-auto" aria-label="Rakesh Sahani — Home">
          <picture>
            <source srcset="${base}assets/img/logo.webp" type="image/webp" />
            <img
              src="${base}assets/img/logo.png"
              alt="Rakesh Sahani — Full Stack Developer"
              class="site-logo"
              width="280"
              height="60"
              decoding="async"
            />
          </picture>
        </a>
        <button
          type="button"
          class="mobile-nav-toggle d-xl-none"
          aria-label="Open menu"
          aria-expanded="false"
          aria-controls="navmenu"
        >
          <i class="bi bi-list" aria-hidden="true"></i>
        </button>
        <nav id="navmenu" class="navmenu" aria-label="Main navigation">
          <ul>
            <li><a href="${home}#hero"${isActive('home')}>Home</a></li>
            <li><a href="${home}#about"${isActive('about')}>About</a></li>
            <li><a href="${home}#resume"${isActive('resume')}>Resume</a></li>
            <li><a href="${home}#services"${isActive('services')}>Services</a></li>
            <li><a href="${home}#portfolio"${isActive('portfolio')}>Portfolio</a></li>
            <li><a href="${base}blog/"${isActive('blog')}>Blog</a></li>
            <li><a href="${base}case-studies/"${isActive('case-studies')}>Case Studies</a></li>
            <li><a href="${home}#contact"${isActive('contact')}>Contact</a></li>
            <li><a href="${home}#faq"${isActive('faq')}>FAQ</a></li>
          </ul>
        </nav>
      </div>
    </header>
    <div
      id="mobile-nav-backdrop"
      class="mobile-nav-backdrop d-xl-none"
      aria-hidden="true"
      tabindex="-1"
    ></div>`;
}

/**
 * @param {string} base
 */
function renderFooter(base) {
  const home = `${base}index.html`;

  return `
    <footer id="footer" class="footer">
      <div class="container footer-top">
        <div class="row gy-4">
          <div class="col-lg-5 col-md-12 footer-about">
            <a href="${home}#hero" class="logo d-flex align-items-center">
              <picture>
                <source srcset="${base}assets/img/logo.webp" type="image/webp" />
                <img
                  src="${base}assets/img/logo.png"
                  alt="Rakesh Sahani — Full Stack Developer"
                  class="site-logo site-logo--footer"
                  width="280"
                  height="60"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </a>
            <p>
              Full-stack developer passionate about building modern, scalable
              web and mobile applications. I deliver clean code, responsive
              designs, and end-to-end solutions using the latest technologies.
            </p>
            <div class="social-links d-flex mt-4">
              <a
                href="https://www.linkedin.com/in/rakesh-kumar-sahani-218229224/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                ><i class="bi bi-linkedin" aria-hidden="true"></i
              ></a>
              <a
                href="https://www.instagram.com/its_sahani_ranzeth?igsh=MTlqcWMzdXFzOXhmcQ=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                ><i class="bi bi-instagram" aria-hidden="true"></i
              ></a>
              <a
                href="https://github.com/nishadrakesh2054"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                ><i class="bi bi-github" aria-hidden="true"></i
              ></a>
            </div>
          </div>
          <div class="col-lg-2 col-6 footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="${home}#hero">Home</a></li>
              <li><a href="${home}#about">About</a></li>
              <li><a href="${home}#services">Services</a></li>
              <li><a href="${home}#portfolio">Portfolio</a></li>
              <li><a href="${base}blog/">Blog</a></li>
              <li><a href="${base}case-studies/">Case Studies</a></li>
              <li><a href="${home}#contact">Contact</a></li>
              <li><a href="${home}#faq">FAQ</a></li>
            </ul>
          </div>
          <div class="col-lg-2 col-6 footer-links">
            <h4>My Services</h4>
            <ul>
              <li><a href="${home}#services">Frontend Development</a></li>
              <li><a href="${home}#services">Full-Stack Development</a></li>
              <li><a href="${home}#services">Backend &amp; APIs</a></li>
              <li><a href="${home}#services">Mobile Apps</a></li>
              <li><a href="${home}#services">Deployment &amp; DevOps</a></li>
              <li><a href="${home}#services">SEO &amp; Performance</a></li>
            </ul>
          </div>
          <div class="col-lg-3 col-md-12 footer-contact text-center text-md-start">
            <h4>Contact Me</h4>
            <p class="mb-1"><strong>Location:</strong></p>
            <p>Kathmandu</p>
            <p>Nepal</p>
            <p class="mt-4">
              <strong>Phone:</strong> <span>+977 9845892346</span>
            </p>
            <p>
              <strong>Email:</strong> <span>sahanirakesh877@gmail.com</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
    <button
      type="button"
      id="scroll-progress-btn"
      class="scroll-progress-circle"
      aria-label="Back to top"
      title="Back to top"
    >
      <svg class="scroll-progress-ring" viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
        <defs>
          <linearGradient id="scroll-progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#6366f1" />
            <stop offset="50%" stop-color="#8b5cf6" />
            <stop offset="100%" stop-color="#06b6d4" />
          </linearGradient>
        </defs>
        <circle class="scroll-progress-track" cx="22" cy="22" r="19" />
        <circle class="scroll-progress-bar" cx="22" cy="22" r="19" />
      </svg>
      <i class="bi bi-arrow-up-short" aria-hidden="true"></i>
    </button>`;
}

function mountSiteChrome() {
  const base = document.body.dataset.siteBase || './';
  const activeNav = document.body.dataset.activeNav || '';
  const headerRoot = document.getElementById('site-header-root');
  const footerRoot = document.getElementById('site-footer-root');

  if (headerRoot) {
    headerRoot.innerHTML = renderHeader(base, activeNav);
  }
  if (footerRoot) {
    footerRoot.innerHTML = renderFooter(base);
  }

  document.body.classList.add('scrolled', 'site-chrome-ready');
}

mountSiteChrome();
