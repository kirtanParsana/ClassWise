# ClassWise — Known Bugs & Limitations Baseline

**Date:** 2026-09-29

**Branch:** `production-hardening`

**Baseline Commit:** `45ed404`

**Baseline Tag:** `v1.0.0-baseline`

## Purpose

This document records known bugs, limitations, and unverified production concerns at the beginning of the production-hardening process.

These items are recorded before further hardening changes so that later regressions can be distinguished from pre-existing issues.

---

## 1. Build Validation

### Current Status

`npm run build` passes successfully.

### Limitation

The current production build reports:

- Type validation skipped
- Linting skipped

Therefore, a successful production build does not currently prove that the complete TypeScript and ESLint checks pass.

**Status:** Needs verification.

---

## 2. API Security

### Current Status

Static API security verification passes for:

- `/api/generate-timetable`
- `/api/conflicts`
- `/api/timetables/[id]/actions`
- `/api/timetables/[id]/suggestions`

The static verification confirms server-side authorization helpers are referenced and the tested routes do not appear to trust a role supplied through the request body.

### Limitation

The current verification is source-code based.

It does not constitute a complete runtime authorization test using:

- unauthenticated requests
- authenticated users with incorrect roles
- expired tokens
- invalid tokens
- malformed requests

**Status:** Static checks pass; runtime security testing required.

---

## 3. Firestore Security Rules

### Current Status

The static security verification confirms the presence of:

- catch-all deny
- faculty schedule filtering
- student schedule filtering
- published schedule checking
- restrictions on public user writes

### Limitation

Static checks do not prove that every Firestore operation behaves correctly under real authentication states.

**Status:** Static checks pass; runtime rules testing required.

---

## 4. Firestore Backup

### Current Status

A local logical backup was successfully created.

Total documents backed up:

**1,342**

Collections:

- courses — 10
- faculties — 6
- rooms — 7
- schedules — 1,244
- sections — 4
- timeslots — 40
- timetables — 27
- users — 4

### Limitation

The backup is a custom JSON logical export.

It is not a native Google Cloud Firestore managed export and does not currently constitute a fully verified disaster-recovery restoration.

**Status:** Backup created; restore verification required later.

---

## 5. Firebase Credentials

### Current Status

The previously exposed service-account key was revoked.

A replacement service-account key was created and successfully authenticated against Firestore.

The `.env` file is excluded from Git.

### Limitation

Production secret-management and deployment environment configuration still require a dedicated audit.

**Status:** Local configuration verified; production secret management requires verification.

---

## 6. AI / Genkit

The project contains AI/Genkit flows for:

- timetable generation
- scheduling conflict resolution
- timetable improvement suggestions

### Limitation

The following still require production testing:

- invalid AI inputs
- AI service failures
- timeout handling
- malformed AI responses
- API quota/resource failures
- authentication and authorization around AI operations
- graceful fallback behavior

**Status:** Requires production-hardening tests.

---

## 7. Timetable Generation

The timetable subsystem contains generation, validation, conflict detection, scoring, and suggestion logic.

### Limitation

A successful application build does not prove that generated timetables are correct for all combinations of:

- faculty
- rooms
- sections
- courses
- timeslots
- laboratory requirements
- scheduling constraints

**Status:** Requires systematic functional testing.

---

## 8. Timetable Workflow

The system contains workflow states and role-based review/approval functionality.

### Limitation

End-to-end workflow testing is still required for:

- draft creation
- editing
- submission/review
- HOD feedback
- approval
- publication
- invalid state transitions
- unauthorized state transitions

**Status:** Requires testing.

---

## 9. Production Observability

No complete production observability baseline has yet been established.

Items requiring verification include:

- application error logging
- API error monitoring
- Firebase errors
- AI failures
- database failures
- production alerts
- operational debugging

**Status:** Requires verification.

---

## 10. Automated Testing

No complete automated test suite has been established for the current application.

**Status:** Production test coverage requires improvement.

---

## 11. Performance

Production performance has not yet been comprehensively measured.

Areas requiring testing include:

- timetable generation time
- Firestore query performance
- dashboard loading
- large timetable rendering
- concurrent requests
- AI response latency

**Status:** Requires benchmarking.

---

## 12. Dependency and Runtime Security

The project contains a substantial dependency tree.

A complete dependency vulnerability audit has not yet been recorded as part of this baseline.

**Status:** Requires security audit.

---

## 13. Known Baseline Conclusion

At the beginning of production hardening:

### Verified

- Production build succeeds.
- Git baseline is preserved.
- Production-hardening branch exists.
- Stable baseline tag exists.
- Firestore backup exists.
- Firebase credential rotation completed.
- `.env` is excluded from Git.
- Static API authorization checks pass.
- Static Firestore security checks pass.

### Not Yet Verified

- Full type checking
- Full linting
- Runtime API authorization
- Runtime Firestore rules
- Backup restoration
- Complete timetable correctness
- Complete workflow correctness
- AI failure handling
- Production observability
- Automated test coverage
- Performance under realistic load
- Dependency vulnerability status
- Production deployment configuration

This document is a baseline, not a statement that the application is production-ready.
