// Shared UI helpers: escaping, icons, sheets, toasts, audio & haptics.

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const P = {
  today: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  plan: '<rect x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><path d="m8.5 15 2.2 2.2L15.5 13"/>',
  library: '<path d="M4 19.5V5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2Zm0 0A2 2 0 0 0 6 22h13v-4"/><path d="M9 7h6"/>',
  progress: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m7 15 4-4 3 3 6-7"/>',
  learn: '<path d="M9 18h6M10 21.5h4"/><path d="M12 2.5a6.5 6.5 0 0 0-4 11.6c.6.5 1 1.2 1 2V17h6v-.9c0-.8.4-1.5 1-2A6.5 6.5 0 0 0 12 2.5Z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  play: '<path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5Z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1.2" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1.2" fill="currentColor" stroke="none"/>',
  next: '<path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/>',
  prev: '<path d="m19 20-10-8 10-8v16Z"/><path d="M5 19V5"/>',
  check: '<path d="m4.5 12.5 5 5 10-11"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 16.5v-5M12 8h.01"/>',
  foot: '<g fill="currentColor" stroke="none"><path d="M8.6 22c-2.5 0-4.1-1.9-4.1-4.6 0-3.1 1.6-4.8 1.6-8.1C6.1 5.5 7.4 3 10 3c2.4 0 3.6 2 3.6 5.1 0 3.9-1.9 6-1.9 9.4 0 2.9-.8 4.5-3.1 4.5Z"/><circle cx="16" cy="4.3" r="1.7"/><circle cx="19" cy="6.6" r="1.35"/><circle cx="20.4" cy="9.8" r="1.15"/><circle cx="20.7" cy="13" r="1"/></g>',
  gauge: '<path d="M12 14.5 16 9"/><path d="M3.3 17a9.5 9.5 0 1 1 17.4 0"/><circle cx="12" cy="14.5" r="1.4"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  run: '<circle cx="15" cy="4.5" r="1.8"/><path d="m6 21 3.5-5.5 3 2.5V22M8 12l3-4.5h4l2 3.5 3 1"/><path d="M11 7.5 9.5 12l3.5 3"/>',
  bike: '<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5 9 9h6l3.5 7.5M9 9l3 7.5h-6.5M13.5 5.5H16l-1 3.5"/>',
  shoe: '<path d="M3 17.5V9.5c0-1 .8-1.5 1.6-1.1L8 10l2.5-3.5L21 14.5v2a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5Z"/><path d="M3 15h18M11.5 10.5l1.5 1M13.5 9l1.5 1"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  flame: '<path d="M12 22c4 0 7-2.7 7-6.8 0-3.6-2.4-6.1-4.3-8.2-.4 1.8-1.4 3-2.7 3.5.4-3.3-.9-6.5-3.5-8.5.2 3.2-1.6 5.3-3 7.4A9 9 0 0 0 5 15.2C5 19.3 8 22 12 22Z"/>',
  clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3 2"/>',
  volume: '<path d="M11 5 6 9H2.5v6H6l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
  download: '<path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',
  upload: '<path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',
  trash: '<path d="M4 6.5h16M9.5 6.5V4h5v2.5M6 6.5l1 14h10l1-14"/>',
  sparkle: '<path d="M12 3c.6 4.1 2.4 6 6.5 6.5-4.1.6-5.9 2.4-6.5 6.5-.6-4.1-2.4-5.9-6.5-6.5C9.6 9 11.4 7.1 12 3ZM19 15c.3 1.8 1 2.6 2.7 2.8-1.7.3-2.4 1-2.7 2.7-.3-1.7-1-2.4-2.7-2.7 1.7-.2 2.4-1 2.7-2.8Z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.5-4.5"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  heart: '<path d="M20.4 5.6a5 5 0 0 0-7.1 0L12 6.9l-1.3-1.3a5 5 0 1 0-7.1 7.1L12 21l8.4-8.3a5 5 0 0 0 0-7.1Z"/>',
  target: '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.5"/>',
  layers: '<path d="m12 3 9.5 5-9.5 5-9.5-5L12 3Z"/><path d="m2.5 13 9.5 5 9.5-5"/>',
  shield: '<path d="M12 21.5s8-3.5 8-10V5l-8-3-8 3v6.5c0 6.5 8 10 8 10Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.5-4.5L3.5 9M4 13a8 8 0 0 0 14.5 4.5l2-2.5"/><path d="M3.5 4v5h5M20.5 20v-5h-5"/>',
  equipment: '<path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"/><path d="M9 8V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V8"/>',
};

export function icon(name, size = 22, cls = '') {
  return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] ?? ''}</svg>`;
}

export function fmtTime(sec) {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function fmtMinutes(sec) {
  const m = Math.round(sec / 60);
  return m < 1 ? '<1 min' : `${m} min`;
}

export function fmtDate(key, opts = { weekday: 'short', day: 'numeric', month: 'short' }) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, opts);
}

// ───────────── Sheets (bottom modal) ─────────────

let sheetClose = null;

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

export function openSheet(html, { onMount, onClose, tall = false } = {}) {
  closeSheet();
  const root = document.getElementById('sheet-root');
  root.innerHTML = `
    <div class="sheet-backdrop" data-sheet-close></div>
    <div class="sheet ${tall ? 'tall' : ''}" role="dialog" aria-modal="true">
      <div class="sheet-grip" aria-hidden="true"></div>
      <button class="iconbtn sheet-x" data-sheet-close aria-label="Close">${icon('x', 18)}</button>
      <div class="sheet-body">${html}</div>
    </div>`;
  root.classList.add('open');
  requestAnimationFrame(() => root.classList.add('shown'));
  const body = root.querySelector('.sheet-body');
  root.querySelectorAll('[data-sheet-close]').forEach((el) => el.addEventListener('click', () => closeSheet()));
  sheetClose = onClose ?? null;
  onMount?.(body);
  return body;
}

export function closeSheet() {
  const root = document.getElementById('sheet-root');
  if (!root || !root.classList.contains('open')) return;
  root.classList.remove('shown');
  const fn = sheetClose;
  sheetClose = null;
  setTimeout(() => { root.classList.remove('open'); root.innerHTML = ''; }, 260);
  fn?.();
}

// ───────────── Toast ─────────────

export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2400);
}

// ───────────── Audio, voice, haptics ─────────────

let ctx = null;
export function unlockAudio() {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch { /* no audio */ }
}

export function beep(freq = 880, dur = 0.12, vol = 0.18) {
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch { /* ignore */ }
}

export function say(text) {
  try {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02;
    u.pitch = 1;
    speechSynthesis.speak(u);
  } catch { /* ignore */ }
}

export function buzz(pattern = 15) {
  try { navigator.vibrate?.(pattern); } catch { /* ignore */ }
}

// ───────────── Wake lock ─────────────

let wakeLock = null;
export async function keepAwake(on) {
  try {
    if (on && 'wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
    else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch { /* not supported or denied */ }
}

/** Area colour as a CSS custom property block. */
export function hueStyle(hue) {
  return `--h:${hue}`;
}
