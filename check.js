// Code-checked answers: numbers are verified by code, not by the model.
const DIGITS = { "०":0,"१":1,"२":2,"३":3,"४":4,"५":5,"६":6,"७":7,"८":8,"९":9,
  "೦":0,"೧":1,"೨":2,"೩":3,"೪":4,"೫":5,"೬":6,"೭":7,"೮":8,"೯":9,
  "௦":0,"௧":1,"௨":2,"௩":3,"௪":4,"௫":5,"௬":6,"௭":7,"௮":8,"௯":9,
  "౦":0,"౧":1,"౨":2,"౩":3,"౪":4,"౫":5,"౬":6,"౭":7,"౮":8,"౯":9 };

export function toNumber(s) {
  if (s == null) return NaN;
  const t = String(s).trim().replace(/[०-९೦-೯௦-௯౦-౯]/g, d => DIGITS[d]).replace(/,/g, "").replace(/\s+/g, "");
  if (!/^[-+]?\d*\.?\d+(\/\d*\.?\d+)?$/.test(t)) return NaN;
  if (t.includes("/")) { const [a, b] = t.split("/").map(Number); return b === 0 ? NaN : a / b; }
  return Number(t);
}

export function checkNumber(answer, expected) {
  const a = toNumber(answer), e = toNumber(expected);
  if (Number.isNaN(a) || Number.isNaN(e)) return null; // cannot verify
  return Math.abs(a - e) <= Math.max(1e-6, Math.abs(e) * 1e-6);
}

// Attach code-checked verdicts to items that carry an expected number.
export function annotate(questions, answers) {
  return questions.map(q => {
    const answer = String(answers?.[q.id] ?? answers?.[String(q.id)] ?? "").slice(0, 1000);
    const item = { id: q.id, question: q.question, answer };
    if (q.answer_type === "number" && q.expected != null) {
      const v = checkNumber(answer, q.expected);
      if (v !== null) item.verified = v ? "correct" : "incorrect";
    }
    return item;
  });
}
