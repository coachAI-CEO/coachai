/**
 * Heuristically estimate total players mentioned in a free-text "Organization/Setup".
 * Handles:
 *  - "two teams of six (players) each" (+ optional GK mention)
 *  - "2 teams of 6" (+ GK)
 *  - "4v4", "6 v 6", "6v6 + 1 neutral", "+ 2 neutrals", "+ GK", etc.
 *  - "plus a goalkeeper", "1 goalkeeper", "2 GKs"
 *  - fallback "13 players", "12 player"
 */
const WORD2NUM: Record<string, number> = {
  one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15
};

function toNum(s: string): number {
  const n = parseInt(s, 10);
  if (!Number.isNaN(n)) return n;
  const w = s.toLowerCase();
  return WORD2NUM[w] ?? 0;
}

export function estimatePlayersFromText(text: string): number {
  if (!text) return 0;
  const s = text.replace(/\s+/g, " ").trim();

  // --- Pattern A: "<X> teams of <Y> (players) (each)"
  //    e.g., "two teams of six players each", "2 teams of 6"
  {
    const m = s.match(/(\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen)\b)\s*teams?\s*(?:of|x)\s*(\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen)\b)/i);
    if (m) {
      const teams = toNum(m[1]);
      const perTeam = toNum(m[2]);
      let total = teams * perTeam;
      // GK(s) mention adds
      const gk = matchGKCount(s);
      total += gk;
      // neutrals/floaters add
      total += matchNeutralCount(s);
      return total;
    }
  }

  // --- Pattern B: "<A>v<B>" (optionally + neutrals/GK)
  {
    const m = s.match(/(\d+)\s*v\s*(\d+)/i);
    if (m) {
      let total = parseInt(m[1],10) + parseInt(m[2],10);
      total += matchNeutralCount(s);
      total += matchGKCount(s);
      return total;
    }
  }

  // --- Pattern C: generic "<N> players" (largest mentioned)
  {
    const nums = Array.from(s.matchAll(/(\d+)\s*players?\b/gi)).map(m => parseInt(m[1],10));
    if (nums.length) {
      let total = Math.max(...nums);
      total += matchNeutralCount(s);
      total += matchGKCount(s);
      return total;
    }
  }

  // --- Pattern D: single GK mention alone shouldn't be the entire count
  // nothing matched -> 0 (let UI fall back)
  return 0;
}

function matchNeutralCount(s: string): number {
  let n = 0;
  // "+ 1 neutral", "+2 neutrals", "and 2 floaters"
  const m1 = s.match(/(?:\+|and)\s*(\d+)\s*(?:neutrals?|floaters?)/i);
  if (m1) n += parseInt(m1[1],10);
  else {
    // "one/two neutral(s)"
    const m2 = s.match(/\b(one|two|three|four|five)\s*(?:neutrals?|floaters?)\b/i);
    if (m2) n += toNum(m2[1]);
  }
  return n;
}

function matchGKCount(s: string): number {
  // "plus a goalkeeper", "1 goalkeeper", "2 GKs", "GK"
  const a = s.match(/(?:plus|and)\s+a\s+goalkeeper\b/i);
  if (a) return 1;
  const b = s.match(/(\d+)\s*(?:goalkeepers?|gk(?:s)?)/i);
  if (b) return parseInt(b[1],10);
  const c = s.match(/\b(?:a\s+)?gk\b/i);
  if (c) return 1;
  const d = s.match(/\bgoalkeeper\b/i);
  if (d) return 1;
  return 0;
}
