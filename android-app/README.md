# android-app

Native Android app (Kotlin + Jetpack Compose).

## Setup
Create the project in Android Studio **inside this folder**:
- Template: Empty Activity (Compose)
- Language: Kotlin
- Min SDK: 24 (Android 7.0)
- Package: `com.example.voicepay`

## Planned package layout
```
com.example.voicepay
├── ui/        # Compose screens: home/listening, confirm, add contact
├── data/      # Room database: contacts (name -> UPI ID), seeded demo contacts
├── voice/     # audio recording + TTS playback
├── network/   # client for the backend /pay endpoint
└── payment/   # UPI deep-link intent + activity result handling
```
