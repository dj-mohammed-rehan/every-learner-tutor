import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chat, parseJson, isMock } from "./llm.js";
import * as P from "./prompts.js";
import { annotate } from "./check.js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "public");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const MAX = { topic: 200, msg: 1500 };

// Simple per-IP rate limit to protect the free tier.
const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = (hits.get(ip) || []).filter(t => now - t < 60000);
  win.push(now); hits.set(ip, win);
  return win.length > Number(process.env.RATE_PER_MIN || 30);
}

const clean = (s, n) => String(s ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const lang = (l) => (P.LANGS[l] ? l : "en");

async function llmJson(messages, validate) {
  for (let i = 0; i < 3; i++) { // retry on malformed output
    try { const out = parseJson(await chat(messages, { json: true })); if (validate(out)) return out; } catch (e) { if (i === 2) throw e; }
  }
  throw new Error("bad_json");
}

export const routes = {
  async "/api/diagnose/questions"(b) {
    const topic = clean(b.topic, MAX.topic); if (!topic) throw bad("topic required");
    const out = await llmJson(P.diagnoseQuestions(topic, lang(b.lang)), o => Array.isArray(o.questions) && o.questions.length);
    return { questions: out.questions.slice(0, 5) };
  },
  async "/api/diagnose/evaluate"(b) {
    const topic = clean(b.topic, MAX.topic);
    const qa = annotate(arr(b.questions), b.answers);
    const out = await llmJson(P.diagnoseEval(topic, lang(b.lang), qa), o => typeof o.level === "string");
    return { level: out.level, gaps: (out.gaps || []).slice(0, 5), summary: clean(out.summary, 400) };
  },
  async "/api/tutor"(b) {
    const topic = clean(b.topic, MAX.topic);
    const history = arr(b.history).slice(-12).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: clean(m.content, MAX.msg) }));
    if (!history.length) throw bad("message required");
    const reply = await chat([{ role: "system", content: P.tutorSystem(topic, lang(b.lang), { ...b.profile, reteach: clean(b.reteach, 300) }) }, ...history]);
    return { reply };
  },
  async "/api/proof/questions"(b) {
    const topic = clean(b.topic, MAX.topic);
    const tr = arr(b.history).slice(-12).map(m => `${m.role}: ${clean(m.content, 600)}`).join("\n");
    const out = await llmJson(P.proofQuestions(topic, lang(b.lang), tr), o => Array.isArray(o.questions) && o.questions.length);
    return { questions: out.questions.slice(0, 5) };
  },
  async "/api/proof/grade"(b) {
    const topic = clean(b.topic, MAX.topic);
    const qs = arr(b.questions), qa = annotate(qs, b.answers);
    const out = await llmJson(P.proofGrade(topic, lang(b.lang), qa), o => Array.isArray(o.results));
    // Code verdicts override the model for numeric items.
    const results = qa.map(item => {
      const m = out.results.find(r => String(r.id) === String(item.id)) || {};
      const correct = item.verified ? item.verified === "correct" : !!m.correct;
      return { id: item.id, correct, feedback: clean(m.feedback, 300), codeChecked: !!item.verified };
    });
    const score = results.filter(r => r.correct).length;
    return { results, score, total: results.length, mastered: score / Math.max(1, results.length) >= 0.67, summary: clean(out.summary, 400) };
  },
};
const arr = (x) => (Array.isArray(x) ? x.slice(0, 12) : []);
const bad = (m) => Object.assign(new Error(m), { status: 400 });

export function createServer() {
  return http.createServer(async (req, res) => {
    const send = (code, obj, type = "application/json") => { res.writeHead(code, { "Content-Type": type }); res.end(typeof obj === "string" || Buffer.isBuffer(obj) ? obj : JSON.stringify(obj)); };
    try {
      const url = new URL(req.url, "http://x");
      if (url.pathname === "/api/health") return send(200, { ok: true, mock: isMock() });
      if (req.method === "POST" && routes[url.pathname]) {
        if (limited(req.socket.remoteAddress)) return send(429, { error: "slow_down" });
        let raw = ""; for await (const c of req) { raw += c; if (raw.length > 20000) throw bad("too large"); }
        let body; try { body = JSON.parse(raw || "{}"); } catch { throw bad("invalid json"); }
        try { return send(200, await routes[url.pathname](body)); }
        catch (e) {
          if (e.status) throw e;
          // Graceful failure: tell the client the AI is unavailable so it can show a friendly message.
          return send(503, { error: "ai_unavailable", detail: e.message });
        }
      }
      const file = url.pathname === "/" ? "/index.html" : url.pathname;
      const full = path.normalize(path.join(ROOT, file));
      if (!full.startsWith(ROOT)) return send(403, "forbidden", "text/plain");
      send(200, await readFile(full), TYPES[path.extname(full)] || "application/octet-stream");
    } catch (e) {
      if (e.code === "ENOENT") return send(404, "not found", "text/plain");
      send(e.status || 500, { error: e.message });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, () => console.log(`Tutor running on http://localhost:${port} (${isMock() ? "demo mode, no API key" : "live AI"})`));
}
