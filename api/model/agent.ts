import { AgentTableArgs, UserAgentInfo } from "../types";
import turso from "./index";

/**
 * Insert an agent to the database
 * @table agent
 * @column ip
 * @column created_at
 * @column updated_at
 * @column platform
 * @column city
 * @column continent
 * @column country
 * @column region
 * @column latitude
 * @column longitude
 * @column timezone
 * @column population
 */
const insertNewAgent = async (data: Omit<UserAgentInfo, "created_at" | "updated_at" | "population">) => {
  const { id, ip, platform, city, continent, country, region, latitude, longitude, timezone } = data;

  const population = 1;
  const created_at = new Date(Date.now()).toLocaleString();
  const updated_at = created_at;

  const dbRes = await turso.execute({
    sql: "INSERT INTO agent VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: [
      id,
      ip,
      created_at,
      updated_at,
      platform,
      city,
      continent,
      country,
      region,
      latitude,
      longitude,
      timezone,
      population,
    ] as AgentTableArgs,
  });
  console.log("Inserted new agent", ip);
  return dbRes;
};

const getSimilarAgentIP = async (ip: string): Promise<false | string> => {
  const dbRes = await turso.execute({
    sql: "SELECT id FROM agent WHERE ip = ?",
    args: [ip],
  });

  if (dbRes.rows.length === 0) return false;
  return dbRes.rows[0][0] as string;
};

const incrementAgent = async (id: string) => {
  const updated_at = new Date(Date.now()).toLocaleString();
  const dbRes = await turso.execute({
    sql: "UPDATE agent SET population = population + 1, updated_at = ? WHERE id = ?",
    args: [updated_at, id],
  });
  console.log("Incremented population", id);
  return dbRes;
};

type AgentTransactionState = "STARTED" | "COMMITED" | "ROLLBACKED" | "FOUNDED" | "ADDED" | "CLOSED";
const startAgentTransaction = async (data: Omit<UserAgentInfo, "created_at" | "updated_at" | "population">) => {
  let transactionState: AgentTransactionState = "STARTED";
  const transaction = await turso.transaction("write");

  console.log(data);

  try {
    const id = await getSimilarAgentIP(data.ip);
    if (!id) {
      transactionState = "ADDED";
      await insertNewAgent(data);
    } else {
      transactionState = "FOUNDED";
      await incrementAgent(id);
    }
    transactionState = "COMMITED";
    await transaction.commit();
  } catch (e) {
    console.error(`Transaction failed at: ${transactionState} -- Transaction rollbacked`);
    console.error("[ERROR] : ", e);
    transactionState = "ROLLBACKED";
    await transaction.rollback();
    return false;
  }
  transactionState = "CLOSED";
  console.log("Transaction completed", transactionState);
  return true;
};

export { startAgentTransaction };
