"use client";

import { RiskChart } from "@/components/ui/risk-chart";
import { SafetyScore } from "@/components/ui/safety-score";
import { AnalyticsWidget } from "@/components/ui/analytics-widget";
import { UPIStatusCard } from "@/components/ui/upi-status-card";
import { RecentScansWidget } from "@/components/ui/recent-scans-widget";
import { GamificationWidget } from "@/components/gamification/gamification-widget";
import { HeroSection } from "@/components/home/hero-section";
import { StatsOverview } from "@/components/home/stats-overview";
import { NearbyThreatsCard } from "@/components/home/nearby-threats-card";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, BookOpen, Receipt, Trophy, ChevronRight, Shield, TrendingUp, Activity } from "lucide-react";
import Link from "next/link";
import { hapticClick, hapticLight } from "@/lib/haptic";

export default function Home() {
    const router = useRouter();

    const quickAccessCards = [
        {
            icon: AlertTriangle,
            title: "Emergency",
            description: "Quick fraud response",
            href: "/emergency",
            gradient: "from-red-500/20 via-red-500/10 to-transparent",
            iconBg: "bg-destructive/10",
            iconColor: "text-destructive",
            borderColor: "border-destructive/20",
            glowColor: "shadow-[0_0_30px_rgba(255,107,107,0.15)]"
        },
        {
            icon: BookOpen,
            title: "Education",
            description: "Learn security tips",
            href: "/education",
            gradient: "from-primary/20 via-primary/10 to-transparent",
            iconBg: "bg-primary/10",
            iconColor: "text-primary",
            borderColor: "border-primary/20",
            glowColor: "shadow-[0_0_30px_rgba(124,255,178,0.15)]"
        },
        {
            icon: Receipt,
            title: "Receipts",
            description: "Transaction history",
            href: "/receipts",
            gradient: "from-blue-500/20 via-blue-500/10 to-transparent",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-500",
            borderColor: "border-blue-500/20",
            glowColor: "shadow-[0_0_30px_rgba(59,130,246,0.15)]"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 sm:space-y-8 pb-24"
        >
            {/* Hero Section */}
            <HeroSection />

            {/* Stats Overview */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <StatsOverview />
            </motion.section>

            {/* Nearby Threats Map Preview */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
            >
                <NearbyThreatsCard />
            </motion.section>

            {/* Quick Access Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Shield size={20} className="text-primary" />
                    <h2 className="text-xl font-black text-white">Quick Access</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickAccessCards.map((card, index) => (
                        <motion.div
                            key={card.href}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.05 }}
                            whileHover={{ y: -6, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Link href={card.href} onClick={() => hapticClick()}>
                                <div className={`relative p-6 rounded-2xl border ${card.borderColor} bg-gradient-to-br ${card.gradient} backdrop-blur-sm hover:border-white/30 transition-all cursor-pointer group ${card.glowColor}`}>
                                    {/* Glow effect on hover */}
                                    <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity ${card.iconBg} blur-2xl`} />

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`h-14 w-14 rounded-xl ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <card.icon size={28} className={card.iconColor} strokeWidth={2.5} />
                                            </div>
                                            <ChevronRight size={24} className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white mb-1">{card.title}</h3>
                                            <p className="text-sm text-zinc-400">{card.description}</p>
                                        </div>
                                    </div>

                                    {/* Animated corner accent */}
                                    <motion.div
                                        className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-0 group-hover:opacity-10 transition-opacity ${card.iconBg}`}
                                        initial={false}
                                    />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Security Metrics Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={20} className="text-primary" />
                    <h2 className="text-xl font-black text-white">Security Metrics</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    <RiskChart />
                    <SafetyScore />
                    <AnalyticsWidget />
                </div>
            </motion.section>

            {/* Progress Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Trophy size={20} className="text-primary" />
                    <h2 className="text-xl font-black text-white">Your Progress</h2>
                </div>
                <GamificationWidget />
            </motion.section>

            {/* Recent Activity Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={20} className="text-primary" />
                    <h2 className="text-xl font-black text-white">Recent Activity</h2>
                </div>
                <RecentScansWidget />
            </motion.section>
        </motion.div>
    );
}
