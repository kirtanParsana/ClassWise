# ClassWise — Architecture Baseline

**Project:** ClassWise – AI-Assisted Academic Timetable Management and Resource Allocation System

**Baseline Date:** 2026-09-29

**Baseline Branch:** `production-hardening`

**Baseline Commit:** `45ed404`

**Baseline Tag:** `v1.0.0-baseline`

---

## 1. System Overview

ClassWise is a role-based academic timetable management system designed to automate timetable generation, resource allocation, conflict detection, timetable review, approval, and publication.

The current application is implemented using Next.js, React, TypeScript, Firebase Authentication, Cloud Firestore, Firebase Admin SDK, and Genkit-based AI flows.

---

## 2. Technology Stack

### Frontend

- Next.js 15.5.23
- React 19
- TypeScript
- Tailwind CSS
- Radix UI / shadcn-style components
- Recharts
- React Hook Form
- Lucide React

### Backend / Application Layer

- Next.js App Router
- Next.js API Routes
- Firebase Admin SDK
- Firebase Authentication
- Cloud Firestore

### AI Layer

- Genkit
- Google GenAI integration
- Timetable generation flow
- Scheduling conflict resolution flow
- Timetable improvement suggestion flow

### Supporting Libraries

- Zod
- date-fns
- jsPDF
- html2canvas

---

## 3. Application Roles

The current system supports four primary user roles:

### Coordinator

Responsible for:

- Managing academic master data
- Generating timetables
- Editing timetables
- Managing timetable drafts
- Managing timetable versions
- Reviewing workflow feedback
- Publishing timetable-related changes

### HOD

Responsible for:

- Reviewing generated timetables
- Reviewing conflicts
- Providing suggestions
- Approving timetables
- Viewing approved and published timetables

### Faculty

Responsible for:

- Viewing assigned timetable information
- Viewing profile information
- Viewing relevant schedules

### Student

Responsible for:

- Viewing timetable information
- Viewing profile information
- Accessing published schedules

---

## 4. Frontend Architecture

The frontend uses the Next.js App Router.

Major route groups include:

- `/login`
- `/coordinator`
- `/dashboard`
- `/hod`
- `/faculty`
- `/student`

The application also contains shared components for:

- Authentication
- Navigation
- Dashboard statistics
- Timetable display
- Timetable generation
- Conflict resolution
- Suggestions
- Workflow status
- Published timetable views

---

## 5. API Layer

Current API routes include:

### Conflict API

`src/app/api/conflicts/route.ts`

Used for timetable conflict-related operations.

### Timetable Generation API

`src/app/api/generate-timetable/route.ts`

Responsible for initiating timetable generation.

### Timetable Actions API

`src/app/api/timetables/[id]/actions/route.ts`

Handles timetable workflow actions.

### Timetable Suggestions API

`src/app/api/timetables/[id]/suggestions/route.ts`

Handles timetable improvement suggestions.

---

## 6. Authentication and Authorization

Authentication is implemented using Firebase Authentication.

Relevant modules include:

- `src/context/auth-context.tsx`
- `src/firebase/auth/use-user.tsx`
- `src/firebase/client.ts`
- `src/firebase/admin.ts`
- `src/lib/auth.ts`
- `src/lib/server-auth.ts`
- `src/lib/rbac.ts`
- `src/components/auth/ProtectedRoute.tsx`

Role-based access control is used to restrict functionality based on the authenticated user's role.

---

## 7. Timetable Generation Architecture

The timetable subsystem contains multiple layers.

### Generation

- `src/ai/flows/generate-timetable.ts`
- `src/lib/server-timetable.ts`
- `src/components/timetable/timetable-generator.tsx`

### Validation

- `src/lib/timetable-validation.ts`
- `src/lib/timetable-utils.ts`

### Conflict Detection

- `src/lib/conflict-detection.ts`
- `src/app/api/conflicts/route.ts`
- `src/ai/flows/resolve-scheduling-conflicts.ts`

### Scoring

- `src/lib/timetable-scoring.ts`

### Improvement Suggestions

- `src/ai/flows/suggest-timetable-improvements.ts`
- `src/app/api/timetables/[id]/suggestions/route.ts`

---

## 8. Firestore Data Architecture

The current Firestore project is:

`studio-9712848338-8f5d7`

Current top-level collections:

- `courses`
- `faculties`
- `rooms`
- `schedules`
- `sections`
- `timeslots`
- `timetables`
- `users`

