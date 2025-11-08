'use client';

import React, { useState } from "react";
import GameModelSelect from "@/components/forms/GameModelSelect";
import { DEFAULT_GAME_MODEL_ID, type GameModelId } from "@/lib/gameModels.client";
import AutoDrillDiagram from "@/components/diagram/AutoDrillDiagram";

type Drill = {
  title: string;
  objective?: string;
  organization?: string;
  coachingPoints?: string[];
  progression?: string[];
  tags?: string[];
  phase?: string;
  zone?: string;
  age?: string;
  goalsAvailable?: number;
  playersAvailable?: number;
  gameModel?: string;
};





function OrgExtras({ text }: { text?: string }) {
  const raw = String(text || "");

  // 1) labeled key: "Label: value"
  const pick = (label: string) => {
    const re = new RegExp(label + ":\s*([^;\n\.]+)", "i"); // stop on ; or EOL or .
    const m = raw.match(re);
    return m ? m[1].trim() : "";
  };

  // 2) sentence-wise fallback
  const sentences = raw
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim());

  const findSentence = (rx: RegExp, usedArr?: string[]) => {
    const hit = sentences.find(s => rx.test(s));
    const cleaned = hit ? hit.replace(/\s*[.,]$/, "") : "";
    if (cleaned && usedArr) usedArr.push(cleaned);
    return cleaned;
  };

  
  const used: string[] = [];
  const take = (val: string) => { if (val) used.push(val); return val; };

  const ex = {
    triggers:
      take(pick("Triggers")
        || findSentence(/\btrigger|on regain|cue\b|pass into|lay-?off|third[- ]man|overlap|underlap|ball to (?:wide|neutral)|checks into space/i, used)),

    rotation:
      take(pick("Rotation")
        || findSentence(/\brotate|rotation|swap|switch(?:ing)? roles?/i, used)),

    scoring:
      take(pick("Scoring")
        || findSentence(/\bscore|goal|finish(?:es|ing)?|points?\b/i, used)),

    restarts:
      take(pick("Restarts")
        || findSentence(/\brestart|play restarts|from (?:gk|goal\s*kick|coach|server)|after (?:goal|out)/i, used)
        || findSentence(/\bball starts|start from\b/i, used)),

    success:
      take(pick("Success")
        || findSentence(/\bsuccess|win possession|complete \d+ passes|within \d+\s*s|delay for \d+\s*s/i, used))
  };


  const Row = ({label, val}:{label:string; val:string}) => (
    <div className="flex gap-1 text-xs">
      <span className="font-semibold">{label}:</span>
      <span className={val ? "" : "text-slate-400"}>{val || "—"}</span>
    </div>
  );

  return (
    <div className="mt-2 rounded border border-slate-200/60 bg-white/40 px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">🧠 Organization Extras</div>
      <div className="grid gap-1">
        <Row label="Triggers"  val={ex.triggers} />
        <Row label="Rotation"  val={ex.rotation} />
        <Row label="Scoring"   val={ex.scoring} />
        <Row label="Restarts"  val={ex.restarts} />
        <Row label="Success"   val={ex.success} />
      </div>
    </div>
  );
}




// --- Spec summary (parsed from Organization) --------------------------------
function extractSpec(org?: string){
  const s = String(org||"");
  const grab = (labels: string[]) => {
    const names = labels.join("|");
    const re = new RegExp(String.raw`(?:^|\b)(?:` + names + `):\s*([^;\n]+)`, "i");
    const m = s.match(re);
    return m ? m[1].trim() : "";
  };
  const field = grab(["Field","Area"]);
  const sets = grab(["Sets"]);
  const intensity = grab(["Intensity"]);
  return { field, sets, intensity };
}

const SpecBar = ({ org }: { org?: string }) => {
  const sp = extractSpec(org);
  if (!sp.field && !sp.sets && !sp.intensity) return null;
  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
      {sp.field && <div className="rounded-md border px-3 py-2 text-xs">Field: <strong>{sp.field}</strong></div>}
      {sp.sets && <div className="rounded-md border px-3 py-2 text-xs">Sets: <strong>{sp.sets}</strong></div>}
      {sp.intensity && <div className="rounded-md border px-3 py-2 text-xs">Intensity: <strong>{sp.intensity}</strong></div>}
    </div>
  );
}
function OrgBlock({text}:{text?:string}) {
  const raw = String(text || "").trim();
  const m = raw.match(/^Total players:\s*\d+\s*(?:\r?\n)?/i);
  const header = m ? m[0].trim() : "";
  const body = raw.replace(/^Total players:\s*\d+\s*/i, "").trim();
  return (
    <>
      {header && <div className="text-xs text-slate-600 mb-1">{header}</div>}
      <p className="text-sm leading-relaxed whitespace-pre-line">
        {body || "Set up a marked area in the selected zone. Define roles, rotations, triggers, and the scoring/stop conditions."}
      </p>
    </>
  );
}

