# The Royal — v0.3 Implementation and QA Plan
Status: planned; no v0.3 game code changes yet.
Baseline commit: 5488c56fa6f108f81f5b110a1837ce5b64ca7095.

## P0 — regression harness and save protection
- Snapshot baseline game and test four resource clicks, travel, delivery, city growth and migration.
- Introduce versioned save migration, keeping royal-save-v1 untouched.
- Add reproducible state transition tests for stock and job invariants.
- Exit gate: old saves load, no regression, tests pass.

## P1 — data model and object interactions
- Add IDs to minions, animals, objects, buildings and towns.
- Extract pure game logic from single HTML file incrementally; avoid premature frameworks.
- Add animal context menu and safe tap interactions.
- Exit gate: observe/avoid/attack distinct, original gather still works.

## P2 — animal AI and hybrid combat
- Implement animal state machine, target acquisition, chase leash, retreat, cooldown.
- Implement HP, damage, wounds, critical state, death roll, job reassignment.
- Exit gate: passive species nonaggressive; attack requires explicit order; minion self-defense works.

## P3 — healing and population
- Healing queue and flower costs, critical rescue, visual state feedback.
- Berry cost, housing capacity, minion spawn, unique IDs.
- Exit gate: no negative stock, no duplicate spawns, dead/critical workers excluded.

## P4 — construction economy and town progression
- Wood/stone recipes, priority selector, atomic spend and construction animation.
- City completion conditions, healthy settler selection, new city generation and old city preservation.
- Exit gate: all four resources have separate use, migration retains history.

## P5 — quality, release and evidence
- Desktop/mobile pointer accuracy, no opaque effects, performance, save corruption/partial write recovery.
- Commit per completed milestone, deploy GitHub Pages, inspect Actions result, open live site on mobile, report exact tested commit and failures.
- Do not mark deployed or visually verified solely because a commit succeeded.

## Initial balance table (tunable)
- Wounded <=60 HP, critical <=25 HP, lethal death roll 20%.
- Light healing: 1 flower; critical healing: 3 flowers.
- Population: 5 berries and 1 housing slot -> +1 minion.
- Hut 5 wood + 2 stone; warehouse 8+5; clinic 6+8; watchtower 7+10; plaza 15+15.
- Town completion: 8 buildings, 10 living minions, clinic, plaza.
- Migration: 3 healthy settlers; defer if fewer than 3.

## Evidence report format
Each milestone: code paths changed; tests run and outcomes; commit SHA; Pages workflow URL and conclusion; live site URL and visual verification result; unverified items.
