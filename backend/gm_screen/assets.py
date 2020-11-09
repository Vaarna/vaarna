from __future__ import annotations

import base64
import hashlib
import typing as t
from email.utils import format_datetime
from enum import Enum

import boto3
from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from .config import Settings, get_settings
from .dynamo import deserialize, serialize

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

    @classmethod
    def from_content_type(cls, content_type: str) -> AssetKind:
        kind = cls.OTHER
        if content_type.startswith("image/"):
            kind = cls.IMAGE
        elif content_type.startswith("video/"):
            kind = cls.VIDEO
        elif content_type.startswith("audio/"):
            kind = cls.AUDIO
        elif content_type == "application/pdf":
            kind = cls.PDF

        return kind


class Asset(BaseModel):
    id: str
    filename: str
    size: str
    media_type: str
    kind: AssetKind

    @classmethod
    def from_file(cls, file: UploadFile) -> Asset:
        h = calculate_hash(file)
        s = get_size(file)
        kind = AssetKind.from_content_type(file.content_type)

        return cls(
            filename=file.filename,
            media_type=file.content_type,
            id=h,
            size=s,
            kind=kind,
        )


asset_db: t.Dict[str, Asset] = {}


@router.post("/")
def upload_asset(
    files: t.List[UploadFile] = File(...), settings: Settings = Depends(get_settings)
):
    s3 = boto3.client("s3")
    db = boto3.client("dynamodb")

    out = []
    for file in files:
        a = Asset.from_file(file)
        out.append(a)
        asset_db[a.id] = a

        md5 = calculate_md5(file)

        s3.put_object(
            Bucket=settings.asset_bucket,
            Key=settings.asset_key_prefix + a.id,
            Body=file.file,
            ContentType=a.media_type,
            ContentMD5=md5,
        )
        db.put_item(
            TableName=settings.asset_table,
            Item=serialize(a.dict()),
        )

    return out


@router.get("/")
def get_assets(
    settings: Settings = Depends(get_settings),
):
    db = boto3.client("dynamodb")

    data: t.List[Asset] = []

    ret = db.scan(
        TableName=settings.asset_table,
    )
    data.extend(Asset(**deserialize(item)) for item in ret["Items"])
    lek = ret.get("LastEvaluatedKey", None)

    while lek is not None:
        ret = db.scan(
            TableName=settings.asset_table,
            ExclusiveStartKey=lek,
        )
        data.extend(Asset(**deserialize(item)) for item in ret["Items"])
        lek = ret.get("LastEvaluatedKey", None)

    return data


@router.get("/{asset_id}")
def get_asset(asset_id: str, settings: Settings = Depends(get_settings)):
    db = boto3.client("dynamodb")
    ret = db.get_item(
        TableName=settings.asset_table,
        Key=serialize({"id": asset_id}),
    )

    if "Item" in ret:
        return Asset(**deserialize(ret["Item"]))
    else:
        raise HTTPException(404, "Asset Not Found")


@router.get("/show/{asset_id}")
async def show_asset(
    asset_id: str,
    thumbnail: bool = False,
    range: t.Optional[str] = Header(None),
    settings: Settings = Depends(get_settings),
):
    db = boto3.client("dynamodb")
    ret = db.get_item(
        TableName=settings.asset_table,
        Key=serialize({"id": asset_id}),
    )

    if "Item" not in ret:
        raise HTTPException(404, "Asset Not Found")

    asset = Asset(**deserialize(ret["Item"]))

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
    except s3.exceptions.NoSuchKey:
        raise HTTPException(404, "Asset Not Found")

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

    content_type = data["ContentType"]
    kind = AssetKind.from_content_type(content_type)
    if kind in {AssetKind.OTHER, AssetKind.PDF}:
        headers["content-disposition"] = f'attachment; filename="{asset.filename}"'

    return StreamingResponse(
        data["Body"],
        status_code=200 if range is None else 206,
        media_type=content_type,
        headers=headers,
    )
