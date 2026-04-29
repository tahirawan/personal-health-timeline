# ARCHITECTURE.md

Architecture guide for the Personal Health Timeline Tracker.

---

## Architecture Goals

- local-first
- privacy-preserving
- simple to maintain
- easy to test
- Android-friendly
- GitHub Pages compatible
- future native app compatible

---

## Main Layers

### UI Layer

React components.

Responsibilities:

- render screens
- collect form input
- call hooks/services
- display validation errors

Should not:

- calculate reports directly
- access IndexedDB directly
- parse backup files directly
- contain complex business rules

---

### Feature Layer

Feature-specific components, hooks, schemas, and services.

Examples:

- blood-pressure
- meals
- tablets
- timeline
- reports
- backup
- settings

---

### Domain Layer

Shared types and pure functions.

Examples:

- TimelineEvent union
- BloodPressureEvent type
- date grouping
- report calculations
- validators

---

### Storage Layer

IndexedDB / Dexie setup and repository functions.

Responsibilities:

- create/update/delete events
- query events
- run migrations
- hide IndexedDB details from UI

---

## Data Flow

Add form:

```text
UI form -> Zod validation -> service -> repository -> IndexedDB
```

Timeline:

```text
IndexedDB -> repository -> hook/service -> timeline component
```

Reports:

```text
Timeline events -> filter BP events -> report service -> chart component
```

Backup export:

```text
IndexedDB -> repository -> export service -> JSON/CSV file
```

Backup import:

```text
File -> parse -> Zod validation -> preview -> confirmed save -> repository
```

---

## State Management

Start simple.

Prefer:

- React state
- custom hooks
- repository calls

Avoid global state libraries unless clearly needed.

---

## Error Handling

User-facing errors should be clear and non-technical.

Examples:

- Could not save reading. Please try again.
- Backup file is not valid.
- Some lines could not be imported. Please review them.

Do not expose raw stack traces in UI.

---

## Future Native Path

The React app should be suitable for future Capacitor wrapping.

Avoid browser APIs that cannot be gracefully handled in native WebView environments.

Keep storage abstracted so native storage could replace IndexedDB later if needed.
