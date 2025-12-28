"use client";

import { GlassCard } from "./glass-card";
import { ShieldCheck, Activity, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSentinelStore } from "@/lib/store";

export function UPIStatusCard() {
    const { safetyScore } = useSentinelStore();
    const [scannedCount, setScannedCount] = useState(124);

    // Simulate live scanning counter
    useEffect(() => {
        const interval = setInterval(() => {
            setScannedCount(prev => prev + Math.floor(Math.random() * 3));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <GlassCard className="h-[400px] justify-between !bg-gradient-to-br !from-[#1A2220] !to-[#0B0F0E] border-primary/20 relative overflow-hidden group">

            {/* Ambient Base Glow */}
            <motion.div
                animate={{ opacity: [0, 0.1, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"
            />

            {/* Header */}
            <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        {/* Live Heartbeat Ring */}
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-primary/30 rounded-full"
                        />
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary relative z-10 border border-primary/20">
                            <ShieldCheck size={24} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-zinc-300">Safety Status</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-[10px] text-primary font-black tracking-widest uppercase">Live Protection</span>
                        </div>
                    </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400">
                    <Activity size={18} />
                </div>
            </div>

            {/* Main Trust Percentage */}
            <div className="flex flex-col gap-2 z-10 py-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={safetyScore}
                    className="flex items-baseline gap-2"
                >
                    <span className="text-6xl font-black text-white tracking-tighter">{safetyScore}<span className="text-3xl text-primary">%</span></span>
                    <span className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em]">Safe</span>
                </motion.div>

                <div className="space-y-3 mt-4">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <span>Scanning Patterns</span>
                        <span className="text-primary tabular-nums">SCAN_{scannedCount}</span>
                    </div>
                    {/* Live Scanning Waveform */}
                    <div className="flex gap-1 h-12 items-end">
                        {[4, 7, 3, 5, 8, 4, 2, 6, 9, 3, 5, 7, 4, 3].map((h, i) => (
                            <motion.div
                                key={i}
                                animate={{ height: [h * 3, h * 1.5, h * 3] }}
                                transition={{
                                    duration: 1.2,
                                    repeat: Infinity,
                                    delay: i * 0.1,
                                    ease: "easeInOut"
                                }}
                                className={`flex-1 rounded-sm ${i > 10 ? 'bg-primary' : 'bg-primary/20'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom: Quick Actions */}
            <div className="flex items-center justify-between z-10 pt-4 border-t border-white/5">
                <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(idx => (
                        <div key={idx} className="h-8 w-8 rounded-full bg-zinc-800 border-2 border-[#121816] flex items-center justify-center text-[10px] font-bold text-zinc-500">
                            U{idx}
                        </div>
                    ))}
                    <div className="h-8 w-8 rounded-full bg-primary/20 border-2 border-[#121816] flex items-center justify-center text-[10px] font-bold text-primary">
                        +
                    </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <Users size={14} className="text-zinc-400" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Quick Verify</span>
                </button>
            </div>

        </GlassCard>
    );
}
