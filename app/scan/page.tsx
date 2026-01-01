"use client";

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { TransactionService } from '@/lib/services/transaction-service';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Scan, Upload, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function ScanPage() {
    return (
        <ProtectedRoute>
            <ScanPageContent />
        </ProtectedRoute>
    );
}

function ScanPageContent() {
    const { user } = useAuth();
    const [upiId, setUpiId] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [scanComplete, setScanComplete] = useState(false);

    const handleScan = async () => {
        if (!user || !upiId || !amount) return;

        setLoading(true);
        setResult(null);
        setScanComplete(false);

        try {
            // Check if Supabase is configured
            if (!isSupabaseConfigured()) {
                // Mock response for localhost testing
                await new Promise(resolve => setTimeout(resolve, 2000));
                setResult({
                    score: 25,
                    level: 'safe',
                    recommendation: 'This transaction appears safe to proceed.',
                    indicators: []
                });
                setScanComplete(true);
                setLoading(false);
                return;
            }

            const { transaction, analysis } = await TransactionService.createTransaction(
                user.id,
                {
                    merchantName: 'UPI Merchant',
                    merchantUPI: upiId,
                    amount: parseFloat(amount),
                }
            );

            setResult(analysis);
            setScanComplete(true);
        } catch (error: any) {
            console.error('Scan failed:', error);
            setResult({ error: 'Failed to analyze transaction. Please try again.' });
            setScanComplete(true);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'safe': return { text: 'text-green-500', bg: 'bg-green-500/20', border: 'border-green-500/30' };
            case 'caution': return { text: 'text-yellow-500', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' };
            case 'warning': return { text: 'text-orange-500', bg: 'bg-orange-500/20', border: 'border-orange-500/30' };
            case 'danger': return { text: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/30' };
            default: return { text: 'text-zinc-400', bg: 'bg-zinc-500/20', border: 'border-zinc-500/30' };
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg space-y-6"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4">
                        <Shield size={16} className="text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Scanner Ready</span>
                    </div>
                    <h1 className="text-4xl font-black text-white mb-2">Scanner</h1>
                    <p className="text-sm text-zinc-400 uppercase tracking-wider">Threat Analysis Engine</p>
                </div>

                {/* Scanner Frame */}
                <div className="relative">
                    {/* Animated Corners */}
                    <div className="absolute -top-2 -left-2 w-16 h-16 border-l-4 border-t-4 border-primary rounded-tl-2xl" />
                    <div className="absolute -top-2 -right-2 w-16 h-16 border-r-4 border-t-4 border-primary rounded-tr-2xl" />
                    <div className="absolute -bottom-2 -left-2 w-16 h-16 border-l-4 border-b-4 border-primary rounded-bl-2xl" />
                    <div className="absolute -bottom-2 -right-2 w-16 h-16 border-r-4 border-b-4 border-primary rounded-br-2xl" />

                    {/* Scanner Box */}
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                        {/* Scanning Animation */}
                        {loading && (
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent"
                                animate={{
                                    y: ['-100%', '100%'],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />
                        )}

                        {/* Scanner Icon */}
                        <div className="flex items-center justify-center mb-6">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center">
                                    <Scan size={64} className="text-primary" />
                                </div>
                                {loading && (
                                    <motion.div
                                        className="absolute inset-0 rounded-2xl border-2 border-primary"
                                        animate={{
                                            opacity: [0.5, 1, 0.5],
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Status Text */}
                        <div className="text-center mb-6">
                            <p className="text-sm font-bold text-white uppercase tracking-wider">
                                {loading ? 'Analyzing...' : scanComplete ? 'Scan Complete' : 'Scanner Ready'}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                                {loading ? 'Running threat analysis' : 'Tap below to scan'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Enter UPI ID"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none disabled:opacity-50"
                    />
                    <input
                        type="number"
                        placeholder="Amount (optional)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none disabled:opacity-50"
                    />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleScan}
                        disabled={loading || !upiId}
                        className="py-3 bg-primary text-black font-black rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Scanning
                            </>
                        ) : (
                            <>
                                <Scan size={18} />
                                QR SCAN
                            </>
                        )}
                    </button>
                    <button
                        disabled={loading}
                        className="py-3 bg-zinc-900/50 backdrop-blur-xl border border-white/10 text-zinc-400 font-bold rounded-xl hover:border-white/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Upload size={18} />
                        Check UPI
                    </button>
                </div>

                {/* Upload QR Code Section */}
                <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 text-center">
                    <Upload size={32} className="text-zinc-600 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-white mb-1">UPLOAD QR CODE</h3>
                    <p className="text-xs text-zinc-500 mb-3">CLICK OR DRAG & DROP</p>
                    <p className="text-xs text-zinc-600">PNG, JPG, WEBP</p>
                </div>

                {/* Results */}
                <AnimatePresence>
                    {scanComplete && result && !result.error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                        >
                            {(() => {
                                const colors = getRiskColor(result.level);
                                const Icon = getRiskIcon(result.level);
                                return (
                                    <>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                                                <Icon size={24} className={colors.text} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-black text-white">Analysis Complete</h3>
                                                <p className={`text-sm font-bold uppercase ${colors.text}`}>{result.level} Risk</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-black text-white">{result.score}</div>
                                                <div className="text-xs text-zinc-500">/100</div>
                                            </div>
                                        </div>
                                        <div className={`p-4 ${colors.bg} border ${colors.border} rounded-xl`}>
                                            <p className="text-sm text-white">{result.recommendation}</p>
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    )}

                    {scanComplete && result && result.error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                        >
                            <p className="text-red-500 text-sm">{result.error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
