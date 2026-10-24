package com.example.voicepay.ui.screens

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.voicepay.R
import com.example.voicepay.data.Contact
import com.example.voicepay.ui.VoiceStatus
import com.example.voicepay.ui.components.Avatar
import com.example.voicepay.ui.components.IconBadge
import com.example.voicepay.ui.theme.MicGradient
import com.example.voicepay.ui.theme.VoicePayTheme

/**
 * The one main screen: speak button, language and contacts all together.
 * The mic only works once a language is chosen and at least one contact exists;
 * until then a "Get started" checklist tells the user what's missing.
 */
@Composable
fun HomeScreen(
    language: Language?,
    contacts: List<Contact>,
    isLoaded: Boolean,
    voiceStatus: VoiceStatus,
    recordingSeconds: Int,
    isSlow: Boolean,
    reply: String?,
    error: String?,
    onHearReplyAgain: () -> Unit,
    onMicClick: () -> Unit,
    onLanguageClick: () -> Unit,
    onAddContactClick: () -> Unit,
    onDeleteContact: (Contact) -> Unit,
    modifier: Modifier = Modifier,
) {
    val isReady = language != null && contacts.isNotEmpty()
    // Which contact the "Remove?" dialog is asking about (null = dialog closed). This is purely a
    // UI detail, so it lives here with `remember` instead of in the ViewModel.
    var contactToDelete by remember { mutableStateOf<Contact?>(null) }

    // verticalScroll makes the column scroll when it's taller than the screen (overflow-y: auto).
    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Header()

        if (isLoaded && !isReady) {
            SetupCard(
                hasLanguage = language != null,
                hasContacts = contacts.isNotEmpty(),
                onLanguageClick = onLanguageClick,
                onAddContactClick = onAddContactClick,
            )
        }

        if (voiceStatus == VoiceStatus.Idle) {
            error?.let { ErrorCard(it) }
            reply?.let { ReplyCard(it, onHearAgain = onHearReplyAgain) }
        }

        MicSection(enabled = isReady, status = voiceStatus, seconds = recordingSeconds, isSlow = isSlow, onClick = onMicClick)

        LanguageCard(language = language, onClick = onLanguageClick)

        ContactsCard(
            contacts = contacts,
            onAddClick = onAddContactClick,
            onDeleteClick = { contactToDelete = it },
        )
    }

    // `?.let { }` runs the block only when the value isn't null, like `contactToDelete && <Dialog/>`.
    contactToDelete?.let { contact ->
        AlertDialog(
            onDismissRequest = { contactToDelete = null },
            title = { Text("Remove ${contact.name}?") },
            text = { Text("You can add them again later.") },
            confirmButton = {
                TextButton(onClick = {
                    onDeleteContact(contact)
                    contactToDelete = null
                }) { Text("Remove", color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = {
                TextButton(onClick = { contactToDelete = null }) { Text("Keep") }
            },
        )
    }
}

@Composable
private fun Header() {
    Column {
        Text("VoicePay", style = MaterialTheme.typography.headlineLarge)
        Text(
            "Pay anyone, just by saying it",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun SetupCard(
    hasLanguage: Boolean,
    hasContacts: Boolean,
    onLanguageClick: () -> Unit,
    onAddContactClick: () -> Unit,
) {
    val colors = MaterialTheme.colorScheme
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = colors.tertiaryContainer),
    ) {
        Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(painterResource(R.drawable.ic_info), null, tint = colors.onTertiaryContainer)
                Spacer(Modifier.width(8.dp))
                Text(
                    "Get started in 2 steps",
                    style = MaterialTheme.typography.titleMedium,
                    color = colors.onTertiaryContainer,
                )
            }
            SetupStep(number = 1, text = "Choose your language", done = hasLanguage, onClick = onLanguageClick)
            SetupStep(number = 2, text = "Add a contact to pay", done = hasContacts, onClick = onAddContactClick)
        }
    }
}

@Composable
private fun SetupStep(number: Int, text: String, done: Boolean, onClick: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    Surface(
        onClick = onClick,
        enabled = !done,
        shape = RoundedCornerShape(16.dp),
        color = colors.surface,
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(if (done) colors.secondary else colors.surfaceVariant),
                contentAlignment = Alignment.Center,
            ) {
                if (done) {
                    Icon(painterResource(R.drawable.ic_check), null, tint = colors.onSecondary, modifier = Modifier.size(20.dp))
                } else {
                    Text("$number", style = MaterialTheme.typography.labelLarge)
                }
            }
            Spacer(Modifier.width(12.dp))
            Text(
                text,
                style = MaterialTheme.typography.bodyLarge,
                color = if (done) colors.onSurfaceVariant else colors.onSurface,
                modifier = Modifier.weight(1f),
            )
            if (!done) {
                Icon(painterResource(R.drawable.ic_chevron_right), null, tint = colors.onSurfaceVariant)
            }
        }
    }
}

