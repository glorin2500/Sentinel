// @ts-nocheck - Supabase types not available until DB migrations run
"use client";

import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export function HourlyActivityChart() {
    const { user } = useAuth();
    const [data, setData] = useState<number[]>(new Array(24).fill(0));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !isSupabaseConfigured()) {
                setLoading(false);
                return;
            }

            try {
                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('created_at')
                    .eq('user_id', user.id);

                if (transactions) {
                    const hourCounts = new Array(24).fill(0);
                    transactions.forEach(t => {
                        const hour = new Date(t.created_at).getHours();
                        hourCounts[hour]++;
                    });
                    setData(hourCounts);
                }
            } catch (error) {
                console.error('Failed to fetch hourly activity:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const maxCount = Math.max(...data, 1);
    const peakHour = data.indexOf(Math.max(...data));

    if (loading) {
        return (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-black mb-4">Hourly Activity</h3>
                <div className="h-48 flex items-center justify-center">
                    <p className="text-zinc-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-black">Hourly Activity</h3>
                    <p className="text-xs text-zinc-500 font-bold mt-1">
                        Peak: {peakHour}:00 - {peakHour + 1}:00
                    </p>
                </div>
                <Clock size={20} className="text-primary" />
            </div>

            {/* Bar Chart */}
            <div className="flex items-end justify-between gap-1 h-32 mb-4">
                {data.map((count, hour) => (
                    <motion.div
                        key={hour}
                        className="flex-1 flex flex-col items-center gap-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: hour * 0.02 }}
                    >
                        <div className="relative flex-1 w-full flex items-end">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(count / maxCount) * 100}%` }}
                                transition={{ duration: 0.5, delay: hour * 0.02 }}
                                className={`w-full rounded-t ${count > 0 ? 'bg-gradient-to-t from-primary/50 to-primary' : 'bg-white/5'} min-h-[2px]`}
                                title={`${hour}:00 - ${count} scans`}
                            />
                        </div>
                        {hour % 3 === 0 && (
                            <p className="text-[8px] text-zinc-600 font-bold">{hour}</p>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Summary */}
            <div className="pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Most Active</p>
                        <p className="text-sm font-black text-primary">{peakHour}:00 - {peakHour + 1}:00</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Peak Scans</p>
                        <p className="text-sm font-black text-white">{Math.max(...data)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
