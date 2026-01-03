"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { Clock, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface Transaction {
    id: string;
    upi_id: string;
    risk_level: string;
    risk_score: number;
    created_at: string;
    amount: number | null;
}

export function RecentActivity() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentActivity = async () => {
            if (!user || !isSupabaseConfigured()) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (!error && data) {
                    setTransactions(data);
                }
            } catch (error) {
                console.error('Failed to fetch recent activity:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentActivity();

        // Refresh every 30 seconds
        const interval = setInterval(fetchRecentActivity, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const getRiskIcon = (level: string) => {
        switch (level) {
            case 'safe':
                return <CheckCircle size={16} className="text-green-500" />;
            case 'caution':
                return <Shield size={16} className="text-yellow-500" />;
            case 'warning':
                return <AlertTriangle size={16} className="text-orange-500" />;
            case 'danger':
                return <XCircle size={16} className="text-red-500" />;
            default:
                return <Shield size={16} className="text-zinc-500" />;
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'safe':
                return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'caution':
                return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'warning':
                return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'danger':
                return 'text-red-500 bg-red-500/10 border-red-500/20';
            default:
                return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    if (loading) {
        return (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-black mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
            >
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-primary" />
                    Recent Activity
                </h3>
                <div className="text-center py-8">
                    <Shield size={48} className="mx-auto text-zinc-600 mb-3" />
                    <p className="text-sm text-zinc-400">No scans yet</p>
                    <p className="text-xs text-zinc-600 mt-1">Start scanning to see your activity</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <Clock size={20} className="text-primary" />
                Recent Activity
            </h3>
            <div className="space-y-3">
                {transactions.map((transaction, index) => (
                    <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getRiskColor(transaction.risk_level)}`}>
                                    {getRiskIcon(transaction.risk_level)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">
                                        {transaction.upi_id}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs font-bold capitalize ${getRiskColor(transaction.risk_level).split(' ')[0]}`}>
                                            {transaction.risk_level}
                                        </span>
                                        <span className="text-xs text-zinc-600">•</span>
                                        <span className="text-xs text-zinc-500">
                                            {transaction.risk_score}% risk
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-xs text-zinc-500">
                                    {formatTime(transaction.created_at)}
                                </p>
                                {transaction.amount && (
                                    <p className="text-xs font-bold text-primary mt-1">
                                        ₹{transaction.amount.toFixed(2)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
