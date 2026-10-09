import { EXERCISE_MAP } from '../data/exercises.js';
import { PHASES } from '../data/conditions.js';
import { buildSession, painAdvice, streak, weekStart, dayKey, phaseWeek, readyToAdvance, DAY_MS, weekday } from '../engine.js';
import { store } from '../store.js';
import { esc, icon, fmtMinutes, buzz, toast } from '../ui.js';
import { startPlayer } from '../player.js';
import { exerciseRow } from './library.js';
import { openActivitySheet } from './progress.js';

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Late night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export function scaleHTML(selected) {
  return Array.from({ length: 11 }, (_, i) => {
    const on = i === selected ? `on ${i <= 2 ? 'g' : i <= 5 ? 'a' : 'r'}` : '';
    return `<button data-pain="${i}" class="${on}" aria-label="Pain ${i}">${i}</button>`;
  }).join('');
}

export function renderToday(el, _p, ctx) {
  const st = store.get();
  const { plan } = st;
  const today = dayKey();
  const advice = painAdvice(st.checkins, today);
  const checkin = st.checkins.find((c) => c.date === today);
  const deload = advice?.deload ?? false;
  const session = buildSession(plan, new Date(), { deload });
  const doneToday = st.sessions.filter((s) => s.date === today && s.type !== 'single');
  const phase = PHASES[plan.phase - 1];
  const week = phaseWeek(plan, today);
  const ready = readyToAdvance(plan, st.sessions, st.checkins, today);
  const name = st.profile.name ? `, ${esc(st.profile.name)}` : '';

  // Week strip
  const ws = weekStart();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws.getTime() + i * DAY_MS);
    const k = dayKey(d);
    const done = st.sessions.some((s) => s.date === k);
    const isStr = plan.strengthDays.includes(i);
    return `<div class="wd ${done ? 'done' : ''} ${k === today ? 'today' : ''} ${isStr ? 'strength' : ''}">
      <span class="lbl">${d.toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
      <span class="pip">${done ? icon('check', 16) : isStr ? icon('dumbbell', 14) : ''}</span></div>`;
  }).join('');
  const weekCount = st.sessions.filter((s) => s.date >= dayKey(ws)).length;

  const isLight = session.type === 'light';
  const heroCls = doneToday.length ? 'done' : isLight ? 'light-day' : '';
  const nextStrength = (() => {
    for (let i = 1; i <= 7; i++) {
      const d = new Date(Date.now() + i * DAY_MS);
      if (plan.strengthDays.includes(weekday(d))) return d.toLocaleDateString(undefined, { weekday: 'long' });
    }
    return null;
  })();

  el.innerHTML = `
    <div class="topbar">
      <div><div class="eyebrow">${new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      <h1>${greeting()}${name}</h1></div>
      <button class="iconbtn" data-nav="settings" aria-label="Settings">${icon('settings', 20)}</button>
    </div>

    ${ready ? `<div class="callout mt12" style="align-items:center">${icon('sparkle', 22)}<div style="flex:1"><b>Ready for ${PHASES[plan.phase].name}?</b><div class="small muted">You've hit the time, consistency and pain criteria.</div></div><button class="btn btn-primary" style="height:38px;padding:0 14px" data-advance>Advance</button></div>` : ''}

    <div class="card mt12" data-checkin>
      <div class="between"><div class="card-title">Morning check-in</div>${checkin ? `<span class="tag">${icon('check', 12)} Logged</span>` : ''}</div>
      <p class="subtle">Pain or stiffness on your first steps today (0–10)</p>
      <div class="scale">${scaleHTML(checkin?.pain)}</div>
      <div class="scale-legend"><span>None</span><span>Worst imaginable</span></div>
      ${advice ? `<div class="advice ${advice.level} mt12"><span class="dot"></span><div><strong>${advice.title}</strong><p>${advice.text}</p></div></div>` : ''}
    </div>

    <div class="section">
      <div class="hero ${heroCls}">
        <div class="hero-art">${icon(isLight ? 'foot' : 'dumbbell', 170)}</div>
        <div class="eyebrow">${doneToday.length ? 'Done for today' : `Today · ${phase.name} · Week ${Math.min(week, phase.weeks)}${week > phase.weeks ? '+' : ''}`}${deload ? '<span class="deload-pill">Lighter day</span>' : ''}</div>
        <h2>${doneToday.length ? 'Great work' : session.title}</h2>
        <div class="hero-meta">
          <span>${icon('clock', 16)} ${fmtMinutes(session.seconds)}</span>
          <span>${icon('layers', 16)} ${session.items.length} exercises</span>
        </div>
        ${doneToday.length
          ? `<p style="margin-top:10px;color:rgba(255,255,255,.85);font-size:14.5px">${isLight ? `Next strength day: ${nextStrength ?? '—'}.` : 'Recovery is when you adapt.'} Optional: repeat or log a run/ride.</p>
             <div class="btn-row"><button class="btn btn-primary" data-start>${icon('refresh', 18)} Again</button><button class="btn btn-primary" data-activity>${icon('plus', 18)} Log activity</button></div>`
          : `<button class="btn btn-primary btn-lg btn-block" data-start>${icon('play', 18)} Start session</button>`}
      </div>
    </div>

    <div class="section">
      <div class="section-head"><h2>${isLight ? 'Daily foot core' : 'Exercises'}</h2><span class="subtle">${isLight ? 'Strength days: ' + plan.strengthDays.length + '×/week' : ''}</span></div>
      <div class="card flush"><div class="list">${session.items.map((it, i) => exerciseRow(EXERCISE_MAP[it.id], plan.phase, { num: i + 1, right: `${esc(it.dose.variant)} · ${it.dose.sets}×${it.dose.tempo?.length === 1 ? it.dose.tempo[0].s + 's' : it.dose.reps}${EXERCISE_MAP[it.id].perSide ? ' each side' : ''}` })).join('')}</div></div>
    </div>

    <div class="section">
      <div class="section-head"><h2>This week</h2><span class="subtle">${weekCount} session${weekCount === 1 ? '' : 's'} · ${streak(st.sessions, today)}-day streak</span></div>
      <div class="card"><div class="week" style="margin-top:0">${days}</div></div>
    </div>

    <div class="section">
      <button class="card row" style="border-radius:var(--r)" data-activity>
        <div class="badge" style="--h:212">${icon(st.profile.sports?.includes('ride') && !st.profile.sports?.includes('run') ? 'bike' : 'run', 22)}</div>
        <div class="row-main"><div class="row-title">Log a run or ride</div><div class="row-sub">Track training load and symptoms</div></div>
        <span class="chev">${icon('plus', 20)}</span>
      </button>
    </div>`;

  el.querySelector('[data-checkin]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pain]');
    if (!b) return;
    store.setCheckin(Number(b.dataset.pain));
    buzz(10);
    ctx.refresh();
  });
  el.querySelectorAll('[data-start]').forEach((b) => b.addEventListener('click', () => {
    startPlayer(session, { onExit: () => ctx.refresh() });
  }));
  el.querySelectorAll('[data-activity]').forEach((b) => b.addEventListener('click', () => openActivitySheet(ctx)));
  el.querySelector('[data-advance]')?.addEventListener('click', () => {
    const next = PHASES[plan.phase].name;
    store.update((s) => { s.plan.phase += 1; s.plan.phaseStart = today; });
    toast(`Welcome to ${next}`);
    ctx.refresh();
  });
  el.querySelectorAll('[data-ex]').forEach((r) => r.addEventListener('click', () => ctx.nav(`library/${r.dataset.ex}`)));
}
