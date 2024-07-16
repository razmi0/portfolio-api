import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import { handle } from "hono/vercel";
import { buildId, timeStamp } from "./helper";
import { db } from "./model";
import { authCors, basePath, setupCors as cors } from "./setup";
import type { ContactFormType, LoginFormType, MinimalResponse, UserAgentInfo } from "./types";
import { isInvalidUser, isValuableAgentData, validateContactForm, validateLoginForm } from "./validation";
console.log("/** START **/");

export const config = {
  runtime: "edge",
};

const app = new Hono().basePath(basePath);

app.use("/contact", cors);
app.use("/agent", cors);
app.use("/login", cors);

// app.use("/auth/", authCors);

app.use(
  "/auth",
  authCors,
  async (c, next) => {
    const res: MinimalResponse = { authorized: false, success: false };
    console.log(`all : [${c.req.method}] /auth`);
    const clientTk = c.req.header("Authorization");
    console.log("clientTk : ", clientTk);
    console.log("ss cookie : ", getCookie(c)); // server side cookie
    if (!clientTk) return c.json(res);
    await next();
  }
  // bearerAuth({
  //   verifyToken: async (token, c) => {
  //     console.log("ss cookie : ", getCookie(c, "token")); // server side cookie
  //     console.log("client cookie : ", token); // client side cookie (token)
  //     return token === getCookie(c, "token");
  //   },
  // })
);

app.all("/auth", async (c) => {
  const res = { authorized: true, success: true };
  console.log(`${c.req.method} /auth`);
  return c.json(res);
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

  const ts = timeStamp({ minutes: 5 });
  const payload = {
    user: data.username,
    exp: ts.timestamp,
  };

  const token = await sign(payload, process.env.TOKEN_SECRET as string);

  setCookie(c, "token", token, {
    httpOnly: true,
    secure: true,
    domain: "portfolio-two-peach-27.vercel.app",
    expires: ts.date,
    path: "/",
  });

  res.authorized = true;
  res.success = true;

  console.log("Login success", data.username);
  console.log("Origin : ", c.req.header());

  return c.json({ res, token, payload });
});

console.log("/** END **/");

export default handle(app);
