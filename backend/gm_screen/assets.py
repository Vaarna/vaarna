import base64
import hashlib
import os
import tempfile
import typing as t
from email.utils import format_datetime
from enum import Enum

import boto3
from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel

from .config import Settings, get_settings

router = APIRouter()


def calculate_hash(file: UploadFile) -> str:
    m = hashlib.sha256()
    while True:
        data = file.file.read(2 ** 12)
        if not data:
            break
        m.update(data)
    return base64.urlsafe_b64encode(m.digest()).decode()


def calculate_md5(file: UploadFile) -> str:
    m = hashlib.md5()
    while True:
        data = file.file.read(2 ** 12)
        if not data:
            break
        m.update(data)
    return base64.b64encode(m.digest()).decode()


def get_size(file: UploadFile) -> int:
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    return size


class AssetKind(str, Enum):
    OTHER = "other"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    PDF = "pdf"


class Asset(BaseModel):
    id: str
    filename: str
    size: str
    media_type: str
    kind: AssetKind

    def __init__(self, file: UploadFile) -> None:
        h = calculate_hash(file)
        s = get_size(file)

        kind = AssetKind.OTHER
        ct = file.content_type
        if ct.startswith("image/"):
            kind = AssetKind.IMAGE
        elif ct.startswith("video/"):
            kind = AssetKind.VIDEO
        elif ct.startswith("audio/"):
            kind = AssetKind.AUDIO
        elif ct == "application/pdf":
            kind = AssetKind.PDF

        super().__init__(
            filename=file.filename,
            media_type=file.content_type,
            id=h,
            size=s,
            kind=kind,
        )


asset_db = {}


@router.post("/")
def upload_asset(
    files: t.List[UploadFile] = File(...), settings: Settings = Depends(get_settings)
):
    s3 = boto3.client("s3")

    out = []
    for file in files:
        a = Asset(file)
        out.append(a)
        asset_db[a.id] = a

        md5 = calculate_md5(file)

        ret = s3.put_object(
            Bucket=settings.asset_bucket,
            Key=settings.asset_key_prefix + a.id,
            Body=file.file,
            ContentType=a.media_type,
            ContentMD5=md5,
        )
        asset_db[a.id] = a

    return out


@router.get("/")
def get_assets():
    return asset_db


@router.get("/{asset_id}")
async def get_asset(
    asset_id: str,
    thumbnail: bool = False,
    range: t.Optional[str] = Header(None),
    settings: Settings = Depends(get_settings),
):
    if thumbnail:
        asset_id += "-thumbnail"

    s3 = boto3.client("s3")
    req = {
        "Bucket": settings.asset_bucket,
        "Key": settings.asset_key_prefix + asset_id,
    }

    if range is not None:
        req["Range"] = range

    try:
        data = s3.get_object(**req)
    except s3.exceptions.NoSuchKey as e:
        raise HTTPException(404, f"Asset not found")

    headers = {
        "accept-ranges": data["AcceptRanges"],
        "last-modified": format_datetime(data["LastModified"]),
        "content-length": str(data["ContentLength"]),
        "etag": data["ETag"],
    }

    if "ContentRange" not in data:
        range = None

    if range is not None:
        headers["content-range"] = data["ContentRange"]

    return StreamingResponse(
        data["Body"],
        status_code=200 if range is None else 206,
        media_type=data["ContentType"],
        headers=headers,
    )
