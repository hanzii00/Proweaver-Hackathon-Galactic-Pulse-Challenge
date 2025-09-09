// Main game initialization
document.addEventListener('DOMContentLoaded', function() {
    // Start the game
    const game = new GalacticPulse();
});

// Utility functions that might be useful across the game
function lerp(start, end, amount) {
    return start + (end - start) * amount;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}