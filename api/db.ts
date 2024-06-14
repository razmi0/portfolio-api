import { createClient } from "@libsql/client";
import type { ContactFormType, ErrorTableArgs, MessagesTableArgs } from "./types";

if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL is not set");
if (!process.env.TURSO_AUTH_TOKEN) throw new Error("TURSO_AUTH_TOKEN is not set");

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const insertErrors = async (id: string, errors: string[], field: string = "contact") => {
  const dbRes = await turso.execute({
    sql: "INSERT INTO error VALUES (?, ?, ?)",
    /* id : varchar, field : varchar, content : varchar */
    args: [id, field, errors.filter((e) => e).join(", ")] as ErrorTableArgs,
  });
  return dbRes;
};

export const insertMessage = async (data: ContactFormType & { id: string }) => {
  const { id, tel, email, msg } = data;
  const dbRes = await turso.execute({
    sql: "INSERT INTO messages VALUES (?, ?, ?, ?)",
    /* varchar, varchar, varchar, text */
    args: [id, tel, email, msg] as MessagesTableArgs,
  });
  console.log("Inserted message", id, data.tel, data.email, data.msg);
  return dbRes;
};

export default turso;
