import { buildId } from "./helper";
import { db } from "./model";

export const testingError = async () => {
  let status = "INSERT";
  try {
    const id = buildId();
    await db.insertErrors(id, ["error1", "error2", "error3"], "contact");
    status = "GET";
    await db.getErrors(id);
    status = "DELETE";
    await db.deleteErrors(id);
    console.log("[INFO] : Testing connection to db STEP : SUCCESS");
    return true;
  } catch (e) {
    console.error(`[ERROR] : Testing connection to db STEP ${status} : ${e}`);
    return false;
  }
};
