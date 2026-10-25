# KawruhBhumi Lab — Interactive Geophysics Simulation Laboratory

**Learn. Simulate. Discover.** / **Belajar · Simulasi · Eksplorasi.**

A bilingual (English / Indonesian) teaching platform for near-surface and
exploration geophysics. The current build ships a light-first, multi-page
interface, seven chaptered theory libraries, and seven validated **forward
workspaces**: Ground-Penetrating Radar, magnetics, gravity, seismic reflection,
seismic refraction, resistivity sounding (VES), and HVSR / microtremor.

**Forward modelling is the default.** The HVSR workspace adds one clearly
labelled, bounded inversion experiment; no other method performs or implies
inversion. Every synthetic result states its dimensionality, discretization,
and approximation limits in a visible assumptions panel.

## Quick start

```bash
npm install
npm run dev          # development server
npm test             # solver unit tests + page smoke tests (Vitest)
npm run lint         # oxlint
npm run build        # type-check (tsc) + production build → dist/
npm run preview      # serve the production build
```

The production build uses a relative base (`base: './'`) and hash-based routing,
so the contents of `dist/` can be served from any static file server:

```bash
python3 -m http.server 8080 --directory dist
# then open http://localhost:8080
```

Opening `dist/index.html` directly from disk does not work in modern browsers,
because ES-module scripts are blocked on `file://` origins. The legacy
single-file and Android builds can still be produced with `npm run build:single`
and `npm run android:apk`. The single-file build inlines the HVSR inversion
worker so the workspace also runs from one HTML file. Older APK artifacts in the
D: mirror still carry the former GeoSim Lab package (`id.geosim.lab`).

## Pages and routes

| Route | Purpose |
| --- | --- |
| `#/` | Compact landing page: hero, 60-second demo, three entry paths, seven methods, disclaimer link |
| `#/metode` | Method directory (seven profiles, chapter counts, workspace links) |
| `#/metode/:methodId` | Method story, measured property, typical uses, chapter list |
| `#/teori` | Theory library index: five chapters per method (35 chapters total) |
| `#/teori/:methodId/:chapterId` | Chapter reader with KaTeX equations, SVG figures and prev/next navigation |
| `#/simulator` | Workspace hub with seven cards and the shared pipeline explanation |
| `#/simulator/gpr` | GPR forward workspace |
| `#/simulator/magnetic` | Magnetic forward workspace |
| `#/simulator/gravity` | Gravity forward workspace |
| `#/simulator/reflection` | Seismic reflection forward workspace |
| `#/simulator/refraction` | Seismic refraction forward workspace |
| `#/simulator/resistivity` | Resistivity sounding (VES) forward workspace |
| `#/simulator/hvsr` | HVSR forward workspace + labelled 1D inversion experiment |
| `#/resources` | Searchable reference library (29 entries), glossary and formula sheet |
| `#/about` | Mission, scope, tech notes and key references |
| `#/disclaimer` | Honest disclaimer, limitations and feedback address |
| `#/physics` | Legacy anchor — redirects to `#/teori` |

## Features

- **Chaptered theory** — every method has five short chapters: what we measure,
  the physics, the forward model, a worked example, and the honest limits. All
  equations render with KaTeX; content is bilingual and lives in
  `src/content/theory/`.
- **GPR** — scenario presets, survey/acquisition controls, a layer editor with
  εr and σ per layer, point/cylinder targets, animated cross-section, synthetic
  radargram, A-scan, picks, diagnostics and CSV/PNG export.
- **Magnetic** — induced-magnetization spheres (closed-form dipole) and 3D
  finite-strike prisms (Nagy et al. corner formulas) under a uniform ambient
  field; ΔT profile, X–Y anomaly map, model section, parameter tables and
  warnings.
- **Gravity** — buried spheres (point mass) and 3D finite-strike prisms with
  signed density contrasts; g (mGal) profile, X–Y anomaly map, excess-mass and
  peak tables, model section and diagnostics.
- **Seismic reflection** — 1D impedance reflectivity, convolutional Ricker
  trace, offset gather with NMO, variable-area wiggle display, interface picks
  with cumulative transmission, λ/4 resolution diagnostics and a
  velocity-coloured section.
