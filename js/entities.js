// Player class - handles ship model and shooting
class Player {
    constructor(x, y, shipImage) {
        this.x = x;
        this.y = y;
        this.shipImage = shipImage;
        this.size = 15;
        this.health = 100;
        this.maxHealth = 100;
        this.energy = 100;
        this.maxEnergy = 100;
        this.speed = 5;
        this.angle = 0;
        
        // Weapon properties
        this.fireRate = 10; // frames between shots
        this.fireTimer = 0;
        this.bulletDamage = 25;
        this.bulletSpeed = 10;
        
        // Pulse wave properties
        this.pulseWaves = [];
        this.pulseCost = 30;
        this.pulseTimer = 0;
        this.pulseCooldown = 60; // frames
        
        // Visual effects
        this.hitTimer = 0;
        this.thrustParticles = [];
    }
    
    update(keys, mouse) {
        this.fireTimer = Math.max(0, this.fireTimer - 1);
        this.pulseTimer = Math.max(0, this.pulseTimer - 1);
        this.hitTimer = Math.max(0, this.hitTimer - 1);
        
        // Movement
        let moved = false;
        if (keys['w'] || keys['arrowup']) {
            this.y -= this.speed;
            moved = true;
        }
        if (keys['s'] || keys['arrowdown']) {
            this.y += this.speed;
            moved = true;
        }
        if (keys['a'] || keys['arrowleft']) {
            this.x -= this.speed;
            moved = true;
        }
        if (keys['d'] || keys['arrowright']) {
            this.x += this.speed;
            moved = true;
        }
        
        // Create thrust particles when moving
        if (moved) {
            this.createThrustParticle();
        }
        
        // Calculate angle to mouse
        this.angle = Utils.angle(this.x, this.y, mouse.x, mouse.y);
        
        // Energy regeneration
        if (this.energy < this.maxEnergy) {
            this.energy = Math.min(this.maxEnergy, this.energy + 0.2);
        }
        
        // Update thrust particles
        this.thrustParticles.forEach(particle => particle.update());
        this.thrustParticles = this.thrustParticles.filter(p => p.life > 0);
    }
    
    fireBullet() {
        if (this.fireTimer <= 0) {
            this.fireTimer = this.fireRate;
            return new Bullet(
                this.x + Math.cos(this.angle) * 20,
                this.y + Math.sin(this.angle) * 20,
                Math.cos(this.angle) * this.bulletSpeed,
                Math.sin(this.angle) * this.bulletSpeed,
                this.bulletDamage,
                'player'
            );
        }
        return null;
    }
    
