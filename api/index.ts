import { Hono } from "hono";
import { handle } from "hono/vercel";
import { buildId } from "./helper";
import { db } from "./model";
import { basePath, setupCors as cors } from "./setup";
import type { ContactFormType, MinimalResponse, UserAgentInfo } from "./types";
import { isValuableAgentData, validateContactForm } from "./validation";

console.log("Server started!");

export const config = {
  runtime: "edge",
};

const app = new Hono().basePath(basePath);
app.use("/contact", cors);
app.use("/agent", cors);

app.all("/contact", async (c) => {
  console.log(`all : [${c.req.method}] /contact`);

  const res: MinimalResponse = { authorized: false, success: false };

  const id = buildId();
  const data = (await c.req.json()) as ContactFormType;

  const { errors, hasError } = validateContactForm(data);

  if (hasError) {
    const _ = await db.insertErrors(id, errors, "contact");
    return c.json(res);
  }

  const _ = await db.insertMessage({ ...data, id });

  res.authorized = true;
  res.success = true;

  return c.json(res);
});

app.all("/agent", async (c) => {
  console.log(`all : [${c.req.method}] /agent`);

  const res: MinimalResponse = { authorized: false, success: false };
  const id = buildId();
  const data: UserAgentInfo = await c.req.json();
  if (!isValuableAgentData(data)) return c.json(res);

  const success = await db.startAgentTransaction({ ...data, id });

  res.authorized = success;
  res.success = success;

  return c.json(res);
});

export default handle(app);
