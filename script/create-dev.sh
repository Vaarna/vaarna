#!/bin/sh

export AWS_ACCESS_KEY_ID=local
export AWS_SECRET_ACCESS_KEY=verysecret
export AWS_REGION=eu-west-1
export AWS_PAGER=

aws --endpoint-url http://localhost:9000 \
    s3 mb s3://gm-screen &

aws --endpoint-url http://localhost:8000 \
    dynamodb create-table \
    --table-name Data \
    --attribute-definitions \
        AttributeName=pk,AttributeType=S \
        AttributeName=sk,AttributeType=S \
    --key-schema \
        AttributeName=pk,KeyType=HASH \
        AttributeName=sk,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST &

wait

exit 0
