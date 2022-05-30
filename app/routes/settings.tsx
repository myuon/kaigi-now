import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { getSession } from "../sessions.server";
import {
  googleAuthApi,
  googleCalendarApi,
  googlePeopleApi,
} from "../api/googleapis";
import { Form, useActionData, useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const refreshToken = session.get("refresh_token");
  const accessToken = await googleAuthApi.refreshAccessToken(refreshToken);

  const peopleMe = await googlePeopleApi.getCurrentUser(accessToken);
  const userId = peopleMe.metadata.sources.find(
    (source) => source.type === "PROFILE"
  )?.id;
  const calendarList = await googleCalendarApi.getCalendarList(accessToken);

  const setting = userId
    ? JSON.parse((await SETTINGS.get(userId)) ?? "null")
    : undefined;

  return json({
    userId,
    calendarList: calendarList.items,
    setting,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();

  const userId = form.get("userId")?.toString();
  if (!userId) {
    return new Response(JSON.stringify({ error: "userId empty" }), {
      status: 404,
    });
  }

  await SETTINGS.put(
    userId,
    JSON.stringify({
      calendarIds: form.getAll("calendar").map((value) => value.toString()),
      attendeeEmail: form.get("attendeeEmail")?.toString(),
    })
  );

  return json({ ok: true });
};

export default function Page() {
  const data = useLoaderData<{
    userId: string;
    calendarList: { id: string; summary: string }[];
    setting: { calendarIds: string[] };
  }>();
  const result = useActionData();

  return (
    <div>
      <p>{data?.userId}</p>
      <p>current: {JSON.stringify(data.setting)}</p>
      <p>{JSON.stringify(result)}</p>
      <Form method="put">
        <input type="hidden" name="userId" value={data?.userId} />

        <fieldset>
          {data.calendarList.map((option) => (
            <label key={option.id}>
              <input
                name="calendar"
                type="checkbox"
                value={option.id}
                defaultChecked={data.setting.calendarIds.includes(option.id)}
              />
              {option.summary}
            </label>
          ))}
        </fieldset>

        <label>
          出席者
          <input type="email" name="attendeeEmail" />
        </label>

        <button type="submit">送信</button>
      </Form>
    </div>
  );
}
