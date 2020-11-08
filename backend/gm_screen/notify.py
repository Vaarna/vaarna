import asyncio
from contextlib import asynccontextmanager
from functools import lru_cache

from fastapi import APIRouter, Depends, WebSocket

from .config import Settings, get_settings

router = APIRouter()


class Notifier:
    def __init__(self):
        self.active_connections = []

    @asynccontextmanager
    async def connect(self, client_id: str, ws: WebSocket):
        await ws.accept()
        try:
            self.active_connections.append((client_id, ws))
            yield lambda: ws.send_json({"kind": "ping"})
        finally:
            self.active_connections.remove((client_id, ws))

    async def broadcast(self, kind: str, msg):
        ss = []
        for client_id, ws in self.active_connections:
            ss.append(ws.send_json({"kind": kind, "data": msg}))

        if ss:
            await asyncio.wait(ss)

    async def send(self, recipient, kind: str, msg):
        ss = []
        for client_id, ws in self.active_connections:
            if recipient == client_id:
                ss.append(ws.send_json({"kind": kind, "data": msg}))

        if ss:
            await asyncio.wait(ss)


@lru_cache
def get_notifier():
    return Notifier()


@router.websocket("/")
async def listen_notifications(
    client_id: str,
    websocket: WebSocket,
    settings: Settings = Depends(get_settings),
    notifier: Notifier = Depends(get_notifier),
):
    async with notifier.connect(client_id, websocket) as ping:
        while True:
            await asyncio.sleep(10)
            await ping()


@router.post("/show-asset")
async def notify(
    asset_id: str,
    settings: Settings = Depends(get_settings),
    notifier: Notifier = Depends(get_notifier),
):
    await notifier.broadcast("show-asset", {"asset_id": asset_id})
