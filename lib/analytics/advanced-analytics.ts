// Merchant categorization system

export type MerchantCategory =
    | 'food_dining'
    | 'shopping'
    | 'transportation'
    | 'entertainment'
    | 'utilities'
    | 'healthcare'
    | 'education'
    | 'other';

export interface CategoryInfo {
    id: MerchantCategory;
    name: string;
    icon: string;
    color: string;
}

export const CATEGORIES: Record<MerchantCategory, CategoryInfo> = {
    food_dining: {
        id: 'food_dining',
        name: 'Food & Dining',
        icon: '🍔',
        color: '#FF6B6B'
    },
    shopping: {
        id: 'shopping',
        name: 'Shopping',
        icon: '🛍️',
        color: '#4ECDC4'
    },
    transportation: {
        id: 'transportation',
        name: 'Transportation',
        icon: '🚗',
        color: '#95E1D3'
    },
    entertainment: {
        id: 'entertainment',
        name: 'Entertainment',
        icon: '🎬',
        color: '#F38181'
    },
    utilities: {
        id: 'utilities',
        name: 'Utilities',
        icon: '💡',
        color: '#AA96DA'
    },
    healthcare: {
        id: 'healthcare',
        name: 'Healthcare',
        icon: '🏥',
        color: '#FCBAD3'
    },
    education: {
        id: 'education',
        name: 'Education',
        icon: '📚',
        color: '#A8D8EA'
    },
    other: {
        id: 'other',
        name: 'Other',
        icon: '📦',
        color: '#C7CEEA'
    }
};

// Auto-categorize based on merchant name/UPI ID
export function categorizeMerchant(merchantName: string, upiId: string): MerchantCategory {
    const text = `${merchantName} ${upiId}`.toLowerCase();

    // Food & Dining
    if (/(food|restaurant|cafe|coffee|pizza|burger|kitchen|dining|swiggy|zomato|domino|mcdonald|kfc|subway)/i.test(text)) {
        return 'food_dining';
    }

    // Shopping
    if (/(shop|store|mart|mall|amazon|flipkart|myntra|retail|fashion|cloth)/i.test(text)) {
        return 'shopping';
    }

    // Transportation
    if (/(uber|ola|taxi|cab|transport|fuel|petrol|gas|rapido|metro)/i.test(text)) {
        return 'transportation';
    }

    // Entertainment
    if (/(movie|cinema|netflix|spotify|game|entertainment|ticket|bookmyshow)/i.test(text)) {
        return 'entertainment';
    }

    // Utilities
    if (/(electric|water|gas|bill|utility|recharge|mobile|internet|wifi)/i.test(text)) {
        return 'utilities';
    }

    // Healthcare
    if (/(hospital|clinic|doctor|medical|pharma|health|medicine|apollo|fortis)/i.test(text)) {
        return 'healthcare';
    }

    // Education
    if (/(school|college|university|education|course|tuition|academy|learn)/i.test(text)) {
        return 'education';
    }

    return 'other';
}

// Time-of-day analysis
export interface TimeSlot {
    label: string;
    start: number;
    end: number;
    icon: string;
}

export const TIME_SLOTS: TimeSlot[] = [
    { label: 'Early Morning', start: 0, end: 6, icon: '🌙' },
    { label: 'Morning', start: 6, end: 12, icon: '🌅' },
    { label: 'Afternoon', start: 12, end: 17, icon: '☀️' },
    { label: 'Evening', start: 17, end: 21, icon: '🌆' },
    { label: 'Night', start: 21, end: 24, icon: '🌃' }
];

export function getTimeSlot(timestamp: number): TimeSlot {
    const hour = new Date(timestamp).getHours();
    return TIME_SLOTS.find(slot => hour >= slot.start && hour < slot.end) || TIME_SLOTS[4];
}

// Spending predictions
export interface SpendingPrediction {
    nextMonth: number;
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    factors: string[];
}

