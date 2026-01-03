"use client";

import { GlassCard } from "./glass-card";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hapticClick } from "@/lib/haptic";
import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface Transaction {
    id: string;
    upi_id: string;
    risk_level: string;
    risk_score: number;
    created_at: string;
}

export function AnalyticsWidget() {
    const { user } = useAuth();
    const router = useRouter();
    const [showRiskyOnly, setShowRiskyOnly] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!user || !isSupabaseConfigured()) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (!error && data) {
                    setTransactions(data);
                }
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();

        // Refresh every 30 seconds
        const interval = setInterval(fetchTransactions, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Calculate stats
    const safeScans = transactions.filter(t => t.risk_level === 'safe');
    const riskyScans = transactions.filter(t => t.risk_level === 'warning' || t.risk_level === 'danger');

    // Filter scans
    const displayScans = showRiskyOnly ? riskyScans : transactions;
    const recentScans = displayScans.slice(0, 4);

    return (
        <GlassCard className="h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">Analytics</h3>
                    <p className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Live Activity Feed</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#1A2220] p-3 rounded-2xl border border-white/5">
                    <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-black">Safe Scans</span>
                    <span className="text-xl sm:text-2xl font-black text-primary">{loading ? '...' : safeScans.length}</span>
                </div>
                <div className="bg-[#1A2220] p-3 rounded-2xl border border-white/5">
                    <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-black">Flagged</span>
                    <span className="text-xl sm:text-2xl font-black text-destructive">{loading ? '...' : riskyScans.length}</span>
                </div>
            </div>

            <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs sm:text-sm text-zinc-500 font-bold uppercase tracking-wider">Recent Activity</h4>
                <div className="flex bg-[#1A2220] rounded-lg p-0.5 border border-white/5">
                    <button
                        onClick={() => setShowRiskyOnly(false)}
                        className={`text-[9px] px-2 sm:px-3 py-1 rounded font-black uppercase tracking-wider transition-all ${!showRiskyOnly ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setShowRiskyOnly(true)}
                        className={`text-[9px] px-2 sm:px-3 py-1 rounded font-black uppercase tracking-wider transition-all ${showRiskyOnly ? 'bg-destructive/20 text-destructive' : 'text-zinc-500 hover:text-white'
                            }`}
                    >
                        Risky
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-xs text-zinc-600 font-bold uppercase tracking-wider">Loading...</p>
                    </div>
                ) : recentScans.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-xs text-zinc-600 font-bold uppercase tracking-wider">No scans yet</p>
                    </div>
                ) : (
                    recentScans.map((scan) => (
                        <div
                            key={scan.id}
                            onClick={() => {
                                hapticClick();
                                router.push(`/history`);
                            }}
                            className="flex items-center justify-between group cursor-pointer hover:bg-white/[0.03] p-2 rounded-xl transition-all"
                        >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center border flex-shrink-0 ${scan.risk_level === 'safe'
                                    ? 'bg-primary/10 border-primary/20 text-primary'
                                    : 'bg-destructive/10 border-destructive/20 text-destructive'
                                    }`}>
                                    {scan.risk_level === 'safe' ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-black text-white group-hover:text-primary transition-colors truncate">{scan.upi_id}</p>
                                    <p className="text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate">
                                        {new Date(scan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <span className={`text-xs sm:text-sm font-black flex-shrink-0 ${scan.risk_level === 'safe' ? 'text-primary' : 'text-destructive'
                                }`}>
                                {scan.risk_level === 'safe' ? '✓' : '!'}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </GlassCard>
    );
}
