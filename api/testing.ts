import { buildId } from "./helper";
import { db } from "./model";

export const testingError = () => {
  let status = "INSERT";
  try {
    const id = buildId();
    db.insertErrors(id, ["error1", "error2", "error3"], "contact");
    status = "GET";
    db.getErrors(id);
    status = "DELETE";
    db.deleteErrors(id);
    console.log("[INFO] : Testing connection to db STEP : SUCCESS");
  } catch (e) {
    throw new Error(`[ERROR] : Testing connection to db STEP ${status} : ${e}`);
  }
};
