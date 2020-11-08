from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from . import assets, notify

app = FastAPI()
app.include_router(assets.router, prefix="/assets")
app.include_router(notify.router, prefix="/notify")
app.mount("/static", StaticFiles(directory="../frontend/dist"), "static")


@app.get("/")
async def home():
    return FileResponse("../frontend/dist/index.html")
