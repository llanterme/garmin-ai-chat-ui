# Athlete IQ — Phase 2.5: Intelligent Training Companion

## Vision

Transform the AI chat into an intelligent training companion for beginner endurance athletes — teaching, guiding, and celebrating using real Garmin data.

**Status: ALL 8 TASKS COMPLETE ✅**


## Completed Tasks

### P2.5-T1 — Educational System Prompt Rewrite ✅ (combined with T8)
Rewrote `_create_system_prompt()` in `src/services/llm.py`. Increased max_tokens from 1000 → 2000. New personality: explains concepts in context first-time, celebrates progress, "💡 What this means" sections, beginner analogies.

### P2.5-T2 — Chat-Driven Workout Generation ✅
Added workout intent detection (`_detect_workout_intent`, `_detect_sport_override`) in `conversation.py`. Calls athlete-iq-agents recommendation + plan endpoints when workout intent detected. Injects structured workout data into LLM context for educational presentation. Falls back to text recommendation if Java agents are down.

### P2.5-T3 — "What Should I Do Today?" Dashboard CTA ✅
Prominent CTA card on dashboard with dynamic messaging based on ACR and days since rest (emerald default, amber warning). Links to `/chat?query=What should I do today?`. Auto-send via `AutoSendFromQueryParam` component with module-scoped Set guard. Local `useState` for loading state (replaced unreliable `mutation.isPending`).

**Bug fixes:**
- T3-fix: Added 90s axios timeout for workout queries
- T3-fix2: Replaced `router.replace` with `window.history.replaceState` to prevent Next.js re-render
- T3-fix3: Replaced `useEffect`-on-`mutation.data` with per-call `onSuccess`/`onError` callbacks (`useSendChatMessage` hook)
- T3-fix4: Replaced per-instance `useRef` guard with module-scoped `Set` for auto-send dedup; removed `<Suspense>` wrapper
- T3-fix5: Replaced `mutation.isPending` with local `useState<boolean>` controlled by callbacks

### P2.5-T4 — "Ask AI" Entry Points ✅
Reusable `AskAiLink` component (message bubble icon, 70% opacity, emerald on hover, rounded pill background). Added next to 6 dashboard metrics (ACR, 7D Load, Hard, Since Rest, Since Hard, Zones) and Performance Zones card title. Each links to `/chat?query=<contextual question with real values>`.

### P2.5-T5 — Post-Sync Insights ✅
Backend: `GET /api/v1/insights/post-sync` — fetches training metrics, sends focused LLM prompt, returns 2-3 sentence insight with type classification (improvement/concern/pattern/milestone/tip). 1-hour in-memory cache. Explicit ACR interpretation rules in prompt to prevent hallucination.
Frontend: `InsightCard` on dashboard with type-specific styling (border color, icon, tint). "Ask AI →" link to chat.

### P2.5-T6 — Milestone & Progress Detection ✅
Backend: `src/services/milestones.py` with 6 detectors (consecutive training weeks, activity count, FTP improvement, pace improvement, personal bests, volume trend). Injected into chat LLM context via `generate_conversational_response`. API endpoint `GET /api/v1/insights/milestones` with 1-hour cache.
Frontend: `MilestonesCard` on dashboard with type-specific icons/colors (TrendingUp/Flame/Activity/Trophy), value badges, "Ask AI →" links.

### P2.5-T7 — Conversation Persistence ✅ (resolves ISS-015)
Backend: `ConversationRepository` (DB-backed CRUD), rewrote `ConversationService` to use DB instead of in-memory dict. Endpoints: `GET /chat/history` (paginated), `GET /chat/conversations/{id}`, `DELETE /chat/conversations/{id}` (soft-delete). Messages saved before and after LLM call.
Frontend: Left sidebar on desktop (lg+) with conversation list, "New Chat" button, active conversation highlighting (emerald left border). Horizontal pills fallback on mobile. Conversation loaded via `key` prop on `ChatInterface` for clean remount.

### P2.5-T8 — Increase LLM Context ✅ (combined with T1)
max_tokens increased from 1000 → 2000 in `LLMConfig`.


## Bug Fixes Applied During P2.5

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Chat ACR mismatch (0.41 vs 0.71) | 90d activities passed as 28d param | Split into separate 28d/90d fetches (T8-fix) |
| Chat ACR still off (0.87 vs 0.71) | UTC timezone vs Africa/Johannesburg | Switched to JHB timezone (T8-fix2) |
| Post-sync insight wrong ACR interpretation | LLM hallucinated "overtraining" for low ACR | Added explicit ACR interpretation rules to prompt (T5a-fix) |
| "Since Rest" shows 1d when should be 0d | `_compute_days_since_rest` skips today, starts `days_ago=1` | **PENDING** — fix generated but not yet run |
| Chat history not updating after new conversation | `['chat', 'history']` query key not invalidated | **PENDING** — fix generated but not yet run |
