# P1-6 Legacy balance review
Status: proposal; P0 and P1 runtime verification remain open.

## Current formulas
At levels 0/1/5/10:
- Valor raid hunter DPS: 35 / 36.75 / 43.75 / 52.5.
- Arcane base gathering duration: 1.1 / 1.068 / 0.957 / 0.846 seconds. Travel duration unchanged.
- Community starting housing: 3 / 4 / 8 / 13. Does not directly recruit workers.
- Engineering hut wood/stone: 5/2, 5/2, 5/2, 4/2 using current ceiling.
- Engineering plaza wood/stone: 15/15, 15/15, 13/13, 11/11.

## Proposed change
Use deterministic fractional discount credit separately for wood and stone. For each successful construction, add base cost times 3% per engineering level to the corresponding credit; reduce cost by whole credits, retain remainder. Never charge below one per required resource. No credit on failed purchase. Preview must be pure; commit credit with successful construction in the same snapshot. Credit starts at zero for old saves; persist across city migration. Integer arithmetic in hundredths avoids floating point drift. Keep current formulas until tests and implementation are ready.

## Replay loop
Show next legacy benefit, next attainable milestone, and city history. Prefer transparent progression over paid randomness or manipulative retention. Do not add currencies, random rewards, or daily obligations at this stage.

## Verification gates
Test credit accumulation, failed construction, save/load, migration, cap, old saves, and displayed cost consistency. Measure full city completion time under each specialization; gathering improvement excludes travel and valor depends on hunter uptime. Exact equivalence of the four benefits is not established.
