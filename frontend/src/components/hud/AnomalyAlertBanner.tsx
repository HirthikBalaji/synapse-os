import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { sound } from '../../services/soundEffects';

interface AnomalyAlertBannerProps {
  isAnomaly: boolean;
  onContain: () => void;
}

export const AnomalyAlertBanner: React.FC<AnomalyAlertBannerProps> = ({ isAnomaly, onContain }) => {
  if (!isAnomaly) return null;

  return (
    <div className="w-full bg-gradient-to-r from-red-950/80 via-red-900/60 to-red-950/80 border-b border-red-500/50 px-4 py-2 text-white flex flex-wrap items-center justify-between gap-3 animate-pulse shadow-[0_4px_25px_rgba(255,51,102,0.35)] z-20">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-full bg-red-600/30 border border-red-400">
          <ShieldAlert className="w-4 h-4 text-red-400 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black tracking-widest text-red-400">
              [CRITICAL ALERT] QUANTUM DECOHERENCE VECTOR DETECTED
            </span>
          </div>
          <p className="text-[11px] font-mono text-red-200/80">
            Subspace phase fluctuation exceeding safety delta. Automatic containment protocols standing by.
          </p>
        </div>
      </div>

      <button
        onClick={() => {
          sound.playCalibrate();
          onContain();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-400 bg-red-500/20 hover:bg-red-500/40 text-red-200 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(255,0,0,0.4)] active:scale-95"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-red-300" />
        <span>ENGAGE CONTAINMENT PROTOCOL</span>
      </button>
    </div>
  );
};
