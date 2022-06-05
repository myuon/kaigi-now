import type { ActionFunction } from "@remix-run/cloudflare";
import { json, type LoaderFunction } from "@remix-run/cloudflare";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { googleCalendarApi } from "../api/googleapis";
import { getAuth } from "../auth.server";
import { Button, LinkButton } from "../components/Button";
import { getSession } from "../sessions.server";

export const loader: LoaderFunction = ({ request }) => {
  const url = new URL(request.url);
  return json({
    eventId: url.searchParams.get("eventId"),
    calendarId: url.searchParams.get("calendarId"),
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
  const { eventId, calendarId } = useLoaderData();
  const action = useActionData();
  const submit = useSubmit();

  return (
    <div className="p-4 grid gap-2">
      {action?.ok ? (
        <p className="text-red-600">作成した会議を取り消しました！</p>
      ) : (
        <p>会議を作成しました！</p>
      )}
      <p>
        イベントID: {eventId}, カレンダーID: {calendarId}
      </p>
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
            {}
          );
        }}
      >
        やっぱり取り消す
      </Button>
      <LinkButton to="/">戻る</LinkButton>
    </div>
  );
}
