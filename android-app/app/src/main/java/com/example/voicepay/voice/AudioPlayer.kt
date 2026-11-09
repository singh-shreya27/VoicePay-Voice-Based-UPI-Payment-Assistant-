package com.example.voicepay.voice

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.util.Base64
import java.io.File

/**
 * Plays the backend's spoken reply (`tts_audio`: a base64 MP3), like
 * `new Audio("data:audio/mp3;base64," + ttsAudio).play()` in a browser.
 * Only one reply plays at a time: starting a new one stops the old one.
 */
class AudioPlayer(context: Context) {

    // MediaPlayer reads from a file, so the decoded MP3 is written to the app's cache folder
    // (temporary storage Android may clear whenever it likes).
    private val file = File(context.cacheDir, "reply.mp3")
    private var player: MediaPlayer? = null

    /** Play a base64 MP3. Does nothing if it's empty (the backend's TTS failed). */
    fun play(base64Mp3: String) {
        stop()
        if (base64Mp3.isBlank()) return

        val bytes = try {
            Base64.decode(base64Mp3, Base64.DEFAULT) // like atob()
        } catch (e: IllegalArgumentException) {
            return // Not valid base64: skip the audio, the text is still on screen.
        }
        file.writeBytes(bytes)

        // `apply { }` runs setup calls on the new object and returns it, like a builder.
        player = MediaPlayer().apply {
            setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA) // follows the phone's media volume
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build()
            )
            setDataSource(file.absolutePath)
            // Loading happens in the background; these callbacks are like audio.onloadeddata /
            // audio.onended / audio.onerror.
            setOnPreparedListener { it.start() }
            setOnCompletionListener { stop() }
            setOnErrorListener { _, _, _ -> stop(); true }
            prepareAsync()
        }
    }

    /** Stop playing and free the audio hardware. Safe to call when nothing is playing. */
    fun stop() {
        player?.release()
        player = null
    }
}
