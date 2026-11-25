const $ = (id) => document.getElementById(id);
const S = { topic: "", lang: "en", profile: null, history: [], questions: [] };
const UI = {
  en: { err: "The AI tutor is busy right now. Please try again in a minute.", again: "Try again", yours: "Your answer" },
  hi: { err: "एआई ट्यूटर अभी व्यस्त है। कृपया एक मिनट बाद फिर कोशिश करें।", again: "फिर कोशिश करें", yours: "आपका उत्तर" },
  kn: { err: "ಎಐ ಟ್ಯೂಟರ್ ಈಗ ಬ್ಯುಸಿ ಇದೆ. ಒಂದು ನಿಮಿಷದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", again: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ", yours: "ನಿಮ್ಮ ಉತ್ತರ" },
  ta: { err: "AI ஆசிரியர் இப்போது பிஸியாக உள்ளது. ஒரு நிமிடம் கழித்து மீண்டும் முயற்சிக்கவும்.", again: "மீண்டும் முயற்சி", yours: "உங்கள் பதில்" },
  te: { err: "AI ట్యూటర్ ఇప్పుడు బిజీగా ఉంది. ఒక నిమిషం తర్వాత మళ్లీ ప్రయత్నించండి.", again: "మళ్లీ ప్రయత్నించండి", yours: "మీ సమాధానం" },
};
const store = { get: () => { try { return JSON.parse(localStorage.getItem('progress') || '[]'); } catch { return []; } }, add(e) { const l = this.get(); l.unshift(e); localStorage.setItem('progress', JSON.stringify(l.slice(0, 50))); } };
let lastScreen = 's-start';
const t = (k) => UI[S.lang][k];
const show = (id) => { if (id !== 's-prog') lastScreen = id; showRaw(id); };
const showRaw = (id) => ["s-start", "s-diag", "s-chat", "s-proof", "s-prog"].forEach(s => $(s).hidden = s !== id);
const busy = (b) => { $("busy").hidden = !b; };
const fail = (m) => { $("err").hidden = !m; $("err").textContent = m || ""; };

async function api(path, body) {
  fail(""); busy(true);
  try {
    const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: S.topic, lang: S.lang, ...body }) });
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } catch { fail(t("err")); return null; } finally { busy(false); }
}

function renderQuestions(form, qs) {
  form.innerHTML = "";
  qs.forEach(q => {
    const d = document.createElement("div"); d.className = "q";
    const l = document.createElement("label"); l.textContent = `${q.id}. ${q.question}`; l.htmlFor = `q${q.id}`;
    const i = document.createElement("input"); i.id = `q${q.id}`; i.placeholder = t("yours");
    if (q.answer_type === "number") i.inputMode = "decimal";
    d.append(l, i); form.append(d);
  });
}
const collect = (qs) => Object.fromEntries(qs.map(q => [q.id, $(`q${q.id}`).value]));
function addBubble(role, text) {
  const d = document.createElement("div"); d.className = `bubble ${role === "user" ? "me" : "bot"}`; d.textContent = text;
  $("log").append(d); d.scrollIntoView({ block: "end" });
}

$("lang").onchange = () => { S.lang = $("lang").value; document.documentElement.lang = S.lang; };
$("go").onclick = async () => {
  S.topic = $("topic").value.trim(); if (!S.topic) return;
  const r = await api("/api/diagnose/questions", {}); if (!r) return;
  S.questions = r.questions; renderQuestions($("diag-form"), S.questions); show("s-diag");
};
$("diag-submit").onclick = async () => {
  const r = await api("/api/diagnose/evaluate", { questions: S.questions, answers: collect(S.questions) }); if (!r) return;
  S.profile = r; $("level").textContent = r.level; show("s-chat");
  S.history = [{ role: "user", content: `Please start teaching me. ${r.summary || ""}` }];
  const t1 = await api("/api/tutor", { history: S.history, profile: S.profile }); if (!t1) return;
  S.history.push({ role: "assistant", content: t1.reply }); addBubble("assistant", t1.reply);
};
$("chat-form").onsubmit = async (e) => {
  e.preventDefault(); const text = $("msg").value.trim(); if (!text) return; $("msg").value = "";
  S.history.push({ role: "user", content: text }); addBubble("user", text);
  const r = await api("/api/tutor", { history: S.history, profile: S.profile });
  if (!r) { S.history.pop(); return; }
  S.history.push({ role: "assistant", content: r.reply }); addBubble("assistant", r.reply);
};
$("prove").onclick = async () => {
  const r = await api("/api/proof/questions", { history: S.history }); if (!r) return;
  S.questions = r.questions; renderQuestions($("proof-form"), S.questions); $("result").innerHTML = ""; show("s-proof");
};
$("proof-submit").onclick = async () => {
  const r = await api("/api/proof/grade", { questions: S.questions, answers: collect(S.questions) }); if (!r) return;
  const box = $("result"); box.innerHTML = "";
  const h = document.createElement("h3"); h.textContent = `${r.score} / ${r.total}`; box.append(h);
  r.results.forEach(x => { const p = document.createElement("p"); p.className = x.correct ? "ok" : "no"; p.textContent = `${x.id}. ${x.correct ? "✓" : "✗"} ${x.feedback}`; box.append(p); });
  const s = document.createElement("p"); s.textContent = r.summary; box.append(s);
  store.add({ topic: S.topic, lang: S.lang, gaps: S.profile?.gaps || [], score: r.score, total: r.total, mastered: r.mastered, at: new Date().toISOString() });
  S.failed = r.mastered ? '' : (r.summary || S.topic);
  const b = document.createElement("button"); b.textContent = r.mastered ? "✓ Learned. New topic" : "Back to the lesson";
  b.onclick = async () => { if (r.mastered) return location.reload(); show('s-chat'); S.history.push({ role: 'user', content: "I didn't pass the check. Please explain it a different way." }); const x = await api('/api/tutor', { history: S.history, profile: S.profile, reteach: S.failed }); if (x) { S.history.push({ role: 'assistant', content: x.reply }); addBubble('assistant', x.reply); } }; box.append(b);
};
// Voice input where the browser supports it (language varies by phone).
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SR) $("mic").hidden = true; else $("mic").onclick = () => {
  const rec = new SR(); rec.lang = { en: "en-IN", hi: "hi-IN", kn: "kn-IN", ta: "ta-IN", te: "te-IN" }[S.lang];
  rec.onresult = (e) => { $("msg").value = e.results[0][0].transcript; }; rec.start();
};

$("prog-btn").onclick = () => {
  const l = store.get(), box = $("prog"); box.innerHTML = "";
  if (!l.length) box.textContent = "Nothing yet. Finish a proof check to see your progress.";
  l.forEach(e => { const d = document.createElement("div"); d.className = "pr"; d.textContent = `${e.mastered ? "✓ Learned" : "… Still learning"}: ${e.topic} (${e.score}/${e.total}). Gaps: ${e.gaps.join(", ") || "none"}`; box.append(d); });
  showRaw("s-prog");
};
$("prog-back").onclick = () => showRaw(lastScreen);
