package com.example.voicepay.voice

import android.content.Context
import android.speech.tts.TextToSpeech
import java.util.Locale

/**
 * Speaks text with the phone's built-in text-to-speech engine (like the browser's
 * `speechSynthesis.speak()`). We use it for things the backend has no audio for:
 * the "not in your contacts" prompt, and replies whose `tts_audio` came back empty.
 */
class Speaker(context: Context) : TextToSpeech.OnInitListener {

    private var isReady = false
    // Something asked to be spoken before the engine finished starting up.
    private var pending: Pair<String, String>? = null

    // The engine starts in the background and calls onInit() when it's ready.
    private val tts = TextToSpeech(context.applicationContext, this)

    override fun onInit(status: Int) {
        isReady = status == TextToSpeech.SUCCESS
        pending?.let { (text, languageCode) -> speak(text, languageCode) }
        pending = null
    }

    /** Speak `text` in a language like "hi-IN". Silently skipped if the phone lacks that voice. */
    fun speak(text: String, languageCode: String) {
        if (!isReady) {
            pending = text to languageCode
            return
        }
        val result = tts.setLanguage(Locale.forLanguageTag(languageCode))
        if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) return
        // QUEUE_FLUSH = interrupt whatever is being said and say this instead.
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "voicepay")
    }

    fun stop() {
        pending = null
        if (isReady) tts.stop()
    }

    /** Free the engine for good (when the app closes). */
    fun shutdown() = tts.shutdown()
}
