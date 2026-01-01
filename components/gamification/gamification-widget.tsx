"use client";

import { GlassCard } from "../ui/glass-card";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { TransactionService } from "@/lib/services/transaction-service";
import { Trophy, Target, Zap, Shield, TrendingUp, Award } from "lucide-react";
import { useRouter } from "next/navigation";

export function GamificationWidget() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ total: 0, safe: 0, danger: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            TransactionService.getTransactionStats(user.id)
                .then(setStats)
                .finally(() => setLoading(false));
        }
    }, [user]);

    // Calculate level and progress
    const level = Math.floor(stats.total / 10) + 1;
    const scansInCurrentLevel = stats.total % 10;
    const scansForNextLevel = 10;
    const progress = (scansInCurrentLevel / scansForNextLevel) * 100;

    // Calculate threat neutralization rate
    const neutralizationRate = stats.total > 0
        ? Math.round((stats.danger / stats.total) * 100)
        : 0;

    const achievements = [
        {
            icon: Shield,
            title: "First Scan",
            description: "Complete your first threat scan",
            unlocked: stats.total >= 1,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: Target,
            title: "Threat Hunter",
            description: "Block 5 dangerous transactions",
            unlocked: stats.danger >= 5,
            color: "text-red-500",
            bg: "bg-red-500/10"
        },
        {
            icon: Zap,
            title: "Quick Responder",
            description: "Scan 25 transactions",
            unlocked: stats.total >= 25,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10"
        },
        {
            icon: Trophy,
            title: "Elite Guardian",
            description: "Reach level 10",
            unlocked: level >= 10,
            color: "text-primary",
            bg: "bg-primary/10"
        }
    ];

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    if (loading) {
        return (
            <GlassCard className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </GlassCard>
        );
    }

    return (
        <GlassCard className="h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-black text-white">Operative Status</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Your progress in the field</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20">
                    <Award size={14} className="text-primary" />
                    <span className="text-xs font-bold text-primary">LVL {level}</span>
                </div>
            </div>

            {/* Level Progress */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Level {level} Progress
                    </span>
                    <span className="text-xs text-zinc-500">
                        {scansInCurrentLevel}/{scansForNextLevel} scans
                    </span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary/60"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                        <Target size={14} className="text-primary" />
                        <span className="text-xs text-zinc-400">Total Scans</span>
                    </div>
                    <div className="text-2xl font-black text-white">{stats.total}</div>
                </div>
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-1">
                        <Shield size={14} className="text-red-500" />
                        <span className="text-xs text-zinc-400">Threats Blocked</span>
                    </div>
                    <div className="text-2xl font-black text-red-500">{stats.danger}</div>
                </div>
            </div>

            {/* Achievements */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-bold text-white">Achievements</h4>
                    <span className="text-xs text-zinc-500">{unlockedCount}/{achievements.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {achievements.map((achievement, i) => {
                        const Icon = achievement.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-3 rounded-lg border ${achievement.unlocked
                                    ? `${achievement.bg} border-${achievement.color.replace('text-', '')}/20`
                                    : 'bg-black/20 border-white/5 opacity-40'
                                    }`}
                            >
                                <Icon size={16} className={achievement.unlocked ? achievement.color : 'text-zinc-600'} />
                                <div className="text-xs font-bold text-white mt-2">{achievement.title}</div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* CTA */}
            <button
                onClick={() => router.push('/scan')}
                className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30 rounded-lg transition-all flex items-center justify-center gap-2 group"
            >
                <Zap size={16} className="text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-primary">Continue Mission</span>
            </button>
        </GlassCard>
    );
}
