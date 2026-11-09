package com.example.voicepay.ui

import android.app.Application
import android.content.ClipData
import android.content.ClipboardManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.util.Base64
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.voicepay.data.AppDatabase
import com.example.voicepay.data.Contact
import com.example.voicepay.data.ContactMatcher
import com.example.voicepay.data.MatchResult
import com.example.voicepay.data.SettingsRepository
import com.example.voicepay.network.PayApi
import com.example.voicepay.network.PayRequest
import com.example.voicepay.network.PayResponse
import com.example.voicepay.payment.UpiApp
import com.example.voicepay.payment.UpiApps
import com.example.voicepay.ui.screens.LANGUAGES
import com.example.voicepay.ui.screens.Language
import com.example.voicepay.ui.screens.ResultKind
import com.example.voicepay.voice.AudioPlayer
import com.example.voicepay.voice.Prompts
import com.example.voicepay.voice.Speaker
import com.example.voicepay.voice.WavRecorder
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException
import java.net.SocketTimeoutException

/**
 * The app's "store": it owns the UiState and all the logic that changes it.
 * Android keeps a ViewModel alive while the screen is rotated or resized, so state survives
 * that (plain `remember` in a composable does not).
 *
 * It's an AndroidViewModel (gets the `Application`) because opening the database needs a Context.
 */
class VoicePayViewModel(application: Application) : AndroidViewModel(application) {

    private val contactDao = AppDatabase.get(application).contactDao()
    private val settings = SettingsRepository(application)
    private val recorder = WavRecorder()
    private val payApi = PayApi.create()
    private val audioPlayer = AudioPlayer(application)
    private val speaker = Speaker(application)
    private val connectivity = application.getSystemService(ConnectivityManager::class.java)
    private val clipboard = application.getSystemService(ClipboardManager::class.java)

    // The last spoken reply (backend audio + its text), so "Hear again" can replay it.
    private var lastReplyAudio = ""
    private var lastReplyText = ""

    // MutableStateFlow is an observable value. We keep the writable one private and expose a
    // read-only view, so only this class can change state.
    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    // `init` runs once when the ViewModel is created (like a constructor body).
    init {
        // Keep UiState.contacts in sync with the database: every insert or delete makes Room
        // emit a new list here, which we copy into the state, and the UI redraws.
        viewModelScope.launch {
            contactDao.observeAll().collect { contacts ->
                _uiState.update { it.copy(contacts = contacts, contactsLoaded = true) }
            }
        }
        // Same idea for the saved language: we store only its code ("hi-IN") and look up the
        // full Language here. `find` is like array.find() and gives null if nothing matches.
        viewModelScope.launch {
            settings.languageCode.collect { code ->
                val language = LANGUAGES.find { it.code == code }
                _uiState.update { it.copy(language = language, languageLoaded = true) }
            }
        }
        // Which UPI apps to offer: the installed ones, or all of them if the phone won't say.
        val installed = UpiApps.installed(application)
        _uiState.update {
            it.copy(upiAppChoices = installed.ifEmpty { UpiApps.KNOWN }, upiAppsDetected = installed.isNotEmpty())
        }
        // And the remembered choice, stored as its package name.
        viewModelScope.launch {
            settings.upiAppPackage.collect { packageName ->
                _uiState.update { state -> state.copy(upiApp = UpiApps.KNOWN.find { it.packageName == packageName }) }
            }
        }
    }

    // --- Language ---

    fun openLanguagePicker() = _uiState.update { it.copy(showLanguagePicker = true) }

    fun closeLanguagePicker() = _uiState.update { it.copy(showLanguagePicker = false) }

    fun selectLanguage(language: Language) {
        // Save it; UiState.language then updates via the Flow in init.
        viewModelScope.launch { settings.setLanguageCode(language.code) }
        _uiState.update { it.copy(showLanguagePicker = false) }
    }

    // --- Contacts ---

