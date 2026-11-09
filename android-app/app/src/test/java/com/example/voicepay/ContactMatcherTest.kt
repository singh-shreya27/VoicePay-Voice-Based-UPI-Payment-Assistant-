package com.example.voicepay

import com.example.voicepay.data.Contact
import com.example.voicepay.data.ContactMatcher
import com.example.voicepay.data.MatchResult
import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Unit tests run on your computer, not the phone (like Jest): `./gradlew test`.
 * Each @Test function is one test case.
 */
class ContactMatcherTest {

    private val ramesh = Contact("Ramesh Kumar", "ramesh@okaxis")
    private val priti = Contact("Priti", "priti@ybl")
    private val mohammed = Contact("Mohammed", "mohammed@paytm")
    private val sunil = Contact("Sunil", "sunil@okicici")
    private val contacts = listOf(ramesh, priti, mohammed, sunil)

    private fun match(spoken: String, list: List<Contact> = contacts) = ContactMatcher.match(spoken, list)

    @Test fun exactNameIgnoringCase() =
        assertEquals(MatchResult.Found(ramesh), match("ramesh kumar"))

    @Test fun titleIsIgnored() =
        assertEquals(MatchResult.Found(sunil), match("Sunil ji"))

    @Test fun firstNameOnly() =
        assertEquals(MatchResult.Found(ramesh), match("Ramesh"))

    @Test fun spellingVariantVowels() =
        assertEquals(MatchResult.Found(priti), match("Preeti"))

    @Test fun spellingVariantConsonantsOnly() =
        assertEquals(MatchResult.Found(mohammed), match("Mohammad"))

    @Test fun oneLetterDifferentNameIsNotAMatch() {
        // Different people: must never be treated as the same name.
        assertEquals(MatchResult.NotFound, match("Rakesh"))
        assertEquals(MatchResult.NotFound, match("Sushil"))
    }

    @Test fun unknownName() =
        assertEquals(MatchResult.NotFound, match("Suresh"))

    @Test fun emptyName() =
        assertEquals(MatchResult.NotFound, match("  "))

    @Test fun twoPeopleWithSameFirstNameAreAmbiguous() {
        val rameshGupta = Contact("Ramesh Gupta", "rgupta@ybl")
        assertEquals(
            MatchResult.Ambiguous(listOf(ramesh, rameshGupta)),
            match("Ramesh", contacts + rameshGupta),
        )
    }

    @Test fun fullNameBeatsFirstNameWhenBothExist() {
        val rameshGupta = Contact("Ramesh Gupta", "rgupta@ybl")
        assertEquals(MatchResult.Found(rameshGupta), match("Ramesh Gupta", contacts + rameshGupta))
    }
}
