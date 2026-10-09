import { EXERCISE_MAP } from '../data/exercises.js';
import { CONDITIONS, CONDITION_MAP, PHASES } from '../data/conditions.js';
import { REFERENCES, shortCite } from '../data/references.js';
import { programmeExercises, phaseWeek, dayKey, daysBetween } from '../engine.js';
import { store } from '../store.js';
import { esc, icon, openSheet, closeSheet, toast } from '../ui.js';
import { exerciseRow } from './library.js';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function renderPlan(el, _p, ctx) {
  const { plan } = store.get();
  let viewPhase = plan.phase;
  const today = dayKey();
  const week = phaseWeek(plan, today);

  const draw = () => {
    const ids = programmeExercises(plan.conditions, viewPhase);
    const progressIn = (n) => {
      if (n < plan.phase) return 100;
      if (n > plan.phase) return 0;
      return Math.min(100, (daysBetween(plan.phaseStart, today) / (PHASES[n - 1].weeks * 7)) * 100);
    };
    el.innerHTML = `
      <div class="topbar"><div><div class="eyebrow">12-week programme</div><h1>Your plan</h1></div></div>

      <div class="card mt12">
        <div class="between"><div><div class="eyebrow">Phase ${plan.phase} of 3 · week ${week}</div>
        <div class="card-title" style="font-size:20px;margin-top:2px">${PHASES[plan.phase - 1].name}</div></div>
        <button class="btn btn-secondary" style="height:36px;padding:0 12px;font-size:14px" data-phase-edit>Change</button></div>
        <div class="phases">${PHASES.map((p) => `<div><div class="phase-bar"><i style="width:${progressIn(p.n)}%"></i></div><div class="phase-name ${p.n === plan.phase ? 'cur' : ''}">${p.name}</div></div>`).join('')}</div>
        <p class="muted mt12" style="font-size:15px">${esc(PHASES[plan.phase - 1].goal)}</p>
        <div class="callout mt12">${icon('target', 20)}<div><b>Move on when:</b> ${esc(PHASES[plan.phase - 1].advance)}</div></div>
      </div>

      <div class="section">
        <div class="section-head"><h2>Focus areas</h2><button data-edit-cond>Edit</button></div>
        <div class="card flush"><div class="list">${plan.conditions.map((id) => {
          const c = CONDITION_MAP[id];
          return `<div class="row"><div class="row-main"><div class="row-title">${esc(c.name)}</div><div class="row-sub" style="white-space:normal">${esc(c.blurb)}</div>
            <div class="subtle small mt8">Key evidence: ${c.keyRefs.map((r) => shortCite(REFERENCES[r])).join(' · ')}</div></div></div>`;
        }).join('')}</div></div>
      </div>

      <div class="section">
        <div class="section-head"><h2>Schedule</h2></div>
        <div class="card">
          <div class="card-title" style="font-size:15px">Strength days</div>
          <p class="subtle">Heavy work needs ~48 h recovery. Other days get a short foot-core & mobility routine.</p>
          <div class="chips mt12" data-days>${DAY_NAMES.map((d, i) => `<button class="chip ${plan.strengthDays.includes(i) ? 'on' : ''}" data-day="${i}">${d}</button>`).join('')}</div>
          <div class="card-title mt20" style="font-size:15px">Session length</div>
          <div class="seg mt8" data-mins>${[15, 25, 35, 45].map((m) => `<button data-m="${m}" class="${plan.minutes === m ? 'on' : ''}">${m} min</button>`).join('')}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-head"><h2>Exercises by phase</h2></div>
        <div class="seg" data-view>${PHASES.map((p) => `<button data-v="${p.n}" class="${viewPhase === p.n ? 'on' : ''}">${p.name}</button>`).join('')}</div>
        <div class="card flush mt12"><div class="list">${ids.map((id, i) => exerciseRow(EXERCISE_MAP[id], viewPhase, { num: i + 1 })).join('')}</div></div>
        <p class="subtle mt8" style="padding:0 4px">Listed in priority order. If a session would run over your time, lower-priority items rotate out.</p>
      </div>`;
    wire();
  };

  const wire = () => {
    el.querySelector('[data-days]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-day]'); if (!b) return;
      const d = Number(b.dataset.day);
      store.update((s) => {
        const set = new Set(s.plan.strengthDays);
        if (set.has(d)) { if (set.size > 1) set.delete(d); else return toast('Keep at least one strength day'); }
        else set.add(d);
        s.plan.strengthDays = [...set].sort();
      });
      draw();
    });
    el.querySelector('[data-mins]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-m]'); if (!b) return;
      store.update((s) => { s.plan.minutes = Number(b.dataset.m); });
      draw();
    });
    el.querySelector('[data-view]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]'); if (!b) return;
      viewPhase = Number(b.dataset.v); draw();
    });
    el.querySelectorAll('[data-ex]').forEach((r) => r.addEventListener('click', () => ctx.nav(`library/${r.dataset.ex}`)));
    el.querySelector('[data-edit-cond]').addEventListener('click', () => editConditions(draw));
    el.querySelector('[data-phase-edit]').addEventListener('click', () => {
      openSheet(`<h2>Change phase</h2><p class="muted">Move back if symptoms flare; move forward if your clinician has cleared you.</p>
        <div class="pick mt16">${PHASES.map((p) => `<button data-ph="${p.n}" class="${p.n === plan.phase ? 'on' : ''}"><div><div class="t">${p.n}. ${p.name}</div><div class="d">${esc(p.goal)}</div></div><span class="tick">${icon('check', 14)}</span></button>`).join('')}</div>`, {
        onMount: (body) => body.addEventListener('click', (e) => {
          const b = e.target.closest('[data-ph]'); if (!b) return;
          const n = Number(b.dataset.ph);
          if (n !== plan.phase) store.update((s) => { s.plan.phase = n; s.plan.phaseStart = dayKey(); });
          closeSheet(); draw();
        }),
      });
    });
  };

  draw();
}

function editConditions(after) {
  const sel = new Set(store.get().plan.conditions);
  const body = openSheet(`<h2>Focus areas</h2><p class="muted">Pick up to 3 for a focused programme.</p>
    <div class="pick mt16" data-pick>${conditionPicks(sel)}</div>
    <button class="btn btn-primary btn-block mt16" data-save>Save</button>`, { tall: true });
  body.addEventListener('click', (e) => {
    const b = e.target.closest('[data-c]');
    if (b) {
      const id = b.dataset.c;
      if (sel.has(id)) sel.delete(id); else if (sel.size < 3) sel.add(id); else toast('Pick up to 3');
      body.querySelector('[data-pick]').innerHTML = conditionPicks(sel);
    }
    if (e.target.closest('[data-save]')) {
      if (!sel.size) return toast('Pick at least one');
      store.update((s) => { s.plan.conditions = CONDITIONS.map((c) => c.id).filter((id) => sel.has(id)); });
      closeSheet(); after();
    }
  });
}

export function conditionPicks(sel) {
  return CONDITIONS.map((c) => `<button data-c="${c.id}" class="${sel.has(c.id) ? 'on' : ''}">
    <div><div class="t">${esc(c.name)}</div><div class="d">${esc(c.blurb)}</div></div><span class="tick">${icon('check', 14)}</span></button>`).join('');
}
