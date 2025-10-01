// Game Configuration
const CONFIG = {
    canvas: {
        width: 400,
        height: 600
    },
    player: {
        width: 80,
        height: 60,
        speed: 5,
        startX: 160,
        startY: 500
    },
    bean: {
        width: 20,
        height: 25,
        minSpeed: 1.5,
        maxSpeed: 6,
        spawnRate: 0.015,
        speedIncrease: 0.0008,
        spawnTimer: 0,
        spawnInterval: 60, // frames between spawns
        maxBeansOnScreen: 8
    },
    bossBean: {
        width: 35,
        height: 40,
        speed: 3,
        spawnChance: 0.005,
        progressThreshold: 100
    },
    game: {
        maxHearts: 3,
        pointsPerBean: 10,
        pointsPerBossBean: 100,
        bossBeansToWin: 10,
        winDiscount: 15
    }
};

// Game State
class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.score = 0;
        this.hearts = CONFIG.game.maxHearts;
        this.gameRunning = false;
        this.gameStarted = false;
        this.bossProgress = 0;
        this.gameSpeed = 1;
        this.beansCollected = 0;
        this.spawnTimer = 0;
        this.currentSpawnInterval = CONFIG.bean.spawnInterval;
        this.bossBeansCollected = 0;
        this.gameWon = false;
    }
}

// Player (Coffee Cup) Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.player.width;
        this.height = CONFIG.player.height;
        this.speed = CONFIG.player.speed;
        this.targetX = x;
        this.steamParticles = [];
    }

    update() {
        // Smooth movement towards target
        const dx = this.targetX - this.x;
        this.x += dx * 0.15;

        // Keep player within bounds
        this.x = Math.max(0, Math.min(CONFIG.canvas.width - this.width, this.x));

        // Update steam particles
        this.updateSteam();
    }

    updateSteam() {
        // Add new steam particles
        if (Math.random() < 0.3) {
            this.steamParticles.push({
                x: this.x + this.width / 2 + (Math.random() - 0.5) * 20,
                y: this.y - 5,
                opacity: 0.7,
                size: Math.random() * 8 + 4,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -Math.random() * 2 - 1
            });
        }

        // Update existing steam particles
        this.steamParticles = this.steamParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.opacity -= 0.02;
            particle.size += 0.1;
            return particle.opacity > 0;
        });
    }

    moveTo(x) {
        this.targetX = x - this.width / 2;
    }

    draw(ctx) {
        // Draw steam particles
        this.steamParticles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = '#E8E8E8';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Draw coffee cup
        ctx.save();
        
        // Cup body (gradient)
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(0.3, '#A0522D');
        gradient.addColorStop(1, '#654321');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x + 5, this.y + 15, this.width - 10, this.height - 15);
        
        // Cup handle
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.x + this.width + 5, this.y + 30, 12, -Math.PI/3, Math.PI/3);
        ctx.stroke();
        
        // Coffee surface
        ctx.fillStyle = '#3C1810';
        ctx.fillRect(this.x + 8, this.y + 18, this.width - 16, 8);
        
        // Cup rim
        ctx.fillStyle = '#F5E6D3';
        ctx.fillRect(this.x, this.y + 10, this.width, 8);
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(this.x + 10, this.y + 20, 8, this.height - 30);
        
        ctx.restore();
    }

    getBounds() {
        return {
            left: this.x + 8,
            right: this.x + this.width - 8,
            top: this.y + 15,
            bottom: this.y + this.height
        };
    }
}

// Bean Class
class Bean {
    constructor(x, y, isBoss = false) {
        this.x = x;
        this.y = y;
        this.isBoss = isBoss;
        this.width = isBoss ? CONFIG.bossBean.width : CONFIG.bean.width;
        this.height = isBoss ? CONFIG.bossBean.height : CONFIG.bean.height;
        
        // More controlled speed distribution
        if (isBoss) {
            this.speed = CONFIG.bossBean.speed;
        } else {
            // Create speed tiers for more organized falling
            const speedTiers = [
                CONFIG.bean.minSpeed,
                CONFIG.bean.minSpeed + 1,
                CONFIG.bean.minSpeed + 2,
                CONFIG.bean.maxSpeed
            ];
            this.speed = speedTiers[Math.floor(Math.random() * speedTiers.length)];
        }
        
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.15; // Slightly slower rotation
        this.glowPhase = Math.random() * Math.PI * 2;
        
        // Add slight horizontal drift for more natural movement
        this.horizontalDrift = (Math.random() - 0.5) * 0.3;
        this.driftPhase = Math.random() * Math.PI * 2;
    }

