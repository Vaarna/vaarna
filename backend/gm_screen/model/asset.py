from __future__ import annotations

import base64
import hashlib
import typing as t
from enum import Enum

from fastapi import UploadFile
from pydantic import BaseModel


def _calculate_hashes(file: t.BinaryIO) -> t.Tuple[str, str]:
    sha = hashlib.sha256()
    md5 = hashlib.md5()
    while True:
        data = file.read(2 ** 12)
        if not data:
            break
        sha.update(data)
        md5.update(data)
    return (
        base64.urlsafe_b64encode(sha.digest()).decode(),
        base64.b64encode(md5.digest()).decode(),
    )


def _get_size(file: t.IO) -> int:
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
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
    def from_file(cls, file: UploadFile) -> t.Tuple[Asset, str]:
        """from_file creates a new Asset from the input, returning the Asset and its md5 hash"""

        sha, md5 = _calculate_hashes(file.file)
        size = _get_size(file.file)
        kind = AssetKind.from_content_type(file.content_type)

        return (
            cls(
                filename=file.filename,
                media_type=file.content_type,
                id=sha,
                size=size,
                kind=kind,
            ),
            md5,
        )
