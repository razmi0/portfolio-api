import { v4 as uuidv4 } from "uuid";

const buildId = () => {
  const date = new Date();
  return [date.getHours(), date.getMinutes(), date.getSeconds(), uuidv4().slice(5)].map((d) => d.toString()).join("");
};

export { buildId };
