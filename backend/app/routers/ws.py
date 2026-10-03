import asyncio
import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.websocket import ws_manager
from app.services.telemetry_engine import telemetry_engine
from app.services.agent_mesh import agent_mesh
from app.services.terminal_service import terminal_service

logger = logging.getLogger("synapse.ws")
router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial handshake state
        initial_telemetry = telemetry_engine.generate_step(
            active_agent_count=len(agent_mesh.get_all_agents()),
            total_tasks=len(agent_mesh.task_history)
        )
        await ws_manager.send_personal({
            "type": "HANDSHAKE_INIT",
            "system": "SYNAPSE-OS QUANTUM TELEMETRY GATEWAY",
            "telemetry": initial_telemetry.model_dump(),
            "agents": agent_mesh.get_all_agents(),
            "tasks": agent_mesh.task_history[:10]
        }, websocket)

        while True:
            text = await websocket.receive_text()
            try:
                message = json.loads(text)
                msg_type = message.get("type")

                if msg_type == "PING":
                    await ws_manager.send_personal({"type": "PONG", "timestamp": message.get("timestamp")}, websocket)

                elif msg_type == "DISPATCH_TASK":
                    payload = message.get("data", {})
                    task = await agent_mesh.dispatch_task(
                        prompt=payload.get("prompt", "Default task"),
                        target_agent_id=payload.get("agent_id"),
                        priority=payload.get("priority", "NORMAL")
                    )
                    await ws_manager.send_personal({"type": "DISPATCH_ACK", "data": task}, websocket)

                elif msg_type == "CALIBRATE":
                    res = telemetry_engine.calibrate()
                    await ws_manager.broadcast({"type": "QUANTUM_CALIBRATED", "data": res})

                elif msg_type == "EXECUTE_COMMAND":
                    cmd = message.get("data", {}).get("command", "")
                    res = await terminal_service.execute_command(cmd)
                    await ws_manager.broadcast({"type": "TERMINAL_EVENT", "data": res})

                elif msg_type == "TRIGGER_ANOMALY":
                    data = message.get("data", {})
                    telemetry_engine.trigger_anomaly(
                        data.get("type", "DECOHERENCE_SPIKE"),
                        float(data.get("severity", 0.8)),
                        int(data.get("duration", 12))
                    )
                    await ws_manager.broadcast({"type": "ANOMALY_TRIGGERED", "data": data})

                elif msg_type == "TOGGLE_OVERCLOCK":
                    new_val = telemetry_engine.toggle_overclock()
                    await ws_manager.broadcast({"type": "OVERCLOCK_TOGGLED", "data": {"overclock_enabled": new_val}})

            except json.JSONDecodeError:
                logger.warning(f"Malformed WS JSON received: {text}")

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket exception: {e}")
        ws_manager.disconnect(websocket)
