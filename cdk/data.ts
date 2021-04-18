import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as iam from "@aws-cdk/aws-iam";

export interface DataStackProps extends cdk.StackProps {
  dev?: boolean;
}

export class DataStack extends cdk.Stack {
  private readonly removalPolicy: cdk.RemovalPolicy;

  constructor(scope: cdk.Construct, id: string, props: DataStackProps) {
    super(scope, id, props);

    const removalPolicy =
      props.dev ?? false ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN;
    this.removalPolicy = removalPolicy;

    const iamUser = new iam.User(this, "iamUser");
    iamUser.applyRemovalPolicy(removalPolicy);

    const accessKey = new iam.CfnAccessKey(this, "accessKey", {
      userName: iamUser.userName,
    });
    new cdk.CfnOutput(this, "accessKeyId", { value: accessKey.ref });
    new cdk.CfnOutput(this, "secretAccessKey", {
      value: accessKey.attrSecretAccessKey,
    });

    const assetBucket = new s3.Bucket(this, "assetBucket", {
      removalPolicy,
    });
    assetBucket.grantReadWrite(iamUser);
    new cdk.CfnOutput(this, "assetBucketName", { value: assetBucket.bucketName });

    const grantee = iamUser;

    this.table({
      name: "assetData",
      sortKey: { name: "assetId", type: dynamodb.AttributeType.STRING },
      grantee,
      removalPolicy,
    });

    this.table({
      name: "item",
      sortKey: { name: "itemId", type: dynamodb.AttributeType.STRING },
      grantee,
      removalPolicy,
    });

    this.table({
      name: "table",
      grantee,
      removalPolicy,
    });

    this.table({
      name: "log",
      sortKey: { name: "messageId", type: dynamodb.AttributeType.STRING },
      grantee,
      removalPolicy,
    });
  }

  private table({
    name,
    grantee,
    removalPolicy,
    sortKey,
  }: {
    name: string;
    grantee: iam.IGrantable;
    removalPolicy: cdk.RemovalPolicy;
    sortKey?: dynamodb.Attribute;
  }): dynamodb.Table {
    const table = new dynamodb.Table(this, `${name}Table`, {
      partitionKey: { name: "spaceId", type: dynamodb.AttributeType.STRING },
      sortKey,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy,
    });
    table.grantReadWriteData(grantee);

    new cdk.CfnOutput(this, `${name}TableName`, { value: table.tableName });

    return table;
  }
}
