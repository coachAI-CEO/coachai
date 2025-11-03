import { headers } from "next/headers";

/** Build absolute base URL for server-side fetches in app routes/pages. */
export async function buildBase(): Promise<string> {
  const h = await headers();             // Next 16 returns a Promise
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host  = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}
