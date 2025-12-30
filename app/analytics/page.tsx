"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { useSentinelStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, SortAsc, AlertTriangle, TrendingUp, ShieldCheck, ArrowUpDown } from "lucide-react";

export default function AnalyticsPage() {
    const { scans } = useSentinelStore();
    const [riskyOnly, setRiskyOnly] = useState(false);
    const [sortMode, setSortMode] = useState<'ID' | 'TIME' | 'STATUS'>('TIME');

    const filteredScans = scans
        .filter(s => riskyOnly ? s.status === 'risky' : true)
        .sort((a, b) => {
            if (sortMode === 'STATUS') return a.status.localeCompare(b.status);
            if (sortMode === 'ID') return a.upiId.localeCompare(b.upiId);
            return b.timestamp - a.timestamp;
        });

    const riskyCount = scans.filter(s => s.status === 'risky').length;
    const safeCount = scans.filter(s => s.status === 'safe').length;
    const efficiency = scans.length > 0 ? (safeCount / scans.length * 100).toFixed(1) : 100;

    const cycleSort = () => {
        const modes: (typeof sortMode)[] = ['TIME', 'ID', 'STATUS'];
        const next = modes[(modes.indexOf(sortMode) + 1) % modes.length];
        setSortMode(next);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto space-y-6 pt-8 pb-32 px-4"
        >
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-white tracking-tight">Operations</h1>
                <p className="text-zinc-500 font-bold uppercase text-[9px] tracking-[0.25em]">Traffic Analysis</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="flex-row items-center gap-4 p-6 !bg-primary/5 border-primary/20 group hover:!bg-primary/10 transition-all">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Efficiency</p>
                        <p className="text-2xl font-black text-white">{efficiency}%</p>
                    </div>
                </GlassCard>
                <GlassCard className="flex-row items-center gap-4 p-6 !bg-destructive/5 border-destructive/20 group hover:!bg-destructive/10 transition-all">
                    <div className="h-12 w-12 rounded-xl bg-destructive/20 flex items-center justify-center text-destructive group-hover:scale-110 transition-transform">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Blocked</p>
                        <p className="text-2xl font-black text-white">{riskyCount}</p>
                    </div>
                </GlassCard>
                <GlassCard className="flex-row items-center gap-4 p-6 !bg-white/5 border-white/10 group hover:!bg-white/10 transition-all">
                    <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Status</p>
                        <p className="text-lg font-black text-primary">ACTIVE</p>
                    </div>
                </GlassCard>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-[24px] border border-white/10 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setRiskyOnly(!riskyOnly)}
                        className={`h-10 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2 hover:scale-105 active:scale-95 ${riskyOnly
                            ? 'bg-destructive/20 text-destructive border-destructive/40 shadow-[0_0_20px_rgba(255,107,107,0.3)]'
                            : 'bg-white/5 text-zinc-500 border-white/5 hover:text-white hover:border-white/10'
                            }`}
                    >
                        <Filter size={14} className={riskyOnly ? 'animate-pulse' : ''} />
                        {riskyOnly ? 'Risky' : 'All'}
                    </button>
                    <button
                        onClick={cycleSort}
                        className="h-10 px-6 rounded-xl bg-primary/10 border-2 border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(124,255,178,0.2)]"
                    >
                        <ArrowUpDown size={14} />
                        {sortMode}
                    </button>
                </div>
                <div className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                    {filteredScans.length} {filteredScans.length === 1 ? 'Node' : 'Nodes'}
                </div>
            </div>

            {/* Dynamic Content */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredScans.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-16 text-center rounded-[32px] bg-white/[0.02] border border-dashed border-white/5"
                        >
                            <p className="text-zinc-600 font-black uppercase text-[10px] tracking-widest">No logs found</p>
                            <p className="text-zinc-700 text-[9px] mt-2">Try scanning a QR code first</p>
                        </motion.div>
                    ) : (
                        filteredScans.map((scan, i) => (
                            <motion.div
                                key={scan.id}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="group"
                            >
                                <GlassCard className="flex-row items-center justify-between p-6 !bg-black/30 hover:!bg-black/50 border-white/5 hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${scan.status === 'safe'
                                            ? 'text-primary bg-primary/10 border-primary/20'
                                            : 'text-destructive bg-destructive/10 border-destructive/20'
                                            }`}>
                                            {scan.status === 'safe' ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-white group-hover:text-primary transition-colors">{scan.upiId}</p>
                                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">
                                                {scan.threatType || "Verified"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">{new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        <p className="text-[8px] font-black text-zinc-600 uppercase mt-0.5 tracking-wider">{new Date(scan.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
