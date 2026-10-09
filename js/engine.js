// Pure programme logic — no DOM. Imported by the app and by the tests.

import { EXERCISE_MAP, CATEGORIES } from './data/exercises.js';
import { CONDITION_MAP, PHASES } from './data/conditions.js';

export const DAY_MS = 86400000;

/** Local-date key, e.g. "2026-10-09". */
export function dayKey(d = new Date()) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}

export function parseDay(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(a, b) {
  return Math.round((parseDay(b) - parseDay(a)) / DAY_MS);
}

/** Dose for an exercise at a phase (1-based). Falls back to the closest defined phase. */
export function doseFor(ex, phase) {
  const d = ex.dose[Math.min(Math.max(phase, 1), ex.dose.length) - 1];
  return { ...d, tempo: d.tempo ?? ex.tempo };
}

export function repSeconds(ex, dose) {
  if (!dose.tempo) return ex.secPerRep ?? 3;
  return dose.tempo.reduce((s, p) => s + p.s, 0);
}

/**
 * Rest between sets. For single-leg work each leg already rests while the other
 * works, so the pause after a pair of sides is shortened by that time.
 */
export function restSeconds(ex, dose) {
  if (!dose.rest) return 0;
  if (!ex.perSide) return dose.rest;
  return Math.max(15, dose.rest - dose.reps * repSeconds(ex, dose));
}

/** Estimated seconds for one exercise including rests, side switches and set-up. */
export function estimateSeconds(ex, dose) {
  const sides = ex.perSide ? 2 : 1;
  const work = dose.sets * sides * dose.reps * repSeconds(ex, dose);
  const switches = ex.perSide ? dose.sets * 5 : 0;
  const rests = (dose.sets - 1) * restSeconds(ex, dose);
  return Math.round(work + switches + rests + 15);
}

/** Human-readable dosage, e.g. "3 × 10 · each side". */
export function doseLabel(ex, dose) {
  const t = dose.tempo;
  const isHold = t && t.length === 1;
  const reps = isHold ? `${t[0].s} s` : `${dose.reps}`;
  const count = dose.sets === 1 && !isHold ? `${reps} reps` : `${dose.sets} × ${reps}`;
  return `${count}${ex.perSide ? ' · each side' : ''}`;
}

export function tempoLabel(dose) {
  if (!dose.tempo) return 'Self-paced';
  if (dose.tempo.length === 1) return `${dose.tempo[0].label} ${dose.tempo[0].s} s`;
  return dose.tempo.map((p) => `${p.s}s ${p.label.toLowerCase()}`).join(' · ');
}

/** Monday-based weekday index 0..6 */
export function weekday(d = new Date()) {
  return (new Date(d).getDay() + 6) % 7;
}

/**
 * Exercises in the programme for the selected conditions at a phase,
 * merged round-robin so each condition gets its top priorities first.
 */
export function programmeExercises(conditions, phase) {
  const lists = conditions
    .map((id) => CONDITION_MAP[id])
    .filter(Boolean)
    .map((c) => c.programme.filter((p) => phase >= p.from && phase <= (p.to ?? 3)).map((p) => p.id));
  const out = [];
  const max = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < max; i++) {
    for (const l of lists) {
      const id = l[i];
      if (id && !out.includes(id) && EXERCISE_MAP[id]) out.push(id);
    }
  }
  return out.filter((id) => !(EXERCISE_MAP[id].minPhase > phase));
}

/** Which ordinal strength day of the week is `date` (0-based), or -1 if not a strength day. */
export function strengthOrdinal(strengthDays, date) {
  const wd = weekday(date);
  if (!strengthDays.includes(wd)) return -1;
  return [...strengthDays].sort((a, b) => a - b).indexOf(wd);
}

/**
 * Build the session for a given date.
 * Strength days get everything; other days get foot-core, balance, mobility and
 * any exercise flagged `daily`. Sessions are trimmed to the time budget.
 */
export function buildSession(plan, date = new Date(), { deload = false } = {}) {
  const phase = plan.phase;
  const ord = strengthOrdinal(plan.strengthDays, date);
  const isStrength = ord >= 0;
  let ids = programmeExercises(plan.conditions, phase);

  ids = ids.filter((id) => {
    const ex = EXERCISE_MAP[id];
    if (!isStrength) return ['foot-core', 'balance', 'mobility'].includes(ex.category) || ex.daily;
    if (ex.perWeek && ord >= ex.perWeek) return false;
    return true;
  });
  if (deload) ids = ids.filter((id) => EXERCISE_MAP[id].category !== 'plyo');

  const budget = (isStrength ? plan.minutes : Math.min(plan.minutes, 15)) * 60;
  const items = [];
  let total = 0;
  for (const id of ids) {
    const ex = EXERCISE_MAP[id];
    const dose = doseFor(ex, phase);
    if (deload) dose.sets = Math.max(1, Math.ceil(dose.sets / 2));
    const secs = estimateSeconds(ex, dose);
    if (items.length >= 2 && total + secs > budget) continue;
    items.push({ id, dose, secs });
    total += secs;
  }
  items.sort((a, b) => CATEGORIES[EXERCISE_MAP[a.id].category].order - CATEGORIES[EXERCISE_MAP[b.id].category].order);

  return {
    date: dayKey(date),
    phase,
    type: isStrength ? 'strength' : 'light',
    title: isStrength ? 'Strength session' : 'Foot core & mobility',
    deload,
    items,
    seconds: total,
  };
}

