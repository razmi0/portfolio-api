import type { UserTableArgs } from "../types";
import turso from "./index";

/**
 * Select a new user to the database and compare password
 * @table user
 * @column username : varchar
 * @column password : varchar
 */
export const getUser = async (username: string, password: string) => {
  const dbRes = await turso.execute({
    sql: "SELECT EXISTS (SELECT * FROM users WHERE username = ? AND password = ?) AS success",
    args: [username, password] as UserTableArgs,
  });
  return dbRes;
};
