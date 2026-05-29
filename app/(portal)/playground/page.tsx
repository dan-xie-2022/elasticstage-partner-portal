"use client";

import { useState } from "react";
import { Copy, Check, Send, Lock, ChevronDown } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Field = {
  name: string;
  label: string;
  type: "text" | "select" | "textarea";
  options?: string[];
  placeholder?: string;
  required: boolean;
  hint?: string;
};

type Endpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  interactive: boolean;
  fields: Field[];
  mockResponse: object;
};

type EndpointGroup = {
  label: string;
  interactive: boolean;
  endpoints: Endpoint[];
};

// ─── Data ────────────────────────────────────────────────────────────────────

const GROUPS: EndpointGroup[] = [
  {
    label: "Release Lifecycle",
    interactive: true,
    endpoints: [
      {
        method: "POST",
        path: "/releases",
        description: "Create a new release",
        interactive: true,
        fields: [
          { name: "format", label: "Format", type: "select", options: ["vinyl_12", "vinyl_7", "cd"], required: true },
          { name: "type", label: "Release type", type: "select", options: ["single", "ep", "album"], required: true },
          { name: "title", label: "Title", type: "text", placeholder: "Midnight Sessions EP", required: true },
          { name: "ean", label: "EAN-13", type: "text", placeholder: "Auto-generated if blank", required: false, hint: "Leave blank to auto-generate" },
        ],
        mockResponse: {
          id: "rel_7Kx8mN2pQ4",
          status: "draft",
          format: "vinyl_12",
          type: "ep",
          title: "Midnight Sessions EP",
          ean: "5099999123459",
          created_at: "2026-05-29T14:32:00Z",
          partner_id: "prt_SoundCloud_001",
        },
      },
      {
        method: "PATCH",
        path: "/releases/{id}/metadata",
        description: "Update release metadata",
        interactive: true,
        fields: [
          { name: "id", label: "Release ID", type: "text", placeholder: "rel_7Kx8mN2pQ4", required: true },
          { name: "artist", label: "Artist name", type: "text", placeholder: "Luna Blake", required: true },
          { name: "label", label: "Label", type: "text", placeholder: "Indie Records Ltd", required: false },
          { name: "territory", label: "Territory", type: "select", options: ["worldwide", "uk", "eu", "us", "apac"], required: true },
          { name: "price_tier", label: "Price tier", type: "select", options: ["low", "medium", "high"], required: true, hint: "Platform-set tiers — creators pick tier, not price" },
          { name: "p_holder", label: "℗ Rights holder", type: "text", placeholder: "Luna Blake", required: true, hint: "Must differ from © holder" },
          { name: "c_holder", label: "© Rights holder", type: "text", placeholder: "Indie Records Ltd", required: true },
        ],
        mockResponse: {
          id: "rel_7Kx8mN2pQ4",
          status: "metadata_complete",
          metadata: {
            artist: "Luna Blake",
            label: "Indie Records Ltd",
            territory: "worldwide",
            price_tier: "medium",
            rights: { p_holder: "Luna Blake", p_year: 2026, c_holder: "Indie Records Ltd", c_year: 2026 },
          },
        },
      },
      {
        method: "POST",
        path: "/releases/{id}/tracks",
        description: "Upload audio tracks",
        interactive: true,
        fields: [
          { name: "id", label: "Release ID", type: "text", placeholder: "rel_7Kx8mN2pQ4", required: true },
          { name: "track_title", label: "Track title", type: "text", placeholder: "Midnight Drive", required: true },
          { name: "side", label: "Side", type: "select", options: ["A", "B"], required: true },
          { name: "position", label: "Position on side", type: "select", options: ["1", "2", "3", "4", "5", "6", "7", "8"], required: true },
          { name: "file_url", label: "Audio file URL", type: "text", placeholder: "https://...", required: true, hint: "WAV or MP3, stereo, 44.1–96 kHz, 16 or 24-bit, ≥10s" },
        ],
        mockResponse: {
          id: "rel_7Kx8mN2pQ4",
          status: "tracks_updated",
          tracks: [
            { position: "A1", title: "Midnight Drive", duration_s: 210, format: "wav" },
            { position: "A2", title: "Neon Rain", duration_s: 198, format: "wav" },
            { position: "B1", title: "Fade Out", duration_s: 225, format: "wav" },
          ],
          total_duration_s: 633,
          sides: { A: 2, B: 1 },
        },
      },
      {
        method: "POST",
        path: "/releases/{id}/artwork",
        description: "Attach or generate artwork",
        interactive: true,
        fields: [
          { name: "id", label: "Release ID", type: "text", placeholder: "rel_7Kx8mN2pQ4", required: true },
          { name: "mode", label: "Mode", type: "select", options: ["quick_generate", "upload"], required: true, hint: "quick_generate uses AI to create print-ready CMYK artwork" },
          { name: "file_url", label: "Artwork file URL", type: "text", placeholder: "https://... (upload mode only)", required: false },
        ],
        mockResponse: {
          id: "rel_7Kx8mN2pQ4",
          status: "artwork_complete",
          artwork: {
            mode: "quick_generate",
            url: "https://cdn.elasticstage.com/artwork/rel_7Kx8mN2pQ4.pdf",
            format: "cmyk_pdf",
            dimensions: "3543x3543px",
          },
        },
      },
      {
        method: "POST",
        path: "/releases/{id}/attach",
        description: "Make release live — irreversible",
        interactive: true,
        fields: [
          { name: "id", label: "Release ID", type: "text", placeholder: "rel_7Kx8mN2pQ4", required: true },
          { name: "confirmed", label: "Creator confirmation", type: "select", options: ["true"], required: true, hint: "⚠ HITL gate — irreversible commercial action. Must be explicit creator confirmation." },
        ],
        mockResponse: {
          id: "rel_7Kx8mN2pQ4",
          status: "live",
          store_url: "https://elasticstage.com/releases/midnight-sessions-ep",
          embed_url: "https://api.elasticstage.com/embed/rel_7Kx8mN2pQ4",
          revenue_share: { partner_id: "prt_SoundCloud_001", rate: 0.15 },
          attached_at: "2026-05-29T14:45:00Z",
        },
      },
      {
        method: "GET",
        path: "/releases",
        description: "List all releases for this partner",
        interactive: true,
        fields: [
          { name: "status", label: "Filter by status", type: "select", options: ["all", "draft", "live", "archived"], required: false },
          { name: "limit", label: "Limit", type: "select", options: ["10", "25", "50", "100"], required: false },
        ],
        mockResponse: {
          data: [
            { id: "rel_7Kx8mN2pQ4", title: "Midnight Sessions EP", status: "live", format: "vinyl_12" },
            { id: "rel_3Pq2nM5tY7", title: "City Lights", status: "draft", format: "vinyl_7" },
            { id: "rel_9Wr4kL8uX1", title: "Echoes", status: "live", format: "cd" },
          ],
          total: 3,
          partner_id: "prt_SoundCloud_001",
        },
      },
      {
        method: "GET",
        path: "/releases/{id}",
        description: "Get a specific release",
        interactive: true,
        fields: [
          { name: "id", label: "Release ID", type: "text", placeholder: "rel_7Kx8mN2pQ4", required: true },
        ],
        mockResponse: {
          id: "rel_7Kx8mN2pQ4",
          status: "live",
          format: "vinyl_12",
          type: "ep",
          title: "Midnight Sessions EP",
          ean: "5099999123459",
          partner_id: "prt_SoundCloud_001",
          metadata: { artist: "Luna Blake", label: "Indie Records Ltd", territory: "worldwide", price_tier: "medium" },
          tracks: [
            { position: "A1", title: "Midnight Drive", duration_s: 210 },
            { position: "A2", title: "Neon Rain", duration_s: 198 },
            { position: "B1", title: "Fade Out", duration_s: 225 },
          ],
          store_url: "https://elasticstage.com/releases/midnight-sessions-ep",
        },
      },
      {
        method: "DELETE",
        path: "/releases/{id}",
        description: "Delete a draft release",
        interactive: true,
        fields: [
          { name: "id", label: "Release ID", type: "text", placeholder: "rel_3Pq2nM5tY7", required: true, hint: "Only draft releases can be deleted" },
        ],
        mockResponse: {
          id: "rel_3Pq2nM5tY7",
          deleted: true,
          deleted_at: "2026-05-29T15:10:00Z",
        },
      },
      {
        method: "PATCH",
        path: "/releases/{id}",
        description: "Update mutable fields on a live release",
        interactive: true,
        fields: [
          { name: "id", label: "Release ID", type: "text", placeholder: "rel_7Kx8mN2pQ4", required: true },
          { name: "release_date", label: "Release date", type: "text", placeholder: "2026-09-01", required: false, hint: "ISO 8601 date. Can be updated after publish." },
          { name: "price_tier", label: "Price tier", type: "select", options: ["low", "medium", "high"], required: false, hint: "Changing tier takes effect on the next fan purchase." },
          { name: "territory", label: "Territory", type: "select", options: ["worldwide", "uk", "eu", "us", "apac"], required: false },
          { name: "description", label: "Description", type: "text", placeholder: "Limited edition 12\" pressing...", required: false },
        ],
        mockResponse: {
          id: "rel_7Kx8mN2pQ4",
          status: "live",
          updated_fields: ["release_date", "price_tier"],
          release_date: "2026-09-01",
          price_tier: "high",
          immutable_fields_note: "format, tracks, artwork, and ean cannot be changed after publish",
          updated_at: "2026-05-29T16:00:00Z",
        },
      },
    ],
  },
  {
    label: "Auth",
    interactive: false,
    endpoints: [
      { method: "POST", path: "/auth/token", description: "Exchange client credentials for access token", interactive: false, fields: [], mockResponse: {} },
    ],
  },
  {
    label: "Creators",
    interactive: false,
    endpoints: [
      { method: "POST", path: "/creators", description: "Register a new creator via partner", interactive: false, fields: [], mockResponse: {} },
      { method: "GET", path: "/creators/{id}", description: "Get creator profile", interactive: false, fields: [], mockResponse: {} },
    ],
  },
  {
    label: "Orders",
    interactive: false,
    endpoints: [
      { method: "GET", path: "/orders", description: "List orders attributed to this partner", interactive: false, fields: [], mockResponse: {} },
      { method: "GET", path: "/orders/{id}", description: "Get order detail", interactive: false, fields: [], mockResponse: {} },
    ],
  },
  {
    label: "Webhooks",
    interactive: false,
    endpoints: [
      { method: "POST", path: "/webhooks", description: "Register a webhook endpoint", interactive: false, fields: [], mockResponse: {} },
      { method: "GET", path: "/webhooks", description: "List registered webhooks", interactive: false, fields: [], mockResponse: {} },
      { method: "DELETE", path: "/webhooks/{id}", description: "Remove a webhook", interactive: false, fields: [], mockResponse: {} },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const METHOD_STYLES: Record<string, string> = {
  GET: "text-[#22c55e] bg-[#22c55e]/10",
  POST: "text-[#3b82f6] bg-[#3b82f6]/10",
  PATCH: "text-[#f59e0b] bg-[#f59e0b]/10",
  DELETE: "text-[#ef4444] bg-[#ef4444]/10",
};

function buildSnippets(endpoint: Endpoint, values: Record<string, string>, lang: string): string {
  const path = endpoint.path.replace("{id}", values.id || "{id}");
  const bodyFields = endpoint.fields.filter((f) => f.name !== "id" && values[f.name]);
  const bodyObj = bodyFields.reduce<Record<string, string>>((acc, f) => { acc[f.name] = values[f.name]; return acc; }, {});
  const hasBody = Object.keys(bodyObj).length > 0;
  const base = "https://api.elasticstage.com/v1";

  if (lang === "curl") {
    const bodyFlag = hasBody ? ` \\\n  -d '${JSON.stringify(bodyObj, null, 2)}'` : "";
    return `curl -X ${endpoint.method} ${base}${path} \\\n  -H "Authorization: Bearer <access_token>" \\\n  -H "Content-Type: application/json"${bodyFlag}`;
  }

  if (lang === "node") {
    const methodMap: Record<string, string> = {
      "POST /releases": "releases.create",
      "PATCH /releases/{id}/metadata": "releases.updateMetadata",
      "PATCH /releases/{id}": "releases.update",
      "POST /releases/{id}/tracks": "releases.addTrack",
      "POST /releases/{id}/artwork": "releases.setArtwork",
      "POST /releases/{id}/attach": "releases.attach",
      "GET /releases": "releases.list",
      "GET /releases/{id}": "releases.get",
      "DELETE /releases/{id}": "releases.delete",
    };
    const methodName = methodMap[`${endpoint.method} ${endpoint.path}`] || "releases.request";
    const args = hasBody ? `{\n${bodyFields.map((f) => `  ${f.name}: '${values[f.name]}',`).join("\n")}\n}` : values.id ? `'${values.id}'` : "";
    return `import { ElasticStage } from '@elasticstage/sdk';\nconst client = new ElasticStage({ apiKey: 'esk_live_...' });\n\nconst result = await client.${methodName}(${args});`;
  }

  // python
  const methodMap: Record<string, string> = {
    "POST /releases": "releases.create",
    "PATCH /releases/{id}/metadata": "releases.update_metadata",
    "POST /releases/{id}/tracks": "releases.add_track",
    "POST /releases/{id}/artwork": "releases.set_artwork",
    "POST /releases/{id}/attach": "releases.attach",
    "PATCH /releases/{id}": "releases.update",
    "GET /releases": "releases.list",
    "GET /releases/{id}": "releases.get",
    "DELETE /releases/{id}": "releases.delete",
  };
  const methodName = methodMap[`${endpoint.method} ${endpoint.path}`] || "releases.request";
  const args = hasBody ? bodyFields.map((f) => `    ${f.name}="${values[f.name]}",`).join("\n") : values.id ? `    id="${values.id}",` : "";
  return `import elasticstage\nclient = elasticstage.ElasticStage(api_key="esk_live_...")\n\nresult = client.${methodName}(\n${args}\n)`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PlaygroundPage() {
  const allInteractive = GROUPS[0].endpoints;
  const [selected, setSelected] = useState<Endpoint>(allInteractive[0]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<object | null>(null);
  const [activeTab, setActiveTab] = useState<"response" | "code">("response");
  const [lang, setLang] = useState<"curl" | "node" | "python">("node");
  const [codeCopied, setCodeCopied] = useState(false);

  function selectEndpoint(ep: Endpoint) {
    setSelected(ep);
    setFormValues({});
    setResponse(null);
    setActiveTab("response");
  }

  async function sendRequest() {
    setLoading(true);
    setActiveTab("response");
    await new Promise((r) => setTimeout(r, 600));
    setResponse(selected.mockResponse);
    setLoading(false);
  }

  function copyCode() {
    navigator.clipboard.writeText(buildSnippets(selected, formValues, lang));
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  const responseJson = response ? JSON.stringify(response, null, 2) : null;

  return (
    <div className="flex h-full">
      {/* Left — endpoint list */}
      <div className="w-56 shrink-0 border-r border-[#262626] bg-[#111111] overflow-y-auto">
        <div className="px-4 py-3 border-b border-[#262626]">
          <p className="text-[11px] text-[#737373] uppercase tracking-wider">Endpoints</p>
        </div>
        {GROUPS.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-1.5 px-4 py-2 mt-1">
              <span className="text-[11px] font-medium text-[#737373]">{group.label}</span>
              {!group.interactive && <Lock size={10} className="text-[#404040]" />}
            </div>
            {group.endpoints.map((ep) => {
              const isSelected = selected.path === ep.path && selected.method === ep.method;
              return (
                <button
                  key={`${ep.method}-${ep.path}`}
                  onClick={() => ep.interactive && selectEndpoint(ep)}
                  disabled={!ep.interactive}
                  className={`w-full text-left flex items-center gap-2 px-4 py-1.5 transition-colors ${
                    !ep.interactive
                      ? "opacity-35 cursor-not-allowed"
                      : isSelected
                      ? "bg-[#e84d1b]/10 border-r-2 border-[#e84d1b]"
                      : "hover:bg-[#1a1a1a]"
                  }`}
                >
                  <span className={`text-[10px] font-mono font-semibold w-12 shrink-0 ${METHOD_STYLES[ep.method]}`}>
                    {ep.method}
                  </span>
                  <span className={`text-[11px] font-mono truncate ${isSelected ? "text-white" : "text-[#a3a3a3]"}`}>
                    {ep.path.replace("/releases/{id}", "/{id}")}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="px-4 py-3 mt-2 border-t border-[#262626]">
          <p className="text-[10px] text-[#404040]">Greyed endpoints coming soon</p>
        </div>
      </div>

      {/* Center — request builder */}
      <div className="flex-1 overflow-y-auto border-r border-[#262626]">
        <div className="px-6 py-5 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded ${METHOD_STYLES[selected.method]}`}>
              {selected.method}
            </span>
            <code className="text-sm text-white font-mono">
              https://api.elasticstage.com/v1{selected.path}
            </code>
          </div>
          <p className="text-[12px] text-[#737373] mt-1.5">{selected.description}</p>
          {selected.path.includes("attach") && (
            <div className="mt-2 flex items-center gap-2 text-[12px] text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-md px-3 py-1.5">
              ⚠ Irreversible commercial action — requires explicit creator confirmation (HITL gate)
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-4">
          {selected.fields.length === 0 ? (
            <p className="text-sm text-[#737373]">No parameters required.</p>
          ) : (
            selected.fields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-[12px] font-medium text-[#a3a3a3]">{field.label}</label>
                  {field.required && <span className="text-[10px] text-[#e84d1b]">required</span>}
                </div>
                {field.type === "select" ? (
                  <div className="relative">
                    <select
                      value={formValues[field.name] || ""}
                      onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
                      className="w-full appearance-none bg-[#111111] border border-[#262626] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e84d1b] pr-8"
                    >
                      <option value="">Select...</option>
                      {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-2.5 text-[#737373] pointer-events-none" />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formValues[field.name] || ""}
                    onChange={(e) => setFormValues({ ...formValues, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full bg-[#111111] border border-[#262626] rounded-md px-3 py-2 text-sm text-white placeholder-[#404040] focus:outline-none focus:border-[#e84d1b]"
                  />
                )}
                {field.hint && <p className="text-[11px] text-[#737373]">{field.hint}</p>}
              </div>
            ))
          )}

          <button
            onClick={sendRequest}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#e84d1b] hover:bg-[#d43d0e] disabled:opacity-60 text-white text-sm font-medium rounded-md transition-colors mt-2"
          >
            <Send size={13} />
            {loading ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>

      {/* Right — response + code */}
      <div className="w-[420px] shrink-0 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center border-b border-[#262626] bg-[#111111]">
          {(["response", "code"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-[12px] font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-[#e84d1b] text-white"
                  : "border-transparent text-[#737373] hover:text-white"
              }`}
            >
              {tab === "response" ? "Response" : "Code"}
            </button>
          ))}

          {activeTab === "code" && (
            <div className="flex items-center gap-1 ml-auto px-3">
              {(["node", "curl", "python"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                    lang === l ? "bg-[#e84d1b] text-white" : "text-[#737373] hover:text-white"
                  }`}
                >
                  {l === "node" ? "Node" : l === "curl" ? "cURL" : "Python"}
                </button>
              ))}
              <button onClick={copyCode} className="ml-1 p-1.5 text-[#737373] hover:text-white transition-colors">
                {codeCopied ? <Check size={13} className="text-[#22c55e]" /> : <Copy size={13} />}
              </button>
            </div>
          )}
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto bg-[#0d1117]">
          {activeTab === "response" ? (
            loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-5 h-5 border-2 border-[#e84d1b] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : responseJson ? (
              <pre className="p-5 text-xs text-[#a3a3a3] leading-relaxed whitespace-pre-wrap">
                <code>{responseJson}</code>
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center px-6">
                <p className="text-sm text-[#737373]">Fill in the parameters and click</p>
                <p className="text-sm text-[#737373]">"Send Request" to see the response.</p>
              </div>
            )
          ) : (
            <pre className="p-5 text-xs text-[#a3a3a3] leading-relaxed whitespace-pre-wrap">
              <code>{buildSnippets(selected, formValues, lang)}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
