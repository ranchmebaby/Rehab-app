import test from 'node:test';
import assert from 'node:assert/strict';
import { EXERCISES, EXERCISE_MAP, AREAS, CATEGORIES, GRADES } from '../js/data/exercises.js';
import { CONDITIONS } from '../js/data/conditions.js';
import { REFERENCES } from '../js/data/references.js';
import { ARTICLES } from '../js/data/articles.js';
import { BENCHMARKS } from '../js/data/benchmarks.js';
import {
  buildSession, buildSteps, programmeExercises, painAdvice, streak, doseFor,
  estimateSeconds, restSeconds, readyToAdvance, symmetry, dayKey, strengthOrdinal,
} from '../js/engine.js';

const plan = (o = {}) => ({ conditions: ['flatfoot'], phase: 1, minutes: 25, strengthDays: [0, 2, 4], phaseStart: '2026-01-05', ...o });
const MON = new Date(2026, 0, 5);
const TUE = new Date(2026, 0, 6);

test('exercise data is complete and consistent', () => {
  const ids = new Set();
  for (const ex of EXERCISES) {
    assert.ok(!ids.has(ex.id), `duplicate id ${ex.id}`);
    ids.add(ex.id);
    assert.ok(AREAS[ex.area], `${ex.id} area`);
    assert.ok(CATEGORIES[ex.category], `${ex.id} category`);
    assert.ok(GRADES[ex.evidence.grade], `${ex.id} grade`);
    assert.equal(ex.dose.length, 3, `${ex.id} needs 3 phase doses`);
    assert.ok(ex.steps.length >= 2 && ex.cues.length && ex.mistakes.length, `${ex.id} instructions`);
    for (const r of ex.evidence.refs) assert.ok(REFERENCES[r], `${ex.id} unknown ref ${r}`);
    if (ex.evidence.grade !== 'C') assert.ok(ex.evidence.refs.length, `${ex.id} graded ${ex.evidence.grade} needs refs`);
    for (const d of ex.dose) {
      assert.ok(d.sets >= 1 && d.reps >= 1, `${ex.id} dose`);
      const tempo = d.tempo ?? ex.tempo;
      if (tempo) assert.ok(tempo.every((p) => p.s > 0 && p.label), `${ex.id} tempo`);
      else assert.ok(ex.secPerRep, `${ex.id} self-paced needs secPerRep`);
    }
  }
});

test('conditions, articles and benchmarks reference real ids', () => {
  for (const c of CONDITIONS) {
    for (const p of c.programme) assert.ok(EXERCISE_MAP[p.id], `${c.id} -> ${p.id}`);
    for (const r of c.keyRefs) assert.ok(REFERENCES[r], `${c.id} ref ${r}`);
    for (let ph = 1; ph <= 3; ph++) assert.ok(programmeExercises([c.id], ph).length >= 3, `${c.id} phase ${ph} too thin`);
  }
  for (const a of ARTICLES) for (const b of a.body) if (b.refs) for (const r of b.refs) assert.ok(REFERENCES[r], `${a.id} ref ${r}`);
  for (const b of BENCHMARKS) for (const r of b.refs) assert.ok(REFERENCES[r], `${b.id} ref ${r}`);
});

test('every reference is cited somewhere', () => {
  const used = new Set();
  EXERCISES.forEach((e) => e.evidence.refs.forEach((r) => used.add(r)));
  CONDITIONS.forEach((c) => c.keyRefs.forEach((r) => used.add(r)));
  ARTICLES.forEach((a) => a.body.forEach((b) => b.refs?.forEach((r) => used.add(r))));
  BENCHMARKS.forEach((b) => b.refs.forEach((r) => used.add(r)));
  for (const id of Object.keys(REFERENCES)) assert.ok(used.has(id), `orphan reference ${id}`);
});

test('strength day includes strength work; light day does not', () => {
  const s = buildSession(plan(), MON);
  assert.equal(s.type, 'strength');
  assert.ok(s.items.some((i) => EXERCISE_MAP[i.id].category === 'strength'));
  const l = buildSession(plan(), TUE);
  assert.equal(l.type, 'light');
  assert.ok(l.items.length > 0);
  for (const i of l.items) {
    const ex = EXERCISE_MAP[i.id];
    assert.ok(['foot-core', 'balance', 'mobility'].includes(ex.category) || ex.daily, i.id);
  }
});

test('session respects the time budget', () => {
  const all = CONDITIONS.map((c) => c.id);
  for (const minutes of [10, 20, 35]) {
    const s = buildSession(plan({ conditions: all, minutes, phase: 2 }), MON);
    assert.ok(s.seconds <= minutes * 60 || s.items.length <= 2, `${minutes} min -> ${s.seconds}s`);
    assert.ok(s.items.length >= 2);
  }
});

