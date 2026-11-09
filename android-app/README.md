# android-app

Native Android app (Kotlin + Jetpack Compose). Min SDK 24 (Android 7.0). Package `com.example.voicepay`.

The user speaks a payment ("Pay 500 rupees to Ramesh"), the backend turns it into `{payee_name, amount}`, the app finds the payee in the contacts saved on the phone, reads the payment back, and on Confirm helps the user pay in their own UPI app.

## Run it

Open this folder (`android-app/`, not the repo root) in Android Studio, let Gradle sync, plug in a phone with USB debugging on, and press Run.

From the command line (use Android Studio's bundled JDK):

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
./gradlew :app:installDebug        # build and install a debug build on the connected phone
./gradlew :app:testDebugUnitTest   # unit tests (run on the computer)
./gradlew :app:lintRelease         # Android lint
```

The backend URL is set in `app/build.gradle.kts` (`BACKEND_URL`, currently the Render deployment).

## Release APK

```bash
./gradlew :app:assembleRelease     # -> app/build/outputs/apk/release/app-release.apk
```

Release builds are signed with the key described in `keystore.properties`:

```properties
storeFile=keystore/voicepay-release.jks
storePassword=...
keyAlias=voicepay
keyPassword=...
```

`keystore.properties` and `keystore/` are git-ignored and must stay that way. Keep a backup of both: an installed app only accepts updates signed with the same key. Without the file, release builds are produced unsigned.

To install the APK without a computer, send it to the phone (e.g. WhatsApp or Drive), open it and allow "install unknown apps". An APK signed with a different key (for example a debug build) must be uninstalled first, which deletes its saved contacts.

## How payment works

UPI apps (Google Pay, PhonePe, Paytm…) refuse `upi://pay` payment links started by apps that are not NPCI-approved UPI apps (TPAPs), even with only the payee filled in. So the app does not send a payment link. On Confirm it:

1. copies the payee's UPI ID to the clipboard,
2. opens the user's chosen UPI app on its home screen (asked once, then remembered),
3. says in the user's language: "Tap Pay to UPI ID, paste the copied ID, and type 500 rupees",
4. asks "Did you pay?" when the user comes back, and shows the result.

Sending a pre-filled payment directly needs NPCI/TPAP approval with a bank partner (see the post-demo backlog in the root README).

## Code layout

```
com.example.voicepay
├── MainActivity.kt        entry point; picks the screen for the current state, mic permission
├── ui/
│   ├── UiState.kt         everything the UI shows, as one immutable object
│   ├── VoicePayViewModel  all app logic: recording, backend call, matching, payment flow
│   ├── screens/           Home, Confirm, ChooseContact, AddContact, FinishPayment, Result,
│   │                      plus the Language and "Pay with" bottom sheets
│   ├── components/        small shared pieces (avatar, icon badge)
│   └── theme/             colours, type scale
├── data/                  Room contacts DB, DataStore settings, ContactMatcher (name lookup)
├── voice/                 WavRecorder (16 kHz mono WAV), AudioPlayer (backend MP3),
│                          Speaker (phone text-to-speech), Prompts (app's own sentences, 10 languages)
├── network/               Retrofit client for POST /pay
└── payment/               UpiApps: known UPI apps, open the chosen one
```

## Known gaps

- On-screen text is English only; the spoken prompts follow the chosen language. The translations in `voice/Prompts.kt` were not reviewed by native speakers.
- A `need_info` reply ("How much for Ramesh?") asks the user to say the whole sentence again; follow-up answers are not merged yet.
- The app can't see what was paid in the UPI app; the result relies on the user's "Did you pay?" answer.
