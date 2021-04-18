#!/bin/sh

export AWS_ACCESS_KEY_ID=local
export AWS_SECRET_ACCESS_KEY=verysecret
export AWS_REGION=eu-west-1
export AWS_PAGER=

aws --endpoint-url http://localhost:9000 \
    s3 mb s3://gm-screen &

aws --endpoint-url http://localhost:8000 \
    dynamodb create-table \
    --table-name AssetData \
    --attribute-definitions \
        AttributeName=spaceId,AttributeType=S \
        AttributeName=assetId,AttributeType=S \
    --key-schema \
        AttributeName=spaceId,KeyType=HASH \
        AttributeName=assetId,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST &

aws --endpoint-url http://localhost:8000 \
    dynamodb create-table \
    --table-name Item \
    --attribute-definitions \
        AttributeName=spaceId,AttributeType=S \
        AttributeName=itemId,AttributeType=S \
    --key-schema \
        AttributeName=spaceId,KeyType=HASH \
        AttributeName=itemId,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST &

aws --endpoint-url http://localhost:8000 \
    dynamodb create-table \
    --table-name Table \
    --attribute-definitions \
        AttributeName=spaceId,AttributeType=S \
    --key-schema \
        AttributeName=spaceId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST &

aws --endpoint-url http://localhost:8000 \
    dynamodb create-table \
    --table-name Log \
    --attribute-definitions \
        AttributeName=spaceId,AttributeType=S \
        AttributeName=messageId,AttributeType=S \
    --key-schema \
        AttributeName=spaceId,KeyType=HASH \
        AttributeName=messageId,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST &

wait

exit 0
