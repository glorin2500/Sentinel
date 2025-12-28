"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { useSentinelStore } from "@/lib/store";
import { motion } from "framer-motion";
import { User, Shield, CreditCard, ExternalLink, Settings, Zap, Award, Target, Unlock } from "lucide-react";

export default function ProfilePage() {
    const { scans, safetyScore } = useSentinelStore();

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
                        <div>
                            <h1 className="text-5xl font-black text-white tracking-tighter uppercase">OPERATOR_01</h1>
                            <p className="text-xs font-black text-primary uppercase tracking-[0.4em] mt-1">Tier 1 • Sentinel Pro Elite</p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                                <Target size={14} className="text-zinc-500" />
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Global Rank #1,402</span>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                                <Unlock size={14} className="text-zinc-500" />
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">2FA Verified</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <button className="px-8 py-4 rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20">Edit Profile</button>
                        <button className="px-8 py-4 rounded-2xl bg-white/5 text-zinc-400 font-black uppercase text-[10px] tracking-widest border border-white/5 hover:text-white transition-all">Export Logs</button>
                    </div>
                </div>
            </div>

            {/* Performance Matrix */}
            <div className="grid sm:grid-cols-3 gap-6">
                {[
                    { label: "Stability Index", value: `${safetyScore}%`, color: "text-primary", sub: "Network Trust" },
                    { label: "Operation Count", value: scans.length, color: "text-white", sub: "Total Scans" },
                    { label: "Threat Neutralized", value: scans.filter(s => s.status === 'risky').length, color: "text-destructive", sub: "Blocked Events" },
                ].map((stat, i) => (
                    <GlassCard key={i} className="p-8 items-center text-center gap-3 border-white/5 hover:border-white/10 transition-all">
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">{stat.label}</p>
                        <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{stat.sub}</p>
                    </GlassCard>
                ))}
            </div>

            {/* Secure Financial Nodes */}
            <div className="space-y-8">
                <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-3">
                        <CreditCard size={18} className="text-zinc-500" />
                        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">Financial Nodes</h3>
                    </div>
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">+ Initialize Path</button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        { bank: "HDFC CORE-V1", type: "PRIMARY_ACCESS", status: "ENCRYPTED" },
                        { bank: "AXIS QUANTUM", type: "WALLET_NODE", status: "STANDBY" }
                    ].map((account, i) => (
                        <GlassCard key={i} className="flex-row items-center border-white/5 hover:border-primary/20 transition-all p-8 !bg-white/[0.01]">
                            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-primary transition-colors">
                                <Zap size={24} />
                            </div>
                            <div className="ml-6 flex-1">
                                <p className="text-lg font-black text-white">{account.bank}</p>
                                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">{account.type}</p>
                            </div>
                            <div className="text-right">
                                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                    <p className="text-[8px] font-black text-primary uppercase tracking-widest">{account.status}</p>
                                </div>
                                <ExternalLink size={14} className="mt-4 ml-auto text-zinc-700 hover:text-white cursor-pointer transition-colors" />
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>

            {/* Global Security Engine */}
            <GlassCard className="p-10 border-primary/30 !bg-primary/[0.02] flex-col md:flex-row items-center gap-10">
                <div className="h-24 w-24 rounded-[30px] bg-primary/20 flex items-center justify-center text-primary relative">
                    <div className="absolute inset-[-10px] border border-primary/20 rounded-[40px] animate-spin-slow" />
                    <Shield size={48} />
                </div>
                <div className="flex-1 space-y-3 text-center md:text-left">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Sentinel Engine vX.9</h3>
                    <p className="text-xs font-medium text-zinc-400 leading-relaxed max-w-xl">
                        Your identity is protected by the Global Sovereign Encryption Layer. Every transaction is cross-referenced with 12M+ known threat patterns in under 4ms.
                    </p>
                </div>
                <button className="h-16 w-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 transition-all">
                    <Settings size={28} />
                </button>
            </GlassCard>
        </motion.div>
    );
}
