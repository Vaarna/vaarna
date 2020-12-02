import typing as t
from abc import ABC


class TableDB(ABC):
    def set_table(self, space_id: str, asset_id: str) -> None:
        ...

    def get_table(self, space_id: str) -> t.Optional[str]:
        ...


# --- IN MEMORY ---


class TableInMemory(TableDB):
    def __init__(self):
        self._db: t.Dict[str, str] = {}

    def set_table(self, space_id: str, asset_id: str) -> None:
        self._db[space_id] = asset_id

    def get_table(self, space_id: str) -> t.Optional[str]:
        return self._db.get(space_id, None)


# --- DYNAMODB ---


import boto3


class TableDynamoDB(TableDB):
    def __init__(self, table_name: str, *, endpoint_url=None):
        self.table = boto3.resource("dynamodb", endpoint_url=endpoint_url).Table(
            table_name
        )

    def set_table(self, space_id: str, asset_id: str) -> None:
        self.table.put_item(Item={"space_id": space_id, "asset_id": asset_id})

    def get_table(self, space_id: str) -> t.Optional[str]:
        res = self.table.get_item(Key={"space_id": space_id})

        if "Item" not in res:
            return None

        return res["Item"]["asset_id"]
