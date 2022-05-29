import type { ActionFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useActionData, useSubmit } from "@remix-run/react";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import config from "../../config/google-auth-client.json";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const calendarId = formData.get("calendarId");
  const attendeeEmail = formData.get("attendeeEmail");
  const token = formData.get("token");

  const resp = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?sendUpdates=all`,
    {
      method: "POST",
      body: JSON.stringify({
        start: {
          dateTime: dayjs().format("YYYY-MM-DDTHH:mm:ss+09:00"),
        },
        end: {
          dateTime: dayjs().add(30, "m").format("YYYY-MM-DDTHH:mm:ss+09:00"),
        },
        attendees: attendeeEmail
          ? [
              {
                email: attendeeEmail,
              },
            ]
          : undefined,
      }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const event = await resp.json<{ id: string }>();

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
      <a
        href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.web.client_id}&redirect_uri=http://localhost:8787/callback&response_type=token&scope=https://www.googleapis.com/auth/calendar`}
      >
        ログイン
      </a>
      <button
        onClick={async () => {
          console.log("click");
          const token = localStorage.getItem("GOOGLE_TOKEN");
          if (!token) return;

          submit(
            {
              calendarId: "",
              attendeeEmail: "",
              token,
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
