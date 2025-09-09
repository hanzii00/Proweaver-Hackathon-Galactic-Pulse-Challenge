// scores.js

// Fetch scores from localStorage
function getScores() {
    let scores = localStorage.getItem("galacticPulseScores");
    return scores ? JSON.parse(scores) : [];
}

// Save scores back to localStorage
function saveScores(scores) {
    localStorage.setItem("galacticPulseScores", JSON.stringify(scores));
}

// Render scores on the leaderboard
function renderScores() {
    const scoresList = document.getElementById("scoresList");
    scoresList.innerHTML = "";

    let scores = getScores();
    scores.sort((a, b) => b.score - a.score);

    if (scores.length === 0) {
        scoresList.innerHTML = "<p class='empty'>No scores yet. Play to set a record!</p>";
        return;
    }

    scores.forEach((entry, index) => {
        const scoreItem = document.createElement("div");
        scoreItem.classList.add("score-item");
        scoreItem.innerHTML = `
            <span class="rank">#${index + 1}</span>
            <span class="name">${entry.name}</span>
            <span class="points">${entry.score}</span>
        `;
        scoresList.appendChild(scoreItem);
    });
}

// Clear all scores
function clearScores() {
    if (confirm("Are you sure you want to clear all scores?")) {
        localStorage.removeItem("galacticPulseScores");
        renderScores();
    }
}

// Add new score manually (optional)
function addScore(name, score) {
    let scores = getScores();
    scores.push({ name, score });
    saveScores(scores);
}

// Run on page load
document.addEventListener("DOMContentLoaded", renderScores);
