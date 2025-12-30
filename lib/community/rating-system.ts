// Mock community data - can be replaced with real backend later

export interface MerchantRating {
    upiId: string;
    merchantName: string;
    averageRating: number; // 1-5 stars
    totalRatings: number;
    safetyScore: number; // Community consensus 0-100
    reports: {
        safe: number;
        risky: number;
        fraud: number;
    };
    comments: Comment[];
    verified: boolean;
}

export interface Comment {
    id: string;
    userId: string; // Anonymous hash
    displayName: string;
    rating: number;
    text: string;
    timestamp: number;
    helpful: number; // Upvotes
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    displayName: string;
    avatar: string; // Emoji or generated avatar
    score: number;
    badge?: string;
    stats: {
        totalScans: number;
        safetyScore: number;
        fraudReports: number;
        streak: number;
    };
}

// Generate mock merchant ratings
export function getMerchantRating(upiId: string): MerchantRating {
    // Check if we have cached rating
    const cached = mockRatingsCache.get(upiId);
    if (cached) return cached;

    // Generate new rating
    const rating = generateMockRating(upiId);
    mockRatingsCache.set(upiId, rating);
    return rating;
}

const mockRatingsCache = new Map<string, MerchantRating>();

function generateMockRating(upiId: string): MerchantRating {
    // Use UPI ID to generate consistent random data
    const seed = hashString(upiId);
    const random = seededRandom(seed);

    const totalRatings = Math.floor(random() * 500) + 10;
    const averageRating = 3 + random() * 2; // 3-5 stars
    const safetyScore = Math.floor(averageRating * 20); // Convert to 0-100

    const safeReports = Math.floor(totalRatings * 0.7);
    const riskyReports = Math.floor(totalRatings * 0.2);
    const fraudReports = totalRatings - safeReports - riskyReports;

    return {
        upiId,
        merchantName: extractMerchantName(upiId),
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalRatings,
        safetyScore,
        reports: {
            safe: safeReports,
            risky: riskyReports,
            fraud: fraudReports
        },
        comments: generateMockComments(3, seed),
        verified: random() > 0.5
    };
}

function generateMockComments(count: number, seed: number): Comment[] {
    const comments: Comment[] = [];
    const templates = [
        "Great merchant, always reliable!",
        "Used multiple times, no issues.",
        "Fast and secure transactions.",
        "Trusted seller, highly recommend.",
        "Be cautious, had some issues.",
        "Verified and safe to use."
    ];

    for (let i = 0; i < count; i++) {
        const random = seededRandom(seed + i);
        comments.push({
            id: `comment-${seed}-${i}`,
            userId: `user-${Math.floor(random() * 1000)}`,
            displayName: generateDisplayName(seed + i),
            rating: Math.floor(random() * 2) + 4, // 4-5 stars
            text: templates[Math.floor(random() * templates.length)],
            timestamp: Date.now() - Math.floor(random() * 30 * 24 * 60 * 60 * 1000),
            helpful: Math.floor(random() * 20)
        });
    }

    return comments;
}

// Generate mock leaderboard
export function getLeaderboard(category: 'scans' | 'safety' | 'reports' | 'streak' = 'scans'): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];

    for (let i = 0; i < 50; i++) {
        const seed = i * 123;
        const random = seededRandom(seed);

        let score: number;
        switch (category) {
            case 'scans':
                score = Math.floor(random() * 1000) + 100;
                break;
            case 'safety':
                score = Math.floor(random() * 30) + 70; // 70-100
                break;
            case 'reports':
                score = Math.floor(random() * 50);
                break;
            case 'streak':
                score = Math.floor(random() * 100);
                break;
        }

        entries.push({
            rank: i + 1,
            userId: `user-${i}`,
            displayName: generateDisplayName(seed),
            avatar: generateAvatar(seed),
            score,
            badge: i < 3 ? getBadge(i) : undefined,
            stats: {
                totalScans: Math.floor(random() * 1000) + 50,
                safetyScore: Math.floor(random() * 30) + 70,
                fraudReports: Math.floor(random() * 20),
                streak: Math.floor(random() * 50)
            }
        });
    }

    return entries.sort((a, b) => b.score - a.score).map((entry, index) => ({
        ...entry,
        rank: index + 1
    }));
}

// Utility functions
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function seededRandom(seed: number) {
    return function () {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}

function extractMerchantName(upiId: string): string {
    const parts = upiId.split('@');
    if (parts.length > 0) {
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return 'Unknown Merchant';
}

function generateDisplayName(seed: number): string {
    const adjectives = ['Swift', 'Secure', 'Vigilant', 'Smart', 'Safe', 'Alert', 'Quick', 'Wise'];
    const nouns = ['Scanner', 'Guardian', 'Sentinel', 'Watcher', 'Defender', 'Protector', 'Hunter'];

    const random = seededRandom(seed);
    const adj = adjectives[Math.floor(random() * adjectives.length)];
    const noun = nouns[Math.floor(random() * nouns.length)];
    const num = Math.floor(random() * 999);

    return `${adj}${noun}${num}`;
}

function generateAvatar(seed: number): string {
    const avatars = ['🛡️', '🔒', '🔐', '🗝️', '🎯', '⚡', '🌟', '💎', '🏆', '👑'];
    const random = seededRandom(seed);
    return avatars[Math.floor(random() * avatars.length)];
}

function getBadge(rank: number): string {
    switch (rank) {
        case 0: return '🥇';
        case 1: return '🥈';
        case 2: return '🥉';
        default: return '';
    }
}

// Achievement system
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress: number;
    target: number;
}

export function getAchievements(totalScans: number, safetyScore: number, fraudReports: number): Achievement[] {
    return [
        {
            id: 'first-scan',
            name: 'First Scan',
            description: 'Complete your first security scan',
            icon: '🎯',
            unlocked: totalScans >= 1,
            progress: Math.min(totalScans, 1),
            target: 1
        },
        {
            id: 'scanner-novice',
            name: 'Scanner Novice',
            description: 'Complete 10 scans',
            icon: '📱',
            unlocked: totalScans >= 10,
            progress: Math.min(totalScans, 10),
            target: 10
        },
        {
            id: 'scanner-expert',
            name: 'Scanner Expert',
            description: 'Complete 50 scans',
            icon: '🔍',
            unlocked: totalScans >= 50,
            progress: Math.min(totalScans, 50),
            target: 50
        },
        {
            id: 'scanner-master',
            name: 'Scanner Master',
            description: 'Complete 100 scans',
            icon: '👑',
            unlocked: totalScans >= 100,
            progress: Math.min(totalScans, 100),
            target: 100
        },
        {
            id: 'safety-first',
            name: 'Safety First',
            description: 'Maintain 90% safety score',
            icon: '🛡️',
            unlocked: safetyScore >= 90,
            progress: Math.min(safetyScore, 90),
            target: 90
        },
        {
            id: 'fraud-hunter',
            name: 'Fraud Hunter',
            description: 'Report 5 fraudulent merchants',
            icon: '🎖️',
            unlocked: fraudReports >= 5,
            progress: Math.min(fraudReports, 5),
            target: 5
        },
        {
            id: 'perfect-score',
            name: 'Perfect Score',
            description: 'Achieve 100% safety score',
            icon: '⭐',
            unlocked: safetyScore === 100,
            progress: Math.min(safetyScore, 100),
            target: 100
        }
    ];
}
