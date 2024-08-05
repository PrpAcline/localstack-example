import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { serve } from "@hono/node-server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { ulid } from "ulid";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_NAME = process.env.DATABASE_NAME;

const dynamo = new DynamoDBClient({ region: "us-east-2" });
const ddb = DynamoDBDocument.from(dynamo);

const app = new Hono();

app.get("/up", (c) => c.json({ status: "up" }));

app.post("/users", async (c) => {
  await ddb.put({
    TableName: DATABASE_NAME,
    Item: { pk: ulid(), sk: "USER" },
  });
  return c.json({ created: true }, 204);
});

app.get("/users", async (c) => {
  const result = await ddb.scan({ TableName: DATABASE_NAME });

  return c.json({ items: result.Items });
});

app.get("/count", async (c) => {
  const result = await ddb.get({
    TableName: DATABASE_NAME,
    Key: { pk: "COUNT", sk: "COUNT" },
  });

  return c.json(result);
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  serve(app, ({ port }) => {
    console.log(`listening on port ${port}`);
  });
}

export const handler = handle(app);
