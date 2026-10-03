from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "SYNAPSE-OS"
    VERSION: str = "2.4.0-QUANTUM"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = "sqlite+aiosqlite:///./synapse.db"
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]
    TELEMETRY_INTERVAL_MS: int = 400
    SIMULATION_ENTANGLEMENT_BASE: float = 98.4
    DEBUG_MODE: bool = False

    model_config = SettingsConfigDict(case_sensitive=True)


settings = Settings()
