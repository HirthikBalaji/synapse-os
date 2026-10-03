import math
import time
import random
import asyncio
import logging
from typing import Optional, Dict, Any, List
from app.schemas.telemetry import TelemetryMetrics
from app.core.websocket import ws_manager

logger = logging.getLogger("synapse.telemetry")


class TelemetryEngine:
    def __init__(self):
        self.t: float = 0.0
        self.overclock_enabled: bool = False
        self.anomaly_active: bool = False
        self.anomaly_type: str = "NONE"
        self.anomaly_severity: float = 0.0
        self.anomaly_end_time: float = 0.0
        self.history: List[Dict[str, Any]] = []
        self.max_history: int = 120
        self.calibration_boost: float = 0.0

    def trigger_anomaly(self, anomaly_type: str, severity: float, duration_seconds: int = 15):
        self.anomaly_active = True
        self.anomaly_type = anomaly_type
        self.anomaly_severity = max(0.1, min(1.0, severity))
        self.anomaly_end_time = time.time() + duration_seconds
        logger.warning(f"Anomaly triggered: {anomaly_type} (severity={severity}) for {duration_seconds}s")

    def calibrate(self) -> Dict[str, Any]:
        self.anomaly_active = False
        self.anomaly_type = "NONE"
        self.anomaly_severity = 0.0
        self.calibration_boost = 5.0
        return {
            "status": "ALIGNED",
            "message": "Quantum phase locked. Coherence stabilized across 1024 virtual qubits.",
            "timestamp": time.time()
        }

    def toggle_overclock(self) -> bool:
        self.overclock_enabled = not self.overclock_enabled
        return self.overclock_enabled

    def generate_step(self, active_agent_count: int = 4, total_tasks: int = 0) -> TelemetryMetrics:
        now = time.time()
        self.t += 0.25

        # Check if anomaly expired
        if self.anomaly_active and now > self.anomaly_end_time:
            self.anomaly_active = False
            self.anomaly_type = "NONE"
            self.anomaly_severity = 0.0

        # Base sinusoidal wave generation with harmonic harmonics
        base_freq = 1.6 if self.overclock_enabled else 1.0
        alpha = 40.0 + 15.0 * math.sin(self.t * 0.4 * base_freq) + random.uniform(-2.0, 2.0)
        beta = 55.0 + 20.0 * math.sin(self.t * 0.9 * base_freq + 1.2) + random.uniform(-3.0, 3.0)
        gamma = 70.0 + 25.0 * math.cos(self.t * 1.5 * base_freq + 2.5) + random.uniform(-4.0, 4.0)
        theta = 30.0 + 10.0 * math.sin(self.t * 0.2 * base_freq + 0.8) + random.uniform(-1.5, 1.5)

        base_coherence = 98.8 + self.calibration_boost
        self.calibration_boost = max(0.0, self.calibration_boost - 0.08)

        # Anomaly degradation
        if self.anomaly_active:
            degrade = self.anomaly_severity * 35.0
            coherence = max(18.0, base_coherence - degrade + random.uniform(-5.0, 5.0))
            stability = max(22.0, 96.0 - (self.anomaly_severity * 45.0) + random.uniform(-4.0, 4.0))
            synaptic_flux = 85.0 + (self.anomaly_severity * 30.0) + random.uniform(-6.0, 6.0)
            anomaly_score = round(self.anomaly_severity, 3)
            system_status = "CRITICAL_ANOMALY" if self.anomaly_severity > 0.6 else "DEGRADED"
        else:
            jitter = random.uniform(-0.8, 0.8)
            coherence = min(100.0, max(85.0, base_coherence + jitter))
            stability = min(100.0, max(88.0, 97.4 + random.uniform(-1.2, 1.2)))
            synaptic_flux = 42.0 + (18.0 if self.overclock_enabled else 0.0) + 8.0 * math.sin(self.t * 0.8) + random.uniform(-2.0, 2.0)
            anomaly_score = round(random.uniform(0.01, 0.06), 3)
            system_status = "OVERCLOCKED" if self.overclock_enabled else "NOMINAL"

        metric = TelemetryMetrics(
            timestamp=now,
            alpha_wave=round(alpha, 2),
            beta_wave=round(beta, 2),
            gamma_wave=round(gamma, 2),
            theta_wave=round(theta, 2),
            quantum_coherence=round(coherence, 2),
            entanglement_stability=round(stability, 2),
            synaptic_flux=round(synaptic_flux, 2),
            anomaly_score=anomaly_score,
            system_status=system_status,
            active_agent_count=active_agent_count,
            total_tasks_processed=total_tasks,
            overclock_enabled=self.overclock_enabled
        )

        # Save into history buffer
        self.history.append(metric.model_dump())
        if len(self.history) > self.max_history:
            self.history.pop(0)

        return metric


telemetry_engine = TelemetryEngine()
