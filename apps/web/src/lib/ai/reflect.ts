import { GoogleGenerativeAI } from "@google/generative-ai";
import { generatePromptForReflection } from "./prompts";
import type { Reflection, SessionPlan } from "@/types/session";
import { randomUUID } from "crypto";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "models/gemini-2.0-flash-lite";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

function extractJson(text: string): any {
  // strip common fences
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  // try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // fallback: try to pull the first {...} blob
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("AI did not return valid JSON");
    return JSON.parse(m[0]);
  }
}

export async function generateReflection(session: SessionPlan): Promise<Reflection> {
  if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = generatePromptForReflection({ session });

  const resp = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text = resp?.response?.text?.() ?? "";
  if (!text) throw new Error("Empty response from AI");

  const parsed = extractJson(text);

  const now = new Date().toISOString();
  const reflection: Reflection = {
    id: randomUUID(),
    sessionId: session.id,
    summary: parsed.summary ?? "",
    whatWentWell: Array.isArray(parsed.whatWentWell) ? parsed.whatWentWell : [],
    toImproveNext: Array.isArray(parsed.toImproveNext) ? parsed.toImproveNext : [],
    focusForNextSession: Array.isArray(parsed.focusForNextSession) ? parsed.focusForNextSession : [],
    psychNotes: Array.isArray(parsed.psychNotes) ? parsed.psychNotes : [],
    timestamp: now,
  };

  return reflection;
}
