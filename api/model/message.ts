import type { ContactFormType, MessagesTableArgs } from "../types";
import turso from "./index";

/**
 * Insert a message to the database
 * @table messages
 * @column id : varchar
 * @column tel : varchar
 * @column email : varchar
 * @column msg : text
 */
const insertMessage = async (data: ContactFormType & { id: string }) => {
  const { id, tel, email, msg } = data;
  const dbRes = await turso.execute({
    sql: "INSERT INTO messages VALUES (?, ?, ?, ?)",
    args: [id, tel, email, msg] as MessagesTableArgs,
  });
  console.log("Inserted message", id, data.tel, data.email, data.msg);
  return dbRes;
};
export { insertMessage };
