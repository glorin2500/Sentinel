// Visual enhancement utilities

// Celebration animations for safe scans
export function triggerCelebration(type: 'safe' | 'milestone' | 'achievement' = 'safe') {
    const effects = {
        safe: {
            emoji: ['✨', '🎉', '✅', '🛡️'],
            colors: ['#7CFFB2', '#4ECDC4', '#95E1D3']
        },
        milestone: {
            emoji: ['🎊', '🏆', '⭐', '🌟'],
            colors: ['#FFD700', '#FFA500', '#FF6B6B']
        },
        achievement: {
            emoji: ['🏅', '👑', '💎', '🎖️'],
            colors: ['#9B59B6', '#E74C3C', '#3498DB']
        }
    };

    const config = effects[type];

    // Create confetti-like elements
    for (let i = 0; i < 15; i++) {
        const emoji = config.emoji[Math.floor(Math.random() * config.emoji.length)];
        createFloatingEmoji(emoji, config.colors);
    }
}

function createFloatingEmoji(emoji: string, colors: string[]) {
    const element = document.createElement('div');
    element.textContent = emoji;
    element.style.position = 'fixed';
    element.style.fontSize = `${20 + Math.random() * 20}px`;
    element.style.left = `${Math.random() * 100}%`;
    element.style.top = '100%';
    element.style.zIndex = '9999';
    element.style.pointerEvents = 'none';
    element.style.userSelect = 'none';

    // Random rotation
    const rotation = Math.random() * 360;
    element.style.transform = `rotate(${rotation}deg)`;

    document.body.appendChild(element);

    // Animate
    const duration = 2000 + Math.random() * 1000;
    const distance = 300 + Math.random() * 200;
    const drift = (Math.random() - 0.5) * 100;

    element.animate([
        {
            transform: `translateY(0) translateX(0) rotate(${rotation}deg)`,
            opacity: 1
        },
        {
            transform: `translateY(-${distance}px) translateX(${drift}px) rotate(${rotation + 360}deg)`,
            opacity: 0
        }
    ], {
        duration,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }).onfinish = () => {
        element.remove();
    };
}

// Sound effects
export class SoundEffects {
    private audioContext: AudioContext | null = null;
    private enabled: boolean = true;

    constructor() {
        if (typeof window !== 'undefined' && 'AudioContext' in window) {
            this.audioContext = new AudioContext();
        }
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // UI interaction sounds
    click() {
        this.playTone(800, 0.05, 'square');
    }

    hover() {
        this.playTone(1200, 0.03, 'sine');
    }

    success() {
        if (!this.audioContext) return;
        this.playTone(523.25, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 0.1), 100); // E5
        setTimeout(() => this.playTone(783.99, 0.15), 200); // G5
    }

    error() {
        if (!this.audioContext) return;
        this.playTone(200, 0.1, 'sawtooth');
        setTimeout(() => this.playTone(150, 0.15, 'sawtooth'), 100);
    }

    levelUp() {
        if (!this.audioContext) return;
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.15), i * 100);
        });
    }

    achievement() {
        if (!this.audioContext) return;
        // Triumphant sound
        this.playTone(523.25, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 0.1), 80); // E5
        setTimeout(() => this.playTone(783.99, 0.1), 160); // G5
        setTimeout(() => this.playTone(1046.50, 0.3), 240); // C6
    }

    scan() {
        if (!this.audioContext) return;
        // Scanning beep
        this.playTone(1000, 0.05, 'square');
        setTimeout(() => this.playTone(1200, 0.05, 'square'), 50);
    }
}

// Haptic feedback simulation
export class HapticFeedback {
    private enabled: boolean = true;

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    private vibrate(pattern: number | number[]) {
        if (!this.enabled) return;
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    light() {
        this.vibrate(10);
    }

    medium() {
        this.vibrate(20);
    }

    heavy() {
        this.vibrate(30);
    }

    success() {
        this.vibrate([10, 50, 10]);
    }

    error() {
        this.vibrate([20, 100, 20, 100, 20]);
    }

    selection() {
        this.vibrate(5);
    }
}

// Global instances
export const soundEffects = new SoundEffects();
export const hapticFeedback = new HapticFeedback();

// Helper function for easy haptic triggering
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection') {
    switch (type) {
        case 'light':
            hapticFeedback.light();
            break;
        case 'medium':
            hapticFeedback.medium();
            break;
        case 'heavy':
            hapticFeedback.heavy();
            break;
        case 'success':
            hapticFeedback.success();
            break;
        case 'error':
            hapticFeedback.error();
            break;
        case 'warning':
            hapticFeedback.medium(); // Use medium for warning
            break;
        case 'selection':
            hapticFeedback.selection();
            break;
    }
}

// Particle effects for backgrounds
export function createParticleEffect(container: HTMLElement, count: number = 20) {
    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(124, 255, 178, 0.3);
            border-radius: 50%;
            pointer-events: none;
        `;

        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;

        container.appendChild(particle);
        particles.push(particle);

        // Animate
        animateParticle(particle);
    }

    return () => {
        particles.forEach(p => p.remove());
    };
}

function animateParticle(particle: HTMLDivElement) {
    const duration = 3000 + Math.random() * 2000;
    const distance = 50 + Math.random() * 100;
    const angle = Math.random() * Math.PI * 2;

    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    particle.animate([
        {
            transform: 'translate(0, 0)',
            opacity: 0.3
        },
        {
            transform: `translate(${dx}px, ${dy}px)`,
            opacity: 0
        }
    ], {
        duration,
        easing: 'ease-out'
    }).onfinish = () => {
        // Reset and animate again
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        animateParticle(particle);
    };
}

// Shimmer effect for loading states
export function addShimmerEffect(element: HTMLElement) {
    element.style.position = 'relative';
    element.style.overflow = 'hidden';

    const shimmer = document.createElement('div');
    shimmer.style.cssText = `
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
        );
        animation: shimmer 2s infinite;
    `;

    element.appendChild(shimmer);

    return () => shimmer.remove();
}

// Glow pulse effect
export function addGlowPulse(element: HTMLElement, color: string = '#7CFFB2') {
    const animation = element.animate([
        {
            boxShadow: `0 0 0 0 ${color}00`
        },
        {
            boxShadow: `0 0 20px 5px ${color}80`
        },
        {
            boxShadow: `0 0 0 0 ${color}00`
        }
    ], {
        duration: 2000,
        iterations: Infinity,
        easing: 'ease-in-out'
    });

    return () => animation.cancel();
}
