// Guided session player: tempo-paced reps, hold timers, rests, side switches,
// audio + voice + haptic cues, and a screen wake lock.

import { EXERCISE_MAP } from './data/exercises.js';
import { buildSteps, doseLabel } from './engine.js';
import { store } from './store.js';
import { esc, icon, fmtTime, beep, say, buzz, unlockAudio, keepAwake, openSheet, closeSheet, toast } from './ui.js';
import { exerciseInfoHTML } from './views/library.js';

const C = 2 * Math.PI * 46;

export function startPlayer(session, { onExit } = {}) {
  const steps = buildSteps(session);
  const root = document.createElement('div');
  root.className = 'player';
  document.body.appendChild(root);
  document.body.style.overflow = 'hidden';

  const s = {
    idx: 0,
    paused: false,
    acc: 0,            // ms elapsed in current step before last resume
    resumedAt: performance.now(),
    extra: 0,          // seconds added to a rest
    lastPhaseKey: '',
    lastCount: null,
    completed: new Set(),
    startedAt: Date.now(),
    finished: false,
  };
  const settings = () => store.get().settings;
  const workTotal = steps.filter((x) => x.kind === 'work').length;

  unlockAudio();
  keepAwake(true);
  const onVis = () => { if (document.visibilityState === 'visible' && !s.finished) keepAwake(true); };
  document.addEventListener('visibilitychange', onVis);

  const elapsed = () => (s.acc + (s.paused ? 0 : performance.now() - s.resumedAt)) / 1000;
  const step = () => steps[s.idx];
  const cycle = (st) => (st.tempo ? st.tempo.reduce((a, p) => a + p.s, 0) : 0);
  const duration = (st) => {
    if (st.kind === 'work') return st.tempo ? cycle(st) * st.reps : Infinity;
    return st.duration + (st.kind === 'rest' ? s.extra : 0);
  };

  function cue(text, { sound = true, voice = false, freq = 880, haptic = 15 } = {}) {
    const st = settings();
    if (sound && st.sound) beep(freq);
    if (voice && st.voice && text) say(text);
    if (st.haptics && haptic) buzz(haptic);
  }

  function announce(st) {
    const ex = EXERCISE_MAP[st.id];
    if (st.kind === 'intro') cue(`Next: ${ex.name}. Get ready.`, { voice: true, freq: 660 });
    else if (st.kind === 'work') {
      const side = st.side ? `, ${st.side.toLowerCase()} side` : '';
      cue(`Set ${st.set} of ${st.sets}${side}.${st.tempo ? '' : ` ${st.reps} ${ex.id === 'lateral-walk' ? 'steps each way' : 'reps'}. Tap done when finished.`}`, { voice: true, freq: 1046, haptic: [20, 60, 20] });
    } else if (st.kind === 'rest') cue(`Rest ${st.duration} seconds.`, { voice: true, freq: 523 });
    else if (st.kind === 'switch') cue(`Switch to the ${st.side.toLowerCase()} side.`, { voice: true, freq: 660 });
  }

  function go(i, { silent = false } = {}) {
    if (i >= steps.length) return finish();
    s.idx = Math.max(0, i);
    s.acc = 0;
    s.resumedAt = performance.now();
    s.extra = 0;
    s.lastPhaseKey = '';
    s.lastCount = null;
    render();
    if (!silent) announce(step());
  }

  function complete() {
    const st = step();
    if (st.kind === 'work') s.completed.add(s.idx);
    cue('', { freq: 1318, haptic: 30 });
    go(s.idx + 1);
  }

  function togglePause() {
    if (s.paused) { s.paused = false; s.resumedAt = performance.now(); }
    else { s.acc += performance.now() - s.resumedAt; s.paused = true; try { speechSynthesis.cancel(); } catch { /* */ } }
    renderControls();
  }

  // ───────── Rendering ─────────

  function render() {
    const st = step();
    const ex = EXERCISE_MAP[st.id];
    const item = session.items[st.exIndex];
    const done = steps.slice(0, s.idx).filter((x) => x.kind === 'work').length;
    const sidePill = st.side ? `<span class="side-pill ${st.side[0]}">${st.side} side</span>` : '';
    const ringCls = st.kind === 'rest' || st.kind === 'switch' ? 'rest' : st.kind === 'intro' ? 'intro' : '';
    const nextWork = steps.slice(s.idx + 1).find((x) => x.kind === 'work' || x.kind === 'intro');

    let head;
    if (st.kind === 'intro') {
      head = `<div class="eyebrow">Exercise ${st.exIndex + 1} of ${session.items.length}</div>
        <h2>${esc(ex.name)}</h2><div class="variant">${esc(item.dose.variant)} · ${doseLabel(ex, item.dose)}</div>`;
    } else if (st.kind === 'rest') {
      head = `<div class="eyebrow">Rest</div><h2>${esc(ex.name)}</h2><div class="variant">Set ${st.set} done</div>`;
    } else {
      head = `<div class="eyebrow">Set ${st.set} of ${st.sets}</div><h2>${esc(ex.name)}</h2>
        <div class="variant">${esc(item.dose.variant)}</div>${sidePill}`;
    }

    let below = '';
    if (st.kind === 'intro') {
      below = `<div class="intro-steps"><ol class="steps">${ex.steps.slice(0, 3).map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>`;
    } else if (st.kind === 'work' && st.tempo && st.tempo.length > 1) {
      below = `<div class="phase-pills">${st.tempo.map((p, i) => `<span data-ph="${i}">${esc(p.label)} ${p.s}s</span>`).join('')}</div>
        <div class="p-cue">${esc(ex.cues[0] ?? '')}</div>`;
    } else if (st.kind === 'work') {
      below = `<div class="p-cue">${esc(ex.cues[s.idx % ex.cues.length] ?? '')}</div>`;
    }

    const nextHTML = (st.kind === 'rest' || st.kind === 'switch') && nextWork
      ? `<div class="p-next"><div class="badge" style="--h:168">${icon('chevron', 20)}</div><div class="row-main"><div class="eyebrow">Up next</div>
          <div class="row-title">${esc(EXERCISE_MAP[nextWork.id].name)}${nextWork.side ? ` · ${nextWork.side}` : ''}</div>
          <div class="row-sub">${nextWork.kind === 'work' ? `Set ${nextWork.set} of ${nextWork.sets}` : 'New exercise'}</div></div></div>`
      : '';

    const manual = st.kind === 'work' && !st.tempo;
    root.innerHTML = `
      <div class="player-inner">
        <div class="p-top">
          <button class="iconbtn" data-act="close" aria-label="End session">${icon('x', 20)}</button>
          <div class="p-progress"><i style="width:${(done / workTotal) * 100}%"></i></div>
          <div class="p-count">${done}/${workTotal}</div>
          <button class="iconbtn" data-act="info" aria-label="How to do this exercise">${icon('info', 20)}</button>
        </div>
        <div class="p-head">${head}</div>
        <div class="p-stage"><div class="stage-inner">
          <div class="ring ${ringCls}">
            <svg viewBox="0 0 100 100"><circle class="track" cx="50" cy="50" r="46" fill="none" stroke-width="5"/>
              <circle class="fill" cx="50" cy="50" r="46" fill="none" stroke-width="5" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${manual ? 0 : C}"/></svg>
            <div class="ring-center"><div class="ring-label"></div><div class="ring-big"></div><div class="ring-sub"></div></div>
          </div>
          ${below}
        </div></div>
        ${nextHTML}
        ${manual ? `<button class="btn btn-primary btn-lg p-done" data-act="done">${icon('check', 20)} Set complete</button>` : ''}
        ${st.kind === 'rest' ? `<div class="btn-row" style="margin-bottom:14px"><button class="btn btn-secondary" data-act="plus">+15 s</button><button class="btn btn-secondary" data-act="next">Skip rest</button></div>` : ''}
        ${st.kind === 'intro' ? `<button class="btn btn-primary btn-lg p-done" data-act="next">I'm ready</button>` : ''}
        <div class="p-controls">
          <button class="p-btn" data-act="prev" aria-label="Previous">${icon('prev', 22)}</button>
          <button class="p-btn main" data-act="pause" aria-label="Pause"></button>
          <button class="p-btn" data-act="next" aria-label="Skip">${icon('next', 22)}</button>
        </div>
      </div>`;
    renderControls();
    tick(true);
  }

  function renderControls() {
    const b = root.querySelector('[data-act="pause"]');
    if (b) { b.innerHTML = icon(s.paused ? 'play' : 'pause', 28); b.setAttribute('aria-label', s.paused ? 'Resume' : 'Pause'); }
    const lbl = root.querySelector('.ring-label');
    if (lbl && s.paused) lbl.textContent = 'Paused';
  }

  function setRing(frac) {
    const f = root.querySelector('.ring .fill');
    if (f) f.style.strokeDashoffset = String(C * (1 - Math.max(0, Math.min(1, frac))));
  }

  function tick(force = false) {
    if (s.finished) return;
    const st = step();
    const t = elapsed();
    const dur = duration(st);
    const label = root.querySelector('.ring-label');
    const big = root.querySelector('.ring-big');
    const sub = root.querySelector('.ring-sub');
    if (!label) return;

    if (st.kind === 'work' && st.tempo) {
      const cyc = cycle(st);
      const rep = Math.min(st.reps - 1, Math.floor(t / cyc));
      let within = t - rep * cyc;
      let ph = 0;
      while (ph < st.tempo.length - 1 && within >= st.tempo[ph].s) { within -= st.tempo[ph].s; ph++; }
      const p = st.tempo[ph];
      const left = Math.max(0, p.s - within);
      if (!s.paused) label.textContent = p.label;
      big.textContent = String(Math.ceil(left - 0.001) || 0);
      sub.textContent = st.reps > 1 ? `Rep ${rep + 1} of ${st.reps}` : `Set ${st.set} of ${st.sets}`;
      setRing(within / p.s);
      root.querySelectorAll('[data-ph]').forEach((el) => el.classList.toggle('on', Number(el.dataset.ph) === ph));
      const key = `${rep}:${ph}`;
      if (key !== s.lastPhaseKey && !force) {
        const newRep = ph === 0 && rep > 0;
        if (st.tempo.length > 1 || newRep) {
          cue(p.s >= 2 && st.tempo.length > 1 ? p.label : '', { voice: st.tempo.length > 1 && p.s >= 2, freq: ph === 0 ? 988 : 740, haptic: newRep ? 25 : 10 });
        }
      }
      s.lastPhaseKey = key;
      // countdown ticks on long holds
      const sec = Math.ceil(left);
      if (p.s >= 8 && sec <= 3 && sec > 0 && sec !== s.lastCount && !force) { beep(600, 0.06, 0.12); s.lastCount = sec; }
    } else if (st.kind === 'work') {
      if (!s.paused) label.textContent = 'Target';
      big.textContent = String(st.reps);
      sub.textContent = fmtTime(t);
    } else {
      const left = Math.max(0, dur - t);
      if (!s.paused) label.textContent = st.kind === 'intro' ? 'Get ready' : st.kind === 'switch' ? 'Switch sides' : 'Rest';
      big.textContent = left < 60 ? String(Math.ceil(left)) : fmtTime(left);
      sub.textContent = st.kind === 'rest' ? `of ${fmtTime(dur)}` : '';
      setRing(1 - left / dur);
      const sec = Math.ceil(left);
      if (sec <= 3 && sec > 0 && sec !== s.lastCount && !force) { beep(600, 0.07, 0.14); s.lastCount = sec; }
    }

    if (!s.paused && t >= dur) complete();
  }

  // ───────── Finish ─────────

  function finish() {
    s.finished = true;
    keepAwake(false);
    const durationSec = Math.round((Date.now() - s.startedAt) / 1000);
    const setsByEx = {};
    s.completed.forEach((i) => { const st = steps[i]; setsByEx[st.id] = (setsByEx[st.id] || 0) + 1; });
    const exDone = Object.keys(setsByEx).length;
    cue('Session complete. Nice work.', { voice: true, freq: 1318, haptic: [30, 80, 30, 80, 60] });

    let pain = null;
    let effort = 'right';
    root.innerHTML = `
      <div class="player-inner" style="overflow-y:auto">
        <div class="finish">
          <div class="big-check">${icon('check', 44)}</div>
          <h2 style="font-size:28px;font-weight:780">Session complete</h2>
          <p class="muted mt8">Consistency beats intensity. See you next time.</p>
        </div>
        <div class="stats mt20">
          <div class="stat"><div class="stat-value">${Math.max(1, Math.round(durationSec / 60))}</div><div class="stat-label">${durationSec < 90 ? 'minute' : 'minutes'}</div></div>
          <div class="stat"><div class="stat-value">${exDone}</div><div class="stat-label">${exDone === 1 ? 'exercise' : 'exercises'}</div></div>
          <div class="stat"><div class="stat-value">${s.completed.size}</div><div class="stat-label">${s.completed.size === 1 ? 'set' : 'sets'}</div></div>
        </div>
        <div class="card mt16">
          <div class="card-title">Highest pain during the session</div>
          <p class="subtle">Up to 5/10 is fine if it settles by tomorrow morning.</p>
          <div class="scale" data-scale>${Array.from({ length: 11 }, (_, i) => `<button data-v="${i}">${i}</button>`).join('')}</div>
          <div class="scale-legend"><span>None</span><span>Worst</span></div>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:10px">How hard did it feel?</div>
          <div class="seg" data-effort>
            <button data-v="easy">Too easy</button><button data-v="right" class="on">About right</button><button data-v="hard">Too hard</button>
          </div>
          <p class="subtle mt8" data-effort-hint>Good — stay at this load next time.</p>
        </div>
        <div class="card">
          <div class="field" style="margin:0"><label for="notes">Notes (optional)</label>
          <textarea id="notes" class="input" placeholder="e.g. left arch felt stronger, used 6 kg backpack"></textarea></div>
        </div>
        <div class="spacer"></div>
        <button class="btn btn-primary btn-lg btn-block" data-act="save">Save session</button>
        <button class="btn btn-ghost btn-block mt8" data-act="discard">Discard</button>
        <div class="spacer"></div>
      </div>`;

    root.querySelector('[data-scale]').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      pain = Number(b.dataset.v);
      root.querySelectorAll('[data-scale] button').forEach((x) => {
        const v = Number(x.dataset.v);
        x.className = v === pain ? `on ${v <= 2 ? 'g' : v <= 5 ? 'a' : 'r'}` : '';
      });
      buzz(8);
    });
    const hints = { easy: 'Next time, add a little load or slow the tempo.', right: 'Good — stay at this load next time.', hard: 'Next time, reduce load or range. Form first.' };
    root.querySelector('[data-effort]').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      effort = b.dataset.v;
      root.querySelectorAll('[data-effort] button').forEach((x) => x.classList.toggle('on', x === b));
      root.querySelector('[data-effort-hint]').textContent = hints[effort];
    });
    root.querySelector('[data-act="save"]').addEventListener('click', () => {
      store.addSession({
        date: session.date, phase: session.phase, type: session.type, deload: session.deload,
        durationSec, sets: s.completed.size,
        items: Object.entries(setsByEx).map(([id, sets]) => ({ id, sets })),
        painDuring: pain, effort, notes: root.querySelector('#notes').value.trim(),
      });
      toast('Session saved');
      exit();
    });
    root.querySelector('[data-act="discard"]').addEventListener('click', () => exit());
  }

  function exit() {
    clearInterval(timer);
    keepAwake(false);
    try { speechSynthesis.cancel(); } catch { /* */ }
    document.removeEventListener('visibilitychange', onVis);
    document.body.style.overflow = '';
    root.remove();
    onExit?.();
  }

  // ───────── Events ─────────

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b || s.finished) return;
    unlockAudio();
    const act = b.dataset.act;
    if (act === 'pause') togglePause();
    else if (act === 'next') { if (step().kind === 'work') s.completed.delete(s.idx); go(s.idx + 1); }
    else if (act === 'done') complete();
    else if (act === 'prev') go(elapsed() > 2 ? s.idx : s.idx - 1);
    else if (act === 'plus') s.extra += 15;
    else if (act === 'info') {
      const wasPaused = s.paused;
      if (!wasPaused) togglePause();
      openSheet(exerciseInfoHTML(EXERCISE_MAP[step().id], session.phase, { compact: true }), {
        tall: true,
        onClose: () => { if (!wasPaused && s.paused) togglePause(); },
      });
    } else if (act === 'close') {
      const wasPaused = s.paused;
      if (!wasPaused) togglePause();
      openSheet(`
        <h2>End session?</h2>
        <p class="muted">You've completed ${s.completed.size} of ${workTotal} sets.</p>
        <div class="mt20">
          <button class="btn btn-primary btn-block" data-x="finish">Finish & log what I did</button>
          <button class="btn btn-secondary btn-block mt8" data-x="resume">Keep going</button>
          <button class="btn btn-ghost btn-block mt8" data-x="quit" style="color:var(--bad)">Quit without saving</button>
        </div>`, {
        onMount: (body) => body.addEventListener('click', (ev) => {
          const x = ev.target.closest('[data-x]')?.dataset.x;
          if (!x) return;
          closeSheet();
          if (x === 'finish') finish();
          else if (x === 'quit') exit();
          else if (s.paused) togglePause();
        }),
      });
    }
  });

  const timer = setInterval(() => { if (!s.paused) tick(); }, 100);
  go(0);
  return { exit };
}

