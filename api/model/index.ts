import { createClient } from "@libsql/client";
import { insertErrors, deleteErrors, getErrors } from "./errors";
import { insertMessage } from "./message";

if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL is not set");
if (!process.env.TURSO_AUTH_TOKEN) throw new Error("TURSO_AUTH_TOKEN is not set");

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default turso;
export const db = {
  insertErrors,
  deleteErrors,
  getErrors,
  insertMessage,
};
