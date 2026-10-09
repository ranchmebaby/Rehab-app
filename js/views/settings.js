import { store } from '../store.js';
import { esc, icon, toast, openSheet, closeSheet } from '../ui.js';
import { applyTheme } from '../theme.js';

export function renderSettings(el, _p, ctx) {
  const st = store.get();
  const s = st.settings;
  const toggle = (k, label, sub) => `
    <label class="row" style="cursor:pointer"><div class="row-main"><div class="row-title">${label}</div><div class="row-sub">${sub}</div></div>
    <span class="switch"><input type="checkbox" data-k="${k}" ${s[k] ? 'checked' : ''}><span></span></span></label>`;

  el.innerHTML = `
    <div class="backbar"><button class="iconbtn" data-back aria-label="Back">${icon('back', 20)}</button><span class="title">Today</span></div>
    <div class="topbar" style="padding-top:4px"><div><h1>Settings</h1></div></div>

    <div class="section" style="margin-top:12px">
      <div class="card">
        <div class="field" style="margin:0"><label for="nm">Your name</label><input id="nm" class="input" value="${esc(st.profile.name)}" placeholder="optional" autocomplete="given-name"></div>
        <div class="field mt16" style="margin-bottom:0"><label>I mainly…</label>
          <div class="seg" data-sport>${[['run', 'Run'], ['ride', 'Ride'], ['both', 'Both']].map(([k, l]) => {
            const cur = st.profile.sports.length === 2 ? 'both' : st.profile.sports[0];
            return `<button data-v="${k}" class="${cur === k ? 'on' : ''}">${l}</button>`;
          }).join('')}</div></div>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><h2>Session cues</h2></div>
      <div class="card flush"><div class="list">
        ${toggle('sound', 'Sounds', 'Beeps on each tempo phase and countdowns')}
        ${toggle('voice', 'Voice coach', 'Spoken set, side and tempo cues')}
        ${toggle('haptics', 'Vibration', 'Haptic taps on Android')}
      </div></div>
    </div>

    <div class="section">
      <div class="section-head"><h2>Appearance</h2></div>
      <div class="seg" data-theme>${['auto', 'light', 'dark'].map((t) => `<button data-v="${t}" class="${s.theme === t ? 'on' : ''}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div>
    </div>

    <div class="section">
      <div class="section-head"><h2>Your data</h2></div>
      <div class="card">
        <p class="subtle">Everything stays on this device — no account, no tracking. Back up regularly, especially before clearing browser data.</p>
        <div class="btn-row mt12">
          <button class="btn btn-secondary" data-export>${icon('download', 18)} Export</button>
          <label class="btn btn-secondary">${icon('upload', 18)} Import<input type="file" accept="application/json,.json" hidden data-import></label>
        </div>
        <button class="btn btn-danger btn-block mt12" data-reset>${icon('trash', 18)} Reset everything</button>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><h2>Install on your phone</h2></div>
      <div class="card">
        <div class="install-hint">${icon('download', 22)}<div><b>iPhone (Safari):</b> tap Share → <i>Add to Home Screen</i>.</div></div>
        <div class="install-hint mt12">${icon('download', 22)}<div><b>Android (Chrome):</b> tap ⋮ → <i>Install app</i>.</div></div>
        <p class="subtle mt12">Once installed it runs full-screen and works offline.</p>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <div class="card-title">About Footing</div>
        <p class="subtle mt8">Programmes are built from randomised trials, systematic reviews and clinical practice guidelines (JOSPT, BJSM, AJSM). They are general guidance for common overuse problems — not a diagnosis. If pain is severe, worsening, or you have any red-flag symptoms, see a qualified clinician.</p>
        <button class="btn btn-ghost mt8" style="padding:0" data-nav="learn/red-flags">${icon('alert', 18)} Red flags</button>
      </div>
    </div>`;

  el.querySelector('[data-back]').addEventListener('click', () => history.back());
  el.querySelector('#nm').addEventListener('change', (e) => store.update((x) => { x.profile.name = e.target.value.trim().slice(0, 30); }));
  el.querySelectorAll('[data-k]').forEach((i) => i.addEventListener('change', () => store.update((x) => { x.settings[i.dataset.k] = i.checked; })));
  el.querySelector('[data-sport]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    store.update((x) => { x.profile.sports = b.dataset.v === 'both' ? ['run', 'ride'] : [b.dataset.v]; });
    ctx.refresh();
  });
  el.querySelector('[data-theme]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    store.update((x) => { x.settings.theme = b.dataset.v; });
    applyTheme();
    ctx.refresh();
  });
  el.querySelector('[data-export]').addEventListener('click', () => {
    const blob = new Blob([store.export()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `footing-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  el.querySelector('[data-import]').addEventListener('change', async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    try { store.import(await f.text()); applyTheme(); toast('Backup restored'); ctx.nav(''); }
    catch (err) { toast(err.message || 'Could not read that file'); }
  });
  el.querySelector('[data-reset]').addEventListener('click', () => {
    openSheet(`<h2>Reset everything?</h2><p class="muted">This deletes your plan, sessions, check-ins and test results from this device. Export a backup first if you might want them.</p>
      <button class="btn btn-danger btn-block btn-lg mt20" data-yes>Delete all data</button>
      <button class="btn btn-secondary btn-block mt8" data-sheet-close>Cancel</button>`, {
      onMount: (body) => {
        body.querySelector('[data-sheet-close]').addEventListener('click', closeSheet);
        body.querySelector('[data-yes]').addEventListener('click', () => { store.reset(); applyTheme(); closeSheet(); ctx.nav('onboarding'); });
      },
    });
  });
}
