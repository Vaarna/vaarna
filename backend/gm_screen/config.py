from pydantic import BaseSettings


class Settings(BaseSettings):
    asset_bucket: str
    asset_key_prefix: str = ""
    asset_table: str


def get_settings() -> Settings:
    return Settings()
