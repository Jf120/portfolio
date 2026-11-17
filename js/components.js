/**
 * Shared Web Components & UI Helpers
 * Defines <app-navbar>, <app-footer>, <collection-intro>, copy-email handlers, and toast feedback.
 */
(function () {
  const NAV_ITEMS = [
    { href: 'index.html', label: 'Home' },
    { href: 'projects.html', label: 'Projects' },
    { href: 'about.html', label: 'About' },
    { href: 'photos.html', label: 'Photos' },
  ];

  const PROJECT_SLUGS = new Set([
    'projects',
    'jmf-survey',
    'beenight',
    'mlpp-glossary',
    'eliza-playbill',
    'family-captions',
    'timeline',
    'personal',
  ]);

  function getActivePageFilename() {
    const path = (window.location.pathname || '/').toLowerCase();
    const segments = path.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || '';
    const slug = last.replace(/\.html?$/i, '');

    if (slug === 'photos') {
      return 'photos.html';
    }
    if (slug === 'about') {
      return 'about.html';
    }
    if (PROJECT_SLUGS.has(slug)) {
      return 'projects.html';
    }
    if (slug === 'index' || !slug) {
      return 'index.html';
    }

    // Fallback check against document title in case of custom base path or preview router
    const title = (document.title || '').toLowerCase();
    if (title.includes('photo') || title.includes('wallpaper')) return 'photos.html';
    if (title.includes('about')) return 'about.html';
    if (title.includes('project') || title.includes('case study')) return 'projects.html';

    return 'index.html';
  }

  function showToast(message) {
    let toast = document.getElementById('nb-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'nb-toast';
      toast.className = 'nb-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('is-visible');

    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2400);
  }

  window.showToast = showToast;

  class AppNavbar extends HTMLElement {
    connectedCallback() {
      const currentPage = getActivePageFilename();

      const desktopLinks = NAV_ITEMS.map((item) => {
        const isCurrent = item.href === currentPage;
        return `
          <li>
            <a
              class="nav-link${isCurrent ? ' is-active' : ''}"
              href="./${item.href}"
              data-nav-href="${item.href}"
              ${isCurrent ? 'aria-current="page"' : ''}
            >
              ${item.label}
            </a>
          </li>
        `;
      }).join('');

      const mobileLinks = NAV_ITEMS.map((item) => {
        const isCurrent = item.href === currentPage;
        return `
          <li>
            <a
              class="nav-link${isCurrent ? ' is-active' : ''}"
              href="./${item.href}"
              data-nav-href="${item.href}"
              ${isCurrent ? 'aria-current="page"' : ''}
            >
              <span>${item.label}</span>
              <span data-nav-indicator aria-hidden="true">${isCurrent ? '●' : '→'}</span>
            </a>
          </li>
        `;
      }).join('');

      this.innerHTML = `
        <header class="site-header">
          <div class="container navbar">
            <a class="brand-link" href="./index.html" aria-label="jafc.portfolio() Home">
              <span class="brand-mark" aria-hidden="true">JF</span>
              <span class="brand-text">jafc.portfolio()</span>
            </a>

            <nav aria-label="Primary navigation">
              <ul class="nav-links">
                ${desktopLinks}
              </ul>
            </nav>

            <div class="nav-actions">
              <button
                type="button"
                id="theme-toggle"
                class="theme-toggle"
                aria-pressed="false"
                aria-label="Switch color theme"
              >
                <span data-theme-icon></span>
                <span data-theme-label>Dark</span>
              </button>

              <button
                type="button"
                id="mobile-menu-toggle"
                class="menu-toggle-btn"
                aria-expanded="false"
                aria-controls="mobile-drawer"
                aria-label="Toggle navigation menu"
              >
                <span id="menu-toggle-text">Menu</span>
              </button>
            </div>
          </div>

          <div class="mobile-drawer" id="mobile-drawer" hidden>
            <nav class="container" aria-label="Mobile navigation">
              <ul class="mobile-nav-links">
                ${mobileLinks}
              </ul>
            </nav>
          </div>
        </header>
      `;

      const allNavLinks = Array.from(this.querySelectorAll('.nav-link[data-nav-href]'));
      allNavLinks.forEach((link) => {
        link.addEventListener('click', () => {
          const targetHref = link.getAttribute('data-nav-href');
          allNavLinks.forEach((other) => {
            const match = other.getAttribute('data-nav-href') === targetHref;
            other.classList.toggle('is-active', match);
            if (match) {
              other.setAttribute('aria-current', 'page');
            } else {
              other.removeAttribute('aria-current');
            }
            const indicator = other.querySelector('[data-nav-indicator]');
            if (indicator) {
              indicator.textContent = match ? '●' : '→';
            }
          });
        });
      });

      const themeBtn = this.querySelector('#theme-toggle');
      if (window.ThemeManager && themeBtn) {
        window.ThemeManager.syncButton(themeBtn);
        themeBtn.addEventListener('click', () => {
          window.ThemeManager.toggleTheme();
        });
      }

      const menuBtn = this.querySelector('#mobile-menu-toggle');
      const menuText = this.querySelector('#menu-toggle-text');
      const drawer = this.querySelector('#mobile-drawer');

      const setMenuState = (open) => {
        if (!menuBtn || !drawer) return;
        menuBtn.setAttribute('aria-expanded', String(open));
        drawer.hidden = !open;
        drawer.classList.toggle('is-open', open);
        if (menuText) {
          menuText.textContent = open ? 'Close' : 'Menu';
        }
      };

      if (menuBtn && drawer) {
        menuBtn.addEventListener('click', () => {
          const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
          setMenuState(!isOpen);
        });

        drawer.querySelectorAll('a').forEach((link) => {
          link.addEventListener('click', () => setMenuState(false));
        });

        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
            setMenuState(false);
            menuBtn.focus();
          }
        });

        document.addEventListener('click', (event) => {
          if (
            menuBtn.getAttribute('aria-expanded') === 'true' &&
            !this.contains(event.target)
          ) {
            setMenuState(false);
          }
        });
      }
    }
  }

  class AppFooter extends HTMLElement {
    connectedCallback() {
      const year = new Date().getFullYear();
      const displayYear = year >= 2025 ? `2025–${year}` : '2025';

      this.innerHTML = `
        <footer class="site-footer">
          <div class="container">
            <div class="footer-grid">
              <div class="footer-brand">
                <a class="brand-link" href="./index.html">
                  <span class="brand-mark" aria-hidden="true">JF</span>
                  <span class="brand-text">jafc.portfolio()</span>
                </a>
                <p>
                  Jorge Flores — Frontend &amp; Full-Stack Software Engineer (Ensign College '27).
                  Coding with craft, family, and clarity in Salt Lake City, UT.
                </p>
              </div>

              <div>
                <h2 class="footer-heading">Navigation</h2>
                <ul class="footer-links">
                  <li><a href="./index.html">Home</a></li>
                  <li><a href="./projects.html">All Projects &amp; Case Studies</a></li>
                  <li><a href="./projects.html?category=personal">Personal Builds</a></li>
                  <li><a href="./about.html">About &amp; Resume</a></li>
                  <li><a href="./photos.html">Photos &amp; Wallpapers</a></li>
                </ul>
              </div>

              <div>
                <h2 class="footer-heading">Connect</h2>
                <ul class="footer-links">
                  <li><a href="mailto:jafc120@gmail.com">jafc120@gmail.com</a></li>
                  <li><a href="https://github.com/Jf120" target="_blank" rel="noopener noreferrer">GitHub (@Jf120)</a></li>
                  <li><a href="https://www.linkedin.com/in/ja-flores/" target="_blank" rel="noopener noreferrer">LinkedIn (/in/ja-flores)</a></li>
                </ul>
              </div>
            </div>

            <div class="footer-bottom">
              <span>© ${displayYear} Jorge Flores (jafc120). Zero-dependency HTML, CSS &amp; JS on GitHub Pages.</span>
              <a href="#top" class="btn btn-sm btn-surface">↑ Back to top</a>
            </div>
          </div>
        </footer>
      `;
    }
  }

  class CollectionIntro extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <aside class="nb-card profile-facts-card" aria-label="Photography field specs">
          <div class="collection-preview-meta">
            <span class="nb-tag nb-tag--amber">FIELD_LENS.SPEC</span>
            <span class="eyebrow">Creative Hobby</span>
          </div>
          <dl class="facts-list">
            <div class="facts-row">
              <dt>Subjects</dt>
              <dd>Moab Red Rock · Autumn Light · Street</dd>
            </div>
            <div class="facts-row">
              <dt>Color Pipeline</dt>
              <dd>Grain · Shadow Depth · Natural Contrast</dd>
            </div>
            <div class="facts-row">
              <dt>Exports</dt>
              <dd>Full-Res Mobile Wallpapers (Free)</dd>
            </div>
          </dl>
          <p style="font-size: var(--text-sm);">
            Photography keeps my visual eye sharp for UI contrast, composition, and pacing.
          </p>
        </aside>
      `;
    }
  }

  if (!customElements.get('app-navbar')) {
    customElements.define('app-navbar', AppNavbar);
  }
  if (!customElements.get('app-footer')) {
    customElements.define('app-footer', AppFooter);
  }
  if (!customElements.get('collection-intro')) {
    customElements.define('collection-intro', CollectionIntro);
  }

  // Bind any copy-email buttons across pages once DOM is ready.
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-copy-email]').forEach((button) => {
      button.addEventListener('click', async () => {
        const email = button.getAttribute('data-copy-email') || 'jafc120@gmail.com';
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(email);
          } else {
            const temp = document.createElement('input');
            temp.value = email;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
          }
          showToast(`Copied ${email} to clipboard`);
        } catch (_err) {
          showToast(`Email: ${email}`);
        }
      });
    });

    document.querySelectorAll('[data-print-resume]').forEach((button) => {
      button.addEventListener('click', () => {
        window.print();
      });
    });
  });
})();
