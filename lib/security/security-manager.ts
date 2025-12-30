// Security enhancements

// PIN/Password protection
export interface SecuritySettings {
    pinEnabled: boolean;
    pinHash?: string;
    autoLockEnabled: boolean;
    autoLockTimeout: number; // minutes
    biometricForExport: boolean;
    biometricForSettings: boolean;
    panicModeEnabled: boolean;
    lastActivity: number;
}

// Simple hash function (in production, use bcrypt or similar)
export async function hashPin(pin: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
    const pinHash = await hashPin(pin);
    return pinHash === hash;
}

// Auto-lock functionality
export class AutoLockManager {
    private timeout: NodeJS.Timeout | null = null;
    private lockCallback: (() => void) | null = null;
    private timeoutMinutes: number = 5;

    setLockCallback(callback: () => void) {
        this.lockCallback = callback;
    }

    setTimeoutMinutes(minutes: number) {
        this.timeoutMinutes = minutes;
    }

    resetTimer() {
        this.clearTimer();
        this.startTimer();
    }

    startTimer() {
        if (!this.lockCallback) return;

        this.timeout = setTimeout(() => {
            this.lockCallback?.();
        }, this.timeoutMinutes * 60 * 1000);
    }

    clearTimer() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    destroy() {
        this.clearTimer();
        this.lockCallback = null;
    }
}

// Encrypted backup/restore
export interface BackupData {
    version: string;
    timestamp: number;
    data: {
        scans: any[];
        favorites: string[];
        preferences: any;
        gamification: any;
    };
}

export async function createBackup(data: BackupData['data']): Promise<string> {
    const backup: BackupData = {
        version: '1.0.0',
        timestamp: Date.now(),
        data
    };

    // Convert to JSON and encode
    const json = JSON.stringify(backup);
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(json);

    // Simple encryption using AES-GCM (in production, use user-provided password)
    const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
    );

    // Export key
    const exportedKey = await crypto.subtle.exportKey('raw', key);

    // Combine IV + encrypted data + key
    const combined = new Uint8Array(iv.length + encrypted.byteLength + exportedKey.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    combined.set(new Uint8Array(exportedKey), iv.length + encrypted.byteLength);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
}

export async function restoreBackup(encryptedData: string): Promise<BackupData['data']> {
    try {
        // Decode from base64
        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

        // Extract IV, encrypted data, and key
        const iv = combined.slice(0, 12);
        const encrypted = combined.slice(12, -32);
        const keyData = combined.slice(-32);

        // Import key
        const key = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );

        // Decrypt
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encrypted
        );

        // Decode and parse
        const decoder = new TextDecoder();
        const json = decoder.decode(decrypted);
        const backup: BackupData = JSON.parse(json);

        return backup.data;
    } catch (error) {
        throw new Error('Failed to restore backup. Invalid or corrupted data.');
    }
}

// Panic mode - quick data wipe
export function panicModeWipe(): void {
    if (typeof window === 'undefined') return;

    // Clear all localStorage
    localStorage.clear();

    // Clear all sessionStorage
    sessionStorage.clear();

    // Clear all cookies
    document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });

    // Clear IndexedDB (if used)
    if ('indexedDB' in window) {
        indexedDB.databases().then(databases => {
            databases.forEach(db => {
                if (db.name) {
                    indexedDB.deleteDatabase(db.name);
                }
            });
        });
    }

    // Redirect to a blank page or login
    window.location.href = '/';
}

// Biometric re-authentication
export async function requestBiometricAuth(reason: string = 'Authenticate to continue'): Promise<boolean> {
    // Check if Web Authentication API is available
    if (!('credentials' in navigator)) {
        console.warn('Web Authentication API not available');
        return false;
    }

    try {
        // In a real implementation, you would use WebAuthn
        // For now, we'll simulate with a promise
        return new Promise((resolve) => {
            // Simulate biometric prompt
            const confirmed = confirm(`${reason}\n\nSimulated biometric authentication.`);
            resolve(confirmed);
        });
    } catch (error) {
        console.error('Biometric authentication failed:', error);
        return false;
    }
}

// Activity tracking for auto-lock
export class ActivityTracker {
    private lastActivity: number = Date.now();
    private listeners: (() => void)[] = [];

    constructor() {
        if (typeof window !== 'undefined') {
            // Track user activity
            ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
                document.addEventListener(event, () => this.updateActivity(), true);
            });
        }
    }

    updateActivity() {
        this.lastActivity = Date.now();
        this.listeners.forEach(listener => listener());
    }

    getLastActivity(): number {
        return this.lastActivity;
    }

    getInactiveTime(): number {
        return Date.now() - this.lastActivity;
    }

    onActivity(callback: () => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }
}

// Global instances
export const activityTracker = new ActivityTracker();
export const autoLockManager = new AutoLockManager();