@Composable
private fun MicSection(enabled: Boolean, status: VoiceStatus, seconds: Int, isSlow: Boolean, onClick: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    // A Brush paints a gradient, like `background: linear-gradient(...)` in CSS.
    val micBackground = if (enabled) Brush.linearGradient(MicGradient) else Brush.linearGradient(
        listOf(colors.surfaceVariant, colors.surfaceVariant)
    )

    // While listening, the outer ring grows and shrinks forever, like a CSS `animation: pulse
    // infinite alternate`. The value goes 1.0 → 1.15 → 1.0 ... and we use it as a scale.
    val pulse = rememberInfiniteTransition(label = "pulse")
    val ringScale by pulse.animateFloat(
        initialValue = 1f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(tween(700), RepeatMode.Reverse),
        label = "ringScale",
    )
    val isListening = status == VoiceStatus.Listening

    Column(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        // Two stacked circles: a soft outer ring and the solid button in the middle.
        Box(modifier = Modifier.size(240.dp), contentAlignment = Alignment.Center) {
            Box(
                modifier = Modifier
                    .size(212.dp)
                    .scale(if (isListening) ringScale else 1f)
                    .clip(CircleShape)
                    .background(
                        when {
                            isListening -> colors.primary.copy(alpha = 0.22f)
                            enabled -> colors.primary.copy(alpha = 0.12f)
                            else -> Color.Transparent
                        }
                    ),
            )
            Box(
                modifier = Modifier
                    .size(164.dp)
                    .clip(CircleShape)
                    .background(micBackground)
                    .clickable(enabled = enabled && status != VoiceStatus.Thinking, onClick = onClick),
                contentAlignment = Alignment.Center,
            ) {
                when (status) {
                    VoiceStatus.Thinking -> CircularProgressIndicator(
                        color = Color.White,
                        strokeWidth = 5.dp,
                        modifier = Modifier.size(64.dp),
                    )
                    else -> Icon(
                        painterResource(if (isListening) R.drawable.ic_stop else R.drawable.ic_mic),
                        contentDescription = if (isListening) "Stop listening" else "Speak to pay",
                        tint = if (enabled) Color.White else colors.onSurfaceVariant,
                        modifier = Modifier.size(72.dp),
                    )
                }
            }
        }
        Spacer(Modifier.height(4.dp))
        Text(
            when {
                !enabled -> "Finish the steps above to start"
                status == VoiceStatus.Listening -> "Listening… 0:%02d".format(seconds)
                status == VoiceStatus.Thinking -> "Understanding…"
                else -> "Tap and speak"
            },
            style = MaterialTheme.typography.titleLarge,
            textAlign = TextAlign.Center,
        )
        when {
            enabled && status == VoiceStatus.Idle -> Text(
                "\u201CPay 500 rupees to Ramesh\u201D",
                style = MaterialTheme.typography.bodyLarge,
                color = colors.onSurfaceVariant,
            )
            status == VoiceStatus.Listening -> Text(
                "Tap again when you finish speaking",
                style = MaterialTheme.typography.bodyLarge,
                color = colors.onSurfaceVariant,
            )
            status == VoiceStatus.Thinking && isSlow -> Text(
                "Waking up the server, this can take up to a minute",
                style = MaterialTheme.typography.bodyLarge,
                color = colors.onSurfaceVariant,
                textAlign = TextAlign.Center,
            )
        }
    }
}

/**
 * The backend's spoken answer when it needs more, e.g. "How much should I send to Ramesh?".
 * Tapping the card plays it again.
 */
@Composable
private fun ReplyCard(text: String, onHearAgain: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    Card(
        onClick = onHearAgain,
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = colors.primaryContainer),
    ) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(painterResource(R.drawable.ic_volume), contentDescription = "Hear again", tint = colors.onPrimaryContainer)
            Spacer(Modifier.width(12.dp))
            Text(text, style = MaterialTheme.typography.bodyLarge, color = colors.onPrimaryContainer)
        }
    }
}

