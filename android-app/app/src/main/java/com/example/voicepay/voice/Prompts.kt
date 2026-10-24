package com.example.voicepay.voice

/**
 * Sentences the app itself speaks (the backend voices everything else).
 * Keyed by language code; `when` with no match falls back to English.
 */
object Prompts {

    fun contactNotFound(name: String, languageCode: String): String = when (languageCode) {
        "hi-IN" -> "$name आपके संपर्कों में नहीं हैं। कृपया पहले उन्हें जोड़ें।"
        "bn-IN" -> "$name আপনার পরিচিতিতে নেই। অনুগ্রহ করে আগে তাঁকে যোগ করুন।"
        "gu-IN" -> "$name તમારા સંપર્કોમાં નથી. કૃપા કરીને પહેલા તેમને ઉમેરો."
        "kn-IN" -> "$name ನಿಮ್ಮ ಸಂಪರ್ಕಗಳಲ್ಲಿ ಇಲ್ಲ. ದಯವಿಟ್ಟು ಮೊದಲು ಅವರನ್ನು ಸೇರಿಸಿ."
        "ml-IN" -> "$name നിങ്ങളുടെ കോൺടാക്റ്റുകളിൽ ഇല്ല. ദയവായി ആദ്യം അവരെ ചേർക്കുക."
        "mr-IN" -> "$name तुमच्या संपर्कांमध्ये नाहीत. कृपया आधी त्यांना जोडा."
        "pa-IN" -> "$name ਤੁਹਾਡੇ ਸੰਪਰਕਾਂ ਵਿੱਚ ਨਹੀਂ ਹਨ। ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਉਨ੍ਹਾਂ ਨੂੰ ਜੋੜੋ।"
        "ta-IN" -> "$name உங்கள் தொடர்புகளில் இல்லை. முதலில் அவரைச் சேர்க்கவும்."
        "te-IN" -> "$name మీ కాంటాక్ట్‌లలో లేరు. దయచేసి ముందుగా వారిని జోడించండి."
        else -> "$name is not in your contacts. Please add them first."
    }

    fun paymentSent(name: String, amount: Int, languageCode: String): String = when (languageCode) {
        "hi-IN" -> "$name को ₹$amount भेज दिए गए।"
        "bn-IN" -> "$name-কে ₹$amount পাঠানো হয়েছে।"
        "gu-IN" -> "$name ને ₹$amount મોકલી દીધા છે."
        "kn-IN" -> "$name ಅವರಿಗೆ ₹$amount ಕಳುಹಿಸಲಾಗಿದೆ."
        "ml-IN" -> "$name-ന് ₹$amount അയച്ചു."
        "mr-IN" -> "$name यांना ₹$amount पाठवले."
        "pa-IN" -> "$name ਨੂੰ ₹$amount ਭੇਜ ਦਿੱਤੇ ਗਏ ਹਨ।"
        "ta-IN" -> "$name-க்கு ₹$amount அனுப்பப்பட்டது."
        "te-IN" -> "$name కి ₹$amount పంపబడింది."
        else -> "₹$amount sent to $name."
    }

    /** Spoken as the UPI app opens. App buttons are usually in English, so "Pay to UPI ID" stays English. */
    fun payInUpiApp(appName: String, amount: Int, languageCode: String): String = when (languageCode) {
        "hi-IN" -> "$appName खुल रहा है। Pay to UPI ID पर टैप करें, कॉपी की गई ID पेस्ट करें, और $amount रुपये डालें।"
        "bn-IN" -> "$appName খুলছে। Pay to UPI ID-তে ট্যাপ করুন, কপি করা ID পেস্ট করুন, আর $amount টাকা লিখুন।"
        "gu-IN" -> "$appName ખુલી રહી છે. Pay to UPI ID પર ટેપ કરો, કૉપિ કરેલી ID પેસ્ટ કરો, અને $amount રૂપિયા લખો."
        "kn-IN" -> "$appName ತೆರೆಯುತ್ತಿದೆ. Pay to UPI ID ಮೇಲೆ ಟ್ಯಾಪ್ ಮಾಡಿ, ಕಾಪಿ ಮಾಡಿದ ID ಅನ್ನು ಪೇಸ್ಟ್ ಮಾಡಿ, ಮತ್ತು $amount ರೂಪಾಯಿ ನಮೂದಿಸಿ."
        "ml-IN" -> "$appName തുറക്കുന്നു. Pay to UPI ID-ൽ ടാപ്പ് ചെയ്യുക, കോപ്പി ചെയ്ത ID പേസ്റ്റ് ചെയ്യുക, $amount രൂപ നൽകുക."
        "mr-IN" -> "$appName उघडत आहे. Pay to UPI ID वर टॅप करा, कॉपी केलेली ID पेस्ट करा, आणि $amount रुपये टाका."
        "pa-IN" -> "$appName ਖੁੱਲ੍ਹ ਰਹੀ ਹੈ। Pay to UPI ID ਤੇ ਟੈਪ ਕਰੋ, ਕਾਪੀ ਕੀਤੀ ID ਪੇਸਟ ਕਰੋ, ਅਤੇ $amount ਰੁਪਏ ਭਰੋ।"
        "ta-IN" -> "$appName திறக்கிறது. Pay to UPI ID-ஐத் தட்டி, நகலெடுத்த ID-ஐ ஒட்டி, $amount ரூபாய் என்று உள்ளிடவும்."
        "te-IN" -> "$appName తెరుచుకుంటోంది. Pay to UPI ID పై ట్యాప్ చేసి, కాపీ చేసిన IDని పేస్ట్ చేసి, $amount రూపాయలు నమోదు చేయండి."
        else -> "Opening $appName. Tap Pay to UPI ID, paste the copied ID, and type $amount rupees."
    }

