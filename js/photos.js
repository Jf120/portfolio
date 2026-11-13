/**
 * Photos & Wallpapers Gallery Controller (photos.html)
 * Preserves horizontal collection scrollers, scroll buttons, and full-res downloads
 * while adding collection filtering, responsive scroll amounts, and a keyboard lightbox.
 */
document.addEventListener('DOMContentLoaded', () => {
  const { escapeHtml, resolveAssetPath, formatCollectionName } = window.PortfolioUtils;

  const masterContainer = document.getElementById('master-gallery-container');
  const filterContainer = document.getElementById('collection-filters');
  const totalCountEl = document.getElementById('gallery-total-count');

  const lightboxBackdrop = document.getElementById('photo-lightbox');
  const lightboxCloseBtn = document.getElementById('lightbox-close');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCollection = document.getElementById('lightbox-collection');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxDownload = document.getElementById('lightbox-download');
  const lightboxFilename = document.getElementById('lightbox-filename');
  const lightboxPrevBtn = document.getElementById('lightbox-prev');
  const lightboxNextBtn = document.getElementById('lightbox-next');

  if (!masterContainer) return;

  let allCollections = [];
  let activeCollection = 'all';
  let currentLightbox = { collectionIndex: 0, imageIndex: 0 };
  let lastTriggerEl = null;

  function renderFilterPills() {
    if (!filterContainer) return;
    const totalImages = allCollections.reduce((sum, col) => sum + col.images.length, 0);

    if (totalCountEl) {
      totalCountEl.textContent = `${totalImages} wallpapers across ${allCollections.length} collections`;
    }

    const pills = [
      `<button type="button" class="filter-btn ${activeCollection === 'all' ? 'is-active' : ''}" data-collection-filter="all" aria-pressed="${activeCollection === 'all'}">All (${totalImages})</button>`,
      ...allCollections.map((col) => {
        const isActive = activeCollection === col.collection_name;
        const label = formatCollectionName(col.collection_name);
        return `<button type="button" class="filter-btn ${isActive ? 'is-active' : ''}" data-collection-filter="${escapeHtml(col.collection_name)}" aria-pressed="${isActive}">${escapeHtml(label)} (${col.images.length})</button>`;
      }),
    ];

    filterContainer.innerHTML = pills.join('');
  }

  function renderCollections() {
    const visibleCollections =
      activeCollection === 'all'
        ? allCollections
        : allCollections.filter((col) => col.collection_name === activeCollection);

    masterContainer.innerHTML = '';

    visibleCollections.forEach((collection) => {
      const realIndex = allCollections.findIndex(
        (c) => c.collection_name === collection.collection_name
      );
      const niceTitle = formatCollectionName(collection.collection_name);
      const countLabel = String(collection.images.length).padStart(2, '0');

      const scrollerContent = collection.images
        .map((image, imgIndex) => {
          const thumbPath = resolveAssetPath(image.image_path);
          const downloadPath = resolveAssetPath(image.download_path);
          const fallbackPath = resolveAssetPath(image.fallback_path);

          return `
            <article class="gallery-item">
              <button
                type="button"
                class="gallery-thumb-btn"
                data-open-lightbox
                data-collection-index="${realIndex}"
                data-image-index="${imgIndex}"
                aria-label="Preview ${escapeHtml(image.title)} in lightbox"
              >
                <img
                  src="${escapeHtml(thumbPath)}"
                  alt="${escapeHtml(image.alt)}"
                  loading="lazy"
                  onerror="this.onerror=null; this.src='${escapeHtml(fallbackPath)}';"
                >
                <span class="gallery-zoom-hint" aria-hidden="true">Preview</span>
              </button>

              <div class="gallery-item-footer">
                <h3 class="gallery-item-title">${escapeHtml(image.title)}</h3>
                <a
                  href="${escapeHtml(downloadPath)}"
                  download="${escapeHtml(image.filename)}"
                  class="download-btn"
                >
                  Download Full Quality
                </a>
              </div>
            </article>
          `;
        })
        .join('');

      const gallerySection = `
        <section
          class="gallery-section"
          id="collection-${escapeHtml(collection.collection_name)}"
          aria-labelledby="heading-${escapeHtml(collection.collection_name)}"
        >
          <div class="gallery-header">
            <div class="gallery-title-group">
              <h2 id="heading-${escapeHtml(collection.collection_name)}">${escapeHtml(niceTitle)}</h2>
              <span class="nb-tag nb-tag--sky">${countLabel} Wallpapers</span>
            </div>

            <div class="scroll-buttons">
              <button
                type="button"
                class="scroll-btn prev-btn"
                data-target-id="scroller-${escapeHtml(collection.collection_name)}"
                aria-label="Scroll ${escapeHtml(niceTitle)} left"
              >&lt;</button>
              <button
                type="button"
                class="scroll-btn next-btn"
                data-target-id="scroller-${escapeHtml(collection.collection_name)}"
                aria-label="Scroll ${escapeHtml(niceTitle)} right"
              >&gt;</button>
            </div>
          </div>

          <div
            class="gallery-scroller"
            id="scroller-${escapeHtml(collection.collection_name)}"
            tabindex="0"
            aria-label="${escapeHtml(niceTitle)} wallpaper carousel"
          >
            ${scrollerContent}
          </div>
        </section>
      `;

      masterContainer.insertAdjacentHTML('beforeend', gallerySection);
    });

    setupScrollButtons();
  }

  function setupScrollButtons() {
    document.querySelectorAll('.scroll-btn').forEach((button) => {
      button.addEventListener('click', (event) => {
        const targetId = event.currentTarget.dataset.targetId;
        const scroller = document.getElementById(targetId);
        if (!scroller) return;

        const firstCard = scroller.querySelector('.gallery-item');
        const cardStep = firstCard ? firstCard.offsetWidth + 16 : 296;
        const multiplier = window.innerWidth >= 768 ? 2 : 1;
        const direction = event.currentTarget.classList.contains('next-btn') ? 1 : -1;

        scroller.scrollBy({
          left: direction * cardStep * multiplier,
          behavior: 'smooth',
        });
      });
    });
  }

  function updateLightboxView() {
    const col = allCollections[currentLightbox.collectionIndex];
    if (!col || !col.images.length) return;

    const img = col.images[currentLightbox.imageIndex];
    if (!img) return;

    const previewPath = resolveAssetPath(img.image_path);
    const downloadPath = resolveAssetPath(img.download_path);
    const fallbackPath = resolveAssetPath(img.fallback_path);

    lightboxTitle.textContent = img.title;
    lightboxCollection.textContent = `${formatCollectionName(col.collection_name)} · ${currentLightbox.imageIndex + 1} / ${col.images.length}`;
    lightboxFilename.textContent = img.filename;

    lightboxImg.onerror = () => {
      lightboxImg.onerror = null;
      lightboxImg.src = fallbackPath;
    };
    lightboxImg.src = previewPath;
    lightboxImg.alt = img.alt;

    lightboxDownload.href = downloadPath;
    lightboxDownload.setAttribute('download', img.filename);
  }

  function openLightbox(collectionIndex, imageIndex, triggerEl) {
    if (!lightboxBackdrop) return;
    lastTriggerEl = triggerEl || document.activeElement;
    currentLightbox = { collectionIndex, imageIndex };
    updateLightboxView();
    lightboxBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lightboxCloseBtn) lightboxCloseBtn.focus();
  }

  function closeLightbox() {
    if (!lightboxBackdrop || lightboxBackdrop.hidden) return;
    lightboxBackdrop.hidden = true;
    document.body.style.overflow = '';
    if (lastTriggerEl && typeof lastTriggerEl.focus === 'function') {
      lastTriggerEl.focus();
    }
  }

  function stepLightbox(delta) {
    const col = allCollections[currentLightbox.collectionIndex];
    if (!col || !col.images.length) return;
    const len = col.images.length;
    currentLightbox.imageIndex = (currentLightbox.imageIndex + delta + len) % len;
    updateLightboxView();
  }

  if (filterContainer) {
    filterContainer.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-collection-filter]');
      if (!btn) return;
      activeCollection = btn.dataset.collectionFilter || 'all';
      renderFilterPills();
      renderCollections();
    });
  }

  masterContainer.addEventListener('click', (event) => {
    const thumbBtn = event.target.closest('[data-open-lightbox]');
    if (!thumbBtn) return;
    const cIdx = Number(thumbBtn.dataset.collectionIndex);
    const iIdx = Number(thumbBtn.dataset.imageIndex);
    openLightbox(cIdx, iIdx, thumbBtn);
  });

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }
  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', () => stepLightbox(-1));
  }
  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', () => stepLightbox(1));
  }
  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener('click', (event) => {
      if (event.target === lightboxBackdrop) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (!lightboxBackdrop || lightboxBackdrop.hidden) return;
    if (event.key === 'Escape') {
      closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      stepLightbox(-1);
    } else if (event.key === 'ArrowRight') {
      stepLightbox(1);
    }
  });

  fetch('./data/gallery_data.json')
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((collections) => {
      allCollections = collections;
      renderFilterPills();
      renderCollections();

      if (window.location.hash) {
        const target = document.getElementById(window.location.hash.slice(1));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    })
    .catch((error) => {
      console.error('Error loading gallery data:', error);
      masterContainer.innerHTML =
        '<div class="nb-card"><p>Could not load the wallpaper gallery.</p></div>';
    });
});
