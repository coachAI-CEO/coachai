import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">CoachAI</h1>
      <p className="mt-2 text-neutral-600">Training tools and drill library.</p>
      <Link href="/drills" className="inline-block mt-4 px-4 py-2 bg-black text-white rounded">
        Browse Drills
      </Link>
    </main>
  );
}
