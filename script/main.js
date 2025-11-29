
// Scroll / keyboard driven stack reordering for the `.cards` container.
(function () {
	const container = document.querySelector('.cards');
	if (!container) return;

	let isAnimating = false;
	let lastEvent = 0;
	const THROTTLE_MS = 320;

	function rotateForward() {
		// move first child to end
		const first = container.firstElementChild;
		if (!first) return;
		isAnimating = true;
		container.classList.add('is-animating');
		container.appendChild(first);
		// block events until CSS transition likely finished
		setTimeout(() => {
			isAnimating = false;
			container.classList.remove('is-animating');
		}, THROTTLE_MS + 40);
	}

	function rotateBackward() {
		// move last child to front
		const last = container.lastElementChild;
		if (!last) return;
		isAnimating = true;
		container.classList.add('is-animating');
		container.insertBefore(last, container.firstElementChild);
		setTimeout(() => {
			isAnimating = false;
			container.classList.remove('is-animating');
		}, THROTTLE_MS + 40);
	}

	function handleWheel(e) {
		const now = Date.now();
		if (isAnimating || now - lastEvent < THROTTLE_MS) return;
		lastEvent = now;
		if (e.deltaY > 0) {
			rotateForward();
		} else if (e.deltaY < 0) {
			rotateBackward();
		}
	}

	function handleKey(e) {
		if (isAnimating) return;
		if (e.key === 'ArrowDown' || e.key === 'PageDown') {
			rotateForward();
		} else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
			rotateBackward();
		}
	}

	// Improve touch: simple swipe detection
	let touchStartY = null;
	container.addEventListener('touchstart', (e) => {
		if (e.touches && e.touches[0]) touchStartY = e.touches[0].clientY;
	}, {passive: true});
	container.addEventListener('touchend', (e) => {
		if (touchStartY == null) return;
		const touchEndY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : null;
		if (touchEndY == null) return;
		const diff = touchStartY - touchEndY;
		if (Math.abs(diff) > 24) {
			if (diff > 0) rotateForward(); else rotateBackward();
		}
		touchStartY = null;
	}, {passive: true});

	// Wheel + mouse support
	container.addEventListener('wheel', handleWheel, {passive: true});
	// Keyboard on container for accessibility
	container.setAttribute('tabindex', '0');
	container.addEventListener('keydown', handleKey);

	// Small UX: allow clicking the top card to send it to back
	container.addEventListener('click', (e) => {
		// Only act when clicking the top-most card
		if (e.target.closest('.card') === container.firstElementChild) {
			rotateForward();
		}
	});

	// Optional: expose functions for debugging
	window._stackRotate = { forward: rotateForward, backward: rotateBackward };
})();
