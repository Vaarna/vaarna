from functools import lru_cache

from fastapi import Depends
from pydantic import BaseSettings

from .model import AssetDB, AssetDynamoDB, Notifier, TableDB, TableDynamoDB


class Settings(BaseSettings):
    asset_bucket: str
    asset_key_prefix: str = ""
    asset_table: str
    table_table: str


def get_settings() -> Settings:
    return Settings()


@lru_cache
def get_notifier():
    return Notifier()


def get_asset_db(settings: Settings = Depends(get_settings)) -> AssetDB:
    return AssetDynamoDB(settings.asset_table)


def get_table_db(settings: Settings = Depends(get_settings)) -> TableDB:
    return TableDynamoDB(settings.table_table)
