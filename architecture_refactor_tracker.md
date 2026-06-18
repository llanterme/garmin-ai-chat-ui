# Athlete IQ — Architecture Refactor Phase

## Overview

Separate the AI/LLM workload from the data layer to prepare for production deployment. This is the critical pre-production work that enables scaling, independent deployments, and external users.

**Status: PLANNING — next phase to execute**

**Why now:** garmin-adapter currently handles both data AND AI workloads. A single chat request holds a worker for 20-30 seconds (Pinecone search → MySQL queries → HTTP to Java agents → OpenAI LLM call). With 4-8 uvicorn workers, 4 simultaneous chat requests = entire API is unresponsive. Dashboard, auth, sync — all blocked.


## Current Architecture (monolith)

```
┌──────────────────────────────────────────────────────────┐
│  garmin-ai-chat-ui (Next.js :3000)                        │
│  Frontend — talks to garmin-adapter only                  │
└─────────────────────┬────────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────────┐
│  garmin-adapter (Python/FastAPI :8002)                     │
│                                                           │
│  DATA LAYER:                    AI LAYER (should move):   │
│  ✅ Garmin sync                 ❌ LLM service (OpenAI)   │
│  ✅ MySQL persistence           ❌ Chat orchestration      │
│  ✅ Pinecone ingestion          ❌ Workout intent detect   │
│  ✅ Auth + user management      ❌ Post-sync insights      │
│  ✅ Deterministic metrics       ❌ Milestone chat inject   │
│  ✅ Activity/trends API         ❌ Follow-up questions     │
│  ✅ Conversation DB persistence                           │
│  ✅ Milestone detection (pure computation)                │
│  ✅ BFF proxy to Java agents                              │
└─────────────────────┬────────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────────┐
│  athlete-iq-agents (Java/Spring Boot :8085)                │
│  Workout generation only:                                 │
│  ✅ Recommendation agent                                  │
│  ✅ Daily plan agent                                      │
│  ✅ Weekly scheduler agent                                │
└──────────────────────────────────────────────────────────┘
```


## Target Architecture (separated)

```
┌──────────────────────────────────────────────────────────┐
│  garmin-ai-chat-ui (Next.js :3000)                        │
│  Frontend — talks to garmin-adapter only (BFF)            │
└─────────────────────┬────────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────────┐
│  garmin-adapter (Python/FastAPI :8002)                     │
│  DATA LAYER ONLY:                                         │
│  ✅ Garmin sync + MySQL + Pinecone ingestion              │
│  ✅ Auth + user management                                │
│  ✅ Deterministic metrics (ACR, FTP, zones, load)         │
│  ✅ Milestone detection (pure computation)                │
│  ✅ Activity/trends/metrics API endpoints                 │
│  ✅ Conversation DB persistence (repository + CRUD API)   │
│  ✅ Pinecone SEARCH endpoint (new — serves queries)       │
│  ✅ BFF proxy to athlete-iq-agents for ALL AI calls       │
└────────────┬─────────────────────────────┬───────────────┘
             │                             │
             │  data endpoints             │  AI proxy
             │  (metrics, activities,      │  (chat, insights,
             │   milestones, search)       │   workouts)
             │                             │
┌────────────▼─────────────────────────────▼───────────────┐
│  athlete-iq-agents (Java/Spring Boot :8085)                │
│  AI BRAIN — ALL intelligence:                             │
│                                                           │
│  EXISTING:                      NEW (migrated from Python):│
│  ✅ Workout recommendation      🔄 Chat orchestration      │
│  ✅ Daily plan agent            🔄 LLM calls (OpenAI)      │
│  ✅ Weekly scheduler agent      🔄 Post-sync insights      │
│                                 🔄 Workout intent detect   │
│                                 🔄 Educational system prompt│
│                                 🔄 Follow-up questions     │
│                                                           │
│  Consumes from garmin-adapter:                            │
│  → Training metrics (existing agent view endpoint)        │
│  → Pinecone search results (new search endpoint)          │
│  → User physiology (existing endpoint)                    │
│  → Milestones (existing endpoint)                         │
│  → Conversation history (existing DB endpoint)            │
└──────────────────────────────────────────────────────────┘
```


## Task Breakdown

### AR-1 — Expose Pinecone Search as a garmin-adapter Endpoint
**Agent:** python-backend-engineer
**Goal:** The Pinecone vector search is currently called internally by conversation.py. Expose it as an API endpoint so athlete-iq-agents can call it.
**Scope:**
- New endpoint: `POST /api/v1/search/activities` — accepts a query string, returns relevant activity summaries from Pinecone
- Reuses the existing `query_pinecone` / vector search logic
- Auth required
- Returns activity IDs + relevance scores + formatted summaries (same format currently passed to the LLM)
**Effort:** Small
**Prerequisite:** None

### AR-2 — Expose Milestones as a garmin-adapter Endpoint
**Agent:** python-backend-engineer
**Goal:** Milestones are currently computed and injected into the LLM context within conversation.py. Expose them as a standalone API endpoint.
**Scope:**
- Already done as part of P2.5-T6a: `GET /api/v1/insights/milestones`
**Status:** ✅ ALREADY COMPLETE

### AR-3 — Build Chat Orchestration in athlete-iq-agents (Java)
**Agent:** java-backend-engineer
**Goal:** Migrate the chat orchestration logic from Python (conversation.py + llm.py) to Java.
**Scope:**
- New ChatOrchestrationService that:
  1. Receives a chat query + user context
  2. Calls garmin-adapter for: training metrics, Pinecone search results, milestones, conversation history
  3. Detects workout intent (migrate keyword detection)
  4. If workout intent: calls existing recommendation + plan agents
  5. Assembles LLM context (metrics + search results + milestones + workout data)
  6. Calls OpenAI (via LangChain4j or direct client) with the educational system prompt
  7. Generates follow-up questions
  8. Returns the chat response
