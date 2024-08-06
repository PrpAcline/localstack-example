import * as cdk from "aws-cdk-lib";
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sources from "aws-cdk-lib/aws-lambda-event-sources";

export const setupDynamo = (stack: cdk.Stack, tableName: string) => {
  const table = new ddb.Table(stack, "app-table", {
    tableName,
    partitionKey: { name: "pk", type: ddb.AttributeType.STRING },
    sortKey: { name: "sk", type: ddb.AttributeType.STRING },
    stream: ddb.StreamViewType.NEW_IMAGE,
    billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
  });

  const countHandler = new nodejs.NodejsFunction(stack, "count-handler", {
    runtime: lambda.Runtime.NODEJS_20_X,
    entry: "src/db/update-count.ts",
    environment: { TABLE_NAME: table.tableName },
    bundling: {
      format: nodejs.OutputFormat.ESM,
      platform: "node",
    },
  });

  countHandler.addEventSource(
    new sources.DynamoEventSource(table, {
      batchSize: 1,
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
    }),
  );

  table.grantReadWriteData(countHandler);

  return table;
};
