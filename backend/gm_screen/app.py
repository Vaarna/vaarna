import asyncio
import base64
import hashlib
import json
import os
import typing as t
from contextlib import asynccontextmanager
from functools import lru_cache

import boto3
from fastapi import Depends, FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.background import run_in_threadpool

from . import assets
from .config import Settings, get_settings

app = FastAPI()
app.include_router(assets.router, prefix="/assets")
app.mount("/static", StaticFiles(directory="../frontend/dist"), "static")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ["CORS_ALLOW_ORIGIN"]],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def home():
    return FileResponse("../frontend/dist/index.html")


class Notifier:
    def __init__(self):
        self.active_connections = []

    @asynccontextmanager
    async def connect(self, client_id: str, ws: WebSocket):
        await ws.accept()
        try:
            self.active_connections.append((client_id, ws))
            yield lambda: ws.send_json({"ping": True})
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


@app.websocket("/notify")
async def listen_notifications(
    client_id: str,
    websocket: WebSocket,
    settings: Settings = Depends(get_settings),
    notifier: Notifier = Depends(get_notifier),
):
    async with notifier.connect(client_id, websocket) as ping:
        while True:
            await asyncio.sleep(5)
            await ping()


@app.post("/notify/show-asset")
async def notify(
    asset_id: str,
    settings: Settings = Depends(get_settings),
    notifier: Notifier = Depends(get_notifier),
):
    await notifier.broadcast("show-asset", {"asset_id": asset_id})
