import * as cdk from "@aws-cdk/core";
import * as ecr from "@aws-cdk/aws-ecr";

export interface RepositoryStackProps extends cdk.StackProps {}

export class RepositoryStack extends cdk.Stack {
  public readonly repository: ecr.Repository;

  constructor(scope: cdk.Construct, id: string, props: RepositoryStackProps) {
    super(scope, id, props);

    this.repository = new ecr.Repository(this, "Repository");
  }
}
