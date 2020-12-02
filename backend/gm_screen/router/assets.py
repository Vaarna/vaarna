import typing as t
from email.utils import format_datetime

import boto3
from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from ..config import Settings, get_asset_db, get_settings
from ..model import Asset, AssetDB, AssetKind

router = APIRouter()


@router.post("/")
def upload_asset(
    space_id: str,
    files: t.List[UploadFile] = File(...),
    settings: Settings = Depends(get_settings),
    asset_db: AssetDB = Depends(get_asset_db),
):
    s3 = boto3.client("s3")

    out = []
    for file in files:
        a, md5 = Asset.from_file(file)
        out.append(a)

        s3.put_object(
            Bucket=settings.asset_bucket,
            Key=settings.asset_key_prefix + a.id,
            Body=file.file,
            ContentType=a.media_type,
            ContentMD5=md5,
        )
        asset_db.put_asset(space_id, a)

    return out


@router.get("/")
def get_assets(
    space_id: str,
    settings: Settings = Depends(get_settings),
    asset_db: AssetDB = Depends(get_asset_db),
):
    return list(asset_db.list_assets(space_id))


@router.get("/{asset_id}")
def get_asset(
    space_id: str,
    asset_id: str,
    settings: Settings = Depends(get_settings),
    asset_db: AssetDB = Depends(get_asset_db),
):
    asset = asset_db.get_asset(space_id, asset_id)
    if asset is None:
        raise HTTPException(404, "Asset Not Found")

    return asset


@router.get("/show/{asset_id}")
async def show_asset(
    space_id: str,
    asset_id: str,
    thumbnail: bool = False,
    range: t.Optional[str] = Header(None),
    settings: Settings = Depends(get_settings),
    asset_db: AssetDB = Depends(get_asset_db),
):
    asset = asset_db.get_asset(space_id, asset_id)
    if asset is None:
        raise HTTPException(404, "Asset Not Found")

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