    update(gameSpeed) {
        this.y += this.speed * gameSpeed;
        this.rotation += this.rotationSpeed;
        this.glowPhase += 0.1;
        
        // Add subtle horizontal drift for more natural falling
        this.driftPhase += 0.05;
        this.x += Math.sin(this.driftPhase) * this.horizontalDrift;
        
        // Keep beans within screen bounds
        this.x = Math.max(0, Math.min(CONFIG.canvas.width - this.width, this.x));
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);

        if (this.isBoss) {
            // Boss bean glow effect
            const glowIntensity = Math.sin(this.glowPhase) * 0.3 + 0.7;
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15 * glowIntensity;
            
            // Boss bean (golden)
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(0.7, '#FFA500');
            gradient.addColorStop(1, '#FF8C00');
            ctx.fillStyle = gradient;
        } else {
            // Regular bean (brown)
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
            gradient.addColorStop(0, '#8B4513');
            gradient.addColorStop(0.7, '#654321');
            gradient.addColorStop(1, '#3C1810');
            ctx.fillStyle = gradient;
        }

        // Bean shape
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bean crack
        ctx.strokeStyle = this.isBoss ? '#B8860B' : '#2F1B14';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 3);
        ctx.quadraticCurveTo(-this.width / 6, 0, 0, this.height / 3);
        ctx.stroke();

        // Highlight
        ctx.fillStyle = this.isBoss ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.ellipse(-this.width / 6, -this.height / 6, this.width / 6, this.height / 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }

    isOffScreen() {
        return this.y > CONFIG.canvas.height;
    }
}

// Particle System for Effects
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    addCatchEffect(x, y, isBoss = false) {
        const particleCount = isBoss ? 15 : 8;
        const color = isBoss ? '#FFD700' : '#8B4513';
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 2,
                life: 1,
                decay: 0.02,
                size: Math.random() * 6 + 2,
                color: color
            });
        }
    }

    addMissEffect(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 2 + 1,
                life: 1,
                decay: 0.03,
                size: Math.random() * 4 + 1,
                color: '#FF6B6B'
            });
        }
    }

    update() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // gravity
            particle.life -= particle.decay;
            return particle.life > 0;
        });
    }

    draw(ctx) {
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}

// Background Class
class Background {
    constructor() {
        this.steamParticles = [];
        this.decorativeElements = this.generateDecorations();
    }

    generateDecorations() {
        const decorations = [];
        // Add some coffee shop decorative elements
        for (let i = 0; i < 5; i++) {
            decorations.push({
                x: Math.random() * CONFIG.canvas.width,
                y: Math.random() * CONFIG.canvas.height,
                size: Math.random() * 20 + 10,
                opacity: Math.random() * 0.1 + 0.05,
                type: Math.floor(Math.random() * 3) // Different decoration types
            });
        }
        return decorations;
    }

