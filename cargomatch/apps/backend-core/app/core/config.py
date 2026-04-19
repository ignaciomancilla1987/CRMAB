"""Configuración centralizada vía variables de entorno."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    env: str = "development"
    log_level: str = "INFO"

    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_cors_origins: str = "http://localhost:5173"

    database_url: str = (
        "postgresql+psycopg://cargomatch:cargomatch_dev@localhost:5432/cargomatch"
    )
    redis_url: str = "redis://localhost:6379/0"

    s3_endpoint: str = "http://localhost:9000"
    s3_access_key: str = "minio_admin"
    s3_secret_key: str = "minio_admin_dev"
    s3_bucket_evidencias: str = "cargomatch-evidencias"
    s3_bucket_dtes: str = "cargomatch-dtes"
    s3_region: str = "us-east-1"

    default_tolerance_qty_pct: float = 2.0
    default_tolerance_weight_pct: float = 1.5

    jwt_secret: str = "change-me-in-prod"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 480

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.api_cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
