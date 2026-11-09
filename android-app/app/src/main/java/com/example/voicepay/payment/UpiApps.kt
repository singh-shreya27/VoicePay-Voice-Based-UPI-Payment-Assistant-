package com.example.voicepay.payment

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent

/** A UPI payment app the user can pay with. */
data class UpiApp(val packageName: String, val name: String)

/**
 * Opens the user's UPI app on its normal home screen, exactly like tapping its icon.
 *
 * We don't send a `upi://pay` payment link: UPI apps refuse payment links from apps that aren't
 * NPCI-approved UPI apps (TPAPs). Opening the app itself can't be refused; the user then pays to
 * the copied UPI ID inside it, which always works.
 */
object UpiApps {

    // Each app's package name is its unique id on the Play Store (like an npm package name).
    // These must also be listed under <queries> in AndroidManifest.xml, or Android 11+ hides them.
    val KNOWN = listOf(
        UpiApp("com.google.android.apps.nbu.paisa.user", "Google Pay"),
        UpiApp("com.phonepe.app", "PhonePe"),
        UpiApp("net.one97.paytm", "Paytm"),
        UpiApp("in.org.npci.upiapp", "BHIM"),
        UpiApp("com.dreamplug.androidapp", "CRED"),
        UpiApp("com.mobikwik_new", "MobiKwik"),
    )

    /**
     * The known UPI apps installed on this phone. Some phones (Realme/ColorOS, Xiaomi) hide other
     * apps unless the user allows "read installed apps", so this can come back empty even when
     * Paytm is there; the caller then offers the whole list and just tries to open the choice.
     */
    fun installed(context: Context): List<UpiApp> =
        KNOWN.filter { context.packageManager.getLaunchIntentForPackage(it.packageName) != null }

    /** Open [app]. Returns false if it isn't installed (or can't be opened). */
    fun open(context: Context, app: UpiApp): Boolean {
        val intent = context.packageManager.getLaunchIntentForPackage(app.packageName)
            // If the phone hid the app from us, ask Android to open its main screen anyway.
            ?: Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER).setPackage(app.packageName)
        // NEW_TASK: the UPI app runs as its own app (its own entry in "recent apps"), and we can
        // start it from the ViewModel, which has no screen of its own.
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        return try {
            context.startActivity(intent)
            true
        } catch (e: ActivityNotFoundException) {
            false
        }
    }
}
