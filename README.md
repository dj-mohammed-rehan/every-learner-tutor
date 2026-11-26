# A tutor for every learner

An AI tutor that finds where a learner is stuck, teaches at their level in their language, and checks that they really learned. Built for Homingo Hackathon Edition 01, LLM apps track.

**Loop:** pick a language and any topic, answer 3 quick diagnostic questions, chat with the tutor, then take a proof check with new questions.

Languages: English, Hindi, Kannada, Tamil, Telugu. Mobile-first web app.

## Run it

Needs Node 18 or newer. No npm install, no dependencies.

    git clone https://github.com/dj-mohammed-rehan/every-learner-tutor
    cd every-learner-tutor
    export GEMINI_API_KEY=your_free_key   # from aistudio.google.com, free tier
    npm start                             # http://localhost:3000
    npm test

Without a key the app runs in demo mode with canned replies (used by the tests).

Optional env: `LLM_MODEL` (comma list, default `gemini-flash-lite-latest,gemini-flash-latest,gemini-3.5-flash-lite,gemini-3-flash-preview`), `PORT`, `RATE_PER_MIN` (default 30).

## How it works

- `server.js`: static files plus 5 JSON endpoints (diagnose questions/evaluate, tutor, proof questions/grade).
- `llm.js`: calls the model, retries once, parses JSON.
- `prompts.js`: all prompts; every reply is in the learner's language.
- `check.js`: code-checked numeric answers. Numbers (including Indic digits) are verified by code and override the model's grade.
- `public/`: the mobile UI.

## Reliability and guardrails

- Automated tests (`npm test`; `node eval/run.js` reports per-language grading accuracy and latency) cover number checking in five scripts, the full loop in every language, wrong-answer override, bad input and path traversal.
- Input length limits, per-IP rate limit, learner text treated as data not instructions.
- If the AI fails or hits free-tier limits, the app shows a friendly message in the learner's language and keeps the lesson state.
- No personal data is stored. Nothing is saved on the server.

## Evaluation results

`node eval/run.js` (live Gemini free tier, 26 Nov 2026), one run per language (English, Hindi, Kannada, Tamil, Telugu):

- Diagnose questions returned as valid JSON: 5/5
- Model grader marks a right text answer correct and a wrong one incorrect: 5/5
- Replies written in the right script: 5/5
- Code-checked grader catches a wrong number: 5/5
- Median latency per call: about 1 to 4 seconds on a good day, longer when the free tier is overloaded. Cost: Rs 0.

This is a small smoke-level test set, not a full benchmark. Language quality still needs a native speaker's review.

## Libraries, APIs and models used

- Node.js built-ins only (http, fs, test runner). No npm packages.
- Google Gemini API (free tier), models `gemini-flash-lite-latest`, with fallbacks `gemini-flash-latest`, `gemini-3.5-flash-lite`, `gemini-3-flash-preview` when one is overloaded, via its OpenAI-compatible endpoint.
- Browser Web Speech API for optional voice input (support varies by phone and language).
- AI coding assistance was used; the team reviewed the code.

## Limits

Kannada, Tamil and Telugu answers should be checked by a native speaker. Free-tier rate limits apply.
