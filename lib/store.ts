import { create } from 'zustand';

export interface ScanResult {
    id: string;
    upiId: string;
    status: 'safe' | 'warning' | 'risky';
    timestamp: number;
    merchantName?: string;
    threatType?: string;
}

interface SentinelState {
    scans: ScanResult[];
    safetyScore: number;
    riskData: { name: string; value: number; color: string }[];
    addScan: (scan: Omit<ScanResult, 'id' | 'timestamp'>) => void;
    clearScans: () => void;
    currentView: 'weekly' | 'monthly';
    setView: (view: 'weekly' | 'monthly') => void;
}

const INITIAL_WEEKLY_DATA = [
    { name: "Mon", value: 45, color: "#7CFFB2" },
    { name: "Tue", value: 52, color: "#7CFFB2" },
    { name: "Wed", value: 48, color: "#7CFFB2" },
    { name: "Thu", value: 61, color: "#7CFFB2" },
    { name: "Fri", value: 12, color: "#FF6B6B" },
    { name: "Sat", value: 55, color: "#7CFFB2" },
    { name: "Sun", value: 58, color: "#7CFFB2" },
];

const INITIAL_MONTHLY_DATA = [
    { name: "Jan", value: 180, color: "#7CFFB2" },
    { name: "Feb", value: 210, color: "#7CFFB2" },
    { name: "Mar", value: 45, color: "#FF6B6B" },
    { name: "Apr", value: 230, color: "#7CFFB2" },
];

export const useSentinelStore = create<SentinelState>((set) => ({
    scans: [],
    safetyScore: 98.4,
    currentView: 'weekly',
    riskData: INITIAL_WEEKLY_DATA,
    addScan: (scan) => set((state) => {
        const newScan = {
            ...scan,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now()
        };
        const updatedScans = [newScan, ...state.scans];

        // Slightly fluctuate safety score based on scan result
        let newScore = state.safetyScore;
        if (scan.status === 'risky') newScore = Math.max(0, newScore - 5);
        if (scan.status === 'safe') newScore = Math.min(100, newScore + 0.1);

        return {
            scans: updatedScans,
            safetyScore: parseFloat(newScore.toFixed(1))
        };
    }),
    setView: (view) => set({
        currentView: view,
        riskData: view === 'weekly' ? INITIAL_WEEKLY_DATA : INITIAL_MONTHLY_DATA
    }),
    clearScans: () => set({ scans: [] }),
}));
