import {
  createCloudflareKVSessionStorage,
  createCookie,
} from "@remix-run/cloudflare";

const sessionCookie = createCookie("__session", {
  secrets: ["eefd5bc2c5"],
  sameSite: true,
});

export const { getSession, commitSession, destroySession } =
  createCloudflareKVSessionStorage({
    kv: SESSIONS,
    cookie: sessionCookie,
  });
