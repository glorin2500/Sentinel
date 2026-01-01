"use client";

import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { motion } from 'framer-motion';
import { User, Mail, Shield, LogOut, Trash2, Key, Activity, Award, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TransactionService } from '@/lib/services/transaction-service';

export default function AccountPage() {
    return (
        <ProtectedRoute>
            <AccountPageContent />
        </ProtectedRoute>
    );
}

function AccountPageContent() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({
        total: 0,
        safe: 0,
        caution: 0,
        warning: 0,
        danger: 0,
        totalAmount: 0,
        avgAmount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            TransactionService.getTransactionStats(user.id)
                .then(setStats)
                .finally(() => setLoading(false));
        }
    }, [user]);

    const handleLogout = async () => {
        if (confirm('Are you sure you want to log out?')) {
            await signOut();
            router.push('/auth');
        }
    };

    const safetyScore = stats.total === 0 ? 100 : Math.round(
        (stats.safe * 100 + stats.caution * 75 + stats.warning * 50 + stats.danger * 0) / stats.total
    );

    return (
        <div className="max-w-4xl mx-auto py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-white mb-2">Account Settings</h1>
                    <p className="text-zinc-400">Manage your Sentinel account and security</p>
                </div>

                {/* Profile Card */}
                <div className="bg-zinc-900 rounded-2xl border border-white/10 p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                            <User size={32} className="text-primary" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-black text-white mb-1">
                                {user?.email?.split('@')[0] || 'Guardian'}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <Mail size={14} />
                                {user?.email}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-black/30 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity size={16} className="text-primary" />
                                <span className="text-xs text-zinc-500 uppercase tracking-wider">Total Scans</span>
                            </div>
                            <div className="text-2xl font-black text-white">{stats.total}</div>
                        </div>

                        <div className="p-4 rounded-lg bg-black/30 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield size={16} className="text-green-500" />
                                <span className="text-xs text-zinc-500 uppercase tracking-wider">Safe</span>
                            </div>
                            <div className="text-2xl font-black text-green-500">{stats.safe}</div>
                        </div>

                        <div className="p-4 rounded-lg bg-black/30 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp size={16} className="text-primary" />
                                <span className="text-xs text-zinc-500 uppercase tracking-wider">Safety Score</span>
                            </div>
                            <div className="text-2xl font-black text-white">{safetyScore}</div>
                        </div>

                        <div className="p-4 rounded-lg bg-black/30 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <Award size={16} className="text-yellow-500" />
                                <span className="text-xs text-zinc-500 uppercase tracking-wider">Rank</span>
                            </div>
                            <div className="text-2xl font-black text-yellow-500">
                                {stats.total >= 50 ? 'Expert' : stats.total >= 20 ? 'Pro' : stats.total >= 5 ? 'Active' : 'Newbie'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-zinc-900 rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                        <Shield size={20} className="text-primary" />
                        Security
                    </h3>

                    <div className="space-y-3">
                        <div className="p-4 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between">
                            <div>
                                <div className="font-bold text-white mb-1">Email</div>
                                <div className="text-sm text-zinc-400">{user?.email}</div>
                            </div>
                            <div className="px-3 py-1 rounded-lg bg-green-500/10 text-green-500 text-xs font-bold">
                                Verified
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between">
                            <div>
                                <div className="font-bold text-white mb-1">Password</div>
                                <div className="text-sm text-zinc-400">••••••••</div>
                            </div>
                            <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all border border-white/10">
                                Change
                            </button>
                        </div>

                        <div className="p-4 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between">
                            <div>
                                <div className="font-bold text-white mb-1">Two-Factor Authentication</div>
                                <div className="text-sm text-zinc-400">Add an extra layer of security</div>
                            </div>
                            <button className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold transition-all border border-primary/20">
                                Enable
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-zinc-900 rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-black text-white mb-4">Actions</h3>

                    <div className="space-y-3">
                        <button
                            onClick={handleLogout}
                            className="w-full p-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center gap-3 text-red-500 font-bold transition-all group"
                        >
                            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                            Sign Out
                        </button>

                        <button className="w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-3 text-zinc-400 hover:text-red-500 font-bold transition-all group">
                            <Trash2 size={20} />
                            Delete Account
                        </button>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="text-center text-sm text-zinc-500">
                    <p>Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
            </motion.div>
        </div>
    );
}
