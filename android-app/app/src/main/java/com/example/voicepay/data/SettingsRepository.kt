package com.example.voicepay.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

// One small key-value file on the phone ("settings"), created on first use. This line adds a
// `dataStore` property to every Context; `by` hands the work to the library, which makes sure
// there's only ever one instance.
private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

/**
 * The user's settings, saved on the phone. DataStore is Android's version of `localStorage`,
 * except reads are live (a Flow that emits on every change) and writes are async.
 * A database (Room) would be overkill for a single value like this.
 */
class SettingsRepository(context: Context) {

    private val dataStore = context.applicationContext.dataStore

    // Keys are typed: this one always holds a String.
    private val languageCodeKey = stringPreferencesKey("language_code")

    /** The saved language code such as "hi-IN", or null if the user hasn't picked one yet. */
    val languageCode: Flow<String?> = dataStore.data.map { prefs -> prefs[languageCodeKey] }

    suspend fun setLanguageCode(code: String) {
        dataStore.edit { prefs -> prefs[languageCodeKey] = code }
    }

    // The UPI app the user pays with, by package name (e.g. "net.one97.paytm"), or null.
    private val upiAppKey = stringPreferencesKey("upi_app")

    val upiAppPackage: Flow<String?> = dataStore.data.map { prefs -> prefs[upiAppKey] }

    suspend fun setUpiAppPackage(packageName: String) {
        dataStore.edit { prefs -> prefs[upiAppKey] = packageName }
    }
}
