import * as cdk from "aws-cdk-lib";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { setupDynamo } from "./db-setup";
import * as path from "node:path";
import agw from "aws-cdk-lib/aws-apigatewayv2";
import agwi from "aws-cdk-lib/aws-apigatewayv2-integrations";

const app = new cdk.App();
const stack = new cdk.Stack(app, "test");

const appFn = new nodejs.NodejsFunction(stack, "app-fn", {
  entry: path.resolve(__dirname, "..", "src", "main.ts"),
});

const table = setupDynamo(stack, "appTable");

table.grantFullAccess(appFn);
const api = new agw.HttpApi(stack, "api");

api.addRoutes({
  path: "/{proxy+}",
  integration: new agwi.HttpLambdaIntegration("app-integration", appFn),
});
