package com.example.voicepay.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.voicepay.R
import com.example.voicepay.ui.components.Avatar
import com.example.voicepay.ui.theme.VoicePayTheme

@Composable
fun ConfirmScreen(
    payeeName: String,
    upiId: String,
    amount: Int,
    onConfirm: () -> Unit,
    onHearAgain: () -> Unit,
    onCancel: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = MaterialTheme.colorScheme
    Column(
        modifier = modifier.fillMaxSize().padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(Modifier.weight(1f))

        Card(
            shape = RoundedCornerShape(28.dp),
            colors = CardDefaults.cardColors(containerColor = colors.surface),
            modifier = Modifier.fillMaxWidth(),
        ) {
            Column(
                modifier = Modifier.fillMaxWidth().padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text("You are paying", style = MaterialTheme.typography.bodyLarge, color = colors.onSurfaceVariant)
                Spacer(Modifier.height(20.dp))
                Avatar(payeeName, size = 80.dp)
                Spacer(Modifier.height(12.dp))
                Text(payeeName, style = MaterialTheme.typography.headlineMedium)
                // A pill-shaped label, like a CSS badge with border-radius: 999px.
                Surface(shape = RoundedCornerShape(50), color = colors.surfaceVariant) {
                    Text(
                        upiId,
                        style = MaterialTheme.typography.bodyMedium,
                        color = colors.onSurfaceVariant,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                    )
                }
                Spacer(Modifier.height(24.dp))
                Text("₹$amount", style = MaterialTheme.typography.displayLarge, color = colors.primary)
                Spacer(Modifier.height(8.dp))
                FilledTonalButton(onClick = onHearAgain) {
                    Icon(painterResource(R.drawable.ic_volume), null, modifier = Modifier.size(20.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Hear again")
                }
            }
        }

        Spacer(Modifier.height(16.dp))
        Text(
            "You will enter your UPI PIN in your payment app.",
            style = MaterialTheme.typography.bodyMedium,
            color = colors.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )

        Spacer(Modifier.weight(1f))

        Button(
            onClick = onConfirm,
            shape = RoundedCornerShape(18.dp),
            modifier = Modifier.fillMaxWidth().height(64.dp),
        ) {
            Text("Confirm & pay ₹$amount", style = MaterialTheme.typography.titleMedium)
        }
        TextButton(onClick = onCancel, modifier = Modifier.fillMaxWidth().height(56.dp)) {
            Text("Cancel", style = MaterialTheme.typography.titleMedium)
        }
    }
}

@Preview(showBackground = true)
@Composable
fun ConfirmScreenPreview() {
    VoicePayTheme {
        ConfirmScreen(
            payeeName = "Ramesh",
            upiId = "ramesh@okaxis",
            amount = 500,
            onConfirm = {},
            onHearAgain = {},
            onCancel = {},
        )
    }
}
