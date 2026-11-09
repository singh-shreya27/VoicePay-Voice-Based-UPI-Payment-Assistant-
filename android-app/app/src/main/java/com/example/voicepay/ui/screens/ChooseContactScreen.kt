package com.example.voicepay.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.voicepay.R
import com.example.voicepay.data.Contact
import com.example.voicepay.ui.components.Avatar
import com.example.voicepay.ui.theme.VoicePayTheme

/** Shown when the spoken name fits more than one contact: "Which Ramesh?" */
@Composable
fun ChooseContactScreen(
    spokenName: String,
    amount: Int,
    candidates: List<Contact>,
    onChoose: (Contact) -> Unit,
    onCancel: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = MaterialTheme.colorScheme
    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Which $spokenName?", style = MaterialTheme.typography.headlineMedium)
        Text(
            "Tap the person you want to pay ₹$amount",
            style = MaterialTheme.typography.bodyLarge,
            color = colors.onSurfaceVariant,
        )
        Spacer(Modifier.height(4.dp))

        candidates.forEach { contact ->
            Card(
                onClick = { onChoose(contact) },
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = colors.surface),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Avatar(contact.name, size = 52.dp)
                    Spacer(Modifier.width(14.dp))
                    Column(Modifier.weight(1f)) {
                        Text(contact.name, style = MaterialTheme.typography.titleLarge)
                        Text(contact.upiId, style = MaterialTheme.typography.bodyMedium, color = colors.onSurfaceVariant)
                    }
                    Icon(painterResource(R.drawable.ic_chevron_right), null, tint = colors.onSurfaceVariant)
                }
            }
        }

        TextButton(onClick = onCancel, modifier = Modifier.fillMaxWidth().height(56.dp)) {
            Text("Cancel", style = MaterialTheme.typography.titleMedium)
        }
    }
}

@Preview(showBackground = true)
@Composable
fun ChooseContactScreenPreview() {
    VoicePayTheme {
        ChooseContactScreen(
            spokenName = "Ramesh",
            amount = 500,
            candidates = listOf(Contact("Ramesh Kumar", "ramesh@okaxis"), Contact("Ramesh Gupta", "rgupta@ybl")),
            onChoose = {},
            onCancel = {},
        )
    }
}
