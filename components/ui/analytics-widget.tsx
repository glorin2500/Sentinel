"use client";

import { GlassCard } from "./glass-card";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, SlidersHorizontal } from "lucide-react";

const transactions = [
    { id: 1, name: "merchant@paytm", date: "11:00 AM", amount: -500, type: "verified" },
    { id: 2, name: "unknown@phonepe", date: "10:20 AM", amount: -2000, type: "suspicious" },
    { id: 3, name: "newuser@upi", date: "10:00 AM", amount: -150, type: "warning" },
    { id: 4, name: "trusted@paytm", date: "09:00 AM", amount: -300, type: "verified" },
];

export function AnalyticsWidget() {
    return (
        <GlassCard className="h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Analytics</h3>
                <button className="text-muted-foreground hover:text-white">
                    <SlidersHorizontal size={16} />
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#1A2220] p-3 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Safe Transactions</span>
                    <span className="text-xl font-bold text-primary">₹24.5k</span>
                </div>
                <div className="bg-[#1A2220] p-3 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Flagged Amount</span>
                    <span className="text-xl font-bold text-orange-400">₹1.2k</span>
                </div>
            </div>

            <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm text-muted-foreground">Recent Activity</h4>
                <div className="flex bg-[#1A2220] rounded-lg p-0.5">
                    <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded text-white font-medium">All</span>
                    <span className="text-[10px] px-2 py-0.5 text-muted-foreground">Risky</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
                {transactions.map((tx, i) => (
                    <div key={tx.id} className="flex items-center justify-between group cursor-pointer hover:bg-white/[0.03] p-2 rounded-xl transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${tx.type === 'verified' ? 'bg-primary/10 border-primary/20 text-primary' :
                                tx.type === 'suspicious' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                    'bg-orange-500/10 border-orange-500/20 text-orange-500'
                                }`}>
                                {tx.type === 'verified' ? '✓' : '!'}
                            </div>
                            <div>
                                <p className="text-sm font-black text-white group-hover:text-primary transition-colors">{tx.name}</p>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{tx.date}</p>
                            </div>
                        </div>
                        <span className={`text-sm font-black ${tx.type === 'verified' ? 'text-white' : 'text-red-400'
                            }`}>
                            ₹{Math.abs(tx.amount)}
                        </span>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
