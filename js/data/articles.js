// Short, evidence-grounded education pieces. Block types:
//   { p }   paragraph        { h }   subheading
//   { list } bullet list     { callout, tone } highlighted note
//   { refs } reference ids for "Sources"

export const ARTICLES = [
  {
    id: 'flat-feet',
    title: 'Flat feet: what the evidence actually says',
    kicker: 'Myth-busting',
    minutes: 4,
    icon: 'foot',
    body: [
      { p: 'A low or "collapsing" arch is one of the most common things runners worry about. The reassuring news: for most people, foot shape on its own is a weak predictor of injury.' },
      { h: 'Shape is not destiny' },
      { p: 'A meta-analysis of prospective studies found a pronated (flatter) foot posture is at most a small risk factor, mainly for shin pain and kneecap pain. In a cohort of 927 novice runners in neutral shoes, pronated feet were not injured more often than neutral feet.' },
      { h: 'Capacity is trainable' },
      { p: 'What does seem to matter is how strong and well-controlled the foot is. The small intrinsic muscles act as a "foot core" that supports the arch. Four weeks of short-foot training raised arch height and improved balance, and an 8-week foot-core programme reduced running injuries in a randomised trial.' },
      { h: 'When a flat foot is a problem' },
      { p: 'If one arch is flattening over months with pain and swelling behind the inner ankle bone, the tibialis posterior tendon may be struggling (adult-acquired flatfoot). That deserves a clinical assessment. In early stages, progressive tibialis posterior strengthening — often with an orthosis — is the best-supported conservative care.' },
      { callout: 'Your programme targets both: foot-core control (short-foot, toe yoga) and tendon capacity (arch-lift heel raises, banded adduction).', tone: 'info' },
      { refs: ['neal2014', 'nielsen2014', 'mckeon2015', 'mulligan2013', 'taddei2020', 'kulig2009', 'ross2018'] },
    ],
  },
  {
    id: 'pain-monitoring',
    title: 'The pain-monitoring rules',
    kicker: 'How to train through it',
    minutes: 3,
    icon: 'gauge',
    body: [
      { p: 'Complete rest rarely fixes tendon and fascia problems — tissues need load to adapt. In a landmark trial, people with Achilles pain who kept running using simple pain rules did as well as those who rested.' },
      { h: 'The rules' },
      { list: [
        'During exercise or a run, pain up to 5/10 is acceptable.',
        'Pain should settle back to your usual level by the next morning.',
        'Pain and stiffness should not be getting progressively worse week to week.',
      ] },
      { h: 'How the app uses them' },
      { list: [
        'Green (0–2): train as planned.',
        'Amber (3–5): train as planned but don\'t add load today.',
        'Red (6+), or morning pain up 2+ points from your recent average: the app switches to a lighter session (half the sets, no hopping).',
      ] },
      { callout: 'These rules apply to tendon and fascia overload pain. Sharp, sudden, or night pain is different — see the red flags.', tone: 'warn' },
      { refs: ['silbernagel2007', 'martin2018'] },
    ],
  },
  {
    id: 'loading',
    title: 'Why heavy and slow works',
    kicker: 'Principles',
    minutes: 3,
    icon: 'dumbbell',
    body: [
      { p: 'Tendons and the plantar fascia adapt to load, but slowly — collagen turnover takes weeks to months. That is why every programme here runs 12 weeks and why slow tempos matter.' },
      { h: 'What the trials did' },
      { list: [
        'Plantar heel pain: single-leg heel raises with toes on a towel, 3 s up / 2 s hold / 3 s down, every other day, progressing from 12 to 8 reps as load increased.',
        'Achilles: heavy slow resistance (3 s up / 3 s down), 3×/week, progressing from ~15RM to ~6RM over 12 weeks.',
        'Flatfoot (PTTD): progressive resistance for tibialis posterior with elastic tubing and heel raises.',
      ] },
      { h: 'Making it heavy' },
      { p: 'From the Build phase, add load (a backpack with books works well) so the last two reps of each set are genuinely hard while form stays clean. When a set feels easy for two sessions, add weight.' },
      { callout: 'Strength training cut sports injuries to less than a third in a meta-analysis — stretching alone showed no protective effect.', tone: 'info' },
      { refs: ['rathleff2015', 'beyer2015', 'kulig2009', 'lauersen2014'] },
    ],
  },
  {
    id: 'return-to-run',
    title: 'Returning to running',
    kicker: 'Load management',
    minutes: 4,
    icon: 'run',
    body: [
      { p: 'Most running injuries are a mismatch between load and capacity. Your strength sessions raise capacity; managing your running controls load.' },
      { h: 'Before you start' },
      { list: [
        'Walk briskly for 30 minutes without pain.',
        'Do 20+ single-leg heel raises on each side with ≤10% difference.',
        'Hop 20 times on each leg with pain ≤2/10.',
      ] },
      { h: 'A simple walk-run progression' },
      { list: [
        'Week 1: 5 × (1 min run / 2 min walk), every other day.',
        'Week 2: 5 × (2 min run / 1 min walk).',
        'Week 3: 4 × (4 min run / 1 min walk).',
        'Week 4: 20–25 min continuous easy running.',
        'Only progress if the pain-monitoring rules were respected for the previous 2 runs.',
      ] },
      { h: 'Rules of thumb, not laws' },
      { p: 'A rigid "10% per week" rule didn\'t reduce injuries in novice runners compared with a standard plan, so let symptoms — not a percentage — set your pace. Increasing step rate by 5–10% reduces load at the knee and hip and is worth trying if you have knee pain.' },
      { refs: ['buist2008', 'heiderscheit2011', 'silbernagel2007', 'hebertlosier2009'] },
    ],
  },
  {
    id: 'cycling',
    title: 'For cyclists: fit, feet and knees',
    kicker: 'On the bike',
    minutes: 3,
    icon: 'bike',
    body: [
      { p: 'Cycling is low-impact, so problems usually come from repetition and position — 5,000+ pedal strokes an hour.' },
      { h: 'Check your fit' },
      { list: [
        'Saddle too low commonly loads the front of the knee; too high strains the back of the knee and Achilles. Many fitters aim for ~25–30° of knee bend at the bottom of the stroke.',
        'Cleat position affects arch and knee alignment. Flat-footed riders often benefit from arch support or varus wedging in cycling shoes.',
        'Sudden mileage jumps or big gear grinding are classic triggers for knee pain.',
      ] },
      { h: 'Off the bike' },
      { p: 'Hip and knee strengthening is the best-supported treatment for kneecap pain whether it comes from running or riding. Trunk endurance and hip-flexor mobility help with long-ride back stiffness.' },
      { refs: ['bini2011', 'willy2019', 'hayden2021'] },
    ],
  },
  {
    id: 'footwear',
    title: 'Shoes, orthoses and barefoot time',
    kicker: 'Equipment',
    minutes: 3,
    icon: 'shoe',
    body: [
      { p: 'There is no shoe that prevents injury for everyone. Comfort is a reasonable guide when choosing running shoes.' },
      { h: 'Orthoses' },
      { p: 'Foot orthoses can reduce pain in the short term for adult-acquired flatfoot and plantar heel pain, and the best PTTD trials combined them with exercise. Think of them as a support while you build capacity, not a replacement for it.' },
      { h: 'Barefoot and minimalist time' },
      { p: 'Gradually walking in minimalist shoes strengthened foot muscles about as much as a dedicated exercise programme. Build up slowly — start with 10–15 minutes a day of walking around the house barefoot, adding time weekly — and don\'t start minimalist running during a flare.' },
      { refs: ['kulig2009', 'koc2023', 'ridge2019'] },
    ],
  },
  {
    id: 'red-flags',
    title: 'When to see a clinician',
    kicker: 'Safety',
    minutes: 2,
    icon: 'alert',
    body: [
      { p: 'This app is a self-management tool based on published research. It is not a diagnosis. See a physiotherapist, sports physician, podiatrist or your doctor if:' },
      { redflags: true },
      { p: 'Also seek help if you are not improving after 6–8 weeks of consistent work, or if pain is steadily getting worse.' },
    ],
  },
];

export const ARTICLE_MAP = Object.fromEntries(ARTICLES.map((a) => [a.id, a]));
