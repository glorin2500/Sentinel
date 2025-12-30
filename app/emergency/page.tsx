"use client";

import { EmergencyPanel } from "@/components/emergency/emergency-panel";
import { motion } from "framer-motion";
import { AlertTriangle, Shield } from "lucide-react";

export default function EmergencyPage() {
    return (
        <div className="min-h-screen bg-background p-6 pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle size={24} className="text-destructive" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white">
                                Emergency Response
                            </h1>
                            <p className="text-sm text-zinc-400">
                                Quick actions for fraud incidents
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Emergency Panel */}
                <EmergencyPanel />

                {/* Safety Tips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 p-6 rounded-3xl border border-primary/20 bg-primary/5"
                >
                    <div className="flex items-start gap-3">
                        <Shield size={20} className="text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-sm font-black text-white mb-2">
                                Stay Safe
                            </h3>
                            <ul className="space-y-1 text-xs text-zinc-400">
                                <li>• Never share your UPI PIN with anyone</li>
                                <li>• Report suspicious activity immediately</li>
                                <li>• Keep evidence of all transactions</li>
                                <li>• Contact your bank if you suspect fraud</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
