// Entity classes for the game

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 15;
        this.health = 100;
        this.maxHealth = 100;
        this.energy = 100;
        this.maxEnergy = 100;
        this.speed = 5;
        this.angle = 0;
    }

    update(keys, mouse) {
        // Movement
        if (keys['w'] || keys['arrowup']) this.y -= this.speed;
        if (keys['s'] || keys['arrowdown']) this.y += this.speed;
        if (keys['a'] || keys['arrowleft']) this.x -= this.speed;
        if (keys['d'] || keys['arrowright']) this.x += this.speed;
        
        // Calculate angle to mouse
        this.angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Player body
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(-this.size, -this.size/2, this.size * 2, this.size);
        
        // Player nose
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.size, -3, 8, 6);
        
        ctx.restore();
    }
}

class Bullet {
    constructor(x, y, angle, speed = 10) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = 3;
        this.life = 100;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw(ctx) {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Bullet trail
        ctx.strokeStyle = '#ffff0040';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
        ctx.stroke();
    }

    isAlive() {
        return this.life > 0;
    }
}

class Enemy {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.size = 10 + Math.random() * 10;
        this.health = 30 + Math.random() * 20;
        this.maxHealth = 50;
        this.type = Math.random() < 0.8 ? 'basic' : 'heavy';
        
        // Calculate velocity toward target
        const angle = Math.atan2(targetY - y, targetX - x);
        const speed = 1 + Math.random() * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }

    update(playerX, playerY) {
        this.x += this.vx;
        this.y += this.vy;
        
        // Simple AI - adjust direction toward player occasionally
        if (Math.random() < 0.01) {
            const angle = Math.atan2(playerY - this.y, playerX - this.x);
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.type === 'heavy' ? '#ff6600' : '#ff0000';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Health bar
        if (this.health < this.maxHealth) {
            const barWidth = this.size * 2;
            const barHeight = 4;
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x - barWidth/2, this.y - this.size - 10, barWidth, barHeight);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x - barWidth/2, this.y - this.size - 10, 
                        (this.health / this.maxHealth) * barWidth, barHeight);
        }
    }

    isAlive() {
        return this.health > 0;
    }

    takeDamage(damage) {
        this.health -= damage;
        return this.health <= 0;
    }
}

class PulseWave {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 200;
        this.speed = 8;
        this.damage = 50;
    }

    update() {
        this.radius += this.speed;
    }

    draw(ctx) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 1 - (this.radius / this.maxRadius);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    isAlive() {
        return this.radius < this.maxRadius;
    }
}

class Particle {
    constructor(x, y, vx, vy, size, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.alpha = this.life / this.maxLife;
    }

    draw(ctx) {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    isAlive() {
        return this.life > 0;
    }
}