// Show the galactic modal
function showSettingsModal(title, message) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalMessage").textContent = message;
    document.getElementById("settingsModal").style.display = "flex";
}

// Hide the galactic modal
function hideSettingsModal() {
    document.getElementById("settingsModal").style.display = "none";
}

// Save settings
function saveSettings() {
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    const soundEnabled = document.getElementById("soundToggle").checked;
    const musicEnabled = document.getElementById("musicToggle").checked;
    const settings = {
        difficulty,
        soundEnabled,
        musicEnabled
    };
    localStorage.setItem("galacticPulseSettings", JSON.stringify(settings));
    showSettingsModal("Settings Saved!", "Your settings have been saved successfully.");
}

// Show reset confirmation modal
function showResetModal() {
    showSettingsModal("Reset Settings?", "Are you sure you want to reset all settings to default?");
    // Override the OK button to perform reset
    document.querySelector(".confirm-btn").onclick = function() {
        resetSettings();
        hideSettingsModal();
    };
}

// Reset settings to default
function resetSettings() {
    document.getElementById("difficultyNormal").checked = true;
    document.getElementById("soundToggle").checked = true;
    document.getElementById("musicToggle").checked = true;
    saveSettings();
}

// Load settings
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem("galacticPulseSettings"));
    if (!settings) return;
    document.querySelector(`input[name="difficulty"][value="${settings.difficulty}"]`).checked = true;
    document.getElementById("soundToggle").checked = settings.soundEnabled;
    document.getElementById("musicToggle").checked = settings.musicEnabled;
}

// Run on page load
document.addEventListener("DOMContentLoaded", loadSettings);