- New endpoint: `POST /api/v1/chat/query` on athlete-iq-agents
- Migrate the entire educational system prompt from Python to Java
- Migrate workout intent detection keywords
- Migrate the context formatting logic (how metrics/milestones/workouts are formatted for the LLM)
**Effort:** Large
**Prerequisite:** AR-1

### AR-4 — Build Post-Sync Insights in athlete-iq-agents (Java)
**Agent:** java-backend-engineer
**Goal:** Migrate the insight generation from Python to Java.
**Scope:**
- New InsightService that:
  1. Calls garmin-adapter for training metrics
  2. Formats the insight prompt (with ACR interpretation rules)
  3. Calls OpenAI for insight generation
  4. Returns the insight + type
- New endpoint: `POST /api/v1/insights/generate` on athlete-iq-agents
- The garmin-adapter endpoint (`GET /api/v1/insights/post-sync`) becomes a proxy to Java, with the in-memory cache staying in Python for efficiency
**Effort:** Medium
**Prerequisite:** AR-3 (shares the OpenAI client setup)

### AR-5 — Update garmin-adapter Chat Proxy
**Agent:** python-backend-engineer
**Goal:** The existing `POST /api/v1/chat/query` endpoint on garmin-adapter becomes a proxy to athlete-iq-agents, instead of doing the LLM work itself.
**Scope:**
- Chat endpoint proxies to athlete-iq-agents `POST /api/v1/chat/query`
- Passes: query, conversation_id, user_id
- Conversation DB persistence stays in garmin-adapter (save user message before proxy, save assistant response after)
- The proxy fetches training metrics + milestones + Pinecone results and passes them to Java (or Java fetches them directly)
- Remove: `src/services/llm.py` (or gut it — keep only the format helpers if needed)
- Remove: LLM-related code from `src/services/conversation.py` (keep DB persistence, remove OpenAI calls)
- Remove: `openai` dependency from garmin-adapter
**Effort:** Medium
**Prerequisite:** AR-3, AR-4

### AR-6 — Add API Key Auth to athlete-iq-agents
**Agent:** java-backend-engineer
**Goal:** Only garmin-adapter can call athlete-iq-agents endpoints.
**Scope:**
- Shared API key configured in both services via environment variable
- Java Spring Security filter validates `X-API-Key` header on all endpoints
- garmin-adapter sends the key on all proxy calls
**Effort:** Small
**Prerequisite:** None (can be done in parallel)

### AR-7 — Switch to Async OpenAI Client (if keeping any LLM in Python)
**Agent:** python-backend-engineer
**Goal:** If any LLM calls remain in garmin-adapter (e.g., insight caching layer), switch from sync to async.
**Scope:**
- Replace `openai.OpenAI` with `openai.AsyncOpenAI`
- Replace `client.chat.completions.create` with `await client.chat.completions.acreate`
**Effort:** Small
**Prerequisite:** AR-5 (know what's left in Python)

### AR-8 — Move Caches to Redis
**Agent:** python-backend-engineer
**Goal:** In-memory caches (insight, milestone) survive restarts and work across instances.
**Scope:**
- Add Redis dependency
- Replace in-memory cache dicts with Redis GET/SET/EXPIRE
- Conversation persistence already uses DB (P2.5-T7)
**Effort:** Medium
**Prerequisite:** None (can be done independently)


## Execution Order

```
Phase 1 — Foundation (can be parallel):
  AR-1   Pinecone search endpoint (Python)
  AR-6   API key auth (Java)
  AR-8   Redis caches (Python, optional — can defer)

Phase 2 — Migration (sequential):
  AR-3   Chat orchestration in Java (the big one)
  AR-4   Post-sync insights in Java

Phase 3 — Cutover:
  AR-5   Update garmin-adapter to proxy mode
  AR-7   Async cleanup (if needed)

Validation:
  - All existing chat tests pass via the new proxy path
  - Dashboard CTA → chat works end-to-end
  - Post-sync insights generate correctly
  - Workout generation via chat works
  - Conversation persistence still works
  - Performance: chat response time same or better
```


## Key Decisions to Make

1. **LangChain4j for OpenAI calls in Java?** Currently used for the workout agents. Could reuse for chat. Alternatively, use the OpenAI Java SDK directly for more control over the chat prompt.

2. **Does Java call garmin-adapter for data, or does Python send data to Java?**
   - Option A: Python fetches metrics/search/milestones, packages them, sends to Java along with the chat query. Java only does LLM orchestration.
   - Option B: Java receives the query, calls garmin-adapter's endpoints for data, then does LLM orchestration.
   - Recommendation: **Option A** — keeps the data fetching in Python (where the logic already exists) and Java stays focused on AI. Also reduces the number of cross-service calls from 4+ (Java → Python) to 1 (Python → Java with payload).

3. **What happens to the Python LLM service?** After migration:
   - Delete `src/services/llm.py` entirely
   - Gut `src/services/conversation.py` to just: receive query → save to DB → proxy to Java → save response to DB → return
   - The `openai` Python dependency can be removed from the project

4. **Redis now or later?** Redis is nice-to-have for caching but not critical for the architecture split. Can defer to after the refactor if it adds too much scope.


## Risk Mitigation

- **Don't do a big-bang migration.** Keep the Python chat path working throughout. Add the Java chat endpoint in parallel, test it, then switch the proxy.
- **Feature parity testing:** Run the same set of chat queries through both paths and compare responses.
- **Rollback plan:** The proxy in garmin-adapter can be switched back to local LLM with a config flag during the transition.
