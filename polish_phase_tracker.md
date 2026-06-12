# Athlete IQ — Post-Feature Polish Phase

## Overview

Items identified in the Architecture & Code Review to be addressed after feature implementation is complete, before any external user access or production deployment.


## Pre-Deployment Security (do before any external access)

| ID | Severity | Description | Effort |
|----|----------|-------------|--------|
| C1 | 🔴 Critical | ~~JWT tokens in localStorage~~ → **DONE** — moved to HttpOnly cookies | — |
| C2 | 🔴 Critical | Remove default secret_key and garmin_encryption_key from config | Tiny |
| C3 | 🔴 Critical | Add shared API key auth on athlete-iq-agents endpoints | Small |
| H1 | 🟠 High | Add rate limiting (slowapi) to chat, workout, and login endpoints | Small |
| H2 | 🟠 High | Remove environment/debug from public /api/info response | Tiny |
| H5 | 🟠 High | Add max length validation on chat query input (2000 chars) | Small |


## Code Quality (do before production)

| ID | Severity | Description | Effort |
|----|----------|-------------|--------|
| H3 | 🟠 High | Clean up debug logging and hardcoded TARGET_ID in activity_views.py | Small |
| H4 | 🟠 High | Replace deprecated datetime.utcnow() with datetime.now(tz=timezone.utc) | Tiny |
| H6 | 🟠 High | Delete stale test files from project root (test_t4.py, test_t5.py, etc.) | Tiny |
| L1 | 🔵 Low | Fix default API port in frontend (8000 → 8002) | Tiny |
| L2 | 🔵 Low | Replace all "Garmin AI Chat" metadata with "Athlete IQ" | Tiny |
| M7 | 🟡 Medium | Make CORS origins configurable via env var for production | Tiny |


## Infrastructure (do for production readiness)

| ID | Severity | Description | Effort |
|----|----------|-------------|--------|
| M2 | 🟡 Medium | Add React error boundaries to frontend | Small |
| M3 | 🟡 Medium | Add CI/CD pipeline (GitHub Actions) for all three projects | Medium |
| M5 | 🟡 Medium | Audit DB migrations, add foreign key constraints + cascade deletes | Medium |
| M6 | 🟡 Medium | Fix conversation cleanup race condition (or defer to P2.5-T7 DB persistence) | Small |


## Ongoing Investment (post-launch)

| ID | Severity | Description | Effort |
|----|----------|-------------|--------|
| M1 | 🟡 Medium | Add frontend tests (Vitest + React Testing Library) | Large |
| M4 | 🟡 Medium | Add observability — correlation IDs, metrics, tracing | Large |
| L3 | 🔵 Low | Split activity_views.py into smaller modules | Medium |
| L4 | 🔵 Low | Verify Java StaticDevTokenProvider is dev-profile-only | Small |
| L5 | 🔵 Low | Accessibility audit (aria labels, keyboard nav, screen reader) | Medium |


## Deferred Feature Improvements

| ID | Description | Effort |
|----|-------------|--------|
| P2-D1 | Async weekly plan generation (task/polling pattern) | Large |
| P2-D2 | Light mode chart colors (swap grid/axis colors by theme) | Small |
| P2-D3 | Dashboard metadata branding (covered by L2 above) | Tiny |
