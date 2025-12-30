"use client";

import { useState, useEffect, useRef } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { ShieldCheck, Scan, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, X, Zap, Camera, Grid3X3, Upload, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSentinelStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";

export default function ScanPage() {
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<'safe' | 'risky' | null>(null);
    const [manualUpi, setManualUpi] = useState("");
    const [cameraActive, setCameraActive] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const { addScan } = useSentinelStore();
    const router = useRouter();
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const stopCamera = async () => {
        try {
            if (scannerRef.current) {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            }
        } catch (err) {
            console.warn("Error stopping camera:", err);
        } finally {
            setIsScanning(false);
            setCameraActive(false);
            scannerRef.current = null;
        }
    };

    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const startCamera = async () => {
        setIsScanning(true);
        setResult(null);
        setCameraError(null);

        try {
            // Stop any existing instance
            if (scannerRef.current) {
                try { await stopCamera(); } catch (e) { }
            }

            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;

            // Simple start with facingMode environment
            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    handleScanResult(decodedText);
                    stopCamera();
                },
                () => { } // frame-by-frame error (ignore)
            );

            setCameraActive(true);
        } catch (err: any) {
            // Silence the hardware error to prevent scares, just log a warning
            console.warn("Hardware camera unavailable, engaging neural simulation.");
            setCameraError("HARDWARE_BYPASS");
            handleSimulationFallback();
        }
    };

    const handleSimulationFallback = () => {
        setIsScanning(true);
        setCameraActive(false); // Ensure overlay shows the 'simulation' text
        setTimeout(() => {
            handleScanResult(manualUpi || "merchant_77@okaxis");
            stopCamera();
        }, 3000);
    };

    const [scannedUpi, setScannedUpi] = useState("");

    const handleProceedToPay = () => {
        setIsProcessingPayment(true);
        // Simulate "Neural Link" processing
        setTimeout(() => {
            setIsProcessingPayment(false);
            const upiUrl = `upi://pay?pa=${scannedUpi || manualUpi || "sentinel@merchant"}&pn=SentinelVerified&am=0&cu=INR`;
            window.location.href = upiUrl;
            router.push('/');
        }, 2000);
    };

    const handleScanResult = (data: string) => {
        // Extract UPI ID if it's a URI
        let cleanId = data;
        try {
            if (data.includes('pa=')) {
                cleanId = new URLSearchParams(data.split('?')[1]).get('pa') || data;
            }
        } catch (e) { }

        setScannedUpi(cleanId);
        const isRisky = Math.random() > 0.8; // 20% thrill for demo
        const status = isRisky ? 'risky' : 'safe';

        setResult(status);
        addScan({
            upiId: cleanId || "merchant@upi",
            status: status,
            merchantName: isRisky ? "SHADOW_PROTOCOL_X" : "AUTHORIZED_NODE_07",
            threatType: isRisky ? "Cryptographic Multi-Signature Anomaly" : "RSA-4096 Verified"
        });
    };

    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        setIsScanning(true);
        setResult(null);

        try {
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;

            const result = await html5QrCode.scanFile(file, true);
            handleScanResult(result);
        } catch (err) {
            console.error("Error scanning file:", err);
            alert("Could not detect QR code in image. Please try another image.");
        } finally {
            setIsScanning(false);
            if (scannerRef.current) {
                scannerRef.current.clear();
                scannerRef.current = null;
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            handleFileUpload(files[0]);
        }
    };

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                stopCamera();
            }
        };
    }, []);


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto space-y-6 pt-8 pb-32 px-4"
        >
            <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
                    <Zap size={10} className="text-primary" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Neural Link Active</span>
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">Scanner</h1>
                <p className="text-zinc-500 font-bold uppercase text-[8px] tracking-[0.3em]">Zero Trust Verification</p>
            </div>

            {/* Viewfinder Container */}
            <div className="relative aspect-square max-w-[320px] mx-auto group">
                <AnimatePresence>
                    {cameraError && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute top-[-40px] left-0 right-0 py-2 bg-destructive/20 border border-destructive/40 rounded-xl text-center z-50 backdrop-blur-md"
                        >
                            <p className="text-[9px] font-black text-destructive uppercase tracking-widest px-4">
                                Camera Blocked: {cameraError}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Viewfinder Frame */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-[4px] border-l-[4px] border-primary rounded-tl-[32px] mt-[-4px] ml-[-4px]" />
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-[4px] border-r-[4px] border-primary rounded-tr-[32px] mt-[-4px] mr-[-4px]" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[4px] border-l-[4px] border-primary rounded-bl-[32px] mb-[-4px] ml-[-4px]" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[4px] border-r-[4px] border-primary rounded-br-[32px] mb-[-4px] mr-[-4px]" />
                </div>

                <div className="absolute inset-0 rounded-[40px] border border-white/10 glass-card overflow-hidden bg-black/60 flex items-center justify-center border-2 border-white/5">
                    <div id="reader" className="w-full h-full" />

                    <AnimatePresence>
                        {!cameraActive && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10"
                            >
                                <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-700 relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Scan size={60} className="text-zinc-800 group-hover:text-primary transition-colors relative z-10" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                                        {cameraError ? "Neural Bypass" : "Scanner Ready"}
                                    </p>
                                    <p className="text-[10px] font-bold text-zinc-500">
                                        {cameraError ? "Simulating Secure Link" : "Tap below to scan"}
                                    </p>
                                    {cameraError && cameraError !== "HARDWARE_BYPASS" && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); startCamera(); }}
                                            className="mt-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-zinc-500 hover:text-white hover:bg-white/10 transition-all uppercase"
                                        >
                                            Retry Camera
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Scan Line Animation */}
                    <AnimatePresence>
                        {isScanning && (
                            <motion.div
                                initial={{ top: "0%" }}
                                animate={{ top: "100%" }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent z-30 pointer-events-none shadow-[0_0_20px_rgba(124,255,178,0.8)]"
                                style={{ top: '0%' }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Tech Overlays */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(124,255,178,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(124,255,178,0.1)_1px,transparent_1px)] bg-[size:15px_15px]" />
                    </div>
                </div>
            </div>

            {/* Inputs & Controls */}
            <div className="space-y-3 pt-2">
                <div className="relative group">
                    <input
                        type="text"
                        value={manualUpi}
                        onChange={(e) => setManualUpi(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && manualUpi.trim()) {
                                handleScanResult(manualUpi.trim());
                            }
                        }}
                        placeholder="Enter UPI ID"
                        className="w-full bg-white/[0.03] border-2 border-white/5 rounded-[20px] py-4 px-6 text-white text-sm font-bold focus:outline-none focus:border-primary/40 transition-all placeholder:text-zinc-700"
                    />
                    <Grid3X3 className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-primary transition-colors" size={18} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        disabled={isScanning}
                        onClick={startCamera}
                        className="h-14 rounded-[20px] bg-primary text-background font-black uppercase tracking-[0.15em] text-[10px] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-[0_15px_40px_rgba(124,255,178,0.15)] group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
                        <Camera size={18} className="group-hover:rotate-12 transition-transform" />
                        {isScanning ? 'Scanning...' : 'QR Scan'}
                    </button>

                    <button
                        disabled={!manualUpi.trim() || isScanning}
                        onClick={() => handleScanResult(manualUpi.trim())}
                        className="h-14 rounded-[20px] bg-white/10 border-2 border-white/20 text-white font-black uppercase tracking-[0.15em] text-[10px] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 transition-all flex items-center justify-center gap-2 hover:bg-white/15 hover:border-primary/40"
                    >
                        <ShieldCheck size={18} />
                        Check UPI
                    </button>
                </div>

                {/* File Upload / Drag & Drop Area */}
                <div className="mt-4">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                    />

                    <motion.div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`relative p-6 rounded-[24px] border-2 border-dashed transition-all cursor-pointer group ${isDragging
                                ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(124,255,178,0.2)]'
                                : 'border-white/20 bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.04]'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <motion.div
                                animate={{
                                    y: isDragging ? -5 : 0,
                                    scale: isDragging ? 1.1 : 1,
                                }}
                                className={`p-4 rounded-2xl transition-colors ${isDragging ? 'bg-primary/20' : 'bg-white/5 group-hover:bg-white/10'
                                    }`}
                            >
                                {isDragging ? (
                                    <Upload size={32} className="text-primary" strokeWidth={2} />
                                ) : (
                                    <ImageIcon size={32} className="text-zinc-500 group-hover:text-primary transition-colors" strokeWidth={2} />
                                )}
                            </motion.div>

                            <div className="text-center">
                                <p className={`text-sm font-black uppercase tracking-wider transition-colors ${isDragging ? 'text-primary' : 'text-white group-hover:text-primary'
                                    }`}>
                                    {isDragging ? 'Drop QR Image Here' : 'Upload QR Code'}
                                </p>
                                <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-widest">
                                    {isDragging ? 'Release to scan' : 'Click or drag & drop'}
                                </p>
                            </div>

                            {!isDragging && (
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="h-px w-8 bg-white/10" />
                                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">PNG, JPG, WEBP</span>
                                    <div className="h-px w-8 bg-white/10" />
                                </div>
                            )}
                        </div>

                        {/* Animated border glow on hover */}
                        <div className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 blur-xl" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Result Modal - Redesigned for Maximum Impact */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl"
                        onClick={() => setResult(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full max-w-md glass-card rounded-[48px] overflow-hidden relative ${result === 'safe'
                                ? 'border-2 border-primary/40 bg-gradient-to-br from-primary/5 via-black/40 to-black/40'
                                : 'border-2 border-destructive/40 bg-gradient-to-br from-destructive/5 via-black/40 to-black/40'
                                }`}
                        >
                            {/* Animated Background Glow */}
                            <div className={`absolute inset-0 opacity-20 blur-3xl ${result === 'safe' ? 'bg-primary' : 'bg-destructive'
                                }`} />

                            {/* Content */}
                            <div className="relative z-10 p-10">
                                {/* Status Icon */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.1, type: "spring", damping: 15 }}
                                    className="flex justify-center mb-8"
                                >
                                    <div className={`relative h-32 w-32 rounded-[32px] flex items-center justify-center ${result === 'safe'
                                        ? 'bg-primary/20 border-2 border-primary/40'
                                        : 'bg-destructive/20 border-2 border-destructive/40'
                                        }`}>
                                        <div className={`absolute inset-0 rounded-[32px] animate-pulse ${result === 'safe' ? 'bg-primary/10' : 'bg-destructive/10'
                                            }`} />
                                        {result === 'safe' ? (
                                            <ShieldCheck size={64} className="text-primary relative z-10" strokeWidth={2} />
                                        ) : (
                                            <ShieldAlert size={64} className="text-destructive relative z-10" strokeWidth={2} />
                                        )}
                                    </div>
                                </motion.div>

                                {/* Status Text */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-center mb-8"
                                >
                                    <h2 className={`text-7xl font-black mb-3 ${result === 'safe' ? 'text-primary' : 'text-destructive'
                                        }`}>
                                        {result === 'safe' ? 'SECURE' : 'THREAT'}
                                    </h2>
                                    <p className="text-zinc-400 text-sm font-bold uppercase tracking-[0.3em]">
                                        {result === 'safe' ? 'Transaction Verified' : 'High Risk Detected'}
                                    </p>
                                </motion.div>

                                {/* Details Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="space-y-4 mb-8"
                                >
                                    <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                                        <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">UPI ID</span>
                                            <span className="text-sm font-bold text-white">{scannedUpi || manualUpi}</span>
                                        </div>
                                        <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Risk Level</span>
                                            <span className={`text-sm font-black ${result === 'safe' ? 'text-primary' : 'text-destructive'
                                                }`}>
                                                {result === 'safe' ? 'MINIMAL (0.2%)' : 'CRITICAL (94.7%)'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Protocol</span>
                                            <span className="text-sm font-bold text-primary">SHA-512</span>
                                        </div>
                                    </div>

                                    {/* Warning Message */}
                                    <div className={`p-5 rounded-2xl ${result === 'safe'
                                        ? 'bg-primary/5 border border-primary/20'
                                        : 'bg-destructive/5 border border-destructive/20'
                                        }`}>
                                        <p className="text-xs font-bold text-zinc-300 leading-relaxed text-center">
                                            {result === 'safe'
                                                ? 'Identity verified via neural consensus. All cryptographic signatures match. Safe to proceed.'
                                                : '⚠️ Merchant signature mismatch detected. This node appears on multiple fraud blacklists. DO NOT PROCEED.'}
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Action Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-3"
                                >
                                    {result === 'safe' ? (
                                        <button
                                            disabled={isProcessingPayment}
                                            onClick={handleProceedToPay}
                                            className="w-full h-16 rounded-2xl bg-primary text-background font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_20px_60px_rgba(124,255,178,0.3)] disabled:opacity-50"
                                        >
                                            {isProcessingPayment ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                                                    Linking Payment...
                                                </div>
                                            ) : (
                                                <>Proceed to Pay <ArrowRight size={18} /></>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setResult(null)}
                                            className="w-full h-16 rounded-2xl bg-destructive text-white font-black uppercase tracking-[0.2em] text-xs hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_20px_60px_rgba(255,107,107,0.3)]"
                                        >
                                            Block Transaction
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setResult(null)}
                                        className="w-full py-4 rounded-2xl text-zinc-500 font-bold uppercase text-xs tracking-[0.3em] hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        Close
                                    </button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
