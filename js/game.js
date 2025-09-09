class GalacticPulse {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Load images
        this.playerImage = new Image();
        this.playerImage.src = 'assets/images/Ship5/Ship5.png';
        
        // Enemy ship image
        this.enemyImage = new Image();
        this.enemyImage.src = 'assets/images/Ship1/Ship1.png';
        
        // Enemy bullet images (Shot1) - only 4 images available
        this.enemyBulletImages = [];
        for (let i = 1; i <= 4; i++) {
            const bulletImg = new Image();
            bulletImg.src = `assets/images/Shots/Shot1/shot1_${i}.png`;
            this.enemyBulletImages.push(bulletImg);
        }
        
        this.bulletImages = [];
        this.bulletImageLoadIndex = 0; // Track which image to load next
        
        // Load first bullet image
        this.loadNextBulletImage();
        
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            size: 50, // Increased size to accommodate ship image
            health: 100,
            maxHealth: 100,
            energy: 100,
            maxEnergy: 100,
            speed: 5,
            angle: 0
        };
        
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.pulseWaves = [];
        this.particles = [];
        this.score = 0;
        this.gameRunning = true;
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        
        this.enemySpawnTimer = 0;
        this.energyRegenTimer = 0;
        
        this.initEventListeners();
        this.createStarfield();
        this.gameLoop();
    }
    
    initEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') {
                e.preventDefault();
                if (this.gameRunning) {
                    this.firePulseWave();
                } else {
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
            if (this.gameRunning) {
                this.fireBullet();
            }
        });
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    loadNextBulletImage() {
        if (this.bulletImageLoadIndex < 5) {
            const bulletImg = new Image();
            bulletImg.onload = () => {
                this.bulletImageLoadIndex++;
                // Load next image after a delay
                setTimeout(() => this.loadNextBulletImage(), 1000);
            };
            bulletImg.src = `assets/images/Shots/Shot5/shot5_${this.bulletImageLoadIndex + 1}.png`;
            this.bulletImages.push(bulletImg);
        }
    }
    
    createStarfield() {
        const starfield = document.getElementById('starfield');
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
    
    update() {
        if (!this.gameRunning) return;
        
        this.updatePlayer();
        this.updateBullets();
        this.updateEnemyBullets();
        this.updateEnemies();
        this.updatePulseWaves();
        this.updateParticles();
        this.spawnEnemies();
        this.regenerateEnergy();
        this.checkCollisions();
        this.updateUI();
    }
    
    updatePlayer() {
        // Movement
        if (this.keys['w'] || this.keys['arrowup']) this.player.y -= this.player.speed;
        if (this.keys['s'] || this.keys['arrowdown']) this.player.y += this.player.speed;
        if (this.keys['a'] || this.keys['arrowleft']) this.player.x -= this.player.speed;
        if (this.keys['d'] || this.keys['arrowright']) this.player.x += this.player.speed;
        
        // Keep player in bounds
        this.player.x = Math.max(this.player.size, Math.min(this.canvas.width - this.player.size, this.player.x));
        this.player.y = Math.max(this.player.size, Math.min(this.canvas.height - this.player.size, this.player.y));
        
        // Calculate angle to mouse
        this.player.angle = Math.atan2(this.mouse.y - this.player.y, this.mouse.x - this.player.x);
    }
    
    fireBullet() {
        // Only use available loaded images
        const availableImages = this.bulletImages.filter(img => img.complete);
        const maxFrame = Math.max(0, availableImages.length - 1);
        
        this.bullets.push({
            x: this.player.x,
            y: this.player.y,
            vx: Math.cos(this.player.angle) * 10,
            vy: Math.sin(this.player.angle) * 10,
            size: 50, // Reduced size to make bullets more visible
            life: 100,
            animFrame: Math.floor(Math.random() * (maxFrame + 1)), // Use only available frames
            animTimer: Math.floor(Math.random() * 5), // Random starting timer offset
            angle: this.player.angle,
            maxFrames: maxFrame + 1 // Store how many frames this bullet can use
        });
    }
    
    firePulseWave() {
        if (this.player.energy >= 30) {
            this.player.energy -= 30;
            this.pulseWaves.push({
                x: this.player.x,
                y: this.player.y,
                radius: 0,
                maxRadius: 200,
                speed: 8,
                damage: 50
            });
        }
    }
    
    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            bullet.life--;
            
            // Update bullet animation - only cycle through available frames
            bullet.animTimer++;
            if (bullet.animTimer >= 5) {
                bullet.animTimer = 0;
                bullet.animFrame = (bullet.animFrame + 1) % bullet.maxFrames;
            }
            
            return bullet.life > 0 && 
                   bullet.x > 0 && bullet.x < this.canvas.width &&
                   bullet.y > 0 && bullet.y < this.canvas.height;
        });
    }
    
    updateEnemyBullets() {
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            bullet.life--;
            
            // Update bullet animation
            bullet.animTimer++;
            if (bullet.animTimer >= 5) {
                bullet.animTimer = 0;
                bullet.animFrame = (bullet.animFrame + 1) % this.enemyBulletImages.length;
            }
            
            return bullet.life > 0 && 
                   bullet.x > 0 && bullet.x < this.canvas.width &&
                   bullet.y > 0 && bullet.y < this.canvas.height;
        });
    }
    
    spawnEnemies() {
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer >= 120 - Math.min(this.score / 100, 60)) {
            this.enemySpawnTimer = 0;
            
            // Spawn from right side only
            let x, y;
            
            // Right side spawn
            x = this.canvas.width + 20;
            y = Math.random() * this.canvas.height;
            
            // Calculate velocity toward player
            const angle = Math.atan2(this.player.y - y, this.player.x - x);
            const speed = 1 + Math.random() * 2;
            
            this.enemies.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 25, // Increased size for ship image
                health: 30 + Math.random() * 20,
                maxHealth: 50,
                type: Math.random() < 0.8 ? 'basic' : 'heavy',
                fireTimer: Math.floor(Math.random() * 60) // Random initial fire delay
            });
        }
    }
    
    updateEnemies() {
        this.enemies.forEach(enemy => {
            enemy.x += enemy.vx;
            enemy.y += enemy.vy;
            
            // Enemy firing logic
            enemy.fireTimer++;
            if (enemy.fireTimer >= 120) { // Fire every 2 seconds
                enemy.fireTimer = 0;
                this.fireEnemyBullet(enemy);
            }
        });
        
        this.enemies = this.enemies.filter(enemy => 
            enemy.health > 0 && 
            enemy.x > -50 && enemy.x < this.canvas.width + 50 &&
            enemy.y > -50 && enemy.y < this.canvas.height + 50
        );
    }
    
    fireEnemyBullet(enemy) {
        // Calculate angle toward player
        const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
        
        this.enemyBullets.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * 3, // Slower than player bullets
            vy: Math.sin(angle) * 3,
            size: 20,
            life: 150,
            animFrame: Math.floor(Math.random() * this.enemyBulletImages.length),
            animTimer: 0,
            angle: angle
        });
    }
    
    updatePulseWaves() {
        this.pulseWaves.forEach(wave => {
            wave.radius += wave.speed;
        });
        
        this.pulseWaves = this.pulseWaves.filter(wave => wave.radius < wave.maxRadius);
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
        });
        
        this.particles = this.particles.filter(particle => particle.life > 0);
    }
    
    createExplosion(x, y, color = '#ff6600') {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 5 + 2,
                color: color,
                life: 30,
                maxLife: 30,
                alpha: 1
            });
        }
    }
    
    regenerateEnergy() {
        this.energyRegenTimer++;
        if (this.energyRegenTimer >= 10) {
            this.energyRegenTimer = 0;
            this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 1);
        }
    }
    
    checkCollisions() {
        // Bullet vs Enemy
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                const dx = bullet.x - enemy.x;
                const dy = bullet.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < bullet.size + enemy.size) {
                    this.bullets.splice(bulletIndex, 1);
                    enemy.health -= 25;
                    this.createExplosion(enemy.x, enemy.y, '#ffff00');
                    
                    if (enemy.health <= 0) {
                        this.enemies.splice(enemyIndex, 1);
                        this.score += 10;
                        this.createExplosion(enemy.x, enemy.y, '#ff0000');
                    }
                }
            });
        });
        
        // Pulse Wave vs Enemy
        this.pulseWaves.forEach(wave => {
            this.enemies.forEach((enemy, enemyIndex) => {
                const dx = wave.x - enemy.x;
                const dy = wave.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= wave.radius && distance >= wave.radius - 10) {
                    enemy.health -= wave.damage;
                    this.createExplosion(enemy.x, enemy.y, '#00ffff');
                    
                    if (enemy.health <= 0) {
                        this.enemies.splice(enemyIndex, 1);
                        this.score += 15;
                        this.createExplosion(enemy.x, enemy.y, '#ff0000');
                    }
                }
            });
        });
        
        // Player vs Enemy
        this.enemies.forEach(enemy => {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.size + enemy.size) {
                this.player.health -= 1;
                this.createExplosion(this.player.x, this.player.y, '#ff0000');
                
                if (this.player.health <= 0) {
                    this.gameOver();
                }
            }
        });
        
        // Enemy Bullets vs Player
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            const dx = this.player.x - bullet.x;
            const dy = this.player.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.size + bullet.size) {
                this.enemyBullets.splice(bulletIndex, 1);
                this.player.health -= 15;
                this.createExplosion(this.player.x, this.player.y, '#ff0000');
                
                if (this.player.health <= 0) {
                    this.gameOver();
                }
            }
        });
    }
    
    updateUI() {
        document.getElementById('healthBar').style.width = (this.player.health / this.player.maxHealth) * 100 + '%';
        document.getElementById('energyBar').style.width = (this.player.energy / this.player.maxEnergy) * 100 + '%';
        document.getElementById('score').textContent = `Score: ${this.score}`;
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw player
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        // Removed rotation - player model stays in fixed orientation
        
        if (this.playerImage.complete) {
            const shipWidth = this.player.size * 2;
            const shipHeight = this.player.size * 2;
            this.ctx.drawImage(this.playerImage, -shipWidth/2, -shipHeight/2, shipWidth, shipHeight);
        } else {
            // Fallback rendering while image loads
            this.ctx.fillStyle = '#00ffff';
            this.ctx.fillRect(-this.player.size, -this.player.size/2, this.player.size * 2, this.player.size);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(this.player.size, -3, 8, 6);
        }
        
        this.ctx.restore();
        
        // Draw bullets
        this.bullets.forEach(bullet => {
            if (this.bulletImages[bullet.animFrame] && this.bulletImages[bullet.animFrame].complete) {
                // Draw bullet image without rotation first to see if it's visible
                const bulletWidth = bullet.size * 1.5;
                const bulletHeight = bullet.size * 1.5;
                this.ctx.drawImage(this.bulletImages[bullet.animFrame], 
                                 bullet.x - bulletWidth/2, 
                                 bullet.y - bulletHeight/2, 
                                 bulletWidth, bulletHeight);
            } else {
                // Fallback rendering - always visible yellow circle
                this.ctx.fillStyle = '#ffff00';
                this.ctx.beginPath();
                this.ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add a bright border to make it more visible
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
            
            // Bullet trail effect
            this.ctx.strokeStyle = '#ffff0040';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(bullet.x, bullet.y);
            this.ctx.lineTo(bullet.x - bullet.vx * 3, bullet.y - bullet.vy * 3);
            this.ctx.stroke();
        });
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            if (this.enemyImage.complete) {
                // Draw enemy ship image
                const shipWidth = enemy.size * 1.5;
                const shipHeight = enemy.size * 1.5;
                this.ctx.drawImage(this.enemyImage, 
                                 enemy.x - shipWidth/2, 
                                 enemy.y - shipHeight/2, 
                                 shipWidth, shipHeight);
            } else {
                // Fallback rendering while image loads
                this.ctx.fillStyle = enemy.type === 'heavy' ? '#ff6600' : '#ff0000';
                this.ctx.beginPath();
                this.ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Enemy health bar
            if (enemy.health < enemy.maxHealth) {
                const barWidth = enemy.size * 2;
                const barHeight = 4;
                this.ctx.fillStyle = '#333';
                this.ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.size - 10, barWidth, barHeight);
                this.ctx.fillStyle = '#ff0000';
                this.ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.size - 10, 
                                (enemy.health / enemy.maxHealth) * barWidth, barHeight);
            }
        });
        
        // Draw enemy bullets
        this.enemyBullets.forEach(bullet => {
            if (this.enemyBulletImages[bullet.animFrame] && this.enemyBulletImages[bullet.animFrame].complete) {
                // Draw enemy bullet image
                const bulletWidth = bullet.size * 1.5;
                const bulletHeight = bullet.size * 1.5;
                this.ctx.drawImage(this.enemyBulletImages[bullet.animFrame], 
                                 bullet.x - bulletWidth/2, 
                                 bullet.y - bulletHeight/2, 
                                 bulletWidth, bulletHeight);
            } else {
                // Fallback rendering
                this.ctx.fillStyle = '#ff0000';
                this.ctx.beginPath();
                this.ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
            
            // Enemy bullet trail
            this.ctx.strokeStyle = '#ff000040';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(bullet.x, bullet.y);
            this.ctx.lineTo(bullet.x - bullet.vx * 3, bullet.y - bullet.vy * 3);
            this.ctx.stroke();
        });
        
        // Draw pulse waves
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 3;
        this.pulseWaves.forEach(wave => {
            this.ctx.globalAlpha = 1 - (wave.radius / wave.maxRadius);
            this.ctx.beginPath();
            this.ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        });
        this.ctx.globalAlpha = 1;
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('gameOver').style.display = 'block';
    }
    
    restart() {
        this.player.health = this.player.maxHealth;
        this.player.energy = this.player.maxEnergy;
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.pulseWaves = [];
        this.particles = [];
        this.score = 0;
        this.gameRunning = true;
        document.getElementById('gameOver').style.display = 'none';
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}