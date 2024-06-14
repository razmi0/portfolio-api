import { Hono } from "hono";
import { handle } from "hono/vercel";
import { v4 as uuidv4 } from "uuid";
import { insertErrors, insertMessage } from "./db";
import { basePath, setupCors as cors } from "./setup";
import type { ContactFormType } from "./types";
import { validateContactForm } from "./validation";

console.log("Server started!");

export const config = {
  runtime: "edge",
};

const app = new Hono().basePath(basePath);

app.use("/contact", cors);

app.all("/contact", async (c) => {
  console.log(`all : [${c.req.method}] /contact`);

  const res = { authorized: false, success: false };

  const id = buildId();
  const data = (await c.req.json()) as ContactFormType;

  const { errors, hasError } = validateContactForm(data);

  if (hasError) {
    const _ = await insertErrors(id, errors as string[], "contact");
    return c.json(res);
  }

  const _ = await insertMessage({ ...data, id });

  return c.json({ ...res, authorized: true, success: true });
});

const buildId = () => {
  const date = new Date();
  return [date.getHours(), date.getMinutes(), date.getSeconds(), uuidv4().slice(5)].map((d) => d.toString()).join("");
};

export default handle(app);