    /** Spoken when the user comes back from the UPI app. */
    fun askIfPaid(name: String, amount: Int, languageCode: String): String = when (languageCode) {
        "hi-IN" -> "क्या आपने $name को $amount रुपये भेज दिए?"
        "bn-IN" -> "আপনি কি $name-কে $amount টাকা পাঠিয়েছেন?"
        "gu-IN" -> "શું તમે $name ને $amount રૂપિયા મોકલ્યા?"
        "kn-IN" -> "ನೀವು $name ಅವರಿಗೆ $amount ರೂಪಾಯಿ ಕಳುಹಿಸಿದಿರಾ?"
        "ml-IN" -> "നിങ്ങൾ $name-ന് $amount രൂപ അയച്ചോ?"
        "mr-IN" -> "तुम्ही $name यांना $amount रुपये पाठवले का?"
        "pa-IN" -> "ਕੀ ਤੁਸੀਂ $name ਨੂੰ $amount ਰੁਪਏ ਭੇਜੇ?"
        "ta-IN" -> "$name-க்கு $amount ரூபாய் அனுப்பினீர்களா?"
        "te-IN" -> "మీరు $name కి $amount రూపాయలు పంపారా?"
        else -> "Did you pay $amount rupees to $name?"
    }

    fun paymentFailed(languageCode: String): String = when (languageCode) {
        "hi-IN" -> "भुगतान नहीं हो पाया।"
        "bn-IN" -> "পেমেন্ট সফল হয়নি।"
        "gu-IN" -> "ચુકવણી નિષ્ફળ ગઈ."
        "kn-IN" -> "ಪಾವತಿ ವಿಫಲವಾಗಿದೆ."
        "ml-IN" -> "പേയ്‌മെന്റ് പരാജയപ്പെട്ടു."
        "mr-IN" -> "पेमेंट अयशस्वी झाले."
        "pa-IN" -> "ਭੁਗਤਾਨ ਅਸਫਲ ਰਿਹਾ।"
        "ta-IN" -> "பணம் செலுத்துதல் தோல்வியடைந்தது."
        "te-IN" -> "చెల్లింపు విఫలమైంది."
        else -> "The payment was not made."
    }

    fun whichContact(name: String, languageCode: String): String = when (languageCode) {
        "hi-IN" -> "आपके पास एक से ज़्यादा $name हैं। कृपया सही व्यक्ति चुनें।"
        "bn-IN" -> "আপনার একাধিক $name আছে। অনুগ্রহ করে সঠিক জনকে বেছে নিন।"
        "gu-IN" -> "તમારી પાસે એક કરતાં વધુ $name છે. કૃપા કરીને સાચી વ્યક્તિ પસંદ કરો."
        "kn-IN" -> "ನಿಮ್ಮಲ್ಲಿ ಒಂದಕ್ಕಿಂತ ಹೆಚ್ಚು $name ಇದ್ದಾರೆ. ದಯವಿಟ್ಟು ಸರಿಯಾದವರನ್ನು ಆಯ್ಕೆಮಾಡಿ."
        "ml-IN" -> "നിങ്ങൾക്ക് ഒന്നിലധികം $name ഉണ്ട്. ദയവായി ശരിയായ ആളെ തിരഞ്ഞെടുക്കുക."
        "mr-IN" -> "तुमच्याकडे एकापेक्षा जास्त $name आहेत. कृपया योग्य व्यक्ती निवडा."
        "pa-IN" -> "ਤੁਹਾਡੇ ਕੋਲ ਇੱਕ ਤੋਂ ਵੱਧ $name ਹਨ। ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ ਵਿਅਕਤੀ ਚੁਣੋ।"
        "ta-IN" -> "உங்களிடம் ஒன்றுக்கு மேற்பட்ட $name உள்ளனர். சரியானவரைத் தேர்ந்தெடுக்கவும்."
        "te-IN" -> "మీ దగ్గర ఒకరి కంటే ఎక్కువ $name ఉన్నారు. దయచేసి సరైన వ్యక్తిని ఎంచుకోండి."
        else -> "You have more than one $name. Please choose the right person."
    }
}
