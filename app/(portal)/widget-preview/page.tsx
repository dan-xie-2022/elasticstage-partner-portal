"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

const PARTNER_PRESETS = [
  { id: "soundcloud", label: "SoundCloud", color: "#ff5500", logo: "S" },
  { id: "amuse", label: "Amuse", color: "#1db954", logo: "A" },
  { id: "distrokid", label: "DistroKid", color: "#4f46e5", logo: "D" },
];

export default function WidgetPreviewPage() {
  const [color, setColor] = useState("#ff5500");
  const [partner, setPartner] = useState("soundcloud");
  const [copied, setCopied] = useState(false);

  const activePreset = PARTNER_PRESETS.find((p) => p.id === partner) || PARTNER_PRESETS[0];

  function selectPreset(preset: typeof PARTNER_PRESETS[0]) {
    setPartner(preset.id);
    setColor(preset.color);
  }

  const embedUrl = `/embed?partner=${partner}&color=${encodeURIComponent(color)}`;
  const embedSnippet = `<iframe
  src="https://api.elasticstage.com/embed?partner=${partner}&color=${encodeURIComponent(color)}"
  width="100%"
  height="600"
  frameborder="0"
  allow="clipboard-write"
  sandbox="allow-scripts allow-same-origin allow-forms"
></iframe>`;

  function copySnippet() {
    navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left — mock SoundCloud page */}
      <div className="flex-1 overflow-y-auto bg-[#111111] border-r border-[#262626]">
        {/* SoundCloud mock header */}
        <div className="sticky top-0 z-10 flex items-center gap-6 px-6 py-3 bg-[#0f0f0f] border-b border-[#1e1e1e]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: activePreset.color }}>
              <span className="text-[10px] font-bold text-white">{activePreset.logo}</span>
            </div>
            <span className="text-sm font-semibold text-white">{activePreset.label}</span>
          </div>
          <nav className="flex items-center gap-4 text-[12px] text-[#737373]">
            <a href="#" className="hover:text-white">Stream</a>
            <a href="#" className="hover:text-white">Charts</a>
            <a href="#" className="hover:text-white" style={{ color: activePreset.color }}>Artists</a>
            <a href="#" className="hover:text-white">Discover</a>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="w-24 h-7 bg-[#1e1e1e] rounded-full" />
            <div className="w-7 h-7 rounded-full bg-[#2a2a2a]" />
          </div>
        </div>

        {/* Artist profile */}
        <div className="relative">
          <div className="h-28 bg-gradient-to-r from-[#1a1a1a] to-[#222]" style={{ background: `linear-gradient(135deg, ${activePreset.color}22, #111)` }} />
          <div className="px-6 pb-4">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#333] to-[#111] border-4 border-[#111111] flex items-center justify-center text-2xl">
                🎵
              </div>
              <div className="mb-2">
                <h1 className="text-lg font-bold text-white">Luna Blake</h1>
                <p className="text-[12px] text-[#737373]">42.8K followers · Indie / Electronic</p>
              </div>
              <div className="ml-auto mb-2 flex gap-2">
                <button className="px-4 py-1.5 text-[12px] font-medium text-white rounded-full" style={{ background: activePreset.color }}>
                  Follow
                </button>
                <button className="px-4 py-1.5 text-[12px] font-medium text-[#a3a3a3] border border-[#2a2a2a] rounded-full hover:border-[#444]">
                  Message
                </button>
              </div>
            </div>

            {/* Track list mock */}
            <div className="space-y-1 mb-6">
              {["Midnight Drive", "Neon Rain", "Fade Out"].map((track, i) => (
                <div key={track} className="flex items-center gap-3 py-2 px-2 rounded hover:bg-[#1a1a1a] group cursor-pointer">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-[#333] to-[#111] flex items-center justify-center text-[11px] text-[#737373] group-hover:text-white">
                    ▶
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-white">{track}</p>
                    <p className="text-[11px] text-[#737373]">Luna Blake · 2026</p>
                  </div>
                  <span className="text-[12px] text-[#737373]">{["3:30", "3:18", "3:45"][i]}</span>
                </div>
              ))}
            </div>

            {/* The elasticStage embed CTA */}
            <div className="rounded-xl border border-[#2a2a2a] overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ background: `${activePreset.color}15` }}
              >
                <div>
                  <p className="text-sm font-semibold text-white">Get it on vinyl</p>
                  <p className="text-[11px] text-[#a3a3a3]">Support Luna Blake with a physical release</p>
                </div>
                <div
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                  style={{ background: activePreset.color }}
                >
                  Powered by elasticStage
                </div>
              </div>
              {/* The actual iframe */}
              <iframe
                key={embedUrl}
                src={embedUrl}
                className="w-full"
                style={{ height: "580px", border: "none" }}
                title="elasticStage release widget"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>

            <p className="text-center text-[10px] text-[#404040] mt-3">
              — mock {activePreset.label} artist page for demo purposes —
            </p>
          </div>
        </div>
      </div>

      {/* Right — customiser */}
      <div className="w-72 shrink-0 flex flex-col bg-[#111111] overflow-y-auto">
        <div className="px-5 py-4 border-b border-[#262626]">
          <h2 className="text-sm font-semibold text-white">Widget customisation</h2>
          <p className="text-[11px] text-[#737373] mt-0.5">
            Configure the embed for your brand. Changes update the preview live.
          </p>
        </div>

        <div className="px-5 py-4 space-y-5 flex-1">
          {/* Partner preset */}
          <div>
            <label className="text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-2 block">
              Partner preset
            </label>
            <div className="space-y-1.5">
              {PARTNER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => selectPreset(preset)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md border text-sm transition-colors ${
                    partner === preset.id
                      ? "border-[#e84d1b] bg-[#e84d1b]/10 text-white"
                      : "border-[#262626] text-[#a3a3a3] hover:border-[#444] hover:text-white"
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ background: preset.color }}
                  >
                    {preset.logo}
                  </div>
                  {preset.label}
                  {partner === preset.id && <Check size={13} className="ml-auto text-[#e84d1b]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Custom colour */}
          <div>
            <label className="text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-2 block">
              Primary colour
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-9 h-9 rounded cursor-pointer border-0 p-0.5 bg-[#1a1a1a]"
              />
              <code className="text-sm text-[#a3a3a3] font-mono bg-[#0d1117] border border-[#262626] rounded px-2 py-1 flex-1">
                {color}
              </code>
            </div>
          </div>

          {/* Embed code */}
          <div>
            <label className="text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-2 block">
              Embed code
            </label>
            <div className="relative">
              <pre className="text-[10px] font-mono text-[#a3a3a3] bg-[#0d1117] border border-[#262626] rounded-md p-3 overflow-x-auto leading-relaxed">
                {embedSnippet}
              </pre>
              <button
                onClick={copySnippet}
                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-[10px] bg-[#262626] hover:bg-[#333] text-[#a3a3a3] hover:text-white rounded transition-colors"
              >
                {copied ? <Check size={10} className="text-[#22c55e]" /> : <Copy size={10} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-[10px] text-[#737373] mt-2 leading-relaxed">
              Drop this one line into your site. The widget handles the full release creation flow — no additional integration required.
            </p>
          </div>

          {/* Open standalone */}
          <a
            href={embedUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[12px] text-[#e84d1b] hover:underline"
          >
            <ExternalLink size={12} />
            Open widget standalone
          </a>
        </div>
      </div>
    </div>
  );
}