    fun openAddContact(prefillName: String = "") =
        _uiState.update { it.copy(screen = Screen.AddContact(prefillName)) }

    fun saveContact(name: String, upiId: String) {
        // We only write to the database. The list in UiState updates by itself via the Flow in init.
        viewModelScope.launch { contactDao.insert(Contact(name, upiId)) }
        // `copy` makes a new object with some fields changed, like `{ ...state, screen: home }`.
        _uiState.update { it.copy(screen = Screen.Home) }
    }

    fun deleteContact(contact: Contact) {
        viewModelScope.launch { contactDao.delete(contact) }
    }

    // --- Voice ---

    // The running timer, so we can cancel it when recording ends (like clearInterval).
    private var timerJob: Job? = null

    /** Called by the UI only after the microphone permission is granted. */
    fun onMicClick() {
        when (_uiState.value.voiceStatus) {
            VoiceStatus.Idle -> startRecording()
            VoiceStatus.Listening -> recorder.stop() // record() below then returns the audio.
            VoiceStatus.Thinking -> Unit // Busy: ignore taps.
        }
    }

    private fun startRecording() {
        stopSpeaking()
        // Check before recording, so nobody speaks a whole sentence only to hear "no internet".
        if (!isOnline()) {
            showError("No internet connection. Turn on Wi-Fi or mobile data, then try again.")
            return
        }
        _uiState.update {
            it.copy(voiceStatus = VoiceStatus.Listening, recordingSeconds = 0, reply = null, error = null)
        }

        // A ticking timer, like setInterval(() => seconds++, 1000).
        timerJob = viewModelScope.launch {
            while (true) {
                delay(1000)
                _uiState.update { it.copy(recordingSeconds = it.recordingSeconds + 1) }
            }
        }

        // viewModelScope.launch starts background work tied to this ViewModel, a bit like an
        // async function. record() "awaits" until the user taps stop or 30 s pass.
        viewModelScope.launch {
            val wav = try {
                recorder.record()
            } catch (e: Exception) {
                timerJob?.cancel()
                showError("Couldn't use the microphone. Close other apps using it and try again.")
                return@launch
            }
            timerJob?.cancel()
            onRecordingFinished(wav)
        }
    }

    private suspend fun onRecordingFinished(wav: ByteArray) {
        val seconds = WavRecorder.durationSeconds(wav)
        if (seconds < 0.7) {
            showError("Didn't catch that. Tap the mic, speak, then tap again.")
            return
        }

        val language = _uiState.value.language ?: return
        _uiState.update { it.copy(voiceStatus = VoiceStatus.Thinking, isSlow = false) }

        // If the answer takes more than 8 s, show "waking up the server…" (like a setTimeout).
        val slowHintJob = viewModelScope.launch {
            delay(8_000)
            _uiState.update { it.copy(isSlow = true) }
        }

        // JSON can't carry raw bytes, so the WAV travels as base64 text (like btoa()).
        // NO_WRAP = one long line, without the line breaks Android adds by default.
        val request = PayRequest(
            audio = Base64.encodeToString(wav, Base64.NO_WRAP),
            languageCode = language.code,
        )

        // try/catch works just like in JavaScript. Each kind of failure gets a clear message.
        val response = try {
            payApi.pay(request)
        } catch (e: SocketTimeoutException) {
            null.also { showError("The server took too long. Please try again.") }
        } catch (e: IOException) {
            null.also { showError("No internet connection. Check your Wi-Fi or mobile data.") }
        } catch (e: HttpException) {
            null.also {
                showError(
                    if (e.code() == 400) "The recording couldn't be used. Please try again."
                    else "The service is having trouble right now. Please try again."
                )
            }
        } finally {
            slowHintJob.cancel()
        }

        if (response != null) handlePayResponse(response)
    }

