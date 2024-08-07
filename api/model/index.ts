import { createClient } from "@libsql/client";
import { startAgentTransaction } from "./agent";
import { deleteErrors, getErrors, insertErrors } from "./errors";
import { insertMessage } from "./message";
import { findAllUsers, getUser } from "./users";

if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL is not set");
if (!process.env.TURSO_AUTH_TOKEN) throw new Error("TURSO_AUTH_TOKEN is not set");

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const findAll = async (table: "agent" | "error" | "messages") => {
  switch (table) {
    case "agent":
      return await turso.execute("SELECT * FROM agent");
    case "error":
      return await turso.execute("SELECT * FROM error");
    case "messages":
      return await turso.execute("SELECT * FROM messages");
    default:
      return null;
  }
};

export default turso;

export const db = {
  insertErrors,
  deleteErrors,
  getErrors,
  insertMessage,
  startAgentTransaction,
  getUser,
  findAllUsers,
  findAll,
};
