package com.example.voicepay.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

/**
 * DAO = "Data Access Object": the queries we can run on the contacts table.
 * We only write the signatures; Room generates the code behind them at build time (that's
 * what the KSP plugin does).
 */
@Dao
interface ContactDao {

    // Returns a Flow: a live query that emits a fresh list every time the table changes,
    // so the UI updates by itself after an insert or delete (like a realtime subscription).
    @Query("SELECT * FROM contacts ORDER BY name COLLATE NOCASE")
    fun observeAll(): Flow<List<Contact>>

    // `suspend` = this function is async (like returning a Promise) and must not run on the
    // UI thread, so the screen doesn't freeze while the disk is written.
    @Insert
    suspend fun insert(contact: Contact)

    @Delete
    suspend fun delete(contact: Contact)
}
