// LLM layer. Real mode uses Google Gemini free tier through its OpenAI-compatible endpoint.
// Mock mode (no key) returns deterministic output so the app and tests run offline.
const BASE = process.env.LLM_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai";
// Models are tried in order; the next one is used if a model is overloaded, retired or rate limited.
const MODELS = (process.env.LLM_MODEL || "gemini-flash-lite-latest,gemini-flash-latest,gemini-3.5-flash-lite,gemini-3-flash-preview").split(",");

export const isMock = () => !process.env.GEMINI_API_KEY || process.env.LLM_MOCK === "1";

export async function chat(messages, { json = false, retries = 1 } = {}) {
  if (isMock()) return mockReply(messages, json);
  let lastErr;
  for (let i = 0; i <= retries + MODELS.length - 1; i++) {
    const MODEL = MODELS[i % MODELS.length];
    try {
      const res = await fetch(`${BASE}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GEMINI_API_KEY}` },
        body: JSON.stringify({
          model: MODEL, messages, temperature: 0.4,
          ...(json ? { response_format: { type: "json_object" } } : {}),
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.status === 429) throw new Error("rate_limited");
      if (!res.ok) throw new Error(`llm_http_${res.status}`);
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("empty_reply");
      return text;
    } catch (e) { lastErr = e; await new Promise(r => setTimeout(r, 400)); }
  }
  throw lastErr;
}

export function parseJson(text) {
  const t = String(text).replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = t.indexOf("{");
  if (start < 0) throw new Error("bad_json");
  // Take the first balanced {...} object, ignoring braces inside strings.
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < t.length; i++) {
    const c = t[i];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return JSON.parse(t.slice(start, i + 1));
  }
  throw new Error("bad_json");
}

function mockReply(messages, json) {
  const last = messages[messages.length - 1].content;
  if (json) {
    if (/MODE:DIAGNOSE_QUESTIONS/.test(messages[0].content))
      return JSON.stringify({ questions: [
        { id: 1, level: "basic", question: "In your own words, what is this topic about?", answer_type: "text" },
        { id: 2, level: "medium", question: "Give one example of it.", answer_type: "text" },
        { id: 3, level: "hard", question: "What is 12 + 8?", answer_type: "number", expected: "20" } ] });
    if (/MODE:DIAGNOSE_EVAL/.test(messages[0].content))
      return JSON.stringify({ level: "beginner", gaps: ["core idea"], summary: "Starting from the basics." });
    if (/MODE:PROOF_QUESTIONS/.test(messages[0].content))
      return JSON.stringify({ questions: [
        { id: 1, question: "Explain the main idea in one sentence.", answer_type: "text" },
        { id: 2, question: "What is 6 x 7?", answer_type: "number", expected: "42" } ] });
    if (/MODE:PROOF_GRADE/.test(messages[0].content))
      return JSON.stringify({ results: [{ id: 1, correct: true, feedback: "Good." }], summary: "Nice work." });
  }
  return `(demo mode) Let's think about it step by step. What do you already know about: "${last.slice(0, 80)}"?`;
}