/** A problem the user has to fix or retry (no internet, server error…). */
@Composable
private fun ErrorCard(text: String) {
    val colors = MaterialTheme.colorScheme
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = colors.errorContainer),
    ) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(painterResource(R.drawable.ic_info), null, tint = colors.onErrorContainer)
            Spacer(Modifier.width(12.dp))
            Text(text, style = MaterialTheme.typography.bodyLarge, color = colors.onErrorContainer)
        }
    }
}

@Composable
private fun LanguageCard(language: Language?, onClick: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    Card(
        onClick = onClick,
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = colors.surface),
    ) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            IconBadge(R.drawable.ic_language, background = colors.primaryContainer, tint = colors.onPrimaryContainer)
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text("Language", style = MaterialTheme.typography.bodyMedium, color = colors.onSurfaceVariant)
                Text(
                    language?.let { "${it.label} · ${it.englishName}" } ?: "Not chosen yet",
                    style = MaterialTheme.typography.titleMedium,
                )
            }
            Text("Change", style = MaterialTheme.typography.labelLarge, color = colors.primary)
        }
    }
}

@Composable
private fun ContactsCard(contacts: List<Contact>, onAddClick: () -> Unit, onDeleteClick: (Contact) -> Unit) {
    val colors = MaterialTheme.colorScheme
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = colors.surface),
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconBadge(R.drawable.ic_people, background = colors.secondaryContainer, tint = colors.onSecondaryContainer)
                Spacer(Modifier.width(14.dp))
                Column(Modifier.weight(1f)) {
                    Text("Contacts", style = MaterialTheme.typography.titleMedium)
                    Text(
                        if (contacts.isEmpty()) "No one added yet" else "${contacts.size} saved",
                        style = MaterialTheme.typography.bodyMedium,
                        color = colors.onSurfaceVariant,
                    )
                }
                FilledTonalButton(onClick = onAddClick) {
                    Icon(painterResource(R.drawable.ic_add), null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Add")
                }
            }

            if (contacts.isEmpty()) {
                Text(
                    "Add the people you pay often, with their UPI ID.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.onSurfaceVariant,
                    modifier = Modifier.padding(top = 12.dp),
                )
            }

            // forEachIndexed is a for-loop that also gives the index, like array.forEach((c, i) => ...).
            contacts.forEachIndexed { index, contact ->
                if (index == 0) Spacer(Modifier.height(8.dp)) else HorizontalDivider(color = colors.surfaceVariant)
                ContactRow(contact, onDeleteClick = { onDeleteClick(contact) })
            }
        }
    }
}

@Composable
private fun ContactRow(contact: Contact, onDeleteClick: () -> Unit) {
    Row(Modifier.padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
        Avatar(contact.name, size = 44.dp)
        Spacer(Modifier.width(14.dp))
        Column(Modifier.weight(1f)) {
            Text(contact.name, style = MaterialTheme.typography.titleMedium)
            Text(
                contact.upiId,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        IconButton(onClick = onDeleteClick) {
            Icon(
                painterResource(R.drawable.ic_delete),
                contentDescription = "Remove ${contact.name}",
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Preview(showBackground = true, name = "Not set up yet")
@Composable
fun HomeScreenEmptyPreview() {
    VoicePayTheme {
        HomeScreen(
            language = null,
            contacts = emptyList(),
            isLoaded = true,
            voiceStatus = VoiceStatus.Idle,
            recordingSeconds = 0,
            isSlow = false,
            reply = null,
            error = null,
            onHearReplyAgain = {},
            onMicClick = {},
            onLanguageClick = {},
            onAddContactClick = {},
            onDeleteContact = {},
        )
    }
}

@Preview(showBackground = true, name = "Ready")
@Composable
fun HomeScreenReadyPreview() {
    VoicePayTheme {
        HomeScreen(
            language = LANGUAGES.first(),
            contacts = listOf(Contact("Ramesh", "ramesh@okaxis"), Contact("Sunita", "sunita@ybl")),
            isLoaded = true,
            voiceStatus = VoiceStatus.Idle,
            recordingSeconds = 0,
            isSlow = false,
            reply = null,
            error = null,
            onHearReplyAgain = {},
            onMicClick = {},
            onLanguageClick = {},
            onAddContactClick = {},
            onDeleteContact = {},
        )
    }
}
