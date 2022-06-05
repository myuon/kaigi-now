import type { ActionFunction } from "@remix-run/cloudflare";
import { json, type LoaderFunction } from "@remix-run/cloudflare";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { googleCalendarApi } from "../api/googleapis";
import { getAuth } from "../auth.server";
import { Button, LinkButton } from "../components/Button";
import { getSession } from "../sessions.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const auth = await getAuth(session);
  if (!auth) {
    return new Response(JSON.stringify({ error: "auth is empty" }), {
      status: 401,
    });
  }

  const url = new URL(request.url);
  const eventId = url.searchParams.get("eventId") ?? "";
  const calendarId = url.searchParams.get("calendarId") ?? "";

  const event = await googleCalendarApi.getCalendarEvent(auth.accessToken, {
    calendarId,
    eventId,
  });

  return json({
    calendarId,
    eventId,
    event,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const auth = await getAuth(session);
  if (!auth) {
    return new Response(JSON.stringify({ error: "auth is empty" }), {
      status: 401,
    });
  }

  const formData = await request.formData();

  const { error } = await googleCalendarApi.deleteCalendarEvent(
    auth.accessToken,
    {
      calendarId: formData.get("calendarId")! as string,
      eventId: formData.get("eventId")! as string,
    }
  );
  if (error) {
    console.error(error);
    return json({ error: "delete_event_failed" }, { status: 500 });
  }

  return json({ ok: true });
};

export default function Page() {
  const { eventId, calendarId, event } = useLoaderData();
  const action = useActionData();
  const submit = useSubmit();
  console.log(event);

  return (
    <div className="p-4 grid gap-4">
      {action?.ok ? (
        <p className="text-red-600">作成した会議を取り消しました！</p>
      ) : (
        <p className="text-xl font-semibold">
          予定を作成しました！{event.location}へどうぞ！
        </p>
      )}
      <details>
        <summary>
          詳細 (イベントID: {eventId}, カレンダーID: {calendarId})
        </summary>
        <pre className="text-xs">
          <code>{JSON.stringify(event, null, 4)}</code>
        </pre>
      </details>
      <Button
        onClick={() => {
          const ok = window.confirm("取り消しますか？");
          if (!ok) {
            return;
          }

          submit(
            {
              eventId,
              calendarId,
            },
            {
              method: "post",
            }
          );
        }}
      >
        やっぱり取り消す
      </Button>
      <LinkButton to="/">戻る</LinkButton>
    </div>
  );
}
