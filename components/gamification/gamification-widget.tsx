"use client";

import { motion } from "framer-motion";
import { useSentinelStore } from "@/lib/store";
import { generateDailyChallenges, calculateStreak, getXPForNextLevel } from "@/lib/gamification/progression-system";
import { Trophy, Zap, Target, TrendingUp, Award, Star } from "lucide-react";

export function GamificationWidget() {
    const { scans, gamification, addXP } = useSentinelStore();

    // Calculate streak
    const { current: currentStreak, longest: longestStreak } = calculateStreak(scans);

    // Get daily challenges
    const challenges = generateDailyChallenges(scans);

    // Calculate XP for next level
    const xpForNext = getXPForNextLevel(gamification.xp);
    const xpProgress = ((gamification.xp % xpForNext) / xpForNext) * 100;

    return (
        <div className="space-y-4">
            {/* Level & XP Progress */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Trophy size={24} className="text-primary" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white">Level {gamification.level}</h3>
                            <p className="text-xs text-zinc-400">
                                {gamification.xp.toLocaleString()} XP
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                            Next Level
                        </p>
                        <p className="text-sm font-black text-primary">
                            {(xpForNext - (gamification.xp % xpForNext)).toLocaleString()} XP
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${xpProgress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                        />
                    </div>
                    <p className="text-[10px] text-zinc-500 text-right">
                        {xpProgress.toFixed(1)}% to Level {gamification.level + 1}
                    </p>
                </div>
            </motion.div>

            {/* Streak */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 gap-4"
            >
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap size={16} className="text-orange-500" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                            Current Streak
                        </span>
                    </div>
                    <p className="text-3xl font-black text-white">{currentStreak} 🔥</p>
                    <p className="text-xs text-zinc-400 mt-1">days</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <Award size={16} className="text-primary" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                            Best Streak
                        </span>
                    </div>
                    <p className="text-3xl font-black text-white">{longestStreak}</p>
                    <p className="text-xs text-zinc-400 mt-1">days</p>
                </div>
            </motion.div>

            {/* Daily Challenges */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
            >
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-white">Daily Challenges</h4>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        {challenges.filter(c => c.progress >= c.target).length}/{challenges.length} Complete
                    </span>
                </div>

                {challenges.map((challenge, index) => {
                    const progress = (challenge.progress / challenge.target) * 100;
                    const isComplete = progress >= 100;

                    return (
                        <motion.div
                            key={challenge.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className={`p-4 rounded-2xl border transition-all ${isComplete
                                    ? 'bg-primary/5 border-primary/20'
                                    : 'bg-white/5 border-white/10'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{challenge.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h5 className="text-sm font-black text-white">
                                            {challenge.title}
                                        </h5>
                                        {isComplete && (
                                            <Star size={16} className="text-primary fill-primary" />
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-400 mb-2">
                                        {challenge.description}
                                    </p>

                                    {!isComplete && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] text-zinc-500">
                                                <span>Progress</span>
                                                <span>{challenge.progress}/{challenge.target}</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary/50 rounded-full transition-all"
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 mt-2">
                                        <Zap size={12} className="text-primary" />
                                        <span className="text-[10px] font-bold text-primary">
                                            +{challenge.reward.xp} XP
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Unlocked Rewards */}
            {gamification.unlockedThemes.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10"
                >
                    <h4 className="text-sm font-black text-white mb-3">Unlocked Rewards</h4>
                    <div className="flex flex-wrap gap-2">
                        {gamification.unlockedThemes.map(theme => (
                            <div
                                key={theme}
                                className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20"
                            >
                                <span className="text-xs font-bold text-primary">
                                    {theme.replace('theme-', '').replace('-', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
