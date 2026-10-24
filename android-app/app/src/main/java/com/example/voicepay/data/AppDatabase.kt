package com.example.voicepay.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

/**
 * The app's SQLite database file (voicepay.db, private to this app on the phone).
 * `version` must go up whenever a table changes shape; we're still on the first version.
 */
@Database(entities = [Contact::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {

    abstract fun contactDao(): ContactDao

    // `companion object` holds static members. We keep a single shared database connection
    // (a singleton), like exporting one `db` instance from a module in Node.
    companion object {
        @Volatile private var instance: AppDatabase? = null

        fun get(context: Context): AppDatabase =
            instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "voicepay.db",
                ).build().also { instance = it }
            }
    }
}
