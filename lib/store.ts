import { create } from 'zustand';
import { MerchantCategory } from './analytics/advanced-analytics';

export interface ScanResult {
    id: string;
    upiId: string;
    status: 'safe' | 'warning' | 'risky';
    timestamp: number;
    merchantName?: string;
    threatType?: string;
    location?: {
        city?: string;
        region?: string;
    };
    amount?: number;
    notes?: string;
    aiPrediction?: {
        confidence: number;
        factors: string[];
        recommendation: string;
    };
    category?: MerchantCategory;
    tags?: string[];
}

interface UserPreferences {
    enableSmartSuggestions: boolean;
    enableRiskyAlerts: boolean;
    enableLocationAlerts: boolean;
    notificationSound: boolean;
    autoAddFrequentToFavorites: number;
    soundEffectsEnabled: boolean;
    hapticFeedbackEnabled: boolean;
    celebrationAnimations: boolean;
}

interface SecuritySettings {
    pinEnabled: boolean;
    pinHash?: string;
    autoLockEnabled: boolean;
    autoLockTimeout: number;
    biometricForExport: boolean;
    biometricForSettings: boolean;
    lastActivity: number;
}

interface GamificationState {
    xp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    lastScanDate: string | null;
    unlockedThemes: string[];
    unlockedFeatures: string[];
    completedChallenges: string[];
}

export interface Tag {
    id: string;
    name: string;
    color: string;
    icon?: string;
}

interface UserProfile {
    name: string;
    rank: string;
    protectionLevel: number;
    notificationsEnabled: boolean;
    biometricLock: boolean;
    neuralPatching: boolean;
    financialNodes: FinancialNode[];
}

interface FinancialNode {
    id: string;
    bank: string;
    alias: string;
    status: string;
}

interface SentinelState {
    scans: ScanResult[];
    safetyScore: number;
    riskData: { name: string; value: number; color: string }[];
    userProfile: UserProfile;
    preferences: UserPreferences;
    theme: 'light' | 'dark';
    reportedFrauds: string[];
    favorites: string[];
    merchantScanCount: Record<string, number>;

    // Gamification
    gamification: GamificationState;
    addXP: (amount: number) => void;
    completeChallenge: (challengeId: string) => void;
    unlockReward: (rewardId: string, type: 'theme' | 'feature') => void;

    // Security
    security: SecuritySettings;
    isLocked: boolean;
    updateSecurity: (updates: Partial<SecuritySettings>) => void;
    lock: () => void;
    unlock: () => void;

    // Tags
    tags: Tag[];
    scanTags: Record<string, string[]>;
    addTag: (tag: Tag) => void;
    removeTag: (tagId: string) => void;
    tagScan: (scanId: string, tagId: string) => void;
    untagScan: (scanId: string, tagId: string) => void;

    // Existing actions
    reportFraud: (upiId: string) => void;
    addScan: (scan: Omit<ScanResult, 'id' | 'timestamp'>) => void;
    clearScans: () => void;
    currentView: 'weekly' | 'monthly';
    setView: (view: 'weekly' | 'monthly') => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    updatePreferences: (updates: Partial<UserPreferences>) => void;
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
    isAuthenticated: boolean;
    setAuthenticated: (val: boolean) => void;
    addFavorite: (upiId: string) => void;
    removeFavorite: (upiId: string) => void;
    isFavorite: (upiId: string) => boolean;
    incrementMerchantCount: (upiId: string) => void;
    getMerchantScanCount: (upiId: string) => number;
}

const INITIAL_USER: UserProfile = {
    name: "Glorin",
    rank: "SENIOR ARCHITECT",
    protectionLevel: 94,
    notificationsEnabled: true,
    biometricLock: true,
    neuralPatching: false,
    financialNodes: [
        { id: '1', bank: "HDFC Bank", alias: "••7782", status: "Active" },
        { id: '2', bank: "Axis Bank", alias: "••4099", status: "Active" }
    ]
};

const getRiskData = (scans: ScanResult[], view: 'weekly' | 'monthly') => {
    // Generate semi-dynamic data based on actual scans + noise for a "live" feel
    if (view === 'weekly') {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return days.map(day => {
            const hasRisky = scans.some(s => s.status === 'risky' && new Date(s.timestamp).getDay() === days.indexOf(day));
            return {
                name: day,
                value: 40 + Math.floor(Math.random() * 30),
                color: hasRisky ? "#FF6B6B" : "#7CFFB2"
            };
        });
    } else {
        const months = ["Jan", "Feb", "Mar", "Apr"];
        return months.map(month => {
            const riskyCount = scans.filter(s => s.status === 'risky').length;
            return {
                name: month,
                value: 150 + Math.floor(Math.random() * 100),
                color: riskyCount > 2 ? "#FF6B6B" : "#7CFFB2"
            };
        });
    }
};

