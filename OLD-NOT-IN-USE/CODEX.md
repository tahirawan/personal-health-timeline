# CODEX.md

Codex must follow all rules in `AGENTS.md`.

## Codex Working Style

Codex should work in small, reviewable steps.

Before editing:

1. Inspect the current files.
2. Confirm the relevant feature area.
3. Prefer targeted patches over broad rewrites.

After editing:

1. Run formatting.
2. Run linting.
3. Run type checking.
4. Run unit tests.
5. Run coverage.
6. Run production build.

## Code Generation Rules

- Generate strict TypeScript.
- Prefer pure functions for calculations.
- Keep React components focused on rendering and interaction.
- Use repositories/services for persistence and business logic.
- Validate inputs using Zod schemas.
- Use accessible form labels and buttons.
- Avoid introducing dependencies unless useful and justified.

## Forbidden Shortcuts

- Do not silence TypeScript errors with `as any`.
- Do not disable lint rules globally.
- Do not skip tests because a change is small.
- Do not mock core logic when the real pure function can be tested.
- Do not use localStorage for main health data storage.
- Do not log personal health entries to the console.
