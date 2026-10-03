import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, JSON
from app.core.database import Base


class AgentModel(Base):
    __tablename__ = "agents"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    role = Column(String(100), nullable=False)
    status = Column(String(30), default="ONLINE")  # ONLINE, COMPUTING, SYNCHRONIZING, OVERCLOCKED, ISOLATED
    neural_load = Column(Float, default=12.5)       # 0.0 - 100.0%
    coherence = Column(Float, default=99.2)         # Quantum coherence %
    temperature_k = Column(Float, default=0.015)    # Millikelvin operating temp
    tasks_completed = Column(Integer, default=0)
    current_objective = Column(Text, nullable=True)
    specialization = Column(String(200), nullable=False)
    last_synced_at = Column(DateTime, default=datetime.datetime.utcnow)


class TaskRecord(Base):
    __tablename__ = "tasks"

    id = Column(String(50), primary_key=True, index=True)
    agent_id = Column(String(50), index=True)
    prompt = Column(Text, nullable=False)
    status = Column(String(30), default="PENDING")  # PENDING, PROCESSING, COMPLETED, FAILED
    reasoning_steps = Column(JSON, default=list)
    result = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
