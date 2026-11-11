# The Royal — GDD v0.3 (Hybrid Combat)
Status: design approved for implementation planning; gameplay code NOT yet implemented.
Date: 2026-11-11
Repository: jflakeee/the_royal
Baseline: index.html, localStorage royal-save-v1, initial gathering/city/migration loop.

## Vision and non-regression contract
Web-first mobile-friendly 2.5D town simulation. Tap objects to send text commands to city-dwelling minions. Minions move in real time, collect resources, return to town, and build automatically. A developed town sends settlers to a new city. Preserve all v0.2 interaction and save data, including existing royal-save-v1 users.

## Hybrid interaction
Tap tree/rock/flower/berry -> gather command. Tap an animal -> contextual panel: observe, avoid, attack (attack requires explicit tap). If a hostile animal attacks a minion, the attacked minion automatically defends or retreats; nearby minions assist only if safe and not critically wounded. Passive animals must never be attacked automatically. A tapped animal is not automatically an attack order; the explicit attack action is required.
Show message dispatch, assignee, target, task state, and outcome. Pending jobs remain queued when all workers are busy.

## Resources
wood + stone are the only automatic construction currencies; flower is reserved for healing; berry is reserved for population growth. Never reset all four stockpiles on construction. Resource transfers occur only after minion reaches town; interrupted jobs must not credit stock.

## Animals
Initial species: rabbit (passive, flee), boar (defensive, retaliate on attack/close threat), wolf (hostile outside town, chase within leash), bear (dangerous territorial, limited range). AI states: IDLE, WANDER, ALERT, CHASE, ATTACK, FLEE, RETURN, DEAD. Use bounded movement, target acquisition radius, attack cooldown, leash radius, and no attacks through obstacles. Animal respawn limited by region capacity; no immediate spawn on top of town.

## Minion model and combat
Each minion: stable id, x/y, hp/maxHp=100, status=healthy|wounded|critical|dead, task, inventory, homeCityId, actionCooldown. Combat states include defending, retreating, and awaiting rescue.
Prototype balancing proposal: wounded at hp <=60; critical at hp <=25. On lethal damage hp reaches zero: single death roll with 20% death, otherwise incapacitated/critical awaiting rescue. An incapacitated minion cannot work or fight. Untreated critical condition can worsen on a separate clearly telegraphed timer; no repeated instant-death rolls per frame. On death: cancel/redistribute job safely, decrement living population, record event, prevent dead worker from receiving tasks. Avoid invisible instant kills.
Damage formula and hit rates to be tuned after playtests. Group defense lowers exposure, not arbitrary per-minion guaranteed immunity.

## Healing
Wounded minion: consume 1 flower at town/healer, recover to hp 80. Critical: consume 3 flowers, require rescue to town, recover to hp 60 after a healing timer. If insufficient flowers, enqueue healing need; never create negative stock. Emergency treatment takes precedence over gathering, but never force a worker into lethal threat. Treatment requires an explicit healing event and visual feedback.

## Population
5 berries + one free housing slot => spawn one new minion at town. Default town population starts at 3; buildings define housing capacity. No growth without capacity; no berries deducted until spawn commits. Living population excludes dead. New worker gets unique stable id and no pending task.

## Auto-building
Building recipe proposal: hut 5 wood + 2 stone (+2 housing), warehouse 8 wood + 5 stone, clinic 6 wood + 8 stone, watchtower 7 wood + 10 stone, plaza 15 wood + 15 stone. A building is chosen deterministically: first urgent housing shortfall, then clinic when wounded count high, then watchtower for danger, then progression/warehouse. Spend exact wood and stone atomically. Persist building instances and effects; avoid repeated free builds and deadlocks. Build animation and progress should be visible.

## Town and migration
First town completion proposal: >=8 buildings, >=10 living minions, >=1 clinic, >=1 plaza. At completion select three healthy adults as settlers; if insufficient healthy settlers, defer migration until healed/recruited. Settlers carry bounded starter stock. Animate departing party and start a new town with three settlers. Preserve prior city's snapshot, total history, and unique city IDs. No forced reset of completed city.

## Save migration
Keep reading localStorage key royal-save-v1; migrate in memory to version 3 structure, then write a new key royal-save-v3 only after validation. Preserve old key for rollback. Validate finite coordinates, nonnegative stock, valid task references, minion identities, city IDs. Repair missing fields with defaults and keep old object positions, quantities, city count, and existing jobs when possible. Use try/catch on read/write; failed write must not destroy last valid save. Add explicit export/import later.

## UI and accessibility
Touch targets >=44 CSS px, contextual animal action panel, message toast, visible health indicators, healing alerts, building requirements, population/housing counter, migration readiness. Keep canvas pointer mapping responsive and prevent touch scrolling over world. No opaque effect backgrounds covering play area.

## Safety/quality invariants
No negative stock; no duplicate resources; dead minions never work; critical minions never work; animal target references validated; jobs never permanently block queue; population <=housing capacity; no duplicate construction; migration does not erase old cities; old saves still load.

## Acceptance tests
1. Four original resources can still be clicked, gathered and delivered.
2. Animal click presents choices; observe does not attack.
3. Wolf attacks within detection; minion auto-defends/retreats; passive rabbit does not auto-attack.
4. Injury changes worker speed and task eligibility; lethal damage performs a single probabilistic roll.
5. Flowers heal only after sufficient stock and successful rescue; no negative stock.
6. Berries spawn exactly one minion per 5 consumed when housing available.
7. Wood/stone are deducted according to recipe; flowers/berries unaffected by construction.
8. Save v1 loads and upgrades without wiping the original key.
9. Migration preserves old city and creates new city with settlers.
10. Mobile click accuracy, animation transparency, performance and GitHub Pages build are verified separately.

## Benchmark principles
Babel Legacy: legible town growth and automation. Keep on Mining! - Worlds: tactile resource feedback and progression. Implement original art/code only; no copied assets.
