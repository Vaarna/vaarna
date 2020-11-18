import secrets
import time
from io import BytesIO

import _pytest
import boto3
import pytest
from fastapi import UploadFile

from .asset_db import Asset, AssetDB, AssetDynamoDB, AssetInMemory


@pytest.fixture
def text_asset() -> Asset:
    return Asset.from_file(
        UploadFile("text.txt", BytesIO(b"abba\nbaab\n"), "text/plain")
    )[0]


@pytest.fixture
def image_asset() -> Asset:
    return Asset.from_file(
        UploadFile("image.jpeg", BytesIO(b"this is an image"), "image/jpeg")
    )[0]


@pytest.fixture(params=[AssetInMemory, AssetDynamoDB])
def db(request: _pytest.fixtures.FixtureRequest):
    cls = request.param
    if cls is AssetInMemory:
        yield cls()

    elif cls is AssetDynamoDB:
        endpoint_url = "http://localhost:8000"
        db = boto3.client("dynamodb", endpoint_url=endpoint_url)
        table_name = secrets.token_urlsafe()
        db.create_table(
            TableName=table_name,
            AttributeDefinitions=[
                {"AttributeName": "space_id", "AttributeType": "S"},
                {"AttributeName": "asset_id", "AttributeType": "S"},
            ],
            KeySchema=[
                {"AttributeName": "space_id", "KeyType": "HASH"},
                {"AttributeName": "asset_id", "KeyType": "RANGE"},
            ],
            ProvisionedThroughput={
                "ReadCapacityUnits": 1,
                "WriteCapacityUnits": 1,
            },
        )

        try:
            for _ in range(10):
                res = db.describe_table(TableName=table_name)
                if res["Table"]["TableStatus"] == "ACTIVE":
                    break
                time.sleep(1)
            else:
                raise RuntimeError("failed to create dynamodb table")

            yield AssetDynamoDB(table_name, endpoint_url=endpoint_url)

        finally:
            db.delete_table(TableName=table_name)

    else:
        raise RuntimeError("unreachable")


def test_asset_db_basic_operations(db: AssetDB, text_asset: Asset, image_asset: Asset):
    db.put_asset("abba", text_asset)
    db.put_asset("baab", text_asset)

    assert db.get_asset("abba", text_asset.id) == text_asset
    assert db.get_asset("baab", text_asset.id) == text_asset

    assert db.get_asset("nonexistent", text_asset.id) is None

    assert len(list(db.list_assets("abba"))) == 1
    assert len(list(db.list_assets("baab"))) == 1

    assert len(list(db.list_assets("nonexistent"))) == 0

    db.put_asset("abba", image_asset)
    db.put_asset("baab", image_asset)

    assert db.get_asset("abba", text_asset.id) == text_asset
    assert db.get_asset("baab", text_asset.id) == text_asset
    assert db.get_asset("abba", image_asset.id) == image_asset
    assert db.get_asset("baab", image_asset.id) == image_asset

    assert db.get_asset("nonexistent", text_asset.id) is None
    assert db.get_asset("nonexistent", image_asset.id) is None

    assert len(list(db.list_assets("abba"))) == 2
    assert len(list(db.list_assets("baab"))) == 2

    assert len(list(db.list_assets("nonexistent"))) == 0
