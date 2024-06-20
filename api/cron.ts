import { testingError } from "./test";

const handler = async (req: any, res: any) => {
  const success = await testingError();
  success
    ? res.status(200).end(`[INFO] : Testing connection -- cron -- success`)
    : res.status(500).end("[ERROR] : Testing connection -- cron -- no success");
};

export default handler;