Baseline database snapshot:

**1,342 documents**

Breakdown:

| Collection | Documents |
|---|---:|
| courses | 10 |
| faculties | 6 |
| rooms | 7 |
| schedules | 1,244 |
| sections | 4 |
| timeslots | 40 |
| timetables | 27 |
| users | 4 |

---

## 9. Firestore Integration

Client-side Firebase configuration is located in:

`src/firebase/client.ts`

Firebase Admin configuration is located in:

`src/firebase/admin.ts`

The server uses environment variables for sensitive Admin SDK credentials.

Sensitive credentials are stored in `.env`, which is excluded from Git.

---

## 10. Services Layer

The application currently contains the following service modules:

- `conflictService.ts`
- `notificationService.ts`
- `scheduleService.ts`
- `suggestionService.ts`
- `timetableService.ts`
- `userService.ts`

These services provide reusable application-level operations around timetable and user functionality.

---

## 11. Context and State Management

The application uses React context for shared application state.

Current contexts include:

- Authentication context
- Master data context
- Timetable context

Relevant files:

- `src/context/auth-context.tsx`
- `src/context/master-data-context.tsx`
- `src/context/timetable-context.tsx`

---

## 12. AI Architecture

The current AI-related structure includes:

- `src/ai/dev.ts`
- `src/ai/genkit.ts`
- `src/ai/flows/generate-timetable.ts`
- `src/ai/flows/resolve-scheduling-conflicts.ts`
- `src/ai/flows/suggest-timetable-improvements.ts`

The AI layer is integrated with the application's timetable workflow.

The production-hardening process must separately verify:

- AI API configuration
- Authentication
- Error handling
- Input validation
- Output validation
- Rate/resource limitations
- Failure behavior
- Security of AI-related endpoints

---

## 13. Production Build

The current production build was successfully executed using:

```bash
npm run build

Current Build Result

- Next.js 15.5.23
- 34 routes generated
- Production compilation successful
- Type validation currently skipped
- Linting currently skipped

> **Important:** A successful production build does not by itself establish production readiness.

---

## 14. Current Production-Hardening Baseline

The following baseline protections have been established:

- Git working tree clean
- `production-hardening` branch created
- Baseline commit created
- Baseline Git tag created
- Firestore backup created
- Backup directory excluded from Git
- Firebase service-account credential rotated
- Old exposed service-account key deleted
- New credential verified against Firestore
- Production build verified


---

## 15. Known Baseline Limitations

The following items are intentionally **not considered resolved** by this architecture snapshot:

1. Type checking is skipped during the production build.
2. ESLint/linting is skipped during the production build.
3. Firestore backup is a logical JSON backup rather than a native Firestore managed export.
4. Production deployment configuration has not yet been fully audited.
5. API security still requires dedicated verification.
6. Firestore security rules still require production-hardening verification.
7. AI flows require production failure/security testing.
8. No complete automated test suite has yet been established.
9. Runtime performance has not yet been fully validated.
10. Production observability and error monitoring require verification.

---

## 16. Baseline Purpose

This document represents the architecture and operational state of **ClassWise** at the beginning of the production-hardening process.

Changes made after this baseline should be documented separately so that production-hardening changes remain distinguishable from the pre-existing application implementation.

---

## Production-Hardening Status

| Area | Status |
|---|---|
| Git working tree | ✅ Clean |
| Production-hardening branch | ✅ Created |
| Baseline commit | ✅ Created |
| Baseline Git tag | ✅ Created |
| Firestore backup | ✅ Created |
| Backup excluded from Git | ✅ Completed |
| Firebase credential rotation | ✅ Completed |
| Old exposed credential deleted | ✅ Completed |
| New credential verified | ✅ Completed |
| Production build | ✅ Successful |
| Type checking | ⚠️ Skipped |
| ESLint / linting | ⚠️ Skipped |
| Deployment audit | ⏳ Pending |
| API security verification | ⏳ Pending |
| Firestore rules verification | ⏳ Pending |
| AI security/failure testing | ⏳ Pending |
| Automated test suite | ⏳ Pending |
| Runtime performance validation | ⏳ Pending |
| Observability / error monitoring | ⏳ Pending |

> **Baseline status:** The application has a successful production compilation and several operational protections in place, but it should **not yet be classified as production-ready** until the remaining hardening items are verified.