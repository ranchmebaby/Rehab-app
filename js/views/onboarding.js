import { EXERCISE_MAP } from '../data/exercises.js';
import { RED_FLAGS, CONDITION_MAP, CONDITIONS } from '../data/conditions.js';
import { programmeExercises, dayKey, buildSession } from '../engine.js';
import { store } from '../store.js';
import { esc, icon, toast } from '../ui.js';
import { conditionPicks } from './plan.js';
import { exerciseRow } from './library.js';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function renderOnboarding(el, _p, ctx) {
  const o = { step: 0, flags: null, sel: new Set(), sport: 'both', minutes: 25, days: [0, 2, 4], name: '' };
  const STEPS = 5;

  const shell = (inner, foot, { back = true } = {}) => `
    <div class="onb">
      <div class="onb-top">
        ${back ? `<button class="iconbtn" data-prev aria-label="Back">${icon('back', 20)}</button>` : '<span style="width:42px"></span>'}
        <div class="dots">${Array.from({ length: STEPS }, (_, i) => `<i class="${i <= o.step ? 'on' : ''}"></i>`).join('')}</div>
        <span style="width:42px"></span>
      </div>
      <div class="view">${inner}</div>
      <div class="onb-foot">${foot}</div>
    </div>`;

  const screens = [
    () => shell(`
      <div style="padding-top:5vh"><div class="logo-mark">${icon('foot', 40)}</div></div>
      <h1>Strong feet.<br>Resilient legs.</h1>
      <p class="lead">A guided, evidence-based rehab programme for arches, heels, Achilles, knees and hips — built for people who run and ride.</p>
      <div class="card flush"><div class="list">
        ${[['target', 'Personalised 12-week plan', 'Three phases, auto-progressing dose'],
          ['clock', 'Guided timers', 'Tempo, holds, rests and voice cues'],
          ['progress', 'Track what matters', 'Pain trend, strength tests, consistency'],
          ['library', 'Every exercise referenced', '30+ studies & clinical guidelines']]
          .map(([ic, t, d]) => `<div class="row"><div class="badge" style="--h:168">${icon(ic, 22)}</div><div class="row-main"><div class="row-title">${t}</div><div class="row-sub">${d}</div></div></div>`).join('')}
      </div></div>`,
    `<button class="btn btn-primary btn-lg btn-block" data-next>Get started</button>`, { back: false }),

    () => shell(`
      <h1>Quick safety check</h1>
      <p class="lead">Do any of these apply to you right now?</p>
      <div class="card"><ul class="flag-list">${RED_FLAGS.map((f) => `<li>${icon('alert', 18)}<span>${esc(f)}</span></li>`).join('')}</ul></div>
      ${o.flags === true ? `<div class="callout warn mt16">${icon('alert', 20)}<div><b>Please get assessed first.</b> These can signal problems that need a diagnosis — a tendon tear, stress fracture, nerve or circulation issue. A physio, sports doctor or podiatrist can confirm it's safe to load. You can still explore the app.</div></div>` : ''}`,
    o.flags === true
      ? `<button class="btn btn-primary btn-lg btn-block" data-next>I understand — continue</button>`
      : `<div class="btn-row"><button class="btn btn-secondary btn-lg" data-flags="yes">Yes, one applies</button><button class="btn btn-primary btn-lg" data-flags="no">None apply</button></div>`),

    () => shell(`
      <h1>What are we working on?</h1>
      <p class="lead">Pick up to three. Your programme blends them and keeps sessions focused.</p>
      <div class="pick" data-pick>${conditionPicks(o.sel)}</div>`,
    `<button class="btn btn-primary btn-lg btn-block" data-next ${o.sel.size ? '' : 'disabled'}>Continue${o.sel.size ? ` · ${o.sel.size} selected` : ''}</button>`),

    () => shell(`
      <h1>Fit it into your week</h1>
      <p class="lead">Short daily foot-core work, plus heavier strength sessions with a rest day between.</p>
      <div class="field"><label>I mainly…</label><div class="seg" data-sport>${[['run', 'Run'], ['ride', 'Ride'], ['both', 'Both']].map(([k, l]) => `<button data-v="${k}" class="${o.sport === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      <div class="field"><label>Strength days</label><div class="chips" data-days>${DAY_NAMES.map((d, i) => `<button class="chip ${o.days.includes(i) ? 'on' : ''}" data-d="${i}">${d}</button>`).join('')}</div>
        <span class="subtle small">2–3 non-consecutive days is ideal — tendons adapt between sessions.</span></div>
      <div class="field"><label>Time per strength session</label><div class="seg" data-mins>${[15, 25, 35, 45].map((m) => `<button data-m="${m}" class="${o.minutes === m ? 'on' : ''}">${m} min</button>`).join('')}</div></div>
      <div class="field"><label for="nm">First name (optional)</label><input id="nm" class="input" value="${esc(o.name)}" autocomplete="given-name" placeholder="For a friendlier greeting"></div>`,
    `<button class="btn btn-primary btn-lg btn-block" data-next>Continue</button>`),

    () => {
      const plan = draftPlan();
      const ids = programmeExercises(plan.conditions, 1);
      const sample = buildSession(plan, nextStrengthDate(plan));
      return shell(`
        <h1>Your plan is ready</h1>
        <p class="lead">Phase 1 · <b>Foundation</b> (4 weeks). Calm symptoms, groove perfect form, and build a base.</p>
        <div class="stats">
          <div class="stat"><div class="stat-value">12</div><div class="stat-label">weeks</div></div>
          <div class="stat"><div class="stat-value">${plan.strengthDays.length}×</div><div class="stat-label">strength / wk</div></div>
          <div class="stat"><div class="stat-value">${Math.round(sample.seconds / 60)}</div><div class="stat-label">min / session</div></div>
        </div>
        <div class="section-head mt20"><h2>Foundation exercises</h2></div>
        <div class="card flush"><div class="list">${ids.map((id, i) => exerciseRow(EXERCISE_MAP[id], 1, { num: i + 1 })).join('')}</div></div>
        <div class="callout mt16">${icon('info', 20)}<div>Each morning, rate your pain. The app follows the <b>pain-monitoring model</b>: up to 5/10 during exercise is OK if it settles by the next morning.</div></div>`,
      `<button class="btn btn-primary btn-lg btn-block" data-finish>${icon('sparkle', 18)} Start my programme</button>`);
    },
  ];

  const draftPlan = () => ({
    conditions: CONDITIONS.map((c) => c.id).filter((id) => o.sel.has(id)),
    phase: 1,
    phaseStart: dayKey(),
    startDate: dayKey(),
    minutes: o.minutes,
    strengthDays: [...o.days].sort(),
  });

  const draw = () => {
    el.innerHTML = screens[o.step]();
    window.scrollTo(0, 0);
  };

  el.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('[data-next]')) { o.step = Math.min(STEPS - 1, o.step + 1); return draw(); }
    if (t.closest('[data-prev]')) { o.step = Math.max(0, o.step - 1); return draw(); }
    const f = t.closest('[data-flags]');
    if (f) { o.flags = f.dataset.flags === 'yes'; if (!o.flags) o.step++; return draw(); }
    const c = t.closest('[data-c]');
    if (c) {
      const id = c.dataset.c;
      if (o.sel.has(id)) o.sel.delete(id); else if (o.sel.size < 3) o.sel.add(id); else toast('Pick up to 3 for now — you can change later');
      const y = window.scrollY; draw(); window.scrollTo(0, y); return;
    }
    const sp = t.closest('[data-sport] [data-v]');
    if (sp) { o.sport = sp.dataset.v; return redraw(); }
    const d = t.closest('[data-d]');
    if (d) {
      const n = Number(d.dataset.d);
      if (o.days.includes(n)) { if (o.days.length > 1) o.days = o.days.filter((x) => x !== n); } else o.days.push(n);
      return redraw();
    }
    const m = t.closest('[data-m]');
    if (m) { o.minutes = Number(m.dataset.m); return redraw(); }
    if (t.closest('[data-finish]')) {
      store.update((s) => {
        s.plan = draftPlan();
        s.profile.sports = o.sport === 'both' ? ['run', 'ride'] : [o.sport];
        if (o.name) s.profile.name = o.name.slice(0, 30);
      });
      toast(`Programme created for ${[...o.sel].map((x) => CONDITION_MAP[x].short).join(', ')}`);
      ctx.nav('');
    }
  });
  el.addEventListener('input', (e) => { if (e.target.id === 'nm') o.name = e.target.value.trim(); });

  const redraw = () => { const y = window.scrollY; draw(); window.scrollTo(0, y); };
  draw();
}

function nextStrengthDate(plan) {
  const d = new Date();
  for (let i = 0; i < 7; i++) {
    const x = new Date(d.getTime() + i * 86400000);
    if (plan.strengthDays.includes((x.getDay() + 6) % 7)) return x;
  }
  return d;
}

