# SECURITY_PRIVACY.md

## Privacy Position

The MVP is local-only. Blood pressure entries stay on the user's device unless the user explicitly exports a backup file.

## Sensitive Data

The following are sensitive:

- Blood pressure readings.
- Pulse readings.
- Meal timing.
- Tablet or medicine timing.
- Notes.
- Exported backup files.

## Forbidden in MVP

- Remote database.
- Cloud sync.
- Analytics.
- Telemetry.
- Advertising trackers.
- Remote error logging containing health data.
- Account system.
- Admin dashboard.
- Sharing entries with other users.

## Local Storage Rules

- Use IndexedDB for health entries.
- Do not use localStorage for health entries.
- Request persistent storage where browser support exists.
- Make storage limitations clear to the user.

## Backup Rules

- Export is user-initiated only.
- Import is user-initiated only.
- Validate backup schema before import.
- Warn before replacing or merging data.
- Never automatically upload backups anywhere.

## Logging Rules

Allowed:

- Generic non-sensitive development logs during local debugging.

Forbidden:

- Logging full entries.
- Logging notes.
- Logging exported backup content.
- Logging imported file contents.

## Network Rules

The app should not send health data over the network.

Permitted network requests:

- Static app assets from GitHub Pages.
- PWA service worker asset caching.

Not permitted without explicit future approval:

- API calls containing user entries.
- Analytics events.
- Error reporting with user data.

## Security Headers

GitHub Pages has limited header configuration. Avoid relying on custom server headers for core security. Keep the app simple and local-only.

If moved to another host later, consider:

- Content Security Policy.
- Strict Transport Security.
- X-Content-Type-Options.
- Referrer-Policy.

## Medical Disclaimer

Include a disclaimer in the app:

> This app is for personal tracking only and does not provide medical advice. Contact a healthcare professional for diagnosis, medication, or treatment decisions.
