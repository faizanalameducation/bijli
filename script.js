class IndianSwitchController {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.bindEvents();
        this.setupAccessibility();
    }

    initializeElements() {
        // Main elements
        this.switchToggle = document.getElementById('switchToggle');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = this.statusIndicator.querySelector('.status-text');
        this.wall = document.querySelector('.wall');
        
        // Audio element
        this.switchSound = document.getElementById('switchSound');
    }

    initializeState() {
        this.isOn = false;
        this.isAnimating = false;
        
        // Set volume to 70%
        this.switchSound.volume = 0.7;
        
        // Device detection
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    bindEvents() {
        // Main switch interactions
        this.switchToggle.addEventListener('click', (e) => this.handleSwitchClick(e));
        
        // Touch events for mobile
        if (this.isTouch) {
            this.switchToggle.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
            this.switchToggle.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        }
        
        // Keyboard support
        this.switchToggle.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Audio event listeners
        this.switchSound.addEventListener('ended', () => this.handleSoundEnd());
        this.switchSound.addEventListener('error', () => this.handleSoundError());
        
        // Prevent context menu
        this.switchToggle.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Prevent double-tap zoom on mobile
        if (this.isMobile) {
            this.preventDoubleTabZoom();
        }
    }

    setupAccessibility() {
        // Set ARIA attributes
        this.switchToggle.setAttribute('aria-pressed', 'false');
        this.switchToggle.setAttribute('aria-describedby', 'status-text');
    }

    handleSwitchClick(event) {
        if (this.isAnimating) return;
        
        event.preventDefault();
        this.toggleSwitch();
    }

    handleTouchStart(event) {
        if (this.isAnimating) return;
        
        // Add visual feedback for touch
        this.switchToggle.style.transform = 'scale(0.95)';
        
        // Prevent scrolling when touching the switch
        event.preventDefault();
    }

    handleTouchEnd(event) {
        if (this.isAnimating) return;
        
        event.preventDefault();
        
        // Reset visual feedback
        this.switchToggle.style.transform = '';
        
        // Check if touch ended on the switch
        const touch = event.changedTouches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element && (element === this.switchToggle || this.switchToggle.contains(element))) {
            this.toggleSwitch();
        }
    }

    handleKeyPress(event) {
        if (event.code === 'Space' || event.code === 'Enter') {
            event.preventDefault();
            if (!this.isAnimating) {
                this.toggleSwitch();
            }
        }
    }

    async toggleSwitch() {
        // Prevent multiple activations
        this.isAnimating = true;
        this.switchToggle.style.pointerEvents = 'none';
        
        // Update ARIA state
        this.switchToggle.setAttribute('aria-pressed', 'true');
        
        // Add visual animations
        this.switchToggle.classList.add('switch-animate');
        this.wall.classList.add('wall-shake');
        
        // Turn switch ON
        this.isOn = true;
        this.updateSwitchState();
        
        // Haptic feedback for mobile devices
        if (this.isTouch && navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Play sound
        await this.playSound();
        
        // Clean up animations
        setTimeout(() => {
            this.switchToggle.classList.remove('switch-animate');
            this.wall.classList.remove('wall-shake');
        }, 400);
    }

    updateSwitchState() {
        if (this.isOn) {
            this.switchToggle.classList.add('on');
            this.statusIndicator.classList.add('on');
            this.statusText.textContent = 'चालू';
            this.switchToggle.setAttribute('aria-pressed', 'true');
        } else {
            this.switchToggle.classList.remove('on');
            this.statusIndicator.classList.remove('on');
            this.statusText.textContent = 'बंद';
            this.switchToggle.setAttribute('aria-pressed', 'false');
        }
    }

    async playSound() {
        try {
            // Reset sound to beginning
            this.switchSound.currentTime = 0;
            
            // Play the sound
            const playPromise = this.switchSound.play();
            
            if (playPromise !== undefined) {
                await playPromise;
            }
        } catch (error) {
            console.warn('Sound playback failed:', error);
            // Fallback timeout if sound fails
            setTimeout(() => this.handleSoundEnd(), 2000);
        }
    }

    handleSoundEnd() {
        // Turn switch back to OFF
        this.isOn = false;
        this.updateSwitchState();
        
        // Re-enable interactions
        this.isAnimating = false;
        this.switchToggle.style.pointerEvents = 'auto';
        
        // Reset transform if any
        this.switchToggle.style.transform = '';
    }

    handleSoundError() {
        console.error('Audio playback error');
        this.handleSoundEnd();
    }

    preventDoubleTabZoom() {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }
}

// Enhanced initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize switch controller
    const switchController = new IndianSwitchController();
    
    // Performance optimization for mobile
    if ('serviceWorker' in navigator) {
        // Optional: Add service worker for better performance
    }
    
    // Preload audio on user interaction
    document.addEventListener('click', () => {
        const audio = document.getElementById('switchSound');
        if (audio && audio.readyState < 4) {
            audio.load();
        }
    }, { once: true });
});

// Additional mobile optimizations
if ('ontouchstart' in window) {
    // Enable hardware acceleration
    document.body.style.transform = 'translateZ(0)';
    
    // Optimize scrolling
    document.body.style.webkitOverflowScrolling = 'touch';
}

// Handle orientation changes
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        // Force repaint after orientation change
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
    }, 100);
});
