# P0/P1 verification — 2026-11-20

Source baseline: latest fetched game-core.js, raids.js and test files after 001e3d3.
Executed both existing test suites in an isolated JavaScript runtime using synchronous node:test and assert compatibility functions (equal, deepEqual, ok). This is not native Node CI or browser execution.

Result: 10/10 passed (P1 legacy 7, P0 raid persistence 3).

Remaining gates: native Node CI, Playwright browser tests, deployment revision and mobile visual verification. No claim of these passing.
