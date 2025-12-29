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
            className="max-w-4xl mx-auto space-y-10 pt-12 pb-32 px-4"
        >
            <div className="flex flex-col gap-2">
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase">Operations</h1>
                <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em]">Neural Traffic Analysis</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="flex-row items-center gap-6 p-8 !bg-primary/5 border-primary/20 group hover:!bg-primary/10 transition-all">
                    <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Efficiency</p>
                        <p className="text-3xl font-black text-white">{efficiency}%</p>
                    </div>
                </GlassCard>
                <GlassCard className="flex-row items-center gap-6 p-8 !bg-destructive/5 border-destructive/20 group hover:!bg-destructive/10 transition-all">
                    <div className="h-14 w-14 rounded-2xl bg-destructive/20 flex items-center justify-center text-destructive group-hover:scale-110 transition-transform">
                        <AlertTriangle size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Blocked</p>
                        <p className="text-3xl font-black text-white">{riskyCount}</p>
                    </div>
                </GlassCard>
                <GlassCard className="flex-row items-center gap-6 p-8 !bg-white/5 border-white/10 group hover:!bg-white/10 transition-all">
                    <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Health</p>
                        <p className="text-3xl font-black text-white">NOMINAL</p>
                    </div>
                </GlassCard>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center bg-white/5 p-6 rounded-[32px] border border-white/10 flex-wrap gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setRiskyOnly(!riskyOnly)}
                        className={`h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border-2 ${riskyOnly
                            ? 'bg-destructive/20 text-destructive border-destructive/40'
                            : 'bg-white/5 text-zinc-500 border-white/5 hover:text-white'
                            }`}
                    >
                        <Filter size={16} />
                        Risky Only
                    </button>
                    <button
                        onClick={cycleSort}
                        className="h-12 px-8 rounded-2xl bg-white/5 border-2 border-white/5 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-all flex items-center gap-3 hover:border-white/10"
                    >
                        <ArrowUpDown size={16} />
                        Sort: {sortMode}
                    </button>
                </div>
                <div className="px-6 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    Live Nodes: {filteredScans.length}
                </div>
            </div>

            {/* Dynamic Content */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredScans.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-20 text-center rounded-[40px] bg-white/[0.02] border border-dashed border-white/5"
                        >
                            <p className="text-zinc-600 font-black uppercase text-xs tracking-widest">No matching logs found</p>
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
                                <GlassCard className="flex-row items-center justify-between p-8 !bg-black/30 hover:!bg-black/50 border-white/5 hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${scan.status === 'safe'
                                            ? 'text-primary bg-primary/10 border-primary/20'
                                            : 'text-destructive bg-destructive/10 border-destructive/20'
                                            }`}>
                                            {scan.status === 'safe' ? <ShieldCheck size={28} /> : <AlertTriangle size={28} />}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-white group-hover:text-primary transition-colors">{scan.upiId}</p>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                                                {scan.threatType || "ENCRYPTED_ID_VERIFIED"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-white">{new Date(scan.timestamp).toLocaleTimeString()}</p>
                                        <p className="text-[9px] font-black text-zinc-600 uppercase mt-1 tracking-widest">{new Date(scan.timestamp).toLocaleDateString()}</p>
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