/**
 * Flatten a session into a timeline of steps the player walks through.
 * kinds: 'intro' (get ready), 'work', 'switch' (change sides), 'rest'
 */
export function buildSteps(session) {
  const steps = [];
  session.items.forEach((item, idx) => {
    const ex = EXERCISE_MAP[item.id];
    const { dose } = item;
    steps.push({ kind: 'intro', exIndex: idx, id: item.id, duration: idx === 0 ? 10 : 15 });
    for (let set = 1; set <= dose.sets; set++) {
      const sides = ex.perSide ? ['Left', 'Right'] : [null];
      sides.forEach((side, si) => {
        if (si > 0) steps.push({ kind: 'switch', exIndex: idx, id: item.id, set, side, duration: 5 });
        steps.push({ kind: 'work', exIndex: idx, id: item.id, set, sets: dose.sets, side, reps: dose.reps, tempo: dose.tempo });
      });
      if (set < dose.sets && dose.rest) {
        steps.push({ kind: 'rest', exIndex: idx, id: item.id, set, duration: restSeconds(ex, dose) });
      }
    }
  });
  return steps;
}

// ───────────────────────── Pain monitoring ─────────────────────────

/** Traffic-light advice from today's morning pain and the recent baseline. */
export function painAdvice(checkins, today = dayKey()) {
  const todayEntry = checkins.find((c) => c.date === today);
  if (!todayEntry) return null;
  const recent = checkins
    .filter((c) => c.date < today && daysBetween(c.date, today) <= 7)
    .map((c) => c.pain);
  const baseline = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : null;
  const p = todayEntry.pain;
  const jump = baseline !== null && p - baseline >= 2;
  if (p >= 6 || jump) {
    return {
      level: 'red',
      title: 'Ease off today',
      text: jump
        ? `Morning pain is up ${Math.round(p - baseline)} points on your recent average. Today's session is lighter — half the sets, no hopping.`
        : 'Pain is high this morning. Today\'s session is lighter — half the sets, no hopping. If this persists for several days, check in with a clinician.',
      deload: true,
    };
  }
  if (p >= 3) {
    return { level: 'amber', title: 'Train, but hold the load', text: 'Acceptable range. Do your session as planned but don\'t add weight today. Pain during should stay ≤5/10.', deload: false };
  }
  return { level: 'green', title: 'Good to go', text: 'Low pain this morning. Train as planned — if a set felt easy last time, add a little load.', deload: false };
}

// ───────────────────────── Progress ─────────────────────────

/** Consecutive days (ending today or yesterday) with a completed session. */
export function streak(sessions, today = dayKey()) {
  const days = new Set(sessions.map((s) => s.date));
  let d = parseDay(today);
  if (!days.has(today)) d = new Date(d.getTime() - DAY_MS);
  let n = 0;
  while (days.has(dayKey(d))) {
    n++;
    d = new Date(d.getTime() - DAY_MS);
  }
  return n;
}

export function weekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return new Date(d.getTime() - weekday(d) * DAY_MS);
}

export function phaseWeek(plan, today = dayKey()) {
  return Math.floor(daysBetween(plan.phaseStart, today) / 7) + 1;
}

/** Suggest moving to the next phase once time, consistency and pain criteria are met. */
export function readyToAdvance(plan, sessions, checkins, today = dayKey()) {
  if (plan.phase >= PHASES.length) return false;
  const weeks = PHASES[plan.phase - 1].weeks;
  const inPhase = sessions.filter((s) => s.date >= plan.phaseStart && s.phase === plan.phase);
  const lastWeek = checkins.filter((c) => daysBetween(c.date, today) < 7 && c.date <= today);
  const avgPain = lastWeek.length ? lastWeek.reduce((a, c) => a + c.pain, 0) / lastWeek.length : 0;
  return daysBetween(plan.phaseStart, today) >= weeks * 7 && inPhase.length >= weeks * 3 && avgPain <= 3;
}

/** Limb symmetry index (weaker / stronger × 100). */
export function symmetry(left, right) {
  if (!left || !right) return null;
  return Math.round((Math.min(left, right) / Math.max(left, right)) * 100);
}
