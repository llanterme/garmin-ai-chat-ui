# Athlete IQ — Architecture Refactor Phase

## Overview

Separate the AI/LLM workload from the data layer to prepare for production deployment.

**Status: ✅ COMPLETE**


## Completed Architecture

```
UI → garmin-adapter (data only) → athlete-iq-agents (AI brain)
```

garmin-adapter handles: sync, persistence, metrics, milestones, Pinecone search, auth, BFF proxy
athlete-iq-agents handles: ALL LLM calls, chat orchestration, workout generation, insights


## Completed Tasks

| Task | Description | Status |
|------|-------------|--------|
| AR-1 | Pinecone search endpoint (`POST /api/v1/search/activities`) | ✅ |
| AR-2 | Milestones endpoint (`GET /api/v1/insights/milestones`) | ✅ (done in P2.5-T6a) |
| AR-3 | Chat orchestration in Java (ChatOrchestrationServiceImpl, 427 lines) | ✅ + system prompt fix |
| AR-4 | Post-sync insights in Java (InsightGenerationServiceImpl) | ✅ |
| AR-5 | Python cutover to proxy mode (conversation.py + insights.py rewritten) | ✅ + date serialization fix |
| AR-6 | API key auth on athlete-iq-agents (ApiKeyAuthFilter) | ✅ |
| AR-6b | Python sends API key on all proxy calls (get_agent_headers) | ✅ |

## Bug Fixes During Refactor

| Bug | Fix |
|-----|-----|
| Java system prompt was rewritten instead of copied verbatim | AR-3-fix: replaced with exact Python original |
| `Object of type date is not JSON serializable` in chat proxy | AR-5-fix: custom `_json_serial` handler for date/datetime |
| "Since Rest: 0d" confusing (showed days-since-rest, not rest streak) | UX-fix: changed to consecutive rest streak logic |

## Deferred (Post-Launch)

| Task | Description | Status |
|------|-------------|--------|
| AR-7 | Async OpenAI client (if any LLM calls remain in Python) | Not needed — all LLM moved to Java |
| AR-8 | Redis caches | Deferred — in-memory works for initial launch |
