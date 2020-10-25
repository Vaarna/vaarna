#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { InfraStack } from "./infra";
import { RepositoryStack } from "./repository";

const app = new cdk.App();

const env: cdk.Environment = {
  region: "eu-west-1",
};

const ecrStack = new RepositoryStack(app, "Repository", {
  env,
});

const infra = new InfraStack(app, "Infra", {
  env,
  hostedZoneId: "Z2XBOYPS0C2NI",
  zoneName: "remming.org",
  repository: ecrStack.repository,
  imageTag: "latest",
});
