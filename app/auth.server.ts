import type { Session } from "@remix-run/cloudflare";
import dayjs from "dayjs";
import { googleAuthApi } from "./api/googleapis";
import { userSessionApi } from "./api/session";
import { userSettingApi } from "./api/setting";

export const getAuth = async (session: Session) => {
  const userSession = userSessionApi.get(session);
  if (!userSession.userId) {
    return undefined;
  }

  if (userSession.expiresAt && userSession.expiresAt >= dayjs().unix()) {
    return userSession;
  }

  const setting = await userSettingApi.get(userSession.userId);
  if (!setting?.refreshToken) {
    return undefined;
  }

  const { access_token, expires_in } = await googleAuthApi.refreshAccessToken(
    setting.refreshToken
  );

  const newUserSession = {
    ...userSession,
    accessToken: access_token,
    expiresAt: dayjs().unix() + expires_in ,
  };
  userSessionApi.set(session, newUserSession);
  return newUserSession;
};
