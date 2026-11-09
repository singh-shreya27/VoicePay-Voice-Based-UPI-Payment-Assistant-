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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.voicepay.R
import com.example.voicepay.ui.components.Avatar
import com.example.voicepay.ui.theme.VoicePayTheme

@Composable
fun AddContactScreen(
    initialName: String,
    onSave: (name: String, upiId: String) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // Controlled inputs, like `const [name, setName] = useState(initialName)` in React.
    var name by remember { mutableStateOf(initialName) }
    var upiId by remember { mutableStateOf("") }
    // A UPI ID always has the form something@bank.
    val canSave = name.isNotBlank() && "@" in upiId && !upiId.endsWith("@")
    val fieldShape = RoundedCornerShape(16.dp)

    Column(modifier = modifier.fillMaxSize().padding(horizontal = 20.dp, vertical = 8.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) {
                Icon(painterResource(R.drawable.ic_arrow_back), contentDescription = "Back")
            }
            Spacer(Modifier.width(4.dp))
            Text("New contact", style = MaterialTheme.typography.headlineSmall)
        }

        Column(
            modifier = Modifier.fillMaxWidth().padding(vertical = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            // The avatar updates live as the name is typed.
            Avatar(name.ifBlank { "?" }, size = 88.dp)
        }

        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Name") },
                placeholder = { Text("e.g. Ramesh") },
                singleLine = true,
                shape = fieldShape,
                keyboardOptions = KeyboardOptions(
                    capitalization = KeyboardCapitalization.Words,
                    imeAction = ImeAction.Next,
                ),
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = upiId,
                onValueChange = { upiId = it.trim() },
                label = { Text("UPI ID") },
                placeholder = { Text("e.g. ramesh@okaxis") },
                supportingText = { Text("Find it in their GPay / PhonePe / Paytm profile") },
                singleLine = true,
                shape = fieldShape,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Done),
                modifier = Modifier.fillMaxWidth(),
            )
        }

        Spacer(Modifier.weight(1f))

        Button(
            onClick = { onSave(name.trim(), upiId) },
            enabled = canSave,
            shape = RoundedCornerShape(18.dp),
            modifier = Modifier.fillMaxWidth().height(60.dp),
        ) {
            Text("Save contact", style = MaterialTheme.typography.titleMedium)
        }
        Spacer(Modifier.height(8.dp))
    }
}

@Preview(showBackground = true)
@Composable
fun AddContactScreenPreview() {
    VoicePayTheme {
        AddContactScreen(initialName = "Ramesh", onSave = { _, _ -> }, onBack = {})
    }
}
