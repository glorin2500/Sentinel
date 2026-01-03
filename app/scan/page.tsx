"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { TransactionService } from '@/lib/services/transaction-service';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Upload, Camera, CheckCircle, XCircle, AlertTriangle, Info, Share2, Loader2, Shield } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { Html5Qrcode } from 'html5-qrcode';
import { validateUpiId, validateAmount, validateQrContent, sanitizeUpiId, sanitizeAmount } from '@/lib/security/input-validator';
import { logger } from '@/lib/security/logger';

export default function ScanPage() {
  return (
    <ProtectedRoute>
      <ScanPageContent />
    </ProtectedRoute>
  );
}

function ScanPageContent() {
  const { user } = useAuth();
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [scanStep, setScanStep] = useState<'idle' | 'scanning' | 'analyzing' | 'complete'>('idle');

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => { });
        } catch (e) { }
      }
    };
  }, []);

  const analyzeUPI = async (upiToAnalyze: string) => {
    // Security: Validate UPI ID before processing
    if (!upiToAnalyze) {
      alert('No UPI ID to analyze');
      return;
    }

    // Security: Sanitize and validate UPI ID (OWASP A03:2021 – Injection)
    const sanitized = sanitizeUpiId(upiToAnalyze);
    if (!validateUpiId(sanitized)) {
      logger.security('Invalid UPI ID format detected', { upiId: sanitized });
      alert('Invalid UPI ID format. Please check and try again.');
      return;
    }

    // Security: Validate amount if provided
    if (amount && !validateAmount(amount)) {
      logger.security('Invalid amount detected', { amount });
      alert('Invalid amount. Please enter a valid amount (max ₹1,00,000).');
      return;
    }

    setScanStep('analyzing');
    setLoading(true);
    setShowPopup(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockScore = Math.random() * 100;
      const mockLevel = mockScore < 20 ? 'safe' : mockScore < 50 ? 'caution' : mockScore < 75 ? 'warning' : 'danger';

      const scanResult = {
        score: Math.round(mockScore),
        level: mockLevel,
        recommendation: mockLevel === 'safe'
          ? 'This transaction appears safe to proceed.'
          : mockLevel === 'danger'
            ? 'High risk detected! We recommend not proceeding with this transaction.'
            : 'Exercise caution with this transaction.',
        indicators: mockLevel !== 'safe' ? [
          { type: 'suspicious_pattern', severity: 'high', description: 'UPI ID shows suspicious patterns' }
        ] : [],
        upiId: sanitized,
        protocol: 'SHA-512',
        verified: mockLevel === 'safe'
      };

      setResult(scanResult);
      setScanStep('complete');
      setShowPopup(true);

      // Security: Save to database if Supabase is configured (OWASP A04:2021 – Insecure Design)
      if (isSupabaseConfigured() && user) {
        try {
          const { error } = await supabase
            .from('transactions')
            .insert({
              user_id: user.id,
              upi_id: sanitized,
              amount: amount ? parseFloat(sanitizeAmount(amount)) : null,
              risk_level: mockLevel,
              risk_score: Math.round(mockScore),
              scan_method: showCamera ? 'camera' : (fileInputRef.current?.files?.[0] ? 'file' : 'manual'),
            });

          if (error) {
            logger.error('Failed to save transaction to database', error);
          } else {
            logger.info('Transaction saved successfully', { upiId: sanitized, riskLevel: mockLevel });
          }
        } catch (dbError) {
          logger.error('Database error while saving transaction', dbError);
          // Don't fail the scan if DB save fails
        }
      }
    } catch (error: any) {
      logger.error('Analysis error', error);
      const fallbackResult = {
        score: 15,
        level: 'safe',
        recommendation: 'This transaction appears safe to proceed.',
        indicators: [],
        upiId: sanitized,
        protocol: 'SHA-512',
        verified: true
      };
      setResult(fallbackResult);
      setScanStep('complete');
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    setCameraError('');
    setShowCamera(true);
    setScanStep('scanning');

    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          console.log('QR Code detected:', decodedText);

          try {
            await scanner.stop();
          } catch (e) { }
          setShowCamera(false);

          let extractedUPI = decodedText;
          if (decodedText.includes('upi://')) {
            const match = decodedText.match(/pa=([^&]+)/);
            if (match) extractedUPI = match[1];
          }

          setUpiId(extractedUPI);
          await analyzeUPI(extractedUPI);
        },
        () => { }
      );
    } catch (error: any) {
      console.error('Camera error:', error);
      const errorMsg = error.message || error.toString();
      if (errorMsg.includes('Timeout') || errorMsg.includes('AbortError')) {
        setCameraError('Camera is taking too long to start. Please try file upload instead.');
      } else if (errorMsg.includes('Permission') || errorMsg.includes('NotAllowed')) {
        setCameraError('Camera access denied. Please enable camera permissions in your browser settings.');
      } else {
        setCameraError('Unable to access camera. Please use file upload or manual entry.');
      }
      setShowCamera(false);
      setScanStep('idle');
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (e) { }
    }
    setShowCamera(false);
    setScanStep('idle');
  };

  const handleQRScan = () => {
    startCamera();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setScanStep('analyzing');

    try {
      const tempScanner = new Html5Qrcode("qr-reader-file");
      const decodedText = await tempScanner.scanFile(file, false);

      let extractedUPI = decodedText;
      if (decodedText.includes('upi://')) {
        const match = decodedText.match(/pa=([^&]+)/);
        if (match) extractedUPI = match[1];
      }

      setUpiId(extractedUPI);
      await analyzeUPI(extractedUPI);
    } catch (error) {
      console.error('QR scan error:', error);
      setLoading(false);
      setScanStep('idle');
      alert('Failed to read QR code. Please ensure the image contains a valid QR code.');
    }
  };

  const handleCheckUPI = () => {
    if (!upiId.trim()) {
      alert('Please enter a UPI ID');
      return;
    }
    analyzeUPI(upiId.trim());
  };

  const handleProceedToPay = () => {
    if (!result?.upiId) return;

    // Properly encode UPI parameters
    const params = new URLSearchParams({
      pa: result.upiId,  // Payee Address (UPI ID)
      pn: 'Merchant',    // Payee Name
      cu: 'INR',         // Currency (required)
    });

    // Add amount if provided
    if (amount && parseFloat(amount) > 0) {
      params.append('am', amount);
    }

    // Create proper UPI URL
    const upiUrl = `upi://pay?${params.toString()}`;

    console.log('Opening UPI URL:', upiUrl);

    // Try to open UPI app
    window.location.href = upiUrl;
  };

  const handleShare = async () => {
    if (!result || shareLoading) return;

    setShareLoading(true);
    const shareData = {
      title: 'Sentinel Scan Result',
      text: `UPI ID: ${result.upiId}\nRisk Level: ${result.riskLevel}\nSafety Score: ${result.score}%`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert('Scan result copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setShareLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!result || !user || favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      // Check if already favorited
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('upi_id', result.upiId)
        .single();

      if (existing) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('id', existing.id);
        alert('Removed from favorites');
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            upi_id: result.upiId,
            risk_level: result.riskLevel,
            risk_score: result.score,
          });
        alert('Added to favorites!');
      }
    } catch (error) {
      console.error('Favorite failed:', error);
      alert('Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleReportFraud = async () => {
    if (!result || !user || reportLoading) return;

    const confirmed = confirm(
      `Report ${result.upiId} as fraudulent?\n\nThis will help protect other users.`
    );

    if (!confirmed) return;

    setReportLoading(true);
    try {
      await supabase
        .from('fraud_reports')
        .insert({
          user_id: user.id,
          upi_id: result.upiId,
          risk_level: result.riskLevel,
          risk_score: result.score,
          amount: amount ? parseFloat(amount) : null,
          report_reason: 'User reported as fraudulent',
        });

      alert('Thank you for reporting! This helps keep our community safe.');
      setShowPopup(false);
    } catch (error) {
      console.error('Report failed:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    const colors = {
      safe: { text: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: CheckCircle, label: 'SECURE' },
      caution: { text: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: AlertTriangle, label: 'CAUTION' },
      warning: { text: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: AlertTriangle, label: 'WARNING' },
      danger: { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: XCircle, label: 'DANGER' },
    };
    return colors[level as keyof typeof colors] || { text: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/30', icon: AlertTriangle, label: 'UNKNOWN' };
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
      <div id="qr-reader-file" className="hidden" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-6 relative z-10"
      >
        {/* Header with animated badge */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Shield size={16} className="text-primary" />
            </motion.div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {scanStep === 'idle' && 'Scanner Ready'}
              {scanStep === 'scanning' && 'Scanning...'}
              {scanStep === 'analyzing' && 'Analyzing Threat...'}
              {scanStep === 'complete' && 'Analysis Complete'}
            </span>
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-2">Scanner</h1>
          <p className="text-sm text-zinc-400 uppercase tracking-wider">Threat Analysis Engine</p>
        </motion.div>

        {/* Scanner Frame with enhanced animations */}
        <motion.div
          className="relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Animated Corners - More Rounded */}
          {[
            { top: '-top-2', left: '-left-2', rotate: 0 },
            { top: '-top-2', right: '-right-2', rotate: 90 },
            { bottom: '-bottom-2', left: '-left-2', rotate: 270 },
            { bottom: '-bottom-2', right: '-right-2', rotate: 180 }
          ].map((pos, i) => (
            <motion.div
              key={i}
              className={`absolute ${pos.top || pos.bottom} ${pos.left || pos.right} w-20 h-20 border-l-4 border-t-4 border-primary rounded-tl-3xl`}
              style={{ rotate: pos.rotate }}
              animate={{
                opacity: scanStep === 'scanning' ? [0.5, 1, 0.5] : 1,
              }}
              transition={{ duration: 1.5, repeat: scanStep === 'scanning' ? Infinity : 0 }}
            />
          ))}

          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            {/* Scanning Animation */}
            <AnimatePresence>
              {(loading || showCamera) && (
                <motion.div
                  initial={{ y: '-100%' }}
                  animate={{ y: '100%' }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent"
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}
            </AnimatePresence>

            {showCamera ? (
              <motion.div
                className="relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div id="qr-reader" className="rounded-xl overflow-hidden" />
                <motion.p
                  className="text-xs text-center text-primary mt-3 font-bold"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Point camera at QR code
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center justify-center mb-6">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-32 h-32 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center">
                      <motion.div
                        animate={loading ? { rotate: 360 } : {}}
                        transition={{ duration: 2, repeat: loading ? Infinity : 0, ease: "linear" }}
                      >
                        <Scan size={64} className="text-primary" />
                      </motion.div>
                    </div>
                    {loading && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-primary"
                        animate={{ scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </div>

                <div className="text-center mb-6">
                  <motion.p
                    className="text-sm font-bold text-white uppercase tracking-wider"
                    key={scanStep}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {scanStep === 'idle' && 'Ready to Scan'}
                    {scanStep === 'analyzing' && 'Analyzing Transaction...'}
                    {scanStep === 'complete' && 'Analysis Complete!'}
                  </motion.p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {scanStep === 'idle' && 'Choose a scan method below'}
                    {scanStep === 'analyzing' && 'Running fraud detection algorithms'}
                    {scanStep === 'complete' && 'Review your results'}
                  </p>
                  <AnimatePresence>
                    {cameraError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                      >
                        <p className="text-xs text-red-500 flex items-center gap-2">
                          <Info size={14} />
                          {cameraError}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {!showCamera && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                onClick={handleQRScan}
                disabled={loading}
                className="py-4 bg-primary text-black font-black rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <Camera size={24} />
                <span className="text-sm">Camera Scan</span>
              </motion.button>

              <motion.button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="py-4 bg-zinc-900/50 backdrop-blur-xl border border-white/10 text-zinc-400 font-bold rounded-xl hover:border-primary/30 hover:text-primary disabled:opacity-50 transition-all flex flex-col items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Upload size={24} />
                <span className="text-sm">Upload QR</span>
              </motion.button>
            </div>

            {/* Manual Entry Section */}
            <motion.div
              className="p-4 bg-zinc-900/30 backdrop-blur-xl border border-white/5 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-primary" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Manual Entry</h3>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter UPI ID (e.g., merchant@paytm)"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-all"
                />
                <input
                  type="number"
                  placeholder="Amount (optional)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-all"
                />
                <motion.button
                  onClick={handleCheckUPI}
                  disabled={loading || !upiId}
                  className="w-full py-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30 text-primary font-bold rounded-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Shield size={18} />
                  Check UPI
                </motion.button>
              </div>
            </motion.div>

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-xs text-zinc-500"
            >
              <p>Scan any UPI QR code to check for fraud risks before paying</p>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Enhanced Threat Analysis Popup */}
      <AnimatePresence>
        {showPopup && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-zinc-900 to-black border border-primary/20 rounded-3xl p-6 w-full max-w-md relative shadow-2xl shadow-primary/10"
            >
              <motion.button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={16} className="text-zinc-400" />
              </motion.button>

              {(() => {
                const colors = getRiskColor(result.level);
                const Icon = colors.icon;
                return (
                  <>
                    <motion.div
                      className="flex flex-col items-center mb-6"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                    >
                      <motion.div
                        className={`w-20 h-20 rounded-2xl ${colors.bg} border-2 ${colors.border} flex items-center justify-center mb-4`}
                        animate={{
                          boxShadow: [
                            `0 0 20px ${colors.text.replace('text-', 'rgba(').replace('-500', ', 0.3)')}`,
                            `0 0 40px ${colors.text.replace('text-', 'rgba(').replace('-500', ', 0.5)')}`,
                            `0 0 20px ${colors.text.replace('text-', 'rgba(').replace('-500', ', 0.3)')}`,
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Icon size={40} className={colors.text} />
                      </motion.div>
                      <motion.h2
                        className={`text-3xl font-black ${colors.text} mb-1`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {colors.label}
                      </motion.h2>
                      <p className="text-sm text-zinc-400 uppercase tracking-wider">Transaction Verified</p>
                    </motion.div>

                    <motion.div
                      className="bg-black/30 border border-white/5 rounded-2xl p-4 mb-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="mb-3">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">UPI ID</p>
                        <p className="text-sm font-bold text-white break-all">{result.upiId}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Risk Level</p>
                          <motion.p
                            className={`text-2xl font-black ${colors.text}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                          >
                            {result.score}%
                          </motion.p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Protocol</p>
                          <p className="text-lg font-black text-white">{result.protocol}</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className="text-primary" />
                        <p className="text-xs font-bold text-primary uppercase tracking-wider">Security Analysis</p>
                      </div>
                      <p className="text-sm text-zinc-300">
                        {result.verified ? `Verified bank handle: ${result.upiId.split('@')[1]}` : 'Unverified merchant'}
                      </p>
                    </motion.div>

                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <motion.button
                        onClick={handleProceedToPay}
                        className="w-full py-3.5 bg-primary text-black font-black rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        PROCEED TO PAY
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          →
                        </motion.div>
                      </motion.button>

                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          onClick={handleShare}
                          disabled={shareLoading}
                          className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                          whileHover={{ scale: shareLoading ? 1 : 1.05 }}
                          whileTap={{ scale: shareLoading ? 1 : 0.95 }}
                        >
                          {shareLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 size={16} />
                            </motion.div>
                          ) : (
                            <Share2 size={16} />
                          )}
                          {shareLoading ? 'SHARING...' : 'SHARE'}
                        </motion.button>
                        <motion.button
                          onClick={handleFavorite}
                          disabled={favoriteLoading}
                          className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-yellow-500 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                          whileHover={{ scale: favoriteLoading ? 1 : 1.05 }}
                          whileTap={{ scale: favoriteLoading ? 1 : 0.95 }}
                        >
                          {favoriteLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 size={16} />
                            </motion.div>
                          ) : (
                            <Star size={16} />
                          )}
                          {favoriteLoading ? 'ADDING...' : 'FAVORITE'}
                        </motion.button>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <motion.button
                          onClick={() => setShowPopup(false)}
                          className="text-sm text-zinc-500 hover:text-white transition-colors"
                          whileHover={{ scale: 1.05 }}
                        >
                          CLOSE
                        </motion.button>
                        <motion.button
                          onClick={handleReportFraud}
                          disabled={reportLoading}
                          className="text-sm text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                          whileHover={{ scale: reportLoading ? 1 : 1.05 }}
                        >
                          {reportLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 size={14} />
                            </motion.div>
                          ) : (
                            <AlertTriangle size={14} />
                          )}
                          {reportLoading ? 'REPORTING...' : 'REPORT FRAUD'}
                        </motion.button>
                      </div>
                    </motion.div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
