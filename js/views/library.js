import { EXERCISES, EXERCISE_MAP, AREAS, CATEGORIES, GRADES } from '../data/exercises.js';
import { CONDITIONS } from '../data/conditions.js';
import { REFERENCES, shortCite } from '../data/references.js';
import { PHASES } from '../data/conditions.js';
import { doseFor, doseLabel, tempoLabel, estimateSeconds, restSeconds, dayKey } from '../engine.js';
import { store } from '../store.js';
import { esc, icon, fmtMinutes } from '../ui.js';
import { startPlayer } from '../player.js';

const AREA_ICON = { foot: 'foot', ankle: 'target', calf: 'layers', knee: 'gauge', hip: 'run', core: 'shield' };

export function exBadge(ex, lg = false) {
  return `<div class="badge ${lg ? 'lg' : ''}" style="--h:${AREAS[ex.area].hue}">${icon(AREA_ICON[ex.area], lg ? 26 : 22)}</div>`;
}

export function gradeTag(g) {
  return `<span class="tag grade grade-${g}" title="${esc(GRADES[g].text)}">Evidence ${g} · ${GRADES[g].label}</span>`;
}

export function refItem(r) {
  return `<a class="ref" href="${r.url}" target="_blank" rel="noopener">
    <div class="t">${esc(r.title)} ${icon('external', 13)}</div>
    <div class="m">${esc(r.authors)} · ${esc(r.journal)} ${r.year} · ${esc(r.type)}</div>
    <div class="f">${esc(r.finding)}</div></a>`;
}

/** Full instructions block — used on the detail page and inside the player. */
export function exerciseInfoHTML(ex, phase = 1, { compact = false } = {}) {
  const cur = doseFor(ex, phase);
  return `
    ${compact ? `<div class="ex-head">${exBadge(ex, true)}<div><h1 style="font-size:22px">${esc(ex.name)}</h1><div class="ex-sub">${esc(ex.subtitle)}</div></div></div>` : ''}
    <p class="lead">${esc(ex.summary)}</p>

    <div class="section">
      <div class="section-head"><h2>How to do it</h2></div>
      <div class="card"><ol class="steps">${ex.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
    </div>

    <div class="section">
      <div class="section-head"><h2>Coaching cues</h2></div>
      <div class="card"><ul class="bullets good">${ex.cues.map((c) => `<li>${icon('check', 18)}<span>${esc(c)}</span></li>`).join('')}</ul></div>
    </div>

    <div class="section">
      <div class="section-head"><h2>Common mistakes</h2></div>
      <div class="card"><ul class="bullets bad">${ex.mistakes.map((c) => `<li>${icon('x', 18)}<span>${esc(c)}</span></li>`).join('')}</ul></div>
    </div>

    ${ex.safety ? `<div class="callout warn mt16">${icon('alert', 20)}<div>${esc(ex.safety)}</div></div>` : ''}

    <div class="section">
      <div class="section-head"><h2>Dose by phase</h2></div>
      <div class="doses">${ex.dose.map((d, i) => {
        const dd = doseFor(ex, i + 1);
        return `<div class="dose ${i + 1 === phase ? 'cur' : ''}"><div class="p">${PHASES[i].name}</div>
          <div class="v">${doseLabel(ex, dd).replace(' · each side', '')}</div><div class="n">${esc(d.variant)}</div></div>`;
      }).join('')}</div>
      <div class="card mt12"><dl class="kv">
        <dt>Tempo</dt><dd>${esc(tempoLabel(cur))}</dd>
        <dt>Rest</dt><dd>${cur.rest ? `${cur.rest} s between sets${ex.perSide ? ` (alternate legs — ~${restSeconds(ex, cur)} s extra after each pair)` : ''}` : '—'}</dd>
        ${cur.load ? `<dt>Load</dt><dd>${esc(cur.load)}</dd>` : ''}
        ${ex.equipment.length ? `<dt>Kit</dt><dd>${esc(ex.equipment.join(', '))}</dd>` : '<dt>Kit</dt><dd>None</dd>'}
        <dt>Easier</dt><dd>${esc(ex.regress)}</dd>
        <dt>Harder</dt><dd>${esc(ex.progress)}</dd>
      </dl></div>
    </div>

    <div class="section">
      <div class="section-head"><h2>The evidence</h2>${gradeTag(ex.evidence.grade)}</div>
      <div class="card">
        <p style="font-size:15px;line-height:1.55">${esc(ex.evidence.note)}</p>
        ${ex.evidence.refs.length ? `<div class="mt8">${ex.evidence.refs.map((r) => refItem(REFERENCES[r])).join('')}</div>` : ''}
      </div>
    </div>`;
}