    /** Decide what to show based on the backend's `status` (see the table in the README). */
    private fun handlePayResponse(response: PayResponse) {
        val payment = response.payment
        val languageCode = _uiState.value.language?.code ?: "en-IN"

        if (response.status != "confirm" || payment == null) {
            // need_info / not_understood: say and show what the backend said; the user speaks again.
            // (Merging a follow-up answer with the first sentence is deferred, so we ask for the
            // whole sentence again.)
            val reply = if (response.status == "need_info") {
                "${response.speech}\nPlease say the whole sentence again."
            } else {
                response.speech
            }
            speak(response.ttsAudio, response.speech)
            _uiState.update { it.copy(voiceStatus = VoiceStatus.Idle, reply = reply) }
            return
        }

        // Look the spoken name up in the saved contacts (rules in ContactMatcher).
        when (val match = ContactMatcher.match(payment.payeeName, _uiState.value.contacts)) {
            is MatchResult.Found -> {
                // The backend's reply reads the payment back ("Pay ₹500 to Ramesh?").
                speak(response.ttsAudio, response.speech)
                _uiState.update {
                    it.copy(voiceStatus = VoiceStatus.Idle, screen = Screen.Confirm(match.contact, payment.amount))
                }
            }
            is MatchResult.Ambiguous -> {
                // Keep the backend's read-back for after they choose; ask "which one?" first.
                lastReplyAudio = response.ttsAudio
                lastReplyText = response.speech
                speaker.speak(Prompts.whichContact(payment.payeeName, languageCode), languageCode)
                _uiState.update {
                    it.copy(
                        voiceStatus = VoiceStatus.Idle,
                        screen = Screen.ChooseContact(payment.payeeName, payment.amount, match.candidates),
                    )
                }
            }
            MatchResult.NotFound -> {
                // The app's own `contact_not_found` case. The backend's audio would say
                // "Pay ₹100 to Suresh?", which is wrong here, so we speak our own prompt instead.
                speaker.speak(Prompts.contactNotFound(payment.payeeName, languageCode), languageCode)
                _uiState.update {
                    it.copy(
                        voiceStatus = VoiceStatus.Idle,
                        screen = Screen.AddContact(prefillName = payment.payeeName),
                        message = "${payment.payeeName} isn't in your contacts yet. Add them to pay.",
                    )
                }
            }
        }
    }

    /** The user picked one of several matching contacts. */
    fun chooseContact(contact: Contact) {
        val choose = _uiState.value.screen as? Screen.ChooseContact ?: return
        speak(lastReplyAudio, lastReplyText)
        _uiState.update { it.copy(screen = Screen.Confirm(contact, choose.amount)) }
    }

    /**
     * Say a reply: the backend's recorded voice if there is one, otherwise the phone's own
     * text-to-speech reads the text (the backend sends "" when its TTS failed).
     */
    private fun speak(audio: String, text: String) {
        lastReplyAudio = audio
        lastReplyText = text
        stopSpeaking()
        if (audio.isNotBlank()) {
            audioPlayer.play(audio)
        } else {
            speaker.speak(text, _uiState.value.language?.code ?: "en-IN")
        }
    }

    /** Play the last spoken reply again. */
    fun replayReply() = speak(lastReplyAudio, lastReplyText)

    private fun stopSpeaking() {
        audioPlayer.stop()
        speaker.stop()
    }

    private fun isOnline(): Boolean {
        // "Does the current network claim to reach the internet?" Like navigator.onLine.
        val capabilities = connectivity.getNetworkCapabilities(connectivity.activeNetwork)
        return capabilities?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true
    }

    private fun showError(text: String) =
        _uiState.update { it.copy(voiceStatus = VoiceStatus.Idle, error = text) }

    fun messageShown() = _uiState.update { it.copy(message = null) }

    // Called when the ViewModel is destroyed (the app is closed): release the mic and speaker.
    override fun onCleared() {
        recorder.stop()
        audioPlayer.stop()
        speaker.shutdown()
    }

    // --- Payment ---
    // UPI apps refuse payment links from apps that aren't approved UPI apps, so instead we copy
    // the UPI ID, open the user's UPI app, and talk them through paying there. The UPI app
    // can't tell us the result, so we ask "Did you pay?" when they come back.

