from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.schemas.agent import AgentResponse, TaskDispatchPayload, TaskResponse
from app.services.agent_mesh import agent_mesh

router = APIRouter(prefix="/agents", tags=["Agents"])


@router.get("", response_model=List[AgentResponse])
async def list_agents():
    return agent_mesh.get_all_agents()


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str):
    agent = agent_mesh.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.post("/dispatch", response_model=TaskResponse)
async def dispatch_task(payload: TaskDispatchPayload):
    task = await agent_mesh.dispatch_task(
        prompt=payload.prompt,
        target_agent_id=payload.agent_id,
        priority=payload.priority
    )
    return task


@router.get("/tasks/recent", response_model=List[TaskResponse])
async def get_recent_tasks():
    return agent_mesh.task_history


@router.post("/{agent_id}/reboot", response_model=AgentResponse)
async def reboot_agent(agent_id: str):
    rebooted = agent_mesh.reboot_agent(agent_id)
    if not rebooted:
        raise HTTPException(status_code=404, detail="Agent not found")
    return rebooted
