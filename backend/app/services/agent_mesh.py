import time
import uuid
import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.schemas.agent import AgentResponse, TaskResponse, ReasoningStep
from app.core.websocket import ws_manager

logger = logging.getLogger("synapse.agents")


INITIAL_AGENTS = [
    {
        "id": "ARCHITECT-01",
        "name": "ARCHITECT-01",
        "role": "Chief Cognitive Synthesis",
        "status": "ONLINE",
        "neural_load": 18.4,
        "coherence": 99.4,
        "temperature_k": 0.012,
        "tasks_completed": 42,
        "current_objective": "Supervising global neural topology convergence",
        "specialization": "System orchestration, neuro-symbolic reasoning, topological planning",
    },
    {
        "id": "CYPHER-9",
        "name": "CYPHER-9",
        "role": "Quantum Cryptography & Entanglement",
        "status": "ONLINE",
        "neural_load": 24.1,
        "coherence": 98.9,
        "temperature_k": 0.015,
        "tasks_completed": 78,
        "current_objective": "Verifying lattice-based zero-knowledge proofs",
        "specialization": "Post-quantum cryptography, Bell-state verification, key distribution",
    },
    {
        "id": "NEURON-DELTA",
        "name": "NEURON-DELTA",
        "role": "Synaptic Threat & Telemetry Sentry",
        "status": "ONLINE",
        "neural_load": 31.7,
        "coherence": 97.6,
        "temperature_k": 0.018,
        "tasks_completed": 115,
        "current_objective": "Scanning real-time EEG harmonics for phase decoherence",
        "specialization": "Real-time anomaly isolation, spectral density analysis, adaptive firewall",
    },
    {
        "id": "VALKYRIE-PRIME",
        "name": "VALKYRIE-PRIME",
        "role": "Autonomous Swarm Actuator",
        "status": "ONLINE",
        "neural_load": 14.8,
        "coherence": 99.8,
        "temperature_k": 0.011,
        "tasks_completed": 96,
        "current_objective": "Standby for distributed parallel sub-agent synthesis",
        "specialization": "Distributed actuator execution, rapid sub-cluster spawning, contingency triage",
    }
]


class AgentMeshService:
    def __init__(self):
        self.agents: Dict[str, Dict[str, Any]] = {
            item["id"]: {**item, "last_synced_at": datetime.now(timezone.utc)}
            for item in INITIAL_AGENTS
        }
        self.tasks: Dict[str, Dict[str, Any]] = {}
        self.task_history: List[Dict[str, Any]] = []

    def get_all_agents(self) -> List[Dict[str, Any]]:
        return list(self.agents.values())

    def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        return self.agents.get(agent_id)

    def route_task(self, prompt: str) -> str:
        prompt_lower = prompt.lower()
        if any(w in prompt_lower for w in ["crypto", "encrypt", "lattice", "key", "security", "zero-knowledge", "zk"]):
            return "CYPHER-9"
        elif any(w in prompt_lower for w in ["threat", "anomaly", "scan", "firewall", "detect", "decoherence"]):
            return "NEURON-DELTA"
        elif any(w in prompt_lower for w in ["swarm", "deploy", "execute", "actuator", "run", "sub-agent", "speed"]):
            return "VALKYRIE-PRIME"
        elif any(w in prompt_lower for w in ["plan", "architect", "reason", "design", "structure"]):
            return "ARCHITECT-01"
        
        # Default: pick agent with lowest neural load
        return min(self.agents.values(), key=lambda a: a["neural_load"])["id"]

    async def dispatch_task(self, prompt: str, target_agent_id: Optional[str] = None, priority: str = "NORMAL") -> Dict[str, Any]:
        agent_id = target_agent_id if (target_agent_id and target_agent_id in self.agents) else self.route_task(prompt)
        task_id = f"TSK-{uuid.uuid4().hex[:8].upper()}"

        task_record = {
            "id": task_id,
            "agent_id": agent_id,
            "prompt": prompt,
            "status": "PROCESSING",
            "priority": priority,
            "reasoning_steps": [],
            "result": None,
            "created_at": datetime.now(timezone.utc),
            "completed_at": None,
        }
        self.tasks[task_id] = task_record

        # Update agent state
        agent = self.agents[agent_id]
        agent["status"] = "COMPUTING"
        agent["current_objective"] = prompt
        agent["neural_load"] = min(98.5, round(agent["neural_load"] + 32.0, 1))

        # Broadcast agent updated event
        await ws_manager.broadcast({
            "type": "AGENT_STATE_UPDATE",
            "data": agent
        })
        await ws_manager.broadcast({
            "type": "TASK_DISPATCHED",
            "data": task_record
        })

        # Launch background task execution
        asyncio.create_task(self._execute_task_pipeline(task_id, agent_id, prompt))
        return task_record

    async def _execute_task_pipeline(self, task_id: str, agent_id: str, prompt: str):
        steps = [
            ("COGNITIVE_INGESTION", f"Parsing directive and establishing quantum entanglement bridge with {agent_id}"),
            ("QUANTUM_CONSENSUS", f"Evaluating lattice cryptographic proofs across distributed swarm nodes"),
            ("NEURAL_SYNTHESIS", f"Simulating topological solutions against high-dimensional synaptic matrix"),
            ("FINAL_VERIFICATION", f"Validation complete. Quantum state locked with 99.98% fidelity.")
        ]

        task = self.tasks[task_id]
        for idx, (phase, detail) in enumerate(steps, start=1):
            await asyncio.sleep(1.0)
            step_data = {
                "step_number": idx,
                "phase": phase,
                "detail": detail,
                "timestamp": time.time()
            }
            task["reasoning_steps"].append(step_data)
            await ws_manager.broadcast({
                "type": "TASK_STEP",
                "task_id": task_id,
                "agent_id": agent_id,
                "data": step_data
            })

        await asyncio.sleep(0.5)
        task["status"] = "COMPLETED"
        task["completed_at"] = datetime.now(timezone.utc)
        task["result"] = f"SYNAPSE executed '{prompt}' successfully. Quantum state converged at {time.strftime('%H:%M:%S')}."
        self.task_history.insert(0, task)
        if len(self.task_history) > 50:
            self.task_history.pop()

        # Reset agent state
        agent = self.agents[agent_id]
        agent["status"] = "ONLINE"
        agent["tasks_completed"] += 1
        agent["neural_load"] = max(12.0, round(agent["neural_load"] - 25.0, 1))
        agent["current_objective"] = "Holding quantum superposition ready for next directive"

        await ws_manager.broadcast({
            "type": "TASK_COMPLETED",
            "data": task
        })
        await ws_manager.broadcast({
            "type": "AGENT_STATE_UPDATE",
            "data": agent
        })

    def reboot_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        if agent_id not in self.agents:
            return None
        agent = self.agents[agent_id]
        agent["status"] = "ONLINE"
        agent["neural_load"] = 12.0
        agent["coherence"] = 99.9
        agent["temperature_k"] = 0.010
        agent["current_objective"] = "Cold-reboot complete. Entanglement re-anchored."
        return agent


agent_mesh = AgentMeshService()