- **Seismic refraction** — analytic direct and head-wave branches, crossover
  distances, critical angles, first-arrival envelope, ray paths, the classic
  two-layer intercept-time depth estimate, and a synthetic shot record with
  deterministic trace noise and first-break picks.
- **Resistivity (VES)** — 2–8 layer 1D model, Wenner and Schlumberger arrays,
  log-spaced soundings, multiplicative log-normal noise, log–log apparent
  resistivity curve, layered model/electrode SVG, layer table, and equivalence
  notes. The Hankel transform is integrated numerically with Gauss–Legendre
  quadrature.
- **HVSR / microtremor** — 1D layered SH-transfer proxy for the H/V curve,
  fundamental-frequency diagnostics, quarter-wave estimate, higher-mode
  warning, and a produce-and-invert workflow using a transparent neighbourhood
  search. The inversion is labelled as bounded and non-unique. Preset scenario
  cards, A/B comparison with a pinned snapshot, a one-factor sensitivity sweep,
  and a guess-the-model challenge turn the workspace into a classroom exercise.
- **Scenario tools** — permalink sharing for every workspace, auto-run defaults,
  last-scenario memory, a persistent method switcher, a printable practice
  report, and labelled “What am I seeing?” prompts beside the results.
- **Guided learning** — 21 predict–run–observe experiments (three per method),
  field-case figures, parameter help, a glossary, formula sheet, and downloadable
  teacher worksheet/answer-key packs.
- **Accessible charts** — named chart regions, keyboard-focusable plots,
  fullscreen chart view, and print/reduced-motion styles.
- **Reference library** — 29 curated textbooks, papers and open resources with
  search and filters by method and type.
- **Bilingual** — full EN/ID interface; `src/i18n/id.ts` is type-checked to stay
  key-identical with `en.ts`. UI copy for the new pages lives in
  `src/content/site.ts` as bilingual objects.

## Solver classification

| Method | Classification |
| --- | --- |
| GPR | **APPROXIMATE** — ray-based layered model: `v = c/√εr`, normal-incidence reflection coefficients, low-loss attenuation, Ricker convolution, hyperbolic target events. Not FDTD/full-waveform. |
| Magnetic | **SEMI-ANALYTICAL** — induced-dipole closed form for spheres; exact 3D prism corner formulas converted to ΔT via the Poisson relation; no demagnetization, remanence or terrain. |
| Gravity | **ANALYTICAL** — point-mass attraction for spheres; exact 3D rectangular-prism formulas; constant density per body, no terrain correction. |
| Seismic reflection | **ANALYTICAL (primaries only)** — impedance reflectivity, cumulative transmission ∏(1−R²), Ricker convolution, NMO moveout; no multiples, absorption or AVO. |
| Seismic refraction | **ANALYTICAL (head waves)** — closed-form direct and head-wave branches, first-arrival envelope; no reflections, turning rays or attenuation; velocity inversions flagged. |
| Resistivity (VES) | **NUMERICAL (1D layered earth)** — Stefanescu recursion for the resistivity transform, Gauss–Legendre quadrature of the Hankel integral with `J₀`; Wenner and Schlumberger geometric factors; no inversion, lateral changes, anisotropy or IP. |
| HVSR | **APPROXIMATE (1D proxy) + bounded inversion** — layered SH transfer with fixed density and Vp/Vs; Nakamura-style H/V proxy, not full Rayleigh ellipticity. Inversion is a neighbourhood search inspired by Wathelet et al. (2004), not a Geopsy reimplementation. |

## Tests

`npm test` runs 156 tests in 10 files; `npx tsc -b` and `npm run lint` are clean.

| Suite | File | Tests |
| --- | --- | --- |
| GPR | `src/sim/gpr/gpr.test.ts` | 27 |
| Core (prism 3D) | `src/sim/core/prism3d.test.ts` | 5 |
| Magnetic | `src/sim/magnetic/magnetic.test.ts` | 21 |
| Gravity | `src/sim/gravity/gravity.test.ts` | 19 |
| Reflection | `src/sim/reflection/reflection.test.ts` | 14 |
| Refraction | `src/sim/refraction/refraction.test.ts` | 18 |
| Resistivity solver | `src/sim/resistivity/ves.test.ts` | 18 |
| Resistivity workspace model | `src/sim/resistivity/model.test.ts` | 5 |
| HVSR | `src/sim/hvsr/hvsr.test.ts` | 12 |
| Pages | `src/smoke.test.tsx` | 17 |

