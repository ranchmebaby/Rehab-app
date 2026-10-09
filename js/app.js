// Footing — app bootstrap & hash router.

import { store } from './store.js';
import { applyTheme } from './theme.js';
import { icon, closeSheet } from './ui.js';
import { renderToday } from './views/today.js';
import { renderPlan } from './views/plan.js';
import { renderLibrary, renderExercise } from './views/library.js';
import { renderProgress } from './views/progress.js';
import { renderLearn, renderArticle, renderReferences } from './views/learn.js';
import { renderSettings } from './views/settings.js';
import { renderOnboarding } from './views/onboarding.js';

const TABS = [
  { route: '', label: 'Today', icon: 'today' },
  { route: 'plan', label: 'Plan', icon: 'plan' },
  { route: 'library', label: 'Library', icon: 'library' },
  { route: 'progress', label: 'Progress', icon: 'progress' },
  { route: 'learn', label: 'Learn', icon: 'learn' },
];

const ROUTES = [
  [/^$/, renderToday, ''],
  [/^plan$/, renderPlan, 'plan'],
  [/^library$/, renderLibrary, 'library'],
  [/^library\/([\w-]+)$/, renderExercise, 'library', ['id']],
  [/^progress$/, renderProgress, 'progress'],
  [/^learn$/, renderLearn, 'learn'],
  [/^learn\/([\w-]+)$/, renderArticle, 'learn', ['id']],
  [/^references$/, renderReferences, 'learn'],
  [/^settings$/, renderSettings, ''],
  [/^onboarding$/, renderOnboarding, null],
];

const app = document.getElementById('app');
const tabbar = document.getElementById('tabbar');
const scrollMemo = {};
let current = null;

const ctx = {
  nav(path) { location.hash = `#/${path}`; },
  refresh() { render(true); },
};

function path() { return location.hash.replace(/^#\/?/, ''); }

function render(keepScroll = false) {
  closeSheet();
  let p = path();
  if (!store.get().plan && p !== 'onboarding') {
    // Learn pages stay readable before onboarding; everything else starts there.
    if (!/^(learn|references)/.test(p)) { history.replaceState(null, '', '#/onboarding'); p = 'onboarding'; }
  }
  if (store.get().plan && p === 'onboarding') { history.replaceState(null, '', '#/'); p = ''; }

  let match = null;
  for (const [re, fn, tab, keys = []] of ROUTES) {
    const m = p.match(re);
    if (m) { match = { fn, tab, params: Object.fromEntries(keys.map((k, i) => [k, m[i + 1]])) }; break; }
  }
  if (!match) { ctx.nav(''); return; }

  if (current && !keepScroll) scrollMemo[current] = window.scrollY;
  const y = keepScroll ? window.scrollY : (scrollMemo[p] ?? 0);

  // A fresh element per render so view-level listeners never stack up.
  const view = document.createElement('div');
  view.className = keepScroll ? '' : 'view';
  app.replaceChildren(view);
  match.fn(view, match.params, ctx);
  current = p;

  const showTabs = match.tab !== null;
  tabbar.classList.toggle('hidden', !showTabs);
  app.classList.toggle('no-tabs', !showTabs);
  tabbar.querySelectorAll('.tab').forEach((t) => {
    const on = t.dataset.route === match.tab;
    t.classList.toggle('active', on);
    if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
  });
  window.scrollTo(0, y);
}

tabbar.innerHTML = `<div class="tabbar-inner">${TABS.map((t) => `
  <a class="tab" href="#/${t.route}" data-route="${t.route}">${icon(t.icon, 24)}<span>${t.label}</span></a>`).join('')}</div>`;

// Global delegation for simple nav buttons.
document.addEventListener('click', (e) => {
  const n = e.target.closest('[data-nav]');
  if (n) { e.preventDefault(); ctx.nav(n.dataset.nav); }
});

window.addEventListener('hashchange', () => render());
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);

// Re-render Today when the date rolls over (e.g. app left open overnight).
let lastDay = new Date().toDateString();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && new Date().toDateString() !== lastDay && !document.querySelector('.player')) {
    lastDay = new Date().toDateString();
    render(true);
  }
});

applyTheme();
render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
