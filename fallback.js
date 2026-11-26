// Saved explanations used when the AI call fails or hits a free-tier limit.
// Only a few common topics are covered; any other topic gets a polite "try again" from the client.
const LESSONS = {
  fractions: {
    match: /fraction|भिन्न|ಭಿನ್ನ|பின்ன|భిన్న/i,
    en: "(Saved lesson, the AI is busy.) A fraction shows parts of a whole. In 3/4, the bottom number 4 says the whole is cut into 4 equal parts. The top number 3 says you take 3 of them. Question: if a roti is cut into 8 equal parts and you eat 2, what fraction did you eat?",
    hi: "(सहेजा हुआ पाठ, एआई अभी व्यस्त है।) भिन्न किसी पूरे के हिस्से दिखाती है। 3/4 में नीचे की संख्या 4 बताती है कि पूरे को 4 बराबर हिस्सों में बाँटा गया है। ऊपर की संख्या 3 बताती है कि आपने 3 हिस्से लिए। सवाल: अगर एक रोटी को 8 बराबर टुकड़ों में काटा और आपने 2 खाए, तो आपने कितना भाग खाया?",
    kn: "(ಉಳಿಸಿದ ಪಾಠ, ಎಐ ಈಗ ಬ್ಯುಸಿ ಇದೆ.) ಭಿನ್ನರಾಶಿ ಒಂದು ಪೂರ್ಣದ ಭಾಗಗಳನ್ನು ತೋರಿಸುತ್ತದೆ. 3/4 ರಲ್ಲಿ ಕೆಳಗಿನ ಸಂಖ್ಯೆ 4 ಎಂದರೆ ಪೂರ್ಣವನ್ನು 4 ಸಮ ಭಾಗ ಮಾಡಿದೆ. ಮೇಲಿನ ಸಂಖ್ಯೆ 3 ಎಂದರೆ ನೀವು 3 ಭಾಗ ತೆಗೆದುಕೊಂಡಿದ್ದೀರಿ. ಪ್ರಶ್ನೆ: ಒಂದು ರೊಟ್ಟಿಯನ್ನು 8 ಸಮ ಭಾಗ ಮಾಡಿ 2 ತಿಂದರೆ, ಎಷ್ಟು ಭಾಗ ತಿಂದಿರಿ?",
    ta: "(சேமித்த பாடம், AI இப்போது பிஸியாக உள்ளது.) பின்னம் ஒரு முழுவதன் பகுதிகளைக் காட்டுகிறது. 3/4 இல் கீழே உள்ள 4 என்பது முழுவதை 4 சம பகுதிகளாகப் பிரித்ததைக் காட்டுகிறது. மேலே உள்ள 3 என்பது நீங்கள் 3 பகுதிகளை எடுத்ததைக் காட்டுகிறது. கேள்வி: ஒரு ரொட்டியை 8 சம துண்டுகளாக வெட்டி 2 சாப்பிட்டால், எவ்வளவு பங்கு சாப்பிட்டீர்கள்?",
    te: "(సేవ్ చేసిన పాఠం, AI ఇప్పుడు బిజీగా ఉంది.) భిన్నం ఒక పూర్ణంలోని భాగాలను చూపిస్తుంది. 3/4 లో కింద ఉన్న 4 అంటే పూర్ణాన్ని 4 సమాన భాగాలుగా చేశారు. పైన ఉన్న 3 అంటే మీరు 3 భాగాలు తీసుకున్నారు. ప్రశ్న: ఒక రొట్టెను 8 సమాన ముక్కలుగా కోసి 2 తింటే, ఎంత భాగం తిన్నారు?",
  },
};
export function savedLesson(topic, lang) {
  for (const l of Object.values(LESSONS)) if (l.match.test(topic || "")) return l[lang] || l.en;
  return null;
}
