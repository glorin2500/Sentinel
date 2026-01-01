"use client";

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { TransactionService } from '@/lib/services/transaction-service';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Scan, Upload, CheckCircle, XCircle, AlertTriangle, Loader2, X, Share2, Flag, Camera } from 'lucide-react';
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
    const [showPopup, setShowPopup] = useState(false);
    const [result, setResult] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const analyzeUPI = async (upiToAnalyze: string) => {
        setLoading(true);
        setShowPopup(false);

        try {
            // Check if Supabase is configured
            if (!isSupabaseConfigured() || !user) {
                // Mock response for localhost testing
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Simulate fraud detection
                const mockScore = Math.random() * 100;
                const mockLevel = mockScore < 20 ? 'safe' : mockScore < 50 ? 'caution' : mockScore < 75 ? 'warning' : 'danger';

                setResult({
                    score: Math.round(mockScore),
                    level: mockLevel,
                    recommendation: mockLevel === 'safe'
                        ? 'This transaction appears safe to proceed.'
                        : mockLevel === 'danger'
                            ? 'High risk detected! We recommend not proceeding with this transaction.'
                            : 'Exercise caution with this transaction.',
                    indicators: mockLevel !== 'safe' ? [
                        { type: 'suspicious_pattern', severity: 'high', description: 'UPI ID shows suspicious patterns' }
                    ] : [],
                    upiId: upiToAnalyze,
                    protocol: 'SHA-512',
                    verified: mockLevel === 'safe'
                });
                setShowPopup(true);
                setLoading(false);
                return;
            }

            const { transaction, analysis } = await TransactionService.createTransaction(
                user.id,
                {
                    merchantName: 'UPI Merchant',
                    merchantUPI: upiToAnalyze,
                    amount: amount ? parseFloat(amount) : 0,
                }
            );

            setResult({
                ...analysis,
                upiId: upiToAnalyze,
                protocol: 'SHA-512',
                verified: analysis.level === 'safe'
            });
            setShowPopup(true);
        } catch (error: any) {
            console.error('Scan failed:', error);
            alert('Failed to analyze transaction. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleQRScan = () => {
        // Trigger file upload for QR code
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // For now, simulate QR code extraction
        // In production, you'd use a QR code library like jsQR
        const mockUPI = `merchant-${Math.floor(Math.random() * 1000)}@paytm`;
        setUpiId(mockUPI);

        // Auto-analyze the extracted UPI
        await analyzeUPI(mockUPI);
    };

    const handleCheckUPI = () => {
        if (!upiId) {
            alert('Please enter a UPI ID');
            return;
        }
        analyzeUPI(upiId);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'safe': return {
                text: 'text-green-500',
                bg: 'bg-green-500/10',
                border: 'border-green-500/30',
                icon: CheckCircle,
                label: 'SECURE'
            };
            case 'caution': return {
                text: 'text-yellow-500',
                bg: 'bg-yellow-500/10',
                border: 'border-yellow-500/30',
                icon: AlertTriangle,
                label: 'CAUTION'
            };
            case 'warning': return {
                text: 'text-orange-500',
                bg: 'bg-orange-500/10',
                border: 'border-orange-500/30',
                icon: AlertTriangle,
                label: 'WARNING'
            };
            case 'danger': return {
                text: 'text-red-500',
                bg: 'bg-red-500/10',
                border: 'border-red-500/30',
                icon: XCircle,
                label: 'DANGER'
            };
            default: return {
                text: 'text-zinc-400',
                bg: 'bg-zinc-500/10',
                border: 'border-zinc-500/30',
                icon: AlertTriangle,
                label: 'UNKNOWN'
            };
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
            />

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
                                {loading ? 'Analyzing...' : 'Scanner Ready'}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                                {loading ? 'Running threat analysis' : 'Tap below to scan'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Input Fields - Optional for manual entry */}
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Enter UPI ID (optional)"
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
                        onClick={handleQRScan}
                        disabled={loading}
                        className="py-3 bg-primary text-black font-black rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Scanning
                            </>
                        ) : (
                            <>
                                <Camera size={18} />
                                QR SCAN
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleCheckUPI}
                        disabled={loading || !upiId}
                        className="py-3 bg-zinc-900/50 backdrop-blur-xl border border-white/10 text-zinc-400 font-bold rounded-xl hover:border-white/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Shield size={18} />
                        Check UPI
                    </button>
                </div>

                {/* Upload QR Code Section */}
                <button
                    onClick={handleUploadClick}
                    disabled={loading}
                    className="w-full bg-zinc-900/30 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-2xl p-6 text-center transition-all disabled:opacity-50"
                >
                    <Upload size={32} className="text-zinc-600 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-white mb-1">UPLOAD QR CODE</h3>
                    <p className="text-xs text-zinc-500 mb-3">CLICK OR DRAG & DROP</p>
                    <p className="text-xs text-zinc-600">PNG, JPG, WEBP</p>
                </button>
            </motion.div>

            {/* Threat Analysis Popup */}
            <AnimatePresence>
                {showPopup && result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setShowPopup(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-b from-zinc-900 to-black border border-primary/20 rounded-3xl p-6 w-full max-w-md relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setShowPopup(false)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                                <X size={16} className="text-zinc-400" />
                            </button>

                            {/* Status Icon */}
                            {(() => {
                                const colors = getRiskColor(result.level);
                                const Icon = colors.icon;
                                return (
                                    <div className="flex flex-col items-center mb-6">
                                        <div className={`w-16 h-16 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4`}>
                                            <Icon size={32} className={colors.text} />
                                        </div>
                                        <h2 className={`text-2xl font-black ${colors.text} mb-1`}>{colors.label}</h2>
                                        <p className="text-sm text-zinc-400 uppercase tracking-wider">Transaction Verified</p>
                                    </div>
                                );
                            })()}

                            {/* UPI Details */}
                            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 mb-4">
                                <div className="mb-3">
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">UPI ID</p>
                                    <p className="text-sm font-bold text-white">{result.upiId}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Risk Level</p>
                                        <p className={`text-lg font-black ${getRiskColor(result.level).text}`}>{result.score}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Protocol</p>
                                        <p className="text-lg font-black text-white">{result.protocol}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Security Analysis */}
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle size={16} className="text-primary" />
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider">Security Analysis</p>
                                </div>
                                <p className="text-sm text-zinc-300">
                                    {result.verified ? `Verified bank handle: ${result.upiId.split('@')[1]}` : 'Unverified merchant'}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button className="w-full py-3 bg-primary text-black font-black rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                                    PROCEED TO PAY
                                    <motion.div
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    >
                                        →
                                    </motion.div>
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <button className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                                        <Share2 size={16} />
                                        SHARE
                                    </button>
                                    <button className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                                        ★
                                    </button>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                    <button
                                        onClick={() => setShowPopup(false)}
                                        className="text-sm text-zinc-500 hover:text-white transition-colors"
                                    >
                                        CLOSE
                                    </button>
                                    <button className="text-sm text-red-500 hover:text-red-400 transition-colors flex items-center gap-1">
                                        <Flag size={14} />
                                        REPORT FRAUD
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