The resistivity tests compare the numerical Hankel solution against closed-form
two-layer Wenner and Schlumberger curves, check asymptotic limits, seeded noise,
preset validation, and Schlumberger geometry rules.

## Architecture

```
src/
  sim/                 # Pure TypeScript solvers — no React, unit-tested
    core/              # constants, seeded RNG, formatting, FieldError, prism 3D
    gpr/               # types, scenarios, forward solver, validation
    magnetic/          # dipole + finite-strike prism magnetics
    gravity/           # point-mass + finite-strike prism gravity
    reflection/        # 1D reflectivity, wavelet, gather/NMO
    refraction/        # head-wave travel times, crossover, depth estimate
    resistivity/       # VES types, Hankel solver, presets, validation, UI model
    hvsr/              # 1D SH-transfer proxy, peak diagnostics, bounded inversion
  content/             # methods, physics, references, experiments, glossary, theory
  i18n/                # en.ts (source of truth) + id.ts (type-checked parity)
  components/
    charts/            # lazy Plotly wrapper, light theme, CSV/PNG export
    ui/                # design system: Button, Card, Badge, Stat, fields…
    geo/               # HeroScene, GeoCrossSection
    method/            # per-method glyphs (incl. resistivity electrode glyph)
    workspace/
      common.tsx       # generic forward-run state + WorkspaceShell + share/report
      sections.tsx     # layered/body cross-sections
      resistivity/     # VES controls, curve, model SVG, summary
      gpr/ magnetic/ gravity/ reflection/ refraction/ hvsr/
    layout/            # Navbar, Footer, Layout, error boundary
  pages/               # Landing, Methods, Method, Theory index/chapter, simulator
                       # hub, seven workspaces, Resources, About, Disclaimer, 404
```

## Design system

- Light-first palette: surface `#FFFFFF`, panels `#F6F8FC`/`#EEF2F9`, ink
  `#252525`, muted `#5C6470`, primary `#3664F4`, warm `#E85353`, cool `#2E9FBF`,
  sky `#60CBFF`. Text tokens for amber/teal are darkened for contrast while
  charts use the raw accents.
- Type: **Cabin** (UI) and **JetBrains Mono** (numbers/labels), self-hosted via
  `@fontsource`.
- KawruhBhumi Lab identity extracted from the supplied brand board: a gunungan
  mark with a seismic waveform and subsurface waves, paired with the wordmark
  in `src/assets/brand/`; app-icon/favicon sources live in `assets/brand/`.
- Plotly charts share `plotTheme.ts` (light grid, fonts, diverging colorscales).

## Scientific integrity

- Equations, assumptions and solver labels appear next to the results they
  produce; interpretation aids are explicitly not inversion.
- Every randomness source is seeded and deterministic.
- Solver tests compare against independent closed forms (two-layer VES curves,
  prism limits, critical-angle geometry, crossover relations).
- Reference entries link to their original sources; DOIs/URLs were checked
  during development (some publishers block automated requests).
- The app is a teaching tool, not a calibrated instrument. Feedback:
  `kholis.nh3@gmail.com`.

## Deployment

See [`DEPLOY.md`](./DEPLOY.md) for a zero-knowledge guide to Vercel, Netlify,
Cloudflare Pages and any static server. No server-side runtime or environment
variables are required.

## Roadmap

- Phase 1: GPR workspace and initial libraries.
- Phase 2: magnetic, gravity, reflection and refraction workspaces.
- v2: light-first redesign, multi-page IA, chaptered theory for every method,
  resistivity (VES) workspace, bilingual site copy, disclaimer.
- v2.1: KawruhBhumi Lab rebrand, new logo/favicons, bilingual tagline,
  documentation refresh, and Android application ID update.
- v2.2 (current): HVSR workspace, seven method/case studies, guided experiments,
  scenario permalinks, parameter help, printable report, glossary/formula sheet,
  HVSR comparison/sweep/challenge tools, teacher downloads, chart accessibility,
  and responsive layout fixes.
- Later: FDTD GPR, elastic wavefield simulation, migration, and broader
  clearly-labelled inversion experiments.
