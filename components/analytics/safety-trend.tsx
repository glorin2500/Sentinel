"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { ScanResult } from "@/lib/store";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface SafetyTrendProps {
    scans: ScanResult[];
    currentScore: number;
}

export function SafetyTrend({ scans, currentScore }: SafetyTrendProps) {
    // Calculate safety score over time (last 30 days)
    const trendData = useMemo(() => {
        const days = 30;
        const data = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = subDays(now, i);
            const dayStart = startOfDay(date);
            const dayEnd = endOfDay(date);

            // Get scans for this day and all previous days
            const scansUpToDate = scans.filter(s => s.timestamp <= dayEnd.getTime());

            if (scansUpToDate.length > 0) {
                const riskyCount = scansUpToDate.filter(s => s.status === 'risky').length;
                const score = ((scansUpToDate.length - riskyCount) / scansUpToDate.length) * 100;

                data.push({
                    date: format(date, 'MMM d'),
                    score: parseFloat(score.toFixed(1)),
                    scans: scansUpToDate.length
                });
            } else if (data.length > 0) {
                // Use previous score if no scans on this day
                data.push({
                    date: format(date, 'MMM d'),
                    score: data[data.length - 1].score,
                    scans: 0
                });
            }
        }

        return data;
    }, [scans]);

    // Calculate trend
    const trend = useMemo(() => {
        if (trendData.length < 2) return 'stable';

        const firstScore = trendData[0].score;
        const lastScore = trendData[trendData.length - 1].score;
        const diff = lastScore - firstScore;

        if (diff > 5) return 'improving';
        if (diff < -5) return 'declining';
        return 'stable';
    }, [trendData]);

    const getTrendIcon = () => {
        switch (trend) {
            case 'improving':
                return <TrendingUp size={16} className="text-primary" />;
            case 'declining':
                return <TrendingDown size={16} className="text-destructive" />;
            default:
                return <Minus size={16} className="text-zinc-400" />;
        }
    };

    const getTrendText = () => {
        switch (trend) {
            case 'improving':
                return 'Improving';
            case 'declining':
                return 'Declining';
            default:
                return 'Stable';
        }
    };

    const getTrendColor = () => {
        switch (trend) {
            case 'improving':
                return 'text-primary';
            case 'declining':
                return 'text-destructive';
            default:
                return 'text-zinc-400';
        }
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="px-3 py-2 rounded-xl bg-background border border-white/20 backdrop-blur-xl">
                    <p className="text-xs font-black text-white mb-1">{payload[0].payload.date}</p>
                    <p className="text-[10px] text-primary font-bold">
                        Score: {payload[0].value}%
                    </p>
                    {payload[0].payload.scans > 0 && (
                        <p className="text-[9px] text-zinc-400">
                            {payload[0].payload.scans} total scans
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    if (trendData.length === 0) {
        return (
            <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
                <h3 className="text-lg font-black text-white mb-2">Safety Score Trend</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-6">
                    Last 30 Days
                </p>
                <div className="flex flex-col items-center justify-center py-12">
                    <TrendingUp size={48} className="text-zinc-700 mb-4" />
                    <p className="text-sm font-bold text-zinc-500">No data available yet</p>
                    <p className="text-xs text-zinc-600 mt-2">Start scanning to see your safety trends</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-black text-white">Safety Score Trend</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">
                        Last 30 Days
                    </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${trend === 'improving' ? 'bg-primary/10 border-primary/20' :
                        trend === 'declining' ? 'bg-destructive/10 border-destructive/20' :
                            'bg-white/5 border-white/10'
                    }`}>
                    {getTrendIcon()}
                    <span className={`text-xs font-black uppercase tracking-wider ${getTrendColor()}`}>
                        {getTrendText()}
                    </span>
                </div>
            </div>

            {/* Current Score */}
            <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block mb-2">
                    Current Safety Score
                </span>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-primary">
                        {currentScore.toFixed(1)}
                    </span>
                    <span className="text-lg font-bold text-zinc-400">%</span>
                </div>
            </div>

            {/* Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7CFFB2" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#7CFFB2" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            domain={[0, 100]}
                            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#7CFFB2"
                            strokeWidth={2}
                            fill="url(#scoreGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
