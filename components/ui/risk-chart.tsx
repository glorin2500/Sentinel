"use client";

import { GlassCard } from "./glass-card";
import { useSentinelStore } from "@/lib/store";
import { TrendingUp, TrendingDown, AlertTriangle, Shield, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { hapticClick } from "@/lib/haptic";
import { motion } from "framer-motion";

export function RiskChart() {
    const { riskData } = useSentinelStore();
    const router = useRouter();

    // Calculate trend
    const recentScans = riskData.slice(-3);
    const avgRecent = recentScans.reduce((sum, d) => sum + d.value, 0) / recentScans.length;
    const previousScans = riskData.slice(-6, -3);
    const avgPrevious = previousScans.reduce((sum, d) => sum + d.value, 0) / previousScans.length;
    const trend = avgRecent > avgPrevious ? 'up' : 'down';
    const trendPercent = Math.abs(((avgRecent - avgPrevious) / avgPrevious) * 100).toFixed(0);

    // Count high-risk days
    const highRiskDays = riskData.filter(d => d.value > 70).length;
    const totalDays = riskData.length;

    return (
        <GlassCard
            className="h-full flex flex-col cursor-pointer hover:border-white/20 transition-all group"
            onClick={() => {
                hapticClick();
                router.push('/analytics');
            }}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-black text-white">Threat Activity</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Last 7 days</p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${trend === 'up' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                    {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="text-xs font-bold">{trendPercent}%</span>
                </div>
            </div>

            {/* Mini Bar Chart */}
            <div className="flex items-end gap-1.5 h-24 mb-4">
                {riskData.map((day, index) => (
                    <motion.div
                        key={index}
                        className="flex-1 rounded-t-md relative group/bar"
                        style={{
                            height: `${(day.value / 100) * 100}%`,
                            backgroundColor: day.value > 70 ? '#ef4444' : day.value > 40 ? '#eab308' : '#22c55e',
                            opacity: 0.8
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.value / 100) * 100}%` }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        whileHover={{ opacity: 1, scale: 1.05 }}
                    >
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 rounded text-xs font-bold whitespace-nowrap opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none">
                            {day.name}: {day.value}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white/5 rounded-lg p-2.5">
                    <div className="text-xs text-zinc-500 mb-1">High Risk Days</div>
                    <div className="text-xl font-black text-white">{highRiskDays}/{totalDays}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5">
                    <div className="text-xs text-zinc-500 mb-1">Avg Threat Level</div>
                    <div className="text-xl font-black text-white">{avgRecent.toFixed(0)}%</div>
                </div>
            </div>

            {/* Action */}
            <div className="flex items-center justify-between text-xs text-zinc-400 group-hover:text-primary transition-colors">
                <span className="font-bold">View detailed analytics</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
        </GlassCard>
    );
}
