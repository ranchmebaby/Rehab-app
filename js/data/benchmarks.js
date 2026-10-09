// Self-tests you can repeat every 2–4 weeks to see objective progress.

export const BENCHMARKS = [
  {
    id: 'heel-raise',
    name: 'Single-leg heel-raise test',
    unit: 'reps',
    sides: true,
    higherIsBetter: true,
    metronome: 60, // beats per minute: up on one beat, down on the next (30 reps/min)
    target: 'Healthy adults average ~25 reps; runners should aim for 25–30+ with less than 10% difference between sides.',
    how: [
      'Stand on one leg on a flat floor, fingertips on a wall for balance only.',
      'Rise as high as possible and lower all the way, in time with the metronome (up on one beep, down on the next).',
      'Count reps until you can\'t reach full height, lose the rhythm, or lean on the wall.',
      'Rest, then test the other side.',
    ],
    refs: ['hebertlosier2009'],
  },
  {
    id: 'balance-ec',
    name: 'Single-leg balance, eyes closed',
    unit: 's',
    sides: true,
    higherIsBetter: true,
    timer: 30,
    target: 'Aim for 30 s on each side. Big asymmetries often follow ankle sprains.',
    how: [
      'Barefoot, stand on one leg with arms crossed over your chest.',
      'Close your eyes and start the timer.',
      'Stop when the lifted foot touches down, your arms uncross, or the standing foot shifts.',
    ],
    refs: ['mckeon2008'],
  },
  {
    id: 'knee-wall',
    name: 'Knee-to-wall',
    unit: 'cm',
    sides: true,
    higherIsBetter: true,
    target: 'Around 9–12 cm is typical. A side-to-side difference over ~2 cm is worth working on.',
    how: [
      'Kneel-stand facing a wall with the big toe a set distance from it.',
      'Keeping the heel down, touch the knee to the wall.',
      'Inch the foot back until you can just touch. Measure toe-to-wall distance.',
    ],
    refs: [],
  },
  {
    id: 'step-down',
    name: 'Pain-free step-downs',
    unit: 'reps',
    sides: true,
    higherIsBetter: true,
    target: 'Count slow, controlled step-downs from a 20 cm step in 30 s before pain exceeds 2/10 or form breaks.',
    timer: 30,
    how: [
      'Stand side-on on a 20 cm step.',
      'Slowly lower the free heel to tap the floor and return.',
      'Count good-quality reps in 30 seconds, stopping early if pain exceeds 2/10.',
    ],
    refs: ['willy2019'],
  },
];

export const BENCHMARK_MAP = Object.fromEntries(BENCHMARKS.map((b) => [b.id, b]));
