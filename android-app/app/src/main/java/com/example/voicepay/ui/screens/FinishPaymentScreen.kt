package com.example.voicepay.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.voicepay.data.Contact
import com.example.voicepay.payment.UpiApp
import com.example.voicepay.ui.theme.VoicePayTheme

/**
 * Shown while the user pays inside their UPI app: the steps to follow there, then
 * "Did you pay?" when they come back (the UPI app doesn't tell us the result).
 */
@Composable
fun FinishPaymentScreen(
    contact: Contact,
    amount: Int,
    app: UpiApp,
    onCopyUpiId: () -> Unit,
    onOpenAppAgain: () -> Unit,
    onUseAnotherApp: () -> Unit,
    onAnswer: (paid: Boolean) -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = MaterialTheme.colorScheme
    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text("Pay in ${app.name}", style = MaterialTheme.typography.headlineMedium)

        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = colors.surface),
        ) {
            Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Step(1, "Tap \"Pay to UPI ID\"")
                Step(2, "Paste the UPI ID (we copied it for you)") {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            contact.upiId,
                            style = MaterialTheme.typography.titleMedium,
                            color = colors.primary,
                            modifier = Modifier.weight(1f),
                        )
                        TextButton(onClick = onCopyUpiId) { Text("Copy") }
                    }
                }
                Step(3, "Type ₹$amount and enter your UPI PIN")
            }
        }

        FilledTonalButton(onClick = onOpenAppAgain, modifier = Modifier.fillMaxWidth().height(56.dp)) {
            Text("Open ${app.name} again", style = MaterialTheme.typography.titleMedium)
        }

        Spacer(Modifier.height(8.dp))
        Text("Did you pay ₹$amount to ${contact.name}?", style = MaterialTheme.typography.titleLarge)
        Button(
            onClick = { onAnswer(true) },
            shape = RoundedCornerShape(18.dp),
            modifier = Modifier.fillMaxWidth().height(64.dp),
        ) {
            Text("Yes, I paid", style = MaterialTheme.typography.titleMedium)
        }
        OutlinedButton(
            onClick = { onAnswer(false) },
            shape = RoundedCornerShape(18.dp),
            modifier = Modifier.fillMaxWidth().height(64.dp),
        ) {
            Text("No, I didn't pay", style = MaterialTheme.typography.titleMedium)
        }
        TextButton(onClick = onUseAnotherApp, modifier = Modifier.fillMaxWidth()) {
            Text("Use a different UPI app")
        }
    }
}

/** One numbered step. `extra` is optional content under the text (a trailing lambda). */
@Composable
private fun Step(number: Int, text: String, extra: (@Composable () -> Unit)? = null) {
    val colors = MaterialTheme.colorScheme
    Row(verticalAlignment = Alignment.Top) {
        Box(
            modifier = Modifier.size(32.dp).clip(CircleShape).background(colors.primaryContainer),
            contentAlignment = Alignment.Center,
        ) {
            Text("$number", style = MaterialTheme.typography.labelLarge, color = colors.onPrimaryContainer)
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f).padding(top = 4.dp)) {
            Text(text, style = MaterialTheme.typography.bodyLarge)
            extra?.invoke()
        }
    }
}

@Preview(showBackground = true)
@Composable
fun FinishPaymentScreenPreview() {
    VoicePayTheme {
        FinishPaymentScreen(
            contact = Contact("Ramesh", "ramesh@okaxis"),
            amount = 500,
            app = UpiApp("net.one97.paytm", "Paytm"),
            onCopyUpiId = {},
            onOpenAppAgain = {},
            onUseAnotherApp = {},
            onAnswer = {},
        )
    }
}
