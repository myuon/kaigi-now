import type { ActionFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useActionData, useNavigate, useSubmit } from "@remix-run/react";
import dayjs from "dayjs";
import { useEffect } from "react";
import { googleCalendarApi } from "../api/googleapis";
import { userSettingApi } from "../api/setting";
import { getAuth } from "../auth.server";
import { Button } from "../components/Button";
import { getSession } from "../sessions.server";
import Settings from "../components/icons/Settings";

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const auth = await getAuth(session);
  if (!auth) {
    return new Response(JSON.stringify({ error: "auth is empty" }), {
      status: 401,
    });
  }

  const setting = await userSettingApi.get(auth.userId);

  const { accessToken } = auth;

  const calendarId = setting?.calendarIds?.[0];
  if (!calendarId) {
    return new Response(JSON.stringify({ error: "calendarId is empty" }), {
      status: 400,
    });
  }

  const event = await googleCalendarApi.createCalendarEvent(accessToken, {
    calendarId: calendarId,
    start: dayjs(),
    end: dayjs().add(30, "m"),
  });

  return json({
    eventId: event.id,
  });
};

export default function Index() {
  const submit = useSubmit();
  const action = useActionData<{ eventId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (action?.eventId) {
      navigate(`/events/${action.eventId}`);
    }
  }, [action, navigate]);

  return (
    <div
      className="p-8 grid gap-4"
      style={{
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <Link
        to="/settings"
        className="underline underline-offset-2 hover:text-gray-700 flex gap-1"
      >
        <span>
          <Settings />
        </span>
        設定
      </Link>
      <Button
        onClick={async () => {
          submit(
            {},
            {
              method: "post",
            }
          );
        }}
      >
        会議なう！
      </Button>
    </div>
  );
}