// Helper to render enum-like labels (e.g. ATTACKING_THIRD -> Attacking Third)
function prettyLabel(val?: string | null) {
  if (!val) return "—";
  return String(val)
    .replace(/_/g, " ")
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function DrillGeneratorPage() {
  const [phase, setPhase] = useState("ATTACKING");
  const [zone, setZone] = useState("ATTACKING_THIRD");
  const [age, setAge] = useState("U12");
  const [goals, setGoals] = useState(1);
  const [focus, setFocus] = useState("");
  const [coachingFocus, setCoachingFocus] = useState("");
  const [keywords, setKeywords] = useState<string>("");
  const [model, setModel] = useState<GameModelId>(DEFAULT_GAME_MODEL_ID);
  const [playersAvailable, setPlayersAvailable] = useState<number>(12);

  const [drill, setDrill] = useState<Drill | null>(null);
  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  async function saveToVault() {
    if (!drill) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/drills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drill }),
      });
      const ct = res.headers.get("content-type") || "";
      const payload = ct.includes("application/json")
        ? await res.json()
        : { error: await res.text() };
      if (!res.ok) throw new Error(payload?.error || `HTTP ${res.status}`);
      const id = payload?.id || payload?.drill?.slug || "(saved)";
      setSaveMsg("Saved to Vault: " + id);
    } catch (e: any) {
      setSaveMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function generate() {
    setLoading(true);
    setDrill(null);
    try {
      const res = await fetch("/api/ai/generate-drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          phase,
          zone,
          age,
          goalsAvailable: Number(goals),
          coachingFocus: coachingFocus.trim() || undefined,
          playersAvailable: Number(playersAvailable) || 0,
        }),
      });
      const data = await res.json();
      const out = (data?.drill ?? data) as Drill;
      console.groupCollapsed("AI drill response"); console.log(out); console.groupEnd();
      setDrill({ ...out, playersAvailable: Number(playersAvailable) || 0 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Generate Drill (AI)</h1>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <div className="text-sm font-medium mb-1">Phase</div>
          <select
            className="w-full border rounded-lg p-2"
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
          >
            <option value="ATTACKING">{prettyLabel("ATTACKING")}</option>
            <option value="DEFENDING">{prettyLabel("DEFENDING")}</option>
            <option value="TRANSITION">{prettyLabel("TRANSITION")}</option>
          </select>
        </label>

        <label className="block">
          <div className="text-sm font-medium mb-1">Zone</div>
          <select
            className="w-full border rounded-lg p-2"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
          >
            <option value="DEFENSIVE_THIRD">{prettyLabel("DEFENSIVE_THIRD")}</option>
            <option value="MIDDLE_THIRD">{prettyLabel("MIDDLE_THIRD")}</option>
            <option value="ATTACKING_THIRD">{prettyLabel("ATTACKING_THIRD")}</option>
          </select>
        </label>

<label className="block">
  <div className="text-sm font-medium mb-1">Age</div>
  <select className="w-full border rounded-lg p-2" value={age} onChange={(e) => setAge(e.target.value)}>
    {["U9","U10","U11","U12","U13","U14","U15","U16","U17","U18"].map(a => (
      <option key={a} value={a}>{a}</option>
    ))}
  </select>
</label>

<label className="block">
  <div className="text-sm font-medium mb-1">Goals Available (0–2)</div>
  <select
    className="w-full border rounded-lg p-2"
    value={String(goals)}
    onChange={(e) => setGoals(Number(e.target.value))}
  >
    <option value="0">0</option>
    <option value="1">1</option>
    <option value="2">2</option>
  </select>
</label>

        <label className="md:col-span-2 block">
  <div className="text-sm font-medium mb-1">Coaching focus (optional)</div>
  <input
    className="w-full border rounded-lg p-2"
    placeholder="e.g., create more chances by attacking wide areas; press on negative transition; build-up vs compact block"
    value={coachingFocus}
    onChange={(e)=>setCoachingFocus(e.target.value)}
  />
  <p className="mt-1 text-xs text-gray-500">This helps steer the AI toward your specific intention for the drill.</p>
</label>

        <label className="block">
          <div className="text-sm font-medium mb-1">Players available</div>
          <input
            type="number"
            min={1}
            max={30}
            step={1}
            className="w-full border rounded-lg p-2"
            value={playersAvailable}
            onChange={(e) => setPlayersAvailable(Number(e.target.value))}
          />
        </label>

        <div className="md:col-span-2">
          <GameModelSelect
            value={model}
            onChange={setModel}
            helperText="Links the drill to the selected game model."
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={generate}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate Drill"}
        </button>

        <button
          className="ml-3 inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
          onClick={saveToVault}
          disabled={!drill || saving}
        >
          {saving ? "Saving…" : "Save Drill to Vault"}
        </button>

        {saveMsg ? <p className="mt-2 text-sm text-gray-600">{saveMsg}</p> : null}
      </div>

      {drill && (
        <article className="mt-6 border rounded-xl p-4">
          <h2 className="text-xl font-semibold">{drill.title}</h2>

          {drill.objective && (
            <p className="mt-2 text-gray-700">{drill.objective}</p>
          )}

          <div className="mt-3 text-sm text-gray-600">
            Phase: <strong>{prettyLabel(drill.phase)}</strong> · Zone: <strong>{prettyLabel(drill.zone)}</strong> · Age: <strong>{drill.age}</strong> · Goals available: <strong>{drill.goalsAvailable}</strong> · Players available: <strong>{drill.playersAvailable ?? playersAvailable}</strong>
          </div>

          {Array.isArray(drill.tags) && drill.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {drill.tags.map((t, i) => (
                <span key={i} className="px-2 py-1 text-xs rounded-full bg-gray-100 border">
                  {t}
                </span>
              ))}
            </div>
          )}

{drill.organization && (
  <section className="mt-5">
    <h3 className="font-semibold mb-1">Organization</h3>
    <OrgSpecs text={drill.organization} age={drill.age} />

<OrgBlockV2 text={drill.organization} />

    
    
    <OrgExtras text={drill.organization} />
</section>
)}


          {drill.setup && (
            <section className="mt-4">
              <h3 className="font-semibold mb-1">Setup</h3>
              <p className="text-sm text-gray-800">{drill.setup}</p>
            </section>
          )}

          {drill.constraints && (
            <section className="mt-3">
              <h3 className="font-semibold mb-1">Constraints</h3>
              <p className="text-sm text-gray-800 whitespace-pre-line">{drill.constraints}</p>
            </section>
          )}

          {Array.isArray(drill.equipment) && drill.equipment.length > 0 && (
            <section className="mt-3">
              <h3 className="font-semibold mb-1">Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {drill.equipment.map((e,i)=>(
                  <span key={i} className="px-2 py-1 text-xs rounded-full bg-gray-100 border">{e}</span>
                ))}
              </div>
            </section>
          )}

          

          {Array.isArray(drill.coachingPoints) && drill.coachingPoints.length > 0 && (
            <details className="mt-5 rounded-lg border bg-white/50 open:shadow-sm"><summary className="cursor-pointer select-none px-3 py-2 font-semibold">Key Coaching Points</summary><div className="px-4 pb-3 pt-1"><ul className="list-disc ml-5">{drill.coachingPoints.map((p,i)=>(<li key={i}>{p}</li>))}</ul></div></details>
          )}

          {Array.isArray(drill.progression) && drill.progression.length > 0 && (
            <details className="mt-5 rounded-lg border bg-white/50 open:shadow-sm"><summary className="cursor-pointer select-none px-3 py-2 font-semibold">Progressions</summary><div className="px-4 pb-3 pt-1"><ol className="list-decimal ml-5">{drill.progression.map((p,i)=>(<li key={i}>{p}</li>))}</ol></div></details>
          )}

          {drill.gameModel && (
            <section className="mt-5">
              <h3 className="font-semibold">Game Model Link</h3>
              <p className="text-gray-700">{drill.gameModel}</p>
            </section>
          )}

          <section className="mt-8">
            <h3 className="font-semibold mb-2">Diagram</h3>
            <AutoDrillDiagram drill={drill as any} />
            <p className="mt-2 text-xs text-gray-500">
              Auto-generated layout based on phase/zone — no manual drawing required.
            </p>
          </section>
        </article>
      )}
    </main>
  );
}

