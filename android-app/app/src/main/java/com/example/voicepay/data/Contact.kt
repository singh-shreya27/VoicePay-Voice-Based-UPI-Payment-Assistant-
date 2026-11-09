package com.example.voicepay.data

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * A saved payee, stored as one row in the `contacts` table on the phone.
 * `@Entity` tells Room "make a database table from this class", like a model in an ORM
 * (Prisma / Sequelize). Each property becomes a column.
 */
@Entity(tableName = "contacts")
data class Contact(
    val name: String,
    val upiId: String,
    // 0 means "not saved yet": Room picks the next free id on insert (auto-increment).
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
)
