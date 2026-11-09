package com.example.voicepay.voice

import android.annotation.SuppressLint
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.isActive
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder

/**
 * Records from the microphone in exactly the format the backend accepts:
 * WAV, PCM 16-bit little-endian, 16 kHz, mono, at most 30 seconds.
 *
 * Usage: `val wav = recorder.record()` suspends (waits) until `stop()` is called or 30 s pass,
 * then returns the whole .wav file as bytes.
 */
class WavRecorder {

    // @Volatile: this flag is written from the UI thread and read from the recording thread,
    // so tell Kotlin to always read the latest value.
    @Volatile private var keepRecording = false

    // The caller (MainActivity) makes sure the microphone permission was granted first.
    @SuppressLint("MissingPermission")
    suspend fun record(): ByteArray = withContext(Dispatchers.IO) {
        // withContext(Dispatchers.IO) runs this block on a background thread, so the endless
        // read loop below never freezes the screen (like a Web Worker).
        val bufferSize = AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL, ENCODING)
        val audioRecord = AudioRecord(MediaRecorder.AudioSource.MIC, SAMPLE_RATE, CHANNEL, ENCODING, bufferSize)
        check(audioRecord.state == AudioRecord.STATE_INITIALIZED) { "Microphone is not available" }

        // Raw audio (PCM) piles up here: a growable byte array, like pushing chunks into a Buffer.
        val pcm = ByteArrayOutputStream()
        val chunk = ByteArray(bufferSize)
        keepRecording = true
        audioRecord.startRecording()
        try {
            while (keepRecording && isActive && pcm.size() < MAX_PCM_BYTES) {
                val read = audioRecord.read(chunk, 0, chunk.size)
                if (read > 0) pcm.write(chunk, 0, minOf(read, MAX_PCM_BYTES - pcm.size()))
            }
        } finally {
            // `finally` always runs, even on errors, so the microphone is always released.
            audioRecord.stop()
            audioRecord.release()
        }
        withWavHeader(pcm.toByteArray())
    }

    fun stop() {
        keepRecording = false
    }

    // `companion object` = static members of the class.
    companion object {
        const val SAMPLE_RATE = 16_000
        private const val CHANNEL = AudioFormat.CHANNEL_IN_MONO
        private const val ENCODING = AudioFormat.ENCODING_PCM_16BIT
        private const val BYTES_PER_SECOND = SAMPLE_RATE * 2 // 16-bit = 2 bytes per sample, 1 channel
        private const val MAX_SECONDS = 30
        private const val MAX_PCM_BYTES = BYTES_PER_SECOND * MAX_SECONDS
        private const val HEADER_SIZE = 44

        /** How many seconds of audio a WAV made by this class holds. */
        fun durationSeconds(wav: ByteArray): Double =
            (wav.size - HEADER_SIZE).coerceAtLeast(0).toDouble() / BYTES_PER_SECOND

        /**
         * Raw PCM is just numbers; a WAV file is those same numbers with a 44-byte header in front
         * that says "16 kHz, mono, 16-bit", so other programs (and the backend) can read it.
         */
        private fun withWavHeader(pcm: ByteArray): ByteArray {
            val header = ByteBuffer.allocate(HEADER_SIZE).order(ByteOrder.LITTLE_ENDIAN).apply {
                put("RIFF".toByteArray())
                putInt(36 + pcm.size)             // size of everything after this field
                put("WAVE".toByteArray())
                put("fmt ".toByteArray())
                putInt(16)                        // size of the format section
                putShort(1)                       // 1 = PCM (uncompressed)
                putShort(1)                       // channels: mono
                putInt(SAMPLE_RATE)
                putInt(BYTES_PER_SECOND)          // byte rate
                putShort(2)                       // bytes per sample frame
                putShort(16)                      // bits per sample
                put("data".toByteArray())
                putInt(pcm.size)
            }
            return header.array() + pcm
        }
    }
}
