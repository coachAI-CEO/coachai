import { toQuery } from "@/lib/qsp";
import type { Drill } from "@/types/drill";

export type DrillQuery = {
  phase?: "DEFENDING" | "ATTACKING" | "TRANSITION";
  zone?: "DEFENSIVE_THIRD" | "MIDDLE_THIRD" | "ATTACKING_THIRD";
  age?: string;
  search?: string;
  take?: number;
  skip?: number;
};

export type DrillIndexResponse = {
  items: Drill[];
  total: number;
  take: number;
  skip: number;
};

export async function fetchDrills(params: DrillQuery = {}): Promise<DrillIndexResponse> {
  const q = toQuery(Object.fromEntries(
    Object.entries({
      phase: params.phase,
      zone: params.zone,
      age: params.age,
      search: params.search,
      take: params.take?.toString(),
      skip: params.skip?.toString(),
    }).filter(([,v]) => v !== undefined)
  ));

  // Client-side fetch uses relative URL; server can also handle it
  const res = await fetch(`/api/drills${q ? `?${q}` : ""}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load drills (${res.status})`);
  return res.json();
}