test('round-robin keeps each condition represented', () => {
  const ids = programmeExercises(['plantar', 'knee'], 1);
  assert.equal(ids[0], 'rathleff-raise');
  assert.equal(ids[1], 'side-abduction');
});

test('phase progression changes dose and unlocks plyometrics', () => {
  const ex = EXERCISE_MAP['rathleff-raise'];
  assert.deepEqual([1, 2, 3].map((p) => doseFor(ex, p).reps), [12, 10, 8]);
  assert.ok(!programmeExercises(['achilles'], 2).includes('pogo-hops'));
  assert.ok(programmeExercises(['achilles'], 3).includes('pogo-hops'));
  assert.ok(programmeExercises(['achilles'], 1).includes('calf-iso'));
  assert.ok(!programmeExercises(['achilles'], 2).includes('calf-iso'));
});

test('perWeek limits exercises to the first N strength days', () => {
  const p = plan({ conditions: ['hamstring'], minutes: 40 });
  assert.equal(strengthOrdinal(p.strengthDays, new Date(2026, 0, 9)), 2);
  assert.ok(buildSession(p, MON).items.some((i) => i.id === 'nordic'));
  assert.ok(!buildSession(p, new Date(2026, 0, 9)).items.some((i) => i.id === 'nordic'));
});

test('deload halves sets and drops plyometrics', () => {
  const p = plan({ conditions: ['achilles'], phase: 3, minutes: 40 });
  const normal = buildSession(p, MON);
  const light = buildSession(p, MON, { deload: true });
  assert.ok(normal.items.some((i) => i.id === 'pogo-hops'));
  assert.ok(!light.items.some((i) => i.id === 'pogo-hops'));
  const n = normal.items.find((i) => i.id === 'calf-raise').dose.sets;
  const d = light.items.find((i) => i.id === 'calf-raise').dose.sets;
  assert.equal(d, Math.ceil(n / 2));
});

test('steps cover every set and side', () => {
  const s = buildSession(plan(), MON);
  const steps = buildSteps(s);
  for (const item of s.items) {
    const ex = EXERCISE_MAP[item.id];
    const work = steps.filter((x) => x.kind === 'work' && x.id === item.id);
    assert.equal(work.length, item.dose.sets * (ex.perSide ? 2 : 1), item.id);
  }
  assert.equal(steps[0].kind, 'intro');
  assert.notEqual(steps.at(-1).kind, 'rest');
});

test('pain advice follows the pain-monitoring model', () => {
  const c = (date, pain) => ({ date, pain });
  assert.equal(painAdvice([c('2026-01-05', 1)], '2026-01-05').level, 'green');
  assert.equal(painAdvice([c('2026-01-05', 4)], '2026-01-05').level, 'amber');
  assert.equal(painAdvice([c('2026-01-05', 7)], '2026-01-05').level, 'red');
  const jump = painAdvice([c('2026-01-03', 1), c('2026-01-04', 1), c('2026-01-05', 3)], '2026-01-05');
  assert.equal(jump.level, 'red');
  assert.ok(jump.deload);
  assert.equal(painAdvice([], '2026-01-05'), null);
});

test('streak counts consecutive days', () => {
  const s = (date) => ({ date });
  assert.equal(streak([s('2026-01-03'), s('2026-01-04'), s('2026-01-05')], '2026-01-05'), 3);
  assert.equal(streak([s('2026-01-03'), s('2026-01-04')], '2026-01-05'), 2);
  assert.equal(streak([s('2026-01-02')], '2026-01-05'), 0);
});

test('readiness requires time, sessions and low pain', () => {
  const p = plan();
  const sessions = Array.from({ length: 12 }, (_, i) => ({ date: dayKey(new Date(2026, 0, 5 + i * 2)), phase: 1 }));
  assert.ok(readyToAdvance(p, sessions, [], '2026-02-03'));
  assert.ok(!readyToAdvance(p, sessions, [], '2026-01-20'));
  assert.ok(!readyToAdvance(p, sessions, [{ date: '2026-02-02', pain: 6 }], '2026-02-03'));
  assert.ok(!readyToAdvance({ ...p, phase: 3 }, sessions, [], '2026-02-03'));
});

test('alternating sides shortens rest but never below 15 s', () => {
  const r = EXERCISE_MAP['rathleff-raise'];
  assert.equal(restSeconds(r, doseFor(r, 1)), 15);
  const w = EXERCISE_MAP['wall-sit'];
  assert.equal(restSeconds(w, doseFor(w, 1)), 45);
});

test('symmetry and estimates are sane', () => {
  assert.equal(symmetry(20, 25), 80);
  assert.equal(symmetry(0, 25), null);
  const ex = EXERCISE_MAP['calf-raise'];
  const secs = estimateSeconds(ex, doseFor(ex, 1));
  assert.ok(secs > 300 && secs < 900, String(secs));
});
