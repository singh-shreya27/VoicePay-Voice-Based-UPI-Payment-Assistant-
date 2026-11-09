package com.example.voicepay.network

import com.example.voicepay.BuildConfig
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import java.util.concurrent.TimeUnit

// --- The JSON shapes of POST /pay (see the API contract in the repo's README) ---
// @Serializable lets kotlinx.serialization turn these classes into JSON and back, like
// JSON.stringify / JSON.parse but checked against the types. @SerialName maps our camelCase
// property names to the backend's snake_case keys.

@Serializable
data class PayRequest(
    val audio: String, // base64 WAV
    @SerialName("language_code") val languageCode: String,
)

@Serializable
data class PayResponse(
    val status: String, // "confirm" | "need_info" | "not_understood"
    val speech: String,
    @SerialName("tts_audio") val ttsAudio: String = "",
    val payment: ParsedPayment? = null, // only when status = "confirm"
)

@Serializable
data class ParsedPayment(
    @SerialName("payee_name") val payeeName: String,
    val amount: Int,
)

/**
 * The backend's endpoints. Like with Room's DAO, we only describe them and Retrofit writes the
 * HTTP code. Calling `pay(request)` is roughly
 * `await fetch(BACKEND_URL + "pay", { method: "POST", body: JSON.stringify(request) }).then(r => r.json())`.
 * A non-2xx answer throws an HttpException.
 */
interface PayApi {
    @POST("pay")
    suspend fun pay(@Body request: PayRequest): PayResponse

    // `companion object` = static members, so callers write `PayApi.create()`.
    companion object {
        fun create(): PayApi {
            val client = OkHttpClient.Builder()
                // Render's free tier sleeps when idle; the first request wakes it, which can take
                // about a minute, so allow plenty of time before giving up.
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(90, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                // Debug builds print each request's status and timing in Android Studio's Logcat
                // (search "okhttp"). BASIC skips the body, which is a huge base64 string.
                .apply {
                    if (BuildConfig.DEBUG) {
                        addInterceptor(HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BASIC))
                    }
                }
                .build()

            // Ignore any extra fields the backend may add later instead of crashing.
            val json = Json { ignoreUnknownKeys = true }

            return Retrofit.Builder()
                .baseUrl(BuildConfig.BACKEND_URL)
                .client(client)
                .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
                .build()
                .create(PayApi::class.java)
        }
    }
}
