import { ARTICLES, ARTICLE_MAP } from '../data/articles.js';
import { REFERENCES } from '../data/references.js';
import { RED_FLAGS } from '../data/conditions.js';
import { esc, icon } from '../ui.js';
import { refItem } from './library.js';

const HUES = [168, 30, 212, 262, 292, 190, 10];

export function renderLearn(el, _p, ctx) {
  el.innerHTML = `
    <div class="topbar"><div><div class="eyebrow">Know the why</div><h1>Learn</h1></div></div>
    <div class="card flush mt12"><div class="list">${ARTICLES.map((a, i) => `
      <button class="row" data-a="${a.id}"><div class="badge" style="--h:${HUES[i % HUES.length]}">${icon(a.icon, 22)}</div>
        <div class="row-main"><div class="eyebrow" style="font-size:11px">${esc(a.kicker)} · ${a.minutes} min</div><div class="row-title">${esc(a.title)}</div></div>
        <span class="chev">${icon('chevron', 18)}</span></button>`).join('')}</div></div>

    <div class="section">
      <button class="card row" style="border-radius:var(--r)" data-refs>
        <div class="badge" style="--h:212">${icon('library', 22)}</div>
        <div class="row-main"><div class="row-title">All references</div><div class="row-sub">${Object.keys(REFERENCES).length} peer-reviewed sources</div></div>
        <span class="chev">${icon('chevron', 18)}</span></button>
    </div>
    <p class="subtle mt16" style="padding:0 4px">Footing is an education and self-management tool, not a medical device or a substitute for individual assessment.</p>`;
  el.addEventListener('click', (e) => {
    const a = e.target.closest('[data-a]');
    if (a) ctx.nav(`learn/${a.dataset.a}`);
    if (e.target.closest('[data-refs]')) ctx.nav('references');
  });
}

export function renderArticle(el, { id }, ctx) {
  const a = ARTICLE_MAP[id];
  if (!a) return ctx.nav('learn');
  const body = a.body.map((b) => {
    if (b.h) return `<h3>${esc(b.h)}</h3>`;
    if (b.p) return `<p>${esc(b.p)}</p>`;
    if (b.list) return `<ul>${b.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    if (b.callout) return `<div class="callout ${b.tone === 'warn' ? 'warn' : ''}">${icon(b.tone === 'warn' ? 'alert' : 'info', 20)}<div>${esc(b.callout)}</div></div>`;
    if (b.redflags) return `<div class="card"><ul class="flag-list">${RED_FLAGS.map((f) => `<li>${icon('alert', 18)}<span>${esc(f)}</span></li>`).join('')}</ul></div><div class="spacer"></div>`;
    if (b.refs) return `<h3>Sources</h3><div class="card">${b.refs.map((r) => refItem(REFERENCES[r])).join('')}</div>`;
    return '';
  }).join('');
  el.innerHTML = `
    <div class="backbar"><button class="iconbtn" data-back aria-label="Back">${icon('back', 20)}</button><span class="title">Learn</span></div>
    <article class="article mt8"><div class="eyebrow">${esc(a.kicker)} · ${a.minutes} min read</div><h1>${esc(a.title)}</h1>${body}</article>`;
  el.querySelector('[data-back]').addEventListener('click', () => history.back());
}

export function renderReferences(el) {
  const refs = Object.values(REFERENCES).sort((a, b) => a.authors.localeCompare(b.authors));
  el.innerHTML = `
    <div class="backbar"><button class="iconbtn" data-back aria-label="Back">${icon('back', 20)}</button><span class="title">Learn</span></div>
    <div class="topbar" style="padding-top:4px"><div><div class="eyebrow">${refs.length} sources</div><h1>References</h1></div></div>
    <p class="muted" style="padding:0 4px">Every exercise, dose and rule in this app traces back to these studies and guidelines. Tap any to open it on PubMed.</p>
    <div class="card mt12">${refs.map(refItem).join('')}</div>`;
  el.querySelector('[data-back]').addEventListener('click', () => history.back());
}
