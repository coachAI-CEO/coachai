import fs from "fs";

const REQUIRED = [
  "id","title","objective","phase","zone",
  "ageBands","categories","durationMin","playersMin","playersMax"
];

const PHASES = ["DEFENDING","ATTACKING","TRANSITION"];
const ZONES  = ["DEFENSIVE_THIRD","MIDDLE_THIRD","ATTACKING_THIRD"];

function isInt(n){ return Number.isInteger(n); }

function validateDrill(d, i) {
  const errs = [];

  // Required fields
  for (const k of REQUIRED) {
    if (!(k in d)) errs.push(`missing field: ${k}`);
  }

  // Types / values
  if (d.id && typeof d.id !== "string") errs.push("id must be string");
  if (d.title && typeof d.title !== "string") errs.push("title must be string");
  if (d.objective && typeof d.objective !== "string") errs.push("objective must be string");

  if (d.phase && !PHASES.includes(String(d.phase).toUpperCase()))
    errs.push(`phase invalid: ${d.phase}`);

  if (d.zone && !ZONES.includes(String(d.zone).toUpperCase()))
    errs.push(`zone invalid: ${d.zone}`);

  if (!Array.isArray(d.ageBands) || d.ageBands.length === 0)
    errs.push("ageBands must be non-empty array");

  if (!Array.isArray(d.categories)) errs.push("categories must be array");
  if (d.coachingPts && !Array.isArray(d.coachingPts)) errs.push("coachingPts must be array if present");
  if (d.tags && !Array.isArray(d.tags)) errs.push("tags must be array if present");

  if (!isInt(d.durationMin) || d.durationMin <= 0) errs.push("durationMin must be positive integer");
  if (!isInt(d.playersMin) || d.playersMin <= 0) errs.push("playersMin must be positive integer");
  if (!isInt(d.playersMax) || d.playersMax <= 0) errs.push("playersMax must be positive integer");
  if (isInt(d.playersMin) && isInt(d.playersMax) && d.playersMin > d.playersMax)
    errs.push("playersMin cannot exceed playersMax");

  return errs;
}

const file = process.argv[2];
if (!file) {
  console.error("❌ Usage: node scripts/validate_drills.mjs <file>");
  process.exit(1);
}

const drills = JSON.parse(fs.readFileSync(file, "utf8"));
if (!Array.isArray(drills)) {
  console.error("❌ File must contain an array of drills");
  process.exit(1);
}

// Duplicate-ID check
const seen = new Map();
const dupes = [];
drills.forEach((d, i) => {
  if (seen.has(d.id)) dupes.push({ firstIndex: seen.get(d.id), dupIndex: i, id: d.id, title: d.title });
  else seen.set(d.id, i);
});

const problems = [];
drills.forEach((d, i) => {
  const errs = validateDrill(d, i);
  if (errs.length) problems.push({ index: i+1, id: d.id, title: d.title, errors: errs });
});

if (dupes.length) {
  console.log("⚠️  Duplicate IDs detected:");
  dupes.forEach(x => console.log(` - id="${x.id}" (first at #${x.firstIndex+1}, dup at #${x.dupIndex+1}) title="${x.title}"`));
}

if (problems.length) {
  console.log(`\n❌ ${problems.length} drills have issues. Showing up to first 15:`);
  problems.slice(0,15).forEach(p => {
    console.log(`\n#${p.index} id="${p.id}" title="${p.title}"`);
    p.errors.forEach(e => console.log(`  - ${e}`));
  });
  process.exit(1);
}

console.log(`✅ ${drills.length} drills valid (no schema issues, no duplicate IDs)`);
