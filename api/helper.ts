import { v4 as uuidv4 } from "uuid";

const buildId = () => {
  const date = new Date();
  return [date.getHours(), date.getMinutes(), date.getSeconds(), uuidv4().slice(5)].map((d) => d.toString()).join("");
};

type TimeStamp = {
  days?: number;
  hours?: number;
  minutes?: number;
};
/**
 * return an object with a date and a timestamp in seconds
 */
const timeStamp = (time: TimeStamp) => {
  const msNow = Date.now();
  const timestamp =
    Math.floor(msNow / 1000) + (time.days || 0) * 24 * 60 * 60 + (time.hours || 0) * 60 * 60 + (time.minutes || 0) * 60;
  const date = new Date(timestamp * 1000);

  return {
    date,
    timestamp,
  };
};

export { buildId, timeStamp };
