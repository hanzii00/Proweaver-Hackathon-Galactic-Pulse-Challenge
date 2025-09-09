// Index page functionality
document.addEventListener('DOMContentLoaded', function() {
    createStarfield();
    addMenuAnimations();
});

function createStarfield() {
    const starfield = document.getElementById('starfield');
    if (!starfield) return;
    
    // Clear existing stars
    starfield.innerHTML = '';
    
    // Create stars
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.position = 'absolute';
        star.style.background = 'white';
        star.style.borderRadius = '50%';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = Math.random() * 3 + 1 + 'px';
        star.style.height = star.style.width;
        star.style.animation = `twinkle ${Math.random() * 3 + 2}s infinite alternate`;
        star.style.animationDelay = Math.random() * 2 + 's';
        starfield.appendChild(star);
    }
}

function addMenuAnimations() {
    const menuButtons = document.querySelectorAll('.menu-btn');
    
    menuButtons.forEach((button, index) => {
        // Add hover effects
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
        
        // Add click animation
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
        
        // Animate buttons on load
        setTimeout(() => {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Navigation functions
function navigateTo(page) {
    window.location.href = page;
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    switch(e.key) {
        case '1':
            navigateTo('game.html');
            break;
        case '2':
            navigateTo('howtoplay.html');
            break;
        case '3':
            navigateTo('score.html');
            break;
        case '4':
            navigateTo('settings.html');
            break;
        case '5':
            navigateTo('about.html');
            break;
        case 'Enter':
            // Start game with Enter key
            navigateTo('game.html');
            break;
    }
});