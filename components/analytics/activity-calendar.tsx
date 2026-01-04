// @ts-nocheck - Supabase types not available until DB migrations run
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
                // Get scans from last 12 weeks (84 days)
                const weeksAgo = new Date();
                weeksAgo.setDate(weeksAgo.getDate() - 84);

                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('created_at')
                    .eq('user_id', user.id)
                    .gte('created_at', weeksAgo.toISOString());

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

    // Generate last 12 weeks (7 days x 12 weeks = 84 days)
    const weeks: Date[][] = [];
    const today = new Date();

    // Start from 12 weeks ago
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 83); // 84 days including today

    // Find the Sunday before start date
    const firstSunday = new Date(startDate);
    firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay());

    // Generate 12 weeks
    for (let week = 0; week < 12; week++) {
        const weekDays: Date[] = [];
        for (let day = 0; day < 7; day++) {
            const date = new Date(firstSunday);
            date.setDate(date.getDate() + (week * 7) + day);
            weekDays.push(date);
        }
        weeks.push(weekDays);
    }

    // Get month labels
    const months: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIndex) => {
        const month = week[0].getMonth();
        if (month !== lastMonth) {
            months.push({
                label: week[0].toLocaleDateString('en-US', { month: 'short' }),
                col: weekIndex
            });
            lastMonth = month;
        }
    });

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

            {/* Month labels */}
            <div className="relative mb-2 h-4">
                <div className="flex gap-1">
                    {months.map((month, index) => (
                        <div
                            key={index}
                            className="text-[10px] text-zinc-500 font-bold absolute"
                            style={{ left: `${month.col * (100 / 12)}%` }}
                        >
                            {month.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Calendar Grid - Weeks as columns, Days as rows */}
            <div className="flex gap-1">
                {/* Day labels */}
                <div className="flex flex-col gap-1 mr-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <div key={day} className="h-3 flex items-center">
                            {index % 2 === 1 && (
                                <span className="text-[9px] text-zinc-600 font-bold">{day}</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Weeks */}
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((day, dayIndex) => {
                            const dateStr = day.toISOString().split('T')[0];
                            const count = data[dateStr] || 0;
                            const isFuture = day > today;

                            return (
                                <motion.div
                                    key={dateStr}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: (weekIndex * 7 + dayIndex) * 0.003 }}
                                    className={`w-3 h-3 rounded-sm ${isFuture ? 'bg-white/5 opacity-30' : getIntensity(count)} hover:ring-2 hover:ring-primary/50 cursor-pointer transition-all`}
                                    title={`${day.toLocaleDateString()}: ${count} scans`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-white/10">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Last 12 Weeks</p>
                        <p className="text-lg font-black text-white">84 days</p>
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
