import type { ActionFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useActionData, useNavigate, useSubmit } from "@remix-run/react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
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

  const start = dayjs();
  const end = dayjs().add(30, "m");

  const { items } = await googleCalendarApi.getCalendarList(accessToken);
  const itemsById = items.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, { summary: string }>);

  for (const key in setting?.calendarIds ?? []) {
    const calendarId = setting?.calendarIds?.[key];
    if (!calendarId) {
      continue;
    }

    const { items, error } = await googleCalendarApi.getCalendarItemsOver(
      accessToken,
      {
        calendarId,
        start,
        end,
      }
    );
    if (error) {
      console.error(error);
      continue;
    }
    // 既に予定が入っていればスキップする
    if (items?.length > 0) {
      continue;
    }

    const event = await googleCalendarApi.createCalendarEvent(accessToken, {
      calendarId: calendarId,
      start,
      end,
      location: itemsById?.[calendarId]?.summary,
      summary: "会議@会議なう",
    });

    return json({
      calendarId,
      eventId: event.id,
    });
  }

  return json({
    error: "calendar_not_available",
  });
};

export default function Index() {
  const submit = useSubmit();
  const action = useActionData<{
    eventId?: string;
    calendarId?: string;
    error?: string;
  }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (action?.eventId) {
      navigate(
        `/created?eventId=${action.eventId}&calendarId=${action.calendarId}`
      );
    }
  }, [action, navigate]);

  const [loading, setLoading] = useState(false);

  return (
    <div
      className="p-8 grid gap-4"
      style={{
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <Link
        to="/settings"
        className="underline underline-offset-2 hover:text-gray-700 flex gap-1 items-center"
      >
        <span className="text-lg">
          <Settings />
        </span>
        設定
      </Link>
      {action?.error && <span className="text-red-600">{action.error}</span>}
      <Button
        loading={loading}
        onClick={async () => {
          setLoading(true);

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

      <div>
        <h4 className="text-lg">使い方</h4>
        <p>
          会議なう！ボタンを押すと、30分の会議が設定されます。会議を設定するカレンダーと優先度は設定画面から設定してください。
        </p>
      </div>
    </div>
  );
}
