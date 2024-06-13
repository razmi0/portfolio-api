import { createClient } from "@libsql/client";
import { Hono } from "hono";
import { handle } from "hono/vercel";

console.log("Server started!");

if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL is not set");
if (!process.env.TURSO_AUTH_TOKEN) throw new Error("TURSO_AUTH_TOKEN is not set");

export const config = {
  runtime: "edge",
};

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const app = new Hono().basePath("/api");

app.get("/", async (c) => {
  console.log("GET /");
  const users = await turso.execute("SELECT * FROM users");
  return c.json({ message: "Hello Hono!", users });
});

export default handle(app);
