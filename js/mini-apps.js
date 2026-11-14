/**
 * Interactive Case Study Mini-Apps (Pure Vanilla ES6+ JS)
 * 1. JMF Survey: Live Colleague Disambiguation & N×N Matrix Generator (#jmf-mini-app)
 * 2. Family Captions: Multi-User Light-Table & Transactional Edit History (#family-mini-app)
 * 3. MLPP Glossary: Drupal Views HTML Tag Cleanup & Translation % Auditor (#mlpp-mini-app)
 */
document.addEventListener('DOMContentLoaded', () => {
  const { escapeHtml } = window.PortfolioUtils;

  const notify = (msg) => {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    }
  };

  /* ========================================================================
     1. JMF SURVEY MINI-APP: Peer Selector + Live N×N Matrix Sandbox
     ======================================================================== */
  const jmfRoot = document.getElementById('jmf-mini-app');
  if (jmfRoot) {
    const ROSTER = [
      { id: 0, code: 'ML', name: 'Maria Lopez', dept: 'Logistics', branch: 'North Hub' },
      { id: 1, code: 'CM', name: 'Carlos Mendez', dept: 'Field Ops', branch: 'Central' },
      { id: 2, code: 'AL', name: 'Ana Lucia', dept: 'Finance', branch: 'HQ' },
      { id: 3, code: 'DM', name: 'Diego Morales', dept: 'IT Systems', branch: 'HQ' },
      { id: 4, code: 'SP', name: 'Sofia Perez', dept: 'HR Ops', branch: 'South' },
    ];

    const WEIGHTS = [5, 4, 3];
    const normalizeText = (txt) =>
      String(txt || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    // Pre-seeded realistic cohort selections (array of nominated colleague IDs in rank order)
    const state = {
      respondentId: 1,
      searchQuery: '',
      nominations: {
        0: [1, 2, 4],
        1: [0, 3],
        2: [3, 0, 1],
        3: [1, 2],
        4: [0, 2, 3],
      },
    };

    const respondentSelect = document.getElementById('jmf-respondent-select');
    const searchInput = document.getElementById('jmf-roster-search');
    const rosterGrid = document.getElementById('jmf-roster-grid');
    const selectionChips = document.getElementById('jmf-selection-chips');
    const matrixWrap = document.getElementById('jmf-matrix-wrap');
    const resetBtn = document.getElementById('jmf-reset-btn');
    const exportBtn = document.getElementById('jmf-export-csv-btn');

    const renderJmf = () => {
      const currentNominees = state.nominations[state.respondentId] || [];
      const terms = normalizeText(state.searchQuery).trim().split(/\s+/).filter(Boolean);

      const visibleRoster = ROSTER.filter((person) => {
        if (!terms.length) return true;
        const haystack = normalizeText(`${person.name} ${person.dept} ${person.branch}`);
        return terms.every((t) => haystack.includes(t));
      });

      if (rosterGrid) {
        if (!visibleRoster.length) {
          rosterGrid.innerHTML = `<p style="font-size: var(--text-sm);">No colleagues matched "${escapeHtml(state.searchQuery)}".</p>`;
        } else {
          rosterGrid.innerHTML = visibleRoster
            .map((person) => {
              const isSelf = person.id === state.respondentId;
              const rankIdx = currentNominees.indexOf(person.id);
              const isSelected = rankIdx !== -1;
              const weight = isSelected ? WEIGHTS[rankIdx] : null;

              const badgeText = isSelf
                ? 'SELF (BLOCKED)'
                : isSelected
                ? `#${rankIdx + 1} · WT ${weight}`
                : 'SELECT';

              return `
                <button
                  type="button"
                  class="roster-card-btn${isSelected ? ' is-selected' : ''}"
                  data-nominee-id="${person.id}"
                  ${isSelf ? 'disabled aria-disabled="true"' : ''}
                >
                  <span class="roster-avatar" aria-hidden="true">${escapeHtml(person.code)}</span>
                  <span class="roster-meta">
                    <strong>${escapeHtml(person.name)}</strong>
                    <small>${escapeHtml(person.dept)} · ${escapeHtml(person.branch)}</small>
                  </span>
                  <span class="weight-chip">${badgeText}</span>
                </button>
              `;
            })
            .join('');
        }
      }

      if (selectionChips) {
        if (!currentNominees.length) {
          selectionChips.innerHTML =
            '<span class="eyebrow">No peers selected yet — click up to 3 cards above.</span>';
        } else {
          selectionChips.innerHTML = currentNominees
            .map((id, idx) => {
              const p = ROSTER[id];
              return `<span class="nb-tag nb-tag--amber">#${idx + 1}: ${escapeHtml(
                p.code
              )} (Wt ${WEIGHTS[idx]})</span>`;
            })
            .join('');
        }
      }

      if (matrixWrap) {
        const headerCols = ROSTER.map((col) => `<th scope="col">${escapeHtml(col.code)}</th>`).join('');
        const bodyRows = ROSTER.map((rowPerson) => {
          const isActiveRow = rowPerson.id === state.respondentId;
          const picks = state.nominations[rowPerson.id] || [];

          const cells = ROSTER.map((colPerson) => {
            if (rowPerson.id === colPerson.id) {
              return `<td class="matrix-cell-diag">0</td>`;
            }
            const idx = picks.indexOf(colPerson.id);
            const val = idx !== -1 ? WEIGHTS[idx] : 0;
            return `<td class="${val > 0 ? 'matrix-cell-nonzero' : ''}">${val}</td>`;
          }).join('');

          return `
            <tr class="${isActiveRow ? 'matrix-row-active' : ''}">
              <th scope="row">${escapeHtml(rowPerson.code)}${isActiveRow ? ' ★' : ''}</th>
              ${cells}
            </tr>
          `;
        }).join('');

        matrixWrap.innerHTML = `
          <table class="matrix-table" aria-label="Live weighted N by N sociometric adjacency matrix">
            <thead>
              <tr>
                <th scope="col">From \\ To</th>
                ${headerCols}
              </tr>
            </thead>
            <tbody>${bodyRows}</tbody>
          </table>
        `;
      }
    };

    if (respondentSelect) {
      respondentSelect.innerHTML = ROSTER.map(
        (p) => `<option value="${p.id}">${escapeHtml(p.name)} (${escapeHtml(p.branch)})</option>`
      ).join('');
      respondentSelect.value = String(state.respondentId);
      respondentSelect.addEventListener('change', (e) => {
        state.respondentId = Number(e.target.value);
        renderJmf();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderJmf();
      });
    }

    if (rosterGrid) {
      rosterGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-nominee-id]');
        if (!btn || btn.disabled) return;
        const nomineeId = Number(btn.dataset.nomineeId);
        if (nomineeId === state.respondentId) return;

        const list = state.nominations[state.respondentId] || [];
        const existingIdx = list.indexOf(nomineeId);

        if (existingIdx !== -1) {
          list.splice(existingIdx, 1);
        } else {
          if (list.length >= WEIGHTS.length) {
            notify(`Max ${WEIGHTS.length} ranked picks reached — remove one first.`);
            return;
          }
          list.push(nomineeId);
        }
        state.nominations[state.respondentId] = list;
        renderJmf();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.nominations[state.respondentId] = [];
        state.searchQuery = '';
        if (searchInput) searchInput.value = '';
        renderJmf();
        notify(`Cleared picks for ${ROSTER[state.respondentId].name}`);
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const header = ['Respondent', ...ROSTER.map((p) => p.name)].join(',');
        const lines = ROSTER.map((rowP) => {
          const picks = state.nominations[rowP.id] || [];
          const vals = ROSTER.map((colP) => {
            if (rowP.id === colP.id) return 0;
            const idx = picks.indexOf(colP.id);
            return idx !== -1 ? WEIGHTS[idx] : 0;
          });
          return [rowP.name, ...vals].join(',');
        });
        const csvContent = [header, ...lines].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'jmf_sna_sample_matrix.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        notify('Exported live N×N adjacency CSV');
      });
    }

    renderJmf();
  }

  /* ========================================================================
     2. FAMILY CAPTIONS MINI-APP: Reunion Light-Table + Audit Trail
     ======================================================================== */
  const familyRoot = document.getElementById('family-mini-app');
  if (familyRoot) {
    const PHOTOS = [
      {
        uuid: '8F3A-102C',
        stem: 'Reunion_Porch_1988',
        taken: 'Jul 1988 · Twin Falls',
        svg: `<svg viewBox="0 0 160 120" fill="none" aria-hidden="true">
          <rect width="160" height="120" fill="#e6dfd1"/>
          <rect x="14" y="20" width="132" height="80" fill="#8ecae6" stroke="#111315" stroke-width="3"/>
          <circle cx="52" cy="54" r="11" fill="#ffb703" stroke="#111315" stroke-width="2.5"/>
          <path d="M32 100C32 82 72 82 72 100" fill="#fb8500" stroke="#111315" stroke-width="2.5"/>
          <circle cx="104" cy="58" r="10" fill="#fffdf8" stroke="#111315" stroke-width="2.5"/>
          <path d="M84 100C84 84 124 84 124 100" fill="#111315"/>
        </svg>`,
      },
      {
        uuid: 'D419-77EA',
        stem: 'Sunday_Tamales_1974',
        taken: 'Dec 1974 · Guatemala',
        svg: `<svg viewBox="0 0 160 120" fill="none" aria-hidden="true">
          <rect width="160" height="120" fill="#fffdf8"/>
          <rect x="16" y="16" width="128" height="88" fill="#ffb703" stroke="#111315" stroke-width="3"/>
          <rect x="34" y="64" width="92" height="40" fill="#e6dfd1" stroke="#111315" stroke-width="2.5"/>
          <circle cx="62" cy="48" r="12" fill="#8ecae6" stroke="#111315" stroke-width="2.5"/>
          <circle cx="98" cy="48" r="12" fill="#fb8500" stroke="#111315" stroke-width="2.5"/>
        </svg>`,
      },
      {
        uuid: '2C08-51BF',
        stem: 'Chevy_Drive_1966',
        taken: 'Aug 1966 · Route 89',
        svg: `<svg viewBox="0 0 160 120" fill="none" aria-hidden="true">
          <rect width="160" height="120" fill="#e6dfd1"/>
          <rect x="14" y="18" width="132" height="84" fill="#fb8500" stroke="#111315" stroke-width="3"/>
          <path d="M24 82L54 50L86 72L118 46L146 82Z" fill="#fffdf8" stroke="#111315" stroke-width="2.5"/>
          <rect x="44" y="78" width="72" height="18" fill="#111315"/>
          <circle cx="58" cy="96" r="7" fill="#8ecae6" stroke="#111315" stroke-width="2"/>
          <circle cx="102" cy="96" r="7" fill="#8ecae6" stroke="#111315" stroke-width="2"/>
        </svg>`,
      },
    ];

    const state = {
      contributor: 'Uncle Bob',
      selectedUuid: '8F3A-102C',
      editingCaptionId: null,
      nextId: 4,
      captions: [
        {
          id: 1,
          photoUuid: '8F3A-102C',
          contributor: 'Chris',
          people: 'Grandpa Joe & Aunt Clara',
          place: 'Twin Falls Front Porch, 1988',
          confidence: 'pretty sure',
          story: 'Taken right after the July 4th picnic before everyone drove home.',
          updatedAt: 'v1 initial',
        },
        {
          id: 2,
          photoUuid: 'D419-77EA',
          contributor: 'Aunt Elena',
          people: 'Abuela Sofia & Mom',
          place: 'Zone 1 Kitchen',
          confidence: 'just guessing',
          story: 'Looks like Christmas Eve morning wrapping corn husks.',
          updatedAt: 'v1 initial',
        },
      ],
      history: [],
    };

    const contributorSelect = document.getElementById('family-contributor-select');
    const lightTableEl = document.getElementById('family-lighttable');
    const existingCaptionsEl = document.getElementById('family-existing-captions');
    const historyLogEl = document.getElementById('family-history-log');
    const sidecarPreEl = document.getElementById('family-sidecar-preview');
    const formEl = document.getElementById('family-caption-form');
    const peopleInput = document.getElementById('family-people-input');
    const placeInput = document.getElementById('family-place-input');
    const confSelect = document.getElementById('family-confidence-select');
    const storyInput = document.getElementById('family-story-input');
    const submitBtn = document.getElementById('family-submit-btn');
    const cancelEditBtn = document.getElementById('family-cancel-edit-btn');

    const renderFamily = () => {
      const photo = PHOTOS.find((p) => p.uuid === state.selectedUuid) || PHOTOS[0];
      const photoCaptions = state.captions.filter((c) => c.photoUuid === photo.uuid);
      const photoHistory = state.history.filter((h) => h.photoUuid === photo.uuid);

      if (lightTableEl) {
        lightTableEl.innerHTML = PHOTOS.map((item) => {
          const count = state.captions.filter((c) => c.photoUuid === item.uuid).length;
          const isActive = item.uuid === state.selectedUuid;
          return `
            <button
              type="button"
              class="lighttable-card${isActive ? ' is-active' : ''}"
              data-photo-uuid="${escapeHtml(item.uuid)}"
            >
              <div class="lighttable-art">${item.svg}</div>
              <strong style="font-size: var(--text-xs);">${escapeHtml(item.stem)}</strong>
              <small style="font-family: var(--font-mono); font-size: 0.68rem;">
                ${count} ${count === 1 ? 'Note' : 'Notes'} · ${escapeHtml(item.uuid)}
              </small>
            </button>
          `;
        }).join('');
      }

      if (existingCaptionsEl) {
        if (!photoCaptions.length) {
          existingCaptionsEl.innerHTML =
            '<div class="history-item">No relative notes logged yet. Be the first contributor below.</div>';
        } else {
          existingCaptionsEl.innerHTML = photoCaptions
            .map((cap) => {
              const isOwn = cap.contributor === state.contributor;
              return `
                <article class="history-item">
                  <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                    <strong>${escapeHtml(cap.contributor)} · <code>${escapeHtml(cap.confidence)}</code></strong>
                    <span style="font-family: var(--font-mono);">${escapeHtml(cap.updatedAt)}</span>
                  </div>
                  <div><strong>People:</strong> ${escapeHtml(cap.people || '—')} · <strong>Place:</strong> ${escapeHtml(cap.place || '—')}</div>
                  <p style="font-size: var(--text-xs);">${escapeHtml(cap.story)}</p>
                  ${
                    isOwn
                      ? `<button type="button" class="btn btn-sm btn-surface" data-edit-caption-id="${cap.id}" style="width: fit-content; margin-top: 0.25rem;">Edit Own Note (Triggers Audit Tx)</button>`
                      : ''
                  }
                </article>
              `;
            })
            .join('');
        }
      }

      if (historyLogEl) {
        if (!photoHistory.length) {
          historyLogEl.innerHTML =
            '<div class="history-item">No overwrites logged yet. Edit one of your own notes to trigger an atomic <code>caption_history</code> snapshot.</div>';
        } else {
          historyLogEl.innerHTML = photoHistory
            .map(
              (entry) => `
                <div class="history-item history-item--audit">
                  <strong>ARCHIVED ${escapeHtml(entry.snapshotVersion)} · ${escapeHtml(entry.contributor)}</strong>
                  <span>Old Story: "${escapeHtml(entry.story)}" (${escapeHtml(entry.people)})</span>
                </div>
              `
            )
            .join('');
        }
      }

      if (sidecarPreEl) {
        const lines = [
          `FILE: ${photo.stem}_${photo.uuid.toLowerCase()}.jpg`,
          `UUID: ${photo.uuid}`,
          `DATE_EST: ${photo.taken}`,
          `--- CONTRIBUTOR STORIES (${photoCaptions.length}) ---`,
          ...(photoCaptions.length
            ? photoCaptions.map(
                (c, i) =>
                  `[${i + 1}] ${c.contributor} (${c.confidence}) | People: ${c.people || 'N/A'}\n    "${c.story}"`
              )
            : ['(No stories recorded yet)']),
        ];
        sidecarPreEl.textContent = lines.join('\n');
      }

      if (submitBtn) {
        submitBtn.textContent = state.editingCaptionId
          ? 'Update Note (Commit Audit Tx) →'
          : `Save Note as ${state.contributor} →`;
      }
      if (cancelEditBtn) {
        cancelEditBtn.hidden = !state.editingCaptionId;
      }
    };

    if (contributorSelect) {
      contributorSelect.addEventListener('change', (e) => {
        state.contributor = e.target.value;
        state.editingCaptionId = null;
        if (formEl) formEl.reset();
        renderFamily();
      });
    }

    if (lightTableEl) {
      lightTableEl.addEventListener('click', (e) => {
        const card = e.target.closest('[data-photo-uuid]');
        if (!card) return;
        state.selectedUuid = card.dataset.photoUuid;
        state.editingCaptionId = null;
        if (formEl) formEl.reset();
        renderFamily();
      });
    }

    if (existingCaptionsEl) {
      existingCaptionsEl.addEventListener('click', (e) => {
        const editBtn = e.target.closest('[data-edit-caption-id]');
        if (!editBtn) return;
        const id = Number(editBtn.dataset.editCaptionId);
        const cap = state.captions.find((c) => c.id === id);
        if (!cap) return;
        state.editingCaptionId = id;
        if (peopleInput) peopleInput.value = cap.people;
        if (placeInput) placeInput.value = cap.place;
        if (confSelect) confSelect.value = cap.confidence;
        if (storyInput) storyInput.value = cap.story;
        renderFamily();
        if (storyInput) storyInput.focus();
      });
    }

    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        state.editingCaptionId = null;
        if (formEl) formEl.reset();
        renderFamily();
      });
    }

    if (formEl) {
      formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const story = (storyInput?.value || '').trim();
        if (!story) {
          notify('Write a quick memory before saving.');
          return;
        }

        const people = (peopleInput?.value || '').trim() || 'Family members';
        const place = (placeInput?.value || '').trim() || 'Family Reunion';
        const confidence = confSelect?.value || 'pretty sure';

        if (state.editingCaptionId) {
          const existing = state.captions.find((c) => c.id === state.editingCaptionId);
          if (existing) {
            state.history.unshift({
              photoUuid: existing.photoUuid,
              contributor: existing.contributor,
              people: existing.people,
              story: existing.story,
              snapshotVersion: existing.updatedAt,
            });
            existing.people = people;
            existing.place = place;
            existing.confidence = confidence;
            existing.story = story;
            existing.updatedAt = `v${state.history.length + 1} updated`;
            notify('Previous version preserved in caption_history');
          }
          state.editingCaptionId = null;
        } else {
          state.captions.push({
            id: state.nextId++,
            photoUuid: state.selectedUuid,
            contributor: state.contributor,
            people,
            place,
            confidence,
            story,
            updatedAt: 'v1 initial',
          });
          notify(`Saved note from ${state.contributor}`);
        }

        formEl.reset();
        renderFamily();
      });
    }

    renderFamily();
  }

  /* ========================================================================
     3. MLPP GLOSSARY MINI-APP: Views Bulk Operations & HTML Tag Auditor
     ======================================================================== */
  const mlppRoot = document.getElementById('mlpp-mini-app');
  if (mlppRoot) {
    const GLOSSARY_ROWS = [
      {
        id: 1,
        language: "Q'eqchi'",
        term: 'Haʼ',
        english: 'Water',
        hasAudio: true,
        rawHtml: '<p><br>&nbsp;</p>',
        cleanHtml: 'Haʼ (Water) — Natural noun',
        isTranslated: true,
      },
      {
        id: 2,
        language: "Q'eqchi'",
        term: 'Chʼochʼ',
        english: 'Earth / Land',
        hasAudio: true,
        rawHtml: 'Chʼochʼ (Earth)',
        cleanHtml: 'Chʼochʼ (Earth)',
        isTranslated: true,
      },
      {
        id: 3,
        language: 'Kaqchikel',
        term: 'Qʼij',
        english: 'Sun / Day',
        hasAudio: true,
        rawHtml: '<span class="legacy-empty"></span><p>&nbsp;</p>',
        cleanHtml: 'Qʼij (Sun / Day)',
        isTranslated: true,
      },
      {
        id: 4,
        language: 'Kaqchikel',
        term: 'Tzij',
        english: 'Word',
        hasAudio: false,
        rawHtml: '<div><br></div>',
        cleanHtml: '',
        isTranslated: false,
      },
      {
        id: 5,
        language: "K'iche'",
        term: 'Wuj',
        english: 'Book / Paper',
        hasAudio: true,
        rawHtml: 'Wuj (Book)',
        cleanHtml: 'Wuj (Book)',
        isTranslated: true,
      },
      {
        id: 6,
        language: "K'iche'",
        term: 'Atinik',
        english: 'To speak',
        hasAudio: true,
        rawHtml: '<p></p>',
        cleanHtml: 'Atinik (To speak)',
        isTranslated: true,
      },
    ];

    const state = {
      isCleaned: false,
      languageFilter: 'all',
      selectedRowId: 1,
    };

    const langBtns = Array.from(document.querySelectorAll('[data-mlpp-lang]'));
    const runCleanupBtn = document.getElementById('mlpp-run-cleanup-btn');
    const resetDirtyBtn = document.getElementById('mlpp-reset-dirty-btn');
    const kpiStatusEl = document.getElementById('mlpp-kpi-status');
    const kpiTranslationEl = document.getElementById('mlpp-kpi-translation');
    const kpiMediaEl = document.getElementById('mlpp-kpi-media');
    const translationBarEl = document.getElementById('mlpp-translation-bar');
    const tableBodyEl = document.getElementById('mlpp-audit-tbody');
    const diffInspectorEl = document.getElementById('mlpp-diff-inspector');

    const hasEmptyTagDefect = (raw) => /^(\s*<[^>]+>\s*|&nbsp;)+$/i.test(raw);

    const renderMlpp = () => {
      const subset =
        state.languageFilter === 'all'
          ? GLOSSARY_ROWS
          : GLOSSARY_ROWS.filter((r) => r.language === state.languageFilter);

      const brokenRows = subset.filter((r) => !state.isCleaned && hasEmptyTagDefect(r.rawHtml));
      const translatedCount = subset.filter((r) => r.isTranslated).length;
      const mediaCount = subset.filter((r) => r.hasAudio).length;

      const translationPct = subset.length
        ? Math.round((translatedCount / subset.length) * 100)
        : 0;
      const mediaPct = subset.length ? Math.round((mediaCount / subset.length) * 100) : 0;

      if (kpiStatusEl) {
        kpiStatusEl.textContent = brokenRows.length
          ? `BLOCKED (${brokenRows.length} Dirty HTML Nodes)`
          : 'HEALTHY (Views Audited)';
      }

      if (kpiTranslationEl) {
        kpiTranslationEl.textContent = brokenRows.length ? '-- (Blank)' : `${translationPct}%`;
      }

      if (kpiMediaEl) {
        kpiMediaEl.textContent = brokenRows.length ? '-- (Blank)' : `${mediaPct}%`;
      }

      if (translationBarEl) {
        translationBarEl.style.width = brokenRows.length ? '12%' : `${translationPct}%`;
        translationBarEl.classList.toggle('progress-meter-fill--error', brokenRows.length > 0);
      }

      if (tableBodyEl) {
        tableBodyEl.innerHTML = subset
          .map((row) => {
            const dirty = !state.isCleaned && hasEmptyTagDefect(row.rawHtml);
            const active = row.id === state.selectedRowId;
            return `
              <tr style="${active ? 'background: var(--bg-muted);' : ''}">
                <td><strong>${escapeHtml(row.term)}</strong> <small>(${escapeHtml(row.language)})</small></td>
                <td><code>${escapeHtml(state.isCleaned ? row.cleanHtml || '(Pending)' : row.rawHtml)}</code></td>
                <td>
                  <span class="nb-tag ${dirty ? 'audit-pill-dirty' : 'audit-pill-ok'}">
                    ${dirty ? 'Blank / Empty Tags' : row.isTranslated ? '100% Audited' : 'Untranslated'}
                  </span>
                </td>
                <td>
                  <button type="button" class="btn btn-sm btn-surface" data-inspect-mlpp="${row.id}">
                    Inspect Diff
                  </button>
                </td>
              </tr>
            `;
          })
          .join('');
      }

      if (diffInspectorEl) {
        const picked = GLOSSARY_ROWS.find((r) => r.id === state.selectedRowId) || subset[0];
        if (picked) {
          diffInspectorEl.textContent = [
            `NODE: ${picked.term} (${picked.language}) · Media: ${picked.hasAudio ? 'Linked' : 'Missing'}`,
            `BEFORE (Legacy Raw Markup): ${picked.rawHtml}`,
            `AFTER  (Views Audit Clean): ${picked.cleanHtml || '(Clean Empty — Correctly Counted as 0%)'}`,
          ].join('\n');
        }
      }
    };

    langBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.languageFilter = btn.dataset.mlppLang || 'all';
        langBtns.forEach((b) => {
          const isActive = b === btn;
          b.classList.toggle('is-active', isActive);
          b.setAttribute('aria-pressed', String(isActive));
        });
        renderMlpp();
      });
    });

    if (runCleanupBtn) {
      runCleanupBtn.addEventListener('click', () => {
        state.isCleaned = true;
        renderMlpp();
        notify('Views Bulk Cleanup complete — reporting percentages restored!');
      });
    }

    if (resetDirtyBtn) {
      resetDirtyBtn.addEventListener('click', () => {
        state.isCleaned = false;
        renderMlpp();
        notify('Restored raw breaking empty HTML state');
      });
    }

    if (tableBodyEl) {
      tableBodyEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-inspect-mlpp]');
        if (!btn) return;
        state.selectedRowId = Number(btn.dataset.inspectMlpp);
        renderMlpp();
      });
    }

    renderMlpp();
  }

  /* ========================================================================
     4. BEENIGHT MINI-APP: Dual-Surface TV Broadcast + Mobile Host + Web Audio
     ======================================================================== */
  const beeRoot = document.getElementById('beenight-mini-app');
  if (beeRoot) {
    const WORDS = [
      {
        word: 'SERENDIPITY',
        phonetic: '/ˌser.ənˈdɪp.ɪ.ti/',
        difficulty: 'Tier 2 · 150 pts',
        definition: 'Finding valuable or delightful things unexpectedly.',
      },
      {
        word: 'SILHOUETTE',
        phonetic: '/ˌsɪl.uˈet/',
        difficulty: 'Tier 2 · 150 pts',
        definition: 'Dark outline of someone seen against a bright backdrop.',
      },
      {
        word: 'ONOMATOPOEIA',
        phonetic: '/ˌɒn.əˌmæt.əˈpiː.ə/',
        difficulty: 'Tier 3 · 250 pts',
        definition: 'A word phonetically imitating the sound it names.',
      },
      {
        word: 'PHARAOH',
        phonetic: '/ˈfeə.rəʊ/',
        difficulty: 'Tier 1 · 100 pts',
        definition: 'Ruler in ancient Egypt.',
      },
    ];

    const createInitialPlayers = () => [
      { id: 0, name: 'Eliza', bio: 'Broadway & theater trivia buff', score: 300, streak: 2 },
      { id: 1, name: 'Chris', bio: 'Reunion storyteller & host ally', score: 250, streak: 1 },
      { id: 2, name: 'Mateo', bio: 'Quick-draw underdog', score: 150, streak: 1 },
      { id: 3, name: 'Hannah', bio: 'Calm final-round strategist', score: 100, streak: 0 },
    ];

    const state = {
      stage: 'ACTIVE_TURN',
      turnIdx: 0,
      wordIdx: 0,
      hintsRevealed: 1,
      lightBroadcast: false,
      audioUnlocked: false,
      lastEvent: 'state:sync (BroadcastChannel <5ms)',
      players: createInitialPlayers(),
    };

    let audioCtx = null;
    const playTone = (type) => {
      try {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) return;
        if (!audioCtx) audioCtx = new AudioCtor();
        if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
        const now = audioCtx.currentTime;

        if (type === 'correct') {
          [523.25, 659.25, 783.99, 987.77, 1046.5].forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            const start = now + idx * 0.065;
            const dur = idx === 4 ? 0.45 : 0.2;
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.001, start);
            gain.gain.exponentialRampToValueAtTime(0.14, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(start);
            osc.stop(start + dur);
          });
        } else {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(165, now);
          osc.frequency.linearRampToValueAtTime(115, now + 0.28);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.3);
        }
        state.audioUnlocked = true;
      } catch {}
    };

    const stageBtns = Array.from(document.querySelectorAll('[data-bee-stage]'));
    const tvThemeBtn = document.getElementById('beenight-tv-theme-btn');
    const resetBtn = document.getElementById('beenight-reset-btn');
    const syncBadge = document.getElementById('beenight-sync-badge');
    const hostPane = document.getElementById('beenight-host-pane');
    const tvPane = document.getElementById('beenight-tv-pane');

    const renderBeeNight = () => {
      const currentPlayer = state.players[state.turnIdx % state.players.length];
      const currentWord = WORDS[state.wordIdx % WORDS.length];
      const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);

      stageBtns.forEach((btn) => {
        const isActive = btn.dataset.beeStage === state.stage;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });

      if (syncBadge) {
        syncBadge.textContent = state.lastEvent;
      }

      if (hostPane) {
        let stageControls = '';
        if (state.stage === 'LOBBY') {
          stageControls = `
            <div class="bee-host-card">
              <span class="eyebrow">LOBBY CONTESTANT PRESENTATION MODE</span>
              <p style="font-size: var(--text-sm);">Spotlighted on TV: <strong>${escapeHtml(currentPlayer.name)}</strong> — ${escapeHtml(currentPlayer.bio)}</p>
              <div class="hero-cta-group" style="margin-top: 0;">
                <button type="button" class="btn btn-sm btn-surface" data-bee-action="next-bio">Next Contestant Intro</button>
                <button type="button" class="btn btn-sm btn-primary" data-bee-action="start-turn">Start Turn (ACTIVE_TURN) →</button>
              </div>
            </div>
          `;
        } else if (state.stage === 'ACTIVE_TURN') {
          stageControls = `
            <div class="bee-host-card">
              <span class="eyebrow">PRIVATE TELEPROMPTER (HIDDEN FROM TV)</span>
              <div style="display: flex; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; align-items: baseline;">
                <strong style="font-size: 1.2rem; font-family: var(--font-mono);">${escapeHtml(currentWord.word)}</strong>
                <span class="nb-tag nb-tag--amber">${escapeHtml(currentWord.difficulty)}</span>
              </div>
              <p style="font-size: var(--text-xs);"><strong>Phonetic:</strong> <code>${escapeHtml(currentWord.phonetic)}</code></p>
              <p style="font-size: var(--text-xs);"><strong>Def:</strong> ${escapeHtml(currentWord.definition)}</p>
            </div>
            <div class="hero-cta-group" style="margin-top: 0;">
              <button type="button" class="btn btn-sm btn-primary" id="bee-correct-btn" data-bee-action="correct">✓ Correct (+150 + Streak)</button>
              <button type="button" class="btn btn-sm btn-accent" id="bee-wrong-btn" data-bee-action="wrong">✕ Wrong</button>
              <button type="button" class="btn btn-sm btn-surface" id="bee-hint-btn" data-bee-action="hint">Reveal Letter (${state.hintsRevealed}/${currentWord.word.length})</button>
              <button type="button" class="btn btn-sm btn-surface" data-bee-action="skip">Skip Turn →</button>
            </div>
          `;
        } else if (state.stage === 'LEADERBOARD') {
          stageControls = `
            <div class="bee-host-card">
              <span class="eyebrow">STANDINGS &amp; ROUND TRANSITION</span>
              <p style="font-size: var(--text-sm);">Up next on deck: <strong>${escapeHtml(state.players[(state.turnIdx + 1) % state.players.length].name)}</strong>.</p>
              <div class="hero-cta-group" style="margin-top: 0;">
                <button type="button" class="btn btn-sm btn-primary" data-bee-action="next-round">Advance Next Speaker →</button>
                <button type="button" class="btn btn-sm btn-secondary" data-bee-action="goto-podium">Open Winners Podium</button>
              </div>
            </div>
          `;
        } else {
          stageControls = `
            <div class="bee-host-card">
              <span class="eyebrow">PODIUM FINALE CONTROLS</span>
              <p style="font-size: var(--text-sm);">Champion in Lead: <strong>${escapeHtml(sortedPlayers[0].name)}</strong> (${sortedPlayers[0].score} pts).</p>
              <div class="hero-cta-group" style="margin-top: 0;">
                <button type="button" class="btn btn-sm btn-primary" data-bee-action="fanfare">🔊 Replay Victory Chime</button>
                <button type="button" class="btn btn-sm btn-surface" data-bee-action="reset">Reset Party Match</button>
              </div>
            </div>
          `;
        }

        hostPane.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <span class="eyebrow">1. MOBILE HOST REMOTE (/host?room=BEE-4821)</span>
            <span class="nb-tag nb-tag--sky">Stage: ${escapeHtml(state.stage)}</span>
          </div>
          <p style="font-size: var(--text-xs);">
            Notice stage-driven decluttering: only controls relevant to <code>${escapeHtml(state.stage)}</code> render. Judging updates the TV screen &amp; synthesizes Web Audio chimes.
          </p>
          ${stageControls}
        `;
      }

      if (tvPane) {
        let tvBody = '';
        if (state.stage === 'LOBBY') {
          tvBody = `
            <div class="bee-spotlight">
              <span class="eyebrow" style="color: #111315;">NOW INTRODUCING ON STAGE</span>
              <h4>${escapeHtml(currentPlayer.name)}</h4>
              <p>${escapeHtml(currentPlayer.bio)}</p>
            </div>
            <p style="font-size: var(--text-xs);">Waiting for Host QR tap to launch round... (${state.players.length} contestants checked in)</p>
          `;
        } else if (state.stage === 'ACTIVE_TURN') {
          const slots = currentWord.word
            .split('')
            .map((ch, idx) => {
              const show = idx < state.hintsRevealed;
              return `<span class="bee-letter-tile">${show ? escapeHtml(ch) : '_'}</span>`;
            })
            .join('');
          tvBody = `
            <div class="bee-spotlight">
              <div style="display: flex; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
                <span class="eyebrow" style="color: #111315;">SPELLING NOW · STREAK ${currentPlayer.streak}</span>
                <strong>${escapeHtml(currentPlayer.name)} (${currentPlayer.score} pts)</strong>
              </div>
              <h4>Listen carefully to the host...</h4>
              <div class="bee-letter-slots" aria-label="Progressive hint tiles">${slots}</div>
            </div>
            <p style="font-size: var(--text-xs);">${escapeHtml(currentWord.difficulty)} · Words solved stay encrypted from contestants until judged.</p>
          `;
        } else if (state.stage === 'LEADERBOARD') {
          tvBody = `
            <div class="bee-standings-list">
              ${sortedPlayers
                .map(
                  (p, i) => `
                  <div class="bee-standing-row${i === 0 ? ' is-leader' : ''}">
                    <span>#${i + 1} ${escapeHtml(p.name)}</span>
                    <span>${p.score} pts · Streak ${p.streak}</span>
                  </div>
                `
                )
                .join('')}
            </div>
          `;
        } else {
          tvBody = `
            <div class="bee-spotlight">
              <span class="eyebrow" style="color: #111315;">HOUSEWARMING CHAMPIONS PODIUM</span>
              <h4>🏆 1st: ${escapeHtml(sortedPlayers[0].name)} — ${sortedPlayers[0].score} pts</h4>
              <p>2nd: ${escapeHtml(sortedPlayers[1].name)} (${sortedPlayers[1].score}) · 3rd: ${escapeHtml(sortedPlayers[2].name)} (${sortedPlayers[2].score})</p>
            </div>
          `;
        }

        tvPane.innerHTML = `
          <div class="bee-tv-stage${state.lightBroadcast ? ' is-light-broadcast' : ''}">
            <div class="bee-tv-top">
              <span class="eyebrow">2. LIVING-ROOM TV STAGE (/tv)</span>
              <span class="nb-tag nb-tag--amber">ROOM: BEE-4821</span>
            </div>
            ${tvBody}
          </div>
        `;
      }
    };

    stageBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.stage = btn.dataset.beeStage || 'ACTIVE_TURN';
        state.lastEvent = `stage:set -> ${state.stage}`;
        renderBeeNight();
      });
    });

    if (tvThemeBtn) {
      tvThemeBtn.addEventListener('click', () => {
        state.lightBroadcast = !state.lightBroadcast;
        tvThemeBtn.textContent = state.lightBroadcast
          ? 'TV Palette: Broadcast Dark'
          : 'TV Palette: Matinee Light';
        state.lastEvent = `config:updateTheme -> ${state.lightBroadcast ? 'Matinee' : 'Broadcast Dark'}`;
        renderBeeNight();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.players = createInitialPlayers();
        state.stage = 'ACTIVE_TURN';
        state.turnIdx = 0;
        state.wordIdx = 0;
        state.hintsRevealed = 1;
        state.lastEvent = 'game:reset -> localStorage restored';
        renderBeeNight();
        notify('BeeNight party room reset cleanly');
      });
    }

    if (hostPane) {
      hostPane.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-bee-action]');
        if (!btn) return;
        const action = btn.dataset.beeAction;
        const player = state.players[state.turnIdx % state.players.length];
        const word = WORDS[state.wordIdx % WORDS.length];

        if (action === 'next-bio') {
          state.turnIdx = (state.turnIdx + 1) % state.players.length;
          state.lastEvent = `lobby:focus -> ${state.players[state.turnIdx].name}`;
        } else if (action === 'start-turn') {
          state.stage = 'ACTIVE_TURN';
          state.hintsRevealed = 1;
          state.lastEvent = 'stage:set -> ACTIVE_TURN';
        } else if (action === 'hint') {
          if (state.hintsRevealed < word.word.length) state.hintsRevealed += 1;
          state.lastEvent = `turn:hintRevealed (${state.hintsRevealed}/${word.word.length})`;
        } else if (action === 'correct') {
          player.streak += 1;
          const pts = 150 + Math.max(0, player.streak - 1) * 50;
          player.score += pts;
          state.wordIdx = (state.wordIdx + 1) % WORDS.length;
          state.stage = 'LEADERBOARD';
          state.hintsRevealed = 1;
          playTone('correct');
          state.lastEvent = `judge:CORRECT (+${pts} pts · Web Audio Chime)`;
          notify(`${player.name} scored +${pts} pts!`);
        } else if (action === 'wrong') {
          player.streak = 0;
          state.wordIdx = (state.wordIdx + 1) % WORDS.length;
          state.stage = 'LEADERBOARD';
          state.hintsRevealed = 1;
          playTone('wrong');
          state.lastEvent = `judge:WRONG (Streak reset · Buzzer SFX)`;
          notify(`${player.name} missed — streak reset`);
        } else if (action === 'skip') {
          state.wordIdx = (state.wordIdx + 1) % WORDS.length;
          state.turnIdx = (state.turnIdx + 1) % state.players.length;
          state.hintsRevealed = 1;
          state.lastEvent = 'turn:skip -> next speaker';
        } else if (action === 'next-round') {
          state.turnIdx = (state.turnIdx + 1) % state.players.length;
          state.stage = 'ACTIVE_TURN';
          state.hintsRevealed = 1;
          state.lastEvent = `turn:advance -> ${state.players[state.turnIdx].name}`;
        } else if (action === 'goto-podium') {
          state.stage = 'PODIUM';
          playTone('correct');
          state.lastEvent = 'stage:PODIUM (Fanfare triggered)';
        } else if (action === 'fanfare') {
          playTone('correct');
          state.lastEvent = 'audio:playCorrectChime (C5->C6)';
        } else if (action === 'reset') {
          state.players = createInitialPlayers();
          state.stage = 'ACTIVE_TURN';
          state.turnIdx = 0;
          state.wordIdx = 0;
          state.hintsRevealed = 1;
          state.lastEvent = 'game:reset -> initial state';
        }
        renderBeeNight();
      });
    }

    renderBeeNight();
  }
});
