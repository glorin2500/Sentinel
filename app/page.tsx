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
import { AlertTriangle, BookOpen, Receipt, Trophy, ChevronRight, Shield, TrendingUp } from "lucide-react";
import Link from "next/link";
import { hapticClick, hapticLight } from "@/lib/haptic";

export default function Home() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState("");

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
            iconBg: "bg-destructive/10",
            iconColor: "text-destructive"
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="space-y-8 pb-24"
        >
            {/* Header */}
            <div className="flex justify-between items-center pt-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Dashboard</h1>
                    <p className="text-zinc-500 text-sm font-medium mt-1 uppercase tracking-widest">Real-time Security Overview</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-400">{currentDate || "LOADING..."}</div>
                </div>
            </div>

            {/* Quick Access Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Shield size={18} className="text-primary" />
                    <h2 className="text-lg font-black text-white">Quick Access</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickAccessCards.map((card, index) => (
                        <motion.div
                            key={card.href}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + index * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Link href={card.href} onClick={() => hapticClick()}>
                                <div className={`p-5 rounded-2xl border border-white/10 bg-gradient-to-br ${card.gradient} hover:border-white/20 transition-all cursor-pointer group`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-12 w-12 rounded-xl ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <card.icon size={24} className={card.iconColor} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-white">{card.title}</h3>
                                                <p className="text-xs text-zinc-400">{card.description}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </div>
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
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-primary" />
                    <h2 className="text-lg font-black text-white">Security Metrics</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                    <Trophy size={18} className="text-primary" />
                    <h2 className="text-lg font-black text-white">Your Progress</h2>
                </div>
                <GamificationWidget />
            </motion.section>

            {/* Recent Activity Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <RecentScansWidget />
            </motion.section>
        </motion.div>
    );
}
