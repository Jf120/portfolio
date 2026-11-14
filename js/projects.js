/**
 * Projects Page Controller (projects.html)
 * Unified catalog loading projects_data.json, handling category filters, and Quick Spec modals.
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
          <p>Try selecting another category filter to view engineering and personal work.</p>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = filtered
      .map((project) => {
        const caseStudyLabel = project.has_interactive_demo
          ? 'Case Study + Mini-App →'
          : 'Full Case Study →';

        const caseStudyPageBtn = project.case_study_url
          ? `<a class="btn btn-sm btn-primary" href="${escapeHtml(project.case_study_url)}">${caseStudyLabel}</a>`
          : '';

        const repoButton = project.repo_url
          ? `<a class="btn btn-sm btn-surface" href="${escapeHtml(project.repo_url)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`
          : project.repo_label
          ? `<span class="nb-tag nb-tag--private">${escapeHtml(project.repo_label)}</span>`
          : '';

        const isExternalLive = project.live_url && project.live_url.startsWith('http');
        const liveButton = project.live_url
          ? `<a class="btn btn-sm btn-secondary" href="${escapeHtml(project.live_url)}"${
              isExternalLive ? ' target="_blank" rel="noopener noreferrer"' : ''
            }>Live View ↗</a>`
          : '';

        return `
          <article class="nb-card nb-card--interactive project-card" id="${escapeHtml(project.id)}">
            <div class="project-schematic">
              ${getSchematicSvg(project.schematic)}
              <span class="project-index-chip">${escapeHtml(project.index)} // ${escapeHtml(project.category_label)}</span>
              <span class="project-status-chip nb-tag nb-tag--amber">${escapeHtml(project.status)}</span>
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
                ${caseStudyPageBtn}
                <button
                  type="button"
                  class="btn btn-sm ${project.case_study_url ? 'btn-surface' : 'btn-primary'}"
                  data-open-project="${escapeHtml(project.id)}"
                >
                  Quick Spec
                </button>
                ${liveButton}
                ${repoButton}
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

    const fullStudyLink = project.case_study_url
      ? `<a class="btn btn-sm btn-primary" href="${escapeHtml(project.case_study_url)}">${
          project.has_interactive_demo ? 'Open Case Study + Mini-App →' : 'Open Full Case Study →'
        }</a>`
      : '';

    const repoLink = project.repo_url
      ? `<a class="btn btn-sm btn-surface" href="${escapeHtml(project.repo_url)}" target="_blank" rel="noopener noreferrer">View Source on GitHub ↗</a>`
      : project.repo_label
      ? `<span class="nb-tag nb-tag--private">${escapeHtml(project.repo_label)}</span>`
      : '';

    const isExternalLive = project.live_url && project.live_url.startsWith('http');
    const liveLink = project.live_url
      ? `<a class="btn btn-sm btn-secondary" href="${escapeHtml(project.live_url)}"${
          isExternalLive ? ' target="_blank" rel="noopener noreferrer"' : ''
        }>Open Live View ↗</a>`
      : '';

    modalBody.innerHTML = `
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
        ${fullStudyLink}
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

  const initialCategory = new URLSearchParams(window.location.search).get('category');
  if (
    initialCategory &&
    filterBtns.some((btn) => btn.dataset.filter === initialCategory)
  ) {
    activeFilter = initialCategory;
    filterBtns.forEach((b) => {
      const isActive = b.dataset.filter === activeFilter;
      b.classList.toggle('is-active', isActive);
      b.setAttribute('aria-pressed', String(isActive));
    });
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
      allProjects = projects.filter((p) => !p.is_placeholder);
      renderProjects();

      if (window.location.hash) {
        const target = document.getElementById(window.location.hash.slice(1));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    })
    .catch((error) => {
      console.error('Failed to load projects_data.json:', error);
      if (countEl) countEl.textContent = 'Unavailable';
      gridEl.innerHTML = `
        <div class="nb-card">
          <h3>Projects could not be loaded</h3>
          <p>Check that <code>data/projects_data.json</code> is present cleanly on this host.</p>
        </div>
      `;
    });
});
