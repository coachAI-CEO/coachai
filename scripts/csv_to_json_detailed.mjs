import fs from "fs";
import Papa from "papaparse";

// Helpers
const slugify = (s) =>
  s.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const coalesce = (v) => (v && String(v).trim()) || null;
const splitList = (v, sep) =>
  (v || "")
    .split(sep)
    .map((x) => x.trim())
    .filter(Boolean);

// Paths
const input = "data/u9_u11_defensive_third_drills_full_50.csv";
const out = "data/drills_defensive_third_fixed.json";

// Parse CSV
const csv = fs.readFileSync(input, "utf8");
const { data: rows } = Papa.parse(csv, { header: true, skipEmptyLines: true });

// Age bands allow "U9-U11" or "U9,U10,U11" or "9-11"
const parseAges = (raw) => {
  const v = String(raw || "");
  if (v.includes("-")) {
    const m = v.match(/U?(\d+)\s*-\s*U?(\d+)/i);
    if (!m) return [];
    const a = Number(m[1]), b = Number(m[2]);
    const lo = Math.min(a, b), hi = Math.max(a, b);
    return Array.from({ length: hi - lo + 1 }, (_, i) => `U${lo + i}`);
  }
  return v
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean)
    .map((a) => (a.toUpperCase().startsWith("U") ? a.toUpperCase() : `U${a}`));
};

const toDrill = (row) => {
  const title = coalesce(row.title) || "Untitled";
  const id = slugify(title);

  return {
    id,
    title,
    objective: coalesce(row.objective) || "—",
    phase: (row.phase || "DEFENDING").toString().trim().toUpperCase(),
    zone: (row.zone || "DEFENSIVE_THIRD").toString().trim().toUpperCase(),
    ageBands: parseAges(row.ageBands),
    categories: splitList(row.categories, ","),
    durationMin: Number(row.durationMin || 12),
    playersMin: Number(row.playersMin || 4),
    playersMax: Number(row.playersMax || 8),
    equipment: coalesce(row.equipment),
    setup: coalesce(row.setup),
    constraints: coalesce(row.constraints),
    progression: coalesce(row.progression),
    coachingPts: splitList(row.coachingPts, ";"),
    tags: splitList(row.tags, ","),
    diagram: null,
  };
};

const drills = rows.map(toDrill);

// Write JSON
fs.writeFileSync(out, JSON.stringify(drills, null, 2));
console.log(`✅ Converted ${drills.length} drills -> ${out}`);
