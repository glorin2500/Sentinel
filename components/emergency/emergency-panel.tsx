"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertTriangle, Phone, Shield, FileText, Users,
    CheckCircle, Clock, X, ChevronRight
} from "lucide-react";
import {
    EMERGENCY_CONTACTS,
    getEmergencyChecklist,
    getQuickActions,
    createFraudReport
} from "@/lib/emergency/emergency-service";

export function EmergencyPanel() {
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportSubmitted, setReportSubmitted] = useState(false);
    const [checklist, setChecklist] = useState(getEmergencyChecklist());

    const quickActions = getQuickActions(
        () => setShowReportForm(true),
        () => window.open(`tel:${EMERGENCY_CONTACTS.cyberCrime.phone}`),
        () => alert('Transaction freeze request submitted'),
        () => alert('Emergency contacts notified')
    );

    const toggleChecklistItem = (id: string) => {
        setChecklist(prev => prev.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    return (
        <div className="space-y-6">
            {/* Alert Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20"
            >
                <div className="flex items-start gap-3">
                    <AlertTriangle size={24} className="text-destructive flex-shrink-0" />
                    <div>
                        <h3 className="text-sm font-black text-white mb-1">
                            Emergency Response Center
                        </h3>
                        <p className="text-xs text-zinc-400">
                            Quick actions for fraud incidents and security emergencies
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                    <motion.button
                        key={action.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={action.action}
                        className={`p-4 rounded-2xl border-2 transition-all ${action.urgent
                                ? 'border-destructive/30 bg-destructive/5 hover:bg-destructive/10'
                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                            }`}
                    >
                        <div className="text-3xl mb-2">{action.icon}</div>
                        <p className="text-sm font-black text-white mb-1">
                            {action.label}
                        </p>
                        {action.urgent && (
                            <span className="text-[9px] font-bold text-destructive uppercase tracking-wider">
                                Urgent
                            </span>
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Emergency Contacts */}
            <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
                <h3 className="text-lg font-black text-white mb-4">Emergency Contacts</h3>

                <div className="space-y-3">
                    {Object.values(EMERGENCY_CONTACTS).map((contact, index) => (
                        <motion.a
                            key={contact.name}
                            href={`tel:${contact.phone}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Phone size={20} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white">
                                        {contact.name}
                                    </p>
                                    <p className="text-xs text-zinc-400">
                                        {contact.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-primary">
                                    {contact.phone}
                                </span>
                                <ChevronRight size={16} className="text-zinc-500 group-hover:text-primary transition-colors" />
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>

            {/* Emergency Checklist */}
            <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-white">Emergency Checklist</h3>
                    <span className="text-xs font-bold text-zinc-500">
                        {checklist.filter(item => item.completed).length}/{checklist.length} Complete
                    </span>
                </div>

                <div className="space-y-2">
                    {checklist.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => toggleChecklistItem(item.id)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${item.completed
                                    ? 'bg-primary/5 border-primary/20'
                                    : item.urgent
                                        ? 'bg-destructive/5 border-destructive/20'
                                        : 'bg-white/5 border-white/10'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.completed
                                        ? 'bg-primary border-primary'
                                        : 'border-white/20'
                                    }`}>
                                    {item.completed && (
                                        <CheckCircle size={16} className="text-background" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className={`text-sm font-black ${item.completed ? 'text-zinc-500 line-through' : 'text-white'
                                            }`}>
                                            {item.title}
                                        </p>
                                        {item.urgent && !item.completed && (
                                            <span className="px-2 py-0.5 rounded-md bg-destructive/20 text-[9px] font-bold text-destructive uppercase">
                                                Urgent
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-400">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Report Form Modal */}
            <AnimatePresence>
                {showReportForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowReportForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md p-6 rounded-3xl bg-[#0B0F0E] border border-white/10"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-white">Report Fraud</h3>
                                <button
                                    onClick={() => setShowReportForm(false)}
                                    className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                                >
                                    <X size={16} className="text-zinc-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                                        Fraud Type
                                    </label>
                                    <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white">
                                        <option>Fraudulent Transaction</option>
                                        <option>Phishing Attempt</option>
                                        <option>Scam</option>
                                        <option>Unauthorized Access</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">
                                        Description
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white resize-none"
                                        placeholder="Describe what happened..."
                                    />
                                </div>

                                <button
                                    onClick={() => {
                                        setReportSubmitted(true);
                                        setTimeout(() => {
                                            setShowReportForm(false);
                                            setReportSubmitted(false);
                                        }, 2000);
                                    }}
                                    className="w-full py-3 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-black uppercase text-sm tracking-wider transition-colors"
                                >
                                    Submit Report
                                </button>
                            </div>

                            {reportSubmitted && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20"
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={16} className="text-primary" />
                                        <p className="text-sm font-bold text-primary">
                                            Report submitted successfully!
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
