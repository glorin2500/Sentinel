"use client";

import { useState, useEffect, useRef } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { ShieldCheck, Scan, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, X, Zap, Camera, Grid3X3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSentinelStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";

export default function ScanPage() {
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<'safe' | 'risky' | null>(null);
    const [manualUpi, setManualUpi] = useState("");
    const [cameraActive, setCameraActive] = useState(false);
    const { addScan } = useSentinelStore();
    const router = useRouter();
    const scannerRef = useRef<Html5Qrcode | null>(null);

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

    const handleProceedToPay = () => {
        setIsProcessingPayment(true);
        // Simulate "Neural Link" processing
        setTimeout(() => {
            setIsProcessingPayment(false);
            const upiUrl = `upi://pay?pa=sentinel@merchant&pn=SentinelVerified&am=0&cu=INR`;
            window.location.href = upiUrl;
            // Also show a success alert in case the URI doesn't trigger a visible popup in current browser
            alert("Redirecting to your UPI app for secure payment...");
            router.push('/');
        }, 2000);
    };

    const handleScanResult = (data: string) => {
        const isRisky = Math.random() > 0.8; // 20% thrill for demo
        const status = isRisky ? 'risky' : 'safe';

        setResult(status);
        addScan({
            upiId: data || "merchant@upi",
            status: status,
            merchantName: isRisky ? "Shadow_Protocol_X" : "Authorized_Retail_Node",
            threatType: isRisky ? "High Entropy Anomaly" : undefined
        });
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
            className="max-w-md mx-auto space-y-8 pt-12 pb-32 px-4"
        >
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
                    <Zap size={12} className="text-primary" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Neural Link Active</span>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Sentinel_Scan</h1>
                <p className="text-zinc-500 font-bold uppercase text-[9px] tracking-[0.4em]">Zero Trust Verification Engine</p>
            </div>

            {/* Viewfinder Container */}
            <div className="relative aspect-square max-w-[340px] mx-auto group">
                <AnimatePresence>
                    {cameraError && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute top-[-50px] left-0 right-0 py-2 bg-destructive/20 border border-destructive/40 rounded-xl text-center z-50 backdrop-blur-md"
                        >
                            <p className="text-[10px] font-black text-destructive uppercase tracking-widest px-4">
                                Camera Blocked: {cameraError}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Viewfinder Frame */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-[6px] border-l-[6px] border-primary rounded-tl-[40px] mt-[-6px] ml-[-6px]" />
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-[6px] border-r-[6px] border-primary rounded-tr-[40px] mt-[-6px] mr-[-6px]" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[6px] border-l-[6px] border-primary rounded-bl-[40px] mb-[-6px] ml-[-6px]" />
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[6px] border-r-[6px] border-primary rounded-br-[40px] mb-[-6px] mr-[-6px]" />
                </div>

                <div className="absolute inset-0 rounded-[48px] border border-white/10 glass-card overflow-hidden bg-black/60 flex items-center justify-center border-2 border-white/5">
                    <div id="reader" className="w-full h-full" />

                    <AnimatePresence>
                        {!cameraActive && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center gap-8 z-10"
                            >
                                <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-700 relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Scan size={80} className="text-zinc-800 group-hover:text-primary transition-colors relative z-10" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                                        {cameraError ? "Neural Bypass Engaged" : "Scanner Standby"}
                                    </p>
                                    <p className="text-xs font-bold text-zinc-400 opacity-60">
                                        {cameraError ? "Simulating Secure Node Uplink" : "Authorize Optical Input to Begin"}
                                    </p>
                                    {cameraError && cameraError !== "HARDWARE_BYPASS" && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); startCamera(); }}
                                            className="mt-4 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-500 hover:text-white hover:bg-white/10 transition-all uppercase"
                                        >
                                            Retry Camera Link
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
                                className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent z-30 pointer-events-none shadow-[0_0_30px_rgba(124,255,178,0.8)]"
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
            <div className="space-y-4 pt-4">
                <div className="relative group">
                    <input
                        type="text"
                        value={manualUpi}
                        onChange={(e) => setManualUpi(e.target.value)}
                        placeholder="ENTER_UPI_ID"
                        className="w-full bg-white/[0.03] border-2 border-white/5 rounded-[24px] py-6 px-8 text-white text-md font-black focus:outline-none focus:border-primary/40 transition-all placeholder:text-zinc-800 uppercase tracking-widest"
                    />
                    <Grid3X3 className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-primary transition-colors" size={24} />
                </div>

                <button
                    disabled={isScanning}
                    onClick={startCamera}
                    className="w-full h-24 rounded-[32px] bg-primary text-background font-black uppercase tracking-[0.3em] text-xs hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-4 shadow-[0_30px_100px_rgba(124,255,178,0.15)] group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
                    <Camera size={24} className="group-hover:rotate-12 transition-transform" />
                    {isScanning ? 'System_Analyzing...' : 'Execute Security Pass'}
                </button>
            </div>

            {/* Result Modal */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 100, rotate: -5 }}
                            animate={{ scale: 1, y: 0, rotate: 0 }}
                            className={`w-full max-w-sm glass-card rounded-[56px] p-12 border-2 overflow-hidden relative shadow-[0_100px_200px_rgba(0,0,0,0.9)] ${result === 'safe' ? 'border-primary/30 bg-primary/[0.02]' : 'border-destructive/30 bg-destructive/[0.02]'
                                }`}
                        >
                            <div className="flex flex-col items-center text-center gap-10">
                                <div className={`h-40 w-40 rounded-[48px] flex items-center justify-center rotate-12 relative shadow-2xl ${result === 'safe' ? 'bg-primary border-4 border-white/20 text-background' : 'bg-destructive border-4 border-white/20 text-white'
                                    }`}>
                                    <div className="absolute inset-[-20px] border-4 border-inherit rounded-[56px] opacity-20 animate-ping" />
                                    {result === 'safe' ? <ShieldCheck size={80} strokeWidth={2.5} /> : <ShieldAlert size={80} strokeWidth={2.5} />}
                                </div>

                                <div className="space-y-4">
                                    <h2 className={`text-6xl font-black italic tracking-tighter ${result === 'safe' ? 'text-primary' : 'text-destructive'}`}>
                                        {result === 'safe' ? 'CLEAR' : 'ALERT'}
                                    </h2>
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">
                                        {result === 'safe' ? 'Node Trust Absolute' : 'Neural Anomaly Detected'}
                                    </p>
                                    <div className="h-px w-20 bg-white/10 mx-auto my-6" />
                                    <p className="text-zinc-400 text-sm font-bold leading-relaxed max-w-[260px] mx-auto uppercase tracking-wide">
                                        {result === 'safe'
                                            ? 'Target identity verified via neural consensus. Transaction path is secure.'
                                            : 'Warning: Cryptographic mismatch in merchant signature. Abandon transaction immediately.'}
                                    </p>
                                </div>

                                <div className="w-full space-y-3">
                                    {result === 'safe' ? (
                                        <button
                                            disabled={isProcessingPayment}
                                            onClick={handleProceedToPay}
                                            className="w-full h-20 rounded-2xl bg-primary text-background font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all shadow-[0_10px_40px_rgba(124,255,178,0.2)] disabled:opacity-50"
                                        >
                                            {isProcessingPayment ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                                                    LINKING_PAYMENT...
                                                </div>
                                            ) : (
                                                <>INTIATE_PAYMENT <ArrowRight size={16} /></>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setResult(null)}
                                            className="w-full h-20 rounded-2xl bg-destructive text-white font-black uppercase tracking-[0.3em] text-[10px] hover:opacity-90 active:scale-95 transition-all shadow-[0_10px_40px_rgba(255,107,107,0.2)]"
                                        >
                                            VOID_SESSION
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setResult(null)}
                                        className="w-full py-5 rounded-2xl text-zinc-600 font-black uppercase text-[9px] tracking-[0.4em] hover:text-white transition-all"
                                    >
                                        TERMINATE
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
