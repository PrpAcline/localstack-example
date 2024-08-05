import type { DynamoDBStreamHandler } from "aws-lambda";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const dynamo = new DynamoDB({ region: "us-east-2" });
const ddb = DynamoDBDocument.from(dynamo);

export const handler: DynamoDBStreamHandler = async (event, context) => {
  console.log(JSON.stringify(event, null, 2));
  console.log(JSON.stringify(context, null, 2));

  const result = event.Records.filter(
    (r) =>
      r.eventName === "INSERT" && (r.dynamodb?.NewImage?.sk as any) === "USER",
  ).map(async (_r) => {
    let count: number = 0;
    try {
      const countRecord = await ddb.get({
        TableName: process.env.TABLE_NAME,
        Key: { pk: "COUNT" },
      });

      count = countRecord.Item?.count;
    } catch (e) {
      console.error(e);
    }

    return ddb.put({
      TableName: process.env.TABLE_NAME,
      Item: { pk: "COUNT", sk: "COUNT", count: count + 1 },
    });
  });

  const promises = await Promise.allSettled(result);

  console.log(promises);
};
