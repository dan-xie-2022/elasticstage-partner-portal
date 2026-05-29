# elasticStage Partner Portal — Prototype

**Part b submission** for the elasticStage Platform & AI take-home task.

**Live demo:** https://elasticstage-partner-portal.vercel.app

---

## What I built

A developer-facing partner portal demonstrating how a music platform (SoundCloud) integrates with elasticStage's public API to embed vinyl/CD release creation inside their own product.

**Priority chosen:** Public API + Developer Portal — the foundational layer that makes every partnership integration self-serve and non-linear to scale.

**Strategic framing:** Partner #10 should cost as much to onboard as partner #2. Today's point-to-point integrations (SoundCloud, Amuse) don't scale. This portal is the structural fix — a stable, versioned API contract that any partner can integrate against without talking to a sales rep.

---

## Screens

| Screen | Route | What it demonstrates |
|---|---|---|
| Developer Console | `/` | Partner gets their API key, understands the auth model, copies a working code snippet |
| API Playground | `/playground` | Stripe-style endpoint explorer — fill a form, hit Send, see the mock response and a copy-ready code snippet in Node.js / cURL / Python |
| Widget Preview | `/widget-preview` | The embed live inside a mock SoundCloud artist page, with a real-time theme customiser and the one-line iframe snippet |
| Partner Dashboard | `/dashboard` | Revenue share reporting, active releases attributed to SoundCloud, and webhook endpoint configuration |
| API Reference | `/api-reference` | High-level reference: auth, SDK installation, full endpoint table, error codes, webhook event types and payloads |

The embed widget (`/embed`) is a standalone page loaded inside the iframe on Screen 3. It walks through the full 5-step release creation flow (release details → metadata → tracks → artwork → publish) with a HITL confirmation gate on the irreversible attach step.

---

## Key product decisions

Full rationale in [DECISIONS.md](./DECISIONS.md). Summary:

- **SoundCloud as the named partner** — existing elasticStage relationship; using a real partner makes the demo concrete rather than hypothetical. DistroKid and Amuse are valid alternatives but less proven.
- **Dual auth model** — API key for testing (shown on Screen 1), OAuth 2.0 client credentials for production server-to-server calls. API keys are static and unsafe for production; OAuth tokens expire and rotate automatically.
- **HITL gate on attach** — `POST /releases/{id}/attach` is flagged as irreversible throughout. The embed widget requires an explicit creator confirmation checkbox before the publish button activates. The API should also enforce `confirmed: true` server-side in production.
- **Full API surface visible, not all interactive** — Release Lifecycle endpoints (9) are fully interactive. Auth, Creators, Orders, and Webhooks groups are visible but greyed-out, signalling product maturity without over-building the prototype.
- **Stripe-pattern code snippets** — each endpoint shows a live-updating code snippet in Node.js / cURL / Python using a fictional `@elasticstage/sdk`. A developer can go from API key to working code in under 5 minutes.
- **Widget theming via URL parameters** — the embed reads `?partner=soundcloud&color=%23FF5500` and applies the brand colour as a CSS variable. The theme customiser on Screen 3 updates the iframe src in real-time.
- **Post-publish mutability** — `attach` locks physical product attributes permanently (format, tracks, EAN). Commercial metadata (release_date, price_tier, territory, description) remains editable via a separate `PATCH /releases/{id}` endpoint, avoiding a dedicated endpoint causes field-level confusion.
- **Three integration modes** — iframe embed (web, zero effort), headless API (full UI control), mobile SDK (future). The REST API is the common foundation; iframe is one presentation layer, not the only path.
- *(Excluded)* **AI conversational flow** — the agentic demo is a separate priority. The "same API serves both form and LLM" point is made verbally in the walkthrough.
- *(Excluded)* **Payment endpoints** — payment is between creator and elasticStage directly; the partner never handles it. Revenue share is tracked via `partner_id` and shown in the dashboard.

---

## Architecture (condensed)

```
SoundCloud site
  └── <iframe src="https://api.elasticstage.com/embed?partner=soundcloud&color=...">
          └── elasticStage embed widget (/embed)

API Gateway / BFF  ←  stable versioned contract (what the playground demos)
  └── Laravel monolith (MySQL/MariaDB)  ←  existing, unchanged
        └── event: order.created { partner_id }
              └── revenue share attribution → partner dashboard
```

**Build vs buy:** Auth (managed OAuth), API gateway (off-the-shelf). Embed UI and attribution logic are built — these are the differentiated surfaces.

---

## How to run locally

**Requirements:** Node.js ≥ 18

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000

No environment variables required — all data is mocked.

---

## Tech stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **lucide-react** for icons
- **Vercel** for deployment
- All API responses are hardcoded mock data — no real backend

---

## What I would cut, build next, and test first

**Cut first:** Partner Dashboard (Screen 4) — revenue reporting is important but doesn't validate the core DX question. Screens 2 and 3 carry the story.

**Build next:** Real webhook delivery + OAuth 2.0 flow — these are what turn a partner from "experimenting" to "committed."

**Test first:** Embed take-rate on SoundCloud — do creators actually click through and complete a release? Modelled at ~5% activation. Validate with a lightweight embed on one existing partner page before building the full self-serve portal.
