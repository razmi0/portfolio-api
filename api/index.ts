/**
 * @todo the client will automatically add this cookie
 * @todo the server will automatically check the cookie and compare it with the server side token
 */

import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { sign, verify } from "hono/jwt";
import { handle } from "hono/vercel";
import { v4 as uuidv4 } from "uuid";
import { buildAgentHeader, timeStamp } from "./helper";
import { db } from "./model";
import { authCors, basePath, setupCors as cors } from "./setup";
import type { ContactFormType, LoginFormType, MinimalResponse, UserAgentInfo } from "./types";
import { isInvalidUser, validateContactForm, validateLoginForm } from "./validation";

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
  console.log("connection : ", decodedPayload);
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

  const id = uuidv4();
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
 * @table agents ( ip, created_at, updated_at, platform, city, continent, country, region, latitude, longitude, timezone)
 */
app.all("/agent", async (c) => {
  console.log(`all : [${c.req.method}] /agent`);

  const res: MinimalResponse = { authorized: false, success: false };
  const { platform }: Pick<UserAgentInfo, "platform"> = await c.req.json();

  const success = await db.startAgentTransaction({ ...buildAgentHeader(c), platform, id: uuidv4() });
  if (!success) return c.json(res);

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
    const _ = await db.insertErrors(uuidv4(), Object.entries(formError.errors), "login");
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

app.get("/auth/msgs", async (c) => {
  console.log(`${c.req.method} /auth/msgs`);
  const res = await db.findAll("messages");
  if (!res) return c.json({ success: false });
  return c.json(res.rows);
});

app.get("/auth/users", async (c) => {
  console.log(`${c.req.method} /auth/users`);
  const res = await db.findAllUsers();
  if (!res) return c.json({ success: false });
  return c.json(res.rows);
});

app.get("/auth/agents", async (c) => {
  console.log(`${c.req.method} /auth/agents`);
  const res = await db.findAll("agent");
  if (!res) return c.json({ success: false });
  console.log(res);
  return c.json(res.rows);
});

app.get("/auth/errors", async (c) => {
  console.log(`${c.req.method} /auth/errors`);
  const res = await db.findAll("error");
  if (!res) return c.json({ success: false });
  return c.json(res.rows);
});

export default handle(app);

// Headers :  {
//   platform: 'Windows', if(windows === undefined) find in userAgent(Iphone, macintosh, linux, android);
//   x-real-ip: '88.165.192.198',
//   x-vercel-ip-city: 'Castanet-Tolosan',
//   x-vercel-ip-continent: 'EU',
//   x-vercel-ip-country: 'FR',
//   x-vercel-ip-country-region: 'OCC',
//   x-vercel-ip-latitude: '43.5179',
//   x-vercel-ip-longitude: '1.5001',
//   x-vercel-ip-timezone: 'Europe/Paris',
// }

// agents cols :
// id, created_at, updated_at, platform, population, ip, city, continent, country, region, latitude, longitude, timezone
