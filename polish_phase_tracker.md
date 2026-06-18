# Athlete IQ — Post-Feature Polish & Security Hardening

## Overview

Security, code quality, and infrastructure items to address alongside or after the architecture refactor. Identified in the Architecture & Code Review conducted after Phase 2.5.

**Architecture refactor is tracked separately:** See `architecture_refactor_tracker.md`


## ✅ Completed

| ID | Description |
|----|-------------|
| C1 | JWT tokens moved to HttpOnly cookies |
| M6 | Conversation cleanup race condition — resolved by P2.5-T7 DB persistence |


## 🔴 Pre-Deployment Security

| ID | Severity | Description | Effort | Status |
|----|----------|-------------|--------|--------|
| C2 | 🔴 Critical | Remove default secret_key and garmin_encryption_key from config | Tiny | Pending |
| C3 | 🔴 Critical | Add shared API key auth on athlete-iq-agents endpoints | Small | → AR-6 in architecture refactor |
| H1 | 🟠 High | Add rate limiting (slowapi) to chat, workout, and login endpoints | Small | Pending |
| H2 | 🟠 High | Remove environment/debug from public /api/info response | Tiny | Pending |
| H5 | 🟠 High | Add max length validation on chat query input (2000 chars) | Small | Pending |


## 🟡 Code Quality

| ID | Severity | Description | Effort | Status |
|----|----------|-------------|--------|--------|
| H3 | 🟠 High | Clean up debug logging and hardcoded TARGET_ID in activity_views.py | Small | Pending |
| H4 | 🟠 High | Replace deprecated datetime.utcnow() with datetime.now(tz=timezone.utc) | Tiny | Pending |
| H6 | 🟠 High | Delete stale test files from project root (test_t4.py, test_t5.py, etc.) | Tiny | Pending |
| L1 | 🔵 Low | Fix default API port in frontend (8000 → 8002) | Tiny | Pending |
| L2 | 🔵 Low | Replace all "Garmin AI Chat" metadata with "Athlete IQ" | Tiny | Pending |
| M7 | 🟡 Medium | Make CORS origins configurable via env var for production | Tiny | Pending |


## 🟡 Infrastructure

| ID | Severity | Description | Effort | Status |
|----|----------|-------------|--------|--------|
| M2 | 🟡 Medium | Add React error boundaries to frontend | Small | Pending |
| M3 | 🟡 Medium | Add CI/CD pipeline (GitHub Actions) for all three projects | Medium | Pending |
| M5 | 🟡 Medium | Audit DB migrations, add foreign key constraints + cascade deletes | Medium | Pending |


## 🔵 Ongoing Investment (Post-Launch)

| ID | Severity | Description | Effort | Status |
|----|----------|-------------|--------|--------|
| M1 | 🟡 Medium | Add frontend tests (Vitest + React Testing Library) | Large | Pending |
| M4 | 🟡 Medium | Add observability — correlation IDs, metrics, tracing | Large | Pending |
| L3 | 🔵 Low | Split activity_views.py into smaller modules | Medium | Pending |
| L4 | 🔵 Low | Verify Java StaticDevTokenProvider is dev-profile-only | Small | Pending |
| L5 | 🔵 Low | Accessibility audit (aria labels, keyboard nav, screen reader) | Medium | Pending |


## Deferred Feature Improvements

| ID | Description | Effort | Status |
|----|-------------|--------|--------|
| P2-T7/T8 | Activity detail ("What did this workout do for me?") | Medium | After architecture refactor |
| P2-D1 | Async weekly plan generation (task/polling pattern) | Large | After AR-5 |
| P2-D2 | Light mode chart colors | Small | Cosmetic polish |
