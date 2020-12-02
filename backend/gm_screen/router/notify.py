import asyncio

from fastapi import APIRouter, Depends, WebSocket

from ..config import Settings, get_notifier, get_settings
from ..model import Notifier

router = APIRouter()


@router.websocket("/")
async def listen_notifications(
    space_id: str,
    websocket: WebSocket,
    settings: Settings = Depends(get_settings),
    notifier: Notifier = Depends(get_notifier),
):
    async with notifier.connect(space_id, websocket) as ping:
        while True:
            await asyncio.sleep(10)
            await ping()
