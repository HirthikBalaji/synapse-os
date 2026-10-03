from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict


class TerminalCommandRequest(BaseModel):
    command: str = Field(..., description="Raw command entered in terminal")


class TerminalCommandResponse(BaseModel):
    command: str
    status: str  # SUCCESS, ERROR, WARN
    output: str
    metadata: Optional[Dict[str, Any]] = None
    timestamp: float
