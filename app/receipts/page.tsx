"use client";

import { ReceiptTimeline } from "@/components/transactions/receipt-timeline";
import { motion } from "framer-motion";
import { Receipt, TrendingUp, DollarSign } from "lucide-react";
import { useSentinelStore } from "@/lib/store";

export default function ReceiptsPage() {
    const { scans } = useSentinelStore();

    const receiptsCount = scans.filter(s => s.amount && s.amount > 0).length;
    const totalAmount = scans
        .filter(s => s.amount)
        .reduce((sum, s) => sum + (s.amount || 0), 0);

    return (
        <div className="min-h-screen bg-background p-6 pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Receipt size={24} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white">
                                Transaction Receipts
                            </h1>
                            <p className="text-sm text-zinc-400">
                                View and manage your transaction history
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Receipt size={16} className="text-primary" />
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    Total Receipts
                                </span>
                            </div>
                            <p className="text-3xl font-black text-white">
                                {receiptsCount}
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign size={16} className="text-primary" />
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    Total Amount
                                </span>
                            </div>
                            <p className="text-3xl font-black text-primary">
                                ₹{totalAmount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Receipt Timeline */}
                <ReceiptTimeline />
            </div>
        </div>
    );
}
