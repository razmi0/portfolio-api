import { AgentTableArgs, UserAgentInfo } from "../types";
import turso from "./index";

/**
 * Insert an agent to the database
 * @table agent
 * @column id : varchar
 * @column userAgent : varchar
 * @column platform : varchar
 * @column hardware : varchar
 * @column locale : varchar
 * @column connection : varchar
 * @column population : int
 */
const insertNewAgent = async (data: UserAgentInfo & { id: string }) => {
  const { id, userAgent, platform, hardware, locale, connection } = data;
  const population = 1;
  const dbRes = await turso.execute({
    sql: "INSERT INTO agent VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [id, userAgent, platform, hardware, locale, connection, population] as AgentTableArgs,
  });
  console.log(
    "Inserted agent",
    id,
    data.userAgent,
    data.platform,
    data.hardware,
    data.locale,
    data.connection,
    population
  );
  return dbRes;
};

const getSimilarAgentID = async (data: UserAgentInfo): Promise<false | string> => {
  const { userAgent, platform, hardware, locale, connection } = data;
  const dbRes = await turso.execute({
    sql: "SELECT id FROM agent WHERE userAgent = ? AND platform = ? AND hardware = ? AND locale = ? AND connection = ?",
    args: [userAgent, platform, hardware, locale, connection],
  });
  if (dbRes.rows.length === 0) return false;
  return dbRes.rows[0][0] as string;
};

const incrementPopulation = async (id: string) => {
  const dbRes = await turso.execute({
    sql: "UPDATE agent SET population = population + 1 WHERE id = ?",
    args: [id],
  });
  console.log("Incremented population", id);
  return dbRes;
};

type AgentTransactionState = "STARTED" | "COMMITED" | "ROLLBACKED" | "FOUNDED" | "ADDED" | "CLOSED";
const startAgentTransaction = async (data: UserAgentInfo & { id: string }) => {
  let transactionState: AgentTransactionState = "STARTED";
  const transaction = await turso.transaction("write");

  try {
    const id = await getSimilarAgentID(data);
    if (!id) {
      transactionState = "ADDED";
      await insertNewAgent(data);
    } else {
      transactionState = "FOUNDED";
      await incrementPopulation(id);
    }
    transactionState = "COMMITED";
    await transaction.commit();
  } catch (e) {
    console.error(`Transaction failed at: ${transactionState} -- Transaction rollbacked`, e);
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
