import type dayjs from "dayjs";
import config from "../../config/google-auth-client.json";

const getAuthorizationCode = async (code: string) => {
  const url = new URL("https://oauth2.googleapis.com/token");
  url.searchParams.set("client_id", config.web.client_id);
  url.searchParams.set("client_secret", config.web.client_secret);
  url.searchParams.set("code", code);
  url.searchParams.set("grant_type", "authorization_code");
  url.searchParams.set("state", "authorization");
  url.searchParams.set("redirect_uri", "http://localhost:8787/callback");

  const resp = await fetch(url.toString(), { method: "POST" });
  const body = await resp.json<{
    access_token: string;
    refresh_token: string;
  }>();

  return body;
};

const refreshAccessToken = async (refreshToken: string) => {
  const url = new URL("https://oauth2.googleapis.com/token");
  url.searchParams.set("client_id", config.web.client_id);
  url.searchParams.set("client_secret", config.web.client_secret);
  url.searchParams.set("grant_type", "refresh_token");
  url.searchParams.set("refresh_token", refreshToken);

  const resp = await fetch(url.toString(), { method: "POST" });
  const body = await resp.json<{
    access_token: string;
  }>();

  return body.access_token;
};

export const googleAuthApi = {
  getAuthorizationCode,
  refreshAccessToken,
};

export const generateGoogleOAuthUrl = () => {
  const url = new URL(`https://accounts.google.com/o/oauth2/v2/auth`);
  url.searchParams.set(
    "scope",
    [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" ")
  );
  url.searchParams.set("client_id", config.web.client_id);
  url.searchParams.set("redirect_uri", "http://localhost:8787/callback");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("state", "get_code");

  return url.toString();
};

const createCalendarEvent = async (
  accessToken: string,
  {
    calendarId,
    start,
    end,
    attendees,
  }: {
    calendarId: string;
    start: dayjs.Dayjs;
    end: dayjs.Dayjs;
    attendees?: { email: string }[];
  }
) => {
  const resp = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?sendUpdates=all`,
    {
      method: "POST",
      body: JSON.stringify({
        start: {
          dateTime: start.format("YYYY-MM-DDTHH:mm:ss+09:00"),
        },
        end: {
          dateTime: end.format("YYYY-MM-DDTHH:mm:ss+09:00"),
        },
        attendees,
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return await resp.json<{ id: string }>();
};

const getCalendarList = async (accessToken: string) => {
  const resp = await fetch(
    `https://www.googleapis.com/calendar/v3/users/me/calendarList`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return await resp.json<{ items: { id: string; summary: string }[] }>();
};

export const googleCalendarApi = {
  createCalendarEvent,
  getCalendarList,
};

const getPeopleMe = async (accessToken: string) => {
  const url = new URL(`https://people.googleapis.com/v1/people/me`);
  url.searchParams.set("personFields", ["metadata", "names"].join(","));

  const resp = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return await resp.json<{
    metadata: { sources: { type: string; id: string }[] };
  }>();
};

export const googlePeopleApi = {
  getCurrentUser: getPeopleMe,
};
