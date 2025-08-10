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
| Backend (Express + Socket.IO) | Basic health route + chat & gift events |
| Frontend (Next.js) | Basic prototype page with chat & gift send UI |
| AI Recommendation Service (FastAPI) | Placeholder /recommend endpoint |
| Realtime | Socket.IO basic events wired |
| Docker Compose | Multi-service dev orchestration |
| DB/Storage | Not yet integrated |
| Auth | Pending (JWT + OAuth planned) |
| Payments | Pending (Stripe planned) |
| Leaderboards | Pending (Redis sorted sets planned) |
| Token Economy | Pending (on-chain optional future, centralized first) |

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
| Persistence | MongoDB (planned) | Flexible for evolving schemas |
| Cache / RT Metrics | Redis | Leaderboards, pub/sub, rate limiting |
| Media | External SFU (Janus / LiveKit) | Integrate via WebRTC tokens |
| Client | Next.js + React | SEO + hybrid pages + mobile-first |
| Styling | TailwindCSS (planned) | Rapid theme iteration & dark mode |
| Auth | JWT + OAuth (Google/Twitch/X) | Social growth |
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

## Next Implementation Steps (Short Term)
1. Add ESLint/TypeScript upgrade (backend & frontend)
2. Introduce Mongo + Redis clients (config abstraction)
3. Implement user model & auth routes
4. Replace naive gift broadcast with validation + persistence
5. Add basic leaderboard endpoint (Redis sorted set)

## Contributing
Iterate in small vertical slices (backend event + frontend UI + persistence) to keep features demoable.

---
This is an early scaffold; expect rapid change.