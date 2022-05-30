import type { Session } from "@remix-run/cloudflare";

interface UserSession {
  userId?: string;
  accessToken?: string;
}

export const userSessionApi = {
  get: (session: Session): UserSession => {
    return {
      userId: session.get("userId"),
      accessToken: session.get("accessToken"),
    };
  },
  set: (session: Session, userSession: UserSession): void => {
    session.set("userId", userSession.userId);
    session.set("accessToken", userSession.accessToken);
  },
};
