import type { Context } from "hono";
import type { BlankEnv, BlankInput } from "hono/types";
import { UserAgentInfo } from "./types";

export const buildAgentHeader = (
  c: Context<BlankEnv, `${string}/agent`, BlankInput>
): Omit<UserAgentInfo, "created_at" | "updated_at" | "platform" | "population" | "id"> => {
  return {
    ip:
      c.req.header("x-real-ip") ||
      c.req.header("x-forwarded-for") ||
      c.req.header("x-vercel-ip") ||
      c.req.header("x-vercel-real-ip") ||
      c.req.header("x-vercel-forwarded-for") ||
      c.req.header("x-vercel-client-ip") ||
      "unknown",
    city: c.req.header("x-vercel-ip-city") || "unknown",
    continent: c.req.header("x-vercel-ip-continent") || "unknown",
    country: c.req.header("x-vercel-ip-country") || "unknown",
    region: c.req.header("x-vercel-ip-country-region") || "unknown",
    latitude: c.req.header("x-vercel-ip-latitude") || "unknown",
    longitude: c.req.header("x-vercel-ip-longitude") || "unknown",
    timezone: c.req.header("x-vercel-ip-timezone") || "unknown",
  };
};

type TimeStamp = Partial<{
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}>;

/**
 * @description Create a timestamp
 * @returns - Date object and timestamp in milliseconds
 */
export const timeStamp = (time: TimeStamp) => {
  const msNow = Date.now();
  const timestamp =
    msNow +
    (time.days || 0) * 24 * 60 * 60 * 1000 +
    (time.hours || 0) * 60 * 60 * 1000 +
    (time.minutes || 0) * 60 * 1000 +
    (time.seconds || 0) * 1000;
  return {
    date: new Date(timestamp),
    timestamp,
  };
};
