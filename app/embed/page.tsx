"use client";

import { Suspense, useState, use } from "react";
import { Check, Upload, Sparkles, AlertTriangle, ChevronRight, Music } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5;

type FormData = {
  format: string;
  releaseType: string;
  title: string;
  artist: string;
  label: string;
  territory: string;
  priceTier: string;
  pHolder: string;
  cHolder: string;
  trackTitle: string;
  artworkMode: string;
};

// ─── Step labels ─────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: "Release" },
  { n: 2, label: "Metadata" },
  { n: 3, label: "Tracks" },
  { n: 4, label: "Artwork" },
  { n: 5, label: "Publish" },
];

// ─── Inner component (reads searchParams) ────────────────────────────────────

function EmbedContent({ searchParams }: { searchParams: Promise<{ color?: string; partner?: string }> }) {
  const params = use(searchParams);
  const color = params.color ? decodeURIComponent(params.color) : "#ff5500";
  const partner = params.partner || "soundcloud";

  const [step, setStep] = useState<Step>(1);
  const [confirmed, setConfirmed] = useState(false);
  const [live, setLive] = useState(false);
  const [form, setForm] = useState<FormData>({
    format: "", releaseType: "", title: "",
    artist: "", label: "", territory: "", priceTier: "", pHolder: "", cHolder: "",
    trackTitle: "", artworkMode: "",
  });

  function set(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function next() { setStep((s) => Math.min(s + 1, 5) as Step); }
  function back() { setStep((s) => Math.max(s - 1, 1) as Step); }

  function handleAttach() {
    setLive(true);
  }

  const inputCls = "w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-1.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[var(--accent)] transition-colors";
  const selectCls = inputCls + " appearance-none";
  const labelCls = "text-[11px] font-medium text-[#a3a3a3] block mb-1";

  return (
    <div
      className="flex flex-col h-screen bg-[#0f0f0f] text-white"
      style={{ "--accent": color } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <Music size={14} style={{ color }} />
          <span className="text-[12px] font-semibold text-white">
            {partner === "soundcloud" ? "SoundCloud" : partner} × elasticStage
          </span>
        </div>
        <span className="text-[10px] text-[#555]">Create vinyl release</span>
      </div>

      {/* Step progress */}
      <div className="flex items-center px-4 py-3 gap-1 border-b border-[#1e1e1e] overflow-x-auto">
        {STEPS.map(({ n, label }) => {
          const done = step > n;
          const active = step === n;
          return (
            <div key={n} className="flex items-center gap-1 shrink-0">
              <div
                className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold"
                style={{
                  background: done ? color : active ? color + "22" : "#1e1e1e",
                  color: done || active ? (done ? "#fff" : color) : "#555",
                  border: active ? `1.5px solid ${color}` : "none",
                }}
              >
                {done ? <Check size={10} /> : n}
              </div>
              <span
                className="text-[11px]"
                style={{ color: active ? color : done ? "#a3a3a3" : "#555" }}
              >
                {label}
              </span>
              {n < 5 && <ChevronRight size={10} className="text-[#333] ml-0.5" />}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {live ? (
          <LiveConfirmation color={color} title={form.title || "Your release"} />
        ) : (
          <>
            {step === 1 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold">Release details</h2>
                <div>
                  <label className={labelCls}>Format</label>
                  <select className={selectCls} value={form.format} onChange={(e) => set("format", e.target.value)}>
                    <option value="">Select format...</option>
                    <option value="vinyl_12">12" Vinyl</option>
                    <option value="vinyl_7">7" Vinyl</option>
                    <option value="cd">CD</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Release type</label>
                  <select className={selectCls} value={form.releaseType} onChange={(e) => set("releaseType", e.target.value)}>
                    <option value="">Select type...</option>
                    <option value="single">Single</option>
                    <option value="ep">EP</option>
                    <option value="album">Album (requires &gt;4 tracks or &gt;25 min)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Title</label>
                  <input className={inputCls} placeholder="Midnight Sessions EP" value={form.title} onChange={(e) => set("title", e.target.value)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold">Metadata</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Artist name</label>
                    <input className={inputCls} placeholder="Luna Blake" value={form.artist} onChange={(e) => set("artist", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Label (optional)</label>
                    <input className={inputCls} placeholder="Indie Records Ltd" value={form.label} onChange={(e) => set("label", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Territory</label>
                    <select className={selectCls} value={form.territory} onChange={(e) => set("territory", e.target.value)}>
                      <option value="">Select...</option>
                      <option value="worldwide">Worldwide</option>
                      <option value="uk">UK</option>
                      <option value="eu">EU</option>
                      <option value="us">US</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Price tier</label>
                    <select className={selectCls} value={form.priceTier} onChange={(e) => set("priceTier", e.target.value)}>
                      <option value="">Select...</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>℗ Rights holder</label>
                    <input className={inputCls} placeholder="Luna Blake" value={form.pHolder} onChange={(e) => set("pHolder", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>© Rights holder</label>
                    <input className={inputCls} placeholder="Indie Records Ltd" value={form.cHolder} onChange={(e) => set("cHolder", e.target.value)} />
                  </div>
                </div>
                <p className="text-[10px] text-[#555]">℗ and © holders must be separate — legally distinct fields.</p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold">Tracks</h2>
                <div>
                  <label className={labelCls}>Track title</label>
                  <input className={inputCls} placeholder="Midnight Drive" value={form.trackTitle} onChange={(e) => set("trackTitle", e.target.value)} />
                </div>
                <div className="flex items-center justify-center border-2 border-dashed border-[#2a2a2a] rounded-lg py-8 cursor-pointer hover:border-[var(--accent)] transition-colors" style={{ borderColor: undefined }}>
                  <div className="text-center">
                    <Upload size={20} className="mx-auto mb-2 text-[#555]" />
                    <p className="text-[12px] text-[#737373]">Drop audio files here or click to browse</p>
                    <p className="text-[10px] text-[#555] mt-1">WAV or MP3 · stereo · 44.1–96 kHz · ≥10s per track</p>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] rounded-md p-3 space-y-2">
                  <p className="text-[11px] text-[#737373] mb-2">Added tracks</p>
                  {["A1 — Midnight Drive (3:30)", "A2 — Neon Rain (3:18)", "B1 — Fade Out (3:45)"].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-[12px] text-[#a3a3a3]">
                      <Check size={11} style={{ color }} />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold">Artwork</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => set("artworkMode", "generate")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                      form.artworkMode === "generate" ? "border-[var(--accent)]" : "border-[#2a2a2a] hover:border-[#444]"
                    }`}
                    style={{ borderColor: form.artworkMode === "generate" ? color : undefined }}
                  >
                    <Sparkles size={20} style={{ color: form.artworkMode === "generate" ? color : "#737373" }} />
                    <span className="text-[12px] font-medium">Quick generate</span>
                    <span className="text-[10px] text-[#555] text-center">AI-powered, print-ready CMYK PDF</span>
                  </button>
                  <button
                    onClick={() => set("artworkMode", "upload")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                      form.artworkMode === "upload" ? "border-[var(--accent)]" : "border-[#2a2a2a] hover:border-[#444]"
                    }`}
                    style={{ borderColor: form.artworkMode === "upload" ? color : undefined }}
                  >
                    <Upload size={20} style={{ color: form.artworkMode === "upload" ? color : "#737373" }} />
                    <span className="text-[12px] font-medium">Upload your own</span>
                    <span className="text-[10px] text-[#555] text-center">CMYK PDF, 3543×3543px</span>
                  </button>
                </div>
                {form.artworkMode === "generate" && (
                  <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-md p-3">
                    <div className="w-12 h-12 rounded bg-gradient-to-br from-[#333] to-[#111] shrink-0" />
                    <div>
                      <p className="text-[12px] text-white">Artwork generated</p>
                      <p className="text-[10px] text-[#737373]">Print-ready CMYK PDF · 3543×3543px</p>
                    </div>
                    <Check size={14} className="ml-auto" style={{ color }} />
                  </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold">Publish release</h2>
                <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-2 text-[12px]">
                  <div className="flex justify-between"><span className="text-[#737373]">Title</span><span>{form.title || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-[#737373]">Artist</span><span>{form.artist || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-[#737373]">Format</span><span>{form.format || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-[#737373]">Territory</span><span>{form.territory || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-[#737373]">Price tier</span><span>{form.priceTier || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-[#737373]">Tracks</span><span>3</span></div>
                </div>

                <div className="flex items-start gap-2.5 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg p-3">
                  <AlertTriangle size={14} className="text-[#f59e0b] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[12px] font-medium text-[#f59e0b]">Irreversible action</p>
                    <p className="text-[11px] text-[#a3a3a3] mt-0.5">
                      Publishing makes this release live on elasticstage.com. This cannot be undone. Fan orders can be placed immediately after.
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: color }}
                  />
                  <span className="text-[12px] text-[#a3a3a3]">
                    I confirm this is ready to publish and I understand this action is irreversible.
                  </span>
                </label>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer nav */}
      {!live && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e1e1e]">
          {step > 1 ? (
            <button onClick={back} className="text-[12px] text-[#737373] hover:text-white transition-colors">
              Back
            </button>
          ) : <span />}

          {step < 5 ? (
            <button
              onClick={next}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[12px] font-medium text-white transition-colors"
              style={{ background: color }}
            >
              Next <ChevronRight size={13} />
            </button>
          ) : (
            <button
              onClick={handleAttach}
              disabled={!confirmed}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[12px] font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ background: confirmed ? color : "#333" }}
            >
              Publish release
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function LiveConfirmation({ color, title }: { color: string; title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-10 space-y-4">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: color + "22" }}
      >
        <Check size={24} style={{ color }} />
      </div>
      <div>
        <h2 className="text-base font-semibold text-white">"{title}" is live</h2>
        <p className="text-[12px] text-[#737373] mt-1">Your release is now on the elasticStage store.</p>
      </div>
      <a
        href="#"
        className="text-[12px] underline underline-offset-2"
        style={{ color }}
      >
        View on elasticstage.com →
      </a>
      <p className="text-[10px] text-[#555] max-w-[200px]">
        Revenue from fan purchases will be attributed to your SoundCloud partner account.
      </p>
    </div>
  );
}

// ─── Page export ─────────────────────────────────────────────────────────────

export default function EmbedPage({
  searchParams,
}: {
  searchParams: Promise<{ color?: string; partner?: string }>;
}) {
  return (
    <Suspense fallback={<div className="bg-[#0f0f0f] h-screen" />}>
      <EmbedContent searchParams={searchParams} />
    </Suspense>
  );
}
