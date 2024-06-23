import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
});
export const writeCache = async (
  key: string,
  value: string,
  expiry: number
) => {
  if (!process.env.REDIS_URL) return;
  try {
    await client.connect();
    await client.setEx(key, expiry, value);
    await client.disconnect();
  } catch (e) {
    console.error(e);
  }
};

export const readCache = async (key: string) => {
  if (!process.env.REDIS_URL) return;
  try {
    await client.connect();
    const cachedValue = await client.get(key);
    await client.disconnect();
    return cachedValue;
  } catch (e) {
    console.error(e);
    return;
  }
};
