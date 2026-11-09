package com.example.voicepay.ui

import com.example.voicepay.data.Contact
import com.example.voicepay.payment.UpiApp
import com.example.voicepay.ui.screens.Language
import com.example.voicepay.ui.screens.ResultKind

/**
 * Everything the UI needs to draw itself, in one immutable object, like a Redux store's state.
 * The UI never changes it directly: it calls ViewModel functions, which emit a new copy.
 */
data class UiState(
    val language: Language? = null,
    val contacts: List<Contact> = emptyList(),
    // False until the database has answered once, so we don't flash "no contacts" on launch.
    val contactsLoaded: Boolean = false,
    val languageLoaded: Boolean = false,
    val voiceStatus: VoiceStatus = VoiceStatus.Idle,
    // Seconds since recording started, for the "Listening… 0:05" timer.
    val recordingSeconds: Int = 0,
    // True when the backend is taking a while (it may be waking up), to show a "please wait" hint.
    val isSlow: Boolean = false,
    // What the backend last said back when it couldn't complete a payment ("How much for Ramesh?").
    val reply: String? = null,
    // A problem the user must know about (no internet, server down…), shown as a red card on Home
    // until they try again. Kept on screen, unlike `message`, so it can't be missed.
    val error: String? = null,
    // The UPI app the user pays with (remembered), and the apps offered in the "Pay with" panel.
    val upiApp: UpiApp? = null,
    val upiAppChoices: List<UpiApp> = emptyList(),
    val upiAppsDetected: Boolean = true,
    val showUpiAppPicker: Boolean = false,
    // A short one-time notice shown at the bottom of the screen (a "snackbar"), or null.
    val message: String? = null,
    val showLanguagePicker: Boolean = false,
    val screen: Screen = Screen.Home,
) {
    // The mic only works once both setup steps are done.
    val isReady: Boolean get() = language != null && contacts.isNotEmpty()

    // Both saved values have been read from the phone's storage at least once.
    val isLoaded: Boolean get() = contactsLoaded && languageLoaded
}

/** What the mic is doing while the user is on Home. */
enum class VoiceStatus { Idle, Listening, Thinking }

/**
 * Which full screen is showing. A sealed interface is a closed set of types, like a
 * TypeScript discriminated union: `{ type: "home" } | { type: "confirm", contact, amount } | ...`.
 * Unlike an enum, each case can carry its own data.
 */
sealed interface Screen {
    data object Home : Screen
    data class AddContact(val prefillName: String = "") : Screen
    data class Confirm(val contact: Contact, val amount: Int) : Screen
    data class ChooseContact(val spokenName: String, val amount: Int, val candidates: List<Contact>) : Screen
    /** The user is paying inside their UPI app; we wait for "Did you pay?". */
    data class FinishPayment(val contact: Contact, val amount: Int, val app: UpiApp) : Screen
    data class Result(val kind: ResultKind, val message: String) : Screen
}
