import { ErrorTableArgs, ErrorTableFieldType } from "../types";
import turso from "./index";

/**
 * Insert errors to the database
 * @table error
 * @column id : varchar
 * @column field : varchar
 */
const insertErrors = async (
  id: string,
  errors: ErrorTableArgs | (string | false | undefined)[],
  field: ErrorTableFieldType = "contact"
) => {
  const dbRes = await turso.execute({
    sql: "INSERT INTO error VALUES (?, ?, ?)",

    args: [id, field, errors.filter((e) => e).join(", ")] as ErrorTableArgs,
  });
  return dbRes;
};

/**
 * Delete errors from the database
 * @table error
 * @column id : varchar
 */
const deleteErrors = async (id: string) => {
  const dbRes = await turso.execute({
    sql: "DELETE FROM error WHERE id = ?",
    args: [id] as [string],
  });
  return dbRes;
};

/**
 * Get errors from the database
 * @table error
 * @column id : varchar
 */
const getErrors = async (id: string) => {
  const dbRes = await turso.execute({
    sql: "SELECT * FROM error WHERE id = ?",
    args: [id] as [string],
  });
  return dbRes;
};

export { insertErrors, deleteErrors, getErrors };
