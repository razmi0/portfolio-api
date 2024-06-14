import { cors } from "hono/cors";

const frontOrigin = (
  process.env.NODE_ENV === "development"
    ? `${process.env.DEV_FRONT_ORIGIN}${process.env.DEV_FRONT_PORT}`
    : process.env.PROD_FRONT_ORIGIN
) as string;

if (!frontOrigin) throw new Error(`Front origin is not set : ${frontOrigin?.slice(0, 5)}`);

const basePath = process.env.API_BASEPATH as string;
if (!basePath) throw new Error("Base path is not set");

const setupCors = cors({
  origin: [frontOrigin],
  allowMethods: ["POST"],
  allowHeaders: ["Access-Control-Allow-Origin"],
});

export { basePath, frontOrigin, setupCors };
