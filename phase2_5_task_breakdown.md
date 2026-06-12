# Athlete IQ — Phase 2.5: Intelligent Training Companion

## Vision

Transform the AI chat from a technical data query tool into an intelligent training companion that helps beginner athletes understand their own physiology, learn training concepts, and make informed decisions — all grounded in their real Garmin data.

**Target user:** The "just getting started" athlete. Has a Garmin watch, trains 3-5 days/week, is accumulating data but doesn't fully understand it. Wants guidance but also wants to learn.

**Core principle:** Don't dumb down the data — make it accessible through education. The dashboard keeps all its technical metrics. The chat becomes the bridge that explains them in context.

**Key differentiator:** Every other training app generates plans. Athlete IQ teaches you WHY, using YOUR data.


## What currently powers the chat

- **Pinecone vector search** (4 vector types) finds relevant activities for any query
- **T8 metrics injection** puts computed metrics (ACR, FTP, pace zones, load, rest days) into every LLM call
- **System prompt** is technically focused — "expert fitness AI assistant" targeting experienced athletes
- **gpt-4o-mini** with 1000 max tokens — fast but constrains educational depth
- **Conversation state is in-memory** — lost on restart (ISS-015)
- **Follow-up questions** are generated but generic
- **No workout generation via chat** — user must navigate to /workouts page


## Task Map

```
P2.5-T1  Educational System Prompt Rewrite (garmin-adapter — no code, just prompt)
  │
  ├──→ P2.5-T2  Chat-Driven Workout Generation (garmin-adapter)
  │
  ├──→ P2.5-T3  "What Should I Do Today?" Dashboard CTA (frontend)
  │
  ├──→ P2.5-T4  "Ask AI" Entry Points on Dashboard + Workouts (frontend)
  │
P2.5-T5  Post-Sync Insights (garmin-adapter + frontend)
  │
P2.5-T6  Milestone & Progress Detection (garmin-adapter)
  │
P2.5-T7  Conversation Persistence (garmin-adapter — resolves ISS-015)
  │
P2.5-T8  Increase LLM Context for Educational Depth (garmin-adapter)
```


