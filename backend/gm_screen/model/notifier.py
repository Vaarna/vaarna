import asyncio
from contextlib import asynccontextmanager

from fastapi import WebSocket


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
