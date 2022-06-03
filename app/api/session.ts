import type { Session } from "@remix-run/cloudflare";

interface UserSession {
  userId: string;
  accessToken: string;
  expiresAt: number;
}

export const userSessionApi = {
  get: (session: Session): UserSession => {
    return {
      userId: session.get("userId"),
      accessToken: session.get("accessToken"),
      expiresAt: session.get("expiresAt"),
    };
  },
  set: (session: Session, userSession: UserSession): void => {
    session.set("userId", userSession.userId);
    session.set("accessToken", userSession.accessToken);
    session.set("expiresAt", userSession.expiresAt);
  },
};
