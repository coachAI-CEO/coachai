import DrillFilters from "@/components/drills/DrillFilters";
import DrillExplorer from "@/components/drills/DrillExplorer";

export const dynamic = "force-dynamic";

export default function DrillsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Drills</h1>
      </div>

      <DrillFilters />
      <DrillExplorer />
    </main>
  );
}
