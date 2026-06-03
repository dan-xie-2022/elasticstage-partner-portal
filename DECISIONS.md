# elasticStage Partner Portal — Decisions Log

> Documents what we're building, why, key tradeoffs, and changes made during the build process.
> Updated as decisions are made or reversed.

---

## 1. What we're building

A **developer-facing prototype** demonstrating how a music partner (SoundCloud) integrates with elasticStage's public API to embed vinyl/CD release creation inside their own platform.

**Part b response** to the elasticStage take-home task. Priority 1: Public API + Developer Portal.

**Strategic framing:** The API is the foundational layer that makes partner growth non-linear. Partner #10 costs as much to onboard as partner #2 — that is the structural change required for the 20x unit growth target.

---

## 2. Screens

| Screen | Route | Purpose |
|---|---|---|
| Developer Console | `/` | Partner gets their API key, understands auth, copies a quickstart snippet |
| API Playground | `/playground` | Stripe-style endpoint explorer with live mock responses and copy-ready code |
| Widget Preview | `/widget-preview` | Shows the embed inside a mock SoundCloud page with live theme customisation |
| Partner Dashboard | `/dashboard` | Revenue share reporting + webhook configuration |
| Embed Widget | `/embed` | Standalone widget loaded inside the iframe on Screen 3 |

---

## 3. Product decisions and rationale

### 3.1 Partner: SoundCloud (not DistroKid or Amuse)
**Decision:** Use SoundCloud as the named partner throughout the prototype.
**Why:** SoundCloud is an existing elasticStage partner (real relationship, not hypothetical). Using a real partner makes the demo concrete and credible. DistroKid and Amuse are valid alternatives but less proven in the existing relationship.

---

