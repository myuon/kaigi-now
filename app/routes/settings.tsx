import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { getSession } from "../sessions.server";
import { googleAuthApi, googleCalendarApi } from "../api/googleapis";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { userSessionApi } from "../api/session";
import type { UserSetting } from "../api/setting";
import { userSettingApi } from "../api/setting";

interface LoaderData {
  userId?: string;
  calendarList?: { id: string; summary: string }[];
  setting?: UserSetting;
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const { accessToken, userId } = userSessionApi.get(session);

  if (!userId || !accessToken) {
    return json<LoaderData>({});
  }

  const calendarList = await googleCalendarApi.getCalendarList(accessToken);
  const setting = await userSettingApi.get(userId);

  return json<LoaderData>({
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
  const setting = await userSettingApi.get(userId);

  await userSettingApi.set(userId, {
    ...setting,
    calendarIds: form.getAll("calendar").map((value) => value.toString()),
  });

  return json({ ok: true });
};

export default function Page() {
  const data = useLoaderData<LoaderData>();
  const result = useActionData();

  return (
    <div>
      <a href={googleAuthApi.generateAuthUrl()}>ログイン</a>

      <p>{data?.userId}</p>
      <p>current: {JSON.stringify(data.setting)}</p>
      <p>{JSON.stringify(result)}</p>
      <Form method="put">
        <input type="hidden" name="userId" value={data?.userId} />

        <fieldset>
          {data?.calendarList?.map((option) => (
            <label key={option.id}>
              <input
                name="calendar"
                type="checkbox"
                value={option.id}
                defaultChecked={data?.setting?.calendarIds?.includes(option.id)}
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
