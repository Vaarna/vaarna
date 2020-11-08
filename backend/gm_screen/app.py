import base64
import hashlib
import os
import typing as t

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import assets
from .config import get_settings

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
