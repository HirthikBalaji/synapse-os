import React, { useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { TopNav } from './components/hud/TopNav';
import { AnomalyAlertBanner } from './components/hud/AnomalyAlertBanner';
import { NeuralCore3D } from './components/3d/NeuralCore3D';
import { AgentMeshPanel } from './components/hud/AgentMeshPanel';
import { TelemetryHUD } from './components/hud/TelemetryHUD';
import { TerminalConsole } from './components/hud/TerminalConsole';
import { api } from './services/api';
import { wsClient } from './services/websocket';
import { sound } from './services/soundEffects';
import type { Agent, Task, TelemetryMetrics, TerminalEntry } from './types';

export const App: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryMetrics | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number>(4);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [terminalEntries, setTerminalEntries] = useState<TerminalEntry[]>([
    {
      id: 'init-1',
      command: 'sys.boot',
      output: 'SYNAPSE-OS QUANTUM CORE INITIALIZED. 4 NEURAL AGENTS ONLINE. WEBSOCKET GATEWAY READY.',
      status: 'INFO',
      timestamp: Date.now(),
    },
  ]);

  // Derived state
  const isAnomaly = Boolean(telemetry && (telemetry.anomaly_score > 0.45 || telemetry.system_status.includes('ANOMALY')));
  const isOverclocked = Boolean(telemetry?.overclock_enabled);
  const coherence = telemetry?.quantum_coherence ?? 99.2;

  // Initialize Data
  useEffect(() => {
    // 1. Fetch initial HTTP endpoints
    api.getAgents().then(setAgents).catch(console.error);
    api.getRecentTasks().then(setTasks).catch(console.error);
    api.getTelemetryCurrent().then(setTelemetry).catch(console.error);

    // 2. Connect WebSocket
    wsClient.connect();

    // 3. Subscriptions
    const unsubStatus = wsClient.subscribe('STATUS', (data) => {
      setWsConnected(data.connected);
    });

    const unsubLatency = wsClient.subscribe('LATENCY_UPDATE', (data) => {
      setLatencyMs(data.latency);
    });

    const unsubHandshake = wsClient.subscribe('HANDSHAKE_INIT', (payload) => {
      if (payload.telemetry) setTelemetry(payload.telemetry);
      if (payload.agents) setAgents(payload.agents);
      if (payload.tasks) setTasks(payload.tasks);
    });

    const unsubTelemetry = wsClient.subscribe('TELEMETRY_UPDATE', (payload) => {
      setTelemetry(payload.data);
    });

    const unsubAgent = wsClient.subscribe('AGENT_STATE_UPDATE', (payload) => {
      const updatedAgent = payload.data as Agent;
      setAgents((prev) =>
        prev.map((a) => (a.id === updatedAgent.id ? { ...a, ...updatedAgent } : a))
      );
    });

    const unsubTaskDispatched = wsClient.subscribe('TASK_DISPATCHED', (payload) => {
      const newTask = payload.data as Task;
      setTasks((prev) => [newTask, ...prev.filter((t) => t.id !== newTask.id)].slice(0, 30));
    });

    const unsubTaskStep = wsClient.subscribe('TASK_STEP', (payload) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === payload.task_id) {
            const steps = t.reasoning_steps ? [...t.reasoning_steps, payload.data] : [payload.data];
            return { ...t, reasoning_steps: steps };
          }
          return t;
        })
      );
    });

    const unsubTaskCompleted = wsClient.subscribe('TASK_COMPLETED', (payload) => {
      const completedTask = payload.data as Task;
      setTasks((prev) =>
        prev.map((t) => (t.id === completedTask.id ? { ...t, ...completedTask } : t))
      );
    });

    const unsubTerminal = wsClient.subscribe('TERMINAL_EVENT', (payload) => {
      const data = payload.data;
      if (data.output === '__CLEAR__') {
        setTerminalEntries([]);
      } else {
        setTerminalEntries((prev) => [
          ...prev,
          {
            id: `cmd-${Date.now()}-${Math.random()}`,
            command: data.command,
            output: data.output,
            status: data.status,
            timestamp: data.timestamp,
          },
        ]);
      }
    });

    const unsubCalibrated = wsClient.subscribe('QUANTUM_CALIBRATED', () => {
      triggerCalibrateEffect();
    });

    const unsubAnomaly = wsClient.subscribe('ANOMALY_TRIGGERED', () => {
      sound.playAlarm();
    });

    return () => {
      unsubStatus();
      unsubLatency();
      unsubHandshake();
      unsubTelemetry();
      unsubAgent();
      unsubTaskDispatched();
      unsubTaskStep();
      unsubTaskCompleted();
      unsubTerminal();
      unsubCalibrated();
      unsubAnomaly();
      wsClient.disconnect();
    };
  }, []);

  // Visual burst on quantum calibration
  const triggerCalibrateEffect = useCallback(() => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.1 },
      colors: ['#00f3ff', '#00ff88', '#9d4edd', '#ffffff'],
    });
  }, []);

  // Actions
  const handleToggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleCalibrate = async () => {
    try {
      sound.playCalibrate();
      await api.calibrateQuantum();
      triggerCalibrateEffect();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleOverclock = async () => {
    try {
      await api.toggleOverclock();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerAnomaly = async () => {
    try {
      sound.playAlarm();
      await api.triggerAnomaly();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDispatch = async (prompt: string, agentId?: string, priority?: string) => {
    try {
      await api.dispatchTask(prompt, agentId, priority);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRebootAgent = async (agentId: string) => {
    try {
      await api.rebootAgent(agentId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecuteTerminal = async (cmd: string) => {
    try {
      const res = await api.executeCommand(cmd);
      if (res.output === '__CLEAR__') {
        setTerminalEntries([]);
      } else {
        setTerminalEntries((prev) => [
          ...prev,
          {
            id: `cmd-${Date.now()}`,
            command: res.command,
            output: res.output,
            status: res.status,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (e) {
      setTerminalEntries((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: cmd,
          output: `Execution error: ${e}`,
          status: 'ERROR',
          timestamp: Date.now(),
        },
      ]);
    }
  };

  return (
    <div className="relative min-h-screen bg-synapse-dark text-slate-100 cyber-grid-bg flex flex-col font-sans select-none">
      {/* Scanline CRT overlay */}
      <div className="fixed inset-0 scanline-overlay z-40 pointer-events-none" />

      {/* Top Holographic Navigation */}
      <TopNav
        wsConnected={wsConnected}
        latencyMs={latencyMs}
        isOverclocked={isOverclocked}
        isAnomaly={isAnomaly}
        coherence={coherence}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onCalibrate={handleCalibrate}
        onToggleOverclock={handleToggleOverclock}
        onTriggerAnomaly={handleTriggerAnomaly}
      />

      {/* Anomaly Threat Banner */}
      <AnomalyAlertBanner isAnomaly={isAnomaly} onContain={handleCalibrate} />

      {/* Main HUD Layout Grid */}
      <main className="flex-1 p-4 grid grid-cols-1 xl:grid-cols-12 gap-4 max-w-[1920px] mx-auto w-full z-10">
        {/* Left Column: 3D Holographic Core & Terminal (5 cols) */}
        <section className="xl:col-span-5 flex flex-col gap-4">
          {/* 3D Holographic Neural Swarm */}
          <div className="h-[400px] w-full">
            <NeuralCore3D
              quantumCoherence={coherence}
              isOverclocked={isOverclocked}
              isAnomaly={isAnomaly}
              activeAgentsCount={agents.length}
            />
          </div>

          {/* Interactive Cyber CLI Shell */}
          <div className="flex-1 min-h-[260px]">
            <TerminalConsole
              entries={terminalEntries}
              onExecute={handleExecuteTerminal}
              onClear={() => setTerminalEntries([])}
            />
          </div>
        </section>

        {/* Right Column: Multi-Agent Mesh & Telemetry Oscilloscope (7 cols) */}
        <section className="xl:col-span-7 flex flex-col gap-4">
          {/* Agent Mesh Panel */}
          <AgentMeshPanel
            agents={agents}
            onDispatch={handleDispatch}
            onRebootAgent={handleRebootAgent}
          />

          {/* Telemetry Wave Oscilloscope & Live Consensus Stream */}
          <div className="flex-1">
            <TelemetryHUD telemetry={telemetry} tasks={tasks} />
          </div>
        </section>
      </main>

      {/* Futuristic Bottom Status Bar */}
      <footer className="w-full border-t border-synapse-border bg-synapse-dark/95 px-4 py-2 text-[10px] font-mono text-gray-500 flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-3">
          <span className="text-synapse-cyan font-bold">SYNAPSE ARCHITECTURE:</span>
          <span>DISTRIBUTED NEURO-QUANTUM SWARM</span>
          <span>•</span>
          <span>ENTANGLEMENT GHZ TOPOLOGY</span>
          <span>•</span>
          <span>ZERO-KNOWLEDGE LATENT CONSENSUS</span>
        </div>
        <div className="flex items-center gap-3">
          <span>HOST: 127.0.0.1:8002</span>
          <span>•</span>
          <span className="text-synapse-emerald font-semibold">ALL SUB-SYSTEMS NOMINAL</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
