import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { toNumber, checkNumber, annotate } from "../check.js";
import { parseJson } from "../llm.js";
process.env.LLM_MOCK = "1";
const { createServer } = await import("../server.js");
let srv, base;
before(async () => { srv = createServer(); await new Promise(r => srv.listen(0, r)); base = `http://localhost:${srv.address().port}`; });
after(() => srv.close());
const post = (p, b) => fetch(base + p, { method: "POST", body: JSON.stringify(b) });

test("numbers in five scripts parse", () => {
  for (const s of ["42", "४२", "೪೨", "௪௨", "౪౨", "42.0", "84/2", "4,2".replace(",", "")]) assert.equal(toNumber(s), 42);
});
test("code check verdicts", () => {
  assert.equal(checkNumber("20", "20"), true);
  assert.equal(checkNumber("21", "20"), false);
  assert.equal(checkNumber("twenty", "20"), null);
});
test("parseJson tolerates code fences", () => assert.deepEqual(parseJson('```json\n{"a":1}\n```'), { a: 1 }));
test("annotate adds verified only for numeric", () => {
  const r = annotate([{ id: 1, question: "q", answer_type: "number", expected: "42" }, { id: 2, question: "q2", answer_type: "text" }], { 1: "42", 2: "x" });
  assert.equal(r[0].verified, "correct"); assert.equal(r[1].verified, undefined);
});
test("full loop in every language", async () => {
  for (const lang of ["en", "hi", "kn", "ta", "te"]) {
    const q = await (await post("/api/diagnose/questions", { topic: "fractions", lang })).json();
    assert.ok(q.questions.length >= 1);
    const e = await (await post("/api/diagnose/evaluate", { topic: "fractions", lang, questions: q.questions, answers: {} })).json();
    assert.ok(e.level);
    const t = await (await post("/api/tutor", { topic: "fractions", lang, profile: e, history: [{ role: "user", content: "hi" }] })).json();
    assert.ok(t.reply);
    const pq = await (await post("/api/proof/questions", { topic: "fractions", lang, history: [] })).json();
    const g = await (await post("/api/proof/grade", { topic: "fractions", lang, questions: pq.questions, answers: { 1: "idea", 2: "42" } })).json();
    assert.equal(g.total, pq.questions.length);
    assert.equal(g.results[1].codeChecked, true); assert.equal(g.results[1].correct, true);
  }
});
test("code overrides model on wrong number", async () => {
  const g = await (await post("/api/proof/grade", { topic: "x", questions: [{ id: 2, question: "6x7", answer_type: "number", expected: "42" }], answers: { 2: "43" } })).json();
  assert.equal(g.results[0].correct, false);
});
test("guardrails: empty topic and bad json rejected", async () => {
  assert.equal((await post("/api/diagnose/questions", { topic: "  " })).status, 400);
  assert.equal((await fetch(base + "/api/tutor", { method: "POST", body: "{nope" })).status, 400);
  assert.equal((await post("/api/tutor", { topic: "x", history: [] })).status, 400);
});
test("unknown language falls back, path traversal blocked", async () => {
  assert.equal((await post("/api/diagnose/questions", { topic: "x", lang: "zz" })).status, 200);
  assert.notEqual((await fetch(base + "/..%2f..%2fetc/passwd")).status, 200);
});
test("static page served", async () => {
  const r = await fetch(base + "/"); assert.equal(r.status, 200); assert.match(await r.text(), /tutor for every learner/);
});
