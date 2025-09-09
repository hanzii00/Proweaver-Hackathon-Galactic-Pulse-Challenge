// main.js - Username entry with persistent score saving + leaderboard sync

let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeStarfield();
    initializeUsernameEntry();
    
    // Check if user already exists in localStorage
    const savedUser = getCurrentUser();
    if (savedUser) {
        showMainMenu(savedUser.username);
    }
});


function initializeStarfield() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;
    
    for (let i = 0; i < 100; i++) {
        createStar(starfield);
    }
}

function createStar(container) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    const size = Math.random() * 3 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.animationDelay = Math.random() * 2 + 's';
    container.appendChild(star);
}


function initializeUsernameEntry() {
    const usernameInput = document.getElementById('usernameInput');
    const enterBtn = document.getElementById('enterBtn');
    
    if (!usernameInput || !enterBtn) return;
    
    usernameInput.focus();
    usernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            enterGame();
        }
    });
    usernameInput.addEventListener('input', validateUsername);
    validateUsername();
}

function validateUsername() {
    const usernameInput = document.getElementById('usernameInput');
    const enterBtn = document.getElementById('enterBtn');
    if (!usernameInput || !enterBtn) return;
    
    const username = usernameInput.value.trim();
    if (username.length >= 2) {
        enterBtn.disabled = false;
        enterBtn.style.opacity = '1';
        usernameInput.style.borderColor = 'var(--success-neon)';
    } else {
        enterBtn.disabled = true;
        enterBtn.style.opacity = '0.5';
        usernameInput.style.borderColor = 'var(--border-glow)';
    }
}

function enterGame() {
    const usernameInput = document.getElementById('usernameInput');
    if (!usernameInput) return;
    
    const username = usernameInput.value.trim();
    if (username.length < 2) {
        usernameInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => { usernameInput.style.animation = ''; }, 500);
        return;
    }
    
    saveCurrentUser(username);
    showMainMenu(username);
}

function showMainMenu(username) {
    const usernameScreen = document.getElementById('usernameScreen');
    const mainMenuScreen = document.getElementById('mainMenuScreen');
    const pilotName = document.getElementById('pilotName');
    if (!usernameScreen || !mainMenuScreen || !pilotName) return;
    
    pilotName.textContent = username;
    currentUser = username;
    
    usernameScreen.classList.add('fade-out');
    setTimeout(() => {
        usernameScreen.classList.add('hidden');
        mainMenuScreen.classList.remove('hidden');
        mainMenuScreen.classList.add('fade-in');
    }, 500);
}

function changePilot() {
    const usernameScreen = document.getElementById('usernameScreen');
    const mainMenuScreen = document.getElementById('mainMenuScreen');
    const usernameInput = document.getElementById('usernameInput');
    if (!usernameScreen || !mainMenuScreen || !usernameInput) return;
    
    clearCurrentUser();
    mainMenuScreen.classList.add('fade-out');
    
    setTimeout(() => {
        mainMenuScreen.classList.add('hidden');
        usernameScreen.classList.remove('hidden', 'fade-out');
        usernameScreen.classList.add('fade-in');
        usernameInput.value = '';
        usernameInput.focus();
        validateUsername();
    }, 500);
}


function saveCurrentUser(username) {
    const userData = { username, score: 0, timestamp: new Date().toISOString() };
    localStorage.setItem("currentUser", JSON.stringify(userData));
    currentUser = username;

    // Ensure user exists in leaderboard
    registerPlayerInScores(username);
}

function updateScore(newScore) {
    const userData = JSON.parse(localStorage.getItem("currentUser"));
    if (userData) {
        if (newScore > userData.score) {
            userData.score = newScore;
            localStorage.setItem("currentUser", JSON.stringify(userData));
        }

        // Update leaderboard entry
        let scores = JSON.parse(localStorage.getItem("galacticPulseScores")) || [];
        let player = scores.find(entry => entry.name === userData.username);
        if (player) {
            if (newScore > player.score) {
                player.score = newScore;
            }
        } else {
            scores.push({ name: userData.username, score: newScore });
        }
        localStorage.setItem("galacticPulseScores", JSON.stringify(scores));
    }
}

function getCurrentUser() {
    const userData = JSON.parse(localStorage.getItem("currentUser"));
    if (userData && userData.username) {
        currentUser = userData.username;
        return userData;
    }
    return null;
}

function clearCurrentUser() {
    localStorage.removeItem("currentUser");
    currentUser = null;
}

function getPilotName() {
    const user = getCurrentUser();
    return user ? user.username : 'Unknown Pilot';
}

function getPilotScore() {
    const user = getCurrentUser();
    return user ? user.score : 0;
}


function registerPlayerInScores(username) {
    let scores = JSON.parse(localStorage.getItem("galacticPulseScores")) || [];
    if (!scores.some(entry => entry.name === username)) {
        scores.push({ name: username, score: 0 });
        localStorage.setItem("galacticPulseScores", JSON.stringify(scores));
    }
}


const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);
