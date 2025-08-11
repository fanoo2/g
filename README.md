<div align="center">

# LiveStreamX (Working Title)

Prototype scaffold for a differentiated interactive live streaming platform featuring real‑time gifting gamification, AI recommendations, hybrid live/VOD, and engagement driven rewards.

</div>

## Vision
Enable creators and viewers to *co-create* the live experience: gifts trigger actions, overlays respond to audience mood, and engagement (not only monetary spend) is rewarded.

## High-Level Feature Pillars
- Live Stream Customization (themes, filters, interactive overlays, polls, background swapping)
- Unique Gifting & Command Gifts (token economy, mini-game triggers, animation overlays)
- Gamified Engagement & Rewards (XP, levels, badges for viewers & creators, leaderboards)
- Hybrid Content (seamless pre-recorded segment insertion into live session)
- Monetization (gifts, gift subscriptions, VIP events, exclusive packs, sponsorship hooks)
- AI Discovery & Personalization (interest vectors, collaborative filtering + behavioral signals)
- Emotional/Mood Layer (real-time aggregated reactions driving dynamic UI changes)
- Social Amplification (shareable moments, cross-post to major social platforms)

## Current Repo Status (MVP Scaffold)
| Area | Status |
|------|--------|
| Backend (Express + Socket.IO) | Chat + gifts namespaces, gift validation, XP/levels, top-up stub |
| Frontend (Next.js + Tailwind) | TS pages, auth/register/login UI, gift send, dark mode, namespaces |
| AI Recommendation Service (FastAPI) | Placeholder /recommend endpoint (no model yet) |
| Realtime | Namespaced sockets (/chat, /gifts) with JWT auth passthrough |
| Docker Compose | Multi-service (frontend, backend, Mongo, Redis, AI) |
| DB/Storage (MongoDB) | Integrated: Users, Gifts (seeded), GiftEvents persisted |
| Cache / Leaderboards (Redis) | Integrated: gift tokens leaderboard (ZSET) with handle enrichment |
| Auth | Implemented: JWT access + refresh tokens; Password hashing; (OAuth pending) |
| Token Economy | Implemented: token balance, spend on gift send, top-up endpoint stub |
| Gamification | Implemented: XP gain + level calc (simple formula) |
| Payments | Pending (Stripe integration & webhooks) |
| Hybrid Streaming / Media | Pending (WebRTC SFU integration) |
| Recommendations | Placeholder service only (data pipeline pending) |
| Observability | Pending (pino/OTel deps added; wiring pending) |

## Monorepo Structure
```
backend/              # Node.js Express API + Socket.IO gateway
frontend/             # Next.js (React) client
ai-recommendation/    # FastAPI microservice for personalized stream recs
docker-compose.yml    # Dev orchestration
```

## Planned Backend Domain Modules
- Auth & Identity (users, creators, roles, OAuth linking)
- Profile & Customization (themes, overlays metadata, assets)
- Stream Session (creation, state machine: scheduled -> live -> ended -> archived)
- Realtime Interaction (chat, polls, Q&A, challenges, mood events)
- Gifts & Economy (tokens, inventory, mini-games, command gifts)
- Engagement Metrics (comment density, retention, reaction velocity)
- Leaderboards (viewers, creators, seasonal resets)
- Monetization (subscriptions, VIP passes, event tickets, payouts)
- Recommendation Signals (watch history, gift graph, similarity vectors)

## Technology Choices (Initial)
| Concern | Tech | Notes |
|---------|------|-------|
| API / Realtime | Express + Socket.IO | Consider scaling with Redis adapter, later WebRTC SFU for media |
| Persistence | MongoDB (integrated) | Users, gifts, gift events stored; seeding on startup |
| Cache / RT Metrics | Redis | Leaderboards, pub/sub, rate limiting |
| Media | External SFU (Janus / LiveKit) | Integrate via WebRTC tokens |
| Client | Next.js + React | SEO + hybrid pages + mobile-first |
| Styling | TailwindCSS (integrated) | Dark mode toggle, utility-first iteration |
| Auth | JWT (access + refresh) + planned OAuth | Secure session rotation, future social growth |
| Payments | Stripe | Gifts purchase, subscriptions |
| AI | FastAPI service | Will add embedding + ranking pipeline |

## Initial Local Development
Prereqs: Docker, Node 20+, Python 3.12 (if running services without Docker).

### Run All Services (Recommended)
```
docker compose up --build
```
Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000 (WebSocket same origin)
- AI Service: http://localhost:8000

### Direct (Non-Docker) Dev
Backend:
```
cd backend && npm install && npm run dev
```
Frontend:
```
cd frontend && npm install && npm run dev
```
AI Service:
```
cd ai-recommendation && pip install -r requirements.txt && uvicorn main:app --reload
```

## Roadmap (Incremental Epics)
1. Auth & Profiles
	- JWT issuance, OAuth providers
	- Creator profile customization endpoints
