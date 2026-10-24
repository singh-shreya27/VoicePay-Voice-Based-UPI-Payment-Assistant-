package com.example.voicepay.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

// The languages the backend's speech-to-text accepts, shown in their own script.
// `code` is the value we'll send to /pay as `language_code`.
data class Language(val code: String, val label: String, val englishName: String)

val LANGUAGES = listOf(
    Language("hi-IN", "हिन्दी", "Hindi"),
    Language("en-IN", "English", "English"),
    Language("bn-IN", "বাংলা", "Bengali"),
    Language("gu-IN", "ગુજરાતી", "Gujarati"),
    Language("kn-IN", "ಕನ್ನಡ", "Kannada"),
    Language("ml-IN", "മലയാളം", "Malayalam"),
    Language("mr-IN", "मराठी", "Marathi"),
    Language("pa-IN", "ਪੰਜਾਬੀ", "Punjabi"),
    Language("ta-IN", "தமிழ்", "Tamil"),
    Language("te-IN", "తెలుగు", "Telugu"),
)

/**
 * A panel that slides up from the bottom with a 2-column grid of languages.
 * `@OptIn` is needed because Material marks bottom sheets as "experimental" (API may still change).
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LanguagePickerSheet(
    selected: Language?,
    onSelect: (Language) -> Unit,
    onDismiss: () -> Unit,
) {
    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(Modifier.padding(horizontal = 20.dp)) {
            Text("Choose your language", style = MaterialTheme.typography.headlineSmall)
            Text(
                "Speak to the app in this language",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.padding(top = 20.dp, bottom = 32.dp),
            ) {
                items(LANGUAGES) { language ->
                    LanguageTile(
                        language = language,
                        isSelected = language == selected,
                        onClick = { onSelect(language) },
                    )
                }
            }
        }
    }
}

@Composable
private fun LanguageTile(language: Language, isSelected: Boolean, onClick: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(18.dp),
        color = if (isSelected) colors.primaryContainer else colors.surfaceVariant,
        border = if (isSelected) BorderStroke(2.dp, colors.primary) else null,
        modifier = Modifier.fillMaxWidth().height(84.dp),
    ) {
        Box(contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(language.label, style = MaterialTheme.typography.titleLarge)
                Text(
                    language.englishName,
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.onSurfaceVariant,
                )
            }
        }
    }
}
