# Dream Loop integration (isolated)

Source: https://github.com/achimala/dream-loop (MIT), vendored on 2026-11-16.

The skill and its references/scripts are installed at `.agents/skills/dream-loop/` on the `chore/dream-loop-integration-20261116` branch. The upstream `assets/vesper-preview.gif` demonstration (~7 MB) is deliberately excluded: it is not required for runtime use and would bloat the game repository.

The Royal's existing game code, saved data format, main branch, and published Pages build must remain unchanged until tests and an explicit visual-review step. This is an **agent workflow**, not a browser runtime dependency: nothing should be loaded from index.html.

To use it in a compatible CLI coding agent, load `.agents/skills/dream-loop/SKILL.md` and follow the appropriate referenced workflow. The recommended upstream shortcut is `npx skills add achimala/dream-loop`; it has **not** been executed on any user's machine here. Runtime use requires an image generation tool and screenshot/vision comparison, with additional 3D tooling optionally needed.

Validation: Git object SHA of each vendored file matched the corresponding upstream file at installation. CI/run-time availability, visual comparison, and external dependencies are **not yet verified**.

Next: validate the branch using existing tests and document initial The Royal mobile screenshot baseline before visual redesign. Keep GDD final approval on hold.
