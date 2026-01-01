"use client";

import { GlassCard } from "./glass-card";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { hapticClick } from "@/lib/haptic";
import { Shield, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { TransactionService } from "@/lib/services/transaction-service";

export function SafetyScore() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        total: 0,
        safe: 0,
        caution: 0,
        warning: 0,
        danger: 0,
        totalAmount: 0,
        avgAmount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        TransactionService.getTransactionStats(user.id)
            .then(setStats)
            .finally(() => setLoading(false));
    }, [user]);

    // Calculate safety score based on transaction risk levels
    const calculateSafetyScore = () => {
        if (stats.total === 0) return 100; // Default score

        const safeWeight = stats.safe * 100;
        const cautionWeight = stats.caution * 75;
        const warningWeight = stats.warning * 50;
        const dangerWeight = stats.danger * 0;

        const totalWeight = safeWeight + cautionWeight + warningWeight + dangerWeight;
        return Math.round(totalWeight / stats.total);
    };

    const safetyScore = calculateSafetyScore();
    const safeScans = stats.safe;
    const riskyScans = stats.warning + stats.danger;

    // Determine status
    const getStatus = () => {
        if (safetyScore >= 90) return { label: 'Excellent', color: 'text-green-500', bg: 'bg-green-500/10', icon: Shield };
        if (safetyScore >= 75) return { label: 'Good', color: 'text-primary', bg: 'bg-primary/10', icon: CheckCircle2 };
        if (safetyScore >= 60) return { label: 'Fair', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: AlertCircle };
        return { label: 'At Risk', color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertCircle };
    };

    const status = getStatus();
    const StatusIcon = status.icon;

    if (loading) {
        return (
            <GlassCard className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </GlassCard>
        );
    }

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
            <div className="flex-1 flex items-center justify-center mb-4">
                <div className="relative">
                    {/* Background Circle */}
                    <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-white/5"
                        />
                        {/* Progress Circle */}
                        <motion.circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            className={status.color}
                            initial={{ strokeDasharray: "0 352" }}
                            animate={{
                                strokeDasharray: `${(safetyScore / 100) * 352} 352`,
                            }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </svg>
                    {/* Score Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="text-4xl font-black text-white"
                            >
                                {safetyScore}
                            </motion.div>
                            <div className="text-xs text-zinc-500 font-medium">/ 100</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push('/history?filter=safe');
                    }}
                    className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 transition-all text-left"
                >
                    <div className="text-2xl font-black text-green-500">{safeScans}</div>
                    <div className="text-xs text-zinc-400 mt-1">Safe Scans</div>
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push('/history?filter=danger');
                    }}
                    className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-all text-left"
                >
                    <div className="text-2xl font-black text-red-500">{riskyScans}</div>
                    <div className="text-xs text-zinc-400 mt-1">Risky Scans</div>
                </button>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between text-sm text-zinc-400 group-hover:text-primary transition-colors">
                <span className="font-medium">View full report</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
        </GlassCard>
    );
}
