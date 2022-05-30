import type { ActionFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useActionData, useNavigate, useSubmit } from "@remix-run/react";
import dayjs from "dayjs";
import { useEffect } from "react";
import {
  generateGoogleOAuthUrl,
  googleAuthApi,
  googleCalendarApi,
} from "../api/googleapis";
import { getSession } from "../sessions.server";

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const refreshToken = session.get("refresh_token");
  const accessToken = await googleAuthApi.refreshAccessToken(refreshToken);

  const formData = await request.formData();
  const calendarId = formData.get("calendarId")?.toString();

  const event = await googleCalendarApi.createCalendarEvent(accessToken, {
    calendarId: calendarId!,
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
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.4",
        display: "grid",
        gap: "8px",
      }}
    >
      <a href={generateGoogleOAuthUrl()}>ログイン</a>
      <Link to="/settings">設定</Link>
      <button
        onClick={async () => {
          console.log("click");

          submit(
            {
              calendarId: "",
              attendeeEmail: "",
            },
            {
              method: "post",
            }
          );
        }}
      >
        会議なう！
      </button>
    </div>
  );
}
