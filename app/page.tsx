"use client";

import { RiskChart } from "@/components/ui/risk-chart";
import { SafetyScore } from "@/components/ui/safety-score";
import { AnalyticsWidget } from "@/components/ui/analytics-widget";
import { UPIStatusCard } from "@/components/ui/upi-status-card";
import { RecentScansWidget } from "@/components/ui/recent-scans-widget";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
        const interval = setInterval(updateDate, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

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

            {/* Dashboard Grid - Matched to Reference Image Order (Left to Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <RiskChart />
                <SafetyScore />
                <AnalyticsWidget />
            </div>

            {/* Recent Scans Preview */}
            <RecentScansWidget />
        </motion.div>
    );
}
