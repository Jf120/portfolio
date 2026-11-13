/**
 * Shared Portfolio Utilities
 * Safe HTML escaping, GitHub Pages asset-path normalization, and Neo-Brutalist SVG schematics.
 */
(function () {
  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function resolveAssetPath(path) {
    if (!path) return './assets/no_image.png';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    if (path.startsWith('/portfolio/')) {
      return './' + path.slice('/portfolio/'.length);
    }
    if (path.startsWith('/')) {
      return '.' + path;
    }
    return path;
  }

  function formatCollectionName(rawName) {
    return String(rawName || '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (ch) => ch.toUpperCase());
  }

  function getSchematicSvg(kind) {
    switch (kind) {
      case 'pipeline':
        return `
          <svg viewBox="0 0 400 170" fill="none" aria-hidden="true">
            <rect x="24" y="54" width="84" height="58" fill="var(--bg-surface)" stroke="var(--border-color)" stroke-width="3"/>
            <rect x="158" y="34" width="84" height="98" fill="var(--accent-amber)" stroke="var(--border-color)" stroke-width="3"/>
            <rect x="292" y="54" width="84" height="58" fill="var(--accent-sky)" stroke="var(--border-color)" stroke-width="3"/>
            <path d="M108 83H158M242 83H292" stroke="var(--border-color)" stroke-width="3"/>
            <circle cx="133" cy="83" r="5" fill="var(--accent-orange)" stroke="var(--border-color)" stroke-width="2"/>
            <circle cx="267" cy="83" r="5" fill="var(--accent-orange)" stroke="var(--border-color)" stroke-width="2"/>
            <line x1="38" y1="74" x2="92" y2="74" stroke="var(--border-color)" stroke-width="3"/>
            <line x1="38" y1="90" x2="78" y2="90" stroke="var(--border-color)" stroke-width="3"/>
            <line x1="174" y1="62" x2="226" y2="62" stroke="#111315" stroke-width="3"/>
            <line x1="174" y1="82" x2="226" y2="82" stroke="#111315" stroke-width="3"/>
            <line x1="174" y1="102" x2="210" y2="102" stroke="#111315" stroke-width="3"/>
            <rect x="308" y="72" width="52" height="22" fill="var(--bg-surface)" stroke="#111315" stroke-width="2.5"/>
          </svg>
        `;
      case 'terminal':
        return `
          <svg viewBox="0 0 400 170" fill="none" aria-hidden="true">
            <rect x="46" y="22" width="308" height="126" fill="var(--code-bg)" stroke="var(--border-color)" stroke-width="3"/>
            <rect x="46" y="22" width="308" height="26" fill="var(--accent-orange)" stroke="var(--border-color)" stroke-width="3"/>
            <circle cx="64" cy="35" r="4" fill="#111315"/>
            <circle cx="78" cy="35" r="4" fill="#111315"/>
            <circle cx="92" cy="35" r="4" fill="#111315"/>
            <path d="M68 72L84 84L68 96" stroke="var(--accent-amber)" stroke-width="3.5" stroke-linecap="square"/>
            <line x1="98" y1="84" x2="230" y2="84" stroke="var(--code-text)" stroke-width="3.5"/>
            <line x1="68" y1="112" x2="294" y2="112" stroke="var(--accent-sky)" stroke-width="3"/>
            <line x1="68" y1="128" x2="196" y2="128" stroke="var(--code-comment)" stroke-width="3"/>
          </svg>
        `;
      case 'network':
        return `
          <svg viewBox="0 0 400 170" fill="none" aria-hidden="true">
            <line x1="90" y1="50" x2="200" y2="88" stroke="var(--border-color)" stroke-width="3"/>
            <line x1="90" y1="124" x2="200" y2="88" stroke="var(--border-color)" stroke-width="3"/>
            <line x1="200" y1="88" x2="310" y2="48" stroke="var(--border-color)" stroke-width="3"/>
            <line x1="200" y1="88" x2="310" y2="124" stroke="var(--border-color)" stroke-width="3"/>
            <rect x="58" y="32" width="64" height="36" fill="var(--accent-sky)" stroke="var(--border-color)" stroke-width="3"/>
            <rect x="58" y="106" width="64" height="36" fill="var(--bg-surface)" stroke="var(--border-color)" stroke-width="3"/>
            <rect x="164" y="62" width="72" height="52" fill="var(--accent-amber)" stroke="var(--border-color)" stroke-width="3"/>
            <rect x="278" y="30" width="64" height="36" fill="var(--accent-orange)" stroke="var(--border-color)" stroke-width="3"/>
            <rect x="278" y="106" width="64" height="36" fill="var(--bg-surface)" stroke="var(--border-color)" stroke-width="3"/>
          </svg>
        `;
      case 'playbill':
        return `
          <svg viewBox="0 0 400 170" fill="none" aria-hidden="true">
            <rect x="78" y="16" width="118" height="138" fill="var(--bg-surface)" stroke="var(--border-color)" stroke-width="3"/>
            <rect x="78" y="16" width="118" height="32" fill="#fde513" stroke="var(--border-color)" stroke-width="3"/>
            <line x1="94" y1="32" x2="180" y2="32" stroke="#111315" stroke-width="4"/>
            <rect x="92" y="60" width="90" height="78" fill="var(--accent-sky)" stroke="var(--border-color)" stroke-width="2.5"/>
            <rect x="208" y="26" width="118" height="128" fill="var(--bg-elevated)" stroke="var(--border-color)" stroke-width="3"/>
            <line x1="224" y1="52" x2="270" y2="52" stroke="var(--border-color)" stroke-width="3"/>
            <line x1="276" y1="52" x2="310" y2="52" stroke="var(--border-color)" stroke-width="2.5" stroke-dasharray="3 4"/>
            <line x1="224" y1="76" x2="262" y2="76" stroke="var(--border-color)" stroke-width="3"/>
            <line x1="268" y1="76" x2="310" y2="76" stroke="var(--border-color)" stroke-width="2.5" stroke-dasharray="3 4"/>
            <line x1="224" y1="100" x2="278" y2="100" stroke="var(--border-color)" stroke-width="3"/>
            <line x1="284" y1="100" x2="310" y2="100" stroke="var(--border-color)" stroke-width="2.5" stroke-dasharray="3 4"/>
            <rect x="224" y="118" width="86" height="22" fill="var(--accent-amber)" stroke="var(--border-color)" stroke-width="2.5"/>
          </svg>
        `;
      case 'archive':
        return `
          <svg viewBox="0 0 400 170" fill="none" aria-hidden="true">
            <rect x="46" y="24" width="144" height="122" fill="var(--bg-surface)" stroke="var(--border-color)" stroke-width="3"/>
            <rect x="58" y="36" width="120" height="74" fill="var(--accent-sky)" stroke="var(--border-color)" stroke-width="2.5"/>
            <circle cx="88" cy="64" r="11" fill="var(--accent-amber)" stroke="#111315" stroke-width="2.5"/>
            <path d="M62 106L96 78L124 98L148 80L174 106Z" fill="#111315"/>
            <line x1="58" y1="126" x2="178" y2="126" stroke="var(--border-color)" stroke-width="3"/>
            <rect x="210" y="24" width="144" height="54" fill="var(--bg-surface)" stroke="var(--border-color)" stroke-width="3"/>
            <line x1="224" y1="44" x2="338" y2="44" stroke="var(--border-color)" stroke-width="3"/>
            <line x1="224" y1="60" x2="296" y2="60" stroke="var(--border-color)" stroke-width="3"/>
            <rect x="210" y="92" width="144" height="54" fill="var(--accent-amber)" stroke="var(--border-color)" stroke-width="3"/>
            <line x1="224" y1="112" x2="322" y2="112" stroke="#111315" stroke-width="3"/>
            <rect x="224" y="124" width="54" height="12" fill="#111315"/>
          </svg>
        `;
      case 'grid':
      default:
        return `
          <svg viewBox="0 0 400 170" fill="none" aria-hidden="true">
            <rect x="44" y="24" width="142" height="122" fill="var(--bg-surface)" stroke="var(--border-color)" stroke-width="3"/>
            <rect x="58" y="38" width="114" height="44" fill="var(--accent-amber)" stroke="var(--border-color)" stroke-width="2.5"/>
            <rect x="58" y="94" width="52" height="38" fill="var(--accent-sky)" stroke="var(--border-color)" stroke-width="2.5"/>
            <rect x="120" y="94" width="52" height="38" fill="var(--bg-muted)" stroke="var(--border-color)" stroke-width="2.5"/>
            <rect x="206" y="24" width="150" height="54" fill="var(--accent-orange)" stroke="var(--border-color)" stroke-width="3"/>
            <rect x="206" y="92" width="150" height="54" fill="var(--bg-surface)" stroke="var(--border-color)" stroke-width="3"/>
            <line x1="224" y1="112" x2="336" y2="112" stroke="var(--border-color)" stroke-width="3"/>
            <line x1="224" y1="128" x2="294" y2="128" stroke="var(--border-color)" stroke-width="3"/>
          </svg>
        `;
    }
  }

  window.PortfolioUtils = {
    escapeHtml,
    resolveAssetPath,
    formatCollectionName,
    getSchematicSvg,
  };
})();
