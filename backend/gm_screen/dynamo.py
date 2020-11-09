from boto3.dynamodb.types import TypeDeserializer, TypeSerializer

_deserialize = TypeDeserializer().deserialize
_serialize = TypeSerializer().serialize


def deserialize(item):
    return {key: _deserialize(value) for key, value in item.items()}


def serialize(item):
    return {key: _serialize(value) for key, value in item.items()}