export const useSentinelStore = create<SentinelState>((set, get) => ({
    scans: [],
    reportedFrauds: [],
    favorites: [],
    merchantScanCount: {},
    safetyScore: 100,
    currentView: 'weekly',
    riskData: getRiskData([], 'weekly'),
    userProfile: INITIAL_USER,
    preferences: {
        enableSmartSuggestions: true,
        enableRiskyAlerts: true,
        enableLocationAlerts: false,
        notificationSound: true,
        autoAddFrequentToFavorites: 5,
        soundEffectsEnabled: true,
        hapticFeedbackEnabled: true,
        celebrationAnimations: true
    },
    theme: (typeof window !== 'undefined' && localStorage.getItem('sentinel-theme') as 'light' | 'dark') || 'dark',

    // Gamification state
    gamification: {
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastScanDate: null,
        unlockedThemes: [],
        unlockedFeatures: [],
        completedChallenges: []
    },

    // Security state
    security: {
        pinEnabled: false,
        autoLockEnabled: false,
        autoLockTimeout: 5,
        biometricForExport: false,
        biometricForSettings: false,
        lastActivity: Date.now()
    },
    isLocked: false,

    // Tags state
    tags: [
        { id: 'trusted', name: 'Trusted', color: '#7CFFB2', icon: '✓' },
        { id: 'suspicious', name: 'Suspicious', color: '#FF6B6B', icon: '⚠' },
        { id: 'frequent', name: 'Frequent', color: '#4ECDC4', icon: '🔄' }
    ],
    scanTags: {},
    reportFraud: (upiId) => {
        const { reportedFrauds, addScan } = get();
        if (!reportedFrauds.includes(upiId)) {
            set({ reportedFrauds: [...reportedFrauds, upiId] });
            // Also log it as a risky scan if not already
            addScan({
                upiId,
                status: 'risky',
                merchantName: 'USER REPORTED',
                threatType: 'Manual Fraud Report'
            });
        }
    },
    addScan: (scan) => {
        const newScan: ScanResult = {
            ...scan,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now()
        };

        const updatedScans = [newScan, ...get().scans];

        // Calculate safety score based on proportion of safe scans
        const total = updatedScans.length;
        const risky = updatedScans.filter(s => s.status === 'risky').length;
        const newScore = total === 0 ? 100 : ((total - risky) / total) * 100;

        // Increment merchant scan count
        const { merchantScanCount } = get();
        const upiId = scan.upiId;

        set({
            scans: updatedScans,
            safetyScore: parseFloat(newScore.toFixed(1)),
            riskData: getRiskData(updatedScans, get().currentView),
            merchantScanCount: {
                ...merchantScanCount,
                [upiId]: (merchantScanCount[upiId] || 0) + 1
            }
        });
    },
    setView: (view) => set({
        currentView: view,
        riskData: getRiskData(get().scans, view)
    }),
    clearScans: () => set({
        scans: [],
        safetyScore: 100,
        riskData: getRiskData([], get().currentView)
    }),
    updateProfile: (updates) => set((state) => ({
        userProfile: { ...state.userProfile, ...updates }
    })),
    toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        if (typeof window !== 'undefined') {
            localStorage.setItem('sentinel-theme', newTheme);
            document.documentElement.classList.toggle('light', newTheme === 'light');
        }
    },
    setTheme: (theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
            localStorage.setItem('sentinel-theme', theme);
            document.documentElement.classList.toggle('light', theme === 'light');
        }
    },
    isAuthenticated: false,
    setAuthenticated: (val) => set({ isAuthenticated: val }),
    addFavorite: (upiId) => {
        const { favorites } = get();
        if (!favorites.includes(upiId)) {
            set({ favorites: [...favorites, upiId] });
        }
    },
    removeFavorite: (upiId) => {
        set({ favorites: get().favorites.filter(id => id !== upiId) });
    },
    isFavorite: (upiId) => {
        return get().favorites.includes(upiId);
    },
    updatePreferences: (updates) => set((state) => ({
        preferences: { ...state.preferences, ...updates }
    })),
    incrementMerchantCount: (upiId) => {
        const { merchantScanCount } = get();
        set({
            merchantScanCount: {
                ...merchantScanCount,
                [upiId]: (merchantScanCount[upiId] || 0) + 1
            }
        });
    },
    getMerchantScanCount: (upiId) => {
        return get().merchantScanCount[upiId] || 0;
    },

    // Gamification actions
    addXP: (amount) => {
        const { gamification } = get();
        const newXP = gamification.xp + amount;
        const newLevel = Math.floor(1 + Math.log(newXP / 100) / Math.log(1.5));

        set({
            gamification: {
                ...gamification,
                xp: newXP,
                level: Math.max(newLevel, 1)
            }
        });
    },

    completeChallenge: (challengeId) => {
        const { gamification } = get();
        if (!gamification.completedChallenges.includes(challengeId)) {
            set({
                gamification: {
                    ...gamification,
                    completedChallenges: [...gamification.completedChallenges, challengeId]
                }
            });
        }
    },

    unlockReward: (rewardId, type) => {
        const { gamification } = get();
        const key = type === 'theme' ? 'unlockedThemes' : 'unlockedFeatures';
        if (!gamification[key].includes(rewardId)) {
            set({
                gamification: {
                    ...gamification,
                    [key]: [...gamification[key], rewardId]
                }
            });
        }
    },

    // Security actions
    updateSecurity: (updates) => set((state) => ({
        security: { ...state.security, ...updates }
    })),

    lock: () => set({ isLocked: true }),
    unlock: () => set({ isLocked: false }),

    // Tag actions
    addTag: (tag) => {
        const { tags } = get();
        if (!tags.find(t => t.id === tag.id)) {
            set({ tags: [...tags, tag] });
        }
    },

    removeTag: (tagId) => {
        set({ tags: get().tags.filter(t => t.id !== tagId) });
    },

    tagScan: (scanId, tagId) => {
        const { scanTags } = get();
        const existing = scanTags[scanId] || [];
        if (!existing.includes(tagId)) {
            set({
                scanTags: {
                    ...scanTags,
                    [scanId]: [...existing, tagId]
                }
            });
        }
    },

    untagScan: (scanId, tagId) => {
        const { scanTags } = get();
        const existing = scanTags[scanId] || [];
        set({
            scanTags: {
                ...scanTags,
                [scanId]: existing.filter(id => id !== tagId)
            }
        });
    },
}));
