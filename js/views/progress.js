import { BENCHMARKS, BENCHMARK_MAP } from '../data/benchmarks.js';
import { REFERENCES } from '../data/references.js';
import { streak, dayKey, weekStart, DAY_MS, symmetry } from '../engine.js';
import { store } from '../store.js';
import { esc, icon, openSheet, closeSheet, toast, fmtDate, beep, unlockAudio, buzz, fmtTime } from '../ui.js';
import { lineChart, barChart, heatmap, wireTooltips } from '../charts.js';
import { refItem } from './library.js';
import { scaleHTML } from './today.js';

export function renderProgress(el, _p, ctx) {
  const st = store.get();
  const today = dayKey();
  const total = st.sessions.length;
  const minutes = Math.round(st.sessions.reduce((a, s) => a + (s.durationSec || 0), 0) / 60);
  const str = streak(st.sessions, today);

  const painSeries = [
    { name: 'Morning', color: 'var(--left)', points: st.checkins.map((c) => ({ date: c.date, y: c.pain })) },
    { name: 'During session', color: 'var(--right)', points: st.sessions.filter((s) => s.painDuring != null).map((s) => ({ date: s.date, y: s.painDuring })) },
  ];
  const hasPain = painSeries.some((s) => s.points.length);

  // Weekly run/ride minutes, last 8 weeks
  const ws = weekStart();
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = new Date(ws.getTime() - (7 - i) * 7 * DAY_MS);
    const a = dayKey(start);
    const b = dayKey(new Date(start.getTime() + 6 * DAY_MS));
    const mins = st.activities.filter((x) => x.date >= a && x.date <= b).reduce((s, x) => s + (Number(x.minutes) || 0), 0);
    return { label: start.toLocaleDateString(undefined, { day: 'numeric', month: 'numeric' }), value: mins, tip: `Week of ${fmtDate(a)} · ${mins} min` };
  });

  const recentActs = [...st.activities].reverse().slice(0, 6);

  el.innerHTML = `
    <div class="topbar"><div><div class="eyebrow">Since ${st.plan?.startDate ? fmtDate(st.plan.startDate, { day: 'numeric', month: 'short', year: 'numeric' }) : 'today'}</div><h1>Progress</h1></div></div>

    <div class="stats mt12">
      <div class="stat">${icon('flame', 20)}<div class="stat-value">${str}</div><div class="stat-label">day streak</div></div>
      <div class="stat">${icon('check', 20)}<div class="stat-value">${total}</div><div class="stat-label">sessions</div></div>
      <div class="stat">${icon('clock', 20)}<div class="stat-value">${minutes}</div><div class="stat-label">minutes</div></div>
    </div>

    <div class="section">
      <div class="section-head"><h2>Consistency</h2><span class="subtle">Last 12 weeks</span></div>
      <div class="card">${heatmap(st.sessions, 12, today)}</div>
    </div>

    <div class="section">
      <div class="section-head"><h2>Pain trend</h2><span class="subtle">Last 30 days · 0–10</span></div>
      <div class="card">${hasPain
        ? `${lineChart({ series: painSeries, days: 30, yMin: 0, yMax: 10, unit: '/10', today })}
           <div class="legend"><span><i style="background:var(--left)"></i>Morning check-in</span><span><i style="background:var(--right)"></i>During session</span></div>`
        : '<div class="empty">Log a morning check-in on the Today tab to see your trend.</div>'}</div>
    </div>

    <div class="section">
      <div class="section-head"><h2>Benchmarks</h2><span class="subtle">Re-test every 2–4 weeks</span></div>
      ${BENCHMARKS.map((b) => benchmarkCard(b, st.tests.filter((t) => t.testId === b.id), today)).join('')}
    </div>

    <div class="section">
      <div class="section-head"><h2>Running & riding</h2><button data-add-act>+ Log</button></div>
      <div class="card">
        ${st.activities.length ? barChart({ bars: weeks }) : '<div class="empty">Log runs and rides to see weekly training load.</div>'}
        <p class="subtle mt8">Weekly minutes. Build gradually and let next-morning symptoms guide increases.</p>
      </div>
      ${recentActs.length ? `<div class="card flush mt12"><div class="list">${recentActs.map((a) => `
        <div class="row"><div class="badge" style="--h:${a.type === 'ride' ? 262 : a.type === 'walk' ? 168 : 212}">${icon(a.type === 'ride' ? 'bike' : 'run', 20)}</div>
          <div class="row-main"><div class="row-title">${a.minutes} min ${a.type}${a.distance ? ` · ${a.distance} km` : ''}</div>
          <div class="row-sub">${fmtDate(a.date)} · pain ${a.pain ?? '–'}/10${a.note ? ` · ${esc(a.note)}` : ''}</div></div>
          <button class="iconbtn" style="width:34px;height:34px;box-shadow:none" data-del-act="${a.id}" aria-label="Delete">${icon('trash', 16)}</button></div>`).join('')}</div></div>` : ''}
    </div>

    <div class="section">
      <div class="section-head"><h2>Session history</h2></div>
      ${st.sessions.length ? `<div class="card flush"><div class="list">${[...st.sessions].reverse().slice(0, 10).map((s) => `
        <div class="row"><div class="badge" style="--h:${s.type === 'strength' ? 168 : 230}">${icon(s.type === 'strength' ? 'dumbbell' : 'foot', 20)}</div>
        <div class="row-main"><div class="row-title">${s.type === 'strength' ? 'Strength' : s.type === 'single' ? 'Single exercise' : 'Foot core & mobility'}</div>
        <div class="row-sub">${fmtDate(s.date)} · ${Math.max(1, Math.round((s.durationSec || 0) / 60))} min · ${s.sets ?? 0} sets${s.painDuring != null ? ` · pain ${s.painDuring}/10` : ''}${s.notes ? ` · ${esc(s.notes)}` : ''}</div></div></div>`).join('')}</div></div>`
        : '<div class="card"><div class="empty">Your completed sessions will appear here.</div></div>'}
    </div>`;

  wireTooltips(el);
  el.querySelector('[data-add-act]').addEventListener('click', () => openActivitySheet(ctx));
  el.querySelectorAll('[data-del-act]').forEach((b) => b.addEventListener('click', () => { store.removeActivity(b.dataset.delAct); ctx.refresh(); }));
  el.querySelectorAll('[data-test]').forEach((b) => b.addEventListener('click', () => openTestSheet(BENCHMARK_MAP[b.dataset.test], ctx)));
}

