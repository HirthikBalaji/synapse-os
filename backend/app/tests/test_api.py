import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_and_root():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "HEALTHY"
        assert data["agents_online"] == 4

        root_res = await client.get("/")
        assert root_res.status_code == 200
        assert root_res.json()["system"] == "SYNAPSE-OS"


@pytest.mark.asyncio
async def test_agents_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/agents")
        assert res.status_code == 200
        agents = res.json()
        assert len(agents) == 4
        agent_ids = [a["id"] for a in agents]
        assert "ARCHITECT-01" in agent_ids
        assert "CYPHER-9" in agent_ids

        # Test single agent
        res_single = await client.get("/api/agents/ARCHITECT-01")
        assert res_single.status_code == 200
        assert res_single.json()["name"] == "ARCHITECT-01"


@pytest.mark.asyncio
async def test_task_dispatch_routing():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Dispatch cryptographic task -> should route to CYPHER-9
        payload = {
            "prompt": "Evaluate post-quantum zero-knowledge lattice encryption keys",
            "priority": "HIGH"
        }
        res = await client.post("/api/agents/dispatch", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["agent_id"] == "CYPHER-9"
        assert data["status"] in ["PROCESSING", "COMPLETED"]


@pytest.mark.asyncio
async def test_telemetry_and_calibration():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/telemetry/current")
        assert res.status_code == 200
        tel = res.json()
        assert "quantum_coherence" in tel
        assert "alpha_wave" in tel

        # Calibrate
        cal_res = await client.post("/api/telemetry/calibrate")
        assert cal_res.status_code == 200
        assert cal_res.json()["entanglement_aligned"] is True


@pytest.mark.asyncio
async def test_terminal_execution():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Help command
        res = await client.post("/api/terminal/execute", json={"command": "help"})
        assert res.status_code == 200
        assert "SYNAPSE-OS COMMAND INTERFACE" in res.json()["output"]

        # Status command
        res_status = await client.post("/api/terminal/execute", json={"command": "status"})
        assert res_status.status_code == 200
        assert "SYSTEM STATUS" in res_status.json()["output"]
