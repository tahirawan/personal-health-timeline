# TESTING.md

## Testing Goals

Testing must protect user data, app reliability, and future refactoring.

Every important change should be covered by tests.

## Test Types

### Unit Tests

Use Vitest for:

- Validation schemas.
- Blood pressure entry helpers.
- Date filtering.
- Report aggregation.
- Backup export formatting.
- Backup import validation.
- CSV generation.

### Component Tests

Use React Testing Library for:

- Entry form validation.
- Entry list rendering.
- Delete confirmation.
- Report range selection.
- Backup/import UI states.

### End-to-End Tests

Use Playwright for critical flows:

- Add an entry.
- See it in the entry list.
- Edit the entry.
- Delete the entry.
- Export backup.
- Import backup.
- View reports.

## Coverage Expectations

Minimum target after MVP stabilises:

- Statements: 80%+
- Branches: 75%+
- Functions: 80%+
- Lines: 80%+

Do not chase coverage by writing weak tests. Focus on meaningful protection.

## High-Risk Areas Requiring Tests

- Date range filtering.
- Weekly/monthly/yearly grouping.
- Import/restore logic.
- Duplicate handling during import.
- IndexedDB repository operations.
- Validation ranges.
- Data deletion.

## Test Data Rules

- Use fake sample entries only.
- Do not commit real personal health data.
- Keep test fixtures small and clear.

## Required Commands

```bash
npm run test
npm run coverage
npm run e2e
```

E2E tests may be slower, but should run before releases and important merges.
