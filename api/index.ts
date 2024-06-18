import { Hono } from "hono";
import { handle } from "hono/vercel";
import { buildId } from "./helper";
import { db } from "./model";
import { basePath, setupCors as cors } from "./setup";
import type { ContactFormType } from "./types";
import { validateContactForm } from "./validation";

console.log("Server started!");

export const config = {
  runtime: "edge",
};

const app = new Hono().basePath(basePath);
app.use("/contact", cors);
app.use("/", cors);

app.get("/", async (c) => {
  return c.json({ xxx: "xxxx" });
});

app.all("/contact", async (c) => {
  console.log(`all : [${c.req.method}] /contact`);

  const res = { authorized: false, success: false };

  const id = buildId();
  const data = (await c.req.json()) as ContactFormType;

  const { errors, hasError } = validateContactForm(data);

  if (hasError) {
    const _ = await db.insertErrors(id, errors, "contact");
    return c.json(res);
  }

  const _ = await db.insertMessage({ ...data, id });

  return c.json({ ...res, authorized: true, success: true });
});

export default handle(app);
