// settings.js

// Default settings
const defaultSettings = {
    difficulty: "normal",
    sound: true,
    music: true
};

// Load settings from localStorage or defaults
function loadSettings() {
    const savedSettings = JSON.parse(localStorage.getItem("gameSettings")) || defaultSettings;

    // Set difficulty
    document.getElementById("difficultyEasy").checked = savedSettings.difficulty === "easy";
    document.getElementById("difficultyNormal").checked = savedSettings.difficulty === "normal";
    document.getElementById("difficultyHard").checked = savedSettings.difficulty === "hard";

    // Set audio toggles
    document.getElementById("soundToggle").checked = savedSettings.sound;
    document.getElementById("musicToggle").checked = savedSettings.music;
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        difficulty: document.querySelector('input[name="difficulty"]:checked').value,
        sound: document.getElementById("soundToggle").checked,
        music: document.getElementById("musicToggle").checked
    };

    localStorage.setItem("gameSettings", JSON.stringify(settings));
    alert("Settings saved!");
}

// Reset to default
function resetSettings() {
    localStorage.removeItem("gameSettings");
    loadSettings();
    alert("Settings reset to default!");
}

// Initialize settings when the page loads
window.onload = loadSettings;
