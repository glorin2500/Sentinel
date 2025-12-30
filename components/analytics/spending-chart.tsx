"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ScanResult } from "@/lib/store";
import { TrendingUp, DollarSign } from "lucide-react";

interface SpendingChartProps {
    scans: ScanResult[];
}

export function SpendingChart({ scans: allScans }: SpendingChartProps) {
    // Filter scans with amounts
    const scansWithAmounts = allScans.filter(scan => scan.amount && scan.amount > 0);

    // Calculate spending by merchant
    const spendingByMerchant = useMemo(() => {
        const merchantMap = new Map<string, { name: string; total: number; count: number }>();

        scansWithAmounts.forEach(scan => {
            const merchantName = scan.merchantName || scan.upiId;
            const existing = merchantMap.get(scan.upiId);

            if (existing) {
                existing.total += scan.amount!;
                existing.count += 1;
            } else {
                merchantMap.set(scan.upiId, {
                    name: merchantName,
                    total: scan.amount!,
                    count: 1
                });
            }
        });

        return Array.from(merchantMap.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, 10)
            .map(item => ({
                name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
                amount: item.total,
                count: item.count
            }));
    }, [scansWithAmounts]);

    // Calculate total spending
    const totalSpending = scansWithAmounts.reduce((sum, scan) => sum + (scan.amount || 0), 0);
    const avgTransaction = scansWithAmounts.length > 0 ? totalSpending / scansWithAmounts.length : 0;

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="px-3 py-2 rounded-xl bg-background border border-white/20 backdrop-blur-xl">
                    <p className="text-xs font-black text-white mb-1">{payload[0].payload.name}</p>
                    <p className="text-[10px] text-primary font-bold">
                        ₹{payload[0].value.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-zinc-400">
                        {payload[0].payload.count} transaction{payload[0].payload.count > 1 ? 's' : ''}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (scansWithAmounts.length === 0) {
        return (
            <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
                <h3 className="text-lg font-black text-white mb-2">Spending Analytics</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-6">
                    Transaction Amount Tracking
                </p>
                <div className="flex flex-col items-center justify-center py-12">
                    <DollarSign size={48} className="text-zinc-700 mb-4" />
                    <p className="text-sm font-bold text-zinc-500">No transaction amounts recorded</p>
                    <p className="text-xs text-zinc-600 mt-2">Add amounts when scanning to see spending analytics</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-lg font-black text-white">Spending Analytics</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">
                    Top Merchants by Amount
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={14} className="text-primary" />
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                            Total Spending
                        </span>
                    </div>
                    <p className="text-2xl font-black text-white">
                        ₹{totalSpending.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">
                        {scansWithAmounts.length} transaction{scansWithAmounts.length > 1 ? 's' : ''}
                    </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                        <DollarSign size={14} className="text-zinc-400" />
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                            Avg Transaction
                        </span>
                    </div>
                    <p className="text-2xl font-black text-white">
                        ₹{avgTransaction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">
                        Per transaction
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spendingByMerchant} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 255, 178, 0.1)' }} />
                        <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                            {spendingByMerchant.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`rgba(124, 255, 178, ${0.3 + (index / spendingByMerchant.length) * 0.5})`}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
