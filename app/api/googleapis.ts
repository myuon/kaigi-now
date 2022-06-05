import type dayjs from "dayjs";
import config from "../../config/google-auth-client.json";

const fetcher = async <T>(
  req: string | Request,
  init: RequestInit | Request | undefined
) => {
  const resp = await fetch(req, init);
  if (!resp.ok) {
    return {
      data: undefined,
      error: await resp.json<{ error: { code: string; message: string } }>(),
    };
  } else {
    return { data: await resp.json<T>(), error: undefined };
  }
};

const getAuthorizationCode = async (code: string, redirectUri: string) => {
  const url = new URL("https://oauth2.googleapis.com/token");
  url.searchParams.set("client_id", config.web.client_id);
  url.searchParams.set("client_secret", config.web.client_secret);
  url.searchParams.set("code", code);
  url.searchParams.set("grant_type", "authorization_code");
  url.searchParams.set("state", "authorization");
  url.searchParams.set("redirect_uri", redirectUri);

  const resp = await fetch(url.toString(), { method: "POST" });
  const body = await resp.json<{
    access_token: string;
    expires_in: number;
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
    expires_in: number;
  }>();

  return body;
};

const generateAuthUrl = (redirectUri: string) => {
  const url = new URL(`https://accounts.google.com/o/oauth2/v2/auth`);
  url.searchParams.set(
    "scope",
    [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" ")
  );
  url.searchParams.set("client_id", config.web.client_id);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("state", "get_code");

  return url.toString();
};

export const googleAuthApi = {
  getAuthorizationCode,
  refreshAccessToken,
  generateAuthUrl,
};

const createCalendarEvent = (
  accessToken: string,
  {
    calendarId,
    start,
    end,
    attendees,
    location,
    summary,
  }: {
    calendarId: string;
    start: dayjs.Dayjs;
    end: dayjs.Dayjs;
    attendees?: { email: string }[];
    location?: string;
    summary?: string;
  }
) => {
  return fetcher<{ id: string }>(
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
        location,
        summary,
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

const getCalendarList = (accessToken: string) => {
  return fetcher<{ items: { id: string; summary: string }[] }>(
    `https://www.googleapis.com/calendar/v3/users/me/calendarList`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};

const getCalendarItemsOver = async (
  accessToken: string,
  input: {
    calendarId: string;
    start: dayjs.Dayjs;
    end: dayjs.Dayjs;
  }
) => {
  const resp = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${
      input.calendarId
    }/events?${[
      [
        "timeMin",
        encodeURIComponent(input.start.format("YYYY-MM-DDTHH:mm:ss+09:00")),
      ].join("="),
      [
        "timeMax",
        encodeURIComponent(input.end.format("YYYY-MM-DDTHH:mm:ss+09:00")),
      ].join("="),
    ].join("&")}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const body = await resp.json<
    | {
        items: { id: string }[];
        error: undefined;
      }
    | { items: undefined; error: { code: string } }
  >();
  console.info("getCalendarItemsOver", JSON.stringify(body));

  return body;
};

const getCalendarEvent = async (
  accessToken: string,
  {
    calendarId,
    eventId,
  }: {
    calendarId: string;
    eventId: string;
  }
) => {
  const resp = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events/${eventId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (resp.ok) {
    return await resp.json();
  } else {
    return await resp.json<{ error: { code: string } }>();
  }
};

const deleteCalendarEvent = async (
  accessToken: string,
  {
    calendarId,
    eventId,
  }: {
    calendarId: string;
    eventId: string;
  }
) => {
  const resp = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events/${eventId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (resp.ok) {
    return { error: undefined };
  } else {
    return await resp.json<{ error: { code: string } }>();
  }
};

export const googleCalendarApi = {
  createCalendarEvent,
  getCalendarList,
  getCalendarItemsOver,
  deleteCalendarEvent,
  getCalendarEvent,
};

const getPeopleMe = async (accessToken: string) => {
  const url = new URL(`https://people.googleapis.com/v1/people/me`);
  url.searchParams.set("personFields", ["metadata", "names"].join(","));

  return await fetcher<{
    metadata: { sources: { type: string; id: string }[] };
  }>(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const googlePeopleApi = {
  getCurrentUser: getPeopleMe,
};
