package com.example.voicepay

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.voicepay.ui.Screen
import com.example.voicepay.ui.VoicePayViewModel
import com.example.voicepay.ui.VoiceStatus
import com.example.voicepay.ui.screens.AddContactScreen
import com.example.voicepay.ui.screens.ChooseContactScreen
import com.example.voicepay.ui.screens.ConfirmScreen
import com.example.voicepay.ui.screens.FinishPaymentScreen
import com.example.voicepay.ui.screens.HomeScreen
import com.example.voicepay.ui.screens.LanguagePickerSheet
import com.example.voicepay.ui.screens.ResultScreen
import com.example.voicepay.ui.screens.UpiAppPickerSheet
import com.example.voicepay.ui.theme.VoicePayTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            VoicePayTheme {
                VoicePayApp()
            }
        }
    }
}

@Composable
fun VoicePayApp(
    // viewModel() returns the same ViewModel every time, even after the phone is rotated.
    viewModel: VoicePayViewModel = viewModel(),
) {
    // Subscribe to the state: whenever the ViewModel emits a new UiState, this function redraws,
    // like `const state = useSelector(s => s)` in Redux.
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // Show the ViewModel's one-time messages. LaunchedEffect runs its block whenever the key
    // (state.message) changes, like useEffect(() => {...}, [message]).
    // Clear the message only *after* the snackbar closes: clearing it first changes the key,
    // which cancels this effect, and the snackbar would never appear.
    LaunchedEffect(state.message) {
        val message = state.message ?: return@LaunchedEffect
        snackbarHostState.showSnackbar(message)
        viewModel.messageShown()
    }

    // Asking for the microphone uses the Activity Result API: we register a "launcher" up front,
    // launch it later, and Android calls us back with the user's answer (Allow / Don't allow).
    val micPermission = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            viewModel.onMicClick()
        } else {
            scope.launch {
                val result = snackbarHostState.showSnackbar(
                    message = "VoicePay needs the microphone to hear you",
                    actionLabel = "Settings",
                )
                // If Android stops showing the permission popup (after repeated "Don't allow"),
                // the only way left is the app's page in the phone's Settings.
                if (result == SnackbarResult.ActionPerformed) {
                    context.startActivity(
                        Intent(
                            Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                            Uri.fromParts("package", context.packageName, null),
                        )
                    )
                }
            }
        }
    }

    // Each time VoicePay comes back on screen (e.g. from the UPI app), tell the ViewModel.
    // Like listening for `visibilitychange` in a browser.
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { viewModel.onAppResumed() }

    fun onMicClick() {
        val hasPermission = ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) ==
            PackageManager.PERMISSION_GRANTED
        // Only starting needs the permission; stopping a recording never does.
        if (hasPermission || state.voiceStatus != VoiceStatus.Idle) {
            viewModel.onMicClick()
        } else {
            micPermission.launch(Manifest.permission.RECORD_AUDIO)
        }
    }

    // The phone's back button/gesture returns to Home instead of closing the app.
    BackHandler(enabled = state.screen != Screen.Home) { viewModel.goHome() }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { innerPadding ->
        val modifier = Modifier.padding(innerPadding)

        // `when` is Kotlin's switch. Because Screen is sealed, Kotlin checks every case is handled.
        when (val screen = state.screen) {
            Screen.Home -> HomeScreen(
                language = state.language,
                contacts = state.contacts,
                isLoaded = state.isLoaded,
                voiceStatus = state.voiceStatus,
                recordingSeconds = state.recordingSeconds,
                isSlow = state.isSlow,
                reply = state.reply,
                error = state.error,
                onHearReplyAgain = viewModel::replayReply,
                onMicClick = ::onMicClick,
                onLanguageClick = viewModel::openLanguagePicker,
                onAddContactClick = { viewModel.openAddContact() },
                onDeleteContact = viewModel::deleteContact,
                modifier = modifier,
            )
            is Screen.Confirm -> ConfirmScreen(
                payeeName = screen.contact.name,
                upiId = screen.contact.upiId,
                amount = screen.amount,
                onConfirm = viewModel::confirmPayment,
                onHearAgain = viewModel::replayReply,
                onCancel = viewModel::goHome,
                modifier = modifier,
            )
            is Screen.ChooseContact -> ChooseContactScreen(
                spokenName = screen.spokenName,
                amount = screen.amount,
                candidates = screen.candidates,
                onChoose = viewModel::chooseContact,
                onCancel = viewModel::goHome,
                modifier = modifier,
            )
            is Screen.AddContact -> AddContactScreen(
                initialName = screen.prefillName,
                onSave = viewModel::saveContact,
                onBack = viewModel::goHome,
                modifier = modifier,
            )
            is Screen.FinishPayment -> FinishPaymentScreen(
                contact = screen.contact,
                amount = screen.amount,
                app = screen.app,
                onCopyUpiId = { viewModel.copyUpiId(screen.contact) },
                onOpenAppAgain = viewModel::openUpiAppAgain,
                onUseAnotherApp = viewModel::openUpiAppPicker,
                onAnswer = viewModel::answerPaid,
                modifier = modifier,
            )
            is Screen.Result -> ResultScreen(
                kind = screen.kind,
                message = screen.message,
                onDone = viewModel::goHome,
                modifier = modifier,
            )
        }
    }

    if (state.showUpiAppPicker) {
        UpiAppPickerSheet(
            apps = state.upiAppChoices,
            appsDetected = state.upiAppsDetected,
            selected = state.upiApp,
            onSelect = viewModel::selectUpiApp,
            onDismiss = viewModel::closeUpiAppPicker,
        )
    }

    if (state.showLanguagePicker) {
        LanguagePickerSheet(
            selected = state.language,
            onSelect = viewModel::selectLanguage,
            onDismiss = viewModel::closeLanguagePicker,
        )
    }
}
