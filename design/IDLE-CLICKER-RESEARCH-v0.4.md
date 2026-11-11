# The Royal — Idle Clicker Benchmark & Growth Design v0.4
Date: 2026-11-11
Status: PROPOSAL / GDD approval pending. Research and design only; features not implemented.

## Research: benchmark games
- Cookie Clicker: layered automatic production, milestone achievements, golden cookie interactions, ascension. https://steamcommunity.com/stats/1454400/achievements
- Rusty's Retirement: autonomous workers, visible farming, low-interaction experience. https://store.steampowered.com/app/2666510/Rusty_s_Retirement/
- Melvor Idle: interconnected skills and offline progression. https://www.jagex.com/news/jagex-announces-partnership-with-games-by-malcs-to-publish-idle-adventure-sequel-melvor-idle-2-a-runescape-adventure
- A Dark Room: gradual system revelation and narrative surprise. https://incrementalgames.org/game/a-dark-room

## Community evidence (selected posts, not exhaustive comment scrape)
| Posted | Reddit thread | Observed signal | Design response |
| --- | --- | --- | --- |
| 2026-10-22 | https://www.reddit.com/r/incremental_games/comments/1xcccjk/ | replayability and sufficient duration | distinct city strategies |
| 2026-08-21 | https://www.reddit.com/r/incremental_games/comments/1vuchkx/ | skill trees, visual growth, active optional bonuses | visible jobs and unlocks |
| 2026-08-06 | https://www.reddit.com/r/incremental_games/comments/1vhekvr/ | late game choices shrink | introduce branching dilemmas |
| 2026-07-20 | https://www.reddit.com/r/incremental_games/comments/1v1vci6/ | prestige without change is tedious | permanent meaningful unlocks |
| 2026-03-02 | https://www.reddit.com/r/incremental_games/comments/1riifec/ | grind and hollow resets criticized | avoid reset-only content |
| 2026-01-17 | https://www.reddit.com/r/incremental_games/comments/1qf2pa9/ | offline progress and click fatigue | offline simulation, no spam tapping |
| 2026-10-07 | https://www.reddit.com/r/incremental_gamedev/comments/1x04z48/ | concerns about fake gambling | no paid randomized loot or betting |

## Proposed core loop
1. Player taps resource/animal once to establish priority, not to spam clicks.
2. Workers autonomously gather, hunt, rescue, build, and return home.
3. Each meaningful milestone unlocks a new production chain, city look, or story choice.
4. Offline gains resume safely on return, with a clear summary and capped duration.
5. Migration only after current GDD civic requirements, with visible forecast and a permanent benefit.

## Proposed surprise events (not monetized)
- 12% of completed exploration expeditions: uncommon discovery; 2%: major discovery. These are design targets, not implemented probabilities.
- Pity rule: after 8 expeditions without an uncommon discovery, next expedition guarantees one. Never pay for additional rolls.
- Events can reveal: lost villager, ancient tree, peaceful animal, old map, new recipe, weather shelter.
- Avoid FOMO countdowns, paid rerolls, blind loot boxes, cash-out mechanics, and punitive streaks.

## Growth and differentiation
- Worker specializations: gatherer, hunter, builder, healer, explorer. Job mastery unlocks visibly different behaviors.
- Meat: preserve current 3 meat -> 1 minion and housing constraint. Hunting should have a safe alternative path (foraging/recruitment).
- Village evolution: settlement -> town -> walled city, with each building represented in scene.
- Migration: preserve historical cities and at least one selected lasting specialization, unlock a biome or novel mechanic; disclose all effects before confirmation.
- No automatic irreversible reset: require explicit confirmation and allow postponement.

## Offline progression MVP
- Persist lastSavedAt in v3-compatible save (do not erase v1 rollback data).
- Cap elapsed simulation at 8h; no offline combat deaths in MVP.
- Estimate resources from assigned workers with finite resource and storage constraints; no resource generation from idle unassigned workers.
- Present transparent summary with time away, per-resource gains, and any caps. Support save recovery and clock rollback.

## Acceptance and measurement
- First minute: player sees first autonomous delivery and meaningful choice.
- First 10 minutes: at least one visibly distinct building and new worker or specialization.
- 30-minute playtest: no mandatory repetitive tapping, a new decision at least every 5-10 min (target, to validate).
- Metrics: time-to-first-autonomy, action-to-reward latency, % discovering new system, first migration completion, idle vs active fairness, battery consumption, crashes, save corruption.
- Do not optimize compulsion or spending; prioritize voluntary re-engagement and session satisfaction.

## Implementation plan (not completed)
P0: stabilize current code and mobile touch, no regressions.
P1: task priorities, auto assignment, visible production rates.
P2: safe offline progression and return summary.
P3: discoverable events, guaranteed progress, non-monetized surprise.
P4: specialization and visual city tiers.
P5: migration choices, preserved progress, multi-city history.
For each: tests -> commit -> GitHub Actions -> Pages -> real mobile visual verification. Do not mark unverified work as complete.