2. Persistent Data Layer
	- MongoDB integration (users, streams, gifts collections)
	- Redis for leaderboards & ephemeral states
3. Stream Session Control
	- WebRTC SFU integration (LiveKit token issuance service)
	- Hybrid segment insertion (VOD clip queue)
4. Gift Economy v1
	- Token purchase (Stripe Checkout)
	- Gift catalog + command gift mapping
	- Balance ledger & anti-abuse rate limiting
5. Engagement Layer
	- Polls, Q&A, challenges sockets namespaces
	- Mood feed aggregation (reaction counts -> mood state)
6. Gamification
	- XP formulas (activity weighted), levels & badge assets
	- Seasonal leaderboards w/ reset job
7. Monetization Expansion
	- Gift subscriptions (recurring perks)
	- VIP events ticketing & access gating middleware
8. Recommendations v1
	- Event ingestion -> feature store
	- Hybrid retrieval (content-based + collaborative) stub
9. Analytics & Observability
	- Structured logging, metrics (Prometheus), tracing (OTel)
10. Security & Compliance
	 - Rate limiting, input validation, audit logs, payout compliance

## Data Model (Draft Sketch)
```
User { _id, handle, roles[viewer|creator|admin], avatarUrl, bio, level, xp, badges[], wallets{tokens}, socials{}, createdAt }
Stream { _id, creatorId, title, category, status, startedAt, endedAt, overlays[], moodState, viewers[], segments[], metrics{chatCount,giftSum,avgWatchMs} }
Gift { _id, code, name, tokenCost, animationKey, commandAction?, rarity }
GiftEvent { _id, giftId, streamId, fromUserId, toCreatorId, tokens, createdAt, triggeredAction }
Subscription { _id, userId, creatorId, tier, startedAt, renewsAt, perks[] }
LeaderboardEntry { scope (global|weekly|stream), refId, userId, score, rank }
Challenge { _id, streamId, type, target, progress, status }
Reaction { _id, streamId, userId, mood, at }
```

## Realtime Event Names (Evolving)
```
chat:message
gift:send
gift:received
poll:create
poll:vote
challenge:start
challenge:update
mood:react
mood:state
overlay:trigger
```

## Security & Abuse Considerations
- Gift fraud prevention (velocity checks, balance reconciliation)
- Chat spam throttling (token bucket per user + global flood control)
- Command gift whitelist & server-side validation
- Sanitization of overlay payloads
- JWT rotation + refresh tokens (httpOnly cookies)

## Testing Strategy
- Unit: domain services (XP calculation, leaderboard ranking)
- Integration: socket event flows (gift -> overlay trigger broadcast)
- Load: simulate concurrent viewers (k6 / Locust) focusing on chat + gifts
- AI: offline evaluation set for recommendation precision@k

## Verification: Mongo & Redis Integration
You can verify persistence and leaderboard functionality with these manual checks after starting services.

1. Register a user (seeds 100 tokens):
```
curl -X POST http://localhost:4000/api/auth/register \
	-H 'Content-Type: application/json' \
	-d '{"handle":"tester1","password":"secret123"}'
```
Response includes an access token and refresh token.

2. List seeded gifts:
```
mongosh livestream --eval 'db.gifts.find({}, {code:1,name:1,tokenCost:1,_id:0}).toArray()'
```

3. Send a gift (via socket namespace /gifts):
Use a WebSocket client or frontend UI; payload: `{ code: "HEART" }` with auth token.

4. Confirm gift event persisted:
```
mongosh livestream --eval 'db.giftevents.find({}, {giftCode:1, tokens:1, fromUser:1, createdAt:1}).limit(3).toArray()'
```

5. Check leaderboard (Redis ZSET reflected through API):
```
curl http://localhost:4000/api/leaderboard/gifts | jq
```

6. Top-up tokens (stub economic flow):
```
curl -X POST http://localhost:4000/api/wallet/topup \
	-H "Authorization: Bearer <ACCESS_TOKEN>" \
	-H 'Content-Type: application/json' \
	-d '{"amount":50}'
```

7. Refresh access token (session continuity):
```
curl -X POST http://localhost:4000/api/auth/refresh \
	-H 'Content-Type: application/json' \
	-d '{"refresh":"<REFRESH_TOKEN>"}'
```

## Updated Immediate Next Steps
1. Move gift seeding to a standalone script (avoid prod reseed).
2. Add integration tests (gift send -> DB + leaderboard).
3. Implement pino logging + request correlation + health deep check (mongo & redis ping).
4. Add Stripe payment intent + webhook stub for real token purchases.
5. Begin WebRTC SFU integration (auth token issuance) for live media.
6. Add polling/Q&A socket namespaces & mood aggregation events.
7. Export metrics (Prometheus) + OTel tracing spans.

## Contributing
Iterate in small vertical slices (backend event + frontend UI + persistence) to keep features demoable.

---
This is an early scaffold; expect rapid change.