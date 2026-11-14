/**
 * Home Page Dynamic Previews (index.html)
 * Populates Featured Projects (JMF Survey, Family Captions, MLPP) and Wallpaper Previews.
 */
document.addEventListener('DOMContentLoaded', () => {
  const { escapeHtml, resolveAssetPath, formatCollectionName } = window.PortfolioUtils;

  const featuredProjectsEl = document.getElementById('home-featured-projects');
  if (featuredProjectsEl) {
    fetch('./data/projects_data.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((projects) => {
        const featured = projects.filter((item) => item.featured).slice(0, 3);
        featuredProjectsEl.innerHTML = featured
          .map((project) => {
            const demoTag = project.has_interactive_demo
              ? '<span class="demo-badge">Interactive Mini-App</span>'
              : '';
            const primaryLabel = project.has_interactive_demo
              ? 'Case Study + Mini-App →'
              : project.case_study_url
              ? 'Read Case Study →'
              : 'Inspect Project →';

            const secondaryLiveBtn =
              project.live_url && project.live_url.startsWith('http')
                ? `<a class="btn btn-sm btn-surface" href="${escapeHtml(
                    project.live_url
                  )}" target="_blank" rel="noopener noreferrer">Live Site ↗</a>`
                : '';

            return `
              <article class="nb-card nb-card--interactive pillar-card">
                <div class="collection-preview-meta">
                  <span class="nb-tag nb-tag--amber">${escapeHtml(project.index)} // ${escapeHtml(
              project.category_label
            )}</span>
                  <span class="eyebrow">${escapeHtml(project.year)}</span>
                </div>
                <h3>${escapeHtml(project.title)}</h3>
                <p>${escapeHtml(project.summary)}</p>
                <div class="project-impact-box">${escapeHtml(project.impact)}</div>
                <ul class="tag-list">
                  ${project.stack
                    .slice(0, 4)
                    .map((tech) => `<li class="nb-tag">${escapeHtml(tech)}</li>`)
                    .join('')}
                </ul>
                <div class="hero-cta-group" style="margin-top: auto; padding-top: 0.5rem;">
                  <a
                    class="btn btn-sm btn-primary"
                    href="${escapeHtml(project.case_study_url || `./projects.html#${project.id}`)}"
                  >
                    ${primaryLabel}
                  </a>
                  ${secondaryLiveBtn}
                  ${!secondaryLiveBtn ? demoTag : ''}
                </div>
              </article>
            `;
          })
          .join('');
      })
      .catch((error) => {
        console.error('Failed to load featured projects:', error);
        featuredProjectsEl.innerHTML =
          '<p class="nb-card">Featured projects could not be loaded right now.</p>';
      });
  }

  const galleryPreviewEl = document.getElementById('home-gallery-preview');
  if (galleryPreviewEl) {
    fetch('./data/gallery_data.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((collections) => {
        galleryPreviewEl.innerHTML = collections
          .map((collection) => {
            const firstImage = collection.images && collection.images[0];
            const thumb = firstImage
              ? resolveAssetPath(firstImage.image_path)
              : './assets/no_image.png';
            const fallback = firstImage
              ? resolveAssetPath(firstImage.fallback_path)
              : './assets/no_image.png';
            const niceName = formatCollectionName(collection.collection_name);
            const count = collection.images ? collection.images.length : 0;

            return `
              <article class="nb-card nb-card--interactive collection-preview-card">
                <div class="collection-preview-thumb">
                  <img
                    src="${escapeHtml(thumb)}"
                    alt="${escapeHtml(niceName)} wallpaper collection preview"
                    loading="lazy"
                    onerror="this.onerror=null;this.src='${escapeHtml(fallback)}';"
                  >
                </div>
                <div class="collection-preview-meta">
                  <h3>${escapeHtml(niceName)}</h3>
                  <span class="nb-tag nb-tag--sky">${count} Photos</span>
                </div>
                <a class="btn btn-sm btn-primary" href="./photos.html#collection-${escapeHtml(
                  collection.collection_name
                )}">
                  Open Collection →
                </a>
              </article>
            `;
          })
          .join('');
      })
      .catch((error) => {
        console.error('Failed to load gallery preview:', error);
        galleryPreviewEl.innerHTML =
          '<p class="nb-card">Wallpaper previews could not be loaded right now.</p>';
      });
  }
});
