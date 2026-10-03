from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime


class TelemetryMetrics(BaseModel):
    timestamp: float
    alpha_wave: float
    beta_wave: float
    gamma_wave: float
    theta_wave: float
    quantum_coherence: float
    entanglement_stability: float
    synaptic_flux: float
    anomaly_score: float
    system_status: str
    active_agent_count: int
    total_tasks_processed: int
    overclock_enabled: bool


class AnomalyTriggerPayload(BaseModel):
    anomaly_type: str = "QUANTUM_DECOHERENCE_SPIKE"
    severity: float = 0.85
    duration_seconds: int = 15


class CalibrateResponse(BaseModel):
    status: str
    previous_coherence: float
    new_coherence: float
    entanglement_aligned: bool
    timestamp: float
