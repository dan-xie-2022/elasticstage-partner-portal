"use client";

import { useState } from "react";
import { Copy, Check, KeyRound, ShieldCheck, Zap, AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";

const API_KEY = "esk_live_7Kx8mN2pQ4vR9sLm3bNx1hJkQwEr5uT";
const MASKED_KEY = "esk_live_7Kx8mN2pQ4vR9s••••••••••••••••";

const RATE_USED = 847;
const RATE_LIMIT = 1000;

const LIFECYCLE_ENDPOINTS = [
  { method: "POST", path: "/releases", description: "Create a new release" },
  { method: "PATCH", path: "/releases/{id}/metadata", description: "Update release metadata" },
  { method: "POST", path: "/releases/{id}/tracks", description: "Upload audio tracks" },
  { method: "POST", path: "/releases/{id}/artwork", description: "Attach or generate artwork" },
  { method: "POST", path: "/releases/{id}/attach", description: "Make release live — irreversible" },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "text-[#22c55e] bg-[#22c55e]/10",
  POST: "text-[#3b82f6] bg-[#3b82f6]/10",
  PATCH: "text-[#f59e0b] bg-[#f59e0b]/10",
  DELETE: "text-[#ef4444] bg-[#ef4444]/10",
};

const SNIPPETS: Record<string, string> = {
  curl: `# 1. Exchange credentials for an access token (production)
curl -X POST https://api.elasticstage.com/v1/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"client_id":"<your_client_id>","client_secret":"<your_secret>","grant_type":"client_credentials"}'

# 2. Create a release
curl -X POST https://api.elasticstage.com/v1/releases \\
  -H "Authorization: Bearer <access_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "format": "vinyl_12",
    "type": "ep",
    "title": "Midnight Sessions EP"
  }'`,

  node: `import { ElasticStage } from '@elasticstage/sdk';

const client = new ElasticStage({
  // For testing: use your API key
  // For production: use OAuth client credentials (see auth docs)
  apiKey: 'esk_live_7Kx8mN2pQ4vR9s...',
});

// Create a release
const release = await client.releases.create({
  format: 'vinyl_12',
  type:   'ep',
  title:  'Midnight Sessions EP',
});

console.log(release.id); // rel_7Kx8mN2pQ4`,

  python: `import elasticstage

client = elasticstage.ElasticStage(
    # For testing: use your API key
    # For production: use OAuth client credentials (see auth docs)
    api_key="esk_live_7Kx8mN2pQ4vR9s..."
)

# Create a release
release = client.releases.create(
    format="vinyl_12",
    type="ep",
    title="Midnight Sessions EP",
)

print(release.id)  # rel_7Kx8mN2pQ4`,
};

export default function ConsolePage() {
  const [copied, setCopied] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [lang, setLang] = useState<"curl" | "node" | "python">("node");

  function copyKey() {
    navigator.clipboard.writeText(API_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copySnippet() {
    navigator.clipboard.writeText(SNIPPETS[lang]);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  }

  const ratePct = Math.round((RATE_USED / RATE_LIMIT) * 100);

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Developer Console</h1>
        <p className="text-[#737373] text-sm mt-1">
          Welcome back, SoundCloud. Manage your API credentials and explore the elasticStage API.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
          <p className="text-[11px] text-[#737373] uppercase tracking-wider mb-1">API Version</p>
          <p className="text-xl font-semibold text-white">v1.0</p>
          <p className="text-[11px] text-[#737373] mt-1">Stable</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
          <p className="text-[11px] text-[#737373] uppercase tracking-wider mb-1">Rate limit</p>
          <p className="text-xl font-semibold text-white">
            {RATE_USED.toLocaleString()} <span className="text-[#737373] text-sm font-normal">/ {RATE_LIMIT.toLocaleString()} req/min</span>
          </p>
          <div className="mt-2 h-1.5 bg-[#262626] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#e84d1b] transition-all"
              style={{ width: `${ratePct}%` }}
            />
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
          <p className="text-[11px] text-[#737373] uppercase tracking-wider mb-1">Endpoints</p>
          <p className="text-xl font-semibold text-white">8 <span className="text-[#737373] text-sm font-normal">interactive</span></p>
          <p className="text-[11px] text-[#737373] mt-1">Full lifecycle coverage</p>
        </div>
      </div>

      {/* API Key */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound size={15} className="text-[#e84d1b]" />
          <h2 className="text-sm font-semibold text-white">API Key</h2>
          <span className="ml-auto text-[11px] text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded-full">Testing only</span>
        </div>

        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm font-mono bg-[#0d1117] border border-[#262626] rounded-md px-3 py-2 text-[#a3a3a3]">
            {MASKED_KEY}
          </code>
          <button
            onClick={copyKey}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-[#262626] hover:bg-[#333] text-white rounded-md transition-colors"
          >
            {copied ? <Check size={13} className="text-[#22c55e]" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="flex items-start gap-2.5 bg-[#0d1117] border border-[#262626] rounded-md px-3 py-2.5">
          <ShieldCheck size={14} className="text-[#3b82f6] mt-0.5 shrink-0" />
          <p className="text-[12px] text-[#a3a3a3] leading-relaxed">
            <span className="text-white font-medium">Production deployments</span> must use{" "}
            <span className="text-[#3b82f6]">OAuth 2.0 client credentials</span>. Exchange your{" "}
            <code className="text-[#737373]">client_id</code> and{" "}
            <code className="text-[#737373]">client_secret</code> for a short-lived access token at{" "}
            <code className="text-[#737373]">POST /auth/token</code>. API keys are for local testing only.
          </p>
        </div>
      </div>

      {/* Quickstart */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-[#e84d1b]" />
            <h2 className="text-sm font-semibold text-white">Quickstart</h2>
          </div>
          <div className="flex items-center gap-1">
            {(["node", "curl", "python"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                  lang === l
                    ? "bg-[#e84d1b] text-white"
                    : "text-[#737373] hover:text-white hover:bg-[#262626]"
                }`}
              >
                {l === "node" ? "Node.js" : l === "curl" ? "cURL" : "Python"}
              </button>
            ))}
            <button
              onClick={copySnippet}
              className="ml-2 flex items-center gap-1 px-2.5 py-1 text-[11px] text-[#737373] hover:text-white bg-[#262626] hover:bg-[#333] rounded transition-colors"
            >
              {snippetCopied ? <Check size={11} className="text-[#22c55e]" /> : <Copy size={11} />}
              {snippetCopied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <pre className="p-5 text-xs text-[#a3a3a3] leading-relaxed overflow-x-auto bg-[#0d1117]">
          <code>{SNIPPETS[lang]}</code>
        </pre>
      </div>

      {/* Endpoint overview */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262626]">
          <h2 className="text-sm font-semibold text-white">Release Lifecycle Endpoints</h2>
          <Link
            href="/playground"
            className="flex items-center gap-1 text-[12px] text-[#e84d1b] hover:underline"
          >
            Open Playground <ChevronRight size={13} />
          </Link>
        </div>
        <div className="divide-y divide-[#262626]">
          {LIFECYCLE_ENDPOINTS.map(({ method, path, description }) => (
            <div key={path} className="flex items-center gap-3 px-5 py-3 hover:bg-[#0d1117] transition-colors">
              <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${METHOD_COLORS[method]}`}>
                {method}
              </span>
              <code className="text-sm text-white font-mono">{path}</code>
              <span className="ml-auto text-[12px] text-[#737373]">{description}</span>
              {path.includes("attach") && (
                <AlertTriangle size={13} className="text-[#f59e0b] shrink-0" aria-label="Irreversible — requires creator confirmation" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
