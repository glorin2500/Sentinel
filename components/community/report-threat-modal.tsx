"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, AlertTriangle, Upload, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';

interface ReportThreatModalProps {
    isOpen: boolean;
    onClose: () => void;
    upiId?: string;
    riskLevel?: string;
    riskScore?: number;
}

export function ReportThreatModal({ isOpen, onClose, upiId = '', riskLevel = '', riskScore = 0 }: ReportThreatModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [merchantName, setMerchantName] = useState('');
    const [threatType, setThreatType] = useState<'merchant' | 'individual' | 'atm' | 'shop' | 'other'>('merchant');
    const [fraudCategory, setFraudCategory] = useState<'fake_qr' | 'overcharge' | 'scam' | 'phishing' | 'counterfeit' | 'other'>('fake_qr');
    const [description, setDescription] = useState('');
    const [amountLost, setAmountLost] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);

    const getLocation = () => {
        setLocationLoading(true);
        setError('');

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLocationLoading(false);
            },
            (error) => {
                setError('Failed to get location. Please enable location services.');
                setLocationLoading(false);
                console.error('Geolocation error:', error);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setError('You must be logged in to report threats');
            return;
        }

        if (!location) {
            setError('Please capture your location first');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Insert report
            const { data: report, error: reportError } = await supabase
                .from('community_reports')
                .insert({
                    reporter_id: isAnonymous ? null : user.id,
                    upi_id: upiId,
                    merchant_name: merchantName,
                    latitude: location.lat,
                    longitude: location.lng,
                    threat_type: threatType,
                    fraud_category: fraudCategory,
                    description: description,
                    amount_lost: amountLost ? parseFloat(amountLost) : null,
                    is_anonymous: isAnonymous,
                })
                .select()
                .single();

            if (reportError) throw reportError;

            // Update user trust score
            if (!isAnonymous) {
                const { error: trustError } = await supabase
                    .from('user_trust_scores')
                    .upsert({
                        user_id: user.id,
                        total_reports: 1,
                        accurate_reports: 0, // Will be updated when verified
                    }, {
                        onConflict: 'user_id',
                        ignoreDuplicates: false
                    });

                if (trustError) console.error('Trust score error:', trustError);
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                resetForm();
            }, 2000);
        } catch (err: any) {
            console.error('Report submission error:', err);
            setError(err.message || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setMerchantName('');
        setThreatType('merchant');
        setFraudCategory('fake_qr');
        setDescription('');
        setAmountLost('');
        setIsAnonymous(false);
        setLocation(null);
        setSuccess(false);
        setError('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-zinc-900 border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-zinc-900 border-b border-white/10 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                <AlertTriangle size={20} className="text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white">Report Threat</h2>
                                <p className="text-xs text-zinc-500">Help protect the community</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            <X size={16} className="text-zinc-400" />
                        </button>
                    </div>

                    {/* Success State */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6"
                        >
                            <div className="text-center py-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                    className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
                                >
                                    <CheckCircle size={32} className="text-green-500" />
                                </motion.div>
                                <h3 className="text-xl font-black text-white mb-2">Report Submitted!</h3>
                                <p className="text-sm text-zinc-400">Thank you for helping keep the community safe</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Form */}
                    {!success && (
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* UPI ID (pre-filled) */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    UPI ID
                                </label>
                                <input
                                    type="text"
                                    value={upiId}
                                    disabled
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm disabled:opacity-50"
                                />
                            </div>

                            {/* Merchant Name */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Merchant/Person Name *
                                </label>
                                <input
                                    type="text"
                                    value={merchantName}
                                    onChange={(e) => setMerchantName(e.target.value)}
                                    required
                                    placeholder="e.g., ABC Shop, John Doe"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Location *
                                </label>
                                <button
                                    type="button"
                                    onClick={getLocation}
                                    disabled={locationLoading || !!location}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {locationLoading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Getting location...
                                        </>
                                    ) : location ? (
                                        <>
                                            <CheckCircle size={16} className="text-green-500" />
                                            Location captured
                                        </>
                                    ) : (
                                        <>
                                            <MapPin size={16} />
                                            Capture Current Location
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Threat Type */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Threat Type *
                                </label>
                                <select
                                    value={threatType}
                                    onChange={(e) => setThreatType(e.target.value as any)}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary focus:outline-none transition-colors"
                                >
                                    <option value="merchant">Merchant/Shop</option>
                                    <option value="individual">Individual Person</option>
                                    <option value="atm">ATM/Kiosk</option>
                                    <option value="shop">Physical Shop</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Fraud Category */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Fraud Category *
                                </label>
                                <select
                                    value={fraudCategory}
                                    onChange={(e) => setFraudCategory(e.target.value as any)}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary focus:outline-none transition-colors"
                                >
                                    <option value="fake_qr">Fake QR Code</option>
                                    <option value="overcharge">Overcharging</option>
                                    <option value="scam">Scam/Fraud</option>
                                    <option value="phishing">Phishing</option>
                                    <option value="counterfeit">Counterfeit Goods</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe what happened..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none transition-colors resize-none"
                                />
                            </div>

                            {/* Amount Lost */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                    Amount Lost (₹)
                                </label>
                                <input
                                    type="number"
                                    value={amountLost}
                                    onChange={(e) => setAmountLost(e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Anonymous Toggle */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                <div>
                                    <p className="text-sm font-bold text-white">Report Anonymously</p>
                                    <p className="text-xs text-zinc-500">Your identity will be hidden</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAnonymous(!isAnonymous)}
                                    className={`w-12 h-6 rounded-full transition-colors ${isAnonymous ? 'bg-primary' : 'bg-white/20'}`}
                                >
                                    <motion.div
                                        animate={{ x: isAnonymous ? 24 : 0 }}
                                        className="w-6 h-6 rounded-full bg-white shadow-lg"
                                    />
                                </button>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-xs text-red-500">{error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !location}
                                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle size={16} />
                                        Submit Report
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
