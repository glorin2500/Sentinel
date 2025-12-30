"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSentinelStore } from "@/lib/store";
import {
    Receipt as ReceiptType,
    groupReceiptsByDate,
    searchReceipts,
    filterReceipts,
    generatePaymentProof
} from "@/lib/transactions/receipt-manager";
import {
    Receipt, Search, Filter, Download, FileText,
    ChevronDown, Calendar, DollarSign, Tag, X
} from "lucide-react";
import { format } from "date-fns";

export function ReceiptTimeline() {
    const { scans } = useSentinelStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<ReceiptType | null>(null);

    // Convert scans to receipts (mock - would be real receipts in production)
    const receipts: ReceiptType[] = scans
        .filter(scan => scan.amount && scan.amount > 0)
        .map(scan => ({
            id: `receipt-${scan.id}`,
            scanId: scan.id,
            merchantName: scan.merchantName || 'Unknown Merchant',
            upiId: scan.upiId,
            amount: scan.amount!,
            timestamp: scan.timestamp,
            status: scan.status === 'safe' ? 'completed' : scan.status === 'risky' ? 'disputed' : 'pending',
            category: scan.category,
            notes: scan.notes,
            attachments: [],
            metadata: {
                transactionId: `TXN${scan.timestamp}`,
                referenceNumber: `REF${scan.id.toUpperCase()}`
            }
        }));

    // Search and filter
    const filteredReceipts = searchQuery
        ? searchReceipts(receipts, searchQuery)
        : receipts;

    const timeline = groupReceiptsByDate(filteredReceipts);

    return (
        <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search receipts..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary/50"
                    />
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-3 rounded-xl border transition-all ${showFilters
                            ? 'bg-primary/10 border-primary/20 text-primary'
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                        }`}
                >
                    <Filter size={16} />
                </button>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                                    Status
                                </label>
                                <select className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm">
                                    <option>All</option>
                                    <option>Completed</option>
                                    <option>Pending</option>
                                    <option>Disputed</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                                    Category
                                </label>
                                <select className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm">
                                    <option>All Categories</option>
                                    <option>Food & Dining</option>
                                    <option>Shopping</option>
                                    <option>Transportation</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Total
                    </p>
                    <p className="text-2xl font-black text-white">
                        {receipts.length}
                    </p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Amount
                    </p>
                    <p className="text-2xl font-black text-primary">
                        ₹{receipts.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                    </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Average
                    </p>
                    <p className="text-2xl font-black text-white">
                        ₹{receipts.length > 0 ? Math.round(receipts.reduce((sum, r) => sum + r.amount, 0) / receipts.length).toLocaleString() : 0}
                    </p>
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
                {timeline.map((day, dayIndex) => (
                    <motion.div
                        key={day.date}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: dayIndex * 0.1 }}
                    >
                        {/* Date Header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-zinc-500" />
                                <h3 className="text-sm font-black text-white">
                                    {format(new Date(day.date), 'EEEE, MMMM d, yyyy')}
                                </h3>
                            </div>
                            <div className="text-xs text-zinc-500">
                                {day.count} transaction{day.count > 1 ? 's' : ''} • ₹{day.totalAmount.toLocaleString()}
                            </div>
                        </div>

                        {/* Receipts */}
                        <div className="space-y-2">
                            {day.transactions.map((receipt, index) => (
                                <motion.div
                                    key={receipt.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: dayIndex * 0.1 + index * 0.05 }}
                                    onClick={() => setSelectedReceipt(receipt)}
                                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <Receipt size={20} className="text-primary" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-black text-white truncate">
                                                        {receipt.merchantName}
                                                    </p>
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${receipt.status === 'completed'
                                                            ? 'bg-primary/20 text-primary'
                                                            : receipt.status === 'disputed'
                                                                ? 'bg-destructive/20 text-destructive'
                                                                : 'bg-yellow-500/20 text-yellow-500'
                                                        }`}>
                                                        {receipt.status}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-zinc-400 mb-1">
                                                    {receipt.upiId}
                                                </p>

                                                <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                                                    <span>{format(new Date(receipt.timestamp), 'h:mm a')}</span>
                                                    {receipt.metadata?.transactionId && (
                                                        <span>ID: {receipt.metadata.transactionId.slice(-8)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-lg font-black text-white">
                                                ₹{receipt.amount.toLocaleString()}
                                            </p>
                                            {receipt.category && (
                                                <span className="text-[10px] text-zinc-500">
                                                    {receipt.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}

                {timeline.length === 0 && (
                    <div className="p-12 text-center">
                        <Receipt size={48} className="text-zinc-700 mx-auto mb-4" />
                        <p className="text-sm font-bold text-zinc-500 mb-2">
                            No receipts found
                        </p>
                        <p className="text-xs text-zinc-600">
                            {searchQuery ? 'Try a different search term' : 'Start adding transaction amounts to your scans'}
                        </p>
                    </div>
                )}
            </div>

            {/* Receipt Detail Modal */}
            <AnimatePresence>
                {selectedReceipt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedReceipt(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md p-6 rounded-3xl bg-[#0B0F0E] border border-white/10"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-white">Receipt Details</h3>
                                <button
                                    onClick={() => setSelectedReceipt(null)}
                                    className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                                >
                                    <X size={16} className="text-zinc-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                        Merchant
                                    </p>
                                    <p className="text-base font-black text-white">
                                        {selectedReceipt.merchantName}
                                    </p>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        {selectedReceipt.upiId}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                            Amount
                                        </p>
                                        <p className="text-2xl font-black text-primary">
                                            ₹{selectedReceipt.amount.toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                            Status
                                        </p>
                                        <p className="text-sm font-black text-white capitalize">
                                            {selectedReceipt.status}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                        Transaction Details
                                    </p>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Date & Time</span>
                                            <span className="text-white font-bold">
                                                {format(new Date(selectedReceipt.timestamp), 'MMM d, yyyy h:mm a')}
                                            </span>
                                        </div>
                                        {selectedReceipt.metadata?.transactionId && (
                                            <div className="flex justify-between">
                                                <span className="text-zinc-400">Transaction ID</span>
                                                <span className="text-white font-mono">
                                                    {selectedReceipt.metadata.transactionId}
                                                </span>
                                            </div>
                                        )}
                                        {selectedReceipt.metadata?.referenceNumber && (
                                            <div className="flex justify-between">
                                                <span className="text-zinc-400">Reference</span>
                                                <span className="text-white font-mono">
                                                    {selectedReceipt.metadata.referenceNumber}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        const proof = generatePaymentProof(selectedReceipt);
                                        navigator.clipboard.writeText(proof);
                                        alert('Payment proof copied to clipboard!');
                                    }}
                                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-background font-black uppercase text-sm tracking-wider transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download size={16} />
                                    Generate Proof
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
