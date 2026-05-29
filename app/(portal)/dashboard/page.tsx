"use client";

import { useState } from "react";
import { TrendingUp, ShoppingBag, Disc3, Webhook, Check, Copy, Plus, Trash2 } from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

const STATS = [
  { label: "Units sold via SoundCloud", value: "4,218", delta: "+12% vs last month", icon: ShoppingBag, up: true },
  { label: "Revenue attributed", value: "£38,420", delta: "+9% vs last month", icon: TrendingUp, up: true },
  { label: "Active releases", value: "142", delta: "3 pending review", icon: Disc3, up: null },
  { label: "Revenue share rate", value: "15%", delta: "Per partner agreement", icon: TrendingUp, up: null },
];

const RELEASES = [
  { id: "rel_7Kx8mN2pQ4", title: "Midnight Sessions EP", artist: "Luna Blake", format: "12\" Vinyl", units: 312, revenue: "£2,840", status: "live" },
  { id: "rel_9Wr4kL8uX1", title: "Echoes", artist: "Marco Soleil", format: "CD", units: 198, revenue: "£1,120", status: "live" },
  { id: "rel_2Mm7tP3vK9", title: "City Lights", artist: "The Drift", format: "7\" Vinyl", units: 88, revenue: "£680", status: "live" },
  { id: "rel_5Bb1nQ6xR4", title: "Static World", artist: "Nora Vale", format: "12\" Vinyl", units: 0, revenue: "—", status: "draft" },
];

const EVENTS = ["order.created", "order.shipped", "release.attached", "release.updated"];

type Webhook = { id: string; url: string; events: string[]; active: boolean };

