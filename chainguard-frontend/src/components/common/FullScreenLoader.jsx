import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FullScreenLoader({ onLoadComplete, onUseMockData }) {
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Connecting to ChainGuard Network...');
  const [isWarming, setIsWarming] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const countdownRef = useRef(null);
  const progressRef = useRef(null);
  const mockLoadedRef = useRef(false); // ← prevents double-trigger

  const messages = [
    'Connecting to Supply Chain Network...',
    'Loading Shipment Intelligence...',
    'Calibrating Disruption Models...',
    'Fetching Live Weather Data...',
    'Almost ready...'
  ];

  useEffect(() => {
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setStatusMsg(messages[msgIndex]);
    }, 2000);

    // Progress bar: 0 → 85% over 10 seconds
    let prog = 0;
    progressRef.current = setInterval(() => {
      prog += 1;
      if (prog <= 85) setProgress(prog);
    }, 120);

    // After 15 seconds, show warming message + start countdown
    const warmingTimer = setTimeout(() => {
      setIsWarming(true);
      setCountdown(5); // Give 5 seconds extra countdown
    }, 15000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressRef.current);
      clearTimeout(warmingTimer);
    };
  }, []);

  // Handle countdown — THIS is the fix for the stuck screen
  useEffect(() => {
    if (countdown === null) return;

    if (countdown <= 0) {
      // ← CRITICAL FIX: only run once, then actually load mock data
      if (!mockLoadedRef.current) {
        mockLoadedRef.current = true;
        clearInterval(countdownRef.current);
        setProgress(100);
        setStatusMsg('Loading demo data...');
        
        // Short delay so user sees 100% before entering dashboard
        setTimeout(() => {
          onUseMockData && onUseMockData();   // ← tells App.jsx to use mock data
          onLoadComplete && onLoadComplete(); // ← enters the dashboard
        }, 600);
      }
      return;
    }

    countdownRef.current = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(countdownRef.current);
  }, [countdown, onUseMockData, onLoadComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg-void, #080B10)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '24px',
      zIndex: 9999
    }}>
      {/* Logo */}
      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px',
                    color: '#00D4AA', fontWeight: 700, marginBottom: '8px' }}>
        ⛓️ ChainGuard
      </div>

      {/* Truck SVG animation — kept from original */}
      <svg viewBox="0 0 300 80" width="300" height="80">
        <line x1="0" y1="62" x2="300" y2="62"
          stroke="#2A3040" strokeWidth="2" strokeDasharray="12,8"/>
        <line x1="0" y1="62" x2="300" y2="62"
          stroke="#00D4AA" strokeWidth="1.5"
          strokeDasharray="8,16" opacity="0.4"
          style={{ animation: 'flow-dash 1.2s linear infinite' }}/>
        <g style={{ animation: 'truck-move 3s ease-in-out infinite' }}>
          <rect x="40" y="28" width="70" height="32" rx="3" fill="#00D4AA" opacity="0.9"/>
          <rect x="108" y="20" width="30" height="40" rx="4" fill="#00B4D8"/>
          <rect x="113" y="24" width="18" height="14" rx="2" fill="#080B10" opacity="0.7"/>
          <circle cx="68" cy="62" r="10" fill="#21262D" stroke="#484F58" strokeWidth="2"/>
          <circle cx="68" cy="62" r="5" fill="#2A3040"/>
          <circle cx="118" cy="62" r="10" fill="#21262D" stroke="#484F58" strokeWidth="2"/>
          <circle cx="118" cy="62" r="5" fill="#2A3040"/>
        </g>
      </svg>

      {/* Status message */}
      <AnimatePresence mode="wait">
        {!isWarming ? (
          <motion.p key={statusMsg}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px',
                     color: '#8B949E', margin: 0 }}>
            {statusMsg}
          </motion.p>
        ) : (
          <motion.div key="warming"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center' }}>
            <p style={{ color: '#FFB300', fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '13px', margin: '0 0 4px' }}>
              ⚠ Backend is warming up...
            </p>
            {countdown !== null && countdown > 0 && (
              <p style={{ color: '#8B949E', fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '12px', margin: 0 }}>
                Loading demo data in {countdown}...
              </p>
            )}
            {countdown === 0 && (
              <p style={{ color: '#00D4AA', fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '12px', margin: 0 }}>
                ✓ Loading demo data...
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div style={{ width: '400px', maxWidth: '80vw', height: '3px',
                    background: '#21262D', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ height: '100%', background: 'var(--accent-gradient, #00D4AA)',
                   borderRadius: '2px' }}
        />
      </div>

      {/* Progress percentage */}
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
                  color: '#484F58', margin: '-16px 0 0' }}>
        {progress}%
      </p>
    </div>
  );
}
