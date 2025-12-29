"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { useSentinelStore } from "@/lib/store";
import { motion } from "framer-motion";
import { User, Shield, CreditCard, ExternalLink, Settings, Zap, Award, Target, Unlock, Plus, Trash2, Check, X as CloseIcon } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
    const { scans, safetyScore, userProfile, updateProfile } = useSentinelStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: userProfile.name, rank: userProfile.rank });

    const handleSaveProfile = () => {
        updateProfile({ name: editForm.name, rank: editForm.rank });
        setIsEditing(false);
    };

    const addFinancialNode = () => {
        const newNode = {
            id: Math.random().toString(36).substr(2, 9),
            bank: "NEW NODE",
            alias: "UNASSIGNED",
            status: "STANDBY"
        };
        updateProfile({ financialNodes: [...userProfile.financialNodes, newNode] });
    };

    const removeFinancialNode = (id: string) => {
        updateProfile({ financialNodes: userProfile.financialNodes.filter(n => n.id !== id) });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto space-y-12 pt-12 pb-32 px-4"
        >
            {/* Identity Card */}
            <div className="relative group overflow-hidden rounded-[40px]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5 opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full animate-pulse" />

                <div className="relative z-10 p-10 flex flex-col md:flex-row items-center gap-10 bg-black/40 border border-white/10 backdrop-blur-xl rounded-inherit">
                    <div className="relative">
                        <div className="h-32 w-32 rounded-[40px] bg-gradient-to-tr from-primary/30 to-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-[0_0_50px_rgba(124,255,178,0.2)] rotate-6 group-hover:rotate-0 transition-transform duration-500">
                            <User size={64} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-black border-2 border-primary flex items-center justify-center text-primary shadow-xl">
                            <Award size={20} />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        {isEditing ? (
                            <div className="space-y-3">
                                <input
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="text-4xl font-black bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white w-full outline-none focus:border-primary/50 transition-all uppercase"
                                    placeholder="Operator Name"
                                />
                                <input
                                    value={editForm.rank}
                                    onChange={e => setEditForm({ ...editForm, rank: e.target.value })}
                                    className="text-xs font-black bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-primary w-full outline-none focus:border-primary/50 transition-all uppercase tracking-[0.4em]"
                                    placeholder="Designation"
                                />
                            </div>
                        ) : (
                            <div>
                                <h1 className="text-5xl font-black text-white tracking-tighter uppercase">{userProfile.name}</h1>
                                <p className="text-xs font-black text-primary uppercase tracking-[0.4em] mt-1">{userProfile.rank}</p>
                            </div>
                        )}
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                                <Target size={14} className="text-zinc-500" />
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Global Rank #1,402</span>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                                <Unlock size={14} className="text-zinc-500" />
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{userProfile.biometricLock ? "Biometric Encrypted" : "Standard Security"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSaveProfile}
                                    className="px-8 py-4 rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <Check size={14} /> Save Node
                                </button>
                                <button
                                    onClick={() => {
                                        setEditForm({ name: userProfile.name, rank: userProfile.rank });
                                        setIsEditing(false);
                                    }}
                                    className="px-8 py-4 rounded-2xl bg-white/5 text-zinc-400 font-black uppercase text-[10px] tracking-widest border border-white/5 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <CloseIcon size={14} /> Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-8 py-4 rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                                >
                                    Edit Profile
                                </button>
                                <button className="px-8 py-4 rounded-2xl bg-white/5 text-zinc-400 font-black uppercase text-[10px] tracking-widest border border-white/5 hover:text-white transition-all">Export Logs</button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Performance Matrix */}
            <div className="grid sm:grid-cols-3 gap-6">
                {[
                    { label: "Stability Index", value: `${safetyScore}%`, color: "text-primary", sub: "Network Trust" },
                    { label: "Operation Count", value: scans.length, color: "text-white", sub: "Total Scanned Nodes" },
                    { label: "Threats Blocked", value: scans.filter((s: any) => s.status === 'risky').length, color: "text-destructive", sub: "Neutralized Anomlies" },
                ].map((stat, i) => (
                    <GlassCard key={i} className="p-8 items-center text-center gap-3 border-white/5 hover:border-white/10 transition-all">
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">{stat.label}</p>
                        <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{stat.sub}</p>
                    </GlassCard>
                ))}
            </div>

            {/* Protocols & Toggles */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <Shield size={18} className="text-zinc-500" />
                        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">Neural Protocols</h3>
                    </div>
                    {[
                        { key: 'biometricLock', label: 'Biometric Intercept', desc: 'Hardware-level authentication for all scans' },
                        { key: 'notificationsEnabled', label: 'Deep Scanning', desc: 'Extended packet analysis on complex QR nodes' },
                        { key: 'neuralPatching', label: 'Neural Patching', desc: 'Automatic threat signature updates via satellite' }
                    ].map((protocol) => (
                        <button
                            key={protocol.key}
                            onClick={() => updateProfile({ [protocol.key]: !userProfile[protocol.key as keyof typeof userProfile] })}
                            className="w-full p-6 rounded-[32px] bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-all text-left group"
                        >
                            <div className="space-y-1">
                                <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{protocol.label}</p>
                                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{protocol.desc}</p>
                            </div>
                            <div className={`h-6 w-12 rounded-full border-2 transition-all relative ${userProfile[protocol.key as keyof typeof userProfile] ? 'bg-primary border-primary' : 'bg-transparent border-zinc-800'}`}>
                                <div className={`absolute top-1 bottom-1 w-4 rounded-full transition-all ${userProfile[protocol.key as keyof typeof userProfile] ? 'right-1 bg-background' : 'left-1 bg-zinc-800'}`} />
                            </div>
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-3">
                            <CreditCard size={18} className="text-zinc-500" />
                            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">Financial Nodes</h3>
                        </div>
                        <button
                            onClick={addFinancialNode}
                            className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {userProfile.financialNodes.map((account: any) => (
                            <GlassCard key={account.id} className="group flex-row items-center border-white/5 hover:border-primary/20 transition-all p-8 !bg-white/[0.01]">
                                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500">
                                    <Zap size={24} />
                                </div>
                                <div className="ml-6 flex-1">
                                    <p className="text-lg font-black text-white">{account.bank}</p>
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">{account.alias}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                            <p className="text-[8px] font-black text-primary uppercase tracking-widest">{account.status}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFinancialNode(account.id)}
                                        className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
