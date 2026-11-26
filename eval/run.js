// Evaluation harness. Run: GEMINI_API_KEY=... node eval/run.js
// Per language: (1) diagnose questions are valid JSON, (2) the model grader marks a right text answer correct
// and a wrong one incorrect, (3) tutor replies are in the right script, (4) the code-checked grader catches a wrong number.
// Also reports latency. Uses the real pipeline (routes in server.js).
import { routes } from "../server.js";
import { isMock } from "../llm.js";


const SCRIPT = { en: /[A-Za-z]/g, hi: /[\u0900-\u097F]/g, kn: /[\u0C80-\u0CFF]/g, ta: /[\u0B80-\u0BFF]/g, te: /[\u0C00-\u0C7F]/g };
const ASK = {
  en: "What is 15% of 200? Please explain.",
  hi: "200 का 15% कितना होता है? समझाइए।",
  kn: "200 ರ 15% ಎಷ್ಟು? ವಿವರಿಸಿ.",
  ta: "200 இல் 15% எவ்வளவு? விளக்கவும்.",
  te: "200 లో 15% ఎంత? వివరించండి.",
};
const CAPITAL = {
  en: "What is the capital of France?", hi: "फ्रांस की राजधानी क्या है?", kn: "ಫ್ರಾನ್ಸ್‌ನ ರಾಜಧಾನಿ ಯಾವುದು?",
  ta: "பிரான்ஸின் தலைநகரம் எது?", te: "ఫ్రాన్స్ రాజధాని ఏది?",
};
const TOPIC = { en: "percentages", hi: "प्रतिशत", kn: "ಶೇಕಡಾವಾರು", ta: "சதவீதம்", te: "శాతాలు" };

const ratio = (s, re) => { const letters = s.replace(/[\s\d\p{P}\p{S}]/gu, ""); return letters ? (s.match(re) || []).length / letters.length : 0; };

const ONLY = process.env.ONLY?.split(",");
const rows = []; const all = { diag: [], tutor: [], grade: [] };
const timed = async (bucket, fn) => { const t = Date.now(); try { const r = await fn(); all[bucket].push(Date.now() - t); return r; } catch (e) { all[bucket].push(Date.now() - t); return { error: e.message }; } };

for (const lang of Object.keys(ASK).filter(l => !ONLY || ONLY.includes(l))) {
  const topic = TOPIC[lang];
  const d = await timed("diag", () => routes["/api/diagnose/questions"]({ topic, lang }));
  const diagOk = !d.error && d.questions?.length >= 1;
  const t = await timed("tutor", () => routes["/api/tutor"]({ topic, lang, history: [{ role: "user", content: ASK[lang] }] }));
  const reply = t.reply || "";
  const cq = [{ id: 1, question: CAPITAL[lang], answer_type: "text" }];
  const r1 = await timed("grade", () => routes["/api/proof/grade"]({ topic: "geography", lang, questions: cq, answers: { 1: "Paris" } }));
  const r2 = await timed("grade", () => routes["/api/proof/grade"]({ topic: "geography", lang, questions: cq, answers: { 1: "Rome" } }));
  const tutorOk = r1.results?.[0]?.correct === true && r2.results?.[0]?.correct === false;
  const scriptOk = ratio(reply, SCRIPT[lang]) >= (lang === "en" ? 0.8 : 0.4);
  const qs = [{ id: 1, question: ASK[lang], answer_type: "number", expected: "30" }];
  const g = await timed("grade", () => routes["/api/proof/grade"]({ topic, lang, questions: qs, answers: { 1: "31" } }));
  const gradeOk = !g.error && g.results?.[0]?.correct === false && g.results[0].codeChecked === true;
  rows.push({ lang, diagOk, tutorOk, scriptOk, gradeOk, err: d.error || t.error || g.error || r1.error || r2.error || "" });
  console.log(lang, JSON.stringify(rows.at(-1)));
}
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const pass = (k) => `${rows.filter(r => r[k]).length}/${rows.length}`;
console.log(`\nmode: ${isMock() ? "mock" : "live"}`);
console.log(`diagnose JSON valid: ${pass("diagOk")}  model grader right/wrong: ${pass("tutorOk")}  right script: ${pass("scriptOk")}  grader catches wrong answer: ${pass("gradeOk")}`);
console.log(`median latency ms: diagnose ${med(all.diag)}, tutor ${med(all.tutor)}, grade ${med(all.grade)}  cost: Rs 0 (free tier)`);
