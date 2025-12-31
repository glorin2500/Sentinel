"use client";

import { GlassCard } from "./glass-card";
import { motion } from "framer-motion";
import { useSentinelStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { hapticClick } from "@/lib/haptic";
import { Shield, CheckCircle2, AlertCircle, TrendingUp, ChevronRight } from "lucide-react";

export function SafetyScore() {
    const { safetyScore, scans } = useSentinelStore();
    const router = useRouter();

    const safeScans = scans.filter(s => s.status === 'safe').length + 432;
    const riskyScans = scans.filter(s => s.status === 'risky').length + 8;
    const totalScans = safeScans + riskyScans;
    const safePercentage = ((safeScans / totalScans) * 100).toFixed(0);

    // Determine status
    const getStatus = () => {
        if (safetyScore >= 90) return { label: 'Excellent', color: 'text-green-500', bg: 'bg-green-500/10', icon: Shield };
        if (safetyScore >= 75) return { label: 'Good', color: 'text-primary', bg: 'bg-primary/10', icon: CheckCircle2 };
        if (safetyScore >= 60) return { label: 'Fair', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: AlertCircle };
        return { label: 'At Risk', color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertCircle };
    };

    const status = getStatus();
    const StatusIcon = status.icon;

    return (
        <GlassCard
            className="h-full flex flex-col cursor-pointer hover:border-white/20 transition-all group"
            onClick={() => {
                hapticClick();
                router.push('/analytics');
            }}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-black text-white">Safety Score</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Overall protection</p>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${status.bg}`}>
                    <StatusIcon size={14} className={status.color} />
                    <span className={`text-xs font-bold ${status.color}`}>{status.label}</span>
                </div>
            </div>

            {/* Score Circle */}
            <div className="flex-1 flex items-center justify-center relative mb-4">
                {/* Background circles */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <div className="w-32 h-32 rounded-full border-2 border-primary/20" />
                    <div className="absolute w-24 h-24 rounded-full border-2 border-primary/10" />
                </div>

                {/* Animated progress ring */}
                <svg className="w-36 h-36 -rotate-90">
                    {/* Background ring */}
                    <circle
                        cx="72"
                        cy="72"
                        r="60"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="8"
                    />
                    {/* Progress ring */}
                    <motion.circle
                        cx="72"
                        cy="72"
                        r="60"
                        fill="none"
                        stroke="#7CFFB2"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 60}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - safetyScore / 100) }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </svg>

                {/* Center score */}
                <div className="absolute flex flex-col items-center">
                    <motion.span
                        key={safetyScore}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-4xl font-black text-primary"
                    >
                        {safetyScore}
                    </motion.span>
                    <span className="text-xs text-zinc-500 font-bold">out of 100</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div
                    className="bg-green-500/5 rounded-lg p-2.5 border border-green-500/10 hover:bg-green-500/10 transition-colors cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        hapticClick();
                        router.push('/receipts?filter=safe');
                    }}
                >
                    <div className="flex items-center gap-1.5 mb-1">
                        <CheckCircle2 size={12} className="text-green-500" />
                        <div className="text-xs text-zinc-500">Safe</div>
                    </div>
                    <div className="text-xl font-black text-white">{safeScans}</div>
                    <div className="text-xs text-green-500 font-bold">{safePercentage}%</div>
                </div>
                <div
                    className="bg-red-500/5 rounded-lg p-2.5 border border-red-500/10 hover:bg-red-500/10 transition-colors cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        hapticClick();
                        router.push('/receipts?filter=risky');
                    }}
                >
                    <div className="flex items-center gap-1.5 mb-1">
                        <AlertCircle size={12} className="text-red-500" />
                        <div className="text-xs text-zinc-500">Risky</div>
                    </div>
                    <div className="text-xl font-black text-white">{riskyScans}</div>
                    <div className="text-xs text-red-500 font-bold">{(100 - parseFloat(safePercentage)).toFixed(0)}%</div>
                </div>
            </div>

            {/* Action */}
            <div className="flex items-center justify-between text-xs text-zinc-400 group-hover:text-primary transition-colors">
                <span className="font-bold">View full report</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
        </GlassCard>
    );
}
