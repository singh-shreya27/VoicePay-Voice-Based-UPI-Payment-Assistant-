package com.example.voicepay.data

/** What happened when we looked up a spoken name in the saved contacts. */
sealed interface MatchResult {
    data class Found(val contact: Contact) : MatchResult
    /** Several contacts fit equally well (e.g. two "Ramesh"); the user must pick one. */
    data class Ambiguous(val candidates: List<Contact>) : MatchResult
    data object NotFound : MatchResult
}

/**
 * Finds the contact the user meant from the name the backend heard (romanized, e.g. "Ramesh ji").
 *
 * It tries stricter rules first and stops at the first rule that matches anyone:
 *  1. Same name, ignoring case, punctuation and titles like "ji" / "bhai" / "sir".
 *  2. Same name after evening out common spelling differences ("Preeti" = "Priti").
 *  3. Same first name ("Ramesh" = "Ramesh Kumar").
 *  4. Same consonants ("Mohammad" = "Mohammed").
 *
 * We deliberately don't allow "one letter off" matches: Ramesh / Rakesh / Rajesh are different
 * people, and this is a payment. The Confirm screen always shows the saved name and UPI ID too.
 *
 * An `object` is a single shared instance, like a module of exported functions in JavaScript.
 */
object ContactMatcher {

    // Words people add around a name that aren't part of it.
    private val TITLES = setOf(
        "ji", "jee", "bhai", "bhaiya", "bhaiyya", "bhaisahab", "didi", "di", "behen", "ben",
        "sir", "madam", "mam", "maam", "sahab", "saheb", "sahib", "uncle", "aunty", "auntie",
        "mr", "mrs", "ms", "shri", "shree", "sri", "smt", "dr", "anna", "akka",
    )

    fun match(spokenName: String, contacts: List<Contact>): MatchResult {
        if (normalize(spokenName).isEmpty()) return MatchResult.NotFound

        // Each rule turns a name into a "key"; two names match under a rule if their keys are equal.
        // `listOf<(String) -> String>` is a list of functions, like an array of arrow functions.
        val rules = listOf<(String) -> String>(
            { normalize(it) },
            { phonetic(normalize(it)) },
            { phonetic(normalize(it)).substringBefore(' ') },
            { consonants(phonetic(normalize(it))) },
        )
        for (rule in rules) {
            val key = rule(spokenName)
            if (key.isEmpty()) continue
            val matches = contacts.filter { rule(it.name) == key }
            when (matches.size) {
                0 -> continue
                1 -> return MatchResult.Found(matches.single())
                else -> return MatchResult.Ambiguous(matches)
            }
        }
        return MatchResult.NotFound
    }

    /** "  Ramesh-ji! " -> "ramesh": lowercase, letters only, titles removed, single spaces. */
    internal fun normalize(name: String): String {
        val words = name.lowercase()
            .replace(Regex("[^\\p{L}]+"), " ") // anything that isn't a letter becomes a space
            .split(' ')
            .filter { it.isNotBlank() }
        val withoutTitles = words.filter { it !in TITLES }
        // Keep the title if it's the whole name (someone saved as just "Didi").
        return (withoutTitles.ifEmpty { words }).joinToString(" ")
    }

    /** Evens out common ways of spelling the same Indian name in English letters. */
    internal fun phonetic(name: String): String {
        var s = name
        // Order matters: two-letter sounds first, then doubled letters.
        for ((from, to) in listOf(
            "ee" to "i", "oo" to "u", "ou" to "u",
            "ph" to "f", "bh" to "b", "dh" to "d", "gh" to "g", "kh" to "k", "th" to "t",
            "sh" to "s", "ch" to "c", "w" to "v", "z" to "j", "q" to "k", "ck" to "k",
        )) {
            s = s.replace(from, to)
        }
        // "Kishorr" -> "kisor", "Aakash" -> "akas": collapse repeated letters.
        s = s.replace(Regex("(\\p{L})\\1+"), "$1")
        // A trailing "h" is usually silent in spellings ("Sneh" / "Sne").
        return s.split(' ').joinToString(" ") { it.removeSuffix("h").ifEmpty { it } }
    }

    /** Keep the first letter, drop later vowels: "mohamad" -> "mhmd". */
    internal fun consonants(name: String): String =
        name.split(' ').joinToString(" ") { word ->
            word.take(1) + word.drop(1).filter { it !in "aeiouy" }
        }
}
