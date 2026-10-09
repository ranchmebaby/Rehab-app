# Footing

**Evidence-based rehab for runners and cyclists** — collapsing arches, plantar heel pain, Achilles tendinopathy, runner's/cyclist's knee, IT band, shin splints, ankle instability, hamstring/groin and on-bike low back stiffness.

Footing is an installable web app (PWA). It runs on iPhone and Android from a single link, works offline, and keeps all data on the device. No account and no tracking.

## What it does

- **Personalised 12-week programme.** Pick up to 3 problems. The app blends their protocols across three phases (Foundation → Build → Perform), and the dose progresses automatically (e.g. Rathleff heel raises go from 3×12 to 4×10 to 5×8, the way the trial did it).
- **Guided session player.** Every rep is paced by its tempo (e.g. *Rise 3s · Hold 2s · Lower 3s*), with hold timers, left/right side switching, rest countdowns, beeps, a voice coach, vibration and a screen wake-lock.
- **Pain-monitoring model** (Silbernagel 2007). A 0–10 morning check-in gives green, amber or red advice. A red day automatically switches to a lighter session: half the sets and no plyometrics.
- **Progress tracking.** Streak, 12-week consistency heatmap, pain trend, logged runs and rides, and repeatable benchmark tests: single-leg heel-raise test with metronome, eyes-closed balance, knee-to-wall, step-downs. Tests show left/right symmetry.
- **Phase gating.** The app suggests moving up a phase only once time in phase, number of sessions and pain criteria are all met.
- **36 exercises.** Each has step-by-step instructions, coaching cues, common mistakes, easier/harder options, a dose for each phase, and an **evidence grade (A/B/C)** with the cited studies.
- **Learn section.** Short reads on flat-foot myths, pain rules, heavy-slow loading, return-to-run, bike fit and footwear, plus red flags. 32 peer-reviewed references, each linked to PubMed.

## Install on a phone

After it's deployed (see below), open the URL on your phone:

- **iPhone (Safari):** Share → *Add to Home Screen*
- **Android (Chrome):** ⋮ menu → *Install app*

## Deploy (GitHub Pages, free)

1. Merge to `main`.
2. In the repo go to **Settings → Pages → Source: GitHub Actions**.
3. The `Test & deploy` workflow runs the tests and publishes to `https://<user>.github.io/<repo>/`.

## Develop

No build step and no dependencies. Plain ES modules.

```bash
npm start        # http://localhost:8080
npm test         # data-integrity + programme-engine tests (node --test)
```

| Path | What |
| --- | --- |
| `js/data/exercises.js` | Exercise library: instructions, tempo, per-phase dose, evidence grade |
| `js/data/conditions.js` | Problems → prioritised, phase-gated programmes; phases; red flags |
| `js/data/references.js` | All citations |
| `js/engine.js` | Pure programme logic: session building, time budget, deload, steps, pain advice |
| `js/player.js` | Guided timer / tempo player |
| `js/views/*` | Screens |
| `sw.js` | Offline cache. **Bump `VERSION` when shipping changes.** |

Icons are rendered from `icons/icon.svg` with `node scripts/icons.mjs` (needs Playwright).

## Disclaimer

Footing is an education and self-management tool based on published research. It is not a medical device and not a substitute for individual assessment. See a clinician for red-flag symptoms, or if you're not improving after 6–8 weeks.
