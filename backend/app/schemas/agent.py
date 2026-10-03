from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime


class AgentBase(BaseModel):
    id: str
    name: str
    role: str
    status: str
    neural_load: float
    coherence: float
    temperature_k: float
    tasks_completed: int
    current_objective: Optional[str] = None
    specialization: str
    last_synced_at: Optional[datetime] = None


class AgentResponse(AgentBase):
    model_config = ConfigDict(from_attributes=True)


class TaskDispatchPayload(BaseModel):
    agent_id: Optional[str] = Field(None, description="Target agent id. If null, autonomous router picks the best agent.")
    prompt: str = Field(..., min_length=3, description="The mission directive or neural computational task.")
    priority: str = Field("NORMAL", description="Priority level: LOW, NORMAL, HIGH, CRITICAL")


class ReasoningStep(BaseModel):
    step_number: int
    phase: str
    detail: str
    timestamp: float


class TaskResponse(BaseModel):
    id: str
    agent_id: str
    prompt: str
    status: str
    reasoning_steps: List[ReasoningStep] = []
    result: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
