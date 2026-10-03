import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles,
  Thermometer,
  Layers
} from 'lucide-react';
import type { Agent } from '../../types';
import { sound } from '../../services/soundEffects';

interface AgentMeshPanelProps {
  agents: Agent[];
  onDispatch: (prompt: string, agentId?: string, priority?: string) => void;
  onRebootAgent: (agentId: string) => void;
}

const PRESET_DIRECTIVES = [
  "Execute lattice-based zero-knowledge verification across subspace channels",
  "Conduct deep spectral anomaly scan for phase decoherence mitigation",
  "Synthesize multi-agent GHZ entanglement consensus matrix",
  "Reconfigure topological qubit routing table for sub-millisecond latency"
];

export const AgentMeshPanel: React.FC<AgentMeshPanelProps> = ({
  agents,
  onDispatch,
  onRebootAgent,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('auto');
  const [prompt, setPrompt] = useState<string>('');
  const [priority, setPriority] = useState<string>('NORMAL');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSubmitting) return;

    sound.playDispatch();
    setIsSubmitting(true);
    onDispatch(prompt.trim(), selectedAgentId === 'auto' ? undefined : selectedAgentId, priority);
    setPrompt('');
    setTimeout(() => setIsSubmitting(false), 500);
  };

  const handlePresetClick = (preset: string) => {
    setPrompt(preset);
    sound.playClick();
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Mesh Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-synapse-cyan" />
          <h2 className="text-xs font-mono font-bold tracking-wider text-synapse-cyan uppercase">
            AUTONOMOUS AGENT MESH ROSTER ({agents.length} NODES)
          </h2>
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          BELL-STATE GHZ MESH // ACTIVE
        </span>
      </div>

      {/* Agents Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {agents.map((agent) => {
          const isBusy = agent.status === 'COMPUTING';
          return (
            <div
              key={agent.id}
              className={`p-3 rounded-xl border transition-all duration-300 backdrop-blur-md relative overflow-hidden ${
                isBusy
                  ? 'border-synapse-cyan bg-synapse-cyan/10 shadow-cyber'
                  : 'border-synapse-border bg-synapse-card hover:bg-synapse-cardHover'
              }`}
            >
              {/* Agent Title & Status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white tracking-wide">
                      {agent.name}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        isBusy
                          ? 'bg-synapse-cyan/20 text-synapse-cyan animate-pulse border border-synapse-cyan/40'
                          : 'bg-synapse-emerald/20 text-synapse-emerald border border-synapse-emerald/30'
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-synapse-violet">
                    {agent.role}
                  </p>
                </div>

                {/* Reboot button */}
                <button
                  onClick={() => {
                    sound.playClick();
                    onRebootAgent(agent.id);
                  }}
                  title="Cold reboot agent node"
                  className="p-1 rounded text-gray-400 hover:text-synapse-cyan hover:bg-synapse-cyan/10 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Specialization tag */}
              <div className="text-[10px] font-mono text-gray-400 mb-2 truncate">
                <span className="text-gray-500">SPEC:</span> {agent.specialization}
              </div>

              {/* Current Objective */}
              <div className="text-[10px] font-mono bg-black/40 p-1.5 rounded border border-white/5 text-gray-300 mb-2 truncate">
                <span className="text-synapse-cyan font-bold">&gt; </span>
                {agent.current_objective || 'Superposition standby'}
              </div>

              {/* Neural Load Bar */}
              <div className="flex flex-col gap-1 mb-2">
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>NEURAL LOAD</span>
                  <span className={agent.neural_load > 80 ? 'text-synapse-danger font-bold' : 'text-gray-300'}>
                    {agent.neural_load.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      agent.neural_load > 80
                        ? 'bg-gradient-to-r from-synapse-amber to-synapse-danger'
                        : isBusy
                        ? 'bg-gradient-to-r from-synapse-cyan to-synapse-violet'
                        : 'bg-synapse-cyan'
                    }`}
                    style={{ width: `${Math.min(100, agent.neural_load)}%` }}
                  />
                </div>
              </div>

              {/* Metric Badges Footer */}
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-1 border-t border-white/5">
                <div className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-synapse-cyan" />
                  <span>{(agent.temperature_k * 1000).toFixed(1)} mK</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-synapse-emerald" />
                  <span>{agent.coherence.toFixed(1)}% COH</span>
                </div>
                <div className="flex items-center gap-1">
                  <Layers className="w-3 h-3 text-synapse-violet" />
                  <span>{agent.tasks_completed} TASKS</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Dispatch Console */}
      <div className="p-3 rounded-xl border border-synapse-border bg-synapse-card backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-synapse-cyan" />
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            MISSION DIRECTIVE DISPATCH CONTROLLER
          </h3>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {PRESET_DIRECTIVES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className="text-[10px] font-mono px-2 py-1 rounded bg-synapse-dark border border-white/10 text-gray-300 hover:text-synapse-cyan hover:border-synapse-cyan/40 transition-colors"
            >
              #{idx + 1}: {preset.slice(0, 36)}...
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex gap-2">
            {/* Target Agent Selector */}
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="bg-synapse-dark border border-synapse-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-synapse-cyan focus:outline-none focus:border-synapse-cyan"
            >
              <option value="auto">⚡ AUTO ROUTER</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            {/* Priority Selector */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="bg-synapse-dark border border-synapse-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-gray-300 focus:outline-none focus:border-synapse-cyan"
            >
              <option value="LOW">LOW</option>
              <option value="NORMAL">NORMAL</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>

            {/* Prompt Input */}
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter neural directive (e.g. 'Optimize zero-knowledge key lattice')..."
              className="flex-1 bg-synapse-dark border border-synapse-border rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-synapse-cyan"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!prompt.trim() || isSubmitting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-synapse-cyan/50 bg-synapse-cyan/20 hover:bg-synapse-cyan/30 text-synapse-cyan font-mono text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-cyber active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>DISPATCH</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
