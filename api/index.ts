/**
 * @todo the client will automatically add this cookie
 * @todo the server will automatically check the cookie and compare it with the server side token
 */

import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { sign, verify } from "hono/jwt";
import { handle } from "hono/vercel";
import { buildId, timeStamp } from "./helper";
import { db } from "./model";
import { authCors, basePath, setupCors as cors } from "./setup";
import type { ContactFormType, LoginFormType, MinimalResponse, UserAgentInfo } from "./types";
import { isInvalidUser, isValuableAgentData, validateContactForm, validateLoginForm } from "./validation";
console.log("/** START **/");

const tkSec = process.env.TOKEN_SECRET;
export const config = {
  runtime: "edge",
};

const app = new Hono().basePath(basePath);

app.use("/contact", cors);
app.use("/agent", cors);
app.use("/login", cors);
app.use("/auth/*", authCors, async (c, next) => {
  const clientTk = c.req.header("Authorization")?.split(" ")[1];
  if (!clientTk) throw new HTTPException(401, { message: "Unauthorized" });
  /**
   * user : string
   * exp : number
   */
  const decodedPayload = await verify(clientTk, tkSec as string, "HS256");
  console.log("decodedPayload : ", decodedPayload);
  if (!decodedPayload) throw new HTTPException(401, { message: "Unauthorized" });
  await next();
});

/**
 * @description Contact form endpoint
 * @method POST
 * @table messages (id, name, email, message)
 * @table errors (id, field, content)
 */
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

/**
 * @description Agent registration endpoint
 * @method POST
 * @table agents (id, userAgent, platform, hardware, locale, connection, population)
 */
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

/**
 * @description Login endpoint
 * @method POST
 * @table users (id, username, password)
 */
app.all("/login", async (c) => {
  console.log(`all : [${c.req.method}] /login`);

  const res: MinimalResponse = { authorized: false, success: false };

  const data = (await c.req.json()) as LoginFormType;
  const formError = validateLoginForm(data);

  if (formError.hasError) {
    const _ = await db.insertErrors(buildId(), Object.entries(formError.errors), "login");
    return c.json({ res, errors: formError.errors });
  }

  const user = await db.getUser(data.username, data.password);
  const invalid = isInvalidUser(user);
  if (invalid.hasError) throw new HTTPException(401, { message: "Invalid credentials" }); // return c.json({ res, errors: invalid }); //

  // AUTHENTICATED USER

  const tsOptions = { days: 2 };
  const ts = timeStamp(tsOptions);
  const payload = {
    user: data.username,
    exp: ts.timestamp,
  };

  const token = await sign(payload, tkSec as string);

  setCookie(c, "token", token, {
    httpOnly: true,
    secure: true,
    path: "/auth",
    expires: ts.date,
    maxAge: tsOptions.days * 24 * 60 * 60, // 2 days in seconds
    sameSite: "none",
  });

  res.authorized = true;
  res.success = true;

  console.log("Login success", data.username);

  return c.json({ res, token, payload });
});

app.all("/auth/hi", async (c) => {
  console.log(`${c.req.method} /auth`);
  const res = { authorized: true, success: true, message: "Hello, you are authorized from hi" };
  return c.json(res);
});

app.all("/auth/ho", async (c) => {
  console.log(`${c.req.method} /auth`);
  const res = { authorized: true, success: true, message: "Hello, you are authorized from hoo" };
  return c.json(res);
});

console.log("/** END **/");
export default handle(app);
