import typing as t
from functools import lru_cache

from pydantic import BaseSettings


class Settings(BaseSettings):
    asset_bucket: str
    asset_key_prefix: str = ""


@lru_cache()
def get_settings() -> Settings:
    return Settings()
