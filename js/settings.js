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
    alert("Settings saved!");
}

function resetSettings() {
    document.getElementById("difficultyNormal").checked = true;
    document.getElementById("soundToggle").checked = true;
    document.getElementById("musicToggle").checked = true;
    saveSettings();
    alert("Settings reset to default!");
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem("galacticPulseSettings"));
    if (!settings) return;

    document.querySelector(`input[name="difficulty"][value="${settings.difficulty}"]`).checked = true;
    document.getElementById("soundToggle").checked = settings.soundEnabled;
    document.getElementById("musicToggle").checked = settings.musicEnabled;
}

document.addEventListener("DOMContentLoaded", loadSettings);
