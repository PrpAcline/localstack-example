import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { serve } from "@hono/node-server";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { ulid } from "ulid";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_NAME = process.env.DATABASE_NAME;

console.log(DATABASE_NAME);

const dynamo = new DynamoDBClient({
  endpoint: "http://localhost:4566",
  region: "us-east-2",
});

const app = new Hono();

app.get("/up", (c) => c.json({ status: "up" }));

app.post("/users", async (c) => {
  return c.json({ created: true }, 204);
});

app.get("/users", async (c) => {
  const result = await dynamo.send(
    new ScanCommand({ TableName: DATABASE_NAME }),
  );

  return c.json(result);
});

export const handler = handle(app);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  serve(app, ({ port }) => {
    console.log(`listening on port ${port}`);
  });
}
