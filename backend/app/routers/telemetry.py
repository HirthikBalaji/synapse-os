from fastapi import APIRouter
from typing import List, Dict, Any
from app.schemas.telemetry import TelemetryMetrics, AnomalyTriggerPayload, CalibrateResponse
from app.services.telemetry_engine import telemetry_engine
from app.services.agent_mesh import agent_mesh
from app.core.websocket import ws_manager

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])


@router.get("/current", response_model=TelemetryMetrics)
async def get_current_telemetry():
    metric = telemetry_engine.generate_step(
        active_agent_count=len(agent_mesh.get_all_agents()),
        total_tasks=len(agent_mesh.task_history)
    )
    return metric


@router.get("/history", response_model=List[TelemetryMetrics])
async def get_telemetry_history():
    return telemetry_engine.history


@router.post("/calibrate", response_model=CalibrateResponse)
async def calibrate_quantum_phase():
    prev_coherence = telemetry_engine.history[-1]["quantum_coherence"] if telemetry_engine.history else 95.0
    res = telemetry_engine.calibrate()
    new_metric = telemetry_engine.generate_step(
        active_agent_count=len(agent_mesh.get_all_agents()),
        total_tasks=len(agent_mesh.task_history)
    )
    await ws_manager.broadcast({
        "type": "QUANTUM_CALIBRATED",
        "data": res
    })
    return {
        "status": res["status"],
        "previous_coherence": prev_coherence,
        "new_coherence": new_metric.quantum_coherence,
        "entanglement_aligned": True,
        "timestamp": res["timestamp"]
    }


@router.post("/anomaly")
async def trigger_anomaly(payload: AnomalyTriggerPayload):
    telemetry_engine.trigger_anomaly(
        anomaly_type=payload.anomaly_type,
        severity=payload.severity,
        duration_seconds=payload.duration_seconds
    )
    await ws_manager.broadcast({
        "type": "ANOMALY_TRIGGERED",
        "data": {
            "type": payload.anomaly_type,
            "severity": payload.severity,
            "duration": payload.duration_seconds
        }
    })
    return {"status": "TRIGGERED", "details": payload.model_dump()}


@router.post("/overclock")
async def toggle_overclock():
    new_state = telemetry_engine.toggle_overclock()
    await ws_manager.broadcast({
        "type": "OVERCLOCK_TOGGLED",
        "data": {"overclock_enabled": new_state}
    })
    return {"overclock_enabled": new_state}
