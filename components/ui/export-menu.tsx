"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { useSentinelStore } from "@/lib/store";
import { generateCSV, generatePDF, downloadFile } from "@/lib/export-utils";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export function ExportMenu() {
    const { scans, safetyScore } = useSentinelStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportCSV = async () => {
        setIsExporting(true);
        try {
            const csvContent = generateCSV(scans);
            const filename = `sentinel-scans-${format(Date.now(), 'yyyy-MM-dd')}.csv`;
            downloadFile(csvContent, filename, 'text/csv');
        } catch (error) {
            console.error('Failed to export CSV:', error);
            alert('Failed to export CSV. Please try again.');
        } finally {
            setIsExporting(false);
            setIsOpen(false);
        }
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const stats = {
                safetyScore,
                totalScans: scans.length,
                safeScans: scans.filter(s => s.status === 'safe').length,
                riskyScans: scans.filter(s => s.status === 'risky').length
            };
            const pdf = generatePDF(scans, stats);
            const filename = `sentinel-report-${format(Date.now(), 'yyyy-MM-dd')}.pdf`;
            pdf.save(filename);
        } catch (error) {
            console.error('Failed to export PDF:', error);
            alert('Failed to export PDF. Please try again.');
        } finally {
            setIsExporting(false);
            setIsOpen(false);
        }
    };

    if (scans.length === 0) {
        return null; // Don't show export button if no scans
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 px-4 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center gap-2 hover:bg-primary/20 transition-all font-black uppercase text-xs tracking-wider"
            >
                <Download size={16} />
                Export
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40"
                        />

                        {/* Menu */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-12 z-50 w-56 p-2 rounded-2xl bg-background border border-white/10 shadow-2xl"
                        >
                            <div className="space-y-1">
                                <button
                                    onClick={handleExportCSV}
                                    disabled={isExporting}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group disabled:opacity-50"
                                >
                                    {isExporting ? (
                                        <Loader2 size={18} className="text-primary animate-spin" />
                                    ) : (
                                        <FileSpreadsheet size={18} className="text-primary group-hover:scale-110 transition-transform" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white">Export as CSV</p>
                                        <p className="text-[10px] text-zinc-500">Spreadsheet format</p>
                                    </div>
                                </button>

                                <button
                                    onClick={handleExportPDF}
                                    disabled={isExporting}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group disabled:opacity-50"
                                >
                                    {isExporting ? (
                                        <Loader2 size={18} className="text-primary animate-spin" />
                                    ) : (
                                        <FileText size={18} className="text-primary group-hover:scale-110 transition-transform" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white">Export as PDF</p>
                                        <p className="text-[10px] text-zinc-500">Detailed report</p>
                                    </div>
                                </button>
                            </div>

                            <div className="mt-2 pt-2 border-t border-white/5">
                                <p className="text-[9px] text-zinc-600 px-3 py-1">
                                    {scans.length} scan{scans.length !== 1 ? 's' : ''} will be exported
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
