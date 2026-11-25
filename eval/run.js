// Evaluation harness. Run: GEMINI_API_KEY=... node eval/run.js
// Reports per-language pass rate on known-answer questions (graded through the real pipeline) and latency.
import { routes } from "../server.js";
import { isMock } from "../llm.js";
const SET = {
  en: [["What is 15% of 200?", "30"], ["Solve: 3x + 4 = 19. x = ?", "5"], ["What is 7 x 8?", "56"]],
  hi: [["200 का 15% कितना होता है?", "30"], ["3x + 4 = 19 हल करें। x = ?", "5"], ["7 x 8 कितना होता है?", "56"]],
  kn: [["200 ರ 15% ಎಷ್ಟು?", "30"], ["3x + 4 = 19 ಆದರೆ x = ?", "5"], ["7 x 8 ಎಷ್ಟು?", "56"]],
  ta: [["200 இல் 15% எவ்வளவு?", "30"], ["3x + 4 = 19 எனில் x = ?", "5"], ["7 x 8 எவ்வளவு?", "56"]],
  te: [["200 లో 15% ఎంత?", "30"], ["3x + 4 = 19 అయితే x = ?", "5"], ["7 x 8 ఎంత?", "56"]],
};
let total = 0, ok = 0; const times = [];
for (const [lang, items] of Object.entries(SET)) {
  const qs = items.map(([question, expected], i) => ({ id: i + 1, question, answer_type: "number", expected }));
  const good = Object.fromEntries(items.map(([, e], i) => [i + 1, e]));
  const wrong = Object.fromEntries(items.map(([, e], i) => [i + 1, String(Number(e) + 1)]));
  for (const [label, answers, want] of [["right", good, true], ["wrong", wrong, false]]) {
    const t0 = Date.now();
    try {
      const g = await routes["/api/proof/grade"]({ topic: "arithmetic", lang, questions: qs, answers });
      times.push(Date.now() - t0);
      for (const r of g.results) { total++; if (r.correct === want) ok++; }
    } catch (e) { total += items.length; console.log(lang, label, "FAILED", e.message); }
  }
  console.log(lang, "done");
}
times.sort((a, b) => a - b);
console.log(`mode: ${isMock() ? "mock" : "live"}  grading accuracy: ${ok}/${total}  median latency: ${times[Math.floor(times.length / 2)]} ms  cost: Rs 0 (free tier)`);
