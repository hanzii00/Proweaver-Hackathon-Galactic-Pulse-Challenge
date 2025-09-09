class GalacticPulse {
    constructor(assetManager) {
        this.assetManager = assetManager;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2, this.assetManager.images.player);
        this.bullets = [];
        this.enemies = [];
        this.pulseWaves = [];
        this.particles = [];
        this.powerUps = [];
        
        this.score = 0;
        this.wave = 1;
        this.enemySpawnTimer = 0;
        this.waveTransition = false;
        
        this.keys = {};
        this.mouse = { x: 0, y: 0, pressed: false };
        
        this.initEventListeners();
        GameState.setState(GameState.states.PLAYING);
        this.gameLoop();
    }
    
    initEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') {
                e.preventDefault();
                if (GameState.isPlaying()) {
                    this.player.firePulseWave();
                } else if (GameState.currentState === GameState.states.GAME_OVER) {
                    this.restart();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        document.addEventListener('mousedown', (e) => {
            this.mouse.pressed = true;
            if (GameState.isPlaying()) {
                this.fireBullet();
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            this.mouse.pressed = false;
        });
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    update() {
        if (!GameState.isPlaying()) return;
        
        this.player.update(this.keys, this.mouse);
        this.updateBullets();
        this.updateEnemies();
        this.updatePulseWaves();
        this.updateParticles();
        this.updatePowerUps();
        this.spawnEnemies();
        this.checkCollisions();
        this.updateUI();
        this.checkWaveProgression();
        
        // Keep player in bounds
        this.player.x = Utils.clamp(this.player.x, this.player.size, this.canvas.width - this.player.size);
        this.player.y = Utils.clamp(this.player.y, this.player.size, this.canvas.height - this.player.size);
    }
    
    fireBullet() {
        const bullet = this.player.fireBullet();
        if (bullet) {
            this.bullets.push(bullet);
            // Play laser sound
            if (this.assetManager.sounds.laserSound) {
                this.assetManager.sounds.laserSound.currentTime = 0;
                this.assetManager.sounds.laserSound.volume = 0.1;
                this.assetManager.sounds.laserSound.play().catch(e => {});
            }
        }
    }
    
    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return bullet.life > 0 && 
                   bullet.x > -50 && bullet.x < this.canvas.width + 50 &&
                   bullet.y > -50 && bullet.y < this.canvas.height + 50;
        });
    }
    
    spawnEnemies() {
        if (this.waveTransition) return;
        
        this.enemySpawnTimer++;
        const spawnRate = Math.max(30, 90 - this.wave * 5);
        
        if (this.enemySpawnTimer >= spawnRate) {
            this.enemySpawnTimer = 0;
            this.spawnEnemy();
        }
    }
    
    spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(side) {
            case 0: // Top
                x = Math.random() * this.canvas.width;
                y = -50;
                break;
            case 1: // Right
                x = this.canvas.width + 50;
                y = Math.random() * this.canvas.height;
                break;
            case 2: // Bottom
                x = Math.random() * this.canvas.width;
                y = this.canvas.height + 50;
                break;
            case 3: // Left
                x = -50;
                y = Math.random() * this.canvas.height;
                break;
        }
        
        // Create different enemy types based on wave
        const enemyType = this.determineEnemyType();
        const enemy = new Enemy(x, y, this.assetManager.images.enemy, enemyType, this.wave);
        this.enemies.push(enemy);
    }
    
    determineEnemyType() {
        const rand = Math.random();
        if (this.wave >= 3 && rand < 0.2) return 'heavy';
        if (this.wave >= 2 && rand < 0.3) return 'fast';
        return 'basic';
    }
    
    updateEnemies() {
        this.enemies.forEach(enemy => {
            enemy.update(this.player);
        });
        
        this.enemies = this.enemies.filter(enemy => 
            enemy.health > 0 && 
            enemy.x > -100 && enemy.x < this.canvas.width + 100 &&
            enemy.y > -100 && enemy.y < this.canvas.height + 100
        );
    }
    
    updatePulseWaves() {
        const playerPulses = this.player.pulseWaves.filter(wave => {
            wave.update();
            return wave.radius < wave.maxRadius;
        });
        this.player.pulseWaves = playerPulses;
    }
    
    updateParticles() {
        this.particles.forEach(particle => particle.update());
        this.particles = this.particles.filter(particle => particle.life > 0);
    }
    
    updatePowerUps() {
        this.powerUps.forEach(powerUp => powerUp.update());
        this.powerUps = this.powerUps.filter(powerUp => powerUp.life > 0);
    }
    
    checkCollisions() {
        // Bullet vs Enemy
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (Utils.distance(bullet.x, bullet.y, enemy.x, enemy.y) < bullet.size + enemy.size) {
                    this.bullets.splice(bulletIndex, 1);
                    enemy.takeDamage(bullet.damage);
                    this.createImpactEffect(enemy.x, enemy.y, '#ffff00');
                    
                    if (enemy.health <= 0) {
                        this.destroyEnemy(enemy, enemyIndex);
                    }
                }
            });
        });
        
        // Pulse Wave vs Enemy
        this.player.pulseWaves.forEach(wave => {
            this.enemies.forEach((enemy, enemyIndex) => {
                const distance = Utils.distance(wave.x, wave.y, enemy.x, enemy.y);
                if (distance <= wave.radius && distance >= wave.radius - 10) {
                    enemy.takeDamage(wave.damage);
                    this.createImpactEffect(enemy.x, enemy.y, '#00ffff');
                    
                    if (enemy.health <= 0) {
                        this.destroyEnemy(enemy, enemyIndex);
                    }
                }
            });
        });
        
        // Player vs Enemy
        this.enemies.forEach(enemy => {
            if (Utils.distance(this.player.x, this.player.y, enemy.x, enemy.y) < this.player.size + enemy.size) {
                this.player.takeDamage(enemy.damage);
                this.createImpactEffect(this.player.x, this.player.y, '#ff0000');
                
                if (this.player.health <= 0) {
                    this.gameOver();
                }
            }
        });
        
        // Player vs PowerUps
        this.powerUps.forEach((powerUp, index) => {
            if (Utils.distance(this.player.x, this.player.y, powerUp.x, powerUp.y) < this.player.size + powerUp.size) {
                this.player.applyPowerUp(powerUp);
                this.powerUps.splice(index, 1);
                this.createImpactEffect(powerUp.x, powerUp.y, '#00ff00');
            }
        });
    }
    
    destroyEnemy(enemy, index) {
        this.enemies.splice(index, 1);
        this.score += enemy.scoreValue;
        this.createExplosion(enemy.x, enemy.y, '#ff6600');
        
        // Chance to spawn power-up
        if (Math.random() < 0.15) {
            this.powerUps.push(new PowerUp(enemy.x, enemy.y));
        }
    }
    
    checkWaveProgression() {
        if (this.enemies.length === 0 && !this.waveTransition) {
            this.waveTransition = true;
            setTimeout(() => {
                this.wave++;
                this.waveTransition = false;
                // Wave bonus
                this.score += this.wave * 50;
            }, 2000);
        }
    }
    
    createExplosion(x, y, color = '#ff6600') {
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(x, y, color, 'explosion'));
        }
    }
    
    createImpactEffect(x, y, color = '#ffff00') {
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(x, y, color, 'impact'));
        }
    }
    
    updateUI() {
        document.getElementById('healthBar').style.width = (this.player.health / this.player.maxHealth) * 100 + '%';
        document.getElementById('energyBar').style.width = (this.player.energy / this.player.maxEnergy) * 100 + '%';
        document.getElementById('score').textContent = `Score: ${this.score} | Wave: ${this.wave}`;
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw game objects
        this.player.render(this.ctx);
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.particles.forEach(particle => particle.render(this.ctx));
        this.powerUps.forEach(powerUp => powerUp.render(this.ctx));
        
        // Draw wave transition
        if (this.waveTransition) {
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#00ffff';
            this.ctx.font = '48px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Wave ${this.wave} Complete!`, this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillText(`Next Wave: ${this.wave + 1}`, this.canvas.width / 2, this.canvas.height / 2 + 60);
        }
    }
    
    gameOver() {
        GameState.setState(GameState.states.GAME_OVER);
        document.getElementById('gameOver').style.display = 'block';
        
        // Pause background music
        if (this.assetManager.sounds.backgroundMusic) {
            this.assetManager.sounds.backgroundMusic.pause();
        }
    }
    
    restart() {
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2, this.assetManager.images.player);
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.powerUps = [];
        this.score = 0;
        this.wave = 1;
        this.waveTransition = false;
        this.enemySpawnTimer = 0;
        
        GameState.setState(GameState.states.PLAYING);
        document.getElementById('gameOver').style.display = 'none';
        
        // Resume background music
        if (this.assetManager.sounds.backgroundMusic) {
            this.assetManager.sounds.backgroundMusic.currentTime = 0;
            this.assetManager.sounds.backgroundMusic.play().catch(e => {});
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}