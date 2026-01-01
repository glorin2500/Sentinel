"use client";

import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { User, Mail, Shield, LogOut, Trash2, Key, Bell, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
    const [stats, setStats] = useState({ total: 0, safe: 0, danger: 0 });
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

    const handleDeleteAccount = () => {
        alert('Account deletion will be available soon. Please contact support for now.');
    };

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
                    <p className="text-zinc-400">Manage your profile and preferences</p>
                </div>

                {/* Profile Card */}
                <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                            <User size={32} className="text-primary" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-black text-white mb-1">
                                {user?.user_metadata?.full_name || 'Sentinel User'}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                                <Mail size={14} />
                                <span>{user?.email}</span>
                            </div>
                            <div className="flex gap-4">
                                <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <div className="text-lg font-black text-green-500">{stats.safe}</div>
                                    <div className="text-xs text-zinc-400">Safe Scans</div>
                                </div>
                                <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <div className="text-lg font-black text-red-500">{stats.danger}</div>
                                    <div className="text-xs text-zinc-400">Threats Blocked</div>
                                </div>
                                <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                                    <div className="text-lg font-black text-primary">{stats.total}</div>
                                    <div className="text-xs text-zinc-400">Total Scans</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                        <Shield size={20} className="text-primary" />
                        Security
                    </h3>
                    <div className="space-y-3">
                        <button className="w-full p-4 bg-black/30 hover:bg-black/50 border border-white/5 hover:border-white/10 rounded-xl transition-all text-left flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <Key size={18} className="text-zinc-400" />
                                <div>
                                    <div className="font-bold text-white">Change Password</div>
                                    <div className="text-xs text-zinc-500">Update your password</div>
                                </div>
                            </div>
                            <div className="text-zinc-600 group-hover:text-primary transition-colors">→</div>
                        </button>

                        <button className="w-full p-4 bg-black/30 hover:bg-black/50 border border-white/5 hover:border-white/10 rounded-xl transition-all text-left flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <Shield size={18} className="text-zinc-400" />
                                <div>
                                    <div className="font-bold text-white">Two-Factor Authentication</div>
                                    <div className="text-xs text-zinc-500">Add an extra layer of security</div>
                                </div>
                            </div>
                            <div className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded">Coming Soon</div>
                        </button>
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                        <Globe size={20} className="text-primary" />
                        Preferences
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-black/30 border border-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Bell size={18} className="text-zinc-400" />
                                <div>
                                    <div className="font-bold text-white">Notifications</div>
                                    <div className="text-xs text-zinc-500">Get alerts for high-risk transactions</div>
                                </div>
                            </div>
                            <label className="relative inline-block w-12 h-6">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-full h-full bg-zinc-700 peer-checked:bg-primary rounded-full transition-colors cursor-pointer"></div>
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-zinc-900 p-6 rounded-2xl border border-red-500/20">
                    <h3 className="text-lg font-black text-red-500 mb-4">Danger Zone</h3>
                    <div className="space-y-3">
                        <button
                            onClick={handleLogout}
                            className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all text-left flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <LogOut size={18} className="text-red-500" />
                                <div>
                                    <div className="font-bold text-red-500">Log Out</div>
                                    <div className="text-xs text-zinc-500">Sign out of your account</div>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={handleDeleteAccount}
                            className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all text-left flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <Trash2 size={18} className="text-red-500" />
                                <div>
                                    <div className="font-bold text-red-500">Delete Account</div>
                                    <div className="text-xs text-zinc-500">Permanently delete your account and data</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