/* --- OrgBlockV2: robust organization renderer --- */
function OrgBlockV2({ text }: { text?: string }) {
  const raw = String(text || "").trim();
  const displayRaw = raw.replace(/^\s*(Triggers|Rotation|Scoring|Restarts|Success):.*$/gim, "").trim();
  if (!raw) return null;

  // Header (Total players)
  const headerRe = /^\s*Total players:\s*(\d+)\s*(?:[.:-])?\s*(?:\r?\n)?/i;
  const mHeader = raw.match(headerRe);
  const header = mHeader ? `Total players: ${mHeader[1]}` : "";

  // Extract spec lines (Format, Area, Sets, Intensity)
  const getLine = (label: string) => {
    const r = new RegExp("^\\s*" + label + ":\\s*(.+)$", "im");
    const mm = raw.match(r);
    return mm ? mm[1].trim() : "";
  };
  const fmt  = getLine("Format");
  const area = getLine("Area");
  const sets = getLine("Sets");
  const inten= getLine("Intensity");

  // Build subtitle (only show provided pieces)
  const bits: string[] = [];
  if (fmt)  bits.push(`Format: ${fmt}`);
  if (area) bits.push(`Area: ${area}`);
  if (sets) bits.push(`Sets: ${sets}`);
  if (inten) bits.push(`Intensity: ${inten}`);

  // Clean body (strip header/spec lines)
  let body = raw
    .replace(headerRe, "")
    .replace(/^\s*Format:.*$/gim, "")
    .replace(/^\s*Area:.*$/gim, "")
    .replace(/^\s*Sets:.*$/gim, "")
    .replace(/^\s*Intensity:.*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const dbg = (typeof window!=="undefined") && new URLSearchParams(window.location.search).has("debug");
  if (dbg) console.table({ raw, header: header || null, fmt, area, inten, body });

  const visible = body || raw;

  return (
    <>
      {header && <div className="text-xs text-slate-600">{header}</div>}
      {bits.length > 0 && (
        <div className="text-xs text-slate-600 mb-1">{bits.join("\u00A0\u00A0 ")}</div>
      )}
      <p className="text-sm leading-relaxed whitespace-pre-line">
        {visible || "Set up a marked area in the selected zone. Define roles, rotations, triggers, and the scoring/stop conditions."}
      </p>
    </>
  );
}

/* --- Spec extractor + subtitle UI (Format | Area | Intensity) --- */
function extractSpecs(text?: string, age?: string){
  const raw = String(text || "");
  const mFormat = raw.match(/\b(\d+v\d+(?:\+\d+)?)\b/i);
  const mArea   = raw.match(/\b(\d{2,3}\s*x\s*\d{2,3})\b/i);
  const mInt    = raw.match(/\bIntensity:\s*([^\n]+)\b/i);

  // simple age-based fallbacks
  const a = String(age||"").toUpperCase();
  const num = parseInt(a.replace(/[^0-9]/g,"")) || 12;
  const fallbackArea =
    num <= 9 ? "30x20" :
    num <= 11 ? "40x25" :
    num <= 13 ? "50x35" :
    num <= 15 ? "60x40" : "70x50";
  const fallbackInt =
    num <= 9 ? "technical" :
    num <= 11 ? "technical/tactical" :
    num <= 13 ? "tactical" :
    num <= 15 ? "tactical / high tempo" : "high tempo";

  return {
    format: mFormat?.[1] || undefined,
    area: (mArea?.[1] || fallbackArea) + " yd",
    intensity: mInt?.[1] || fallbackInt,
  };
}

function OrgSpecs({ text, age }:{ text?: string; age?: string }){
  const s = extractSpecs(text, age);
  return (
    <div className="mt-1 text-xs text-slate-600">
      <span className="inline-block mr-3"><span className="font-semibold">Format:</span> {s.format ?? "—"}</span>
      <span className="inline-block mr-3"><span className="font-semibold">Area:</span> {s.area}</span>
      <span className="inline-block"><span className="font-semibold">Intensity:</span> {s.intensity}</span>
    </div>
  );
}

/* --- Org sub-sections (Rotation, Triggers, Scoring, Restarts) --- */
function parseOrgSections(text?: string){
  const raw = String(text || "");
  const take = (label: string) => {
    const re = new RegExp("^\\s*(?:" + label + ")\\s*:\\s*(.+)$", "im");
    const m = raw.match(re);
    return m ? m[1].trim() : "";
  };
  return {
    rotation: take("Rotation|Rotations"),
    triggers: take("Trigger|Triggers"),
    scoring:  take("Scoring|Score|Scoring rules"),
    restarts: take("Restart|Restarts"),
  };
}

function OrgSections({ text }: { text?: string }){
  const s = parseOrgSections(text);
  const items: Array<[string,string]> = [];
  if (s.rotation) items.push(["Rotations", s.rotation]);
  if (s.triggers) items.push(["Triggers", s.triggers]);
  if (s.scoring)  items.push(["Scoring",  s.scoring]);
  if (s.restarts) items.push(["Restarts", s.restarts]);
  if (items.length === 0) return null;
  return (
    <div className="mt-2 grid gap-2">
      {items.map(([k,v])=>(
        <div key={k} className="text-sm">
          <span className="font-semibold">{k}:</span>{" "}
          <span className="text-slate-700">{v}</span>
        </div>
      ))}
    </div>
  );
}

/* Duplicate OrgExtras removed — using the earlier OrgExtras implementation above */
