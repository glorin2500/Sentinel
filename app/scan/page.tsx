"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { TransactionService } from '@/lib/services/transaction-service';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Scan } from 'lucide-react';

export default function ScanPage() {
    return (
        <ProtectedRoute>
            <ScanPageContent />
        </ProtectedRoute>
    );
}

function ScanPageContent() {
    const { user } = useAuth();
    const [merchantName, setMerchantName] = useState('');
    const [merchantUPI, setMerchantUPI] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [hasScanned, setHasScanned] = useState(false); // Track if scan was performed

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setResult(null);
        setHasScanned(false);

        try {
            const { transaction, analysis } = await TransactionService.createTransaction(
                user.id,
                {
                    merchantName,
                    merchantUPI: merchantUPI || undefined,
                    amount: parseFloat(amount),
                }
            );

            setResult(analysis);
            setHasScanned(true); // Only show results after scan completes
        } catch (error) {
            console.error('Scan failed:', error);
            setResult({ error: 'Failed to analyze transaction' });
            setHasScanned(true);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'safe': return 'text-green-500';
            case 'caution': return 'text-yellow-500';
            case 'warning': return 'text-orange-500';
            case 'danger': return 'text-red-500';
            default: return 'text-zinc-400';
        }
    };

    const getRiskIcon = (level: string) => {
        switch (level) {
            case 'safe': return CheckCircle;
            case 'danger': return XCircle;
            default: return AlertTriangle;
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4 relative">
                        <Shield size={32} className="text-primary" />
                        <motion.div
                            className="absolute inset-0 rounded-full bg-primary/20"
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Scan Transaction</h1>
                    <p className="text-zinc-400">Analyze fraud risk in real-time</p>
                </div>

                {/* Scan Form */}
                <form onSubmit={handleScan} className="bg-zinc-900 p-6 rounded-2xl border border-white/10 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                            Merchant Name *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Coffee Shop"
                            value={merchantName}
                            onChange={(e) => setMerchantName(e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                            UPI ID (Optional)
                        </label>
                        <input
                            type="text"
                            placeholder="merchant@upi"
                            value={merchantUPI}
                            onChange={(e) => setMerchantUPI(e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                            Amount (₹) *
                        </label>
                        <input
                            type="number"
                            placeholder="100.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none"
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-black font-black rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Scan size={18} className="group-hover:scale-110 transition-transform" />
                                Scan Transaction
                            </>
                        )}
                    </button>
                </form>

                {/* Results - Only show after scan completes */}
                <AnimatePresence>
                    {hasScanned && result && !result.error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-900 p-6 rounded-2xl border border-white/10"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                {(() => {
                                    const Icon = getRiskIcon(result.level);
                                    return <Icon size={32} className={getRiskColor(result.level)} />;
                                })()}
                                <div className="flex-1">
                                    <h2 className="text-xl font-black text-white mb-1">Risk Analysis Complete</h2>
                                    <p className={`text-sm font-bold uppercase ${getRiskColor(result.level)}`}>
                                        {result.level} Risk
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-white">{result.score}</div>
                                    <div className="text-xs text-zinc-400">/ 100</div>
                                </div>
                            </div>

                            <div className="p-4 bg-black/50 rounded-lg mb-4">
                                <p className="text-white">{result.recommendation}</p>
                            </div>

                            {result.indicators && result.indicators.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                        Fraud Indicators ({result.indicators.length})
                                    </h3>
                                    {result.indicators.map((indicator: any, i: number) => (
                                        <div key={i} className="p-3 bg-black/30 rounded-lg border border-white/5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold uppercase ${indicator.severity === 'critical' ? 'text-red-500' :
                                                        indicator.severity === 'high' ? 'text-orange-500' :
                                                            indicator.severity === 'medium' ? 'text-yellow-500' :
                                                                'text-zinc-400'
                                                    }`}>
                                                    {indicator.severity}
                                                </span>
                                                <span className="text-xs text-zinc-600">•</span>
                                                <span className="text-xs text-zinc-400">{indicator.type.replace(/_/g, ' ')}</span>
                                            </div>
                                            <p className="text-sm text-zinc-300">{indicator.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {hasScanned && result && result.error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                        >
                            <p className="text-red-500">{result.error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
