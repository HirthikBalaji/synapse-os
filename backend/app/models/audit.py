import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    level = Column(String(20), default="INFO")  # INFO, WARN, ALERT, CRITICAL
    subsystem = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    context = Column(Text, nullable=True)
