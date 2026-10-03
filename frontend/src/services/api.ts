import type { Agent, Task, TelemetryMetrics } from '../types';

const API_BASE = 'http://localhost:8002/api';

export const api = {
  async getAgents(): Promise<Agent[]> {
    const res = await fetch(`${API_BASE}/agents`);
    if (!res.ok) throw new Error('Failed to fetch agents');
    return res.json();
  },

  async dispatchTask(prompt: string, agent_id?: string, priority: string = 'NORMAL'): Promise<Task> {
    const res = await fetch(`${API_BASE}/agents/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, agent_id: agent_id || null, priority })
    });
    if (!res.ok) throw new Error('Failed to dispatch task');
    return res.json();
  },

  async getRecentTasks(): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/agents/tasks/recent`);
    if (!res.ok) throw new Error('Failed to fetch recent tasks');
    return res.json();
  },

  async rebootAgent(agentId: string): Promise<Agent> {
    const res = await fetch(`${API_BASE}/agents/${agentId}/reboot`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to reboot agent ${agentId}`);
    return res.json();
  },

  async getTelemetryCurrent(): Promise<TelemetryMetrics> {
    const res = await fetch(`${API_BASE}/telemetry/current`);
    if (!res.ok) throw new Error('Failed to fetch telemetry');
    return res.json();
  },

  async calibrateQuantum(): Promise<{ status: string; new_coherence: number }> {
    const res = await fetch(`${API_BASE}/telemetry/calibrate`, { method: 'POST' });
    if (!res.ok) throw new Error('Calibration failed');
    return res.json();
  },

  async triggerAnomaly(type = 'DECOHERENCE_STORM', severity = 0.85): Promise<void> {
    const res = await fetch(`${API_BASE}/telemetry/anomaly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anomaly_type: type, severity, duration_seconds: 15 })
    });
    if (!res.ok) throw new Error('Failed to trigger anomaly');
  },

  async toggleOverclock(): Promise<{ overclock_enabled: boolean }> {
    const res = await fetch(`${API_BASE}/telemetry/overclock`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to toggle overclock');
    return res.json();
  },

  async executeCommand(command: string): Promise<{ command: string; status: 'SUCCESS' | 'ERROR' | 'WARN'; output: string }> {
    const res = await fetch(`${API_BASE}/terminal/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });
    if (!res.ok) throw new Error('Command execution failed');
    return res.json();
  }
};
