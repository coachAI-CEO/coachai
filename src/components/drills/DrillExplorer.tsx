"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DrillCard from "./DrillCard";
import Pagination from "@/components/common/Pagination";
import { fetchDrills } from "@/lib/api";
import type { Drill } from "@/types/drill";

type State = {
  items: Drill[];
  total: number;
  take: number;
  skip: number;
  loading: boolean;
  error?: string;
};

export default function DrillExplorer() {
  const sp = useSearchParams();
  const [state, setState] = useState<State>({ items: [], total: 0, take: 50, skip: 0, loading: true });

  useEffect(() => {
    const phase = sp.get("phase") ?? undefined;
    const zone = sp.get("zone") ?? undefined;
    const age = sp.get("age") ?? undefined;
    const search = sp.get("search") ?? undefined;
    const take = sp.get("take") ? Number(sp.get("take")) : 50;
    const skip = sp.get("skip") ? Number(sp.get("skip")) : 0;

    setState(s => ({ ...s, loading: true, error: undefined }));

    fetchDrills({ phase, zone, age, search, take, skip })
      .then((data) => setState({ ...data, loading: false }))
      .catch((e) => setState(s => ({ ...s, loading: false, error: e.message })));
  }, [sp]);

  if (state.loading) return <div className="mt-6">Loading drills…</div>;
  if (state.error) return <div className="mt-6 text-red-600">Error: {state.error}</div>;
  if (!state.items.length) return <div className="mt-6 text-gray-500">No drills found.</div>;

  return (
    <div className="mt-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {state.items.map((d) => <DrillCard key={d.id} drill={d} />)}
      </div>
      <Pagination total={state.total} take={state.take} skip={state.skip} />
    </div>
  );
}