    firePulseWave() {
        if (this.pulseTimer <= 0 && this.energy >= this.pulseCost) {
            this.pulseTimer = this.pulseCooldown;
            this.energy -= this.pulseCost;
            this.pulseWaves.push(new PulseWave(this.x, this.y, 200, 50));
        }
    }
    
    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
        this.hitTimer = 10; // Flash effect duration
    }
    
    createThrustParticle() {
        if (Math.random() < 0.3) {
            const offsetX = Math.cos(this.angle + Math.PI) * 15;
            const offsetY = Math.sin(this.angle + Math.PI) * 15;
            this.thrustParticles.push(new Particle(
                this.x + offsetX,
                this.y + offsetY,
                '#0088ff',
                'thrust'
            ));
        }
    }
    
    applyPowerUp(powerUp) {
        switch(powerUp.type) {
            case 'health':
                this.health = Math.min(this.maxHealth, this.health + 30);
                break;
            case 'energy':
                this.energy = Math.min(this.maxEnergy, this.energy + 50);
                break;
            case 'damage':
                this.bulletDamage += 5;
                setTimeout(() => this.bulletDamage -= 5, 10000); // 10 seconds
                break;
            case 'speed':
                this.speed += 2;
                setTimeout(() => this.speed -= 2, 8000); // 8 seconds
                break;
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Flash effect when hit
        if (this.hitTimer > 0 && this.hitTimer % 4 < 2) {
            ctx.globalAlpha = 0.5;
        }
        
        // Draw ship image or fallback
        if (this.shipImage && this.shipImage.complete) {
            ctx.drawImage(this.shipImage, -20, -15, 40, 30);
        } else {
            // Fallback drawing
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(-20, -10, 35, 20);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(15, 0);
            ctx.lineTo(25, -5);
            ctx.lineTo(25, 5);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
        
        // Render thrust particles
        this.thrustParticles.forEach(particle => particle.render(ctx));
        
        // Render pulse waves
        this.pulseWaves.forEach(wave => wave.render(ctx));
    }
}

// Enemy class - handles enemy ship models
class Enemy {
    constructor(x, y, shipImage, type = 'basic', wave = 1) {
        this.x = x;
        this.y = y;
        this.shipImage = shipImage;
        this.type = type;
        this.size = this.getSize(type);
        this.health = this.getHealth(type, wave);
        this.maxHealth = this.health;
        this.speed = this.getSpeed(type);
        this.damage = this.getDamage(type);
        this.scoreValue = this.getScoreValue(type);
        
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.hitTimer = 0;
        this.behaviorTimer = 0;
        
        // AI properties
        this.aiType = this.getAIType(type);
        this.targetX = x;
        this.targetY = y;
    }
    
    getSize(type) {
        switch(type) {
            case 'fast': return 8;
            case 'heavy': return 20;
            default: return 12;
        }
    }
    
    getHealth(type, wave) {
        const baseHealth = {
            'fast': 20,
            'heavy': 80,
            'basic': 40
        };
        return baseHealth[type] + (wave - 1) * 10;
    }
    
    getSpeed(type) {
        switch(type) {
            case 'fast': return 3;
            case 'heavy': return 1;
            default: return 2;
        }
    }
    
    getDamage(type) {
        switch(type) {
            case 'fast': return 15;
            case 'heavy': return 30;
            default: return 20;
        }
    }
    
    getScoreValue(type) {
        switch(type) {
            case 'fast': return 20;
            case 'heavy': return 50;
            default: return 30;
        }
    }
    
    getAIType(type) {
        switch(type) {
            case 'fast': return 'aggressive';
            case 'heavy': return 'tank';
            default: return 'basic';
        }
    }
    
    update(player) {
        this.hitTimer = Math.max(0, this.hitTimer - 1);
        this.behaviorTimer++;
        
        // AI Behavior
        this.updateAI(player);
        
        // Apply movement
        this.x += this.vx;
        this.y += this.vy;
        
        // Calculate angle for rendering
        this.angle = Math.atan2(this.vy, this.vx);
    }
    
    updateAI(player) {
        switch(this.aiType) {
            case 'aggressive':
                this.aggressiveAI(player);
                break;
            case 'tank':
                this.tankAI(player);
                break;
            default:
                this.basicAI(player);
        }
    }
    
    basicAI(player) {
        // Move toward player with some randomness
        if (this.behaviorTimer % 30 === 0) {
            const angle = Utils.angle(this.x, this.y, player.x, player.y);
            const randomOffset = (Math.random() - 0.5) * 0.5;
            this.vx = Math.cos(angle + randomOffset) * this.speed;
            this.vy = Math.sin(angle + randomOffset) * this.speed;
        }
    }
    
    aggressiveAI(player) {
        // Fast, direct movement toward player
        const angle = Utils.angle(this.x, this.y, player.x, player.y);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }
    
    tankAI(player) {
        // Slow movement, tries to ram player
        if (this.behaviorTimer % 60 === 0) {
            const angle = Utils.angle(this.x, this.y, player.x, player.y);
            this.vx = Math.cos(angle) * this.speed;
            this.vy = Math.sin(angle) * this.speed;
        }
    }
    
    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
        this.hitTimer = 8;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Flash effect when hit
        if (this.hitTimer > 0 && this.hitTimer % 4 < 2) {
            ctx.globalAlpha = 0.7;
        }
        
        // Draw ship image or fallback
        if (this.shipImage && this.shipImage.complete) {
            const scale = this.size / 15; // Scale based on size
            ctx.scale(scale, scale);
            ctx.drawImage(this.shipImage, -15, -15, 30, 30);
        } else {
            // Fallback drawing based on type
            this.drawFallbackShip(ctx);
        }
        
        ctx.restore();
        
        // Health bar for damaged enemies
        if (this.health < this.maxHealth) {
            this.drawHealthBar(ctx);
        }
    }
    
    drawFallbackShip(ctx) {
        switch(this.type) {
            case 'fast':
                ctx.fillStyle = '#ff8800';
                ctx.beginPath();
                ctx.moveTo(this.size, 0);
                ctx.lineTo(-this.size, -this.size/2);
                ctx.lineTo(-this.size, this.size/2);
                ctx.closePath();
                ctx.fill();
                break;
            case 'heavy':
                ctx.fillStyle = '#cc0000';
                ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
                break;
            default:
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
        }
    }
    
    drawHealthBar(ctx) {
        const barWidth = this.size * 2;
        const barHeight = 4;
        const barY = -this.size - 10;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth/2, this.y + barY, barWidth, barHeight);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - barWidth/2, this.y + barY, 
                    (this.health / this.maxHealth) * barWidth, barHeight);
    }
}

