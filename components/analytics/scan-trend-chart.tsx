"use client";

import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export function ScanTrendChart() {
    const { user } = useAuth();
    const [data, setData] = useState<{ date: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !isSupabaseConfigured()) {
                setLoading(false);
                return;
            }

            try {
                // Get scans from last 7 days
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('created_at')
                    .eq('user_id', user.id)
                    .gte('created_at', sevenDaysAgo.toISOString());

                if (transactions) {
                    // Group by date
                    const grouped = transactions.reduce((acc: any, t) => {
                        const date = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        acc[date] = (acc[date] || 0) + 1;
                        return acc;
                    }, {});

                    // Convert to array and fill missing days
                    const last7Days = [];
                    for (let i = 6; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        last7Days.push({
                            date: dateStr,
                            count: grouped[dateStr] || 0
                        });
                    }

                    setData(last7Days);
                }
            } catch (error) {
                console.error('Failed to fetch scan trend:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const maxCount = Math.max(...data.map(d => d.count), 1);
    const totalScans = data.reduce((sum, d) => sum + d.count, 0);
    const avgScans = totalScans / 7;
    const todayScans = data[data.length - 1]?.count || 0;
    const trend = todayScans > avgScans ? 'up' : 'down';

    if (loading) {
        return (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-black mb-4">7-Day Scan Trend</h3>
                <div className="h-64 flex items-center justify-center">
                    <p className="text-zinc-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black">7-Day Scan Trend</h3>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${trend === 'up' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="text-xs font-bold">{Math.round((todayScans / avgScans) * 100)}%</span>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-48 mb-4">
                {data.map((day, index) => (
                    <motion.div
                        key={day.date}
                        className="flex-1 flex flex-col items-center gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className="relative flex-1 w-full flex items-end">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(day.count / maxCount) * 100}%` }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className={`w-full rounded-t-lg ${day.count > 0 ? 'bg-gradient-to-t from-primary/50 to-primary' : 'bg-white/5'} min-h-[4px]`}
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-black text-white">{day.count}</p>
                            <p className="text-[9px] text-zinc-500 font-bold">{day.date}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Total</p>
                    <p className="text-xl font-black text-white">{totalScans}</p>
                </div>
                <div>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Daily Avg</p>
                    <p className="text-xl font-black text-primary">{avgScans.toFixed(1)}</p>
                </div>
            </div>
        </div>
    );
}
