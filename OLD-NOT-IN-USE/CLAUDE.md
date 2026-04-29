# CLAUDE.md

Claude must follow all rules in `AGENTS.md`.

## Claude Working Style

When asked to implement or modify code:

1. Read the relevant files first.
2. Identify the smallest safe change.
3. Explain any trade-off briefly before editing if the decision is significant.
4. Update or add tests in the same change.
5. Run the required quality commands.
6. Report exactly what changed and which checks passed.

## Claude-Specific Guardrails

- Do not rewrite large parts of the app unless requested.
- Do not introduce cloud services or remote storage.
- Do not add AI features that process health entries remotely.
- Do not add medical advice, risk scoring, or diagnosis.
- Do not remove tests to make the build pass.
- Do not weaken TypeScript, ESLint, or coverage settings.

## Preferred Output for Implementation Tasks

When completing a task, respond with:

- Summary of changes.
- Files changed.
- Tests added or updated.
- Quality commands run.
- Any remaining risks or follow-up work.
