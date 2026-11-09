# VoicePay: pay anyone, just by saying it

**Voice-assisted UPI payments for elderly users, in 10 Indian languages.**

## The problem

UPI is everywhere in India, but payment apps are built for people who are confident with smartphones. For many older users, the hard part isn't the payment. It's everything around it: screens crowded with offers and menus, tiny keyboards where 500 easily becomes 5000, English-only menus, and the fear of sending money to the wrong person. Many end up depending on family members to pay.

## Our solution

VoicePay turns a multi-screen, typing-heavy task into one spoken sentence. The user taps one large mic button and speaks naturally in their own language, for example *"Geeta ko 2 rupaye bhej do"*. VoicePay works out who to pay and how much, then reads the payment back aloud. After an explicit tap on Confirm, it guides the user step by step to pay in the UPI app they already use (Google Pay, PhonePe, Paytm and others), where they enter their own PIN.

## How it works

1. **Speak:** the Android app records the request and sends it to a single backend endpoint, `POST /pay`.
2. **Understand:** the backend turns speech into text (Gnani AI). An LLM (Google Gemini) extracts only `{payee, amount}`, and the code validates it (whole rupees, ₹1 to ₹5,00,000). The reply is spoken back in the user's language (Gnani AI text-to-speech).
3. **Confirm:** the app matches the name against contacts saved on the phone and shows the name, UPI ID and amount for a Confirm tap.
4. **Pay:** VoicePay copies the UPI ID, opens the user's UPI app and talks them through "Pay to UPI ID → paste → amount → PIN". When they return, it asks "Did you pay?".

## Safe by design

- **The AI only suggests.** Only the user's tap and their UPI PIN authorise a payment. VoicePay never moves money itself.
- **No invented payees.** The AI never sees or produces a UPI ID. Names are matched only against saved contacts. Near-identical names (Ramesh and Rakesh) are deliberately never matched, and two matches trigger a "Which one?" screen.
- **Private by default.** Contacts stay on the phone, and API keys stay on the server, never in the app.

## What makes it different

- **Built for elders:** one button, every reply spoken aloud at a slower pace (0.9×), and the phone's own voice as a fallback.
- **Natural speech in 10 languages:** handles honorifics ("Sunil ji"), case endings ("रामू को"), number words ("paanch hazaar", "2 lakh") and mixed Hindi and English.
- **Works today:** it uses the UPI apps people already trust, with no bank integration needed.

## Tech stack

Kotlin, Jetpack Compose, Room and Retrofit (Android) · Node.js, TypeScript, Express and Zod on Render (backend) · Gnani AI (speech-to-text and text-to-speech) · Google Gemini (understanding)

## Status and next steps

**Status:** a working prototype. A signed APK has been tested on real phones, the backend is deployed, and contact matching is covered by 10 unit tests.

**Next steps:**
- Per-device authentication and rate limiting.
- Native-speaker review of all 10 languages.
- Automatic stop when the user finishes speaking.
- Pre-filled payments with real transaction status, through NPCI/TPAP approval or a payment provider's SDK.

