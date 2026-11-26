const $ = (id) => document.getElementById(id);
const S = { topic: "", lang: "en", profile: null, history: [], questions: [] };
const TXT = {"en": {"title": "A tutor for every learner", "ask": "What do you want to learn?", "hint": "Type any topic. For example: fractions, photosynthesis, Python loops, the French Revolution.", "topic": "Topic", "start": "Start", "quick": "Quick check", "quickHint": "A few questions so I know where you are. Guessing is fine.", "done": "Done", "typeHere": "Type here", "prove": "I think I understand. Test me", "proveH": "Prove it", "check": "Check my answers", "progress": "Your progress", "back": "Back", "thinking": "Thinking…", "learned": "✓ Learned. New topic", "lesson": "Back to the lesson", "none": "Nothing yet. Finish a proof check to see your progress.", "ok": "Learned", "still": "Still learning", "gaps": "Gaps", "send": "Send"}, "hi": {"title": "हर सीखने वाले के लिए एक ट्यूटर", "ask": "आप क्या सीखना चाहते हैं?", "hint": "कोई भी विषय लिखें। जैसे: भिन्न, प्रकाश संश्लेषण, पायथन लूप, फ्रांसीसी क्रांति।", "topic": "विषय", "start": "शुरू करें", "quick": "छोटी जाँच", "quickHint": "कुछ सवाल, ताकि मैं जान सकूँ कि आप कहाँ हैं। अंदाज़ा लगाना ठीक है।", "done": "हो गया", "typeHere": "यहाँ लिखें", "prove": "मुझे लगता है मैं समझ गया। मेरी परीक्षा लें", "proveH": "साबित करें", "check": "मेरे उत्तर जाँचें", "progress": "आपकी प्रगति", "back": "वापस", "thinking": "सोच रहा हूँ…", "learned": "✓ सीख लिया। नया विषय", "lesson": "पाठ पर वापस जाएँ", "none": "अभी कुछ नहीं। प्रगति देखने के लिए एक जाँच पूरी करें।", "ok": "सीख लिया", "still": "अभी सीख रहे हैं", "gaps": "कमियाँ", "send": "भेजें"}, "kn": {"title": "ಪ್ರತಿ ಕಲಿಯುವವರಿಗೆ ಒಬ್ಬ ಟ್ಯೂಟರ್", "ask": "ನೀವು ಏನು ಕಲಿಯಲು ಬಯಸುತ್ತೀರಿ?", "hint": "ಯಾವುದೇ ವಿಷಯ ಬರೆಯಿರಿ. ಉದಾಹರಣೆ: ಭಿನ್ನರಾಶಿ, ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ, ಪೈಥಾನ್ ಲೂಪ್, ಫ್ರೆಂಚ್ ಕ್ರಾಂತಿ.", "topic": "ವಿಷಯ", "start": "ಪ್ರಾರಂಭಿಸಿ", "quick": "ಸಣ್ಣ ಪರೀಕ್ಷೆ", "quickHint": "ನೀವು ಎಲ್ಲಿದ್ದೀರಿ ಎಂದು ತಿಳಿಯಲು ಕೆಲವು ಪ್ರಶ್ನೆಗಳು. ಊಹಿಸಿದರೂ ಸರಿ.", "done": "ಮುಗಿಯಿತು", "typeHere": "ಇಲ್ಲಿ ಬರೆಯಿರಿ", "prove": "ನನಗೆ ಅರ್ಥವಾಯಿತು ಎನಿಸುತ್ತದೆ. ನನ್ನನ್ನು ಪರೀಕ್ಷಿಸಿ", "proveH": "ಸಾಬೀತುಪಡಿಸಿ", "check": "ನನ್ನ ಉತ್ತರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ", "progress": "ನಿಮ್ಮ ಪ್ರಗತಿ", "back": "ಹಿಂದೆ", "thinking": "ಯೋಚಿಸುತ್ತಿದ್ದೇನೆ…", "learned": "✓ ಕಲಿತಿದ್ದೀರಿ. ಹೊಸ ವಿಷಯ", "lesson": "ಪಾಠಕ್ಕೆ ಹಿಂತಿರುಗಿ", "none": "ಇನ್ನೂ ಏನೂ ಇಲ್ಲ. ಪ್ರಗತಿ ನೋಡಲು ಒಂದು ಪರೀಕ್ಷೆ ಮುಗಿಸಿ.", "ok": "ಕಲಿತಿದ್ದಾರೆ", "still": "ಇನ್ನೂ ಕಲಿಯುತ್ತಿದ್ದಾರೆ", "gaps": "ಕೊರತೆಗಳು", "send": "ಕಳುಹಿಸಿ"}, "ta": {"title": "ஒவ்வொரு கற்பவருக்கும் ஒரு ஆசிரியர்", "ask": "நீங்கள் என்ன கற்க விரும்புகிறீர்கள்?", "hint": "எந்த தலைப்பையும் எழுதுங்கள். எ.கா: பின்னங்கள், ஒளிச்சேர்க்கை, பைதான் லூப், பிரெஞ்சுப் புரட்சி.", "topic": "தலைப்பு", "start": "தொடங்கு", "quick": "சிறு சோதனை", "quickHint": "நீங்கள் எங்கே இருக்கிறீர்கள் என்று அறிய சில கேள்விகள். ஊகித்தாலும் பரவாயில்லை.", "done": "முடிந்தது", "typeHere": "இங்கே எழுதுங்கள்", "prove": "எனக்குப் புரிந்தது என்று நினைக்கிறேன். என்னைச் சோதியுங்கள்", "proveH": "நிரூபியுங்கள்", "check": "என் பதில்களைச் சரிபார்", "progress": "உங்கள் முன்னேற்றம்", "back": "பின்", "thinking": "யோசிக்கிறேன்…", "learned": "✓ கற்றுக்கொண்டீர்கள். புதிய தலைப்பு", "lesson": "பாடத்திற்குத் திரும்பு", "none": "இன்னும் எதுவும் இல்லை. முன்னேற்றத்தைப் பார்க்க ஒரு சோதனையை முடியுங்கள்.", "ok": "கற்றுக்கொண்டார்", "still": "இன்னும் கற்கிறார்", "gaps": "குறைகள்", "send": "அனுப்பு"}, "te": {"title": "ప్రతి నేర్చుకునేవారికి ఒక ట్యూటర్", "ask": "మీరు ఏమి నేర్చుకోవాలనుకుంటున్నారు?", "hint": "ఏదైనా అంశం రాయండి. ఉదాహరణ: భిన్నాలు, కిరణజన్య సంయోగక్రియ, పైథాన్ లూప్స్, ఫ్రెంచ్ విప్లవం.", "topic": "అంశం", "start": "ప్రారంభించు", "quick": "చిన్న పరీక్ష", "quickHint": "మీరు ఎక్కడ ఉన్నారో తెలుసుకోవడానికి కొన్ని ప్రశ్నలు. ఊహించినా పర్వాలేదు.", "done": "అయింది", "typeHere": "ఇక్కడ రాయండి", "prove": "నాకు అర్థమైందని అనుకుంటున్నా. నన్ను పరీక్షించండి", "proveH": "నిరూపించండి", "check": "నా సమాధానాలను తనిఖీ చేయి", "progress": "మీ పురోగతి", "back": "వెనుకకు", "thinking": "ఆలోచిస్తున్నాను…", "learned": "✓ నేర్చుకున్నారు. కొత్త అంశం", "lesson": "పాఠానికి తిరిగి వెళ్ళు", "none": "ఇంకా ఏమీ లేదు. పురోగతి చూడటానికి ఒక పరీక్ష పూర్తి చేయండి.", "ok": "నేర్చుకున్నారు", "still": "ఇంకా నేర్చుకుంటున్నారు", "gaps": "లోపాలు", "send": "పంపు"}};
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

const T = (k) => TXT[S.lang][k];
function applyLang() {
  document.documentElement.lang = S.lang;
  document.querySelectorAll("[data-i18n]").forEach(e => { e.textContent = T(e.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach(e => { e.placeholder = T(e.dataset.i18nPh); });
  document.title = T("title");
}
$("lang").onchange = () => { S.lang = $("lang").value; applyLang(); };
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
  const b = document.createElement("button"); b.textContent = r.mastered ? T("learned") : T("lesson");
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
  if (!l.length) box.textContent = T("none");
  l.forEach(e => { const d = document.createElement("div"); d.className = "pr"; d.textContent = `${e.mastered ? "✓ " + T("ok") : "… " + T("still")}: ${e.topic} (${e.score}/${e.total}). ${T("gaps")}: ${e.gaps.join(", ") || "-"}`; box.append(d); });
  showRaw("s-prog");
};
$("prog-back").onclick = () => showRaw(lastScreen);
