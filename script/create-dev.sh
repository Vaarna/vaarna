#!/bin/sh

export AWS_ACCESS_KEY_ID=local
export AWS_SECRET_ACCESS_KEY=verysecret
export AWS_REGION=eu-west-1
export AWS_PAGER=

aws --endpoint-url http://localhost:9000 \
    s3 mb s3://gm-screen &

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

aws --endpoint-url http://localhost:8000 \
    dynamodb create-table \
    --table-name Space \
    --attribute-definitions \
        AttributeName=spaceId,AttributeType=S \
        AttributeName=sk,AttributeType=S \
    --key-schema \
        AttributeName=spaceId,KeyType=HASH \
        AttributeName=sk,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST &

aws --endpoint-url http://localhost:8000 \
    dynamodb create-table \
    --table-name User \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
        AttributeName=sk,AttributeType=S \
        AttributeName=sessionId,AttributeType=S \
    --key-schema \
        AttributeName=userId,KeyType=HASH \
        AttributeName=sk,KeyType=RANGE \
    --global-secondary-index \
        'IndexName=reverse,KeySchema=[{AttributeName=sk,KeyType=HASH}],Projection={ProjectionType=KEYS_ONLY}' \
        'IndexName=sessionId,KeySchema=[{AttributeName=sessionId,KeyType=HASH}],Projection={ProjectionType=ALL}' \
    --billing-mode PAY_PER_REQUEST &

wait

exit 0
