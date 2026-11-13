/**
 * Personal Builds Page Controller (personal.html)
 * Loads personal-category projects from projects_data.json and renders interactive cards
 * linking to dedicated case study pages and live personal apps.
 */
document.addEventListener('DOMContentLoaded', () => {
  const { escapeHtml, getSchematicSvg } = window.PortfolioUtils;

  const gridEl = document.getElementById('personal-projects-grid');
  const countEl = document.getElementById('personal-projects-count');

  const modalBackdrop = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('project-modal-close');
  const modalTitle = document.getElementById('project-modal-title');
  const modalMeta = document.getElementById('project-modal-meta');
  const modalBody = document.getElementById('project-modal-body');

  if (!gridEl) return;

  let personalProjects = [];
  let lastFocusedTrigger = null;

  function renderPersonalProjects() {
    if (countEl) {
      countEl.textContent = `${personalProjects.length} Personal Case ${
        personalProjects.length === 1 ? 'Study' : 'Studies'
      }`;
    }

    if (!personalProjects.length) {
      gridEl.innerHTML = `
        <div class="nb-card">
          <h3>No personal projects yet</h3>
          <p>Add an entry with <code>"category": "personal"</code> in <code>data/projects_data.json</code>.</p>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = personalProjects
      .map((project, idx) => {
        const displayIndex = String(idx + 1).padStart(2, '0');
        const caseStudyBtn = project.case_study_url
          ? `<a class="btn btn-sm btn-primary" href="${escapeHtml(project.case_study_url)}">Read Case Study →</a>`
          : '';
        const isExternalLive = project.live_url && project.live_url.startsWith('http');
        const liveBtn = project.live_url
          ? `<a class="btn btn-sm btn-secondary" href="${escapeHtml(project.live_url)}"${
              isExternalLive ? ' target="_blank" rel="noopener noreferrer"' : ''
            }>Live App ↗</a>`
          : '';

        return `
          <article class="nb-card nb-card--interactive project-card" id="${escapeHtml(project.id)}">
            <div class="project-schematic">
              ${getSchematicSvg(project.schematic)}
              <span class="project-index-chip">P-${displayIndex} // Personal</span>
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
                ${caseStudyBtn}
                ${liveBtn}
                <button
                  type="button"
                  class="btn btn-sm btn-surface"
                  data-open-project="${escapeHtml(project.id)}"
                >
                  Quick Summary
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  function openModal(projectId, triggerEl) {
    const project = personalProjects.find((p) => p.id === projectId);
    if (!project || !modalBackdrop) return;

    lastFocusedTrigger = triggerEl || document.activeElement;
    modalTitle.textContent = project.title;
    modalMeta.textContent = `Personal Build · ${project.year}`;

    const fullStudyLink = project.case_study_url
      ? `<a class="btn btn-sm btn-primary" href="${escapeHtml(project.case_study_url)}">Open Full Case Study →</a>`
      : '';
    const isExternalLive = project.live_url && project.live_url.startsWith('http');
    const liveLink = project.live_url
      ? `<a class="btn btn-sm btn-secondary" href="${escapeHtml(project.live_url)}"${
          isExternalLive ? ' target="_blank" rel="noopener noreferrer"' : ''
        }>Launch Live App ↗</a>`
      : '';

    modalBody.innerHTML = `
      <div class="project-schematic" style="border: var(--border-width) solid var(--border-color);">
        ${getSchematicSvg(project.schematic)}
      </div>
      <div>
        <span class="eyebrow">Role &amp; Outcome</span>
        <p style="margin-top: 0.35rem;"><strong>${escapeHtml(project.role)}</strong> — ${escapeHtml(project.impact)}</p>
      </div>
      <div>
        <span class="eyebrow">Motivation</span>
        <p style="margin-top: 0.35rem;">${escapeHtml(project.problem)}</p>
      </div>
      <div>
        <span class="eyebrow">Built From Scratch</span>
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
      </div>
    `;

    modalBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  function closeModal() {
    if (!modalBackdrop || modalBackdrop.hidden) return;
    modalBackdrop.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') {
      lastFocusedTrigger.focus();
    }
  }

  gridEl.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-project]');
    if (!trigger) return;
    openModal(trigger.dataset.openProject, trigger);
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (event) => {
      if (event.target === modalBackdrop) closeModal();
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalBackdrop && !modalBackdrop.hidden) closeModal();
  });

  fetch('./data/projects_data.json')
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((projects) => {
      personalProjects = projects.filter((p) => p.category === 'personal');
      renderPersonalProjects();
    })
    .catch((err) => {
      console.error('Error loading personal builds:', err);
      gridEl.innerHTML = '<div class="nb-card"><p>Could not load personal builds right now.</p></div>';
    });
});
