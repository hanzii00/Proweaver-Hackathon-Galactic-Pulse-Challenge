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
        let rankClass = "";
        if (index === 0) rankClass = "gold";
        else if (index === 1) rankClass = "silver";
        else if (index === 2) rankClass = "bronze";
        scoreItem.innerHTML = `
            <span class="score-rank ${rankClass}">#${index + 1}</span>
            <span class="score-name">${entry.name}</span>
            <span class="score-value">${entry.score}</span>
        `;
        scoresList.appendChild(scoreItem);
    });
}

// Show the galactic modal
function showClearScoresModal() {
    document.getElementById("clearScoresModal").style.display = "flex";
}

// Hide the galactic modal
function hideClearScoresModal() {
    document.getElementById("clearScoresModal").style.display = "none";
}

// Clear all scores
function clearScores() {
    localStorage.removeItem("galacticPulseScores");
    renderScores();
    hideClearScoresModal();
}

// Run on page load
document.addEventListener("DOMContentLoaded", renderScores);
