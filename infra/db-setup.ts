import * as cdk from "aws-cdk-lib";
import * as ddb from "aws-cdk-lib/aws-dynamodb";

export const setupDynamo = (stack: cdk.Stack, tableName: string) => {
  const table = new ddb.Table(stack, "app-table", {
    tableName,
    partitionKey: { name: "pk", type: ddb.AttributeType.STRING },
    sortKey: { name: "sk", type: ddb.AttributeType.STRING },
  });

  return table;
};
