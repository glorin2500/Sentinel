"use client";

import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function ActivityCalendar() {
    const { user } = useAuth();
    const [data, setData] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !isSupabaseConfigured()) {
                setLoading(false);
                return;
            }

            try {
                // Get scans from last 90 days
                const ninetyDaysAgo = new Date();
                ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('created_at')
                    .eq('user_id', user.id)
                    .gte('created_at', ninetyDaysAgo.toISOString());

                if (transactions) {
                    // Group by date
                    const grouped = transactions.reduce((acc: any, t) => {
                        const date = new Date(t.created_at).toISOString().split('T')[0];
                        acc[date] = (acc[date] || 0) + 1;
                        return acc;
                    }, {});

                    setData(grouped);
                }
            } catch (error) {
                console.error('Failed to fetch activity calendar:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Generate last 90 days
    const days = [];
    for (let i = 89; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d);
    }

    const maxCount = Math.max(...Object.values(data), 1);

    const getIntensity = (count: number) => {
        if (count === 0) return 'bg-white/5';
        const intensity = count / maxCount;
        if (intensity < 0.25) return 'bg-primary/20';
        if (intensity < 0.5) return 'bg-primary/40';
        if (intensity < 0.75) return 'bg-primary/60';
        return 'bg-primary';
    };

    if (loading) {
        return (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-black mb-4">Activity Calendar</h3>
                <div className="h-48 flex items-center justify-center">
                    <p className="text-zinc-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black">Activity Calendar</h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-bold">Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-white/5" />
                        <div className="w-3 h-3 rounded-sm bg-primary/20" />
                        <div className="w-3 h-3 rounded-sm bg-primary/40" />
                        <div className="w-3 h-3 rounded-sm bg-primary/60" />
                        <div className="w-3 h-3 rounded-sm bg-primary" />
                    </div>
                    <span className="text-xs text-zinc-500 font-bold">More</span>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-13 gap-1">
                {days.map((day, index) => {
                    const dateStr = day.toISOString().split('T')[0];
                    const count = data[dateStr] || 0;

                    return (
                        <motion.div
                            key={dateStr}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.005 }}
                            className={`w-3 h-3 rounded-sm ${getIntensity(count)} hover:ring-2 hover:ring-primary/50 cursor-pointer transition-all`}
                            title={`${day.toLocaleDateString()}: ${count} scans`}
                        />
                    );
                })}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-white/10">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Total Days</p>
                        <p className="text-lg font-black text-white">90</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Active Days</p>
                        <p className="text-lg font-black text-primary">{Object.keys(data).length}</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Total Scans</p>
                        <p className="text-lg font-black text-white">{Object.values(data).reduce((a, b) => a + b, 0)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
