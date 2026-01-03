"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export function ThreatActivity() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        todayThreats: 0,
        yesterdayThreats: 0,
        weekThreats: 0,
        trend: 0,
        loading: true,
    });

    useEffect(() => {
        const fetchThreatActivity = async () => {
            if (!user || !isSupabaseConfigured()) {
                setStats(prev => ({ ...prev, loading: false }));
                return;
            }

            try {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);

                // Get today's threats
                const { count: todayThreats } = await supabase
                    .from('transactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .in('risk_level', ['warning', 'danger'])
                    .gte('created_at', today.toISOString());

                // Get yesterday's threats
                const { count: yesterdayThreats } = await supabase
                    .from('transactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .in('risk_level', ['warning', 'danger'])
                    .gte('created_at', yesterday.toISOString())
                    .lt('created_at', today.toISOString());

                // Get week's threats
                const { count: weekThreats } = await supabase
                    .from('transactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .in('risk_level', ['warning', 'danger'])
                    .gte('created_at', weekAgo.toISOString());

                // Calculate trend
                const trend = yesterdayThreats && yesterdayThreats > 0
                    ? ((((todayThreats || 0) - yesterdayThreats) / yesterdayThreats) * 100)
                    : 0;

                setStats({
                    todayThreats: todayThreats || 0,
                    yesterdayThreats: yesterdayThreats || 0,
                    weekThreats: weekThreats || 0,
                    trend: Math.round(trend),
                    loading: false,
                });
            } catch (error) {
                console.error('Failed to fetch threat activity:', error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchThreatActivity();

        // Refresh every 30 seconds
        const interval = setInterval(fetchThreatActivity, 30000);
        return () => clearInterval(interval);
    }, [user]);

    if (stats.loading) {
        return (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="h-32 rounded-xl bg-white/5 animate-pulse" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black flex items-center gap-2">
                    <Activity size={20} className="text-red-500" />
                    Threat Activity
                </h3>
                {stats.trend !== 0 && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${stats.trend > 0 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                        {stats.trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span className="text-xs font-bold">{Math.abs(stats.trend)}%</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                    <p className="text-3xl font-black text-red-500">{stats.todayThreats}</p>
                    <p className="text-xs text-zinc-400 mt-1">Today</p>
                </div>
                <div className="text-center border-l border-r border-white/10">
                    <p className="text-3xl font-black text-orange-500">{stats.yesterdayThreats}</p>
                    <p className="text-xs text-zinc-400 mt-1">Yesterday</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-black text-yellow-500">{stats.weekThreats}</p>
                    <p className="text-xs text-zinc-400 mt-1">This Week</p>
                </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-white/5">
                <p className="text-xs text-zinc-400 text-center">
                    {stats.todayThreats === 0 ? (
                        "No threats detected today! 🛡️"
                    ) : stats.todayThreats === 1 ? (
                        "1 threat blocked today"
                    ) : (
                        `${stats.todayThreats} threats blocked today`
                    )}
                </p>
            </div>
        </motion.div>
    );
}
