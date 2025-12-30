"use client";

import { EducationHub } from "@/components/education/education-hub";
import { motion } from "framer-motion";
import { BookOpen, Brain, TrendingUp } from "lucide-react";
import { useSentinelStore } from "@/lib/store";

export default function EducationPage() {
    const { gamification } = useSentinelStore();

    return (
        <div className="min-h-screen bg-background p-6 pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <BookOpen size={24} className="text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white">
                                    Security Education
                                </h1>
                                <p className="text-sm text-zinc-400">
                                    Learn to protect yourself from fraud
                                </p>
                            </div>
                        </div>

                        {/* Knowledge Score */}
                        <div className="text-right">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                                Knowledge Score
                            </p>
                            <p className="text-2xl font-black text-primary">
                                {Math.min(100, gamification.level * 10)}%
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Brain size={14} className="text-primary" />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                    Level
                                </span>
                            </div>
                            <p className="text-xl font-black text-white">
                                {gamification.level}
                            </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp size={14} className="text-primary" />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                    XP
                                </span>
                            </div>
                            <p className="text-xl font-black text-white">
                                {gamification.xp.toLocaleString()}
                            </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 mb-1">
                                <BookOpen size={14} className="text-primary" />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                    Completed
                                </span>
                            </div>
                            <p className="text-xl font-black text-white">
                                {gamification.completedChallenges.length}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Education Hub */}
                <EducationHub />
            </div>
        </div>
    );
}
