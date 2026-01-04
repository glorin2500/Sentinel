"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { TransactionService } from '@/lib/services/transaction-service';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { motion } from 'framer-motion';
import { Receipt, TrendingUp, AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
    return (
        <ProtectedRoute>
            <HistoryPageContent />
        </ProtectedRoute>
    );
}

function HistoryPageContent() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'safe' | 'caution' | 'warning' | 'danger'>('all');

    useEffect(() => {
        if (!user) return;

        setLoading(true);
        setError(null);

        TransactionService.getUserTransactions(user.id, 50)
            .then(setTransactions)
            .catch((err) => {
                console.error('Failed to load transactions:', err);
                setError('Failed to load transaction history. Please try again.');
                setTransactions([]);
            })
            .finally(() => setLoading(false));
    }, [user]);

    const filteredTransactions = filter === 'all'
        ? transactions
        : transactions.filter(t => t.risk_level === filter);

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'safe': return 'bg-green-500/20 text-green-500 border-green-500/30';
            case 'caution': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
            case 'warning': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
            case 'danger': return 'bg-red-500/20 text-red-500 border-red-500/30';
            default: return 'bg-zinc-500/20 text-zinc-500 border-zinc-500/30';
        }
    };

    const getRiskIcon = (level: string) => {
        switch (level) {
            case 'safe': return CheckCircle;
            case 'danger': return AlertTriangle;
            default: return TrendingUp;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400">Loading transactions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2">Transaction History</h1>
                        <p className="text-zinc-400">{transactions.length} total scans</p>
                    </div>
                    <Link href="/scan">
                        <button className="px-6 py-3 bg-primary text-black font-black rounded-lg hover:opacity-90 transition-all">
                            New Scan
                        </button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['all', 'safe', 'caution', 'warning', 'danger'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${filter === f
                                ? 'bg-primary text-black'
                                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-white/10'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            {f !== 'all' && ` (${transactions.filter(t => t.risk_level === f).length})`}
                        </button>
                    ))}
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <AlertTriangle size={20} className="text-red-500" />
                            <div>
                                <p className="text-sm font-bold text-red-500">Error Loading History</p>
                                <p className="text-xs text-red-400 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {filteredTransactions.length === 0 && (
                    <div className="text-center py-16">
                        <Receipt size={64} className="text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            {filter === 'all' ? 'No transactions yet' : `No ${filter} transactions`}
                        </h3>
                        <p className="text-zinc-400 mb-6">
                            {filter === 'all'
                                ? 'Start scanning transactions to see your history'
                                : 'Try a different filter or scan more transactions'}
                        </p>
                        {filter === 'all' && (
                            <Link href="/scan">
                                <button className="px-6 py-3 bg-primary text-black font-black rounded-lg hover:opacity-90">
                                    Scan Your First Transaction
                                </button>
                            </Link>
                        )}
                    </div>
                )}

                {/* Transaction List */}
                <div className="space-y-3">
                    {filteredTransactions.map((tx, index) => {
                        const Icon = getRiskIcon(tx.risk_level);
                        return (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-zinc-900 p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-lg ${getRiskColor(tx.risk_level)} border flex items-center justify-center flex-shrink-0`}>
                                        <Icon size={20} />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-white truncate">{tx.merchant_name}</h3>
                                                {tx.merchant_upi && (
                                                    <p className="text-sm text-zinc-400 truncate">{tx.merchant_upi}</p>
                                                )}
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-lg font-black text-white">₹{tx.amount?.toFixed(2) || '0.00'}</div>
                                                <div className="text-xs text-zinc-500">
                                                    {new Date(tx.timestamp).toLocaleDateString('en-IN', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Risk Info */}
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getRiskColor(tx.risk_level)} border`}>
                                                {tx.risk_level}
                                            </span>
                                            {tx.risk_score !== null && (
                                                <span className="text-xs text-zinc-400">
                                                    Risk Score: <span className="font-bold text-white">{tx.risk_score}/100</span>
                                                </span>
                                            )}
                                            {tx.status && (
                                                <span className="text-xs text-zinc-500">
                                                    Status: <span className="text-zinc-400">{tx.status}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
