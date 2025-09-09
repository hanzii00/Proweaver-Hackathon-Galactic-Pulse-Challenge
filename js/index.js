// Main entry point and initialization
class AssetManager {
    constructor() {
        this.images = {};
        this.sounds = {};
        this.loadedAssets = 0;
        this.totalAssets = 0;
    }

    async loadAssets() {
        // Define assets to load
        const imageAssets = {
            player: '../assets/images/Ship1/Ship1.png',
            enemy: '../assets/images/Ship2/Ship2.png'
        };

        const soundAssets = {
            backgroundMusic: '../assets/audio/Nebula Neon - Cm - 129 BPM.wav',
            laserSound: '../assets/audio/Nebula Neon - Cm - 129 BPM.wav'
        };

        this.totalAssets = Object.keys(imageAssets).length + Object.keys(soundAssets).length;

        // Load images
        for (const [key, src] of Object.entries(imageAssets)) {
            try {
                this.images[key] = await this.loadImage(src);
                this.loadedAssets++;
            } catch (error) {
                console.warn(`Failed to load image: ${src}`, error);
                // Create fallback colored rectangle
                this.images[key] = this.createFallbackImage(key);
                this.loadedAssets++;
            }
        }

        // Load sounds
        for (const [key, src] of Object.entries(soundAssets)) {
            try {
                this.sounds[key] = await this.loadSound(src);
                this.loadedAssets++;
            } catch (error) {
                console.warn(`Failed to load sound: ${src}`, error);
                // Create silent fallback
                this.sounds[key] = { play: () => {}, pause: () => {}, volume: 0 };
                this.loadedAssets++;
            }
        }

        return this;
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    loadSound(src) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => resolve(audio);
            audio.onerror = reject;
            audio.src = src;
        });
    }

    createFallbackImage(type) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (type === 'player') {
            canvas.width = 40;
            canvas.height = 30;
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(0, 0, 40, 30);
            // Player ship shape
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(35, 15);
            ctx.lineTo(40, 10);
            ctx.lineTo(40, 20);
            ctx.closePath();
            ctx.fill();
        } else if (type === 'enemy') {
            canvas.width = 30;
            canvas.height = 30;
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(15, 15, 15, 0, Math.PI * 2);
            ctx.fill();
        }

        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

    getLoadProgress() {
        return this.totalAssets > 0 ? this.loadedAssets / this.totalAssets : 0;
    }
}

// Initialize the game

// Expose a function to start the game when called (after scripts are loaded)
window.startGalacticPulseGame = async function() {
    // Show loading screen
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = '<div class="loading-text">Loading Galactic Pulse...</div>';
    document.body.appendChild(loadingDiv);

    try {
        // Load assets
        const assetManager = new AssetManager();
        await assetManager.loadAssets();

        // Remove loading screen
        document.body.removeChild(loadingDiv);

        // Create starfield
        createStarfield();

        // Initialize and start the game
        const game = new GalacticPulse(assetManager);
        
        // Start background music (with user interaction)
        document.addEventListener('click', () => {
            if (assetManager.sounds.backgroundMusic && assetManager.sounds.backgroundMusic.paused) {
                assetManager.sounds.backgroundMusic.volume = 0.3;
                assetManager.sounds.backgroundMusic.play().catch(e => console.warn('Background music failed to play:', e));
            }
        }, { once: true });

    } catch (error) {
        console.error('Failed to initialize game:', error);
        document.body.removeChild(loadingDiv);
        document.body.innerHTML += '<div style="color: red; text-align: center; margin-top: 50px;">Failed to load game. Please refresh and try again.</div>';
    }
}

function createStarfield() {
    const starfield = document.getElementById('starfield');
    starfield.innerHTML = ''; // Clear existing stars
    
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = Math.random() * 3 + 1 + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 2 + 's';
        starfield.appendChild(star);
    }
}

// Utility functions
class Utils {
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }
}

// Global game state manager
class GameState {
    static states = {
        LOADING: 'loading',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'game_over'
    };

    static currentState = GameState.states.LOADING;

    static setState(newState) {
        this.currentState = newState;
    }

    static isPlaying() {
        return this.currentState === this.states.PLAYING;
    }
}