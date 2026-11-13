/**
 * Projects Page Controller (projects.html)
 * Loads projects_data.json, handles category filtering, and manages accessible case study modal.
 */
document.addEventListener('DOMContentLoaded', () => {
  const { escapeHtml, getSchematicSvg } = window.PortfolioUtils;

  const gridEl = document.getElementById('projects-grid');
  const countEl = document.getElementById('projects-count');
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn[data-filter]'));

  const modalBackdrop = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('project-modal-close');
  const modalTitle = document.getElementById('project-modal-title');
  const modalMeta = document.getElementById('project-modal-meta');
  const modalBody = document.getElementById('project-modal-body');

  if (!gridEl) return;

  let allProjects = [];
  let activeFilter = 'all';
  let lastFocusedTrigger = null;

  function filterProjects(projects, filterKey) {
    if (filterKey === 'all') return projects;
    if (filterKey === 'placeholders') return projects.filter((p) => p.is_placeholder);
    return projects.filter((p) => p.category === filterKey);
  }

  function renderProjects() {
    const filtered = filterProjects(allProjects, activeFilter);

    if (countEl) {
      countEl.textContent = `Showing ${filtered.length} of ${allProjects.length} projects`;
    }

    if (!filtered.length) {
      gridEl.innerHTML = `
        <div class="nb-card">
          <h3>No matching projects</h3>
          <p>Try another category filter to view all builds and placeholders.</p>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = filtered
      .map((project) => {
        const statusClass = project.is_placeholder
          ? 'nb-tag nb-tag--placeholder'
          : 'nb-tag nb-tag--amber';

        const repoButton = project.repo_url
          ? `<a class="btn btn-sm btn-surface" href="${escapeHtml(project.repo_url)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`
          : '';

        const liveButton = project.live_url
          ? `<a class="btn btn-sm btn-secondary" href="${escapeHtml(project.live_url)}">Live View ↗</a>`
          : '';

        return `
          <article class="nb-card nb-card--interactive project-card" id="${escapeHtml(project.id)}">
            <div class="project-schematic">
              ${getSchematicSvg(project.schematic)}
              <span class="project-index-chip">${escapeHtml(project.index)} // ${escapeHtml(project.category_label)}</span>
              <span class="project-status-chip ${statusClass}">${escapeHtml(project.status)}</span>
            </div>

            <div class="project-card-body">
              <div class="collection-preview-meta">
                <span class="eyebrow">${escapeHtml(project.role)}</span>
                <span class="eyebrow">${escapeHtml(project.year)}</span>
              </div>

              <h3>${escapeHtml(project.title)}</h3>
              <p>${escapeHtml(project.summary)}</p>

              <div class="project-impact-box">${escapeHtml(project.impact)}</div>

              <ul class="tag-list">
                ${project.stack.map((tech) => `<li class="nb-tag">${escapeHtml(tech)}</li>`).join('')}
              </ul>

              <div class="project-card-actions">
                <button
                  type="button"
                  class="btn btn-sm btn-primary"
                  data-open-project="${escapeHtml(project.id)}"
                >
                  Case Study
                </button>
                ${repoButton}
                ${liveButton}
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  function openProjectModal(projectId, triggerEl) {
    const project = allProjects.find((p) => p.id === projectId);
    if (!project || !modalBackdrop) return;

    lastFocusedTrigger = triggerEl || document.activeElement;
    modalTitle.textContent = project.title;
    modalMeta.textContent = `${project.index} · ${project.category_label} · ${project.year}`;

    const placeholderNote = project.is_placeholder
      ? `
        <div class="nb-card nb-card--amber">
          <strong>Template Placeholder:</strong> Edit this entry in <code>data/projects_data.json</code>
          with your project repository, metrics, and screenshots when ready.
        </div>
      `
      : '';

    const repoLink = project.repo_url
      ? `<a class="btn btn-sm btn-surface" href="${escapeHtml(project.repo_url)}" target="_blank" rel="noopener noreferrer">View on GitHub ↗</a>`
      : '';

    const liveLink = project.live_url
      ? `<a class="btn btn-sm btn-primary" href="${escapeHtml(project.live_url)}">Open Live Demo ↗</a>`
      : '';

    modalBody.innerHTML = `
      ${placeholderNote}
      <div class="project-schematic" style="border: var(--border-width) solid var(--border-color);">
        ${getSchematicSvg(project.schematic)}
      </div>
      <div>
        <span class="eyebrow">Role &amp; Impact</span>
        <p style="margin-top: 0.35rem;"><strong>${escapeHtml(project.role)}</strong> — ${escapeHtml(project.impact)}</p>
      </div>
      <div>
        <span class="eyebrow">Problem</span>
        <p style="margin-top: 0.35rem;">${escapeHtml(project.problem)}</p>
      </div>
      <div>
        <span class="eyebrow">Architecture &amp; Solution</span>
        <p style="margin-top: 0.35rem;">${escapeHtml(project.solution)}</p>
      </div>
      <div>
        <span class="eyebrow">Tech Stack</span>
        <ul class="tag-list" style="margin-top: 0.5rem;">
          ${project.stack.map((tech) => `<li class="nb-tag nb-tag--sky">${escapeHtml(tech)}</li>`).join('')}
        </ul>
      </div>
      <div class="project-card-actions" style="padding-top: 1rem;">
        ${liveLink}
        ${repoLink}
      </div>
    `;

    modalBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  function closeProjectModal() {
    if (!modalBackdrop || modalBackdrop.hidden) return;
    modalBackdrop.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') {
      lastFocusedTrigger.focus();
    }
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter || 'all';
      filterBtns.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle('is-active', isActive);
        b.setAttribute('aria-pressed', String(isActive));
      });
      renderProjects();
    });
  });

  gridEl.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-project]');
    if (!trigger) return;
    openProjectModal(trigger.dataset.openProject, trigger);
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProjectModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (event) => {
      if (event.target === modalBackdrop) {
        closeProjectModal();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalBackdrop && !modalBackdrop.hidden) {
      closeProjectModal();
    }
  });

  fetch('./data/projects_data.json')
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((projects) => {
      allProjects = projects;
      renderProjects();

      // If URL has a hash matching a project id, scroll cleanly to it.
      if (window.location.hash) {
        const target = document.getElementById(window.location.hash.slice(1));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    })
    .catch((error) => {
      console.error('Error loading projects data:', error);
      gridEl.innerHTML = '<div class="nb-card"><p>Could not load projects catalog.</p></div>';
    });
});
