"use client";

import { motion } from "framer-motion";
import { Shield, TrendingUp, Zap, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { hapticClick } from "@/lib/haptic";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function StatsOverview() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalScans: 0,
        threatsBlocked: 0,
        safetyScore: 100,
        thisMonthScans: 0,
        loading: true,
    });

    useEffect(() => {
        const fetchStats = async () => {
            if (!user || !isSupabaseConfigured()) {
                setStats(prev => ({ ...prev, loading: false }));
                return;
            }

            try {
                const supabase = createClient();

                // Get total scans
                const { count: totalScans } = await supabase
                    .from('transactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                // Get threats blocked (warning + danger)
                const { count: threatsBlocked } = await supabase
                    .from('transactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .in('risk_level', ['warning', 'danger']);

                // Get this month's scans
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);

                const { count: thisMonthScans } = await supabase
                    .from('transactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .gte('created_at', startOfMonth.toISOString());

                // Calculate safety score
                const safetyScore = totalScans && totalScans > 0
                    ? Math.round(((totalScans - (threatsBlocked || 0)) / totalScans) * 100)
                    : 100;

                setStats({
                    totalScans: totalScans || 0,
                    threatsBlocked: threatsBlocked || 0,
                    safetyScore,
                    thisMonthScans: thisMonthScans || 0,
                    loading: false,
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();

        // Refresh stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const statsData = [
        {
            icon: Target,
            label: "Scans This Month",
            value: stats.loading ? "..." : stats.thisMonthScans,
            trend: stats.totalScans > 0 ? `${stats.totalScans} total` : "Get started",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
            action: () => router.push('/history')
        },
        {
            icon: Shield,
            label: "Safety Score",
            value: stats.loading ? "..." : `${stats.safetyScore}%`,
            trend: stats.safetyScore >= 80 ? "Excellent" : stats.safetyScore >= 60 ? "Good" : "Fair",
            color: "text-primary",
            bg: "bg-primary/10",
            glow: "shadow-[0_0_20px_rgba(124,255,178,0.15)]",
            action: () => router.push('/analytics')
        },
        {
            icon: Zap,
            label: "Threats Blocked",
            value: stats.loading ? "..." : stats.threatsBlocked,
            trend: "All time",
            color: "text-destructive",
            bg: "bg-destructive/10",
            glow: "shadow-[0_0_20px_rgba(255,107,107,0.15)]",
            action: () => router.push('/analytics')
        },
        {
            icon: TrendingUp,
            label: "Total Scans",
            value: stats.loading ? "..." : stats.totalScans,
            trend: stats.totalScans > 0 ? "Keep it up!" : "Start scanning",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            glow: "shadow-[0_0_20px_rgba(249,115,22,0.15)]",
            action: () => router.push('/scan')
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {statsData.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        hapticClick();
                        stat.action();
                    }}
                    className={`relative p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all cursor-pointer group ${stat.glow}`}
                >
                    {/* Glow effect */}
                    <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity ${stat.bg} blur-xl`} />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <stat.icon size={20} className={stat.color} />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                {stat.trend}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl sm:text-3xl font-black text-white">
                                {stat.value}
                            </p>
                            <p className="text-[10px] sm:text-xs font-medium text-zinc-400">
                                {stat.label}
                            </p>
                        </div>
                    </div>

                    {/* Animated border */}
                    <motion.div
                        className={`absolute inset-0 rounded-2xl border-2 ${stat.color.replace('text-', 'border-')} opacity-0 group-hover:opacity-20`}
                        initial={false}
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </motion.div>
            ))}
        </div>
    );
}
