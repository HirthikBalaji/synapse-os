from fastapi import APIRouter
from app.schemas.command import TerminalCommandRequest, TerminalCommandResponse
from app.services.terminal_service import terminal_service
from app.core.websocket import ws_manager

router = APIRouter(prefix="/terminal", tags=["Terminal"])


@router.post("/execute", response_model=TerminalCommandResponse)
async def execute_command(payload: TerminalCommandRequest):
    result = await terminal_service.execute_command(payload.command)
    await ws_manager.broadcast({
        "type": "TERMINAL_EVENT",
        "data": result
    })
    return result