    update() {
        // Add ambient steam
        if (Math.random() < 0.1) {
            this.steamParticles.push({
                x: Math.random() * CONFIG.canvas.width,
                y: CONFIG.canvas.height + 10,
                opacity: 0.3,
                size: Math.random() * 15 + 5,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -Math.random() * 1 - 0.5
            });
        }

        // Update steam particles
        this.steamParticles = this.steamParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.opacity -= 0.005;
            particle.size += 0.05;
            return particle.opacity > 0 && particle.y > -50;
        });
    }

    draw(ctx) {
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.canvas.height);
        gradient.addColorStop(0, '#F5E6D3');
        gradient.addColorStop(0.5, '#E8D5B7');
        gradient.addColorStop(1, '#D2B48C');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        // Draw decorative elements
        this.decorativeElements.forEach(decoration => {
            ctx.save();
            ctx.globalAlpha = decoration.opacity;
            ctx.fillStyle = '#8B4513';
            
            switch (decoration.type) {
                case 0: // Coffee bean shape
                    ctx.beginPath();
                    ctx.ellipse(decoration.x, decoration.y, decoration.size, decoration.size * 1.2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 1: // Circle
                    ctx.beginPath();
                    ctx.arc(decoration.x, decoration.y, decoration.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 2: // Square
                    ctx.fillRect(decoration.x - decoration.size/2, decoration.y - decoration.size/2, decoration.size, decoration.size);
                    break;
            }
            ctx.restore();
        });

        // Draw ambient steam
        this.steamParticles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}

// Main Game Class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = new GameState();
        this.player = new Player(CONFIG.player.startX, CONFIG.player.startY);
        this.beans = [];
        this.particles = new ParticleSystem();
        this.background = new Background();
        
        this.setupEventListeners();
        this.setupUI();
        // Initialize daily attempts tracking UI
        this.ensureAttemptsInitialized();
        this.updateAttemptsUI();
        
        // Start game loop
        this.gameLoop();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.state.gameRunning) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.player.moveTo(Math.max(0, this.player.x - 30));
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.player.moveTo(Math.min(CONFIG.canvas.width, this.player.x + this.player.width + 30));
                    break;
            }
        });

        // Mouse/Touch controls
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.state.gameRunning) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            this.player.moveTo(x);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.state.gameRunning) return;
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left;
            this.player.moveTo(x);
        });

        // Prevent scrolling on touch
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
        this.canvas.addEventListener('touchend', (e) => e.preventDefault());
    }

    setupUI() {
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');
        const playAgainBtn = document.getElementById('playAgainBtn');
        const shareBtn = document.getElementById('shareBtn');
        const facebookFollowBtn = document.getElementById('facebookFollowBtn');
        const tiktokFollowBtn = document.getElementById('tiktokFollowBtn');

        startBtn.addEventListener('click', () => this.tryStartNewRun('start'));
        restartBtn.addEventListener('click', () => this.tryStartNewRun('restart'));
        playAgainBtn.addEventListener('click', () => this.tryStartNewRun('restart'));
        shareBtn.addEventListener('click', () => this.shareScore());
        
        // Social media follow buttons
        if (facebookFollowBtn) {
            facebookFollowBtn.addEventListener('click', () => this.handleSocialFollow('facebook'));
        }
        if (tiktokFollowBtn) {
            tiktokFollowBtn.addEventListener('click', () => this.handleSocialFollow('tiktok'));
        }
    }

    // ===== Daily Attempts (3/day) =====
    getTodayKey() {
        return new Date().toISOString().slice(0, 10);
    }

    ensureAttemptsInitialized() {
        const today = this.getTodayKey();
        const savedDate = localStorage.getItem('flavour_attempts_date');
        if (savedDate !== today) {
            localStorage.setItem('flavour_attempts_date', today);
            localStorage.setItem('flavour_attempts_count', '0');
        } else if (localStorage.getItem('flavour_attempts_count') === null) {
            localStorage.setItem('flavour_attempts_count', '0');
        }
    }

    getAttemptsCount() {
        this.ensureAttemptsInitialized();
        const val = parseInt(localStorage.getItem('flavour_attempts_count') || '0', 10);
        return isNaN(val) ? 0 : val;
    }

    remainingAttempts() {
        const baseAttempts = 3;
        const bonusAttempts = this.getBonusAttempts();
        const totalAllowed = baseAttempts + bonusAttempts;
        return Math.max(0, totalAllowed - this.getAttemptsCount());
    }

    canPlay() {
        return this.remainingAttempts() > 0;
    }

    incrementAttempt() {
        this.ensureAttemptsInitialized();
        const current = this.getAttemptsCount();
        const maxAttempts = 3 + this.getBonusAttempts();
        localStorage.setItem('flavour_attempts_count', String(Math.min(maxAttempts, current + 1)));
        this.updateAttemptsUI();
    }

    updateAttemptsUI() {
        const el = document.getElementById('attemptsInfo');
        const startBtn = document.getElementById('startBtn');
        const bonusAttempts = this.getBonusAttempts();
        const totalAttempts = 3 + bonusAttempts;
        
        if (el) {
            let text = `المحاولات المتبقية اليوم: ${this.remainingAttempts()} من ${totalAttempts}`;
            if (bonusAttempts > 0) {
                text += ` (${bonusAttempts} محاولة إضافية)`;
            }
            el.textContent = text;
        }
        if (startBtn) {
            const can = this.canPlay();
            startBtn.disabled = !can;
            startBtn.textContent = can ? 'Start Brewing!' : 'No attempts left today';
        }
    }

    showNoAttemptsMessage() {
        const bonusSection = document.getElementById('bonusAttemptsSection');
        if (bonusSection && this.canEarnBonusAttempts()) {
            // Don't show the alert, instead show the bonus section
            return;
        }
        const totalAttempts = 3 + this.getBonusAttempts();
        alert(`لقد استخدمت كل محاولاتك اليوم (${totalAttempts}). الرجاء المحاولة غدًا.`);
    }

    tryStartNewRun(mode) {
        // mode: 'start' | 'restart'
        if (!this.canPlay()) {
            this.showNoAttemptsMessage();
            this.updateAttemptsUI();
            return;
        }

        // Consume an attempt when a new run starts
        this.incrementAttempt();

        if (mode === 'restart') {
            // Ensure previous overlays are hidden and state is reset
            document.getElementById('gameOverScreen').style.display = 'none';
            document.getElementById('winScreen').style.display = 'none';
            this.state.reset();
            this.beans = [];
            this.particles = new ParticleSystem();
            this.player = new Player(CONFIG.player.startX, CONFIG.player.startY);
            this.startGame();
        } else {
            this.startGame();
        }
    }

    startGame() {
        document.getElementById('startScreen').style.display = 'none';
        this.state.gameRunning = true;
        this.state.gameStarted = true;
        this.updateUI();
    }

    restartGame() {
        // kept for backward compatibility if called somewhere else
        this.tryStartNewRun('restart');
    }

    spawnBean() {
        // Don't spawn if too many beans on screen
        if (this.beans.length >= CONFIG.bean.maxBeansOnScreen) {
            return;
        }

        // Update spawn timer
        this.state.spawnTimer++;

        // Check if it's time to spawn a bean
        if (this.state.spawnTimer >= this.state.currentSpawnInterval) {
            this.state.spawnTimer = 0;
            
            // Gradually decrease spawn interval (increase frequency) as game progresses
            this.state.currentSpawnInterval = Math.max(20, CONFIG.bean.spawnInterval - (this.state.beansCollected * 0.5));
            
            // Determine spawn position with some organization
            let x;
            const sections = 4; // Divide screen into sections
            const sectionWidth = CONFIG.canvas.width / sections;
            const randomSection = Math.floor(Math.random() * sections);
            
            // Add some randomness within the section
            x = randomSection * sectionWidth + Math.random() * (sectionWidth - CONFIG.bean.width);
            
            // Ensure beans don't spawn too close to edges
            x = Math.max(10, Math.min(CONFIG.canvas.width - CONFIG.bean.width - 10, x));
            
            // Check for boss bean spawn
            const shouldSpawnBoss = this.state.bossProgress >= CONFIG.bossBean.progressThreshold && 
                                  Math.random() < 0.3; // 30% chance when progress is full
            
            this.beans.push(new Bean(x, -CONFIG.bean.height, shouldSpawnBoss));
            
            if (shouldSpawnBoss) {
                this.state.bossProgress = 0;
                // Spawn fewer regular beans after boss bean
                this.state.spawnTimer = -30; // Delay next spawn
            }
        }
    }

    checkCollisions() {
        const playerBounds = this.player.getBounds();
        
        for (let i = this.beans.length - 1; i >= 0; i--) {
            const bean = this.beans[i];
            const beanBounds = bean.getBounds();
            
            // Check if bean is caught
            if (beanBounds.bottom >= playerBounds.top &&
                beanBounds.right >= playerBounds.left &&
                beanBounds.left <= playerBounds.right &&
                beanBounds.top <= playerBounds.bottom) {
                
                // Bean caught!
                this.catchBean(bean, i);
            } else if (bean.isOffScreen()) {
                // Bean missed!
                this.missBean(bean, i);
            }
        }
    }

    catchBean(bean, index) {
        if (bean.isBoss) {
            this.state.score += CONFIG.game.pointsPerBossBean;
            this.state.bossBeansCollected++;
            this.applyBossBonus();
            this.playSound('bossSound');
            
            // Check for win condition
            if (this.state.bossBeansCollected >= CONFIG.game.bossBeansToWin) {
                this.gameWin();
                return;
            }
        } else {
            this.state.score += CONFIG.game.pointsPerBean;
            this.state.beansCollected++;
            this.state.bossProgress = Math.min(CONFIG.bossBean.progressThreshold, this.state.bossProgress + 10);
            this.playSound('catchSound');
        }

        this.particles.addCatchEffect(bean.x + bean.width / 2, bean.y + bean.height / 2, bean.isBoss);
        this.beans.splice(index, 1);
        this.updateUI();
    }

    missBean(bean, index) {
        this.state.hearts--;
        this.particles.addMissEffect(bean.x + bean.width / 2, bean.y + bean.height / 2);
        this.beans.splice(index, 1);
        this.playSound('missSound');
        this.updateUI();

        if (this.state.hearts <= 0) {
            this.gameOver();
        }
    }

    applyBossBonus() {
        const bonusType = Math.floor(Math.random() * 3);
        
        switch (bonusType) {
            case 0: // Extra heart
                if (this.state.hearts < CONFIG.game.maxHearts) {
                    this.state.hearts++;
                }
                break;
            case 1: // Slow motion
                this.state.gameSpeed = Math.max(0.5, this.state.gameSpeed - 0.3);
                setTimeout(() => {
                    this.state.gameSpeed = Math.min(2, this.state.gameSpeed + 0.3);
                }, 3000);
                break;
            case 2: // Extra points
                this.state.score += CONFIG.game.pointsPerBossBean;
                break;
        }
    }

    gameOver() {
        this.state.gameRunning = false;
        document.getElementById('finalScore').textContent = this.state.score;
        document.getElementById('gameOverScreen').style.display = 'flex';
        
        // Show bonus attempts section if user can earn more attempts
        this.updateBonusAttemptsSection();
        this.updateAttemptsUI();
    }

    gameWin() {
        this.state.gameRunning = false;
        this.state.gameWon = true;
        document.getElementById('winScore').textContent = this.state.score;
        document.getElementById('winBossBeans').textContent = this.state.bossBeansCollected;
        document.getElementById('winScreen').style.display = 'flex';
        this.playSound('bossSound'); // Victory sound
        this.updateAttemptsUI();
    }

    shareScore() {
        const shareText = `🎉 لقد فزت في لعبة Flavour! 
☕ النتيجة: ${this.state.score} نقطة
⭐ حبوب البوس: ${this.state.bossBeansCollected}/10
🎁 حصلت على خصم 15%!

العب الآن: ${window.location.href}`;

        if (navigator.share) {
            // Use native sharing on mobile
            navigator.share({
                title: 'Flavour - Bean Catcher Game',
                text: shareText,
                url: window.location.href
            }).catch(() => {
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }

    fallbackShare(text) {
        // Copy to clipboard as fallback
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert('تم نسخ النتيجة! يمكنك مشاركتها الآن 📋');
            }).catch(() => {
                this.showShareModal(text);
            });
        } else {
            this.showShareModal(text);
        }
    }

    showShareModal(text) {
        // Create a simple modal for sharing
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 1000; padding: 20px;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white; padding: 20px; border-radius: 10px;
            max-width: 400px; text-align: center; font-family: 'Comfortaa', cursive;
        `;
        
        content.innerHTML = `
            <h3>مشاركة النتيجة</h3>
            <textarea readonly style="width: 100%; height: 120px; margin: 10px 0; padding: 10px; border-radius: 5px; border: 1px solid #ccc;">${text}</textarea>
            <button onclick="this.parentElement.parentElement.remove()" style="background: #FFD700; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">إغلاق</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
    }

    updateUI() {
        document.getElementById('score').textContent = this.state.score;
        
        // Update hearts
        const heartsContainer = document.getElementById('hearts');
        heartsContainer.innerHTML = '';
        for (let i = 0; i < CONFIG.game.maxHearts; i++) {
            const heart = document.createElement('span');
            heart.className = 'heart';
            heart.textContent = '❤️';
            if (i >= this.state.hearts) {
                heart.classList.add('lost');
            }
            heartsContainer.appendChild(heart);
        }

        // Update boss progress
        const progressFill = document.getElementById('bossProgress');
        const progressPercent = (this.state.bossProgress / CONFIG.bossBean.progressThreshold) * 100;
        progressFill.style.width = `${progressPercent}%`;

        // Update boss counter
        document.getElementById('bossCounter').textContent = this.state.bossBeansCollected;
    }

    playSound(soundId) {
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => {}); // Ignore audio play errors
        }
    }

    // ===== Social Media Follow & Bonus Attempts =====
    getBonusAttempts() {
        const today = this.getTodayKey();
        const savedDate = localStorage.getItem('flavour_bonus_date');
        if (savedDate !== today) {
            // Reset bonus attempts for new day
            localStorage.setItem('flavour_bonus_date', today);
            localStorage.removeItem('flavour_facebook_followed');
            localStorage.removeItem('flavour_tiktok_followed');
            return 0;
        }
        
        let bonus = 0;
        if (localStorage.getItem('flavour_facebook_followed') === 'true') bonus++;
        if (localStorage.getItem('flavour_tiktok_followed') === 'true') bonus++;
        return bonus;
    }

    canEarnBonusAttempts() {
        return !this.hasFollowedFacebook() || !this.hasFollowedTikTok();
    }

    hasFollowedFacebook() {
        return localStorage.getItem('flavour_facebook_followed') === 'true';
    }

    hasFollowedTikTok() {
        return localStorage.getItem('flavour_tiktok_followed') === 'true';
    }

    updateBonusAttemptsSection() {
        const bonusSection = document.getElementById('bonusAttemptsSection');
        const facebookBtn = document.getElementById('facebookFollowBtn');
        const tiktokBtn = document.getElementById('tiktokFollowBtn');
        const bonusStatus = document.getElementById('bonusStatus');
        
        if (!bonusSection) return;

        // Show section only if user has no attempts left and can earn bonus attempts
        const shouldShow = !this.canPlay() && this.canEarnBonusAttempts();
        bonusSection.style.display = shouldShow ? 'block' : 'none';
        
        if (!shouldShow) return;

        // Update button states
        if (facebookBtn) {
            const followed = this.hasFollowedFacebook();
            facebookBtn.disabled = followed;
            facebookBtn.textContent = followed ? '✓ تم المتابعة على فيسبوك' : '📘 تابع على فيسبوك (+1 محاولة)';
        }

        if (tiktokBtn) {
            const followed = this.hasFollowedTikTok();
            tiktokBtn.disabled = followed;
            tiktokBtn.textContent = followed ? '✓ تم المتابعة على تيكتوك' : '🎵 تابع على تيكتوك (+1 محاولة)';
        }

        // Update status message
        if (bonusStatus) {
            const bonusEarned = this.getBonusAttempts();
            if (bonusEarned > 0) {
                bonusStatus.textContent = `🎉 لقد حصلت على ${bonusEarned} محاولة إضافية!`;
                bonusStatus.style.color = '#4CAF50';
            } else {
                bonusStatus.textContent = '';
            }
        }
    }

    handleSocialFollow(platform) {
        const urls = {
            facebook: 'https://www.facebook.com/profile.php?id=61551816943530&locale=ar_AR',
            tiktok: 'https://www.tiktok.com/@flavourcafe?is_from_webapp=1&sender_device=pc'
        };
        
        const confirmMessage = platform === 'facebook' 
            ? 'سيتم فتح صفحة فيسبوك للمتابعة. هل تريد المتابعة؟'
            : 'سيتم فتح صفحة تيكتوك للمتابعة. هل تريد المتابعة؟';
        
        if (confirm(confirmMessage)) {
            // Open social media page in new tab
            window.open(urls[platform], '_blank');
            
            // Mark as followed after a short delay (assuming user will follow)
            setTimeout(() => {
                const storageKey = `flavour_${platform}_followed`;
                localStorage.setItem(storageKey, 'true');
                
                // Update UI
                this.updateBonusAttemptsSection();
                this.updateAttemptsUI();
                
                // Show success message
                const bonusStatus = document.getElementById('bonusStatus');
                if (bonusStatus) {
                    bonusStatus.textContent = '🎉 تم! حصلت على محاولة إضافية!';
                    bonusStatus.style.color = '#4CAF50';
                }
            }, 2000); // 2 second delay to allow page to open
        }
    }

    update() {
        if (!this.state.gameRunning) return;

        // Increase game difficulty over time
        this.state.gameSpeed += CONFIG.bean.speedIncrease;

        // Update game objects
        this.background.update();
        this.player.update();
        this.particles.update();

        // Spawn new beans
        this.spawnBean();

        // Update beans
        this.beans.forEach(bean => bean.update(this.state.gameSpeed));

        // Check collisions
        this.checkCollisions();
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        // Draw game objects
        this.background.draw(this.ctx);
        this.player.draw(this.ctx);
        this.beans.forEach(bean => bean.draw(this.ctx));
        this.particles.draw(this.ctx);
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new Game();
});
