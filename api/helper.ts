import { v4 as uuidv4 } from "uuid";

const buildId = () => {
  const date = new Date();
  return [date.getHours(), date.getMinutes(), date.getSeconds(), uuidv4().slice(5)].map((d) => d.toString()).join("");
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
const timeStamp = (time: TimeStamp) => {
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

export { buildId, timeStamp };
