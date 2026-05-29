"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import Link from "next/link";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  function copy(key: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }
  return { copiedKey, copy };
}

function CopyButton({ id, text, copiedKey, copy }: { id: string; text: string; copiedKey: string | null; copy: (id: string, text: string) => void }) {
  const copied = copiedKey === id;
  return (
    <button
      onClick={() => copy(id, text)}
      className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 text-[10px] bg-[#1a1a1a] hover:bg-[#262626] text-[#737373] hover:text-white rounded transition-colors"
    >
      {copied ? <Check size={10} className="text-[#22c55e]" /> : <Copy size={10} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function SectionHeading({ id, title, subtitle }: { id: string; title: string; subtitle: string }) {
  return (
    <div id={id} className="flex items-start justify-between pt-2 pb-4 border-b border-[#262626] scroll-mt-6">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-[13px] text-[#737373] mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

const METHOD_STYLES: Record<string, string> = {
  GET: "text-[#22c55e] bg-[#22c55e]/10",
  POST: "text-[#3b82f6] bg-[#3b82f6]/10",
  PATCH: "text-[#f59e0b] bg-[#f59e0b]/10",
  DELETE: "text-[#ef4444] bg-[#ef4444]/10",
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const ENDPOINT_GROUPS = [
  {
    label: "Release Lifecycle",
    endpoints: [
      { method: "POST",   path: "/releases",                    description: "Create a new release" },
      { method: "PATCH",  path: "/releases/{id}/metadata",      description: "Update artist, label, territory, pricing, and rights" },
      { method: "POST",   path: "/releases/{id}/tracks",        description: "Upload audio tracks and assign to Side A / B" },
      { method: "POST",   path: "/releases/{id}/artwork",       description: "Attach a CMYK PDF or trigger quick-generate" },
      { method: "POST",   path: "/releases/{id}/attach",        description: "Make release live — irreversible commercial action" },
    ],
  },
  {
    label: "Release Management",
    endpoints: [
      { method: "GET",    path: "/releases",                    description: "List all releases attributed to this partner" },
      { method: "GET",    path: "/releases/{id}",               description: "Get full detail for a specific release" },
      { method: "DELETE", path: "/releases/{id}",               description: "Delete a draft release (draft status only)" },
    ],
  },
  {
    label: "Auth",
    endpoints: [
      { method: "POST", path: "/auth/token", description: "Exchange client credentials for a short-lived access token" },
    ],
  },
  {
    label: "Creators",
    endpoints: [
      { method: "POST", path: "/creators",        description: "Register a new creator via partner embed" },
      { method: "GET",  path: "/creators/{id}",   description: "Retrieve creator profile and linked releases" },
    ],
  },
  {
    label: "Orders",
    endpoints: [
      { method: "GET", path: "/orders",       description: "List orders attributed to this partner (revenue share basis)" },
      { method: "GET", path: "/orders/{id}",  description: "Get order detail including shipping status" },
    ],
  },
  {
    label: "Webhooks",
    endpoints: [
      { method: "POST",   path: "/webhooks",       description: "Register a new webhook endpoint" },
      { method: "GET",    path: "/webhooks",        description: "List all registered webhook endpoints" },
      { method: "DELETE", path: "/webhooks/{id}",  description: "Remove a webhook endpoint" },
    ],
  },
];

const ERROR_CODES = [
  { status: 400, code: "invalid_format",               meaning: "Unsupported release format value",                    fix: "Use one of: vinyl_12, vinyl_7, cd" },
  { status: 400, code: "album_track_minimum",          meaning: "Album requires >4 tracks or >25 min total",          fix: "Add more tracks or change type to ep" },
  { status: 400, code: "track_too_short",              meaning: "Track is under 10 seconds",                          fix: "Each track must be ≥10s" },
  { status: 400, code: "max_tracks_exceeded",          meaning: "Release exceeds 16 tracks (8 per side)",             fix: "Remove tracks to stay within the limit" },
  { status: 400, code: "release_group_title_mismatch", meaning: "Release title doesn't contain the Release Group title", fix: "Ensure the group title appears within each member release title" },
  { status: 400, code: "rights_holders_identical",     meaning: "℗ holder and © holder cannot be the same value",    fix: "℗ and © are legally distinct — provide separate values" },
  { status: 401, code: "invalid_token",                meaning: "Access token is missing or expired",                 fix: "Re-authenticate via POST /auth/token" },
  { status: 403, code: "partner_scope_denied",         meaning: "Token lacks permission for this endpoint",           fix: "Check OAuth scopes on your client credentials" },
  { status: 409, code: "release_already_live",         meaning: "Cannot modify a live release",                       fix: "attach is irreversible — create a new release" },
  { status: 422, code: "invalid_price_tier",           meaning: "Price tier must be low, medium, or high",            fix: "Creators pick a tier, not a price — three fixed values only" },
  { status: 429, code: "rate_limit_exceeded",          meaning: "Exceeded 1,000 requests / minute",                   fix: "Back off and retry after the Retry-After header value" },
];

const WEBHOOK_EVENTS = [
  { event: "order.created",       description: "A fan or creator placed an order for this release",        payload: ["order_id", "release_id", "partner_id", "quantity", "amount_gbp"] },
  { event: "order.shipped",       description: "Physical order has been dispatched",                       payload: ["order_id", "tracking_number", "carrier", "estimated_delivery"] },
  { event: "release.attached",    description: "A release was made live via POST /releases/{id}/attach",  payload: ["release_id", "partner_id", "store_url", "attached_at"] },
  { event: "release.updated",     description: "Metadata or track list was changed on an existing release", payload: ["release_id", "partner_id", "updated_fields"] },
];

const TOC = [
  { id: "authentication",     label: "Authentication" },
  { id: "sdk",                label: "SDK Installation" },
  { id: "integration-modes",  label: "Integration Modes" },
  { id: "endpoints",          label: "Endpoint Reference" },
  { id: "errors",             label: "Error Codes" },
  { id: "webhooks",           label: "Webhooks" },
];

const TOKEN_SNIPPET = `curl -X POST https://api.elasticstage.com/v1/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_id":     "<your_client_id>",
    "client_secret": "<your_client_secret>",
    "grant_type":    "client_credentials"
  }'

# Response
{
  "access_token": "eyJhbGci...",
  "token_type":   "Bearer",
  "expires_in":   3600
}`;

const INSTALL_SNIPPETS: Record<string, string> = {
  npm:    "npm install @elasticstage/sdk",
  yarn:   "yarn add @elasticstage/sdk",
  pnpm:   "pnpm add @elasticstage/sdk",
  python: "pip install elasticstage",
};

const WEBHOOK_PAYLOAD = `{
  "event":      "order.created",
  "id":         "evt_9Kx2mN4pQ8",
  "created_at": "2026-05-29T14:45:00Z",
  "data": {
    "order_id":    "ord_3Pq7nM2tY1",
    "release_id":  "rel_7Kx8mN2pQ4",
    "partner_id":  "prt_SoundCloud_001",
    "quantity":    1,
    "amount_gbp":  24.99
  }
}`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ApiReferencePage() {
  const { copiedKey, copy } = useCopy();
  const [installLang, setInstallLang] = useState<"npm" | "yarn" | "pnpm" | "python">("npm");

  return (
    <div className="flex gap-8 max-w-5xl mx-auto px-8 py-10">

      {/* Sticky TOC */}
      <aside className="w-44 shrink-0 hidden lg:block">
        <div className="sticky top-8 space-y-1">
          <p className="text-[10px] text-[#737373] uppercase tracking-wider mb-3">On this page</p>
          {TOC.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="block text-[12px] text-[#737373] hover:text-white py-0.5 transition-colors"
            >
              {label}
            </a>
          ))}
          <div className="pt-4 border-t border-[#262626] mt-4">
            <Link
              href="/playground"
              className="text-[12px] text-[#e84d1b] hover:underline"
            >
              Try in Playground →
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-12">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-white">API Reference</h1>
          <p className="text-[#737373] text-sm mt-1">
            High-level reference for the elasticStage Partner API v1.0. Base URL:{" "}
            <code className="text-[#a3a3a3] text-[12px]">https://api.elasticstage.com/v1</code>
          </p>
        </div>

        {/* ── 1. Authentication ── */}
        <section className="space-y-4">
          <SectionHeading
            id="authentication"
            title="Authentication"
            subtitle="Two mechanisms — API key for testing, OAuth 2.0 for production."
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] font-medium">Testing only</span>
              </div>
              <p className="text-sm font-medium text-white">API Key</p>
              <p className="text-[12px] text-[#737373] leading-relaxed">
                Pass as <code className="text-[#a3a3a3]">Authorization: Bearer esk_live_...</code>. Static, no expiry. Never use in production — treat as a secret.
              </p>
            </div>
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] font-medium">Production</span>
              </div>
              <p className="text-sm font-medium text-white">OAuth 2.0 Client Credentials</p>
              <p className="text-[12px] text-[#737373] leading-relaxed">
                Exchange <code className="text-[#a3a3a3]">client_id</code> + <code className="text-[#a3a3a3]">client_secret</code> for a short-lived token (1h TTL). Rotate automatically.
              </p>
            </div>
          </div>

          <div>
            <p className="text-[12px] text-[#737373] mb-2">Token exchange request:</p>
            <div className="relative">
              <pre className="bg-[#0d1117] border border-[#262626] rounded-lg p-4 text-[12px] text-[#a3a3a3] font-mono leading-relaxed overflow-x-auto">
                <code>{TOKEN_SNIPPET}</code>
              </pre>
              <CopyButton id="token" text={TOKEN_SNIPPET} copiedKey={copiedKey} copy={copy} />
            </div>
          </div>

          <div className="bg-[#0d1117] border border-[#262626] rounded-lg p-4">
            <p className="text-[11px] text-[#737373] uppercase tracking-wider mb-2">Rate limiting</p>
            <p className="text-[12px] text-[#a3a3a3] leading-relaxed">
              1,000 requests / minute per partner. Every response includes{" "}
              <code className="text-[#737373]">X-RateLimit-Limit</code>,{" "}
              <code className="text-[#737373]">X-RateLimit-Remaining</code>, and{" "}
              <code className="text-[#737373]">X-RateLimit-Reset</code> headers.
              Exceeded limits return <code className="text-[#737373]">429 rate_limit_exceeded</code>.
            </p>
          </div>
        </section>

        {/* ── 2. SDK Installation ── */}
        <section className="space-y-4">
          <SectionHeading
            id="sdk"
            title="SDK Installation"
            subtitle="Official SDKs for Node.js and Python. REST API available for all other languages."
          />
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
            <div className="flex items-center gap-1 px-4 py-2.5 border-b border-[#262626]">
              {(["npm", "yarn", "pnpm", "python"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setInstallLang(l)}
                  className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                    installLang === l ? "bg-[#e84d1b] text-white" : "text-[#737373] hover:text-white"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="relative">
              <pre className="p-4 text-[13px] font-mono text-[#a3a3a3] bg-[#0d1117]">
                <code>{INSTALL_SNIPPETS[installLang]}</code>
              </pre>
              <CopyButton id="install" text={INSTALL_SNIPPETS[installLang]} copiedKey={copiedKey} copy={copy} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-[12px]">
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4 space-y-1">
              <p className="font-medium text-white">Node.js SDK</p>
              <p className="text-[#737373]">Requires Node.js ≥18. TypeScript types included.</p>
              <a href="#" className="text-[#e84d1b] hover:underline">GitHub →</a>
            </div>
            <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4 space-y-1">
              <p className="font-medium text-white">Python SDK</p>
              <p className="text-[#737373]">Requires Python ≥3.9. Sync and async clients.</p>
              <a href="#" className="text-[#e84d1b] hover:underline">GitHub →</a>
            </div>
          </div>
        </section>

        {/* ── 3. Integration Modes ── */}
        <section className="space-y-4">
          <SectionHeading
            id="integration-modes"
            title="Integration Modes"
            subtitle="Three ways to integrate — choose based on your stack and how much UI control you need."
          />

          <div className="grid grid-cols-3 gap-4">
            {[
              {
                mode: "Iframe Embed",
                tag: "Recommended for web",
                tagColor: "#22c55e",
                description: "Drop one <iframe> tag into your page. elasticStage handles the full release creation UI inside it. Theme via URL parameters.",
                bestFor: "Web platforms (SoundCloud, Bandcamp, Beatport)",
                effort: "~1 hour",
                snippet: `<iframe\n  src="https://api.elasticstage.com/embed\n    ?partner=soundcloud\n    &color=%23FF5500"\n  width="100%" height="600"\n  sandbox="allow-scripts allow-forms\n           allow-same-origin"\n/>`,
              },
              {
                mode: "Headless API",
                tag: "Full UI control",
                tagColor: "#3b82f6",
                description: "Call the REST endpoints directly and build your own release creation UI. Full control over design and flow.",
                bestFor: "Partners with their own design system or enterprise tools",
                effort: "Days–weeks depending on scope",
                snippet: `// Build your own UI, call our API\nconst release = await client.releases.create({\n  format: 'vinyl_12',\n  type:   'ep',\n  title:  'Midnight Sessions EP',\n});`,
              },
              {
                mode: "Mobile SDK",
                tag: "Coming soon",
                tagColor: "#737373",
                description: "Native wrapper around the REST API for iOS, Android, React Native, and Flutter. iframes don't work in native apps.",
                bestFor: "Mobile-first platforms and native apps",
                effort: "—",
                snippet: `// React Native (coming soon)\nimport { ElasticStageWidget }\n  from '@elasticstage/react-native';\n\n<ElasticStageWidget\n  partner="soundcloud"\n  color="#FF5500"\n/>`,
              },
            ].map(({ mode, tag, tagColor, description, bestFor, effort, snippet }) => (
              <div key={mode} className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{mode}</p>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{ color: tagColor, background: tagColor + "18" }}
                  >
                    {tag}
                  </span>
                </div>
                <p className="text-[12px] text-[#737373] leading-relaxed">{description}</p>
                <pre className="text-[10px] font-mono text-[#a3a3a3] bg-[#0d1117] border border-[#262626] rounded-md p-3 overflow-x-auto leading-relaxed flex-1">
                  <code>{snippet}</code>
                </pre>
                <div className="space-y-1 pt-1 border-t border-[#262626]">
                  <p className="text-[11px] text-[#737373]"><span className="text-[#a3a3a3]">Best for:</span> {bestFor}</p>
                  <p className="text-[11px] text-[#737373]"><span className="text-[#a3a3a3]">Integration effort:</span> {effort}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#0d1117] border border-[#262626] rounded-lg px-4 py-3">
            <p className="text-[12px] text-[#a3a3a3] leading-relaxed">
              <span className="text-white font-medium">All three modes share the same REST API.</span>{" "}
              The iframe and mobile SDK are presentation layers on top of the same endpoints. If your stack or CSP policy blocks iframes, fall back to Headless API — no rebundling required.
            </p>
          </div>
        </section>

        {/* ── 4. Endpoint Reference ── */}
        <section className="space-y-4">
          <SectionHeading
            id="endpoints"
            title="Endpoint Reference"
            subtitle="All endpoints grouped by function. Interactive versions available in the Playground."
          />
          {ENDPOINT_GROUPS.map((group) => (
            <div key={group.label} className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#262626] bg-[#111111]">
                <p className="text-[11px] font-medium text-[#737373] uppercase tracking-wider">{group.label}</p>
              </div>
              <table className="w-full">
                <tbody>
                  {group.endpoints.map((ep, i) => (
                    <tr key={ep.path + ep.method} className={`${i < group.endpoints.length - 1 ? "border-b border-[#262626]" : ""} hover:bg-[#0d1117] transition-colors`}>
                      <td className="pl-4 pr-2 py-3 w-16">
                        <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${METHOD_STYLES[ep.method]}`}>
                          {ep.method}
                        </span>
                      </td>
                      <td className="px-2 py-3 w-64">
                        <code className="text-[12px] text-white font-mono">{ep.path}</code>
                      </td>
                      <td className="px-2 py-3">
                        <span className="text-[12px] text-[#737373]">{ep.description}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href="/playground" className="text-[11px] text-[#e84d1b] hover:underline whitespace-nowrap">
                          Try it →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>

        {/* ── 5. Error Codes ── */}
        <section className="space-y-4">
          <SectionHeading
            id="errors"
            title="Error Codes"
            subtitle="All errors return JSON with a code and message field. HTTP status reflects the error class."
          />
          <div className="bg-[#0d1117] border border-[#262626] rounded-lg p-4 text-[12px] font-mono text-[#a3a3a3] mb-2">
            {`{ "error": { "code": "invalid_format", "message": "Unsupported format value. Use: vinyl_12, vinyl_7, cd" } }`}
          </div>
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#262626] bg-[#111111]">
                  {["Status", "Code", "Meaning", "Fix"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] text-[#737373] uppercase tracking-wider font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ERROR_CODES.map((e, i) => (
                  <tr key={e.code} className={`${i < ERROR_CODES.length - 1 ? "border-b border-[#262626]" : ""} hover:bg-[#0d1117] transition-colors`}>
                    <td className="px-4 py-2.5">
                      <span className={`font-mono font-semibold ${e.status >= 500 ? "text-[#ef4444]" : e.status >= 400 ? "text-[#f59e0b]" : "text-[#22c55e]"}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <code className="text-[#a3a3a3]">{e.code}</code>
                    </td>
                    <td className="px-4 py-2.5 text-[#737373]">{e.meaning}</td>
                    <td className="px-4 py-2.5 text-[#737373]">{e.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 6. Webhooks ── */}
        <section className="space-y-4">
          <SectionHeading
            id="webhooks"
            title="Webhooks"
            subtitle="elasticStage POSTs a signed JSON payload to your endpoint for each subscribed event."
          />

          {/* Events table */}
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#262626] bg-[#111111]">
              <p className="text-[11px] font-medium text-[#737373] uppercase tracking-wider">Event types</p>
            </div>
            <table className="w-full text-[12px]">
              <tbody>
                {WEBHOOK_EVENTS.map((e, i) => (
                  <tr key={e.event} className={`${i < WEBHOOK_EVENTS.length - 1 ? "border-b border-[#262626]" : ""}`}>
                    <td className="px-4 py-3 w-48">
                      <code className="text-[#e84d1b]">{e.event}</code>
                    </td>
                    <td className="px-4 py-3 text-[#737373]">{e.description}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[10px] text-[#404040]">{e.payload.join(", ")}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Example payload */}
          <div>
            <p className="text-[12px] text-[#737373] mb-2">Example payload — <code className="text-[#a3a3a3]">order.created</code>:</p>
            <div className="relative">
              <pre className="bg-[#0d1117] border border-[#262626] rounded-lg p-4 text-[12px] text-[#a3a3a3] font-mono leading-relaxed overflow-x-auto">
                <code>{WEBHOOK_PAYLOAD}</code>
              </pre>
              <CopyButton id="webhook" text={WEBHOOK_PAYLOAD} copiedKey={copiedKey} copy={copy} />
            </div>
          </div>

          {/* Delivery behaviour */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Timeout", value: "5 seconds", note: "Response must arrive within 5s" },
              { label: "Retries", value: "3 attempts", note: "Exponential backoff: 1min, 5min, 30min" },
              { label: "Verification", value: "HMAC-SHA256", note: "X-ElasticStage-Signature header on every request" },
            ].map(({ label, value, note }) => (
              <div key={label} className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
                <p className="text-[10px] text-[#737373] uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
                <p className="text-[11px] text-[#737373] mt-1">{note}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
