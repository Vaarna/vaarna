import secrets
import time
import typing as t

import boto3

T = t.TypeVar("T")


class DBConstructor(t.Protocol[T]):
    def __call__(self, table_name: str, *, endpoint_url: str) -> T:
        ...


def dynamodb_table(
    cls: DBConstructor,
    attribute_definitions: t.List[t.Dict[str, str]],
    key_schema: t.List[t.Dict[str, str]],
):
    table_name = secrets.token_urlsafe()

    endpoint_url = "http://localhost:8000"
    db = boto3.client("dynamodb", endpoint_url=endpoint_url)

    db.create_table(
        TableName=table_name,
        AttributeDefinitions=attribute_definitions,
        KeySchema=key_schema,
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

        yield cls(table_name, endpoint_url=endpoint_url)

    finally:
        db.delete_table(TableName=table_name)