const DEFAULT_WEBHOOKS: Webhook[] = [
  { id: "wh_001", url: "https://api.soundcloud.com/webhooks/elasticstage", events: ["order.created", "release.attached"], active: true },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>(DEFAULT_WEBHOOKS);
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>(["order.created"]);
  const [addMode, setAddMode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function toggleEvent(event: string) {
    setNewEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  function addWebhook() {
    if (!newUrl.trim()) return;
    setWebhooks((prev) => [
      ...prev,
      { id: `wh_${Date.now()}`, url: newUrl.trim(), events: newEvents, active: true },
    ]);
    setNewUrl("");
    setNewEvents(["order.created"]);
    setAddMode(false);
  }

  function deleteWebhook(id: string) {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  }

  function copyId(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Partner Dashboard</h1>
        <p className="text-[#737373] text-sm mt-1">
          Revenue attribution, active releases, and webhook configuration for SoundCloud.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {STATS.map(({ label, value, delta, icon: Icon, up }) => (
          <div key={label} className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-[#737373] leading-tight">{label}</p>
              <Icon size={14} className="text-[#404040]" />
            </div>
            <p className="text-xl font-semibold text-white">{value}</p>
            <p className={`text-[11px] mt-1 ${up === true ? "text-[#22c55e]" : up === false ? "text-[#ef4444]" : "text-[#737373]"}`}>
              {delta}
            </p>
          </div>
        ))}
      </div>

      {/* Releases table */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#262626]">
          <h2 className="text-sm font-semibold text-white">Active releases</h2>
          <p className="text-[11px] text-[#737373] mt-0.5">Releases created via the SoundCloud embed, with attribution</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#262626]">
              {["Release", "Artist", "Format", "Units sold", "Revenue", "Status"].map((h) => (
                <th key={h} className="text-left px-5 py-2.5 text-[11px] text-[#737373] font-medium uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RELEASES.map((r) => (
              <tr key={r.id} className="border-b border-[#262626] last:border-0 hover:bg-[#0d1117] transition-colors">
                <td className="px-5 py-3">
                  <div>
                    <p className="text-[13px] text-white font-medium">{r.title}</p>
                    <p className="text-[11px] text-[#404040] font-mono">{r.id}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-[13px] text-[#a3a3a3]">{r.artist}</td>
                <td className="px-5 py-3 text-[13px] text-[#a3a3a3]">{r.format}</td>
                <td className="px-5 py-3 text-[13px] text-white font-medium">{r.units.toLocaleString()}</td>
                <td className="px-5 py-3 text-[13px] text-white">{r.revenue}</td>
                <td className="px-5 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    r.status === "live"
                      ? "bg-[#22c55e]/10 text-[#22c55e]"
                      : "bg-[#737373]/10 text-[#737373]"
                  }`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Webhooks */}
      <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <Webhook size={14} className="text-[#e84d1b]" />
            <h2 className="text-sm font-semibold text-white">Webhook endpoints</h2>
          </div>
          <button
            onClick={() => setAddMode((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] bg-[#262626] hover:bg-[#333] text-white rounded-md transition-colors"
          >
            <Plus size={12} />
            Add endpoint
          </button>
        </div>

        {/* Add form */}
        {addMode && (
          <div className="px-5 py-4 border-b border-[#262626] bg-[#111111] space-y-3">
            <div>
              <label className="text-[11px] text-[#737373] block mb-1">Endpoint URL</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://api.yourapp.com/webhooks/elasticstage"
                className="w-full bg-[#0d1117] border border-[#262626] rounded-md px-3 py-2 text-sm text-white placeholder-[#404040] focus:outline-none focus:border-[#e84d1b]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#737373] block mb-1.5">Events to subscribe</label>
              <div className="flex flex-wrap gap-2">
                {EVENTS.map((event) => (
                  <button
                    key={event}
                    onClick={() => toggleEvent(event)}
                    className={`px-2.5 py-1 text-[11px] rounded-full border font-mono transition-colors ${
                      newEvents.includes(event)
                        ? "bg-[#e84d1b]/10 border-[#e84d1b] text-[#e84d1b]"
                        : "border-[#262626] text-[#737373] hover:border-[#444]"
                    }`}
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addWebhook}
                className="px-4 py-1.5 text-[12px] bg-[#e84d1b] hover:bg-[#d43d0e] text-white rounded-md transition-colors"
              >
                Save endpoint
              </button>
              <button
                onClick={() => setAddMode(false)}
                className="px-4 py-1.5 text-[12px] text-[#737373] hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Webhook list */}
        {webhooks.length === 0 ? (
          <div className="px-5 py-8 text-center text-[#737373] text-sm">
            No webhook endpoints configured.
          </div>
        ) : (
          <div className="divide-y divide-[#262626]">
            {webhooks.map((wh) => (
              <div key={wh.id} className="flex items-start gap-4 px-5 py-4">
                <div
                  className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${wh.active ? "bg-[#22c55e]" : "bg-[#737373]"}`}
                />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <code className="text-[13px] text-white font-mono truncate">{wh.url}</code>
                    <button onClick={() => copyId(wh.id)} className="shrink-0 text-[#737373] hover:text-white transition-colors">
                      {copiedId === wh.id ? <Check size={12} className="text-[#22c55e]" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {wh.events.map((e) => (
                      <span key={e} className="text-[10px] font-mono px-2 py-0.5 bg-[#0d1117] border border-[#262626] rounded-full text-[#737373]">
                        {e}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#404040] font-mono">{wh.id}</p>
                </div>
                <button
                  onClick={() => deleteWebhook(wh.id)}
                  className="shrink-0 p-1.5 text-[#737373] hover:text-[#ef4444] transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="px-5 py-3 border-t border-[#262626] bg-[#111111]">
          <p className="text-[11px] text-[#737373]">
            elasticStage sends a <code className="text-[#a3a3a3]">POST</code> to your endpoint for each subscribed event.
            Expects a <code className="text-[#a3a3a3]">200</code> response within 5s. Failed deliveries are retried 3 times.
          </p>
        </div>
      </div>
    </div>
  );
}
