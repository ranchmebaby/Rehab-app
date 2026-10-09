// Tiny SVG chart helpers. Hover/tap any mark with a data-tip to see its value.

import { esc, fmtDate } from './ui.js';
import { parseDay, DAY_MS, dayKey } from './engine.js';

const W = 340;

/**
 * Line chart over dates.
 * series: [{ name, color, points: [{ date, y }] }]
 */
export function lineChart({ series, days = 30, yMin = 0, yMax, height = 150, unit = '', today = dayKey() }) {
  const H = height;
  const pad = { l: 26, r: 8, t: 10, b: 22 };
  const end = parseDay(today).getTime();
  const start = end - (days - 1) * DAY_MS;
  const all = series.flatMap((s) => s.points.map((p) => p.y));
  const top = yMax ?? Math.max(4, Math.ceil((Math.max(...all, 1) * 1.15) / 5) * 5);
  const x = (date) => pad.l + ((parseDay(date).getTime() - start) / (end - start || 1)) * (W - pad.l - pad.r);
  const y = (v) => pad.t + (1 - (v - yMin) / (top - yMin)) * (H - pad.t - pad.b);

  const ticks = [yMin, (yMin + top) / 2, top];
  let svg = ticks.map((t) => `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y(t)}" y2="${y(t)}"/><text class="axis" x="${pad.l - 6}" y="${y(t) + 4}" text-anchor="end">${Math.round(t)}</text>`).join('');
  [0, Math.floor(days / 2), days - 1].forEach((i) => {
    const k = dayKey(new Date(start + i * DAY_MS));
    svg += `<text class="axis" x="${x(k)}" y="${H - 4}" text-anchor="${i === 0 ? 'start' : i === days - 1 ? 'end' : 'middle'}">${fmtDate(k, { day: 'numeric', month: 'short' })}</text>`;
  });

  for (const s of series) {
    const pts = s.points.filter((p) => parseDay(p.date).getTime() >= start).sort((a, b) => a.date.localeCompare(b.date));
    if (!pts.length) continue;
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)},${y(p.y).toFixed(1)}`).join('');
    if (pts.length > 1) svg += `<path class="line" d="${d}" stroke="${s.color}"/>`;
    pts.forEach((p, i) => {
      const last = i === pts.length - 1;
      svg += `<circle class="pt" cx="${x(p.date)}" cy="${y(p.y)}" r="${last ? 5 : 3.5}" fill="${s.color}"/>`;
      svg += `<circle class="hit" cx="${x(p.date)}" cy="${y(p.y)}" r="14" data-tip="${esc(`${series.length > 1 ? s.name + ' · ' : ''}${p.y}${unit} · ${fmtDate(p.date)}`)}"/>`;
    });
  }
  return `<div class="chart-wrap"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${svg}</svg><div class="chart-tip"></div></div>`;
}

/** Bar chart. bars: [{ label, value, tip }] */
export function barChart({ bars, height = 140, color = 'var(--accent)' }) {
  const H = height;
  const pad = { l: 8, r: 8, t: 10, b: 22 };
  const max = Math.max(1, ...bars.map((b) => b.value));
  const bw = (W - pad.l - pad.r) / bars.length;
  const inner = Math.min(28, bw - 6);
  let svg = `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${H - pad.b}" y2="${H - pad.b}"/>`;
  bars.forEach((b, i) => {
    const h = (b.value / max) * (H - pad.t - pad.b);
    const cx = pad.l + bw * i + bw / 2;
    const yTop = H - pad.b - h;
    if (b.value > 0) {
      const r = Math.min(4, h);
      svg += `<path d="M${cx - inner / 2},${H - pad.b} V${yTop + r} Q${cx - inner / 2},${yTop} ${cx - inner / 2 + r},${yTop} H${cx + inner / 2 - r} Q${cx + inner / 2},${yTop} ${cx + inner / 2},${yTop + r} V${H - pad.b} Z" fill="${color}" opacity="${i === bars.length - 1 ? 1 : 0.55}"/>`;
    }
    svg += `<rect class="hit" x="${cx - bw / 2}" y="${pad.t}" width="${bw}" height="${H - pad.t - pad.b}" data-tip="${esc(b.tip)}"/>`;
    svg += `<text class="axis" x="${cx}" y="${H - 5}" text-anchor="middle">${esc(b.label)}</text>`;
  });
  return `<div class="chart-wrap"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${svg}</svg><div class="chart-tip"></div></div>`;
}

/** 12-week consistency heatmap (Mon-Sun rows). */
export function heatmap(sessions, weeks = 12, today = dayKey()) {
  const count = {};
  sessions.forEach((s) => { count[s.date] = (count[s.date] || 0) + 1; });
  const t = parseDay(today);
  const monday = new Date(t.getTime() - ((t.getDay() + 6) % 7) * DAY_MS);
  const start = new Date(monday.getTime() - (weeks - 1) * 7 * DAY_MS);
  let cells = '';
  for (let i = 0; i < weeks * 7; i++) {
    const d = dayKey(new Date(start.getTime() + i * DAY_MS));
    const n = count[d] || 0;
    const fut = d > today;
    cells += `<i class="${n ? 'l2' : ''} ${fut ? 'fut' : ''}" data-tip="${esc(`${fmtDate(d)} · ${n ? n + ' session' + (n > 1 ? 's' : '') : 'rest'}`)}"></i>`;
  }
  return `<div class="chart-wrap"><div class="heat" style="grid-template-columns:repeat(${weeks},1fr)">${cells}</div><div class="chart-tip"></div></div>`;
}

/** Global tooltip handling for any [data-tip] inside a .chart-wrap. */
export function wireTooltips(root) {
  const show = (e) => {
    const el = e.target.closest?.('[data-tip]');
    const wrap = e.target.closest?.('.chart-wrap');
    root.querySelectorAll('.chart-tip').forEach((t) => { if (!wrap || t.parentElement !== wrap) t.style.opacity = 0; });
    if (!el || !wrap) return;
    const tip = wrap.querySelector('.chart-tip');
    const r = el.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    tip.textContent = el.dataset.tip;
    const cx = Math.min(Math.max(r.left + r.width / 2 - wr.left, 60), wr.width - 60);
    tip.style.left = `${cx}px`;
    tip.style.top = `${r.top - wr.top + (el.tagName === 'circle' ? r.height / 2 - 6 : 0)}px`;
    tip.style.opacity = 1;
  };
  root.addEventListener('pointerover', show);
  root.addEventListener('pointerdown', show);
}