function benchmarkCard(b, entries, today) {
  const last = entries.at(-1);
  const lsi = last && b.sides ? symmetry(last.left, last.right) : null;
  const chart = entries.length > 1
    ? lineChart({
      series: [
        { name: 'Left', color: 'var(--left)', points: entries.map((e) => ({ date: e.date, y: e.left })) },
        { name: 'Right', color: 'var(--right)', points: entries.map((e) => ({ date: e.date, y: e.right })) },
      ],
      days: Math.max(30, Math.ceil((Date.parse(today) - Date.parse(entries[0].date)) / DAY_MS) + 3),
      unit: ` ${b.unit}`, height: 120, today,
    }) + `<div class="legend"><span><i style="background:var(--left)"></i>Left</span><span><i style="background:var(--right)"></i>Right</span></div>`
    : '';
  return `<div class="card">
    <div class="between"><div class="card-title" style="font-size:16px">${esc(b.name)}</div>
      <button class="btn btn-secondary" style="height:34px;padding:0 12px;font-size:14px" data-test="${b.id}">${last ? 'Re-test' : 'Test'}</button></div>
    ${last ? `<div class="between mt12" style="justify-content:flex-start;gap:22px">
        <div><div class="eyebrow" style="color:var(--left)">Left</div><div class="stat-value">${last.left}<span class="subtle"> ${b.unit}</span></div></div>
        <div><div class="eyebrow" style="color:var(--right)">Right</div><div class="stat-value">${last.right}<span class="subtle"> ${b.unit}</span></div></div>
        ${lsi != null ? `<div><div class="eyebrow">Symmetry</div><div class="stat-value" style="color:${lsi >= 90 ? 'var(--good)' : 'var(--warn)'}">${lsi}%</div></div>` : ''}
      </div><p class="subtle small mt8">Last tested ${fmtDate(last.date)}</p>${chart}`
      : `<p class="subtle mt8">${esc(b.target)}</p>`}
  </div>`;
}