    // True from opening the UPI app until the user returns to VoicePay.
    private var waitingForReturn = false

    /** "Confirm & pay" on the Confirm screen. */
    fun confirmPayment() {
        val confirm = _uiState.value.screen as? Screen.Confirm ?: return
        val app = _uiState.value.upiApp
        if (app == null) {
            // First payment ever: ask which app they pay with (we'll remember it).
            _uiState.update { it.copy(showUpiAppPicker = true) }
        } else {
            payInUpiApp(confirm.contact, confirm.amount, app)
        }
    }

    fun openUpiAppPicker() = _uiState.update { it.copy(showUpiAppPicker = true) }

    fun closeUpiAppPicker() = _uiState.update { it.copy(showUpiAppPicker = false) }

    /** The user picked an app in "Pay with": remember it and carry on with the payment. */
    fun selectUpiApp(app: UpiApp) {
        viewModelScope.launch { settings.setUpiAppPackage(app.packageName) }
        _uiState.update { it.copy(upiApp = app, showUpiAppPicker = false) }
        when (val screen = _uiState.value.screen) {
            is Screen.Confirm -> payInUpiApp(screen.contact, screen.amount, app)
            is Screen.FinishPayment -> payInUpiApp(screen.contact, screen.amount, app)
            else -> Unit
        }
    }

    /** "Open Paytm again" on the finish screen. */
    fun openUpiAppAgain() {
        val screen = _uiState.value.screen as? Screen.FinishPayment ?: return
        payInUpiApp(screen.contact, screen.amount, screen.app)
    }

    private fun payInUpiApp(contact: Contact, amount: Int, app: UpiApp) {
        stopSpeaking()
        copyUpiId(contact)
        if (!UpiApps.open(getApplication(), app)) {
            _uiState.update {
                it.copy(message = "${app.name} isn't installed. Choose another app.", showUpiAppPicker = true)
            }
            return
        }
        // The phone keeps speaking while the UPI app is on screen.
        val languageCode = _uiState.value.language?.code ?: "en-IN"
        speaker.speak(Prompts.payInUpiApp(app.name, amount, languageCode), languageCode)
        waitingForReturn = true
        _uiState.update { it.copy(screen = Screen.FinishPayment(contact, amount, app)) }
    }

    /** Put the UPI ID on the clipboard so the user can paste it in the UPI app. */
    fun copyUpiId(contact: Contact) {
        clipboard.setPrimaryClip(ClipData.newPlainText("UPI ID", contact.upiId))
    }

    /** VoicePay is back on screen (MainActivity tells us). If they were paying, ask how it went. */
    fun onAppResumed() {
        val screen = _uiState.value.screen as? Screen.FinishPayment ?: return
        if (!waitingForReturn) return
        waitingForReturn = false
        val languageCode = _uiState.value.language?.code ?: "en-IN"
        speaker.speak(Prompts.askIfPaid(screen.contact.name, screen.amount, languageCode), languageCode)
    }

    /** The answer to "Did you pay?". */
    fun answerPaid(paid: Boolean) {
        val screen = _uiState.value.screen as? Screen.FinishPayment ?: return
        val name = screen.contact.name
        val languageCode = _uiState.value.language?.code ?: "en-IN"
        val result = if (paid) {
            speaker.speak(Prompts.paymentSent(name, screen.amount, languageCode), languageCode)
            Screen.Result(ResultKind.Success, "₹${screen.amount} sent to $name")
        } else {
            speaker.speak(Prompts.paymentFailed(languageCode), languageCode)
            Screen.Result(ResultKind.Failed, "No money was sent to $name. You can try again any time.")
        }
        waitingForReturn = false
        _uiState.update { it.copy(screen = result) }
    }

    // --- Navigation ---

    fun goHome() {
        stopSpeaking()
        _uiState.update { it.copy(screen = Screen.Home) }
    }
}
