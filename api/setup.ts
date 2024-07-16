import { cors } from "hono/cors";

const frontOrigin = (
  process.env.NODE_ENV === "development"
    ? `${process.env.DEV_FRONT_ORIGIN}${process.env.DEV_FRONT_PORT}`
    : process.env.PROD_FRONT_ORIGIN
) as string;

if (!frontOrigin) throw new Error(`Front origin is not set : ${frontOrigin?.slice(0, 5)}`);
if (!process.env.TOKEN_SECRET) throw new Error("Token secret is not set");

const basePath = process.env.API_BASEPATH as string;
if (!basePath) throw new Error("Base path is not set");

const setupCors = cors({
  origin: [frontOrigin],
  allowMethods: ["POST", "GET"],
  allowHeaders: ["Access-Control-Allow-Origin"],
});

const authCors = cors({
  origin: [frontOrigin], // frontOrigin
  allowMethods: ["POST", "GET", "OPTIONS"],
  allowHeaders: ["Access-Control-Allow-Origin", "Authorization", "Access-Control-Allow-Credentials"],
  // exposeHeaders: ["Authorization", "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"],
  credentials: true,
});

export { authCors, basePath, frontOrigin, setupCors };
