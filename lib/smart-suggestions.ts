import { ScanResult } from '../store';

export type SuggestionType =
    | 'add_to_favorites'
    | 'security_warning'
    | 'performance_insight'
    | 'behavior_tip'
    | 'amount_warning';

export interface SmartSuggestion {
    id: string;
    type: SuggestionType;
    title: string;
    message: string;
    icon: string;
    action?: {
        label: string;
        handler: () => void;
    };
    dismissible: boolean;
    priority: number; // Higher = more important
}

/**
 * Generate smart suggestions based on user behavior
 */
export function getSmartSuggestions(
    currentScan: {
        upiId: string;
        merchantName?: string;
        amount?: number;
        status: 'safe' | 'warning' | 'risky';
    },
    scans: ScanResult[],
    merchantScanCount: Record<string, number>,
    favorites: string[],
    preferences: {
        autoAddFrequentToFavorites: number;
        enableSmartSuggestions: boolean;
    }
): SmartSuggestion[] {
    if (!preferences.enableSmartSuggestions) {
        return [];
    }

    const suggestions: SmartSuggestion[] = [];

    // 1. Suggest adding frequent merchants to favorites
    const scanCount = merchantScanCount[currentScan.upiId] || 0;
    if (
        scanCount >= preferences.autoAddFrequentToFavorites &&
        !favorites.includes(currentScan.upiId) &&
        currentScan.status === 'safe'
    ) {
        suggestions.push({
            id: `fav-${currentScan.upiId}`,
            type: 'add_to_favorites',
            title: 'Add to Favorites?',
            message: `You've scanned ${currentScan.merchantName || 'this merchant'} ${scanCount} times. Add to favorites for quick access?`,
            icon: '⭐',
            dismissible: true,
            priority: 8
        });
    }

    // 2. New merchant warning
    if (scanCount === 0 && currentScan.amount && currentScan.amount > 1000) {
        suggestions.push({
            id: `new-merchant-${currentScan.upiId}`,
            type: 'security_warning',
            title: 'New Merchant Alert',
            message: `This is your first time scanning ${currentScan.merchantName || 'this merchant'}. Verify identity before large transactions.`,
            icon: '🔍',
            dismissible: true,
            priority: 9
        });
    }

    // 3. High amount warning
    if (currentScan.amount && currentScan.amount > 10000) {
        const merchantScans = scans.filter(s => s.upiId === currentScan.upiId && s.amount);
        const avgAmount = merchantScans.length > 0
            ? merchantScans.reduce((sum, s) => sum + (s.amount || 0), 0) / merchantScans.length
            : 0;

        if (avgAmount > 0 && currentScan.amount > avgAmount * 2) {
            suggestions.push({
                id: `high-amount-${currentScan.upiId}`,
                type: 'amount_warning',
                title: 'Unusual Amount',
                message: `This amount (₹${currentScan.amount.toLocaleString()}) is significantly higher than your usual transactions with this merchant.`,
                icon: '💰',
                dismissible: true,
                priority: 10
            });
        }
    }

    // 4. Safety score improvement
    const recentScans = scans.slice(0, 10);
    const recentSafeCount = recentScans.filter(s => s.status === 'safe').length;
    if (recentSafeCount === 10 && scans.length >= 10) {
        suggestions.push({
            id: 'safety-streak',
            type: 'performance_insight',
            title: 'Perfect Safety Streak! 🎉',
            message: 'Your last 10 scans were all safe. Great job staying secure!',
            icon: '🛡️',
            dismissible: true,
            priority: 5
        });
    }

    // 5. Risky merchant warning
    if (currentScan.status === 'risky') {
        const riskyCount = scans.filter(s => s.upiId === currentScan.upiId && s.status === 'risky').length;
        if (riskyCount > 1) {
            suggestions.push({
                id: `risky-repeat-${currentScan.upiId}`,
                type: 'security_warning',
                title: 'Repeated Risk Detection',
                message: `This merchant has been flagged as risky ${riskyCount} times. Consider blocking or reporting.`,
                icon: '⚠️',
                dismissible: false,
                priority: 10
            });
        }
    }

    // 6. Behavior tips based on usage patterns
    const behaviorTip = getBehaviorTip(scans, merchantScanCount);
    if (behaviorTip) {
        suggestions.push(behaviorTip);
    }

    // Sort by priority (highest first)
    return suggestions.sort((a, b) => b.priority - a.priority);
}

function getBehaviorTip(
    scans: ScanResult[],
    merchantScanCount: Record<string, number>
): SmartSuggestion | null {
    // Tip: Diversify merchants
    const uniqueMerchants = Object.keys(merchantScanCount).length;
    const totalScans = scans.length;

    if (totalScans >= 20 && uniqueMerchants < 5) {
        return {
            id: 'tip-diversify',
            type: 'behavior_tip',
            title: 'Security Tip',
            message: 'You scan the same few merchants frequently. Consider verifying new merchants carefully to maintain security.',
            icon: '💡',
            dismissible: true,
            priority: 3
        };
    }

    // Tip: Regular scanning
    if (totalScans >= 50) {
        const recentScans = scans.slice(0, 30);
        const timeSpan = recentScans[0].timestamp - recentScans[recentScans.length - 1].timestamp;
        const daysSpan = timeSpan / (1000 * 60 * 60 * 24);

        if (daysSpan < 7) {
            return {
                id: 'tip-active-user',
                type: 'performance_insight',
                title: 'Active User! 🌟',
                message: `You've made ${recentScans.length} scans in the last week. You're staying vigilant!`,
                icon: '📊',
                dismissible: true,
                priority: 4
            };
        }
    }

    return null;
}

/**
 * Get suggestion icon component name
 */
export function getSuggestionIcon(type: SuggestionType): string {
    switch (type) {
        case 'add_to_favorites':
            return 'Star';
        case 'security_warning':
            return 'AlertTriangle';
        case 'performance_insight':
            return 'TrendingUp';
        case 'behavior_tip':
            return 'Lightbulb';
        case 'amount_warning':
            return 'DollarSign';
        default:
            return 'Info';
    }
}

/**
 * Get suggestion color
 */
export function getSuggestionColor(type: SuggestionType): string {
    switch (type) {
        case 'add_to_favorites':
            return 'primary';
        case 'security_warning':
        case 'amount_warning':
            return 'destructive';
        case 'performance_insight':
            return 'primary';
        case 'behavior_tip':
            return 'muted';
        default:
            return 'muted';
    }
}
