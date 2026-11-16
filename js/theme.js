/**
 * Theme Manager (Light / Dark Mode)
 * Executes synchronously in <head> to prevent flash of unthemed content.
 */
(function () {
  const STORAGE_KEY = 'jafc-theme';

  function getPreferredTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch (_err) {
      // Ignore storage access errors in restricted browsing modes.
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function applyTheme(theme) {
    const resolved = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
    return resolved;
  }

  function updateToggleButton(button, theme) {
    if (!button) return;
    const isDark = theme === 'dark';
    button.setAttribute('aria-pressed', String(isDark));
    button.setAttribute(
      'aria-label',
      isDark ? 'Switch to light mode' : 'Switch to dark mode'
    );

    const iconSlot = button.querySelector('[data-theme-icon]');
    const labelSlot = button.querySelector('[data-theme-label]');

    if (iconSlot) {
      iconSlot.innerHTML = isDark
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }

    if (labelSlot) {
      labelSlot.textContent = isDark ? 'Light' : 'Dark';
    }
  }

  function syncAllToggles(theme) {
    document.querySelectorAll('#theme-toggle').forEach((btn) => {
      updateToggleButton(btn, theme);
    });
  }

  function notifyEmbeddedIframes(theme) {
    document.querySelectorAll('.sandbox-iframe').forEach((frame) => {
      try {
        if (frame.contentWindow) {
          frame.contentWindow.postMessage({ type: 'JAFC_THEME_CHANGE', theme }, '*');
        }
      } catch (_err) {
        // Ignore cross-origin postMessage errors before frame load.
      }
    });
    try {
      window.dispatchEvent(new CustomEvent('jafc:themechange', { detail: { theme } }));
    } catch (_err) {
      // Ignore event dispatch errors.
    }
  }

  function setTheme(theme, persist = true) {
    const applied = applyTheme(theme);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, applied);
      } catch (_err) {
        // Ignore storage access errors.
      }
    }
    syncAllToggles(applied);
    notifyEmbeddedIframes(applied);
    return applied;
  }

  function toggleTheme() {
    const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    return setTheme(current === 'dark' ? 'light' : 'dark', true);
  }

  // Apply immediately before first paint.
  const initialTheme = applyTheme(getPreferredTheme());

  // Sync with OS preference only if the user has not explicitly saved a preference.
  if (window.matchMedia) {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (event) => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') return;
      } catch (_err) {
        // Proceed with media update.
      }
      setTheme(event.matches ? 'dark' : 'light', false);
    };

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleMediaChange);
    }
  }

  window.ThemeManager = {
    getTheme: () => document.documentElement.dataset.theme || initialTheme,
    setTheme,
    toggleTheme,
    syncButton: (btn) => updateToggleButton(btn, document.documentElement.dataset.theme || initialTheme),
  };
})();
