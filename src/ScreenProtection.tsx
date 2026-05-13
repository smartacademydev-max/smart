import { Box, CircularProgress, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector } from './store/hook';

type Props = {
  children?: React.ReactNode;
};

const SIZE_THRESHOLD = 160;
const TIMING_THRESHOLD = 80;
// Below this viewport width treat the device as mobile/tablet and skip
// protection entirely — soft keyboards shift innerHeight and false-trigger it.
const MOBILE_BREAKPOINT = 1200;


const triggerDebugger = new Function('debugger');

const ScreenProtection: React.FC<Props> = ({ children }) => {
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const devToolsRef = useRef(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT,
  );
  const { mode } = useAppSelector((state) => state.theme);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      if (devToolsRef.current) {
        devToolsRef.current = false;
        setDevToolsOpen(false);
      }
      return;
    }

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleSelectStart = (e: Event) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('').catch(() => { });
      }
      // Block Ctrl/Cmd + U (view-source), S (save), P (print)
      if ((e.ctrlKey || e.metaKey) && ['u', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleKeyDown);

    // ── Sync state helper ─────────────────────────────────────────────────
    const markOpen = () => {
      if (!devToolsRef.current) {
        devToolsRef.current = true;
        setDevToolsOpen(true);
      }
    };
    const markClosed = () => {
      if (devToolsRef.current) {
        devToolsRef.current = false;
        setDevToolsOpen(false);
      }
    };

    // ── Continuous debugger trap ──────────────────────────────────────────
    // Runs via Function constructor so it can't be statically stripped.
    // When DevTools is open with breakpoints active, the inspector freezes
    // in a tight loop — making the panel effectively unusable.
    const debuggerTrap = setInterval(() => {
      try { triggerDebugger(); } catch { /* noop */ }
    }, 50);

    // ── Docked DevTools size detection ───────────────────────────────────
    // DevTools docked to side/bottom increases outer vs inner dimensions.
    const sizeCheck = setInterval(() => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > SIZE_THRESHOLD || heightDiff > SIZE_THRESHOLD) {
        markOpen();
      } else {
        // Only clear if timing check also says closed
        if (!devToolsRef.current) markClosed();
      }
    }, 500);


    const timingCheck = setInterval(() => {
      const t0 = performance.now();
      try { triggerDebugger(); } catch { /* noop */ }
      const elapsed = performance.now() - t0;
      if (elapsed > TIMING_THRESHOLD) {
        markOpen();
      } else {
        markClosed();
      }
    }, 1000);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(debuggerTrap);
      clearInterval(sizeCheck);
      clearInterval(timingCheck);
    };
  }, [isMobile]);

  return (
    <>
      {children}

      {devToolsOpen && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            bgcolor: 'background.default',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
          }}
        >
          <img
            src={mode === 'dark' ? '/logo.svg' : '/logo-dark.svg'}
            alt="SMART LMS"
            style={{ height: 52, objectFit: 'contain' }}
          />
          <CircularProgress size={36} thickness={3.5} />
          <Typography variant="body2" color="text.secondary">
            Loading, please wait…
          </Typography>
        </Box>
      )}
    </>
  );
};

export default ScreenProtection;
