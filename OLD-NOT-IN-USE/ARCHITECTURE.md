# ARCHITECTURE.md

## Architecture Goals

- Local-first.
- Privacy-first.
- Mobile-first.
- Testable.
- Easy to wrap with Capacitor later.
- Simple enough for one developer to maintain.

## Proposed Structure

```text
src/
  app/
    App.tsx
    router.tsx
    providers.tsx
  components/
    Button.tsx
    Card.tsx
    Field.tsx
    ConfirmDialog.tsx
  features/
    entries/
      EntryForm.tsx
      EntryList.tsx
      EntryDetail.tsx
      entrySchemas.ts
      entryService.ts
      entryTypes.ts
    reports/
      ReportsPage.tsx
      ReportChart.tsx
      reportService.ts
      reportTypes.ts
    backup/
      BackupPage.tsx
      exportService.ts
      importService.ts
    settings/
      SettingsPage.tsx
  db/
    database.ts
    entryRepository.ts
    migrations.ts
  domain/
    bloodPressure.ts
    dates.ts
    validation.ts
  hooks/
    useEntries.ts
    usePersistentStorage.ts
  lib/
    fileDownload.ts
    csv.ts
    id.ts
  routes/
  styles/
  test/
```

## Layers

### UI Layer

React components and pages.

Responsibilities:

- Render screens.
- Capture user input.
- Show validation messages.
- Call hooks/services.

Must not:

- Directly call IndexedDB.
- Contain complex report calculations.
- Contain backup parsing logic.

### Feature Service Layer

Feature-specific business logic.

Examples:

- `entryService.ts`
- `reportService.ts`
- `exportService.ts`
- `importService.ts`

Responsibilities:

- Validate data.
- Coordinate repositories.
- Transform data for UI.
- Provide pure calculation functions where possible.

### Repository Layer

Persistence wrapper around IndexedDB.

Responsibilities:

- Create, read, update, delete entries.
- Isolate Dexie/IndexedDB details.
- Handle migrations.

### Domain Layer

Shared domain types and pure rules.

Examples:

- Blood pressure entry type.
- Meal relation enum/type.
- Date range helpers.
- Validation schemas.

## State Management

Start simple:

- React state for local form state.
- Custom hooks for loading entries.
- No global state library unless the app becomes complex.

## Routing

Suggested routes:

```text
/             Dashboard or latest entries
/add          Add reading
/entries      Entry history
/reports      Reports and charts
/backup       Export/import
/settings     App information and storage status
```

## Error Handling

- Show friendly UI messages.
- Log only non-sensitive technical details during development.
- Never log full health entries in production.
- Fail safely during import and database operations.

## Date and Time Handling

- Store timestamps in ISO 8601 format.
- Display dates using the user's local timezone.
- Keep date grouping functions pure and tested.
- Be careful with week/month/year boundaries.

## Future Capacitor Compatibility

To avoid future rewrites:

- Keep storage behind repositories.
- Keep file export/import behind service modules.
- Avoid direct browser-only APIs scattered through components.
- Create small adapters for platform-specific behaviour.
