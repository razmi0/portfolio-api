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
const timeStamp = (time: TimeStamp) =>
  Math.floor(Date.now() / 1000) +
  (time.days || 0) * 24 * 60 * 60 +
  (time.hours || 0) * 60 * 60 +
  (time.minutes || 0) * 60;

export { buildId, timeStamp };