function openTestSheet(b, ctx) {
  let left = store.get().tests.filter((t) => t.testId === b.id).at(-1)?.left ?? 0;
  let right = store.get().tests.filter((t) => t.testId === b.id).at(-1)?.right ?? 0;
  let tool = null;

  const stopTool = () => { if (tool) { clearInterval(tool); tool = null; } };
  const html = `<h2>${esc(b.name)}</h2>
    <p class="muted">${esc(b.target)}</p>
    <div class="card mt16"><ol class="steps">${b.how.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
    ${b.metronome ? `<button class="btn btn-secondary btn-block mt12" data-tool>${icon('volume', 18)} Start metronome (${b.metronome} bpm)</button>` : ''}
    ${b.timer ? `<button class="btn btn-secondary btn-block mt12" data-tool>${icon('clock', 18)} Start ${b.timer} s timer</button>` : ''}
    <div class="steppers mt20">
      <div><div class="eyebrow" style="color:var(--left)">Left</div><div class="stepper mt8"><button data-s="l-">${icon('minus', 18)}</button><span class="val" data-v="l">${left}</span><button data-s="l+">${icon('plus', 18)}</button></div></div>
      <div><div class="eyebrow" style="color:var(--right)">Right</div><div class="stepper mt8"><button data-s="r-">${icon('minus', 18)}</button><span class="val" data-v="r">${right}</span><button data-s="r+">${icon('plus', 18)}</button></div></div>
    </div>
    <p class="subtle small mt8" style="text-align:center">Unit: ${b.unit}. Tap and hold − / + to change faster.</p>
    <button class="btn btn-primary btn-block btn-lg mt16" data-save>Save result</button>
    ${b.refs.length ? `<div class="mt16">${b.refs.map((r) => refItem(REFERENCES[r])).join('')}</div>` : ''}`;

  openSheet(html, {
    tall: true,
    onClose: stopTool,
    onMount: (body) => {
      const upd = () => { body.querySelector('[data-v="l"]').textContent = left; body.querySelector('[data-v="r"]').textContent = right; };
      let hold = null;
      const stepBy = (k) => {
        if (k === 'l+') left++; if (k === 'l-') left = Math.max(0, left - 1);
        if (k === 'r+') right++; if (k === 'r-') right = Math.max(0, right - 1);
        upd(); buzz(5);
      };
      body.querySelectorAll('[data-s]').forEach((btn) => {
        btn.addEventListener('pointerdown', () => {
          stepBy(btn.dataset.s);
          let t = 0;
          hold = setInterval(() => { if (++t > 3) stepBy(btn.dataset.s); }, 120);
        });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, () => clearInterval(hold)));
      });
      body.querySelector('[data-tool]')?.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        unlockAudio();
        if (tool) { stopTool(); btn.innerHTML = `${icon(b.metronome ? 'volume' : 'clock', 18)} ${b.metronome ? `Start metronome (${b.metronome} bpm)` : `Start ${b.timer} s timer`}`; return; }
        if (b.metronome) {
          let n = 0;
          tool = setInterval(() => { beep(n++ % 2 ? 660 : 990, 0.08, 0.2); }, 60000 / b.metronome);
          btn.innerHTML = `${icon('pause', 18)} Stop metronome`;
        } else {
          let left2 = b.timer;
          btn.innerHTML = `${icon('pause', 18)} ${fmtTime(left2)}`;
          beep(990, 0.2);
          tool = setInterval(() => {
            left2--;
            btn.innerHTML = `${icon('pause', 18)} ${fmtTime(left2)}`;
            if (left2 <= 3 && left2 > 0) beep(600, 0.07);
            if (left2 <= 0) { stopTool(); beep(1318, 0.4); buzz([40, 60, 40]); btn.innerHTML = `${icon('check', 18)} Time — restart?`; }
          }, 1000);
        }
      });
      body.querySelector('[data-save]').addEventListener('click', () => {
        stopTool();
        store.addTest({ testId: b.id, date: dayKey(), left, right });
        closeSheet(); toast('Result saved'); ctx.refresh();
      });
    },
  });
}

export function openActivitySheet(ctx) {
  const sports = store.get().profile.sports ?? ['run'];
  let type = sports.includes('run') ? 'run' : 'ride';
  let pain = null;
  const body = openSheet(`<h2>Log activity</h2>
    <div class="seg mt12" data-type>${['run', 'ride', 'walk'].map((t) => `<button data-t="${t}" class="${t === type ? 'on' : ''}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div>
    <div class="btn-row mt16">
      <div class="field"><label for="mins">Minutes</label><input id="mins" class="input" type="number" inputmode="numeric" min="1" placeholder="30"></div>
      <div class="field"><label for="dist">Distance (km)</label><input id="dist" class="input" type="number" inputmode="decimal" step="0.1" placeholder="optional"></div>
    </div>
    <div class="field"><label>Highest pain during (0–10)</label><div class="scale" style="margin-top:4px" data-pscale>${scaleHTML(null)}</div></div>
    <div class="field"><label for="anote">Note</label><input id="anote" class="input" placeholder="optional"></div>
    <button class="btn btn-primary btn-block btn-lg" data-save>Save</button>`);
  body.addEventListener('click', (e) => {
    const t = e.target.closest('[data-t]');
    if (t) { type = t.dataset.t; body.querySelectorAll('[data-t]').forEach((x) => x.classList.toggle('on', x === t)); }
    const p = e.target.closest('[data-pain]');
    if (p) { pain = Number(p.dataset.pain); body.querySelector('[data-pscale]').innerHTML = scaleHTML(pain); }
    if (e.target.closest('[data-save]')) {
      const minutes = Number(body.querySelector('#mins').value);
      if (!minutes) return toast('Enter minutes');
      const distance = Number(body.querySelector('#dist').value) || null;
      store.addActivity({ date: dayKey(), type, minutes, distance, pain, note: body.querySelector('#anote').value.trim() });
      closeSheet();
      toast(pain != null && pain > 5 ? 'Saved. Pain >5 — consider easing off next time.' : 'Activity saved');
      ctx.refresh();
    }
  });
}
