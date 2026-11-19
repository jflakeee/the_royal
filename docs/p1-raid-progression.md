# P1 — Raid progression (draft)

P0 verification remains open. No runtime changes in this proposal.

## Core loop
Gather → recruit → build → choose raid → defend → earn legacy → migrate → repeat.

| Raid | Legacy reward | Proposed effect per clear | Cap |
|---|---|---|---|
| Boss | Valor | +5% hunter raid damage | +50% |
| Raiders | Engineering | -3% wood and stone construction cost | -30% |
| Mages | Arcane | +3% gathering speed | +30% |
| Zombies | Community | +1 housing capacity | +10 |

Values are provisional; existing material rewards remain unchanged. Cost rounding must not make recipes free. Legacy applies to next city, not current combat. No random paid rewards.

## State and integrity
Optional legacy object with four bounded integer counters; missing fields default to zero. Award once per completed city during migration, using lastBattle.status=clear, completedCity and a migrated-city marker. Save legacy and new city in one snapshot. Failed raids award nothing. Existing v3 saves load without migration version bump. Reset clears legacy. No retroactive awards for historical cities without verified raid outcomes.

## Acceptance
- Each mode grants exactly one corresponding legacy point on migration.
- Retry and reload do not duplicate legacy.
- Storage failure retains retryable state and cannot advance twice.
- Existing material rewards, combat modes, resource gathering and old saves remain compatible.
- Show reward before raid selection and preview next-city benefit on ending panel.
- Test all caps, save reload, migration failure and mobile UI before rollout.
