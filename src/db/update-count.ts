import type { DynamoDBStreamHandler } from "aws-lambda";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const dynamo = new DynamoDB({ region: "us-east-2" });
const ddb = DynamoDBDocument.from(dynamo);

export const handler: DynamoDBStreamHandler = async (event, context) => {
  console.log(
    "Records: ",
    unmarshall(event.Records[0].dynamodb?.NewImage as any).sk === "USER",
  );
  console.log("eventName: ", event.Records[0].eventName === "INSERT");

  const result = event.Records.filter(
    (r) =>
      r.eventName === "INSERT" &&
      unmarshall(r.dynamodb?.NewImage as any).sk === "USER",
  ).map(async (r) => {
    console.log("HEY!!!!!");
    let count: number = 0;
    try {
      const countRecord = await ddb.get({
        TableName: process.env.TABLE_NAME,
        Key: { pk: "COUNT", sk: "COUNT" },
      });

      count = countRecord.Item?.count || 0;
    } catch (e) {
      console.log(e);
    }

    const result = await ddb.put({
      TableName: process.env.TABLE_NAME,
      Item: { pk: "COUNT", sk: "COUNT", count: count + 1 },
    });

    console.log(result);

    return result;
  });

  console.log("HERE");

  const promises = await Promise.all(result);

  return promises;
};