export function exerciseRow(ex, phase, { num, right } = {}) {
  const d = doseFor(ex, phase);
  return `<button class="row" data-ex="${ex.id}">
    ${num != null ? `<span class="row-num">${num}</span>` : ''}${exBadge(ex)}
    <div class="row-main"><div class="row-title">${esc(ex.name)}</div>
    <div class="row-sub">${right ?? `${doseLabel(ex, d)} · ${esc(d.variant)}`}</div></div>
    <span class="chev">${icon('chevron', 18)}</span></button>`;
}

let filter = { q: '', area: 'all' };

export function renderLibrary(el, _params, ctx) {
  const phase = store.get().plan?.phase ?? 1;
  const draw = () => {
    const q = filter.q.toLowerCase();
    const list = EXERCISES.filter((e) => (filter.area === 'all' || e.area === filter.area)
      && (!q || `${e.name} ${e.subtitle} ${e.summary}`.toLowerCase().includes(q)));
    el.querySelector('[data-list]').innerHTML = list.length
      ? list.map((e) => exerciseRow(e, phase, { right: `${esc(e.subtitle)} · ${CATEGORIES[e.category].label}` })).join('')
      : `<div class="empty">No exercises match “${esc(filter.q)}”.</div>`;
    el.querySelectorAll('[data-area]').forEach((c) => c.classList.toggle('on', c.dataset.area === filter.area));
  };

  el.innerHTML = `
    <div class="topbar"><div><div class="eyebrow">${EXERCISES.length} exercises</div><h1>Library</h1></div></div>
    <label class="search">${icon('search', 20)}<input type="search" placeholder="Search exercises" value="${esc(filter.q)}" aria-label="Search exercises"></label>
    <div class="chips scroll">
      <button class="chip" data-area="all">All</button>
      ${Object.entries(AREAS).map(([k, a]) => `<button class="chip" data-area="${k}">${a.label}</button>`).join('')}
    </div>
    <div class="card flush mt12"><div class="list" data-list></div></div>
    <p class="subtle mt16" style="padding:0 4px">Evidence grades: <b>A</b> trials or guideline support for this problem · <b>B</b> smaller trials or related populations · <b>C</b> expert consensus, low risk.</p>`;

  el.querySelector('input').addEventListener('input', (e) => { filter.q = e.target.value; draw(); });
  el.addEventListener('click', (e) => {
    const a = e.target.closest('[data-area]');
    if (a) { filter.area = a.dataset.area; draw(); }
    const r = e.target.closest('[data-ex]');
    if (r) ctx.nav(`library/${r.dataset.ex}`);
  });
  draw();
}

export function renderExercise(el, { id }, ctx) {
  const ex = EXERCISE_MAP[id];
  if (!ex) return ctx.nav('library');
  const phase = store.get().plan?.phase ?? 1;
  const dose = doseFor(ex, phase);
  const usedIn = CONDITIONS.filter((c) => c.programme.some((p) => p.id === id));
  el.innerHTML = `
    <div class="backbar"><button class="iconbtn" data-back aria-label="Back">${icon('back', 20)}</button><span class="title">Library</span></div>
    <div class="ex-head">${exBadge(ex, true)}<div><h1>${esc(ex.name)}</h1><div class="ex-sub">${esc(ex.subtitle)} · ${AREAS[ex.area].label}</div></div></div>
    <div class="chips">${gradeTag(ex.evidence.grade)}<span class="tag">${CATEGORIES[ex.category].label}</span><span class="tag">${icon('clock', 13)} ~${fmtMinutes(estimateSeconds(ex, dose))}</span></div>
    <button class="btn btn-primary btn-lg btn-block mt16" data-try>${icon('play', 18)} Try it now · ${doseLabel(ex, dose)}</button>
    <div class="mt20">${exerciseInfoHTML(ex, phase)}</div>
    ${usedIn.length ? `<div class="section"><div class="section-head"><h2>Used for</h2></div><div class="chips">${usedIn.map((c) => `<span class="tag">${esc(c.name)}</span>`).join('')}</div></div>` : ''}
    <p class="subtle mt20" style="padding:0 4px">Sources link to PubMed. ${ex.evidence.refs.length ? `Key: ${ex.evidence.refs.map((r) => shortCite(REFERENCES[r])).join(', ')}.` : ''}</p>`;
  el.querySelector('[data-back]').addEventListener('click', () => history.back());
  el.querySelector('[data-try]').addEventListener('click', () => {
    startPlayer({ date: dayKey(), phase, type: 'single', deload: false, items: [{ id, dose, secs: 0 }], seconds: 0 }, { onExit: () => ctx.refresh() });
  });
}