## P2.5-T1 — Educational System Prompt Rewrite
**Agent:** python-backend-engineer (or manual — it's just a string change)
**Goal:** Rewrite the LLM system prompt to be educational, encouraging, and beginner-aware while maintaining data accuracy.
**Scope:**
- Rewrite `_create_system_prompt()` in `src/services/llm.py`
- Key changes to the prompt personality:
  - **Explain concepts in context.** When mentioning ACR, explain what it means for THIS athlete: "Your acute:chronic ratio is 0.71 — this means your recent training is about 70% of your monthly average, which means your body is well-recovered and ready for a harder session."
  - **Use analogies for technical terms.** "Think of FTP as the hardest effort you could hold for an hour" instead of "Functional Threshold Power represents the maximum sustainable power output."
  - **Celebrate progress.** "Your FTP improved from 217W to 226W in 2 months — that's a 4% gain, which is significant!"
  - **Be prescriptive but explain why.** "I'd recommend a tempo run today because you haven't done a hard session in 4 days and your body has recovered — tempo pace trains your body to clear lactate, which makes faster efforts feel easier over time."
  - **Adapt language to the question complexity.** Simple question ("Was my run good?") gets a simple encouraging answer. Technical question ("What's my zone distribution?") gets more detail.
  - **Never assume knowledge.** First time a concept is mentioned in a conversation, explain it. Second time, use it naturally.
- Add a "BEGINNER EDUCATION" section to the prompt covering how to explain:
  - Training zones (easy, aerobic, tempo, threshold, VO2max) in plain English
  - ACR and training load without jargon
  - Why rest days matter
  - What heart rate zones mean physiologically
  - Why power is more reliable than heart rate for cycling
  - What a good training week looks like
- Keep the existing data accuracy rules (cite specific numbers, use all activities for aggregations)
- Keep the formatting guidelines (emojis, sections, follow-ups)
**Exit Criteria:**
- [ ] Chat explains ACR in beginner-friendly terms when asked
- [ ] Chat explains FTP without assuming the athlete knows what it is
- [ ] Chat celebrates improvements when they exist in the data
- [ ] Chat recommends rest with a clear "why" explanation
- [ ] Existing data accuracy is maintained (same numbers, better explanation)


## P2.5-T2 — Chat-Driven Workout Generation
**Agent:** python-backend-engineer
**Goal:** Allow the user to ask the chat to generate a workout recommendation and plan via natural conversation.
**Scope:**
- Detect workout generation intent in the chat query (keywords: "what should I do today", "generate a workout", "plan my training", "what workout", "suggest a session")
- When detected, call the existing workout proxy endpoints internally (POST /api/v1/workouts/recommendation and/or POST /api/v1/workouts/plan) from within the conversation service
- Format the result as a conversational response with explanation:
  - "Based on your training data, I'd recommend a **tempo run** today. Here's why: [explanation]. Here's a structured plan: [formatted workout]"
- The workout structure should be formatted in the chat response as readable text (not JSON) — similar to what we saw in the UI testing earlier
- If the workout service is unavailable, fall back to a text-based recommendation using the training metrics (no structured plan, but still data-driven advice)
- Support follow-up refinements: "Make it shorter", "Can I do cycling instead?", "What about a 30-minute session?"
**Exit Criteria:**
- [ ] "What should I do today?" generates a workout recommendation via chat
- [ ] The response includes structured workout with intervals and targets
- [ ] The response explains WHY this workout was chosen
- [ ] "Make it cycling" regenerates with sport override
- [ ] Falls back gracefully if workout service is down


## P2.5-T3 — "What Should I Do Today?" Dashboard CTA
**Agent:** modern-frontend-engineer
**Goal:** Add a prominent call-to-action on the dashboard that opens the chat with a pre-filled workout question.
**Scope:**
- New component on the dashboard: a visually prominent card/button that says "What should I do today?" with a brief context line ("Based on your ACR of 0.71 and 6 days since rest")
- Clicking it navigates to /chat with the query pre-filled: "What should I do today?"
- Position: between the training snapshot and the performance zones section
- Style: emerald accent, slightly larger than other CTA buttons, with a sparkle/AI icon
- The card adapts its message based on training metrics:
  - ACR > 1.3: "You might need a rest day — let's check" (amber accent)
  - daysSinceRestDay > 5: "It's been 6 days since rest — shall we plan recovery?" (amber)
  - Default: "Ready for today's workout? Let me plan it for you" (emerald)
**Exit Criteria:**
- [ ] CTA visible on dashboard with dynamic message based on metrics
- [ ] Clicking navigates to /chat with pre-filled query
- [ ] Responsive on mobile
- [ ] Dark mode compatible


## P2.5-T4 — "Ask AI" Entry Points
**Agent:** modern-frontend-engineer
**Goal:** Add small "Ask AI" links/icons next to metrics on the dashboard and workouts page that open the chat with context-specific questions.
**Scope:**
- Small clickable help/AI icon (MessageCircle from lucide or a custom "?" with AI sparkle) next to:
  - ACR value on dashboard → opens chat with "What does my ACR of 0.71 mean?"
  - FTP on dashboard → "What does my cycling FTP of 226W mean?"
  - Threshold pace → "What does my threshold pace of 5:02/km mean?"
  - Zone distribution → "What does my zone distribution mean and is it balanced?"
  - Days since rest → "Should I take a rest day? It's been 6 days."
- Implementation: each link navigates to `/chat?query=<url-encoded-question>`
- The chat page reads the query param and auto-sends the message on load
- Style: subtle, small, muted icon that becomes visible on hover (or always visible but muted)
**Exit Criteria:**
- [ ] "Ask AI" icons visible on dashboard metrics
- [ ] Clicking opens chat with pre-filled contextual question
- [ ] Chat auto-sends the question on load
- [ ] At least 5 entry points connected


## P2.5-T5 — Post-Sync Insights
**Agent:** python-backend-engineer + modern-frontend-engineer
**Goal:** After a Garmin sync completes, generate a brief AI insight about the athlete's recent training.
**Scope:**
- Backend: New endpoint `GET /api/v1/insights/post-sync` that:
  - Fetches the last 7 days of training metrics
  - Sends a focused prompt to the LLM: "Generate a 2-3 sentence insight about this athlete's recent training. Focus on one of: a notable improvement, a recovery concern, a training pattern, or a milestone."
  - Returns: `{ insight: "Your FTP improved 4% this month...", type: "improvement|concern|pattern|milestone" }`
  - Cache the result for 1 hour (don't regenerate on every page load)
- Frontend: Show the insight on the dashboard as a small card below the training snapshot
  - Type-specific styling: improvement (emerald), concern (amber), pattern (sky), milestone (purple)
  - "Ask me more →" link that opens the chat with the insight as context
**Exit Criteria:**
- [ ] Post-sync insight generates after Garmin sync
- [ ] Insight appears on dashboard
- [ ] "Ask me more" opens chat with context
- [ ] Insight is cached (not regenerated on every page load)


## P2.5-T6 — Milestone & Progress Detection
**Agent:** python-backend-engineer
**Goal:** Detect and surface training milestones from the athlete's data.
**Scope:**
- New method in ActivityViewService: `detect_milestones(activities, training_metrics)` that checks for:
  - FTP improvement (compare current vs 30/60/90 days ago from trends data)
  - Threshold pace improvement
  - Consecutive training weeks (4, 8, 12, 16+ weeks)
  - Activity count milestones (50, 100, 200, 500 activities)
  - Personal bests (fastest 5K, longest ride, highest power, etc.)
  - First activity of a new sport type
- Returns a list of milestone objects: `{ type, title, description, date, value }`
- Inject milestones into the chat context alongside training metrics
- The LLM can then naturally mention them: "By the way, you've trained 12 consecutive weeks — that's serious consistency!"
**Exit Criteria:**
- [ ] Milestones detected from real activity data
- [ ] At least 5 milestone types implemented
- [ ] Milestones appear in chat context
- [ ] LLM references milestones naturally in responses


## P2.5-T7 — Conversation Persistence (resolves ISS-015)
**Agent:** python-backend-engineer
**Goal:** Persist conversation state to the database so chat history survives server restarts.
**Scope:**
- The DB tables already exist (`conversations`, `conversation_messages`) from an earlier migration
- Rewrite `ConversationService` to read/write from DB instead of the in-memory dict
- Keep the 24-hour TTL (but in DB terms: mark conversations as expired, don't delete)
- Add a "Recent conversations" section to the chat page showing previous chat threads
- Support resuming a conversation from history
**Exit Criteria:**
- [ ] Conversations survive server restart
- [ ] Chat page shows recent conversations
- [ ] Can resume a previous conversation
- [ ] Old conversations are expired (not deleted) after 24 hours


## P2.5-T8 — Increase LLM Context for Educational Depth
**Agent:** python-backend-engineer
**Goal:** Give the LLM more room to explain and educate.
**Scope:**
- Increase `max_tokens` from 1000 to 2000 in `LLMConfig`
  - 1000 tokens ≈ 750 words — barely enough for data + explanation
  - 2000 tokens ≈ 1500 words — room for data + explanation + "why" context
- Consider upgrading from gpt-4o-mini to gpt-4o for complex educational queries
  - Simple queries (single metric lookup): keep gpt-4o-mini (fast, cheap)
  - Complex queries (workout generation, trend analysis, multi-topic): use gpt-4o (better reasoning)
  - Implementation: detect query complexity and route accordingly
- Monitor token usage and cost
**Exit Criteria:**
- [ ] Responses are longer and more educational (compare before/after)
- [ ] Complex queries use gpt-4o (or remain on gpt-4o-mini if cost is a concern)
- [ ] Simple queries remain fast


## Priority Order

1. **P2.5-T1** (system prompt) — highest impact, zero code changes
2. **P2.5-T8** (increase tokens) — immediate quality improvement
3. **P2.5-T2** (chat workout generation) — the "killer feature" for beginners
4. **P2.5-T3** (dashboard CTA) — drives users to the chat
5. **P2.5-T4** (Ask AI entry points) — multiplies the chat's value
6. **P2.5-T5** (post-sync insights) — proactive coaching
7. **P2.5-T6** (milestones) — engagement and encouragement
8. **P2.5-T7** (conversation persistence) — infrastructure for long-term use


## What's deferred / deprioritized

| Item | Status | Reason |
|------|--------|--------|
| P2-T7/T8 Activity detail enhancement | **Reframe to P2.5 education context** — do after P2.5-T1-T4 | Chat can already answer "What did this workout do for me?" |
| Phase 3 Goals system | **Keep, do after P2.5** | Education layer first, goals second |
| P2-D1 Async weekly plan | **Keep deferred** | Weekly plan is paused |
| Weekly plan extension | **Paused** | Focus on daily recommendation via chat |
| ISS-012/013 Lap data | **Keep deferred** | Not aligned with beginner focus |
| ISS-014 MFA scaling | **Keep deferred** | Single-user for now |
| ISS-017 Power stream | **Keep deferred** | FTP from summary is good enough |
