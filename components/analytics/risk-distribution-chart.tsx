// @ts-nocheck - Supabase types not available until DB migrations run
"use client";

import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Transaction {
    id: string;
    risk_level: string;
    risk_score: number;
    created_at: string;
    amount: number | null;
}

export function RiskDistributionChart() {
    const { user } = useAuth();
    const [data, setData] = useState({
        safe: 0,
        caution: 0,
        warning: 0,
        danger: 0,
        loading: true,
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !isSupabaseConfigured()) {
                setData(prev => ({ ...prev, loading: false }));
                return;
            }

            try {
                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('risk_level')
                    .eq('user_id', user.id);

                if (transactions) {
                    const counts = {
                        safe: transactions.filter(t => t.risk_level === 'safe').length,
                        caution: transactions.filter(t => t.risk_level === 'caution').length,
                        warning: transactions.filter(t => t.risk_level === 'warning').length,
                        danger: transactions.filter(t => t.risk_level === 'danger').length,
                        loading: false,
                    };
                    setData(counts);
                }
            } catch (error) {
                console.error('Failed to fetch risk distribution:', error);
                setData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const total = data.safe + data.caution + data.warning + data.danger;
    const getPercentage = (value: number) => total > 0 ? Math.round((value / total) * 100) : 0;

    const riskLevels = [
        { label: 'Safe', value: data.safe, color: 'bg-green-500', textColor: 'text-green-500' },
        { label: 'Caution', value: data.caution, color: 'bg-yellow-500', textColor: 'text-yellow-500' },
        { label: 'Warning', value: data.warning, color: 'bg-orange-500', textColor: 'text-orange-500' },
        { label: 'Danger', value: data.danger, color: 'bg-red-500', textColor: 'text-red-500' },
    ];

    if (data.loading) {
        return (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-black mb-4">Risk Distribution</h3>
                <div className="h-64 flex items-center justify-center">
                    <p className="text-zinc-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (total === 0) {
        return (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-black mb-4">Risk Distribution</h3>
                <div className="h-64 flex items-center justify-center">
                    <p className="text-zinc-500 text-sm">No scans yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-black mb-6">Risk Distribution</h3>

            {/* Bar Chart */}
            <div className="space-y-4 mb-6">
                {riskLevels.map((level, index) => (
                    <motion.div
                        key={level.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-zinc-400">{level.label}</span>
                            <span className={`text-sm font-black ${level.textColor}`}>
                                {level.value} ({getPercentage(level.value)}%)
                            </span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${getPercentage(level.value)}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className={`h-full ${level.color} rounded-full`}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Summary */}
            <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Scans</span>
                    <span className="text-xl font-black text-white">{total}</span>
                </div>
            </div>
        </div>
    );
}
