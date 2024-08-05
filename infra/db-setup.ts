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
    stream: ddb.StreamViewType.NEW_AND_OLD_IMAGES,
  });

  const countHandler = new nodejs.NodejsFunction(stack, "count-handler", {
    entry: "src/db/update-count.ts",
    environment: {
      TABLE_NAME: table.tableName,
    },
  });

  countHandler.addEventSource(
    new sources.DynamoEventSource(table, {
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
    }),
  );

  return table;
};
