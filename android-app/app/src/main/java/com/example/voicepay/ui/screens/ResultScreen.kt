package com.example.voicepay.ui.screens

import androidx.annotation.DrawableRes
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.voicepay.R
import com.example.voicepay.ui.theme.VoicePayTheme

// An enum is a fixed set of named values, like a TypeScript union "success" | "failed".
enum class ResultKind(@param:DrawableRes val icon: Int, val title: String) {
    Success(R.drawable.ic_check, "Payment successful"),
    Failed(R.drawable.ic_close, "Payment failed"),
}

@Composable
fun ResultScreen(
    kind: ResultKind,
    message: String,
    onDone: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = MaterialTheme.colorScheme
    // Pick the badge colours per result: teal for success, red for failure.
    val (badgeBackground, badgeTint) = when (kind) {
        ResultKind.Success -> colors.secondary to colors.onSecondary
        ResultKind.Failed -> colors.error to colors.onError
    }

    Column(
        modifier = modifier.fillMaxSize().padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(Modifier.weight(1f))
        Box(
            modifier = Modifier.size(150.dp).clip(CircleShape).background(badgeBackground.copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center,
        ) {
            Box(
                modifier = Modifier.size(104.dp).clip(CircleShape).background(badgeBackground),
                contentAlignment = Alignment.Center,
            ) {
                Icon(painterResource(kind.icon), contentDescription = null, tint = badgeTint, modifier = Modifier.size(56.dp))
            }
        }
        Spacer(Modifier.height(28.dp))
        Text(kind.title, style = MaterialTheme.typography.headlineMedium, textAlign = TextAlign.Center)
        Spacer(Modifier.height(8.dp))
        Text(
            message,
            style = MaterialTheme.typography.bodyLarge,
            color = colors.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.weight(1f))
        Button(
            onClick = onDone,
            shape = RoundedCornerShape(18.dp),
            modifier = Modifier.fillMaxWidth().height(64.dp),
        ) {
            Text(if (kind == ResultKind.Success) "Done" else "Back to home", style = MaterialTheme.typography.titleMedium)
        }
    }
}

@Preview(showBackground = true)
@Composable
fun ResultScreenPreview() {
    VoicePayTheme {
        ResultScreen(kind = ResultKind.Success, message = "₹500 sent to Ramesh", onDone = {})
    }
}
