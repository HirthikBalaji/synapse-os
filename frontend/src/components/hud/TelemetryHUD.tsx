import React, { useEffect, useRef } from 'react';
import { Activity, Radio, CheckCircle, Clock } from 'lucide-react';
import type { TelemetryMetrics, Task } from '../../types';

interface TelemetryHUDProps {
  telemetry: TelemetryMetrics | null;
  tasks: Task[];
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({ telemetry, tasks }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveHistoryRef = useRef<{ alpha: number[]; beta: number[]; gamma: number[] }>({
    alpha: [],
    beta: [],
    gamma: [],
  });

  // Oscilloscope canvas rendering
  useEffect(() => {
    if (!telemetry) return;
    const history = waveHistoryRef.current;
    const maxPoints = 80;

    history.alpha.push(telemetry.alpha_wave);
    history.beta.push(telemetry.beta_wave);
    history.gamma.push(telemetry.gamma_wave);

    if (history.alpha.length > maxPoints) {
      history.alpha.shift();
      history.beta.shift();
      history.gamma.shift();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw wave helper
    const drawWave = (data: number[], color: string, glow: string, baselineY: number, scale: number) => {
      if (data.length < 2) return;
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 6;

      const stepX = width / (maxPoints - 1);
      data.forEach((val, i) => {
        const x = i * stepX;
        const y = baselineY - (val - 50) * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();
    };

    // Draw Alpha (Cyan), Beta (Emerald), Gamma (Violet)
    drawWave(history.alpha, '#00f3ff', 'rgba(0, 243, 255, 0.6)', height * 0.3, 0.45);
    drawWave(history.beta, '#00ff88', 'rgba(0, 255, 136, 0.6)', height * 0.5, 0.35);
    drawWave(history.gamma, '#9d4edd', 'rgba(157, 78, 221, 0.6)', height * 0.72, 0.3);
  }, [telemetry]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Wave Oscilloscope Panel */}
      <div className="p-3 rounded-xl border border-synapse-border bg-synapse-card backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-synapse-cyan" />
            <h3 className="text-xs font-mono font-bold text-synapse-cyan uppercase">
              SYNAPTIC EEG OSCILLOSCOPE (ALPHA / BETA / GAMMA)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-synapse-cyan">
              <span className="w-1.5 h-1.5 rounded-full bg-synapse-cyan" /> ALPHA
            </span>
            <span className="flex items-center gap-1 text-synapse-emerald">
              <span className="w-1.5 h-1.5 rounded-full bg-synapse-emerald" /> BETA
            </span>
            <span className="flex items-center gap-1 text-synapse-violet">
              <span className="w-1.5 h-1.5 rounded-full bg-synapse-violet" /> GAMMA
            </span>
          </div>
        </div>

        {/* Canvas Display */}
        <div className="w-full bg-black/60 rounded-lg p-2 border border-white/5 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={600}
            height={130}
            className="w-full h-[120px] block"
          />
          <div className="absolute top-1 right-2 text-[9px] font-mono text-gray-500">
            SAMPLING: 2.5 GHz REAL-TIME
          </div>
        </div>

        {/* Key Metrics Bar */}
        {telemetry && (
          <div className="grid grid-cols-4 gap-2 mt-3 text-center">
            <div className="p-2 rounded bg-synapse-dark border border-white/5">
              <div className="text-[10px] font-mono text-gray-400">COHERENCE</div>
              <div className="text-xs font-mono font-bold text-synapse-cyan">
                {telemetry.quantum_coherence}%
              </div>
            </div>
            <div className="p-2 rounded bg-synapse-dark border border-white/5">
              <div className="text-[10px] font-mono text-gray-400">ENTANGLEMENT</div>
              <div className="text-xs font-mono font-bold text-synapse-emerald">
                {telemetry.entanglement_stability}%
              </div>
            </div>
            <div className="p-2 rounded bg-synapse-dark border border-white/5">
              <div className="text-[10px] font-mono text-gray-400">SYNAPTIC FLUX</div>
              <div className="text-xs font-mono font-bold text-synapse-violet">
                {telemetry.synaptic_flux} GHz
              </div>
            </div>
            <div className="p-2 rounded bg-synapse-dark border border-white/5">
              <div className="text-[10px] font-mono text-gray-400">ANOMALY DEV</div>
              <div className={`text-xs font-mono font-bold ${telemetry.anomaly_score > 0.5 ? 'text-synapse-danger' : 'text-gray-300'}`}>
                {telemetry.anomaly_score} σ
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task & Cognitive Pipeline Stream */}
      <div className="p-3 rounded-xl border border-synapse-border bg-synapse-card backdrop-blur-md flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-synapse-cyan" />
            <h3 className="text-xs font-mono font-bold text-synapse-cyan uppercase">
              NEURAL REASONING & CONSENSUS STREAM
            </h3>
          </div>
          <span className="text-[10px] font-mono text-gray-400">
            {tasks.length} DIRECTIVES LOGGED
          </span>
        </div>

        {/* Task Cards Scroll Container */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[300px]">
          {tasks.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs font-mono text-gray-500 py-8">
              Awaiting neural task dispatch directives...
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-2.5 rounded-lg border border-white/10 bg-black/40 text-xs font-mono"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-synapse-cyan font-bold">[{task.agent_id}]</span>
                    <span className="text-gray-400 truncate max-w-[200px]">{task.id}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {task.status === 'COMPLETED' ? (
                      <span className="flex items-center gap-1 text-synapse-emerald text-[10px]">
                        <CheckCircle className="w-3 h-3" /> COMPLETED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-synapse-cyan text-[10px] animate-pulse">
                        <Clock className="w-3 h-3" /> PROCESSING
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-white text-[11px] font-mono mb-2">
                  &quot;{task.prompt}&quot;
                </div>

                {/* Reasoning Steps */}
                {task.reasoning_steps && task.reasoning_steps.length > 0 && (
                  <div className="space-y-1 pl-2 border-l border-synapse-cyan/30 text-[10px] text-gray-300">
                    {task.reasoning_steps.map((step) => (
                      <div key={step.step_number} className="flex items-start gap-1.5">
                        <span className="text-synapse-violet font-bold">
                          [PHASE {step.step_number}]:
                        </span>
                        <span className="text-gray-300">{step.detail}</span>
                      </div>
                    ))}
                  </div>
                )}

                {task.result && (
                  <div className="mt-2 p-1.5 rounded bg-synapse-cyan/10 border border-synapse-cyan/20 text-synapse-cyan text-[10px]">
                    ✓ {task.result}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