### 3.2 Auth: API key for testing + OAuth 2.0 for production
**Decision:** Screen 1 shows an API key with a clear note pointing to OAuth 2.0 client credentials for production server-to-server calls.
**Why:** API keys alone are not production-safe — they're static, don't expire, and have no granular scope. OAuth client credentials is the right long-run pattern (SoundCloud's backend exchanges `client_id`/`client_secret` for a short-lived `access_token`).
**What we show:** Both exist. API key = developer testing. OAuth = production. Both greyed out in the playground sidebar (non-interactive) but explained in Screen 1's context.

---

### 3.3 HITL gate on the Attach step
**Decision:** The `POST /releases/{id}/attach` step in both the embed form and the API playground explicitly flags this as an irreversible commercial action requiring creator confirmation.
**Why:** The brief explicitly calls this out as a "natural HITL gate". Whether the caller is a form, a partner embed, or an AI agent, the irreversible commercial action should always require explicit confirmation. Naming this signals product maturity.

---

### 3.4 API Playground: interactive vs greyed-out endpoints
**Decision:** Release lifecycle endpoints (8 total) are fully interactive. All other endpoint groups (Auth, Creators, Orders, Webhooks) are visible but greyed out with a "Coming soon" badge.
**Why:** Shows the full API surface without over-engineering the prototype. Communicates product maturity ("we've thought through the full lifecycle") while keeping the demo focused.

**Interactive endpoints:**
- `POST /releases`
- `PATCH /releases/{id}/metadata`
- `POST /releases/{id}/tracks`
- `POST /releases/{id}/artwork`
- `POST /releases/{id}/attach`
- `GET /releases`
- `GET /releases/{id}`
- `DELETE /releases/{id}`

**Greyed-out groups:** Auth, Creators, Orders, Webhooks

---

### 3.5 Code snippets: curl + Node.js + Python
**Decision:** Each interactive endpoint shows a language-switching code snippet (curl / Node.js / Python) that updates in real-time as you fill the request form. Uses a fictional `@elasticstage/sdk`.
**Why:** The Stripe pattern. A developer can go from API key to working code in their codebase in under 5 minutes. The SDK doesn't need to exist — it's part of the product story.

---

### 3.6 Widget theming via URL parameters
**Decision:** The embed widget reads `?partner=soundcloud&color=%23FF5500` from URL params and applies the partner's brand colour as a CSS custom property.
**Why:** Clean iframe-based white-labelling. The theme customiser on Screen 3 updates the iframe src in real-time, giving a compelling live demo of the white-label capability without any backend configuration.

---

### 3.7 Post-publish mutability: some fields remain editable after attach
**Decision:** `POST /releases/{id}/attach` locks the physical product attributes permanently, but certain commercial and metadata fields remain editable via a separate `PATCH /releases/{id}` endpoint.

**Immutable after publish** (affects manufacturing or commercial identity):
- `format` — vinyl / CD spec drives the physical production process
- `tracks` and `artwork` — the physical product is already defined
- `ean` — commercial barcode; changing it post-publish breaks downstream retail records

**Mutable after publish** (commercial and discoverability metadata):
- `release_date` — creators announce early and frequently push dates; locking this causes real creator friction
- `price_tier` — creators need to respond to market conditions
- `territory` — expanding distribution should not require a new release
- `description` — copy and marketing text, no physical impact

**Why a separate endpoint:** Using the same `PATCH /releases/{id}/metadata` pre- and post-publish would require complex field-level validation logic and risks confusing partners about what's allowed when. A dedicated `PATCH /releases/{id}` that only exposes mutable fields is clearer and safer — the API surface communicates the rule.

---

### 3.8 Integration modes: iframe is one path, not the only path

**Decision:** The prototype demonstrates the iframe embed as the primary integration mode, but the architecture is designed to support three distinct modes.
**Why:** Different partners have fundamentally different stacks. An iframe that works for SoundCloud (web) breaks silently on a mobile-native app and may be blocked by strict CSP policies on enterprise tools.

**Three integration modes the API supports:**

| Mode | How | Best for |
|---|---|---|
| **Iframe embed** | One `<iframe>` tag with URL params for theming | Web-based partners (SoundCloud, Bandcamp) — zero integration effort |
| **Headless API** | Partner builds their own UI, calls REST endpoints directly | Partners who want full UI control or have their own design system |
| **Mobile SDK** | Native wrapper around the REST API | Mobile-first partners (future — React Native, Flutter, iOS, Android) |

**What the prototype shows:** The iframe path (Screen 3) and the headless path (the API Playground already demonstrates direct API calls). Mobile SDK is future work.

**Gap acknowledged:** iframes don't work in native mobile apps, and some enterprise partners enforce CSP policies that block third-party iframes. The REST API being the common foundation means any partner can always fall back to the headless mode regardless of their stack.

---

### 3.9 Excluded: AI conversational flow inside the embed widget
**Decision:** The embed widget (Screen 3) shows a form-based 5-step release flow only. No chat/agentic interface.
**Why:** The agentic demo is a separate priority (Priority 2). Including it in this prototype:
- Blurs the story — the demo is about the partnership/API DX, not AI
- Adds build complexity for no additional validation value
- The "same API serves both form and LLM" point can be made verbally in the walkthrough

**Tradeoff:** Slightly less visually novel, but cleaner product narrative.

---

### 3.10 Payment not modelled
**Decision:** No payment endpoints in the playground.
**Why:** Payment is between the creator and elasticStage directly — the partner (SoundCloud) never handles or touches payment. Revenue share to SoundCloud is tracked via `partner_id` on the order record and shown in the dashboard. The gap (creator needing to set up billing with elasticStage the first time) is acknowledged verbally in the demo as a known edge case.

---

## 4. Architecture (condensed)

```
SoundCloud site
  └── <iframe src="https://api.elasticstage.com/embed?partner=soundcloud&color=...">
          └── elasticStage embed widget (this prototype's /embed page)

API Gateway / BFF layer  ←  stable versioned contract (what the playground demos)
  └── Laravel monolith (MySQL/MariaDB)  ←  existing, not changed
        └── event model: order.created { partner_id }
              └── revenue share attribution → partner dashboard
```

**Build vs buy:**
| Component | Decision | Reason |
|---|---|---|
| Auth | Buy (managed OAuth — Auth0) | Not differentiated; security critical |
| API gateway | Buy (off-the-shelf) | Commodity; rate limiting, versioning handled |
| Embed UI | Build | Differentiated surface; white-label control |
| Attribution logic | Build | Partner-specific economics |

---

## 5. Tech stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 + App Router | Fast to build, Vercel-native, SSR where needed |
| Styling | Tailwind CSS | Utility-first, no design system overhead |
| Icons | lucide-react | Lightweight, consistent icon set |
| AI calls | Fully mocked | Reduces build time; demo is about DX, not AI |
| Deployment | Vercel | One-command deploy, shareable URL |

---

## 6. What we would cut first (if time-boxed further)

1. **Screen 4 (Partner Dashboard)** — revenue reporting is important but doesn't validate the core DX question. Screens 2 and 3 carry the story.
2. **Python/curl code snippets** — keep Node.js only if pressed for time.
3. **Live theme customiser** — could show a static SoundCloud-branded widget instead of the dynamic colour picker.
4. **Widget Preview page (Screen 3)** — the mock SoundCloud page with the iframe embed is a visual demo, not a technical one. The API Playground (Screen 2) already demonstrates the headless integration path, which is the core DX story. The iframe embed can be explained verbally; the headless model should be kept as it directly shows the API contract.
5. **Mobile SDK integration** — iframe embeds cover the majority of web-based partners. Mobile SDK is a later-stage concern and adds significant build complexity for limited demo value. The headless API model covers any stack in the interim.

---

## 7. What we would build next (beyond prototype)
### P0 — V0 prototype (this repo)
Everything below is mocked — no real backend, no real auth, no live API calls.

**Five screens, one standalone embed:**

| Screen | Route | Purpose |
|---|---|---|
| Developer Console | `/` | API key, dual auth model, quickstart snippet |
| API Playground | `/playground` | 8 interactive Release endpoints, mock responses, code snippets |
| Widget Preview | `/widget-preview` | Live embed in mock artist page, theme customiser, iframe snippet |
| Partner Dashboard | `/dashboard` | Revenue reporting, active releases, webhook config |
| API Reference | `/api-reference` | Auth model, SDK install, endpoint table, error codes, webhook events |
| Embed Widget | `/embed` | 5-step release creation flow; HITL gate on irreversible attach step |

**What is deliberately excluded from V0:**
- Real OAuth — shown as a concept on Screen 1, not implemented
- Real webhook delivery — endpoint configuration UI exists in the dashboard; no actual delivery
- Payment — not modelled; acknowledged as a known gap
- AI/agentic flow — separate priority; excluded to keep the demo focused on the API/partnership DX

---

### P1 — Immediately after V0: core commercial viability
All commercial blockers — without OAuth, HITL enforcement, the event model, webhooks, and billing handoff, no partner integration can go live safely. They're also sequentially dependent. Together they close the gap between "working demo" and "partner can actually go live."

1. **Real OAuth 2.0 flow** — the critical unblocking dependency. Everything else requires real partner identity: revenue attribution, audit trails, sandbox credentials, SDK auth. The prototype only demonstrates this; nothing goes to production without it.

2. **Server-side HITL enforcement** — must be in place before any real release can be attached. `confirmed: true` is currently UI-only. The backend needs to validate it, log who confirmed, when, and via which partner. Safety gate before any commercial action is real.

3. **`partner_id` on the order record + simple webhook trigger** — for a first partner going live, you don't need a full event bus. You need `partner_id` stamped on every order created through the embed, and a direct webhook call to SoundCloud on `order.created`. This is the minimum viable attribution and notification layer — enough to prove the integration works and attribute revenue, without the complexity of a formal event model.

4. **Real webhook delivery** — depends on `partner_id` attribution. Turns partner integrations from read-only to reactive — SoundCloud's backend gets notified when a creator places an order. Includes HMAC-SHA256 signing, retry logic (3 attempts, exponential backoff), and delivery logs in the dashboard.

5. **Creator billing handoff** — depends on OAuth (creator identity). When a creator hits Publish for the first time, elasticStage needs to charge them but has no billing details on file. **Decision: lazy handoff** — let the creator complete all 5 steps first, trigger billing setup only at the payment moment. By Step 5 their investment in the flow makes them far more likely to push through the friction.
   - **Identity matching** — check if SoundCloud email already has an elasticStage account; link silently if yes, trigger signup if no
   - **Pre-fill from SoundCloud** — pass creator name and email so the signup form is mostly complete
   - **Draft persistence** — save the release server-side; send a recovery email if they abandon at billing
   - **Return URL** — redirect back to the publish confirmation screen after billing setup, not a generic dashboard

---

### P2 — Next for scale: turn a pilot into a platform
All about removing the manual bottleneck from partner onboarding. Sandbox → SDK → self-serve onboarding is the chain that makes partner #10 as cheap as partner
These are what make the API self-serve and partner growth non-linear. Without them, every new partner still requires manual onboarding effort.

6. **Sandbox environment** — depends on OAuth being real. Partners need a live, isolated environment to point their own code at before going to production. The API Playground shows the surface; the sandbox lets them run their actual integration safely.

7. **SDK publishing** — depends on OAuth + sandbox. The `@elasticstage/sdk` package becomes real (Node.js and Python first). Without a sandbox and real auth, the SDK has nowhere meaningful to point.

8. **Self-serve partner onboarding** — depends on OAuth + sandbox + SDK. A new partner needs a signup flow, API agreement acceptance, and automatic credential generation without talking to anyone at elasticStage. This is the structural change that makes partner #10 cost the same as partner #2.

9. **Formal event model** — once you have 3+ partners each listening to different event types, a direct webhook trigger per partner becomes unmanageable. A proper event bus (schema registry, reliable fan-out, event replay) is what makes the architecture scale. Builds on the `partner_id` attribution from P1.

10. **Alerting and monitoring** — coupled to the event model; you cannot operate a multi-partner event bus safely without visibility into it. Three things are required: (a) per-partner webhook delivery rate alert (fire if success rate drops below 95% over 10 minutes), (b) API error rate sliced by `partner_id` so a broken integration for one partner doesn't hide in the aggregate, (c) sandbox-to-production event leakage alert — a misrouted sandbox event triggering a real order is a data integrity failure. Self-serve onboarding also means failures are no longer surfaced by a partner calling you; monitoring replaces that human signal.

11. **Stripe Connect-style revenue share settlement** — depends on OAuth + event model. Automated payouts to partners, not just reporting. Turns the Partner Dashboard from a vanity metric into a financial commitment that makes the partnership sticky.

---

### P3 — Postpone or cut: valuable but not on the critical path
These improve the product but don't block any partner from going live or scaling. The post-publish UI matters for creator experience but the underlying API already works. Mobile SDK only becomes relevant once you have web partners successfully live and if our partners have mobile based users.

12. **Post-publish editing UI in the embed widget** — relatively independent once OAuth is in place. `PATCH /releases/{id}` exists in the API but the embed widget has no "manage release" path. A creator who published through SoundCloud cannot update their release date through the widget. The API already supports it; the widget UI is a nice-to-have.

13. **Mobile SDK** — depends on OAuth + SDK publishing. iframe embeds don't work in native apps. A React Native / Flutter SDK wraps the same REST API for mobile-first partners. iframe covers the majority of web partners; mobile-first is a later-stage concern that adds significant build complexity for limited near-term value.


---

## 8. Changelog

| Date | Change |
|---|---|
| 2026-05-29 | Initial plan agreed. Scaffold created. |
| 2026-05-29 | Decision: use SoundCloud as partner (existing relationship). |
| 2026-05-29 | Decision: remove AI/agentic flow from embed widget. Keep form-based only. |
| 2026-05-29 | Decision: show full API surface in playground sidebar; grey out non-interactive groups. |
| 2026-05-29 | Decision: dual auth story — API key (test) + OAuth 2.0 (production). |
| 2026-05-29 | Decision: payment not modelled; acknowledge verbally in walkthrough. |
| 2026-05-29 | Prototype deployed to Vercel: https://elasticstage-partner-portal.vercel.app |
| 2026-05-29 | Decision: post-publish mutability — added PATCH /releases/{id} for mutable fields (release_date, price_tier, territory). Format, tracks, EAN permanently locked. |
