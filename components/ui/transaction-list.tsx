"use client";

import { GlassCard } from "./glass-card";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

const transactions = [
    { id: 1, name: "Apple Music", date: "19 Oct 2024, 09:15", amount: -5.00, type: "sub" },
    { id: 2, name: "Apple Store", date: "17 Oct 2024, 19:47", amount: -0.99, type: "sub" },
    { id: 3, name: "Uber Ride", date: "16 Oct 2024, 14:30", amount: -15.20, type: "expense" },
    { id: 4, name: "Refund", date: "15 Oct 2024, 11:00", amount: 45.00, type: "income" },
];

export function TransactionList() {
    return (
        <GlassCard className="mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                <button className="text-xs text-primary hover:underline">View All</button>
            </div>

            <div className="flex flex-col gap-3">
                {transactions.map((tx, i) => (
                    <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex justify-between items-center p-3 rounded-2xl hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${tx.amount > 0 ? "bg-primary/10 text-primary" : "bg-white/5 text-muted-foreground"
                                }`}>
                                {tx.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-white group-hover:text-primary transition-colors">{tx.name}</h4>
                                <span className="text-xs text-muted-foreground">{tx.date}</span>
                            </div>
                        </div>
                        <span className={`text-sm font-semibold ${tx.amount > 0 ? "text-primary" : "text-white"
                            }`}>
                            {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                        </span>
                    </motion.div>
                ))}
            </div>
        </GlassCard>
    );
}
