import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as iam from "@aws-cdk/aws-iam";

export interface DataStackProps extends cdk.StackProps {
  dev?: boolean;
}

export class DataStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: DataStackProps) {
    super(scope, id, props);

    const removalPolicy =
      props.dev ?? false ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN;

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
      name: "data",
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      grantee,
      removalPolicy,
    });
  }

  private table({
    name,
    grantee,
    removalPolicy,
    partitionKey,
    sortKey,
  }: {
    name: string;
    grantee: iam.IGrantable;
    removalPolicy: cdk.RemovalPolicy;
    partitionKey: dynamodb.Attribute;
    sortKey?: dynamodb.Attribute;
  }): dynamodb.Table {
    const table = new dynamodb.Table(this, `${name}Table`, {
      partitionKey,
      sortKey,
      removalPolicy,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    table.grantReadWriteData(grantee);

    new cdk.CfnOutput(this, `${name}TableName`, { value: table.tableName });

    return table;
  }
}
