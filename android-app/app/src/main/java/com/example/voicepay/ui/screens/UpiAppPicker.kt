package com.example.voicepay.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.example.voicepay.R
import com.example.voicepay.payment.UpiApp
import com.example.voicepay.ui.components.Avatar

/** "Pay with…": a panel listing the UPI apps. The choice is remembered for next time. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UpiAppPickerSheet(
    apps: List<UpiApp>,
    // False when the phone wouldn't tell us which apps are installed, so we list them all.
    appsDetected: Boolean,
    selected: UpiApp?,
    onSelect: (UpiApp) -> Unit,
    onDismiss: () -> Unit,
) {
    val colors = MaterialTheme.colorScheme
    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier.padding(start = 20.dp, end = 20.dp, bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text("Pay with", style = MaterialTheme.typography.headlineSmall)
            Text(
                if (appsDetected) "Choose the app you use to pay. We'll remember it."
                else "Choose the app you use to pay. It must be installed on this phone.",
                style = MaterialTheme.typography.bodyMedium,
                color = colors.onSurfaceVariant,
            )
            apps.forEach { app ->
                Surface(
                    onClick = { onSelect(app) },
                    shape = RoundedCornerShape(18.dp),
                    color = if (app == selected) colors.primaryContainer else colors.surfaceVariant,
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                        Avatar(app.name, size = 44.dp)
                        Spacer(Modifier.width(14.dp))
                        Text(app.name, style = MaterialTheme.typography.titleMedium, modifier = Modifier.weight(1f))
                        if (app == selected) {
                            Icon(painterResource(R.drawable.ic_check), contentDescription = "Selected", tint = colors.primary)
                        }
                    }
                }
            }
        }
    }
}