// Bullet class - handles projectiles
class Bullet {
    constructor(x, y, vx, vy, damage, owner = 'player') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.owner = owner;
        this.size = owner === 'player' ? 3 : 4;
        this.life = 120; // frames
        this.maxLife = this.life;
        
        this.trail = [];
        this.trailLength = 5;
    }
    
    update() {
        // Store previous position for trail
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }
        
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }
    
    render(ctx) {
        // Draw trail
        ctx.strokeStyle = this.owner === 'player' ? '#ffff0040' : '#ff004040';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 1; i < this.trail.length; i++) {
            const alpha = i / this.trail.length * 0.5;
            ctx.globalAlpha = alpha;
            ctx.moveTo(this.trail[i-1].x, this.trail[i-1].y);
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Draw bullet
        ctx.fillStyle = this.owner === 'player' ? '#ffff00' : '#ff4400';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.owner === 'player' ? '#ffff00' : '#ff4400';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// Pulse Wave class
class PulseWave {
    constructor(x, y, maxRadius, damage) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = maxRadius;
        this.damage = damage;
        this.speed = 8;
    }
    
    update() {
        this.radius += this.speed;
    }
    
    render(ctx) {
        const alpha = 1 - (this.radius / this.maxRadius);
        ctx.globalAlpha = alpha * 0.8;
        
        // Outer ring
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner glow
        ctx.globalAlpha = alpha * 0.3;
        ctx.strokeStyle = '#88ffff';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.globalAlpha = 1;
    }
}

// Particle class for effects
class Particle {
    constructor(x, y, color, type = 'explosion') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        
        switch(type) {
            case 'explosion':
                this.vx = (Math.random() - 0.5) * 12;
                this.vy = (Math.random() - 0.5) * 12;
                this.size = Math.random() * 6 + 2;
                this.life = 30;
                break;
            case 'impact':
                this.vx = (Math.random() - 0.5) * 6;
                this.vy = (Math.random() - 0.5) * 6;
                this.size = Math.random() * 3 + 1;
                this.life = 15;
                break;
            case 'thrust':
                this.vx = (Math.random() - 0.5) * 4;
                this.vy = (Math.random() - 0.5) * 4;
                this.size = Math.random() * 2 + 1;
                this.life = 10;
                break;
        }
        
        this.maxLife = this.life;
        this.gravity = type === 'explosion' ? 0.1 : 0;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life--;
        
        // Fade over time
        this.alpha = this.life / this.maxLife;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// PowerUp class
class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 8;
        this.life = 600; // 10 seconds at 60fps
        this.maxLife = this.life;
        
        const types = ['health', 'energy', 'damage', 'speed'];
        this.type = types[Math.floor(Math.random() * types.length)];
        
        this.bobOffset = Math.random() * Math.PI * 2;
        this.bobSpeed = 0.05;
        this.rotation = 0;
        this.rotationSpeed = 0.02;
        
        this.colors = {
            health: '#ff0000',
            energy: '#0088ff',
            damage: '#ffaa00',
            speed: '#00ff00'
        };
    }
    
    update() {
        this.life--;
        this.bobOffset += this.bobSpeed;
        this.rotation += this.rotationSpeed;
    }
    
    render(ctx) {
        const bobY = Math.sin(this.bobOffset) * 3;
        const alpha = this.life < 120 ? (this.life % 20) / 20 : 1; // Flash when expiring
        
        ctx.save();
        ctx.translate(this.x, this.y + bobY);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = alpha;
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.colors[this.type];
        
        // Draw power-up based on type
        ctx.fillStyle = this.colors[this.type];
        switch(this.type) {
            case 'health':
                // Cross shape
                ctx.fillRect(-2, -6, 4, 12);
                ctx.fillRect(-6, -2, 12, 4);
                break;
            case 'energy':
                // Lightning bolt
                ctx.beginPath();
                ctx.moveTo(-4, -8);
                ctx.lineTo(2, -2);
                ctx.lineTo(-2, -2);
                ctx.lineTo(4, 8);
                ctx.lineTo(-2, 2);
                ctx.lineTo(2, 2);
                ctx.closePath();
                ctx.fill();
                break;
            case 'damage':
                // Star shape
                for (let i = 0; i < 5; i++) {
                    const angle = (i * Math.PI * 2) / 5;
                    const x = Math.cos(angle) * 6;
                    const y = Math.sin(angle) * 6;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                break;
            case 'speed':
                // Arrow shape
                ctx.beginPath();
                ctx.moveTo(8, 0);
                ctx.lineTo(-4, -6);
                ctx.lineTo(-4, 6);
                ctx.closePath();
                ctx.fill();
                break;
        }
        
        ctx.restore();
    }
}