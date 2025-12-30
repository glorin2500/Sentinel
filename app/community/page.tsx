"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSentinelStore } from "@/lib/store";
import { getLeaderboard, getAchievements } from "@/lib/community/rating-system";
import { Trophy, Users, Award, TrendingUp, Zap, Shield, Target } from "lucide-react";

export default function CommunityPage() {
    const { scans, safetyScore, reportedFrauds } = useSentinelStore();
    const [leaderboardCategory, setLeaderboardCategory] = useState<'scans' | 'safety' | 'reports' | 'streak'>('scans');

    const leaderboard = getLeaderboard(leaderboardCategory);
    const achievements = getAchievements(scans.length, safetyScore, reportedFrauds.length);
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    // Find user's rank (mock - would be real in production)
    const userRank = 42;
    const userEntry = leaderboard[userRank - 1];

    const categories = [
        { id: 'scans' as const, label: 'Most Scans', icon: Zap },
        { id: 'safety' as const, label: 'Safety Score', icon: Shield },
        { id: 'reports' as const, label: 'Fraud Reports', icon: Target },
        { id: 'streak' as const, label: 'Longest Streak', icon: TrendingUp },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto space-y-6 pt-8 pb-32 px-4"
        >
            {/* Header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Users size={20} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Community</h1>
                        <p className="text-zinc-500 font-bold uppercase text-[9px] tracking-[0.25em]">
                            Leaderboards & Achievements
                        </p>
                    </div>
                </div>
            </div>

            {/* Your Stats */}
            <div className="p-6 rounded-3xl border border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-black text-white">Your Rank</h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">
                            Global Leaderboard
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-black text-primary">#{userRank}</p>
                        <p className="text-[10px] text-zinc-400 mt-1">of 1,234 users</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <Zap size={14} className="text-primary mb-2" />
                        <p className="text-xs font-bold text-zinc-400">Total Scans</p>
                        <p className="text-xl font-black text-white">{scans.length}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <Shield size={14} className="text-primary mb-2" />
                        <p className="text-xs font-bold text-zinc-400">Safety Score</p>
                        <p className="text-xl font-black text-white">{safetyScore.toFixed(0)}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <Target size={14} className="text-primary mb-2" />
                        <p className="text-xs font-bold text-zinc-400">Reports</p>
                        <p className="text-xl font-black text-white">{reportedFrauds.length}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <Award size={14} className="text-primary mb-2" />
                        <p className="text-xs font-bold text-zinc-400">Achievements</p>
                        <p className="text-xl font-black text-white">{unlockedCount}/{achievements.length}</p>
                    </div>
                </div>
            </div>

            {/* Achievements */}
            <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-black text-white">Achievements</h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">
                            {unlockedCount} of {achievements.length} Unlocked
                        </p>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
                        <span className="text-xs font-black text-primary">
                            {Math.round((unlockedCount / achievements.length) * 100)}% Complete
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                        <motion.div
                            key={achievement.id}
                            whileHover={{ scale: 1.02 }}
                            className={`p-4 rounded-2xl border transition-all ${achievement.unlocked
                                    ? 'bg-primary/5 border-primary/20'
                                    : 'bg-white/5 border-white/10 opacity-60'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`text-3xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                                    {achievement.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-black text-white mb-1">
                                        {achievement.name}
                                    </h4>
                                    <p className="text-xs text-zinc-400 mb-2">
                                        {achievement.description}
                                    </p>
                                    {!achievement.unlocked && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] text-zinc-500">
                                                <span>Progress</span>
                                                <span>{achievement.progress}/{achievement.target}</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary/50 rounded-full"
                                                    style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {achievement.unlocked && (
                                        <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                                            ✓ Unlocked
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Leaderboard */}
            <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
                <div className="mb-6">
                    <h3 className="text-lg font-black text-white">Global Leaderboard</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">
                        Top Contributors
                    </p>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setLeaderboardCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all whitespace-nowrap ${leaderboardCategory === cat.id
                                        ? 'bg-primary text-background'
                                        : 'bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <Icon size={14} />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* Top 10 */}
                <div className="space-y-2">
                    {leaderboard.slice(0, 10).map((entry, index) => (
                        <motion.div
                            key={entry.userId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-2xl border transition-all ${entry.rank <= 3
                                    ? 'bg-primary/5 border-primary/20'
                                    : 'bg-white/5 border-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Rank */}
                                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black ${entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                                        entry.rank === 2 ? 'bg-zinc-400/20 text-zinc-400' :
                                            entry.rank === 3 ? 'bg-orange-500/20 text-orange-500' :
                                                'bg-white/10 text-zinc-500'
                                    }`}>
                                    {entry.badge || `#${entry.rank}`}
                                </div>

                                {/* Avatar & Name */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="text-2xl">{entry.avatar}</span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-white truncate">
                                            {entry.displayName}
                                        </p>
                                        <p className="text-[10px] text-zinc-500">
                                            {entry.stats.totalScans} scans
                                        </p>
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="text-right">
                                    <p className="text-xl font-black text-primary">
                                        {entry.score}
                                    </p>
                                    <p className="text-[9px] text-zinc-500 uppercase tracking-wider">
                                        {leaderboardCategory === 'safety' ? '%' : 'pts'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* View More */}
                <button className="w-full mt-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-zinc-400 uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all">
                    View Full Leaderboard
                </button>
            </div>
        </motion.div>
    );
}
