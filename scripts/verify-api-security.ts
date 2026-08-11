#!/usr/bin/env npx tsx
/**
 * Static verification of API route authorization patterns.
 * Run: npx tsx scripts/verify-api-security.ts
 *
 * This script reads route source files and confirms requireRole/verifyAuthToken
 * usage. For live Firebase token tests, use authenticated curl against a
 * running dev server with real credentials.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "..");

const routes: { path: string; allowedRoles: string[] }[] = [
  {
    path: "src/app/api/generate-timetable/route.ts",
    allowedRoles: ["coordinator"],
  },
  {
    path: "src/app/api/conflicts/route.ts",
    allowedRoles: ["coordinator", "hod"],
  },
  {
    path: "src/app/api/timetables/[id]/actions/route.ts",
    allowedRoles: ["coordinator", "hod"],
  },
  {
    path: "src/app/api/timetables/[id]/suggestions/route.ts",
    allowedRoles: ["coordinator", "hod"],
  },
];

let failed = 0;

for (const route of routes) {
  const fullPath = join(ROOT, route.path);
  if (!existsSync(fullPath)) {
    console.error(`❌ Missing: ${route.path}`);
    failed++;
    continue;
  }

  const src = readFileSync(fullPath, "utf8");
  const hasAuth = src.includes("requireRole") || src.includes("verifyAuthToken");
  const trustsBodyRole =
    /body\.role/.test(src) ||
    /req\.body\.role/.test(src) ||
    /userRole/.test(src);

  if (!hasAuth) {
    console.error(`❌ ${route.path}: no server auth helper`);
    failed++;
  } else {
    console.log(`✅ ${route.path}: uses server auth`);
  }

  if (trustsBodyRole) {
    console.error(`❌ ${route.path}: may trust role from request body`);
    failed++;
  } else {
    console.log(`✅ ${route.path}: does not trust body role`);
  }
}

const rulesPath = join(ROOT, "firestore.rules");
const rules = readFileSync(rulesPath, "utf8");
const checks = [
  { label: "catch-all deny", ok: rules.includes("allow read, write: if false") },
  { label: "faculty schedule filter", ok: rules.includes("resource.data.facultyId == currentFacultyId()") },
  { label: "student schedule filter", ok: rules.includes("currentStudentSectionId()") },
  { label: "published schedule check", ok: rules.includes("resource.data.timetableStatus == 'published'") },
  { label: "no public users write", ok: rules.includes("allow update: if false") && rules.includes("match /users/{userId}") },
];

for (const c of checks) {
  if (c.ok) console.log(`✅ firestore.rules: ${c.label}`);
  else {
    console.error(`❌ firestore.rules: missing ${c.label}`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}

console.log("\nAll static security checks passed.");
