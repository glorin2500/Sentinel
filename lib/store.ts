import { create } from 'zustand';

export interface ScanResult {
    id: string;
    upiId: string;
    status: 'safe' | 'warning' | 'risky';
    timestamp: number;
    merchantName?: string;
    threatType?: string;
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
    theme: 'light' | 'dark';
    reportedFrauds: string[];
    reportFraud: (upiId: string) => void;
    addScan: (scan: Omit<ScanResult, 'id' | 'timestamp'>) => void;
    clearScans: () => void;
    currentView: 'weekly' | 'monthly';
    setView: (view: 'weekly' | 'monthly') => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
}

const INITIAL_USER: UserProfile = {
    name: "Glorin",
    rank: "SENIOR ARCHITECT",
    protectionLevel: 94,
    notificationsEnabled: true,
    biometricLock: true,
    neuralPatching: false,
    financialNodes: [
        { id: '1', bank: "HDFC CORE-V1", alias: "PA_7782_X", status: "ENCRYPTED" },
        { id: '2', bank: "AXIS QUANTUM", alias: "NODE_W_99", status: "STANDBY" }
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
    safetyScore: 100,
    currentView: 'weekly',
    riskData: getRiskData([], 'weekly'),
    userProfile: INITIAL_USER,
    theme: (typeof window !== 'undefined' && localStorage.getItem('sentinel-theme') as 'light' | 'dark') || 'dark',
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

        set({
            scans: updatedScans,
            safetyScore: parseFloat(newScore.toFixed(1)),
            riskData: getRiskData(updatedScans, get().currentView)
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
}));
