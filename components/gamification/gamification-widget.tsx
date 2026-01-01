"use client";

import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, Award, Flame, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { TransactionService } from "@/lib/services/transaction-service";

export function GamificationWidget() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        safe: 0,
        caution: 0,
        warning: 0,
        danger: 0,
        totalAmount: 0,
        avgAmount: 0
    });

    useEffect(() => {
        if (user) {
            TransactionService.getTransactionStats(user.id).then(setStats);
        }
    }, [user]);

    // Calculate level based on total scans
    const level = Math.floor(stats.total / 10) + 1;
    const scansForNextLevel = (level * 10) - stats.total;
    const progress = ((stats.total % 10) / 10) * 100;

    // Calculate achievements
    const achievements = [
        { id: 1, name: 'First Scan', icon: Target, unlocked: stats.total >= 1, requirement: 1 },
        { id: 2, name: 'Safety Conscious', icon: CheckCircle, unlocked: stats.total >= 5, requirement: 5 },
        { id: 3, name: 'Vigilant Guardian', icon: Award, unlocked: stats.total >= 20, requirement: 20 },
        { id: 4, name: 'Fraud Hunter', icon: Trophy, unlocked: stats.total >= 50, requirement: 50 },
    ];

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className="space-y-4">
            {/* Level Progress */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-2xl font-black text-white">Level {level}</h3>
                        <p className="text-sm text-zinc-400">{stats.total} scans completed</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Next Level</p>
                        <p className="text-lg font-black text-primary">{scansForNextLevel} scans</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                        />
                    </div>
                    <p className="text-xs text-zinc-500 text-center">
                        {Math.round(progress)}% to Level {level + 1}
                    </p>
                </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl border border-white/10 bg-zinc-900/50"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-white">Achievements</h3>
                    <span className="text-sm text-zinc-400">{unlockedCount}/{achievements.length}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {achievements.map((achievement, i) => {
                        const Icon = achievement.icon;
                        return (
                            <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className={`p-4 rounded-xl border transition-all ${achievement.unlocked
                                        ? 'bg-primary/10 border-primary/30'
                                        : 'bg-black/30 border-white/5 opacity-50'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${achievement.unlocked ? 'bg-primary/20' : 'bg-white/5'
                                    }`}>
                                    <Icon size={20} className={achievement.unlocked ? 'text-primary' : 'text-zinc-600'} />
                                </div>
                                <h4 className={`text-sm font-bold mb-1 ${achievement.unlocked ? 'text-white' : 'text-zinc-600'
                                    }`}>
                                    {achievement.name}
                                </h4>
                                <p className="text-xs text-zinc-500">
                                    {achievement.unlocked ? 'Unlocked!' : `${achievement.requirement} scans`}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-3"
            >
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Safe Scans</span>
                    </div>
                    <div className="text-2xl font-black text-green-500">{stats.safe}</div>
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-primary" />
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Accuracy</span>
                    </div>
                    <div className="text-2xl font-black text-primary">
                        {stats.total > 0 ? Math.round((stats.safe / stats.total) * 100) : 100}%
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