export function predictSpending(scans: Array<{ timestamp: number; amount?: number }>): SpendingPrediction {
    const scansWithAmount = scans.filter(s => s.amount && s.amount > 0);

    if (scansWithAmount.length < 10) {
        return {
            nextMonth: 0,
            confidence: 0,
            trend: 'stable',
            factors: ['Not enough data for prediction']
        };
    }

    // Calculate monthly spending for last 3 months
    const now = Date.now();
    const monthlySpending: number[] = [];

    for (let i = 0; i < 3; i++) {
        const monthStart = new Date(now);
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const monthScans = scansWithAmount.filter(s =>
            s.timestamp >= monthStart.getTime() && s.timestamp < monthEnd.getTime()
        );

        const total = monthScans.reduce((sum, s) => sum + (s.amount || 0), 0);
        monthlySpending.push(total);
    }

    // Simple linear regression
    const avgSpending = monthlySpending.reduce((a, b) => a + b, 0) / monthlySpending.length;
    const trend = monthlySpending[0] > monthlySpending[2] ? 'increasing' :
        monthlySpending[0] < monthlySpending[2] ? 'decreasing' : 'stable';

    // Predict next month (simple average with trend adjustment)
    const trendFactor = trend === 'increasing' ? 1.1 : trend === 'decreasing' ? 0.9 : 1;
    const prediction = avgSpending * trendFactor;

    const factors: string[] = [];
    if (trend === 'increasing') {
        factors.push('Spending has been increasing');
    } else if (trend === 'decreasing') {
        factors.push('Spending has been decreasing');
    }

    if (monthlySpending.length >= 3) {
        factors.push(`Based on ${monthlySpending.length} months of data`);
    }

    return {
        nextMonth: Math.round(prediction),
        confidence: Math.min(monthlySpending.length * 10, 80), // Max 80% confidence
        trend,
        factors
    };
}

// Month comparison
export interface MonthComparison {
    currentMonth: {
        total: number;
        scans: number;
        average: number;
    };
    previousMonth: {
        total: number;
        scans: number;
        average: number;
    };
    change: {
        total: number;
        scans: number;
        average: number;
    };
    percentChange: {
        total: number;
        scans: number;
        average: number;
    };
}

export function compareMonths(scans: Array<{ timestamp: number; amount?: number }>): MonthComparison {
    const now = new Date();

    // Current month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Previous month
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const currentScans = scans.filter(s =>
        s.timestamp >= currentMonthStart.getTime() && s.timestamp <= currentMonthEnd.getTime()
    );

    const prevScans = scans.filter(s =>
        s.timestamp >= prevMonthStart.getTime() && s.timestamp <= prevMonthEnd.getTime()
    );

    const currentTotal = currentScans.reduce((sum, s) => sum + (s.amount || 0), 0);
    const prevTotal = prevScans.reduce((sum, s) => sum + (s.amount || 0), 0);

    const currentAvg = currentScans.length > 0 ? currentTotal / currentScans.length : 0;
    const prevAvg = prevScans.length > 0 ? prevTotal / prevScans.length : 0;

    const totalChange = currentTotal - prevTotal;
    const scansChange = currentScans.length - prevScans.length;
    const avgChange = currentAvg - prevAvg;

    const totalPercent = prevTotal > 0 ? (totalChange / prevTotal) * 100 : 0;
    const scansPercent = prevScans.length > 0 ? (scansChange / prevScans.length) * 100 : 0;
    const avgPercent = prevAvg > 0 ? (avgChange / prevAvg) * 100 : 0;

    return {
        currentMonth: {
            total: currentTotal,
            scans: currentScans.length,
            average: currentAvg
        },
        previousMonth: {
            total: prevTotal,
            scans: prevScans.length,
            average: prevAvg
        },
        change: {
            total: totalChange,
            scans: scansChange,
            average: avgChange
        },
        percentChange: {
            total: totalPercent,
            scans: scansPercent,
            average: avgPercent
        }
    };
}
