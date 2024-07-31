import * as cdk from "aws-cdk-lib";
import { setupDynamo } from "./db-setup";

const app = new cdk.App();
const stack = new cdk.Stack(app, "local", {
  env: {
    region: "us-east-2",
  },
});

const table = setupDynamo(stack, "localTable");
