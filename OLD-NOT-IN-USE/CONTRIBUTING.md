# CONTRIBUTING.md

## Development Workflow

1. Pick a small task.
2. Read `AGENTS.md`, `CONSTRAINTS.md`, and relevant architecture docs.
3. Create or update tests first when practical.
4. Implement the smallest safe change.
5. Run all quality checks.
6. Update documentation if behaviour or setup changes.
7. Open a pull request with a clear summary.

## Required Commands

Run before every commit or pull request:

```bash
npm run format
npm run lint
npm run typecheck
npm run test
npm run coverage
npm run build
```

## Package Scripts Expected

The project should expose these scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "format": "prettier . --write",
    "format:check": "prettier . --check",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage",
    "e2e": "playwright test"
  }
}
```

## Pull Request Checklist

- [ ] The change is small and focused.
- [ ] The change follows the project architecture.
- [ ] New or changed logic has tests.
- [ ] Formatting passes.
- [ ] Linting passes.
- [ ] Type checking passes.
- [ ] Unit tests pass.
- [ ] Coverage check passes.
- [ ] Production build passes.
- [ ] No personal health data is logged or transmitted.
- [ ] Documentation is updated where needed.

## Coding Standards

- Use strict TypeScript.
- Avoid `any`.
- Prefer named exports for reusable modules.
- Keep React components focused.
- Put calculations in pure functions.
- Put database access in repository modules.
- Validate user input at boundaries.
- Keep date/time handling explicit and tested.
- Preserve timeline event architecture.
- Do not convert app into BP-only schema.
- New event types must be extensible.
- Keep reports isolated from timeline rendering logic.

## Test Standards

Tests should cover:

- Validation rules.
- Date filtering.
- Report aggregation.
- Import/export logic.
- Entry creation/edit/delete flows.
- Important UI behaviour.

Do not reduce or remove tests unless replacing them with better coverage.
