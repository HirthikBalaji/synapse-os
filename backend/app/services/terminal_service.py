import time
import logging
from typing import Dict, Any
from app.services.agent_mesh import agent_mesh
from app.services.telemetry_engine import telemetry_engine

logger = logging.getLogger("synapse.terminal")


class TerminalService:
    async def execute_command(self, raw_command: str) -> Dict[str, Any]:
        cmd = raw_command.strip()
        if not cmd:
            return {
                "command": raw_command,
                "status": "WARN",
                "output": "No command entered. Type 'help' for available directives.",
                "timestamp": time.time()
            }

        parts = cmd.split()
        directive = parts[0].lower()
        args = parts[1:]

        if directive == "help":
            output = (
                "=== SYNAPSE-OS COMMAND INTERFACE ===\n"
                "  status                       - Display overall system health and quantum telemetry\n"
                "  agents                       - List status, neural load, and coherence of all agent nodes\n"
                "  dispatch <agent|auto> <msg>  - Dispatch mission directive to neural mesh\n"
                "  calibrate                    - Realign quantum phase and clear decoherence spikes\n"
                "  anomaly [type] [severity]    - Simulate quantum anomaly event (testing)\n"
                "  overclock                    - Toggle neural processing overclock mode\n"
                "  reboot <agent_id>            - Cold-reboot a neural node\n"
                "  matrix                       - Display neural lattice topological map\n"
                "  clear                        - Clear terminal display buffer"
            )
            return {"command": raw_command, "status": "SUCCESS", "output": output, "timestamp": time.time()}

        elif directive == "status":
            step = telemetry_engine.generate_step(
                active_agent_count=len(agent_mesh.get_all_agents()),
                total_tasks=len(agent_mesh.task_history)
            )
            output = (
                f"[SYSTEM STATUS: {step.system_status}]\n"
                f"  Quantum Coherence:       {step.quantum_coherence}%\n"
                f"  Entanglement Stability:  {step.entanglement_stability}%\n"
                f"  Synaptic Flux:           {step.synaptic_flux} GHz\n"
                f"  Alpha / Beta / Gamma:    {step.alpha_wave:.1f} / {step.beta_wave:.1f} / {step.gamma_wave:.1f} Hz\n"
                f"  Active Neural Nodes:     {step.active_agent_count} online\n"
                f"  Total Processed Tasks:   {step.total_tasks_processed}\n"
                f"  Overclock Mode:          {'[ACTIVE]' if step.overclock_enabled else '[STANDBY]'}"
            )
            return {"command": raw_command, "status": "SUCCESS", "output": output, "timestamp": time.time()}

        elif directive == "agents":
            agents = agent_mesh.get_all_agents()
            lines = ["ID              STATUS       LOAD    COHERENCE   TEMP(mK)  SPECIALIZATION"]
            lines.append("-" * 75)
            for a in agents:
                lines.append(
                    f"{a['id']:<15} {a['status']:<12} {a['neural_load']:>5.1f}%  {a['coherence']:>8.1f}%  {a['temperature_k']*1000:>6.1f}mK  {a['role']}"
                )
            return {"command": raw_command, "status": "SUCCESS", "output": "\n".join(lines), "timestamp": time.time()}

        elif directive == "dispatch":
            if not args:
                return {
                    "command": raw_command,
                    "status": "ERROR",
                    "output": "Usage: dispatch <agent_id|auto> <objective description...>",
                    "timestamp": time.time()
                }
            target_agent = None if args[0].lower() in ["auto", "none"] else args[0].upper()
            prompt = " ".join(args[1:]) if target_agent else " ".join(args[1:]) or " ".join(args)
            if not prompt or prompt == target_agent:
                prompt = f"Optimize synaptic weights for node {target_agent}"
            
            task = await agent_mesh.dispatch_task(prompt, target_agent)
            return {
                "command": raw_command,
                "status": "SUCCESS",
                "output": f"Directive assigned to [{task['agent_id']}]. Task ID: {task['id']}. Swarm synthesis underway...",
                "metadata": task,
                "timestamp": time.time()
            }

        elif directive == "calibrate":
            res = telemetry_engine.calibrate()
            return {
                "command": raw_command,
                "status": "SUCCESS",
                "output": f"[CALIBRATION COMPLETE] {res['message']}",
                "metadata": res,
                "timestamp": time.time()
            }

        elif directive == "anomaly":
            anomaly_type = args[0] if args else "DECOHERENCE_STORM"
            severity = float(args[1]) if len(args) > 1 else 0.85
            telemetry_engine.trigger_anomaly(anomaly_type, severity)
            return {
                "command": raw_command,
                "status": "WARN",
                "output": f"[ALERT] Anomaly '{anomaly_type}' injected (severity={severity}). Automatic containment protocols engaged.",
                "timestamp": time.time()
            }

        elif directive == "overclock":
            new_state = telemetry_engine.toggle_overclock()
            status_text = "ENABLED (+100% throughput, elevated thermal flux)" if new_state else "DISABLED (Standard operating frequency)"
            return {
                "command": raw_command,
                "status": "SUCCESS",
                "output": f"[OVERCLOCK] Neural Overclock is now {status_text}.",
                "timestamp": time.time()
            }

        elif directive == "reboot":
            if not args:
                return {
                    "command": raw_command,
                    "status": "ERROR",
                    "output": "Usage: reboot <agent_id>",
                    "timestamp": time.time()
                }
            agent_id = args[0].upper()
            rebooted = agent_mesh.reboot_agent(agent_id)
            if not rebooted:
                return {
                    "command": raw_command,
                    "status": "ERROR",
                    "output": f"Agent node '{agent_id}' not found.",
                    "timestamp": time.time()
                }
            return {
                "command": raw_command,
                "status": "SUCCESS",
                "output": f"Agent [{agent_id}] cold-rebooted successfully. Entanglement restored.",
                "timestamp": time.time()
            }

        elif directive == "matrix":
            scan = (
                "⟡--- SYNAPTIC TOPOLOGY MATRIX ---⟡\n"
                "NODE[0] : [ARCHITECT-01] ─── (99.4%) ─── NODE[1] : [CYPHER-9]\n"
                "   │                                              │\n"
                " (98.9%)                                       (99.1%)\n"
                "   │                                              │\n"
                "NODE[2] : [NEURON-DELTA] ─── (98.2%) ─── NODE[3] : [VALKYRIE-PRIME]\n"
                "All 4 nodes fully entangled in Bell-State GHZ subspace."
            )
            return {"command": raw_command, "status": "SUCCESS", "output": scan, "timestamp": time.time()}

        elif directive == "clear":
            return {"command": "clear", "status": "SUCCESS", "output": "__CLEAR__", "timestamp": time.time()}

        else:
            return {
                "command": raw_command,
                "status": "ERROR",
                "output": f"Unrecognized directive '{directive}'. Enter 'help' for command syntax.",
                "timestamp": time.time()
            }


terminal_service = TerminalService()
