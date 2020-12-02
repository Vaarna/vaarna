import secrets

import _pytest
import pytest

from ..tests.fixtures import dynamodb_table
from . import TableDB, TableDynamoDB, TableInMemory


@pytest.fixture(params=[TableInMemory, TableDynamoDB])
def db(request: _pytest.fixtures.FixtureRequest):
    cls = request.param
    if cls is TableInMemory:
        yield cls()

    elif cls is TableDynamoDB:
        yield from dynamodb_table(
            cls,
            [
                {"AttributeName": "space_id", "AttributeType": "S"},
            ],
            [
                {"AttributeName": "space_id", "KeyType": "HASH"},
            ],
        )

    else:
        raise RuntimeError("unreachable")


def test_asset_db_basic_operations(db: TableDB):
    a = secrets.token_urlsafe()
    b = secrets.token_urlsafe()

    db.set_table("abba", a)
    db.set_table("baab", b)

    assert db.get_table("abba") == a
    assert db.get_table("baab") == b

    db.set_table("abba", b)
    db.set_table("baab", a)

    assert db.get_table("abba") == b
    assert db.get_table("baab") == a
