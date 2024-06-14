import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import { v4 as uuidv4 } from "uuid";
import turso from "./db";

console.log("Server started!");

export const config = {
  runtime: "edge",
};

const app = new Hono().basePath("/api");

app.use(
  "/contact",
  cors({
    origin: ["http://localhost:5173"],
    allowMethods: ["POST"],
    allowHeaders: ["Access-Control-Allow-Origin"],
  })
);

type ContactFormType = {
  tel: string;
  email: string;
  msg: string;
  hp?: string;
};

type ErrorTableArgs = [string, string, string];
type MessagesTableArgs = [string, string, string, string];

const regexp = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  tel: /^\d{10}$/,
};

const hasLength = (str: string) => str.length > 0;
const isValidEmail = (email: string) => hasLength(email) && regexp.email.test(email);
const isValidTel = (tel: string) => hasLength(tel) && regexp.tel.test(tel);
const userIsReachable = (tel: string, email: string) => isValidEmail(email) || isValidTel(tel);

app.all("/contact", async (c) => {
  console.log(`all : [${c.req.method}] /contact`);
  const res = { authorized: false, success: false };
  const id = uuidv4();
  const data = (await c.req.json()) as ContactFormType;

  const errors = [
    !isValidEmail(data.email) && "Invalid email",
    !isValidTel(data.tel) && "Invalid tel",
    !hasLength(data.msg) && "Invalid message",
    data.hp && "Invalid HP",
  ];

  if (errors.some((e) => e) || !userIsReachable(data.tel, data.email)) {
    console.log("Invalid form", { email: data.email, message: data.msg, tel: data.tel });
    const _ = await turso.execute({
      sql: "INSERT INTO error VALUES (?, ?, ?)",
      /* id : varchar, field : varchar, content : varchar */
      args: [id, "contact", errors.filter((e) => e).join(", ")] as ErrorTableArgs,
    });
    return c.json({ ...res, errors });
  }

  const _ = await turso.execute({
    sql: "INSERT INTO messages VALUES (?, ?, ?, ?)",
    /* varchar, varchar, varchar, text */
    args: [id, data.tel, data.email, data.msg] as MessagesTableArgs,
  });
  console.log("Inserted message", id, data.tel, data.email, data.msg);

  return c.json({ ...res, authorized: true, success: true });
});

export default handle(app);
