"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScanResult } from "@/lib/store";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addMonths, subMonths } from "date-fns";

interface CalendarHeatmapProps {
    scans: ScanResult[];
    onDayClick?: (date: Date, scans: ScanResult[]) => void;
}

export function CalendarHeatmap({ scans, onDayClick }: CalendarHeatmapProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get scan count for each day
    const getScanCountForDay = (date: Date): number => {
        return scans.filter(scan => isSameDay(new Date(scan.timestamp), date)).length;
    };

    // Get scans for a specific day
    const getScansForDay = (date: Date): ScanResult[] => {
        return scans.filter(scan => isSameDay(new Date(scan.timestamp), date));
    };

    // Get color intensity based on scan count
    const getIntensityColor = (count: number): string => {
        if (count === 0) return 'bg-white/5';
        if (count === 1) return 'bg-primary/20';
        if (count === 2) return 'bg-primary/40';
        if (count === 3) return 'bg-primary/60';
        return 'bg-primary/80';
    };

    // Get starting day offset (0 = Sunday)
    const startingDayOfWeek = getDay(monthStart);

    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-black text-white">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">
                        Scan Activity Heatmap
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrevMonth}
                        className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                    >
                        <ChevronLeft size={16} className="text-zinc-400" />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                    >
                        <ChevronRight size={16} className="text-zinc-400" />
                    </button>
                </div>
            </div>

            {/* Week day labels */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map((day, i) => (
                    <div key={i} className="text-center">
                        <span className="text-[10px] font-black text-zinc-600 uppercase">
                            {day}
                        </span>
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Actual days */}
                {daysInMonth.map((date, i) => {
                    const scanCount = getScanCountForDay(date);
                    const dayScans = getScansForDay(date);
                    const hasRisky = dayScans.some(s => s.status === 'risky');

                    return (
                        <motion.button
                            key={i}
                            onClick={() => onDayClick?.(date, dayScans)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`aspect-square rounded-lg border transition-all relative group ${getIntensityColor(scanCount)
                                } ${hasRisky
                                    ? 'border-destructive/40'
                                    : scanCount > 0
                                        ? 'border-primary/40'
                                        : 'border-white/10'
                                } hover:border-primary/60`}
                        >
                            {/* Day number */}
                            <span className={`text-[10px] font-bold ${scanCount > 0 ? 'text-white' : 'text-zinc-600'
                                }`}>
                                {format(date, 'd')}
                            </span>

                            {/* Scan count indicator */}
                            {scanCount > 0 && (
                                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                                    <span className="text-[8px] font-black text-background">
                                        {scanCount}
                                    </span>
                                </div>
                            )}

                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-background border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                <p className="text-[9px] font-bold text-white">
                                    {format(date, 'MMM d')}
                                </p>
                                <p className="text-[8px] text-zinc-400">
                                    {scanCount} scan{scanCount !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                        Less
                    </span>
                    <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((level) => (
                            <div
                                key={level}
                                className={`h-3 w-3 rounded ${getIntensityColor(level)}`}
                            />
                        ))}
                    </div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                        More
                    </span>
                </div>

                <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-400">
                        Total: {scans.filter(s => {
                            const scanDate = new Date(s.timestamp);
                            return scanDate >= monthStart && scanDate <= monthEnd;
                        }).length} scans this month
                    </p>
                </div>
            </div>
        </div>
    );
}
