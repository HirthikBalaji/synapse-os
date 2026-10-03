import datetime
from sqlalchemy import Column, Integer, Float, DateTime, String
from app.core.database import Base


class TelemetrySnapshot(Base):
    __tablename__ = "telemetry_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    alpha_wave = Column(Float, nullable=False)
    beta_wave = Column(Float, nullable=False)
    gamma_wave = Column(Float, nullable=False)
    theta_wave = Column(Float, nullable=False)
    quantum_coherence = Column(Float, nullable=False)
    entanglement_stability = Column(Float, nullable=False)
    synaptic_flux = Column(Float, nullable=False)
    anomaly_score = Column(Float, default=0.0)
    system_status = Column(String(50), default="NOMINAL")
