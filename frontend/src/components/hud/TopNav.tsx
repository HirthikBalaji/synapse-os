import React from 'react';
import { 
  Zap, 
  Volume2, 
  VolumeX, 
  Radio, 
  Activity, 
  RefreshCw, 
  AlertTriangle,
  Cpu
} from 'lucide-react';
import { sound } from '../../services/soundEffects';

interface TopNavProps {
  wsConnected: boolean;
  latencyMs: number;
  isOverclocked: boolean;
  isAnomaly: boolean;
  coherence: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onCalibrate: () => void;
  onToggleOverclock: () => void;
  onTriggerAnomaly: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  wsConnected,
  latencyMs,
  isOverclocked,
  isAnomaly,
  coherence,
  isMuted,
  onToggleMute,
  onCalibrate,
  onToggleOverclock,
  onTriggerAnomaly,
}) => {
  return (
    <header className="relative w-full border-b border-synapse-border bg-synapse-dark/90 backdrop-blur-md px-4 py-3 z-30 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & System Status */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-synapse-cyan/20 to-synapse-purple/30 border border-synapse-cyan/40 shadow-cyber">
          <Activity className="w-5 h-5 text-synapse-cyan animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-widest bg-gradient-to-r from-synapse-cyan via-white to-synapse-violet bg-clip-text text-transparent">
              SYNAPSE-OS
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-synapse-cyan/15 text-synapse-cyan border border-synapse-cyan/30">
              QUANTUM v2.4
            </span>
          </div>
          <p className="text-[11px] font-mono text-gray-400">
            NEURAL-DIGITAL INTERFACE & AUTONOMOUS MESH COMMAND
          </p>
        </div>
      </div>

      {/* Real-time Telemetry Status Badges */}
      <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
        {/* WebSocket Bridge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-synapse-border bg-synapse-card">
          <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-synapse-emerald shadow-cyber-emerald' : 'bg-synapse-danger animate-ping'}`} />
          <span className="text-gray-300">{wsConnected ? 'NEURAL LINK' : 'DISCONNECTED'}</span>
          <span className="text-[10px] text-synapse-cyan">({latencyMs}ms)</span>
        </div>

        {/* Operating State */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-synapse-border bg-synapse-card">
          <Cpu className="w-3.5 h-3.5 text-synapse-cyan" />
          <span className="text-gray-400">STATE:</span>
          <span className={`font-bold ${isAnomaly ? 'text-synapse-danger animate-pulse' : isOverclocked ? 'text-synapse-violet' : 'text-synapse-emerald'}`}>
            {isAnomaly ? 'ANOMALY DETECTED' : isOverclocked ? 'OVERCLOCKED' : 'NOMINAL'}
          </span>
        </div>

        {/* Entanglement Metric */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-synapse-border bg-synapse-card">
          <Radio className="w-3.5 h-3.5 text-synapse-cyan" />
          <span className="text-gray-400">COHERENCE:</span>
          <span className="text-synapse-cyan font-bold">{coherence.toFixed(1)}%</span>
        </div>
      </div>

      {/* Control Actions & Audio */}
      <div className="flex items-center gap-2">
        {/* Calibrate Button */}
        <button
          onClick={() => {
            sound.playClick();
            onCalibrate();
          }}
          title="Realign quantum phase & restore coherence"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-synapse-cyan/40 bg-synapse-cyan/10 hover:bg-synapse-cyan/20 text-synapse-cyan hover:shadow-cyber text-xs font-mono font-semibold transition-all active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>CALIBRATE</span>
        </button>

        {/* Overclock Toggle Button */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleOverclock();
          }}
          title="Toggle high-frequency overclock"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all active:scale-95 ${
            isOverclocked
              ? 'border-synapse-violet bg-synapse-violet/30 text-white shadow-cyber-magenta'
              : 'border-synapse-border bg-synapse-card hover:bg-synapse-cardHover text-gray-300'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-synapse-violet" />
          <span>{isOverclocked ? 'OVERCLOCK [ON]' : 'OVERCLOCK'}</span>
        </button>

        {/* Anomaly Test Injection */}
        <button
          onClick={() => {
            sound.playClick();
            onTriggerAnomaly();
          }}
          title="Inject test quantum decoherence spike"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-synapse-amber/40 bg-synapse-amber/10 hover:bg-synapse-amber/20 text-synapse-amber text-xs font-mono transition-all active:scale-95"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ANOMALY</span>
        </button>

        {/* Mute / Unmute Audio */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleMute();
          }}
          title={isMuted ? 'Unmute cybernetic audio synthesizer' : 'Mute audio'}
          className={`p-2 rounded-lg border text-xs transition-all active:scale-95 ${
            isMuted
              ? 'border-synapse-border bg-synapse-card text-gray-500'
              : 'border-synapse-cyan/40 bg-synapse-cyan/15 text-synapse-cyan shadow-cyber'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
