export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'ONLINE' | 'COMPUTING' | 'SYNCHRONIZING' | 'OVERCLOCKED' | 'ISOLATED';
  neural_load: number;
  coherence: number;
  temperature_k: number;
  tasks_completed: number;
  current_objective?: string;
  specialization: string;
  last_synced_at?: string;
}

export interface ReasoningStep {
  step_number: number;
  phase: string;
  detail: string;
  timestamp: number;
}

export interface Task {
  id: string;
  agent_id: string;
  prompt: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  priority?: string;
  reasoning_steps: ReasoningStep[];
  result?: string;
  created_at: string;
  completed_at?: string;
}

export interface TelemetryMetrics {
  timestamp: number;
  alpha_wave: number;
  beta_wave: number;
  gamma_wave: number;
  theta_wave: number;
  quantum_coherence: number;
  entanglement_stability: number;
  synaptic_flux: number;
  anomaly_score: number;
  system_status: string;
  active_agent_count: number;
  total_tasks_processed: number;
  overclock_enabled: boolean;
}

export interface TerminalEntry {
  id: string;
  command: string;
  output: string;
  status: 'SUCCESS' | 'ERROR' | 'WARN' | 'INFO';
  timestamp: number;
}
