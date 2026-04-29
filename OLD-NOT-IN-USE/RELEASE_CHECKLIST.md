# RELEASE_CHECKLIST.md

## Pre-Release Checklist

- [ ] App builds successfully.
- [ ] App runs locally.
- [ ] Formatting passes.
- [ ] Linting passes.
- [ ] Type checking passes.
- [ ] Unit tests pass.
- [ ] Coverage threshold passes.
- [ ] End-to-end tests pass for critical flows.
- [ ] PWA manifest is valid.
- [ ] Service worker works.
- [ ] App loads offline after first visit.
- [ ] Add/edit/delete entries work.
- [ ] Reports work for day/week/month/year/all.
- [ ] JSON export works.
- [ ] CSV export works.
- [ ] JSON import works.
- [ ] Invalid import files are rejected safely.
- [ ] Delete action requires confirmation.
- [ ] No health data is logged to console.
- [ ] No analytics or tracking scripts are present.
- [ ] Medical disclaimer is visible.
- [ ] Backup warning/instructions are visible.
- [ ] Mobile layout checked on Android-sized viewport.
- [ ] GitHub Pages deployment works.

## GitHub Pages Checklist

- [ ] Correct `base` path configured in Vite if deploying under repo path.
- [ ] Build output directory is correct.
- [ ] GitHub Actions deployment workflow is configured.
- [ ] App refresh/deep-link behaviour works.
- [ ] Icons and manifest load correctly.

## Manual Smoke Test

1. Open app on Android Chrome.
2. Install PWA.
3. Add a reading.
4. Close and reopen app.
5. Confirm reading remains.
6. Edit reading.
7. View report chart.
8. Export JSON backup.
9. Delete reading.
10. Import backup.
11. Confirm reading is restored.
12. Turn off network.
13. Reopen app and confirm it loads offline.
