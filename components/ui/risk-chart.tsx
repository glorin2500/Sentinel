"use client";

import { GlassCard } from "./glass-card";
import { useSentinelStore } from "@/lib/store";
import { BarChart, Bar, ResponsiveContainer, XAxis, Cell } from "recharts";

export function RiskChart() {
    const { currentView, setView, riskData } = useSentinelStore();

    return (
        <GlassCard className="h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">Risk Patterns</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Live threat velocity</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                    {['weekly', 'monthly'].map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v as 'weekly' | 'monthly')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentView === v
                                ? 'bg-primary text-black shadow-[0_0_20px_rgba(124,255,178,0.2)]'
                                : 'text-zinc-500 hover:text-white'
                                }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskData} margin={{ top: 0, right: 0, left: 0, bottom: 40 }} barSize={38}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#FFFFFF', fontSize: 14, fontWeight: 900 }}
                            dy={20}
                            interval={0}
                        />
                        <Bar
                            dataKey="value"
                            radius={[12, 12, 12, 12]}
                            background={{ fill: 'rgba(255,255,255,0.03)', radius: 12 }}
                            className="cursor-pointer"
                        >
                            {riskData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    className="hover:opacity-80 transition-opacity"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-6 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Normal Load</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Anomalies Detected</span>
                </div>
            </div>
        </GlassCard>
    );
}
