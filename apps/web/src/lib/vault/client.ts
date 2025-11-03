export type SaveSessionBody = {
  title: string;
  rationale?: string | null;
  totalDurationMin: number;
  phase: string;
  zone: string;
  age: string;
  goalsAvailable?: number;
  principleIds?: string[];
  psychThemeIds?: string[];
  segments: any[];
};

export async function saveSessionToVault(body: SaveSessionBody) {
  const res = await fetch("/api/vault/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Failed to save: ${res.status}`);
  }
  const json = await res.json();
  return json.session as { id: string; title: string };
}
