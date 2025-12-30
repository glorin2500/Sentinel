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
import { AlertTriangle, BookOpen, Receipt, Trophy, ChevronRight } from "lucide-react";
import Link from "next/link";

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
            gradient: "from-red-500/10 to-red-500/5"
        },
        {
            icon: BookOpen,
            title: "Education",
            description: "Learn security tips",
            href: "/education",
            color: "primary",
            gradient: "from-primary/10 to-primary/5"
        },
        {
            icon: Receipt,
            title: "Receipts",
            description: "Transaction history",
            href: "/receipts",
            color: "blue-500",
            gradient: "from-blue-500/10 to-blue-500/5"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center mb-10 pt-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Overview</h1>
                    <p className="text-zinc-500 text-sm font-medium mt-1 uppercase tracking-widest">Real-time Security Dashboard</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-xs font-bold text-zinc-400">{currentDate || "LOADING..."}</div>
                </div>
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {quickAccessCards.map((card, index) => (
                    <motion.div
                        key={card.href}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link href={card.href}>
                            <div className={`p-5 rounded-2xl border border-white/10 bg-gradient-to-br ${card.gradient} hover:scale-[1.02] transition-all cursor-pointer group`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-12 w-12 rounded-xl bg-${card.color === 'destructive' ? 'destructive' : card.color === 'primary' ? 'primary' : 'blue-500'}/10 flex items-center justify-center`}>
                                            <card.icon size={24} className={`text-${card.color === 'destructive' ? 'destructive' : card.color === 'primary' ? 'primary' : 'blue-500'}`} />
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

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <RiskChart />
                <SafetyScore />
                <AnalyticsWidget />
            </div>

            {/* Gamification Widget */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Trophy size={20} className="text-primary" />
                    <h2 className="text-xl font-black text-white">Your Progress</h2>
                </div>
                <GamificationWidget />
            </motion.div>

            {/* Recent Scans Preview */}
            <RecentScansWidget />
        </motion.div>
    );
}
