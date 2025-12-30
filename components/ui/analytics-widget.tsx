"use client";

import { GlassCard } from "./glass-card";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, SlidersHorizontal, ShieldCheck, AlertTriangle } from "lucide-react";
import { useSentinelStore } from "@/lib/store";
import { useState } from "react";

export function AnalyticsWidget() {
    const { scans } = useSentinelStore();
    const [showRiskyOnly, setShowRiskyOnly] = useState(false);

    // Calculate real stats
    const safeScans = scans.filter(s => s.status === 'safe');
    const riskyScans = scans.filter(s => s.status === 'risky');
    const totalScans = scans.length;

    // Filter scans
    const displayScans = showRiskyOnly ? riskyScans : scans;
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
                    <span className="text-xl sm:text-2xl font-black text-primary">{safeScans.length}</span>
                </div>
                <div className="bg-[#1A2220] p-3 rounded-2xl border border-white/5">
                    <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-wider block mb-1 font-black">Flagged</span>
                    <span className="text-xl sm:text-2xl font-black text-destructive">{riskyScans.length}</span>
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
                {recentScans.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-xs text-zinc-600 font-bold uppercase tracking-wider">No scans yet</p>
                    </div>
                ) : (
                    recentScans.map((scan) => (
                        <div key={scan.id} className="flex items-center justify-between group cursor-pointer hover:bg-white/[0.03] p-2 rounded-xl transition-all">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center border flex-shrink-0 ${scan.status === 'safe'
                                        ? 'bg-primary/10 border-primary/20 text-primary'
                                        : 'bg-destructive/10 border-destructive/20 text-destructive'
                                    }`}>
                                    {scan.status === 'safe' ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-black text-white group-hover:text-primary transition-colors truncate">{scan.upiId}</p>
                                    <p className="text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate">
                                        {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <span className={`text-xs sm:text-sm font-black flex-shrink-0 ${scan.status === 'safe' ? 'text-primary' : 'text-destructive'
                                }`}>
                                {scan.status === 'safe' ? '✓' : '!'}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </GlassCard>
    );
}
