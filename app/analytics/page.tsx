"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { RiskDistributionChart } from "@/components/analytics/risk-distribution-chart";
import { ScanTrendChart } from "@/components/analytics/scan-trend-chart";
import { CalendarHeatmap } from "@/components/analytics/calendar-heatmap";
import { SpendingChart } from "@/components/analytics/spending-chart";
import { SafetyTrend } from "@/components/analytics/safety-trend";
import { BarChart3, Calendar, TrendingUp, FileText, Shield, Zap } from "lucide-react";

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'insights'>('overview');
    const [stats, setStats] = useState({
        totalScans: 0,
        safeScans: 0,
        riskyScans: 0,
        scansWithAmount: 0,
        safetyScore: 100,
        loading: true,
    });

    useEffect(() => {
        const fetchStats = async () => {
            if (!user || !isSupabaseConfigured()) {
                setStats(prev => ({ ...prev, loading: false }));
                return;
            }

            try {
                // Get total scans
                const { count: totalScans } = await supabase
                    .from('transactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                // Get safe scans
                const { count: safeScans } = await supabase
                    .from('transactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('risk_level', 'safe');

                // Get risky scans (warning + danger)
                const { count: riskyScans } = await supabase
                    .from('transactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .in('risk_level', ['warning', 'danger']);

                // Get scans with amount
                const { count: scansWithAmount } = await supabase
                    .from('transactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .not('amount', 'is', null);

                // Calculate safety score
                const safetyScore = totalScans && totalScans > 0
                    ? Math.round(((totalScans - (riskyScans || 0)) / totalScans) * 100)
                    : 100;

                setStats({
                    totalScans: totalScans || 0,
                    safeScans: safeScans || 0,
                    riskyScans: riskyScans || 0,
                    scansWithAmount: scansWithAmount || 0,
                    safetyScore,
                    loading: false,
                });
            } catch (error) {
                console.error('Failed to fetch analytics stats:', error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();

        // Refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const tabs = [
        { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
        { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
        { id: 'insights' as const, label: 'Insights', icon: TrendingUp },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto space-y-6 pt-8 pb-32 px-4"
        >
            {/* Header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <BarChart3 size={20} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Analytics</h1>
                        <p className="text-zinc-500 font-bold uppercase text-[9px] tracking-[0.25em]">
                            Data & Insights Dashboard
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap size={14} className="text-primary" />
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                            Total Scans
                        </span>
                    </div>
                    <p className="text-2xl font-black text-white">{stats.loading ? '...' : stats.totalScans}</p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield size={14} className="text-primary" />
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                            Safe Scans
                        </span>
                    </div>
                    <p className="text-2xl font-black text-primary">{stats.loading ? '...' : stats.safeScans}</p>
                </div>

                <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText size={14} className="text-destructive" />
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                            Risky Scans
                        </span>
                    </div>
                    <p className="text-2xl font-black text-destructive">{stats.loading ? '...' : stats.riskyScans}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-zinc-400" />
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                            With Amount
                        </span>
                    </div>
                    <p className="text-2xl font-black text-white">{stats.loading ? '...' : stats.scansWithAmount}</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-2 rounded-2xl bg-white/5 border border-white/10">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 h-10 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                                ? 'bg-primary text-background shadow-[0_0_20px_rgba(124,255,178,0.3)]'
                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        <RiskDistributionChart />
                        <ScanTrendChart />
                    </motion.div>
                )}

                {activeTab === 'calendar' && (
                    <motion.div
                        key="calendar"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
                            <p className="text-zinc-400 text-sm">Calendar heatmap coming soon</p>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'insights' && (
                    <motion.div
                        key="insights"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* AI-Generated Insights */}
                        <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
                            <h3 className="text-lg font-black text-white mb-2">AI Insights</h3>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-6">
                                Personalized Analysis
                            </p>

                            <div className="space-y-4">
                                {stats.safetyScore >= 90 && (
                                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                <Shield size={16} className="text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white mb-1">
                                                    Excellent Safety Record! 🎉
                                                </h4>
                                                <p className="text-xs text-zinc-400 leading-relaxed">
                                                    Your safety score of {stats.safetyScore}% is outstanding!
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {stats.safetyScore < 70 && stats.riskyScans > 0 && (
                                    <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20">
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
                                                <FileText size={16} className="text-destructive" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white mb-1">
                                                    Security Alert ⚠️
                                                </h4>
                                                <p className="text-xs text-zinc-400 leading-relaxed">
                                                    You've encountered {stats.riskyScans} risky scan{stats.riskyScans > 1 ? 's' : ''}.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {stats.totalScans === 0 && (
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <p className="text-xs text-zinc-400 text-center">
                                            Start scanning to see personalized insights
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
