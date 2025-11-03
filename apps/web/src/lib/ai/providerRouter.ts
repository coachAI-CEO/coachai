import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Core runner for both drill + plan flows.
 * provider: "GEMINI" | "OPENROUTER"
 */
export async function runAI(provider: string, prompt: string): Promise<string> {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("No prompt provided");
  }

  // --- GEMINI ---
  if (provider === "GEMINI") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing required env var: GEMINI_API_KEY");

    // Allow overriding default model via env
    const modelId = process.env.GEMINI_MODEL || "models/gemini-2.0-flash-lite";

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelId });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const text = result?.response?.text?.();
    if (!text) throw new Error("Empty response from Gemini");
    return text;
  }

  // --- OPENROUTER (Claude via OpenRouter) ---
  if (provider === "OPENROUTER") {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error("Missing required env var: OPENROUTER_API_KEY");

    const base = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
    const model = process.env.PLAN_MODEL || "anthropic/claude-3.5-sonnet";

    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        // These two headers are recommended by OpenRouter
        "HTTP-Referer": process.env.OPENROUTER_REFERRER || "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_TITLE || "CoachAI",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errTxt = await res.text().catch(() => "");
      throw new Error(`OpenRouter error ${res.status}: ${errTxt || res.statusText}`);
    }

    const json = await res.json();
    const text = json?.choices?.[0]?.message?.content;
    if (!text) throw new Error(`OpenRouter empty response: ${JSON.stringify(json)}`);
    return text;
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

/**
 * Planner-specific runner picks provider from env (default GEMINI for reliability)
 */
export async function runPlanAI(prompt: string): Promise<string> {
  const provider = (process.env.PLAN_PROVIDER || "GEMINI").toUpperCase();
  return runAI(provider, prompt);
}

/**
 * Drill-specific runner (kept for symmetry if you want a separate switch later)
 */
export async function runDrillAI(prompt: string): Promise<string> {
  const provider = (process.env.DRILL_PROVIDER || "GEMINI").toUpperCase();
  return runAI(provider, prompt);
}
