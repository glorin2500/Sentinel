import { ScanResult } from '../store';

export interface DailyChallenge {
    id: string;
    type: 'scan_count' | 'safe_scans' | 'streak';
    title: string;
    description: string;
    icon: string;
    target: number;
    progress: number;
    reward: {
        xp: number;
        badge?: string;
    };
    expiresAt: number;
}

export interface UserProgress {
    level: number;
    xp: number;
    xpToNextLevel: number;
    currentStreak: number;
    longestStreak: number;
    lastScanDate: string | null;
    totalScans: number;
    unlockedThemes: string[];
    unlockedFeatures: string[];
}

// XP calculation
export function calculateXP(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromXP(xp: number): number {
    let level = 1;
    let totalXP = 0;

    while (totalXP + calculateXP(level) <= xp) {
        totalXP += calculateXP(level);
        level++;
    }

    return level;
}

export function getXPForNextLevel(currentXP: number): number {
    const currentLevel = getLevelFromXP(currentXP);
    return calculateXP(currentLevel);
}

// Daily challenges generation
export function generateDailyChallenges(scans: ScanResult[], date: Date = new Date()): DailyChallenge[] {
    const today = new Date(date);
    today.setHours(23, 59, 59, 999);

    const todayScans = scans.filter(scan => {
        const scanDate = new Date(scan.timestamp);
        return scanDate.toDateString() === date.toDateString();
    });

    return [
        {
            id: 'daily-scans',
            type: 'scan_count',
            title: 'Daily Scanner',
            description: 'Complete 5 scans today',
            icon: '🎯',
            target: 5,
            progress: Math.min(todayScans.length, 5),
            reward: { xp: 50 },
            expiresAt: today.getTime()
        },
        {
            id: 'safe-streak',
            type: 'safe_scans',
            title: 'Safety First',
            description: 'Scan 3 safe merchants',
            icon: '🛡️',
            target: 3,
            progress: Math.min(todayScans.filter(s => s.status === 'safe').length, 3),
            reward: { xp: 30 },
            expiresAt: today.getTime()
        },
        {
            id: 'amount-tracker',
            type: 'streak',
            title: 'Budget Conscious',
            description: 'Track amounts for 3 scans',
            icon: '💰',
            target: 3,
            progress: Math.min(todayScans.filter(s => s.amount && s.amount > 0).length, 3),
            reward: { xp: 40 },
            expiresAt: today.getTime()
        }
    ];
}

// Streak calculation
export function calculateStreak(scans: ScanResult[]): { current: number; longest: number; lastScanDate: string | null } {
    if (scans.length === 0) {
        return { current: 0, longest: 0, lastScanDate: null };
    }

    // Sort scans by date (newest first)
    const sortedScans = [...scans].sort((a, b) => b.timestamp - a.timestamp);

    // Get unique days
    const scanDays = new Set<string>();
    sortedScans.forEach(scan => {
        const date = new Date(scan.timestamp);
        scanDays.add(date.toDateString());
    });

    const uniqueDays = Array.from(scanDays).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    if (uniqueDays[0] === today || uniqueDays[0] === yesterday) {
        currentStreak = 1;
        let checkDate = new Date(uniqueDays[0]);

        for (let i = 1; i < uniqueDays.length; i++) {
            const prevDate = new Date(checkDate);
            prevDate.setDate(prevDate.getDate() - 1);

            if (uniqueDays[i] === prevDate.toDateString()) {
                currentStreak++;
                checkDate = prevDate;
            } else {
                break;
            }
        }
    }

    // Calculate longest streak
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < uniqueDays.length; i++) {
        const currentDate = new Date(uniqueDays[i]);
        const prevDate = new Date(uniqueDays[i - 1]);
        const dayDiff = Math.floor((prevDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000));

        if (dayDiff === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 1;
        }
    }

    return {
        current: currentStreak,
        longest: Math.max(longestStreak, currentStreak),
        lastScanDate: uniqueDays[0]
    };
}

// Rewards system
export interface Reward {
    id: string;
    name: string;
    description: string;
    type: 'theme' | 'feature' | 'badge';
    unlockLevel: number;
    icon: string;
}

export const REWARDS: Reward[] = [
    {
        id: 'theme-ocean',
        name: 'Ocean Theme',
        description: 'Cool blue color scheme',
        type: 'theme',
        unlockLevel: 5,
        icon: '🌊'
    },
    {
        id: 'theme-sunset',
        name: 'Sunset Theme',
        description: 'Warm orange and pink colors',
        type: 'theme',
        unlockLevel: 10,
        icon: '🌅'
    },
    {
        id: 'theme-forest',
        name: 'Forest Theme',
        description: 'Natural green tones',
        type: 'theme',
        unlockLevel: 15,
        icon: '🌲'
    },
    {
        id: 'feature-batch-export',
        name: 'Batch Export',
        description: 'Export multiple scans at once',
        type: 'feature',
        unlockLevel: 8,
        icon: '📦'
    },
    {
        id: 'feature-advanced-filters',
        name: 'Advanced Filters',
        description: 'Filter by date range and amount',
        type: 'feature',
        unlockLevel: 12,
        icon: '🔍'
    },
    {
        id: 'badge-veteran',
        name: 'Veteran Scanner',
        description: 'Reached level 20',
        type: 'badge',
        unlockLevel: 20,
        icon: '🏆'
    }
];

export function getAvailableRewards(level: number): Reward[] {
    return REWARDS.filter(reward => reward.unlockLevel <= level);
}

export function getNextReward(level: number): Reward | null {
    const locked = REWARDS.filter(reward => reward.unlockLevel > level);
    return locked.length > 0 ? locked[0] : null;
}

// XP rewards for actions
export function getXPReward(action: 'scan' | 'safe_scan' | 'report_fraud' | 'add_amount' | 'favorite'): number {
    const rewards = {
        scan: 10,
        safe_scan: 15,
        report_fraud: 25,
        add_amount: 5,
        favorite: 3
    };
    return rewards[action];
}
