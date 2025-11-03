"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function Pagination({ total, take, skip }: { total: number; take: number; skip: number; }) {
  const router = useRouter();
  const sp = useSearchParams();

  const page = Math.floor(skip / take) + 1;
  const pages = Math.max(1, Math.ceil(total / take));

  const go = (p: number) => {
    const next = new URLSearchParams(sp.toString());
    next.set("take", String(take));
    next.set("skip", String((p - 1) * take));
    router.push(`/drills?${next.toString()}`);
  };

  return (
    <div className="flex items-center justify-between mt-4">
      <button
        className="px-3 py-1 rounded border disabled:opacity-50"
        disabled={page <= 1}
        onClick={() => go(page - 1)}
      >
        ← Prev
      </button>

      <div className="text-sm">
        Page <strong>{page}</strong> of <strong>{pages}</strong> &middot; {total} total
      </div>

      <button
        className="px-3 py-1 rounded border disabled:opacity-50"
        disabled={page >= pages}
        onClick={() => go(page + 1)}
      >
        Next →
      </button>
    </div>
  );
}
