import type { LanguageCode } from "./constants.js";

// What the backend says back, in the user's language. This text is shown in the app and voiced
// by TTS, so:
// - Amounts are digits followed by the local word for rupees, never "₹" (TTS reads words better).
// - The payee is the romanized name from the LLM. In languages that fuse case endings onto names,
//   it is followed by a separate respectful word ("அவர்களுக்கு", "గారికి", "ಅವರಿಗೆ", ...) so no
//   suffix has to be glued onto a Latin-script name.
// - Phrasing avoids gendered first-person verbs, so any TTS_VOICE works.
// - `confirm` is only the question: the app shows Yes / Retry buttons, so we don't tell the user
//   what to say or tap (that would drift from the button labels).
// DRAFT: written without native-speaker review. Have each language checked before the demo.

export interface Replies {
  confirm: (payee: string, amount: number) => string;
  askAmount: (payee: string) => string;
  askPayee: (amount: number) => string;
  notUnderstood: string;
  notHeard: string;
}

export const replies: Record<LanguageCode, Replies> = {
  "en-IN": {
    confirm: (p, a) => `Pay ${a} rupees to ${p}?`,
    askAmount: (p) => `How much do you want to send to ${p}?`,
    askPayee: (a) => `Who do you want to pay ${a} rupees to?`,
    notUnderstood: "Sorry, I could not understand that. Please try again.",
    notHeard: "I could not hear anything. Please try again.",
  },
  "hi-IN": {
    confirm: (p, a) => `${p} को ${a} रुपये भेजें?`,
    askAmount: (p) => `${p} को कितने रुपये भेजने हैं?`,
    askPayee: (a) => `${a} रुपये किसको भेजने हैं?`,
    notUnderstood: "माफ़ कीजिए, बात समझ नहीं आई। कृपया फिर से बोलिए।",
    notHeard: "कुछ सुनाई नहीं दिया। कृपया फिर से बोलिए।",
  },
  "bn-IN": {
    confirm: (p, a) => `${p}-কে ${a} টাকা পাঠাবেন?`,
    askAmount: (p) => `${p}-কে কত টাকা পাঠাতে চান?`,
    askPayee: (a) => `${a} টাকা কাকে পাঠাতে চান?`,
    notUnderstood: "দুঃখিত, বুঝতে পারিনি। আবার বলুন।",
    notHeard: "কিছু শুনতে পাইনি। আবার বলুন।",
  },
  "gu-IN": {
    confirm: (p, a) => `${p} ને ${a} રૂપિયા મોકલવા છે?`,
    askAmount: (p) => `${p} ને કેટલા રૂપિયા મોકલવા છે?`,
    askPayee: (a) => `${a} રૂપિયા કોને મોકલવા છે?`,
    notUnderstood: "માફ કરશો, સમજાયું નહીં. ફરીથી બોલો.",
    notHeard: "કંઈ સંભળાયું નહીં. ફરીથી બોલો.",
  },
  "kn-IN": {
    confirm: (p, a) => `${p} ಅವರಿಗೆ ${a} ರೂಪಾಯಿ ಕಳುಹಿಸಬೇಕೇ?`,
    askAmount: (p) => `${p} ಅವರಿಗೆ ಎಷ್ಟು ರೂಪಾಯಿ ಕಳುಹಿಸಬೇಕು?`,
    askPayee: (a) => `${a} ರೂಪಾಯಿ ಯಾರಿಗೆ ಕಳುಹಿಸಬೇಕು?`,
    notUnderstood: "ಕ್ಷಮಿಸಿ, ಅರ್ಥವಾಗಲಿಲ್ಲ. ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ.",
    notHeard: "ಏನೂ ಕೇಳಿಸಲಿಲ್ಲ. ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ.",
  },
  "ml-IN": {
    confirm: (p, a) => `${p} എന്നയാൾക്ക് ${a} രൂപ അയയ്ക്കട്ടെ?`,
    askAmount: (p) => `${p} എന്നയാൾക്ക് എത്ര രൂപ അയയ്ക്കണം?`,
    askPayee: (a) => `${a} രൂപ ആർക്കാണ് അയയ്ക്കേണ്ടത്?`,
    notUnderstood: "ക്ഷമിക്കണം, മനസ്സിലായില്ല. വീണ്ടും പറയൂ.",
    notHeard: "ഒന്നും കേട്ടില്ല. വീണ്ടും പറയൂ.",
  },
  "mr-IN": {
    confirm: (p, a) => `${p} यांना ${a} रुपये पाठवायचे का?`,
    askAmount: (p) => `${p} यांना किती रुपये पाठवायचे आहेत?`,
    askPayee: (a) => `${a} रुपये कोणाला पाठवायचे आहेत?`,
    notUnderstood: "माफ करा, समजलं नाही. पुन्हा सांगा.",
    notHeard: "काहीच ऐकू आलं नाही. पुन्हा सांगा.",
  },
  "pa-IN": {
    confirm: (p, a) => `${p} ਨੂੰ ${a} ਰੁਪਏ ਭੇਜਣੇ ਹਨ?`,
    askAmount: (p) => `${p} ਨੂੰ ਕਿੰਨੇ ਰੁਪਏ ਭੇਜਣੇ ਹਨ?`,
    askPayee: (a) => `${a} ਰੁਪਏ ਕਿਸ ਨੂੰ ਭੇਜਣੇ ਹਨ?`,
    notUnderstood: "ਮਾਫ਼ ਕਰਨਾ, ਸਮਝ ਨਹੀਂ ਆਇਆ। ਦੁਬਾਰਾ ਬੋਲੋ।",
    notHeard: "ਕੁਝ ਸੁਣਾਈ ਨਹੀਂ ਦਿੱਤਾ। ਦੁਬਾਰਾ ਬੋਲੋ।",
  },
  "ta-IN": {
    confirm: (p, a) => `${p} அவர்களுக்கு ${a} ரூபாய் அனுப்பவா?`,
    askAmount: (p) => `${p} அவர்களுக்கு எவ்வளவு ரூபாய் அனுப்ப வேண்டும்?`,
    askPayee: (a) => `${a} ரூபாய் யாருக்கு அனுப்ப வேண்டும்?`,
    notUnderstood: "மன்னிக்கவும், புரியவில்லை. மீண்டும் சொல்லுங்கள்.",
    notHeard: "எதுவும் கேட்கவில்லை. மீண்டும் சொல்லுங்கள்.",
  },
  "te-IN": {
    confirm: (p, a) => `${p} గారికి ${a} రూపాయలు పంపమంటారా?`,
    askAmount: (p) => `${p} గారికి ఎన్ని రూపాయలు పంపాలి?`,
    askPayee: (a) => `${a} రూపాయలు ఎవరికి పంపాలి?`,
    notUnderstood: "క్షమించండి, అర్థం కాలేదు. మళ్ళీ చెప్పండి.",
    notHeard: "ఏమీ వినిపించలేదు. మళ్ళీ చెప్పండి.",
  },
};
