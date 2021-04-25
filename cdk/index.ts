import * as cdk from "@aws-cdk/core";
import { DataStack } from "./data";

const app = new cdk.App();

const env: cdk.Environment = {
  region: "eu-west-1",
};

new DataStack(app, "DataStackStaging", {
  env,
  dev: true,
});

new DataStack(app, "DataStack", {
  env,
  dev: true,
});
