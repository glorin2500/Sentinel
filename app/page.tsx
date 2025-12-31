"use client";

import { RiskChart } from "@/components/ui/risk-chart";
import { SafetyScore } from "@/components/ui/safety-score";
import { AnalyticsWidget } from "@/components/ui/analytics-widget";
import { UPIStatusCard } from "@/components/ui/upi-status-card";
import { RecentScansWidget } from "@/components/ui/recent-scans-widget";
import { GamificationWidget } from "@/components/gamification/gamification-widget";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, BookOpen, Receipt, Trophy, ChevronRight, Shield, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useSentinelStore } from "@/lib/store";

export default function Home() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState("");
    const { scans, safetyScore } = useSentinelStore();

    useEffect(() => {
        const updateDate = () => {
            const now = new Date();
            const formatted = now.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }).toUpperCase();
            setCurrentDate(formatted);
        };
        updateDate();
        const interval = setInterval(updateDate, 60000);
        return () => clearInterval(interval);
    }, []);

    const quickAccessCards = [
        {
            icon: AlertTriangle,
            title: "Emergency",
            description: "Quick fraud response",
            href: "/emergency",
            color: "destructive",
            gradient: "from-red-500/10 to-red-500/5",
            iconBg: "bg-red-500/10",
            iconColor: "text-red-500"
        },
        {
            icon: BookOpen,
            title: "Education",
            description: "Learn security tips",
            href: "/education",
            color: "primary",
            gradient: "from-primary/10 to-primary/5",
            iconBg: "bg-primary/10",
            iconColor: "text-primary"
        },
        {
            icon: Receipt,
            title: "Receipts",
            description: "Transaction history",
            href: "/receipts",
            color: "blue-500",
            gradient: "from-blue-500/10 to-blue-500/5",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-500"
        }
    ];

    const stats = [
        {
            label: "Total Scans",
            value: scans.length,
            icon: Shield,
            color: "text-primary"
        },
        {
            label: "Safety Score",
            value: `${safetyScore.toFixed(0)}%`,
            icon: TrendingUp,
            color: "text-green-500"
        },
        {
            label: "Protected",
            value: scans.filter(s => s.status === 'safe').length,
            icon: Zap,
            color: "text-blue-500"
        }
    ];

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-4"
            >
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-1">
                            Welcome Back
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            Your security dashboard is ready
                        </p>
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-xs font-bold text-zinc-400">
                        {currentDate || "LOADING..."}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <stat.icon size={16} className={stat.color} />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                    {stat.label}
                                </span>
                            </div>
                            <p className="text-2xl font-black text-white">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Quick Access Section */}
            <div>
                <h2 className="text-lg font-black text-white mb-4">Quick Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickAccessCards.map((card, index) => (
                        <motion.div
                            key={card.href}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                        >
                            <Link href={card.href}>
                                <div className={`p-5 rounded-2xl border border-white/10 bg-gradient-to-br ${card.gradient} hover:scale-[1.02] transition-all cursor-pointer group h-full`}>
                                    <div className="flex flex-col h-full">
                                        <div className={`h-12 w-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-4`}>
                                            <card.icon size={24} className={card.iconColor} />
                                        </div>
                                        <h3 className="text-lg font-black text-white mb-1">{card.title}</h3>
                                        <p className="text-sm text-zinc-400 mb-4 flex-1">{card.description}</p>
                                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 group-hover:text-white transition-colors">
                                            <span>Open</span>
                                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Main Dashboard Grid */}
            <div>
                <h2 className="text-lg font-black text-white mb-4">Security Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <RiskChart />
                    <SafetyScore />
                    <AnalyticsWidget />
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Scans - Takes 2 columns */}
                <div className="xl:col-span-2">
                    <h2 className="text-lg font-black text-white mb-4">Recent Activity</h2>
                    <RecentScansWidget />
                </div>

                {/* Gamification - Takes 1 column */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy size={20} className="text-primary" />
                        <h2 className="text-lg font-black text-white">Your Progress</h2>
                    </div>
                    <GamificationWidget />
                </div>
            </div>
        </div>
    );
}
