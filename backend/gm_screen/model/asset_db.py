import typing as t
from abc import ABC

from .asset import Asset


class AssetDB(ABC):
    def put_asset(self, space_id: str, asset: Asset) -> None:
        ...

    def get_asset(self, space_id: str, asset_id: str) -> t.Optional[Asset]:
        ...

    def list_assets(self, space_id: str) -> t.Iterable[Asset]:
        ...


# --- IN MEMORY ---


from collections import defaultdict


class AssetInMemory(AssetDB):
    def __init__(self):
        self._db: t.Dict[str, t.Dict[str, Asset]] = defaultdict(dict)

    def put_asset(self, space_id: str, asset: Asset) -> None:
        self._db[space_id][asset.id] = asset

    def get_asset(self, space_id: str, asset_id: str) -> t.Optional[Asset]:
        return self._db[space_id].get(asset_id, None)

    def list_assets(self, space_id: str) -> t.Iterable[Asset]:
        return (asset for asset in self._db[space_id].values())


# --- DYNAMODB ---


import boto3
from boto3.dynamodb.conditions import Key


class AssetDynamoDB(AssetDB):
    def __init__(self, table_name: str, *, endpoint_url=None):
        self.table = boto3.resource("dynamodb", endpoint_url=endpoint_url).Table(
            table_name
        )

    def put_asset(self, space_id: str, asset: Asset) -> None:
        item = asset.dict()
        item.update({"space_id": space_id, "asset_id": asset.id})
        self.table.put_item(
            Item=item,
        )

    def get_asset(self, space_id: str, asset_id: str) -> t.Optional[Asset]:
        res = self.table.get_item(
            Key={"space_id": space_id, "asset_id": asset_id},
        )

        if "Item" not in res:
            return None

        return Asset(**res["Item"])

    def list_assets(self, space_id: str) -> t.Iterable[Asset]:
        res = self.table.query(KeyConditionExpression=Key("space_id").eq(space_id))
        yield from (Asset(**item) for item in res["Items"])
        lek = res.get("LastEvaluatedKey", None)

        while lek is not None:
            res = self.table.scan(
                ExclusiveStartKey=lek,
            )
            yield from (Asset(**item) for item in res["Items"])
            lek = res.get("LastEvaluatedKey", None)
