/**
 * Interactive Card Stack Controller
 * Maintains wheel, keyboard, touch swipe, and click-to-cycle interactions
 * for the `.cards` stack while syncing accessible prev/next controls and counter.
 */
(function () {
  const container = document.querySelector('.cards');
  if (!container) return;

  const prevBtn = document.getElementById('stack-prev-btn');
  const nextBtn = document.getElementById('stack-next-btn');
  const counterEl = document.getElementById('stack-counter');

  let isAnimating = false;
  let lastEvent = 0;
  const THROTTLE_MS = 320;
  const totalCards = container.children.length;

  function updateCounter() {
    if (!counterEl || !container.firstElementChild) return;
    const activeIdx = container.firstElementChild.dataset.cardIndex || '01';
    const totalStr = String(totalCards).padStart(2, '0');
    counterEl.textContent = `${activeIdx} / ${totalStr}`;
  }

  function rotateForward() {
    const first = container.firstElementChild;
    if (!first || isAnimating) return;
    isAnimating = true;
    container.classList.add('is-animating');
    container.appendChild(first);
    updateCounter();
    setTimeout(() => {
      isAnimating = false;
      container.classList.remove('is-animating');
    }, THROTTLE_MS + 40);
  }

  function rotateBackward() {
    const last = container.lastElementChild;
    if (!last || isAnimating) return;
    isAnimating = true;
    container.classList.add('is-animating');
    container.insertBefore(last, container.firstElementChild);
    updateCounter();
    setTimeout(() => {
      isAnimating = false;
      container.classList.remove('is-animating');
    }, THROTTLE_MS + 40);
  }

  function handleWheel(event) {
    const now = Date.now();
    if (isAnimating || now - lastEvent < THROTTLE_MS) return;
    if (Math.abs(event.deltaY) < 4) return;
    lastEvent = now;
    if (event.deltaY > 0) {
      rotateForward();
    } else {
      rotateBackward();
    }
  }

  function handleKey(event) {
    if (isAnimating) return;
    if (
      event.key === 'ArrowDown' ||
      event.key === 'PageDown' ||
      event.key === 'ArrowRight'
    ) {
      event.preventDefault();
      rotateForward();
    } else if (
      event.key === 'ArrowUp' ||
      event.key === 'PageUp' ||
      event.key === 'ArrowLeft'
    ) {
      event.preventDefault();
      rotateBackward();
    }
  }

  let touchStartY = null;
  let touchStartX = null;

  container.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches && event.touches[0]) {
        touchStartY = event.touches[0].clientY;
        touchStartX = event.touches[0].clientX;
      }
    },
    { passive: true }
  );

  container.addEventListener(
    'touchend',
    (event) => {
      if (touchStartY === null || touchStartX === null) return;
      const touch = event.changedTouches && event.changedTouches[0];
      if (!touch) return;

      const diffY = touchStartY - touch.clientY;
      const diffX = touchStartX - touch.clientX;
      const primaryDiff = Math.abs(diffY) >= Math.abs(diffX) ? diffY : diffX;

      if (Math.abs(primaryDiff) > 24) {
        if (primaryDiff > 0) {
          rotateForward();
        } else {
          rotateBackward();
        }
      }

      touchStartY = null;
      touchStartX = null;
    },
    { passive: true }
  );

  container.addEventListener('wheel', handleWheel, { passive: true });
  container.setAttribute('tabindex', '0');
  container.addEventListener('keydown', handleKey);

  container.addEventListener('click', (event) => {
    if (event.target.closest('.card') === container.firstElementChild) {
      rotateForward();
    }
  });

  function syncStackHeight() {
    const cards = Array.from(container.children);
    if (!cards.length) return;
    const maxCardHeight = Math.max(...cards.map((card) => card.offsetHeight));
    const stackOffset = Math.max(0, cards.length - 1) * 14;
    container.style.height = `${maxCardHeight + stackOffset}px`;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', rotateBackward);
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', rotateForward);
  }

  syncStackHeight();
  window.addEventListener('resize', syncStackHeight);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncStackHeight);
  }

  updateCounter();

  // Preserve debugging / external control hook from original main.js.
  window._stackRotate = { forward: rotateForward, backward: rotateBackward };
})();
