/**
 * Shared Web Components & UI Helpers
 * Defines <app-navbar>, <app-footer>, <collection-intro>, copy-email handlers, and toast feedback.
 */
(function () {
  const NAV_ITEMS = [
    { href: 'index.html', label: 'Home' },
    { href: 'about.html', label: 'About Me' },
    { href: 'projects.html', label: 'Projects' },
    { href: 'photos.html', label: 'Photos' },
  ];

  function getActivePageFilename() {
    const path = window.location.pathname || '/';
    const segments = path.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || '';

    if (!last || !last.includes('.')) {
      return 'index.html';
    }
    return last.toLowerCase();
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
            <a class="nav-link" href="./${item.href}" ${isCurrent ? 'aria-current="page"' : ''}>
              ${item.label}
            </a>
          </li>
        `;
      }).join('');

      const mobileLinks = NAV_ITEMS.map((item) => {
        const isCurrent = item.href === currentPage;
        return `
          <li>
            <a class="nav-link" href="./${item.href}" ${isCurrent ? 'aria-current="page"' : ''}>
              <span>${item.label}</span>
              <span aria-hidden="true">${isCurrent ? '●' : '→'}</span>
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
                  Jorge Flores Coronado — Software systems, operational strategy, UI/UX, and mobile photography.
                  Based in Salt Lake City, UT.
                </p>
              </div>

              <div>
                <h2 class="footer-heading">Navigation</h2>
                <ul class="footer-links">
                  <li><a href="./index.html">Home</a></li>
                  <li><a href="./about.html">About Me</a></li>
                  <li><a href="./projects.html">Projects</a></li>
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
              <span>© ${displayYear} Jorge Flores (jafc120). Pure HTML, CSS &amp; JS for GitHub Pages.</span>
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
        <div class="code-window">
          <div class="code-window-bar">
            <div class="window-dots" aria-hidden="true">
              <span class="window-dot window-dot--orange"></span>
              <span class="window-dot window-dot--amber"></span>
              <span class="window-dot window-dot--sky"></span>
            </div>
            <span>wallpapers.config.js</span>
          </div>
          <pre class="code-block"><code><span class="comment">// photographer wannabe</span>
<span class="keyword">const</span> subject = <span class="string">"whatever is on my sight"</span>;
<span class="keyword">const</span> filters = [<span class="string">"graininess"</span>, <span class="string">"vignette"</span>, <span class="string">"exposure"</span>, <span class="string">"contrast"</span>];
<span class="function">render</span>(<span class="function">vibrance</span>(subject, filters));

<span class="comment">// download to get full quality picture</span></code></pre>
        </div>
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
