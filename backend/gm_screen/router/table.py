from fastapi import APIRouter, Depends

from ..config import get_notifier, get_table_db
from ..model import Notifier, TableDB

router = APIRouter()


@router.post("/")
async def set_asset(
    space_id: str,
    asset_id: str,
    notifier: Notifier = Depends(get_notifier),
    table: TableDB = Depends(get_table_db),
):
    table.set_table(space_id, asset_id)
    await notifier.broadcast("show-asset", {"space_id": space_id, "asset_id": asset_id})


@router.get("/")
async def get_asset(
    space_id: str,
    table: TableDB = Depends(get_table_db),
):
    return {"table": table.get_table(space_id)}
