"use client";

import { RiskChart } from "@/components/ui/risk-chart";
import { SafetyScore } from "@/components/ui/safety-score";
import { AnalyticsWidget } from "@/components/ui/analytics-widget";
import { UPIStatusCard } from "@/components/ui/upi-status-card";
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

            {/* Mini History Preview */}
            {/* Mini History Preview */}
            <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-white uppercase tracking-[0.2em] text-xs">Live Internal Alerts</h3>
                    <button
                        onClick={() => router.push('/history')}
                        className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
                    >
                        View Full History
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform font-bold">!</div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <p className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">Suspicious Login Attempt</p>
                                <span className="text-xs text-zinc-500">Now</span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">New device detected near Mumbai, IN</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="h-12 w-12 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20 group-hover:scale-110 transition-transform font-bold">?</div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <p className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">Unverified Merchant</p>
                                <span className="text-xs text-zinc-500">2m ago</span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">Payment of ₹2,000 to "Shop-XYZ"</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
