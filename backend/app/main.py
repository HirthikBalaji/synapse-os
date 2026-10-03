import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.core.websocket import ws_manager
from app.services.telemetry_engine import telemetry_engine
from app.services.agent_mesh import agent_mesh
from app.routers import agents, telemetry, terminal, ws

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("synapse.main")


async def telemetry_broadcaster():
    """Background task streaming quantum telemetry over websockets at fixed intervals."""
    logger.info("Initializing Synapse Quantum Telemetry Broadcaster loop...")
    while True:
        try:
            if ws_manager.active_connections:
                metrics = telemetry_engine.generate_step(
                    active_agent_count=len(agent_mesh.get_all_agents()),
                    total_tasks=len(agent_mesh.task_history)
                )
                await ws_manager.broadcast({
                    "type": "TELEMETRY_UPDATE",
                    "data": metrics.model_dump()
                })
        except Exception as e:
            logger.error(f"Error in telemetry broadcast cycle: {e}")
        await asyncio.sleep(settings.TELEMETRY_INTERVAL_MS / 1000.0)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"SYNAPSE-OS {settings.VERSION} starting up...")
    await init_db()
    broadcaster_task = asyncio.create_task(telemetry_broadcaster())
    yield
    logger.info("Shutting down SYNAPSE-OS...")
    broadcaster_task.cancel()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SYNAPSE-OS: Neural-Digital Interface & Autonomous AI Agent Mesh Command Center",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(agents.router, prefix=settings.API_V1_STR)
app.include_router(telemetry.router, prefix=settings.API_V1_STR)
app.include_router(terminal.router, prefix=settings.API_V1_STR)
app.include_router(ws.router)


@app.get("/")
async def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "quantum_state": "ENTANGLED_COHERENT",
        "docs_url": "/docs"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "agents_online": len(agent_mesh.get_all_agents()),
        "overclock": telemetry_engine.overclock_enabled,
        "anomaly_active": telemetry_engine.anomaly_active,
        "ws_clients": len(ws_manager.active_connections)
    }
